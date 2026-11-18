/**
 * Blood on the Clocktower — Local Storage Layer
 *
 * Persists Storyteller (GM) identity, active script, player count, setup
 * modifiers (Drunk, Lunatic, Godfather), role draw bag, seating, player
 * statuses, and Day/Night game state across refreshes and page transitions.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'botc_grimoire_config';
  let memoryFallback = null;

  function isStorageAvailable() {
    try {
      const probe = '__botc_probe__';
      global.localStorage.setItem(probe, '1');
      global.localStorage.removeItem(probe);
      return true;
    } catch (_err) {
      return false;
    }
  }

  function getDefaultGameState() {
    return {
      phase: 'night',
      dayNumber: 1,
      nightStepIndex: 0,
      completedSteps: [],
      killedTonight: [],
      bluffs: [],
      demonVotedToday: false,
      minionNominatedToday: false,
      poCharged: false,
      someoneDiedToday: false,
      outsiderDiedToday: false,
      minionExecutedToday: false,
      lunaticTarget: ''
    };
  }

  function getDefaultConfig() {
    const defaultScript =
      global.BOTC && global.BOTC.Scripts
        ? global.BOTC.Scripts.getDefault().id
        : 'trouble-brewing';
    const bounds =
      global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.getPlayerBounds
        ? global.BOTC.Scripts.getPlayerBounds(defaultScript)
        : { min: 5, max: 15, defaultCount: 8 };

    return {
      gmName: '',
      selectedScript: defaultScript,
      playerCount: bounds.defaultCount,
      teensyville: false,
      selectedRoles: [],
      drunkRole: null,
      lunaticRole: null,
      godfatherDelta: 1,
      players: [],
      remainingBag: null,
      drawComplete: false,
      game: getDefaultGameState(),
      updatedAt: null
    };
  }

  function sanitizeScriptId(scriptId) {
    if (!global.BOTC || !global.BOTC.Scripts) {
      return scriptId || 'trouble-brewing';
    }
    const found = global.BOTC.Scripts.getById(scriptId);
    if (found && found.status === 'available') {
      return found.id;
    }
    return global.BOTC.Scripts.getDefault().id;
  }

  function sanitizePlayerCount(count, scriptId) {
    const bounds =
      global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.getPlayerBounds
        ? global.BOTC.Scripts.getPlayerBounds(scriptId)
        : { min: 5, max: 15, defaultCount: 8 };
    const parsed = Number(count);
    if (!Number.isFinite(parsed)) {
      return bounds.defaultCount;
    }
    const rounded = Math.round(parsed);
    return Math.max(bounds.min, Math.min(bounds.max, rounded));
  }

  function sanitizeTeensyville(value, playerCount) {
    const supports =
      global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.getRoleDistribution
        ? global.BOTC.Scripts.getRoleDistribution(playerCount).supportsTeensyville
        : playerCount <= 6;
    return supports ? Boolean(value) : false;
  }

  function sanitizeSelectedRoles(roles, scriptId) {
    if (!Array.isArray(roles)) {
      return [];
    }
    const details =
      global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.getDetails
        ? global.BOTC.Scripts.getDetails(scriptId)
        : null;
    const validIds =
      details && Array.isArray(details.characters)
        ? details.characters.map(function (c) {
            return c.id;
          })
        : null;

    const unique = [];
    roles.forEach(function (id) {
      if (typeof id !== 'string' || !id) {
        return;
      }
      if (unique.indexOf(id) !== -1) {
        return;
      }
      if (validIds && validIds.indexOf(id) === -1) {
        return;
      }
      unique.push(id);
    });
    return unique;
  }

  function sanitizeDrunkRole(drunkRole, selectedRoles, scriptId) {
    if (typeof drunkRole !== 'string' || !drunkRole) {
      return null;
    }
    if (selectedRoles.indexOf('drunk') === -1) {
      return null;
    }
    if (selectedRoles.indexOf(drunkRole) !== -1) {
      return null;
    }
    const details =
      global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.getDetails
        ? global.BOTC.Scripts.getDetails(scriptId)
        : null;
    if (details && Array.isArray(details.characters)) {
      const match = details.characters.find(function (c) {
        return c.id === drunkRole && c.team === 'townsfolk';
      });
      if (!match) {
        return null;
      }
    }
    return drunkRole;
  }

  function sanitizeLunaticRole(lunaticRole, selectedRoles, scriptId) {
    if (typeof lunaticRole !== 'string' || !lunaticRole) {
      return null;
    }
    if (selectedRoles.indexOf('lunatic') === -1) {
      return null;
    }
    const details =
      global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.getDetails
        ? global.BOTC.Scripts.getDetails(scriptId)
        : null;
    if (details && Array.isArray(details.characters)) {
      const match = details.characters.find(function (c) {
        return c.id === lunaticRole && c.team === 'demon';
      });
      if (!match) {
        return null;
      }
    }
    return lunaticRole;
  }

  function sanitizeGodfatherDelta(delta) {
    return delta === -1 ? -1 : 1;
  }

  function arraysEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) {
        return false;
      }
    }
    return true;
  }

  function sanitizePlayers(players) {
    if (!Array.isArray(players)) {
      return [];
    }
    return players
      .filter(function (p) {
        return p && typeof p.name === 'string' && p.name.trim() && typeof p.roleId === 'string' && p.roleId;
      })
      .map(function (p, idx) {
        const isAlive = p.alive !== false;
        const isFakeDead = Boolean(p.zombuulFakeDead);
        const align =
          p.alignmentOverride === 'good' || p.alignmentOverride === 'evil'
            ? p.alignmentOverride
            : null;
        return {
          seat: typeof p.seat === 'number' ? p.seat : idx + 1,
          name: p.name.trim(),
          roleId: p.roleId,
          believedRoleId: typeof p.believedRoleId === 'string' && p.believedRoleId ? p.believedRoleId : null,
          alive: isAlive,
          ghostVoteUsed: !isAlive || isFakeDead ? Boolean(p.ghostVoteUsed) : false,
          poisoned: Boolean(p.poisoned),
          drunk: Boolean(p.drunk),
          redHerring: Boolean(p.redHerring),
          protectedByMonk: Boolean(p.protectedByMonk),
          daProtected: Boolean(p.daProtected),
          mad: Boolean(p.mad),
          cursed: Boolean(p.cursed),
          zombuulFakeDead: isFakeDead,
          alignmentOverride: align,
          goodTwin: Boolean(p.goodTwin),
          grandchild: Boolean(p.grandchild),
          wokeTonight: Boolean(p.wokeTonight),
          diedTonight: !isAlive ? Boolean(p.diedTonight) : false,
          executedToday: !isAlive ? Boolean(p.executedToday) : false
        };
      });
  }

  function sanitizeGameState(game) {
    const defaults = getDefaultGameState();
    if (!game || typeof game !== 'object') {
      return defaults;
    }
    return {
      phase: game.phase === 'day' ? 'day' : 'night',
      dayNumber:
        typeof game.dayNumber === 'number' && Number.isFinite(game.dayNumber) && game.dayNumber >= 1
          ? Math.floor(game.dayNumber)
          : 1,
      nightStepIndex:
        typeof game.nightStepIndex === 'number' && Number.isFinite(game.nightStepIndex) && game.nightStepIndex >= 0
          ? Math.floor(game.nightStepIndex)
          : 0,
      completedSteps: Array.isArray(game.completedSteps)
        ? game.completedSteps.filter(function (s) {
            return typeof s === 'string';
          })
        : [],
      killedTonight: Array.isArray(game.killedTonight)
        ? game.killedTonight.filter(function (n) {
            return typeof n === 'string';
          })
        : [],
      bluffs: Array.isArray(game.bluffs)
        ? game.bluffs.filter(function (b) {
            return typeof b === 'string';
          }).slice(0, 3)
        : [],
      demonVotedToday: Boolean(game.demonVotedToday),
      minionNominatedToday: Boolean(game.minionNominatedToday),
      poCharged: Boolean(game.poCharged),
      someoneDiedToday: Boolean(game.someoneDiedToday),
      outsiderDiedToday: Boolean(game.outsiderDiedToday),
      minionExecutedToday: Boolean(game.minionExecutedToday),
      lunaticTarget: typeof game.lunaticTarget === 'string' ? game.lunaticTarget : ''
    };
  }

  function sanitizeRemainingBag(bag) {
    if (bag === null || bag === undefined) {
      return null;
    }
    if (!Array.isArray(bag)) {
      return null;
    }
    return bag
      .filter(function (item) {
        return item && typeof item.roleId === 'string' && item.roleId;
      })
      .map(function (item) {
        return {
          roleId: item.roleId,
          believedRoleId:
            typeof item.believedRoleId === 'string' && item.believedRoleId
              ? item.believedRoleId
              : null
        };
      });
  }

  function loadConfig() {
    const defaults = getDefaultConfig();
    let raw = null;

    if (isStorageAvailable()) {
      try {
        raw = global.localStorage.getItem(STORAGE_KEY);
      } catch (_err) {
        raw = null;
      }
    } else if (memoryFallback) {
      raw = memoryFallback;
    }

    if (!raw) {
      return defaults;
    }

    try {
      const parsed = JSON.parse(raw);
      const scriptId = sanitizeScriptId(parsed.selectedScript);
      const playerCount = sanitizePlayerCount(parsed.playerCount, scriptId);
      const selectedRoles = sanitizeSelectedRoles(parsed.selectedRoles, scriptId);
      return {
        gmName: typeof parsed.gmName === 'string' ? parsed.gmName.trim() : '',
        selectedScript: scriptId,
        playerCount: playerCount,
        teensyville: sanitizeTeensyville(parsed.teensyville, playerCount),
        selectedRoles: selectedRoles,
        drunkRole: sanitizeDrunkRole(parsed.drunkRole, selectedRoles, scriptId),
        lunaticRole: sanitizeLunaticRole(parsed.lunaticRole, selectedRoles, scriptId),
        godfatherDelta: sanitizeGodfatherDelta(parsed.godfatherDelta),
        players: sanitizePlayers(parsed.players),
        remainingBag: sanitizeRemainingBag(parsed.remainingBag),
        drawComplete: Boolean(parsed.drawComplete),
        game: sanitizeGameState(parsed.game),
        updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null
      };
    } catch (_err) {
      return defaults;
    }
  }

  function saveConfig(partial) {
    const current = loadConfig();
    const nextScript = sanitizeScriptId(
      partial.selectedScript !== undefined
        ? partial.selectedScript
        : current.selectedScript
    );
    const nextPlayers = sanitizePlayerCount(
      partial.playerCount !== undefined
        ? partial.playerCount
        : current.playerCount,
      nextScript
    );
    const scriptChanged = nextScript !== current.selectedScript;
    const rawRoles =
      partial.selectedRoles !== undefined
        ? partial.selectedRoles
        : scriptChanged
          ? []
          : current.selectedRoles;
    const nextRoles = sanitizeSelectedRoles(rawRoles, nextScript);
    const rawDrunk =
      partial.drunkRole !== undefined
        ? partial.drunkRole
        : scriptChanged
          ? null
          : current.drunkRole;
    const nextDrunk = sanitizeDrunkRole(rawDrunk, nextRoles, nextScript);
    const rawLunatic =
      partial.lunaticRole !== undefined
        ? partial.lunaticRole
        : scriptChanged
          ? null
          : current.lunaticRole;
    const nextLunatic = sanitizeLunaticRole(rawLunatic, nextRoles, nextScript);
    const nextGodfatherDelta = sanitizeGodfatherDelta(
      partial.godfatherDelta !== undefined
        ? partial.godfatherDelta
        : scriptChanged
          ? 1
          : current.godfatherDelta
    );

    const setupChanged =
      scriptChanged ||
      nextPlayers !== current.playerCount ||
      !arraysEqual(nextRoles, current.selectedRoles) ||
      nextDrunk !== current.drunkRole ||
      nextLunatic !== current.lunaticRole;

    const nextAssignedPlayers =
      partial.players !== undefined
        ? sanitizePlayers(partial.players)
        : setupChanged
          ? []
          : current.players;

    const nextRemainingBag =
      partial.remainingBag !== undefined
        ? sanitizeRemainingBag(partial.remainingBag)
        : setupChanged
          ? null
          : current.remainingBag;

    const nextDrawComplete =
      partial.drawComplete !== undefined
        ? Boolean(partial.drawComplete)
        : setupChanged
          ? false
          : current.drawComplete;

    const nextGame =
      partial.game !== undefined
        ? sanitizeGameState(partial.game)
        : setupChanged
          ? getDefaultGameState()
          : current.game;

    const next = {
      gmName:
        typeof partial.gmName === 'string'
          ? partial.gmName.trim()
          : current.gmName,
      selectedScript: nextScript,
      playerCount: nextPlayers,
      teensyville: sanitizeTeensyville(
        partial.teensyville !== undefined
          ? partial.teensyville
          : current.teensyville,
        nextPlayers
      ),
      selectedRoles: nextRoles,
      drunkRole: nextDrunk,
      lunaticRole: nextLunatic,
      godfatherDelta: nextGodfatherDelta,
      players: nextAssignedPlayers,
      remainingBag: nextRemainingBag,
      drawComplete: nextDrawComplete,
      game: nextGame,
      updatedAt: new Date().toISOString()
    };

    const serialized = JSON.stringify(next);
    if (isStorageAvailable()) {
      try {
        global.localStorage.setItem(STORAGE_KEY, serialized);
      } catch (_err) {
        memoryFallback = serialized;
      }
    } else {
      memoryFallback = serialized;
    }

    return next;
  }

  function clearConfig() {
    memoryFallback = null;
    if (isStorageAvailable()) {
      try {
        global.localStorage.removeItem(STORAGE_KEY);
      } catch (_err) {
        // Ignore storage errors on clear
      }
    }
    return getDefaultConfig();
  }

  function hasSavedSession() {
    const cfg = loadConfig();
    return Boolean(cfg.gmName && cfg.updatedAt);
  }

  global.BOTC = global.BOTC || {};
  global.BOTC.Storage = {
    STORAGE_KEY: STORAGE_KEY,
    isAvailable: isStorageAvailable,
    getDefaultGameState: getDefaultGameState,
    load: loadConfig,
    get: loadConfig,
    save: saveConfig,
    clear: clearConfig,
    hasSavedSession: hasSavedSession
  };
})(window);
