/**
 * Blood on the Clocktower — Interactive Storyteller Grimoire (Step 4)
 *
 * Supports all three official scripts with specialized game loops:
 * - Trouble Brewing (Drunk, Baron, Monk, Poisoner, Chef, Empath, Fortune Teller, Imp, Ravenkeeper, Undertaker, Scarlet Woman)
 * - Bad Moon Rising (Lunatic, Godfather, Sailor, Innkeeper, Courtier, Gambler, Devil's Advocate, Exorcist, Zombuul, Pukka, Shabaloth, Po, Assassin, Professor, Gossip, Minstrel, Moonchild, Tea Lady, Chambermaid, Mastermind)
 * - Sects & Violets (Clockmaker, Dreamer, Snake Charmer, Mathematician, Flowergirl, Town Crier, Oracle, Savant, Seamstress, Philosopher, Artist, Juggler, Sage, Mutant, Sweetheart, Barber, Klutz, Evil Twin, Witch, Cerenovus, Pit-Hag, Fang Gu, Vigormortis, No Dashii, Vortox)
 */
(function (global, doc) {
  'use strict';

  const Scripts = global.BOTC.Scripts;
  const Storage = global.BOTC.Storage;
  const escapeHtml = global.BOTC.escapeHtml;

  const TEAM_DISPLAY = {
    townsfolk: { label: 'Good · Townsfolk', faction: 'Good' },
    outsiders: { label: 'Good · Outsider', faction: 'Good' },
    minions: { label: 'Evil · Minion', faction: 'Evil' },
    demon: { label: 'Evil · Demon', faction: 'Evil' }
  };

  const MOON_SVG =
    '<svg viewBox="0 0 24 24" fill="none"><path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>';
  const SUN_SVG =
    '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  const state = {
    gmName: '',
    scriptId: Scripts.getDefault().id,
    playerCount: 8,
    teensyville: false,
    selectedRoles: [],
    drunkRole: null,
    lunaticRole: null,
    players: [],
    game: Storage.getDefaultGameState(),
    boardView: 'circle',
    bluffsPickerOpen: false,
    activePlayerIdx: null,
    showPickerRoles: [],
    showPickerBanner: '',
    endWinner: null
  };

  const drag = {
    active: false,
    dragging: false,
    pointerId: null,
    sourceIdx: null,
    targetIdx: null,
    startX: 0,
    startY: 0,
    ghostEl: null
  };

  let lastFocusedEl = null;
  const els = {};

  function cacheElements() {
    els.missingView = doc.getElementById('grimoire-missing-view');
    els.workspace = doc.getElementById('grimoire-workspace');

    els.headerPhasePill = doc.getElementById('header-phase-pill');
    els.headerPhaseText = doc.getElementById('header-phase-text');

    els.gmLabel = doc.getElementById('grim-gm-label');
    els.scriptLabel = doc.getElementById('grim-script-label');
    els.teensyChip = doc.getElementById('grim-teensy-chip');
    els.viewCircleBtn = doc.getElementById('grim-view-circle');
    els.viewListBtn = doc.getElementById('grim-view-list');
    els.resetGameBtn = doc.getElementById('grim-reset-game-btn');

    els.circleStage = doc.getElementById('grimoire-circle-stage');
    els.seatsLayer = doc.getElementById('grimoire-seats-layer');
    els.listStage = doc.getElementById('grimoire-list-stage');

    els.bluffsCard = doc.getElementById('bluffs-bar-card');
    els.bluffsCountBadge = doc.getElementById('bluffs-count-badge');
    els.bluffsToggleBtn = doc.getElementById('bluffs-toggle-btn');
    els.bluffsRandomBtn = doc.getElementById('bluffs-random-btn');
    els.bluffsClearBtn = doc.getElementById('bluffs-clear-btn');
    els.bluffsSelectedRow = doc.getElementById('bluffs-selected-row');
    els.bluffsPickerPanel = doc.getElementById('bluffs-picker-panel');
    els.bluffsPickerGrid = doc.getElementById('bluffs-picker-grid');

    els.hub = doc.getElementById('grimoire-hub');
    els.hubIcon = doc.getElementById('hub-phase-icon');
    els.hubDayLabel = doc.getElementById('hub-day-label');
    els.hubAliveStat = doc.getElementById('hub-alive-stat');
    els.hubVotesStat = doc.getElementById('hub-votes-stat');

    // Guide Panel
    els.guidePhaseEyebrow = doc.getElementById('guide-phase-eyebrow');
    els.guidePhaseTitle = doc.getElementById('guide-phase-title');
    els.guideVotesBadge = doc.getElementById('guide-votes-badge');
    els.prevPhaseBtn = doc.getElementById('prev-phase-btn');
    els.nextPhaseBtn = doc.getElementById('next-phase-btn');
    els.nextPhaseBtnText = doc.getElementById('next-phase-btn-text');

    // Night View
    els.nightView = doc.getElementById('night-guide-view');
    els.nightStepCounter = doc.getElementById('night-step-counter');
    els.nightStepFlags = doc.getElementById('night-step-flags');
    els.nightStepTitle = doc.getElementById('night-step-title');
    els.nightStepPlayer = doc.getElementById('night-step-player');
    els.nightStepInstruction = doc.getElementById('night-step-instruction');
    els.nightStepActionBox = doc.getElementById('night-step-action-box');
    els.nightPrevBtn = doc.getElementById('night-prev-btn');
    els.nightNextBtn = doc.getElementById('night-next-btn');
    els.nightNextBtnText = doc.getElementById('night-next-btn-text');
    els.nightChecklist = doc.getElementById('night-checklist');

    // Day View
    els.dayView = doc.getElementById('day-guide-view');
    els.dayDawnReport = doc.getElementById('day-dawn-report');
    els.dayAliveCount = doc.getElementById('day-alive-count');
    els.dayMajorityCount = doc.getElementById('day-majority-count');
    els.dayGhostCount = doc.getElementById('day-ghost-count');
    els.dayExecutedStatus = doc.getElementById('day-executed-status');
    els.dayExecSelect = doc.getElementById('day-exec-select');
    els.dayExecBtn = doc.getElementById('day-exec-btn');
    els.dayExecAlert = doc.getElementById('day-exec-alert');
    els.dayTrackersCard = doc.getElementById('day-trackers-card');
    els.dayTrackersTitle = doc.getElementById('day-trackers-title');
    els.dayTrackersBody = doc.getElementById('day-trackers-body');
    els.daySpecialsCard = doc.getElementById('day-specials-card');
    els.daySpecialsList = doc.getElementById('day-specials-list');

    // Player Modal
    els.playerModal = doc.getElementById('player-modal');
    els.pmCloseBtn = doc.getElementById('pm-close-btn');
    els.pmDoneBtn = doc.getElementById('pm-done-btn');
    els.pmSeatLabel = doc.getElementById('pm-seat-label');
    els.pmPlayerName = doc.getElementById('pm-player-name');
    els.pmRoleName = doc.getElementById('pm-role-name');
    els.pmTeamPill = doc.getElementById('pm-team-pill');
    els.pmDrunkCallout = doc.getElementById('pm-drunk-callout');
    els.pmRoleAbility = doc.getElementById('pm-role-ability');

    els.pmToggleAlive = doc.getElementById('pm-toggle-alive');
    els.pmAliveState = doc.getElementById('pm-alive-state');
    els.pmToggleVote = doc.getElementById('pm-toggle-vote');
    els.pmVoteState = doc.getElementById('pm-vote-state');
    els.pmTogglePoison = doc.getElementById('pm-toggle-poison');
    els.pmPoisonState = doc.getElementById('pm-poison-state');
    els.pmToggleDrunk = doc.getElementById('pm-toggle-drunk');
    els.pmDrunkState = doc.getElementById('pm-drunk-state');
    els.pmToggleMonk = doc.getElementById('pm-toggle-monk');
    els.pmMonkTitle = doc.getElementById('pm-monk-title');
    els.pmMonkState = doc.getElementById('pm-monk-state');
    els.pmToggleDa = doc.getElementById('pm-toggle-da');
    els.pmDaState = doc.getElementById('pm-da-state');
    els.pmToggleHerring = doc.getElementById('pm-toggle-herring');
    els.pmHerringState = doc.getElementById('pm-herring-state');
    els.pmToggleMad = doc.getElementById('pm-toggle-mad');
    els.pmMadState = doc.getElementById('pm-mad-state');
    els.pmToggleCursed = doc.getElementById('pm-toggle-cursed');
    els.pmCursedState = doc.getElementById('pm-cursed-state');
    els.pmToggleGoodTwin = doc.getElementById('pm-toggle-good-twin');
    els.pmGoodTwinState = doc.getElementById('pm-good-twin-state');
    els.pmToggleGrandchild = doc.getElementById('pm-toggle-grandchild');
    els.pmGrandchildState = doc.getElementById('pm-grandchild-state');
    els.pmToggleZombuul = doc.getElementById('pm-toggle-zombuul');
    els.pmZombuulState = doc.getElementById('pm-zombuul-state');
    els.pmToggleWoke = doc.getElementById('pm-toggle-woke');
    els.pmWokeState = doc.getElementById('pm-woke-state');
    els.pmToggleAlignment = doc.getElementById('pm-toggle-alignment');
    els.pmAlignmentState = doc.getElementById('pm-alignment-state');
    els.pmToggleDiedTonight = doc.getElementById('pm-toggle-died-tonight');
    els.pmDiedTonightState = doc.getElementById('pm-died-tonight-state');
    els.pmToggleExecuted = doc.getElementById('pm-toggle-executed');
    els.pmExecutedState = doc.getElementById('pm-executed-state');

    els.pmSwapSelect = doc.getElementById('pm-swap-select');
    els.pmSwapBtn = doc.getElementById('pm-swap-btn');
    els.pmRoleSelect = doc.getElementById('pm-role-select');
    els.pmRoleBtn = doc.getElementById('pm-role-btn');

    // Header Actions
    els.openShowPickerBtn = doc.getElementById('open-show-picker-btn');
    els.endGameBtn = doc.getElementById('end-game-btn');

    // Show Roles Picker Modal
    els.showPickerModal = doc.getElementById('show-picker-modal');
    els.showPickerClose = doc.getElementById('show-picker-close');
    els.showPickerCancel = doc.getElementById('show-picker-cancel');
    els.showBannerPresets = doc.getElementById('show-banner-presets');
    els.showBannerInput = doc.getElementById('show-banner-input');
    els.showSelectedCount = doc.getElementById('show-selected-count');
    els.showLoadBluffsBtn = doc.getElementById('show-load-bluffs-btn');
    els.showClearRolesBtn = doc.getElementById('show-clear-roles-btn');
    els.showPickerGroups = doc.getElementById('show-picker-groups');
    els.showLaunchBtn = doc.getElementById('show-launch-btn');

    // Full-Screen Opaque Overlay
    els.showOverlay = doc.getElementById('show-card-overlay');
    els.showOverlayBanner = doc.getElementById('show-overlay-banner');
    els.showOverlayCards = doc.getElementById('show-overlay-cards');
    els.showOverlayClose = doc.getElementById('show-overlay-close');

    // End Game Modal
    els.endGameModal = doc.getElementById('end-game-modal');
    els.endGameClose = doc.getElementById('end-game-close');
    els.endGameCancel = doc.getElementById('end-game-cancel');
    els.endGameAgain = doc.getElementById('end-game-again');
    els.endGameHome = doc.getElementById('end-game-home');
    els.endWinGood = doc.getElementById('end-win-good');
    els.endWinEvil = doc.getElementById('end-win-evil');
    els.endRevealList = doc.getElementById('end-reveal-list');
  }

  function getScriptDetails() {
    return Scripts.getDetails(state.scriptId);
  }

  function getChar(roleId) {
    const details = getScriptDetails();
    if (!details || !Array.isArray(details.characters)) {
      return null;
    }
    return (
      details.characters.find(function (c) {
        return c.id === roleId;
      }) || null
    );
  }

  function isEvilTeam(team) {
    return team === 'minions' || team === 'demon';
  }

  function isPlayerEvil(player) {
    if (player.alignmentOverride === 'evil') {
      return true;
    }
    if (player.alignmentOverride === 'good') {
      return false;
    }
    const char = getChar(player.roleId);
    return Boolean(char && isEvilTeam(char.team));
  }

  function hasRoleInPlay(roleId) {
    return state.players.some(function (p) {
      return p.roleId === roleId || p.believedRoleId === roleId;
    });
  }

  function hasActualRoleInPlay(roleId) {
    return state.players.some(function (p) {
      return p.roleId === roleId;
    });
  }

  function hasAliveRole(roleId) {
    return state.players.some(function (p) {
      return p.alive && p.roleId === roleId;
    });
  }

  function getTownStats() {
    let alive = 0;
    let ghostVotes = 0;
    state.players.forEach(function (p) {
      // Zombuul fake-dead registers as dead to the town for voting counts
      const appearsAlive = p.alive && !p.zombuulFakeDead;
      if (appearsAlive) {
        alive += 1;
      } else if (!p.ghostVoteUsed) {
        ghostVotes += 1;
      }
    });
    return {
      total: state.players.length,
      alive: alive,
      majority: Math.ceil(alive / 2),
      ghostVotes: ghostVotes
    };
  }

  function persistAll() {
    state.players.forEach(function (p, idx) {
      p.seat = idx + 1;
      if (p.alive) {
        p.diedTonight = false;
        p.executedToday = false;
        if (!p.zombuulFakeDead) {
          p.ghostVoteUsed = false;
        }
      }
    });
    state.game.killedTonight = state.players
      .filter(function (p) {
        return !p.alive && p.diedTonight;
      })
      .map(function (p) {
        return p.name;
      });
    const saved = Storage.save({
      players: state.players,
      game: state.game
    });
    state.players = saved.players;
    state.game = saved.game;
  }

  // ── Demon Bluffs Helpers ───────────────────────────────────────────────

  function getEligibleBluffCharacters() {
    const details = getScriptDetails();
    if (!details || !Array.isArray(details.characters)) {
      return [];
    }
    const actualInPlay = {};
    const drunkBelieved = {};
    state.players.forEach(function (p) {
      actualInPlay[p.roleId] = true;
      if (p.roleId === 'drunk' && p.believedRoleId) {
        drunkBelieved[p.believedRoleId] = true;
      }
    });

    return details.characters
      .filter(function (c) {
        return (c.team === 'townsfolk' || c.team === 'outsiders') && !actualInPlay[c.id];
      })
      .map(function (c) {
        return {
          char: c,
          isDrunkBelieved: Boolean(drunkBelieved[c.id])
        };
      });
  }

  function generateBluffs() {
    const eligible = getEligibleBluffCharacters();
    const preferred = eligible.filter(function (item) {
      return !item.isDrunkBelieved;
    });
    const pool = preferred.length >= 3 ? preferred : eligible;

    const shuffled = pool.slice();
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = tmp;
    }

    return shuffled.slice(0, 3).map(function (item) {
      return item.char.id;
    });
  }

  function toggleBluff(roleId) {
    const current = Array.isArray(state.game.bluffs) ? state.game.bluffs.slice() : [];
    const idx = current.indexOf(roleId);
    if (idx !== -1) {
      current.splice(idx, 1);
    } else if (current.length < 3) {
      current.push(roleId);
    } else {
      return;
    }
    state.game.bluffs = current;
    persistAll();
    renderAll();
  }

  function clearBluffs() {
    state.game.bluffs = [];
    persistAll();
    renderAll();
  }

  function renderBluffPickerGrid(containerEl) {
    const eligible = getEligibleBluffCharacters();
    const chosen = Array.isArray(state.game.bluffs) ? state.game.bluffs : [];
    const atLimit = chosen.length >= 3;

    containerEl.innerHTML = '';
    eligible.forEach(function (item) {
      const isSelected = chosen.indexOf(item.char.id) !== -1;
      const isDisabled = !isSelected && atLimit;

      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'bluff-pick-chip bluff-pick-chip--' + item.char.team;
      if (isSelected) btn.classList.add('is-selected');
      if (isDisabled) btn.classList.add('is-disabled');
      btn.disabled = isDisabled;
      btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
      btn.innerHTML =
        '<span>' + escapeHtml(item.char.name) + '</span>' +
        (item.isDrunkBelieved ? '<span class="bluff-drunk-tag">Drunk</span>' : '');

      btn.addEventListener('click', function () {
        toggleBluff(item.char.id);
      });

      containerEl.appendChild(btn);
    });
  }

  function renderBluffsCard() {
    if (state.teensyville) {
      els.bluffsCard.hidden = true;
      return;
    }

    els.bluffsCard.hidden = false;
    const chosen = Array.isArray(state.game.bluffs) ? state.game.bluffs : [];
    els.bluffsCountBadge.textContent = chosen.length + ' / 3';
    els.bluffsCountBadge.classList.toggle('is-complete', chosen.length === 3);
    els.bluffsClearBtn.hidden = chosen.length === 0;
    els.bluffsToggleBtn.textContent = state.bluffsPickerOpen ? 'Done' : 'Choose Bluffs';
    els.bluffsPickerPanel.hidden = !state.bluffsPickerOpen;

    els.bluffsSelectedRow.innerHTML = '';
    if (chosen.length === 0) {
      els.bluffsSelectedRow.innerHTML =
        '<span class="bluffs-empty-note">No bluffs chosen yet—tap Choose Bluffs or Random.</span>';
    } else {
      chosen.forEach(function (id) {
        const c = getChar(id);
        const btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'bluff-chip bluff-chip--removable';
        btn.title = 'Click to remove bluff';
        btn.innerHTML =
          '<span>' + escapeHtml(c ? c.name : id) + '</span>' +
          '<span class="bluff-remove-x" aria-hidden="true">×</span>';
        btn.addEventListener('click', function () {
          toggleBluff(id);
        });
        els.bluffsSelectedRow.appendChild(btn);
      });
    }

    if (state.bluffsPickerOpen) {
      renderBluffPickerGrid(els.bluffsPickerGrid);
    }
  }

  // ── Player Status Mutations ────────────────────────────────────────────

  function swapSeats(idxA, idxB) {
    if (
      idxA === idxB ||
      idxA < 0 ||
      idxB < 0 ||
      idxA >= state.players.length ||
      idxB >= state.players.length
    ) {
      return;
    }
    const temp = state.players[idxA];
    state.players[idxA] = state.players[idxB];
    state.players[idxB] = temp;
    persistAll();
    renderAll();
  }

  function setSingleMarker(field, targetIdx) {
    state.players.forEach(function (p, i) {
      p[field] = i === targetIdx;
    });
    persistAll();
    renderAll();
  }

  function togglePoison(idx) {
    const p = state.players[idx];
    if (!p) return;
    if (state.scriptId === 'trouble-brewing') {
      setSingleMarker('poisoned', p.poisoned ? -1 : idx);
    } else {
      // BMR (Pukka) & S&V (No Dashii / Vigormortis) can have multiple poisoned players
      p.poisoned = !p.poisoned;
      persistAll();
      renderAll();
    }
  }

  function killPlayerTonight(targetIdx) {
    const target = state.players[targetIdx];
    if (!target) {
      return;
    }
    if (target.roleId === 'zombuul' && target.alive && !target.zombuulFakeDead) {
      target.zombuulFakeDead = true;
      persistAll();
      renderAll();
      return;
    }
    if (target.alive) {
      target.alive = false;
      target.ghostVoteUsed = false;
      target.diedTonight = true;
      target.executedToday = false;
      if (target.roleId === 'poisoner') {
        state.players.forEach(function (other) {
          other.poisoned = false;
        });
      }
      if (target.roleId === 'no-dashii') {
        const ndNeighbors = computeNoDashiiTownsfolkNeighbors(targetIdx);
        if (ndNeighbors.cw) ndNeighbors.cw.poisoned = false;
        if (ndNeighbors.ccw) ndNeighbors.ccw.poisoned = false;
      }
      persistAll();
      renderAll();
    }
  }

  function revivePlayer(targetIdx) {
    const target = state.players[targetIdx];
    if (!target) {
      return;
    }
    target.alive = true;
    target.ghostVoteUsed = false;
    target.diedTonight = false;
    target.executedToday = false;
    target.zombuulFakeDead = false;
    persistAll();
    renderAll();
  }

  function toggleAlive(idx) {
    const p = state.players[idx];
    if (!p) {
      return;
    }
    p.alive = !p.alive;
    if (p.alive) {
      p.ghostVoteUsed = false;
      p.diedTonight = false;
      p.executedToday = false;
      p.zombuulFakeDead = false;
    } else {
      p.ghostVoteUsed = false;
      if (state.game.phase === 'night') {
        p.diedTonight = true;
        p.executedToday = false;
      } else {
        state.game.someoneDiedToday = true;
        const c = getChar(p.roleId);
        if (c && c.team === 'outsiders') {
          state.game.outsiderDiedToday = true;
        }
      }
      if (p.roleId === 'poisoner') {
        state.players.forEach(function (other) {
          other.poisoned = false;
        });
      }
    }
    persistAll();
    renderAll();
  }

  function toggleGhostVote(idx) {
    const p = state.players[idx];
    if (!p || (p.alive && !p.zombuulFakeDead)) {
      return;
    }
    p.ghostVoteUsed = !p.ghostVoteUsed;
    persistAll();
    renderAll();
  }

  // ── Script-Specific Seating & Board Calculators ────────────────────────

  function computeChefPairs() {
    const n = state.players.length;
    if (n < 2) return 0;
    let pairs = 0;
    for (let i = 0; i < n; i += 1) {
      if (isPlayerEvil(state.players[i]) && isPlayerEvil(state.players[(i + 1) % n])) {
        pairs += 1;
      }
    }
    return pairs;
  }

  function computeAliveNeighbors(seatIdx) {
    const n = state.players.length;
    let cw = null;
    let ccw = null;
    for (let step = 1; step < n; step += 1) {
      const cand = state.players[(seatIdx + step) % n];
      if (cand.alive && !cand.zombuulFakeDead) {
        cw = cand;
        break;
      }
    }
    for (let step = 1; step < n; step += 1) {
      const cand = state.players[(seatIdx - step + n) % n];
      if (cand.alive && !cand.zombuulFakeDead) {
        ccw = cand;
        break;
      }
    }
    let evilCount = 0;
    if (cw && isPlayerEvil(cw)) evilCount += 1;
    if (ccw && ccw !== cw && isPlayerEvil(ccw)) evilCount += 1;
    return { cw: cw, ccw: ccw, evilCount: evilCount };
  }

  function isTeaLadyProtected(player) {
    if (!player || !player.alive) return false;
    const tlIdx = state.players.findIndex(function (p) {
      return p.roleId === 'tea-lady' && p.alive && !p.drunk && !p.poisoned;
    });
    if (tlIdx === -1) return false;
    const info = computeAliveNeighbors(tlIdx);
    if (!info.cw || !info.ccw || info.evilCount > 0) return false;
    return player === info.cw || player === info.ccw;
  }

  function computeClockmakerDistance() {
    const n = state.players.length;
    const demonIdx = state.players.findIndex(function (p) {
      const c = getChar(p.roleId);
      return c && c.team === 'demon';
    });
    if (demonIdx === -1) return null;

    let minDist = Infinity;
    state.players.forEach(function (p, i) {
      const c = getChar(p.roleId);
      if (c && c.team === 'minions') {
        const diff = Math.abs(i - demonIdx);
        const dist = Math.min(diff, n - diff);
        if (dist < minDist) {
          minDist = dist;
        }
      }
    });
    return minDist === Infinity ? null : minDist;
  }

  function computeOracleEvilDead() {
    return state.players.filter(function (p) {
      return !p.alive && isPlayerEvil(p);
    }).length;
  }

  function computeNoDashiiTownsfolkNeighbors(demonIdx) {
    const n = state.players.length;
    let cw = null;
    let ccw = null;
    for (let step = 1; step < n; step += 1) {
      const cand = state.players[(demonIdx + step) % n];
      const c = getChar(cand.roleId);
      if (c && c.team === 'townsfolk') {
        cw = cand;
        break;
      }
    }
    for (let step = 1; step < n; step += 1) {
      const cand = state.players[(demonIdx - step + n) % n];
      const c = getChar(cand.roleId);
      if (c && c.team === 'townsfolk') {
        ccw = cand;
        break;
      }
    }
    return { cw: cw, ccw: ccw };
  }

  // ── Script-Specialized Night Order Builder ─────────────────────────────

  function buildActiveNightSteps() {
    const details = getScriptDetails();
    if (!details || !details.nightOrder) {
      return [];
    }

    const isFirstNight = state.game.dayNumber === 1;
    const template = isFirstNight
      ? details.nightOrder.firstNight
      : details.nightOrder.otherNights;

    const stats = getTownStats();
    const hasVigormortis = hasActualRoleInPlay('vigormortis');
    const steps = [];

    template.forEach(function (entry) {
      if (entry.team === 'system') {
        if (state.teensyville) {
          return;
        }
        if (entry.id === 'minion-info') {
          const hasMinion = state.players.some(function (p) {
            const c = getChar(p.roleId);
            return c && c.team === 'minions';
          });
          if (!hasMinion) return;
        }
        if (entry.id === 'demon-info') {
          const hasDemon = state.players.some(function (p) {
            const c = getChar(p.roleId);
            return c && c.team === 'demon';
          });
          if (!hasDemon) return;
        }
        steps.push({
          stepId: entry.id,
          roleId: entry.id,
          name: entry.name,
          team: 'system',
          note: entry.note,
          playerIdx: null,
          player: null,
          isDrunk: false,
          isLunatic: false,
          isVigorKept: false
        });
        return;
      }

      state.players.forEach(function (player, idx) {
        const isActual = player.roleId === entry.id;
        const isDrunkBelieving =
          player.roleId === 'drunk' && player.believedRoleId === entry.id;

        if (!isActual && !isDrunkBelieving) {
          return;
        }

        const char = getChar(player.roleId);
        let isVigorKept = false;

        // ── Script-specific & role-specific wake conditions ──

        // 1. Night-death triggers (TB Ravenkeeper, S&V Sage): ONLY wake on exact night they died
        if (entry.id === 'ravenkeeper' || entry.id === 'sage') {
          if (player.alive || !player.diedTonight) {
            return;
          }
        }
        // 2. Day-or-Night death triggers (S&V Barber, S&V Sweetheart)
        else if (entry.id === 'barber' || entry.id === 'sweetheart') {
          if (player.alive || (!player.executedToday && !player.diedTonight)) {
            return;
          }
        }
        // 3. BMR Moonchild: wakes only after dying today (or tonight)
        else if (entry.id === 'moonchild') {
          if (player.alive || (!player.executedToday && !player.diedTonight)) {
            return;
          }
        }
        // 4. BMR Zombuul: wakes even if Fake Dead, ONLY if no one died today
        else if (entry.id === 'zombuul') {
          if (!player.alive && !player.zombuulFakeDead) {
            return;
          }
          if (state.game.someoneDiedToday) {
            return;
          }
        }
        // 5. All other waking roles must be alive (except dead Minions killed by Vigormortis)
        else if (!player.alive) {
          if (hasVigormortis && char && char.team === 'minions' && !player.executedToday) {
            isVigorKept = true;
          } else {
            return;
          }
        }

        // TB Undertaker: only if someone died by execution today
        if (entry.id === 'undertaker') {
          const someoneExecuted = state.players.some(function (p) {
            return !p.alive && p.executedToday;
          });
          if (!someoneExecuted) return;
        }

        // TB Scarlet Woman: only if no living Demon
        if (entry.id === 'scarlet-woman') {
          const livingDemon = state.players.some(function (p) {
            const c = getChar(p.roleId);
            return c && c.team === 'demon' && p.alive;
          });
          if (livingDemon) return;
        }

        // BMR Lunatic on Night 1: skip in Teensyville unless believing Pukka
        if (entry.id === 'lunatic' && isFirstNight) {
          if (state.teensyville && player.believedRoleId !== 'pukka') {
            return;
          }
        }

        // BMR Godfather on Other Nights: only wakes if an Outsider died today
        if (entry.id === 'godfather' && !isFirstNight) {
          if (!state.game.outsiderDiedToday) return;
        }

        // BMR Minstrel on Other Nights: reminder only if a Minion was executed today
        if (entry.id === 'minstrel') {
          if (!state.game.minionExecutedToday) return;
        }

        // BMR Grandmother on Other Nights: reminder only if someone died tonight
        if (entry.id === 'grandmother' && !isFirstNight) {
          if (state.game.killedTonight.length === 0) return;
        }

        // S&V Witch: loses ability at 3 or fewer alive
        if (entry.id === 'witch' && !isFirstNight) {
          if (stats.alive <= 3) return;
        }

        // S&V Juggler: wakes only on Night 2
        if (entry.id === 'juggler') {
          if (state.game.dayNumber !== 2) return;
        }

        steps.push({
          stepId: entry.id + '-' + idx,
          roleId: entry.id,
          name: entry.name,
          team: entry.team,
          note: entry.note,
          playerIdx: idx,
          player: player,
          isDrunk: isDrunkBelieving || Boolean(player.drunk),
          isLunatic: player.roleId === 'lunatic',
          isVigorKept: isVigorKept
        });
      });
    });

    return steps;
  }

  // ── Rendering: Header, Circle & List ───────────────────────────────────

  function renderTopChrome() {
    const script = Scripts.getById(state.scriptId) || Scripts.getDefault();
    const isNight = state.game.phase === 'night';
    const phaseLabel = (isNight ? 'Night ' : 'Day ') + state.game.dayNumber;
    const stats = getTownStats();

    els.headerPhaseText.textContent = phaseLabel;
    els.headerPhasePill.className =
      'phase-pill ' + (isNight ? 'phase-pill--night' : 'phase-pill--day');

    els.gmLabel.innerHTML =
      '<span class="context-chip-label">GM</span> <strong>' +
      escapeHtml(state.gmName || 'Storyteller') +
      '</strong>';
    els.scriptLabel.innerHTML =
      '<span class="context-chip-label">Script</span> <strong>' +
      escapeHtml(script.name) +
      '</strong>';
    els.teensyChip.hidden = !state.teensyville;

    els.hub.className = 'grimoire-hub ' + (isNight ? 'grimoire-hub--night' : 'grimoire-hub--day');
    els.hubIcon.innerHTML = isNight ? MOON_SVG : SUN_SVG;
    els.hubDayLabel.textContent = phaseLabel;
    els.hubAliveStat.textContent = stats.alive + ' / ' + stats.total + ' Alive';
    els.hubVotesStat.textContent = stats.majority + ' to Execute';

    els.guidePhaseEyebrow.textContent = isNight ? 'Night Walkthrough' : 'Town Square';
    els.guidePhaseTitle.textContent = phaseLabel;
    els.guideVotesBadge.textContent =
      stats.alive + ' Alive · ' + stats.majority + ' to Execute';

    els.prevPhaseBtn.disabled = isNight && state.game.dayNumber === 1;
    els.nextPhaseBtnText.textContent = isNight
      ? 'Dawn · Start Day ' + state.game.dayNumber
      : 'Dusk · Start Night ' + (state.game.dayNumber + 1);
  }

  function buildSeatMarkersHtml(player, idx, forList) {
    const parts = [];

    if (player.roleId === 'drunk' || player.drunk) {
      parts.push('<span class="seat-marker seat-marker--drunk" title="Drunk">DRUNK</span>');
    }

    if (player.roleId === 'lunatic') {
      parts.push('<span class="seat-marker seat-marker--drunk" title="Lunatic">LUNATIC</span>');
    }

    if (player.poisoned) {
      parts.push('<span class="seat-marker seat-marker--poison" title="Poisoned">POISON</span>');
    }

    if (!player.alive || player.zombuulFakeDead) {
      if (player.zombuulFakeDead && player.alive) {
        parts.push('<span class="seat-marker seat-marker--died" title="Zombuul registers as dead">FAKE DEAD</span>');
      }
      if (!forList) {
        if (!player.ghostVoteUsed) {
          parts.push(
            '<button type="button" class="seat-marker seat-marker--vote" data-quick-vote="' +
              idx +
              '" title="1 Ghost Vote left — click to remove">1 VOTE</button>'
          );
        } else {
          parts.push(
            '<button type="button" class="seat-marker seat-marker--vote-used" data-quick-vote="' +
              idx +
              '" title="Ghost Vote used — click to restore">0 VOTES</button>'
          );
        }
      }
    }

    if (player.protectedByMonk) {
      parts.push('<span class="seat-marker seat-marker--safe" title="Protected tonight">SAFE</span>');
    }

    if (player.daProtected) {
      parts.push('<span class="seat-marker seat-marker--safe" title="Devil\'s Advocate Execution Safe">DA SAFE</span>');
    }

    if (player.mad) {
      parts.push('<span class="seat-marker seat-marker--mad" title="Mad (Cerenovus)">MAD</span>');
    }

    if (player.cursed) {
      parts.push('<span class="seat-marker seat-marker--exec" title="Witch Cursed">CURSED</span>');
    }

    if (player.redHerring) {
      parts.push('<span class="seat-marker seat-marker--herring" title="Fortune Teller Red Herring">HERRING</span>');
    }

    if (player.alignmentOverride) {
      parts.push(
        '<span class="seat-marker ' +
          (player.alignmentOverride === 'evil' ? 'seat-marker--exec' : 'seat-marker--safe') +
          '">' +
          player.alignmentOverride.toUpperCase() +
          '</span>'
      );
    }

    if (player.goodTwin) {
      parts.push('<span class="seat-marker seat-marker--safe" title="Good Twin">GOOD TWIN</span>');
    }

    if (player.grandchild) {
      parts.push('<span class="seat-marker seat-marker--safe" title="Grandmother\'s Grandchild">GRANDCHILD</span>');
    }

    if (!player.alive && player.diedTonight) {
      parts.push('<span class="seat-marker seat-marker--died" title="Died Tonight">DIED TONIGHT</span>');
    }

    if (!player.alive && player.executedToday) {
      parts.push('<span class="seat-marker seat-marker--exec" title="Executed Today">EXEC TODAY</span>');
    }

    return parts.join('');
  }

  function renderCircle() {
    const n = state.players.length;
    els.seatsLayer.innerHTML = '';

    let density = 'spacious';
    let radius = 38.5;
    if (n >= 12) {
      density = 'compact';
      radius = 42;
    } else if (n >= 9) {
      density = 'medium';
      radius = 40.5;
    }
    els.circleStage.dataset.density = density;

    const activeSteps = state.game.phase === 'night' ? buildActiveNightSteps() : [];
    const currentStep =
      activeSteps[Math.min(state.game.nightStepIndex, Math.max(0, activeSteps.length - 1))] || null;

    state.players.forEach(function (player, idx) {
      const char = getChar(player.roleId);
      const believedChar = player.believedRoleId ? getChar(player.believedRoleId) : null;
      const teamClass = char ? 'seat-token--' + char.team : 'seat-token--townsfolk';

      const angle = (2 * Math.PI * idx) / n - Math.PI / 2;
      const leftPct = 50 + radius * Math.cos(angle);
      const topPct = 50 + radius * Math.sin(angle);

      const token = doc.createElement('div');
      token.className = 'seat-token ' + teamClass;
      if (!player.alive || player.zombuulFakeDead) token.classList.add('is-dead');
      if (player.poisoned) token.classList.add('is-poisoned');
      if (player.roleId === 'drunk' || player.drunk) token.classList.add('is-drunk');
      if (currentStep && currentStep.playerIdx === idx) token.classList.add('is-night-active');

      token.style.left = leftPct.toFixed(3) + '%';
      token.style.top = topPct.toFixed(3) + '%';
      token.dataset.seatIdx = String(idx);
      token.setAttribute('role', 'button');
      token.setAttribute('tabindex', '0');

      const roleLine =
        (player.roleId === 'drunk' || player.roleId === 'lunatic') && believedChar
          ? escapeHtml(believedChar.name)
          : escapeHtml(char ? char.name : player.roleId);

      const shroudHtml =
        !player.alive
          ? '<span class="dead-shroud" aria-label="Dead">✝ DEAD</span>'
          : player.zombuulFakeDead
            ? '<span class="dead-shroud" aria-label="Registers as Dead">✝ ZOMBUUL</span>'
            : '';

      const markersHtml = buildSeatMarkersHtml(player, idx);

      token.innerHTML =
        shroudHtml +
        '<span class="seat-num">' + (idx + 1) + '</span>' +
        '<span class="seat-player-name">' + escapeHtml(player.name) + '</span>' +
        '<span class="seat-role-name">' + roleLine + '</span>' +
        (markersHtml ? '<div class="seat-markers">' + markersHtml + '</div>' : '');

      token.addEventListener('pointerdown', function (e) {
        handleTokenPointerDown(e, idx, token);
      });

      token.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPlayerModal(idx);
        }
      });

      els.seatsLayer.appendChild(token);
    });
  }

  function renderList() {
    els.listStage.innerHTML = '';

    state.players.forEach(function (player, idx) {
      const char = getChar(player.roleId);
      const believedChar = player.believedRoleId ? getChar(player.believedRoleId) : null;
      let roleDisplay = char ? char.name : player.roleId;
      if (player.roleId === 'drunk' && believedChar) {
        roleDisplay = 'Drunk (thinks ' + believedChar.name + ')';
      } else if (player.roleId === 'lunatic' && believedChar) {
        roleDisplay = 'Lunatic (thinks ' + believedChar.name + ')';
      }

      const row = doc.createElement('div');
      row.className = 'grim-list-row grim-list-row--' + (char ? char.team : 'townsfolk');
      if (!player.alive || player.zombuulFakeDead) row.classList.add('is-dead');
      if (player.poisoned) row.classList.add('is-poisoned');

      const hasGhostVote = !player.alive || player.zombuulFakeDead;
      const listMarkersHtml = buildSeatMarkersHtml(player, idx, true);

      row.innerHTML =
        '<div class="grim-list-main">' +
        '  <span class="seat-num-inline">#' + (idx + 1) + '</span>' +
        '  <div class="grim-list-text">' +
        '    <div class="grim-list-player">' + escapeHtml(player.name) + (!player.alive ? ' <span class="dead-inline-tag">DEAD</span>' : '') + '</div>' +
        '    <div class="grim-list-role">' + escapeHtml(roleDisplay) + '</div>' +
        (listMarkersHtml ? '    <div class="seat-markers grim-list-markers">' + listMarkersHtml + '</div>' : '') +
        '  </div>' +
        '</div>' +
        '<div class="grim-list-actions">' +
        '  <button type="button" class="list-chip-btn ' + (player.alive ? '' : 'is-dead-btn') + '" data-act="alive">' + (player.alive ? 'Alive' : 'Dead') + '</button>' +
        (hasGhostVote
          ? '<button type="button" class="list-chip-btn ' + (!player.ghostVoteUsed ? 'is-vote-btn' : '') + '" data-act="vote">' + (!player.ghostVoteUsed ? '1 Vote' : '0 Votes') + '</button>'
          : '') +
        '  <button type="button" class="list-chip-btn ' + (player.poisoned ? 'is-poison-btn' : '') + '" data-act="poison">' + (player.poisoned ? 'Poisoned' : 'Poison') + '</button>' +
        '  <button type="button" class="list-chip-btn" data-act="edit">Edit</button>' +
        '</div>';

      row.querySelector('[data-act="alive"]').addEventListener('click', function () {
        toggleAlive(idx);
      });
      const voteBtn = row.querySelector('[data-act="vote"]');
      if (voteBtn) {
        voteBtn.addEventListener('click', function () {
          toggleGhostVote(idx);
        });
      }
      row.querySelector('[data-act="poison"]').addEventListener('click', function () {
        togglePoison(idx);
      });
      row.querySelector('[data-act="edit"]').addEventListener('click', function () {
        openPlayerModal(idx);
      });

      els.listStage.appendChild(row);
    });
  }

  // ── Unified Mouse & Touch Drag-and-Drop Seat Swap ──────────────────────

  function cleanupDrag() {
    if (drag.ghostEl && drag.ghostEl.parentNode) {
      drag.ghostEl.parentNode.removeChild(drag.ghostEl);
    }
    doc.querySelectorAll('.seat-token.is-drag-source, .seat-token.is-drop-target').forEach(function (el) {
      el.classList.remove('is-drag-source', 'is-drop-target');
    });
    drag.active = false;
    drag.dragging = false;
    drag.pointerId = null;
    drag.sourceIdx = null;
    drag.targetIdx = null;
    drag.ghostEl = null;
  }

  function handleTokenPointerDown(e, idx, tokenEl) {
    const quickVoteBtn = e.target.closest('[data-quick-vote]');
    if (quickVoteBtn) {
      e.stopPropagation();
      toggleGhostVote(idx);
      return;
    }

    if (e.button !== undefined && e.button !== 0) {
      return;
    }

    drag.active = true;
    drag.dragging = false;
    drag.pointerId = e.pointerId;
    drag.sourceIdx = idx;
    drag.targetIdx = null;
    drag.startX = e.clientX;
    drag.startY = e.clientY;

    const onMove = function (moveEvt) {
      if (!drag.active || moveEvt.pointerId !== drag.pointerId) return;
      const dx = moveEvt.clientX - drag.startX;
      const dy = moveEvt.clientY - drag.startY;
      if (!drag.dragging && Math.hypot(dx, dy) > 10) {
        drag.dragging = true;
        tokenEl.classList.add('is-drag-source');
        const ghost = tokenEl.cloneNode(true);
        ghost.classList.add('seat-drag-ghost');
        ghost.style.left = moveEvt.clientX + 'px';
        ghost.style.top = moveEvt.clientY + 'px';
        doc.body.appendChild(ghost);
        drag.ghostEl = ghost;
      }

      if (drag.dragging && drag.ghostEl) {
        moveEvt.preventDefault();
        drag.ghostEl.style.left = moveEvt.clientX + 'px';
        drag.ghostEl.style.top = moveEvt.clientY + 'px';

        const stack = doc.elementsFromPoint(moveEvt.clientX, moveEvt.clientY);
        const hovered = stack.find(function (el) {
          return (
            el.classList &&
            el.classList.contains('seat-token') &&
            !el.classList.contains('seat-drag-ghost')
          );
        });

        doc.querySelectorAll('.seat-token.is-drop-target').forEach(function (el) {
          el.classList.remove('is-drop-target');
        });

        if (hovered) {
          const hoveredIdx = Number(hovered.dataset.seatIdx);
          if (Number.isInteger(hoveredIdx) && hoveredIdx !== drag.sourceIdx) {
            hovered.classList.add('is-drop-target');
            drag.targetIdx = hoveredIdx;
          } else {
            drag.targetIdx = null;
          }
        } else {
          drag.targetIdx = null;
        }
      }
    };

    const onEnd = function (endEvt) {
      if (endEvt.pointerId !== drag.pointerId) return;
      global.removeEventListener('pointermove', onMove);
      global.removeEventListener('pointerup', onEnd);
      global.removeEventListener('pointercancel', onEnd);

      const wasDragging = drag.dragging;
      const fromIdx = drag.sourceIdx;
      const toIdx = drag.targetIdx;

      cleanupDrag();

      if (wasDragging) {
        if (toIdx !== null && toIdx !== fromIdx) {
          swapSeats(fromIdx, toIdx);
        }
      } else {
        openPlayerModal(fromIdx);
      }
    };

    global.addEventListener('pointermove', onMove, { passive: false });
    global.addEventListener('pointerup', onEnd);
    global.addEventListener('pointercancel', onEnd);
  }

  // ── Script-Specialized Night Step Action Widgets ───────────────────────

  function buildPlayerOptions(filterFn, placeholder, extraTagFn) {
    return (
      '<option value="">' +
      escapeHtml(placeholder) +
      '</option>' +
      state.players
        .map(function (p, i) {
          if (filterFn && !filterFn(p, i)) return '';
          const tags = extraTagFn ? extraTagFn(p, i) : [];
          return (
            '<option value="' +
            i +
            '">#' +
            p.seat +
            ' ' +
            escapeHtml(p.name) +
            (tags.length ? ' [' + tags.join(', ') + ']' : '') +
            '</option>'
          );
        })
        .join('')
    );
  }

  function renderQuickKillWidget(label, extraHintHtml) {
    const optionsHtml = buildPlayerOptions(null, 'Select player to kill...', function (p) {
      const tags = [];
      if (!p.alive) tags.push('Dead');
      if (p.protectedByMonk) tags.push('Safe');
      if (isTeaLadyProtected(p)) tags.push('Tea Lady Safe');
      if (p.roleId === 'soldier') tags.push('Soldier');
      if (p.roleId === 'mayor') tags.push('Mayor');
      if (p.roleId === 'sailor') tags.push('Sailor');
      if (p.roleId === 'fool') tags.push('Fool');
      const c = getChar(p.roleId);
      if (c && c.team === 'outsiders' && hasAliveRole('fang-gu')) tags.push('Outsider — Fang Gu Jump!');
      if (c && c.team === 'minions' && hasAliveRole('vigormortis')) tags.push('Minion — Keeps Ability');
      return tags;
    });

    els.nightStepActionBox.hidden = false;
    els.nightStepActionBox.innerHTML =
      (extraHintHtml || '') +
      '<label class="action-helper-label" for="night-imp-select">' + escapeHtml(label) + '</label>' +
      '<div class="pm-inline-control">' +
      '  <select id="night-imp-select" class="grim-select">' + optionsHtml + '</select>' +
      '  <button type="button" id="night-imp-kill-btn" class="btn-secondary pm-small-btn">Kill</button>' +
      '</div>' +
      (state.game.killedTonight.length > 0
        ? '<div class="action-helper-sub">Died tonight: ' + escapeHtml(state.game.killedTonight.join(', ')) + '</div>'
        : '');

    doc.getElementById('night-imp-kill-btn').addEventListener('click', function () {
      const val = doc.getElementById('night-imp-select').value;
      if (val !== '') {
        killPlayerTonight(Number(val));
      }
    });
  }

  function renderNightActionWidget(step) {
    els.nightStepActionBox.innerHTML = '';
    els.nightStepActionBox.hidden = true;

    const demons = state.players.filter(function (p) {
      const c = getChar(p.roleId);
      return c && c.team === 'demon';
    });
    const minions = state.players.filter(function (p) {
      const c = getChar(p.roleId);
      return c && c.team === 'minions';
    });

    // ── Shared System Steps ──
    if (step.roleId === 'minion-info') {
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Demon:</strong> ' +
        (demons.map(function (d) { return '#' + d.seat + ' ' + escapeHtml(d.name); }).join(', ') || 'None') +
        '</div>' +
        '<div class="action-helper-line"><strong>Minions:</strong> ' +
        (minions.map(function (m) {
          const c = getChar(m.roleId);
          return '#' + m.seat + ' ' + escapeHtml(m.name) + ' (' + escapeHtml(c ? c.name : m.roleId) + ')';
        }).join(', ') || 'None') +
        '</div>';
      return;
    }

    if (step.roleId === 'demon-info') {
      const chosen = Array.isArray(state.game.bluffs) ? state.game.bluffs : [];
      const lunaticPlayer = state.players.find(function (p) { return p.roleId === 'lunatic'; });

      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Demon:</strong> ' +
        (demons.map(function (d) { return '#' + d.seat + ' ' + escapeHtml(d.name); }).join(', ') || 'None') +
        ' · <strong>Minions:</strong> ' +
        (minions.map(function (m) { return '#' + m.seat + ' ' + escapeHtml(m.name); }).join(', ') || 'None') +
        '</div>' +
        (lunaticPlayer
          ? '<div class="action-helper-line"><strong>Lunatic in play:</strong> #' + lunaticPlayer.seat + ' ' + escapeHtml(lunaticPlayer.name) + ' (point out to the real Demon!)</div>'
          : '') +
        '<div class="action-helper-head">' +
        '  <strong>Choose 3 Bluffs (' + chosen.length + ' / 3)</strong>' +
        '  <div class="bluffs-card-actions">' +
        '    <button type="button" id="reroll-bluffs-btn" class="mini-action-btn">Random</button>' +
        (chosen.length > 0
          ? '<button type="button" id="clear-bluffs-night-btn" class="mini-action-btn mini-action-btn--muted">Clear</button>'
          : '') +
        '  </div>' +
        '</div>' +
        '<div id="night-bluff-picker-grid" class="bluff-picker-grid"></div>' +
        (chosen.length > 0
          ? '<button type="button" id="night-show-bluffs-btn" class="btn-secondary night-show-btn">Show ' + chosen.length + ' Bluff' + (chosen.length === 1 ? '' : 's') + ' Full-Screen</button>'
          : '');

      renderBluffPickerGrid(doc.getElementById('night-bluff-picker-grid'));

      const rerollBtn = doc.getElementById('reroll-bluffs-btn');
      if (rerollBtn) {
        rerollBtn.addEventListener('click', function () {
          state.game.bluffs = generateBluffs();
          persistAll();
          renderAll();
        });
      }
      const clearBtn = doc.getElementById('clear-bluffs-night-btn');
      if (clearBtn) clearBtn.addEventListener('click', clearBluffs);
      const showBtn = doc.getElementById('night-show-bluffs-btn');
      if (showBtn) {
        showBtn.addEventListener('click', function () {
          launchShowOverlay(chosen, 'These characters are not in play');
        });
      }
      return;
    }

    // ── Quick Show-Card Steps (TB, BMR, S&V) ──
    const quickShowMap = {
      washerwoman: { label: 'Show a Townsfolk Role...', banner: 'One of these players is' },
      librarian: { label: 'Show an Outsider Role...', banner: 'One of these players is' },
      investigator: { label: 'Show a Minion Role...', banner: 'One of these players is' },
      ravenkeeper: { label: 'Show Chosen Character...', banner: 'This player is' },
      dreamer: { label: 'Show 1 Good & 1 Evil Role...', banner: 'One of these is their character' },
      exorcist: { label: 'Show Exorcist Card to Demon', banner: 'This character selected you', roles: ['exorcist'] },
      barber: { label: 'Show Barber Card to Demon', banner: 'This character selected you', roles: ['barber'] }
    };

    if (quickShowMap[step.roleId]) {
      const meta = quickShowMap[step.roleId];
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<button type="button" id="night-open-show-btn" class="btn-secondary night-show-btn">' +
        escapeHtml(meta.label) +
        '</button>';

      doc.getElementById('night-open-show-btn').addEventListener('click', function () {
        if (meta.roles) {
          launchShowOverlay(meta.roles, meta.banner);
        } else {
          openShowPicker({ presetBanner: meta.banner, presetRoles: [] });
        }
      });
      return;
    }

    // ── Trouble Brewing Specifics ──
    if (step.roleId === 'scarlet-woman') {
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<button type="button" id="night-show-imp-btn" class="btn-secondary night-show-btn">Show "You are Imp" Full-Screen</button>';
      doc.getElementById('night-show-imp-btn').addEventListener('click', function () {
        launchShowOverlay(['imp'], 'You are');
      });
      return;
    }

    if (step.roleId === 'poisoner') {
      const currentIdx = state.players.findIndex(function (p) { return p.poisoned; });
      const optionsHtml =
        '<option value="-1">No one poisoned</option>' +
        state.players.map(function (p, i) {
          return '<option value="' + i + '"' + (i === currentIdx ? ' selected' : '') + '>#' + p.seat + ' ' + escapeHtml(p.name) + '</option>';
        }).join('');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-poison-select">Place Poisoned Marker On:</label>' +
        '<select id="night-poison-select" class="grim-select">' + optionsHtml + '</select>';
      doc.getElementById('night-poison-select').addEventListener('change', function (e) {
        setSingleMarker('poisoned', Number(e.target.value));
      });
      return;
    }

    if (step.roleId === 'butler') {
      const optionsHtml = buildPlayerOptions(function (p, i) {
        return i !== step.playerIdx;
      }, 'Choose Master for tomorrow...');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Butler:</strong> Chooses a Master player. Tomorrow, they may only vote if their Master votes.</div>' +
        '<div class="pm-inline-control">' +
        '  <select id="night-butler-select" class="grim-select">' + optionsHtml + '</select>' +
        '</div>';
      return;
    }

    if (step.roleId === 'chef') {
      const pairs = computeChefPairs();
      const hasMisreg = hasRoleInPlay('recluse') || hasRoleInPlay('spy');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Current Adjacent Evil Pairs:</strong> <span class="helper-highlight">' + pairs + '</span></div>' +
        (hasMisreg ? '<div class="action-helper-sub">Note: Recluse or Spy is in play and may misregister.</div>' : '');
      return;
    }

    if (step.roleId === 'empath' && step.playerIdx !== null) {
      const info = computeAliveNeighbors(step.playerIdx);
      const cwText = info.cw ? '#' + info.cw.seat + ' ' + escapeHtml(info.cw.name) + ' (' + (isPlayerEvil(info.cw) ? 'Evil' : 'Good') + ')' : 'None';
      const ccwText = info.ccw ? '#' + info.ccw.seat + ' ' + escapeHtml(info.ccw.name) + ' (' + (isPlayerEvil(info.ccw) ? 'Evil' : 'Good') + ')' : 'None';
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Alive Neighbors:</strong> ' + cwText + ' &amp; ' + ccwText + '</div>' +
        '<div class="action-helper-line"><strong>Evil Count:</strong> <span class="helper-highlight">' + info.evilCount + '</span></div>';
      return;
    }

    if (step.roleId === 'fortune-teller') {
      const currentIdx = state.players.findIndex(function (p) { return p.redHerring; });
      const optionsHtml =
        '<option value="-1">Choose Red Herring (Good player)...</option>' +
        state.players.map(function (p, i) {
          if (isPlayerEvil(p)) return '';
          return '<option value="' + i + '"' + (i === currentIdx ? ' selected' : '') + '>#' + p.seat + ' ' + escapeHtml(p.name) + '</option>';
        }).join('');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-herring-select">Red Herring Token:</label>' +
        '<select id="night-herring-select" class="grim-select">' + optionsHtml + '</select>';
      doc.getElementById('night-herring-select').addEventListener('change', function (e) {
        setSingleMarker('redHerring', Number(e.target.value));
      });
      return;
    }

    if (step.roleId === 'monk') {
      const currentIdx = state.players.findIndex(function (p) { return p.protectedByMonk; });
      const optionsHtml =
        '<option value="-1">No one protected</option>' +
        state.players.map(function (p, i) {
          if (i === step.playerIdx) return '';
          return '<option value="' + i + '"' + (i === currentIdx ? ' selected' : '') + '>#' + p.seat + ' ' + escapeHtml(p.name) + '</option>';
        }).join('');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-monk-select">Protect Player Tonight (Not Self):</label>' +
        '<select id="night-monk-select" class="grim-select">' + optionsHtml + '</select>';
      doc.getElementById('night-monk-select').addEventListener('change', function (e) {
        setSingleMarker('protectedByMonk', Number(e.target.value));
      });
      return;
    }

    if (step.roleId === 'undertaker') {
      const execPlayer = state.players.find(function (p) { return !p.alive && p.executedToday; });
      if (execPlayer) {
        const c = getChar(execPlayer.roleId);
        els.nightStepActionBox.hidden = false;
        els.nightStepActionBox.innerHTML =
          '<div class="action-helper-line"><strong>Executed Today:</strong> #' + execPlayer.seat + ' ' + escapeHtml(execPlayer.name) + ' — True Role: <span class="helper-highlight">' + escapeHtml(c ? c.name : execPlayer.roleId) + '</span></div>' +
          '<div class="bluffs-card-actions">' +
          '  <button type="button" id="night-show-exec-btn" class="btn-secondary night-show-btn">Show ' + escapeHtml(c ? c.name : execPlayer.roleId) + '</button>' +
          '  <button type="button" id="night-show-custom-exec-btn" class="mini-action-btn mini-action-btn--muted">Pick Other...</button>' +
          '</div>';
        doc.getElementById('night-show-exec-btn').addEventListener('click', function () {
          launchShowOverlay([execPlayer.roleId], 'This player was');
        });
        doc.getElementById('night-show-custom-exec-btn').addEventListener('click', function () {
          openShowPicker({ presetBanner: 'This player was', presetRoles: [execPlayer.roleId] });
        });
      }
      return;
    }

    // ── Bad Moon Rising Specifics ──
    if (step.roleId === 'grandmother') {
      els.nightStepActionBox.hidden = false;
      const grandchildIdx = state.players.findIndex(function (p) { return p.grandchild; });
      const grandchild = grandchildIdx !== -1 ? state.players[grandchildIdx] : null;
      const gcChar = grandchild ? getChar(grandchild.roleId) : null;

      if (state.game.dayNumber === 1) {
        const goodOptions =
          '<option value="-1">' + (grandchild ? 'Change Grandchild...' : 'Designate Grandchild...') + '</option>' +
          state.players.map(function (p, i) {
            if (i === step.playerIdx) return '';
            const c = getChar(p.roleId);
            const isGood = !isPlayerEvil(p);
            return '<option value="' + i + '"' + (i === grandchildIdx ? ' selected' : '') + '>' +
              '#' + p.seat + ' ' + escapeHtml(p.name) + ' (' + escapeHtml(c ? c.name : p.roleId) + ')' +
              (isGood ? '' : ' [Evil]') +
              '</option>';
          }).join('');

        els.nightStepActionBox.innerHTML =
          '<div class="action-helper-line"><strong>Grandmother (Night 1):</strong> Show Grandmother their Grandchild and character token.</div>' +
          (grandchild
            ? '<div class="action-helper-line"><strong>Grandchild:</strong> #' + grandchild.seat + ' ' + escapeHtml(grandchild.name) + ' (' + escapeHtml(gcChar ? gcChar.name : grandchild.roleId) + ')</div>'
            : '<div class="action-helper-sub">Designate Grandchild below:</div>') +
          '<div class="pm-inline-control">' +
          '  <select id="night-grandchild-select" class="grim-select">' + goodOptions + '</select>' +
          '</div>' +
          '<button type="button" id="night-show-grandchild-btn" class="btn-secondary night-show-btn"' + (grandchild ? '' : ' disabled') + ' style="margin-top: 8px;">' +
          '  Show ' + (gcChar ? escapeHtml(gcChar.name) : 'Grandchild Role') + ' to Grandmother' +
          '</button>';

        doc.getElementById('night-grandchild-select').addEventListener('change', function (e) {
          const val = Number(e.target.value);
          state.players.forEach(function (p, i) {
            p.grandchild = (val >= 0 && i === val);
          });
          persistAll();
          renderAll();
        });

        const showGcBtn = doc.getElementById('night-show-grandchild-btn');
        if (showGcBtn && grandchild) {
          showGcBtn.addEventListener('click', function () {
            launchShowOverlay([grandchild.roleId], 'This player is');
          });
        }
      } else {
        const gcDiedTonight = grandchild && !grandchild.alive && grandchild.diedTonight;
        els.nightStepActionBox.innerHTML =
          (grandchild
            ? '<div class="action-helper-line"><strong>Grandchild:</strong> #' + grandchild.seat + ' ' + escapeHtml(grandchild.name) + ' (' + (grandchild.alive ? 'Alive' : 'Dead') + ')</div>'
            : '<div class="action-helper-line">No Grandchild designated.</div>') +
          (gcDiedTonight
            ? '<div class="action-helper-sub" style="color: var(--color-crimson, #e57373); font-weight: bold;">Grandchild died tonight! The Grandmother must die too.</div>' +
              '<button type="button" id="night-kill-grandmother-btn" class="btn-secondary night-show-btn" style="margin-top: 8px;">Kill Grandmother Now</button>'
            : '<div class="action-helper-sub">Grandchild did not die tonight. Grandmother does not wake.</div>');

        const killGmBtn = doc.getElementById('night-kill-grandmother-btn');
        if (killGmBtn && step.playerIdx !== null) {
          killGmBtn.addEventListener('click', function () {
            killPlayerTonight(step.playerIdx);
          });
        }
      }
      return;
    }

    if (step.roleId === 'lunatic') {
      const believed = step.player && step.player.believedRoleId ? getChar(step.player.believedRoleId) : null;
      els.nightStepActionBox.hidden = false;
      if (state.game.dayNumber === 1) {
        els.nightStepActionBox.innerHTML =
          '<div class="action-helper-line"><strong>Believes they are:</strong> <span class="helper-highlight">' + escapeHtml(believed ? believed.name : 'Demon') + '</span></div>' +
          '<button type="button" id="night-open-show-btn" class="btn-secondary night-show-btn">Show Fake Bluffs...</button>';
        doc.getElementById('night-open-show-btn').addEventListener('click', function () {
          openShowPicker({ presetBanner: 'These characters are not in play', presetRoles: [] });
        });
      } else {
        els.nightStepActionBox.innerHTML =
          '<div class="action-helper-line"><strong>Believes they are:</strong> <span class="helper-highlight">' + escapeHtml(believed ? believed.name : 'Demon') + '</span></div>' +
          '<label class="action-helper-label" for="night-lunatic-target">Record Lunatic\'s Target(s) to Tell Real Demon:</label>' +
          '<input id="night-lunatic-target" type="text" class="text-input show-banner-input" placeholder="e.g. Alex (and Sam)..." value="' + escapeHtml(state.game.lunaticTarget || '') + '" />';
        doc.getElementById('night-lunatic-target').addEventListener('input', function (e) {
          state.game.lunaticTarget = e.target.value;
          persistAll();
        });
      }
      return;
    }

    if (step.roleId === 'godfather') {
      if (state.game.dayNumber === 1) {
        const outsiders = state.players.filter(function (p) {
          const c = getChar(p.roleId);
          return c && c.team === 'outsiders';
        });
        const outsiderIds = outsiders.map(function (p) { return p.roleId; });
        els.nightStepActionBox.hidden = false;
        els.nightStepActionBox.innerHTML =
          '<div class="action-helper-line"><strong>Outsiders in play:</strong> ' +
          (outsiders.map(function (p) {
            const c = getChar(p.roleId);
            return escapeHtml(c ? c.name : p.roleId);
          }).join(', ') || 'None') +
          '</div>' +
          (outsiderIds.length > 0
            ? '<button type="button" id="night-open-show-btn" class="btn-secondary night-show-btn">Show Outsiders Full-Screen</button>'
            : '');
        const btn = doc.getElementById('night-open-show-btn');
        if (btn) {
          btn.addEventListener('click', function () {
            launchShowOverlay(outsiderIds, 'These Outsiders are in play');
          });
        }
      } else {
        renderQuickKillWidget('Godfather Kill (Outsider died today):');
      }
      return;
    }

    if (step.roleId === 'devils-advocate') {
      const currentIdx = state.players.findIndex(function (p) { return p.daProtected; });
      const optionsHtml =
        '<option value="-1">No one protected</option>' +
        state.players.map(function (p, i) {
          if (!p.alive) return '';
          return '<option value="' + i + '"' + (i === currentIdx ? ' selected' : '') + '>#' + p.seat + ' ' + escapeHtml(p.name) + '</option>';
        }).join('');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-da-select">Execution-Safe Tomorrow:</label>' +
        '<select id="night-da-select" class="grim-select">' + optionsHtml + '</select>';
      doc.getElementById('night-da-select').addEventListener('change', function (e) {
        setSingleMarker('daProtected', Number(e.target.value));
      });
      return;
    }

    if (step.roleId === 'sailor') {
      const aliveOpts = buildPlayerOptions(function (p) { return p.alive; }, 'Select drinking partner...');
      const sailorPlayer = step.player;
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Sailor:</strong> Choose an alive player; either Sailor or target is drunk until dusk. Sailor cannot die.</div>' +
        '<div class="pm-inline-control">' +
        '  <select id="night-sailor-select" class="grim-select">' + aliveOpts + '</select>' +
        '</div>' +
        '<div class="bluffs-card-actions" style="margin-top: 6px; display: flex; gap: 8px;">' +
        '  <button type="button" id="night-drunk-sailor-btn" class="mini-action-btn' + (sailorPlayer && sailorPlayer.drunk ? ' is-active' : '') + '">Make Sailor ' + (sailorPlayer && sailorPlayer.drunk ? 'Sober' : 'Drunk') + '</button>' +
        '  <button type="button" id="night-drunk-target-btn" class="mini-action-btn">Toggle Target Drunk</button>' +
        '</div>';

      const drunkSailorBtn = doc.getElementById('night-drunk-sailor-btn');
      if (drunkSailorBtn && sailorPlayer) {
        drunkSailorBtn.addEventListener('click', function () {
          sailorPlayer.drunk = !sailorPlayer.drunk;
          persistAll();
          renderAll();
        });
      }
      doc.getElementById('night-drunk-target-btn').addEventListener('click', function () {
        const val = doc.getElementById('night-sailor-select').value;
        if (val !== '') {
          const target = state.players[Number(val)];
          if (target) {
            target.drunk = !target.drunk;
            persistAll();
            renderAll();
          }
        }
      });
      return;
    }

    if (step.roleId === 'innkeeper') {
      const aliveOpts = buildPlayerOptions(function (p) { return p.alive; }, 'Select alive player to make Drunk...');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Innkeeper:</strong> Choose 2 players (safe from death tonight). 1 of them is drunk until dusk.</div>' +
        '<div class="pm-inline-control" style="margin-bottom: 6px;">' +
        '  <select id="night-innkeeper-drunk-select" class="grim-select">' + aliveOpts + '</select>' +
        '  <button type="button" id="night-innkeeper-drunk-btn" class="btn-secondary pm-small-btn">Toggle Drunk</button>' +
        '</div>' +
        '<div class="action-helper-sub">Tip: Tap protected players on the Grimoire circle to toggle their Safe / Monk-safe marker.</div>';

      doc.getElementById('night-innkeeper-drunk-btn').addEventListener('click', function () {
        const val = doc.getElementById('night-innkeeper-drunk-select').value;
        if (val !== '') {
          const target = state.players[Number(val)];
          if (target) {
            target.drunk = !target.drunk;
            persistAll();
            renderAll();
          }
        }
      });
      return;
    }

    if (step.roleId === 'courtier' || step.roleId === 'sweetheart') {
      const optionsHtml = buildPlayerOptions(null, 'Mark a player Drunk...', function (p) {
        return p.drunk ? ['Already Drunk'] : [];
      });
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-drunk-select">Toggle Drunk Marker:</label>' +
        '<div class="pm-inline-control">' +
        '  <select id="night-drunk-select" class="grim-select">' + optionsHtml + '</select>' +
        '  <button type="button" id="night-drunk-btn" class="btn-secondary pm-small-btn">Toggle</button>' +
        '</div>';
      doc.getElementById('night-drunk-btn').addEventListener('click', function () {
        const val = doc.getElementById('night-drunk-select').value;
        if (val !== '') {
          const p = state.players[Number(val)];
          if (p) {
            p.drunk = !p.drunk;
            persistAll();
            renderAll();
          }
        }
      });
      return;
    }

    if (step.roleId === 'professor') {
      const deadOpts = buildPlayerOptions(function (p) { return !p.alive; }, 'Select dead player to resurrect...', function (p) {
        const c = getChar(p.roleId);
        return c ? [c.name + ' (' + c.team + ')'] : [];
      });
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-revive-select">Resurrect Dead Townsfolk:</label>' +
        '<div class="pm-inline-control">' +
        '  <select id="night-revive-select" class="grim-select">' + deadOpts + '</select>' +
        '  <button type="button" id="night-revive-btn" class="btn-secondary pm-small-btn">Revive</button>' +
        '</div>';
      doc.getElementById('night-revive-btn').addEventListener('click', function () {
        const val = doc.getElementById('night-revive-select').value;
        if (val !== '') revivePlayer(Number(val));
      });
      return;
    }

    if (step.roleId === 'minstrel') {
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Minion executed today:</strong> Every other player is Drunk until dusk tomorrow.</div>' +
        '<button type="button" id="night-minstrel-drunk-btn" class="btn-secondary night-show-btn">Mark All Other Players Drunk</button>';
      doc.getElementById('night-minstrel-drunk-btn').addEventListener('click', function () {
        state.players.forEach(function (p, i) {
          if (i !== step.playerIdx) {
            p.drunk = true;
          }
        });
        persistAll();
        renderAll();
      });
      return;
    }

    if (step.roleId === 'chambermaid') {
      const wokeList = state.players.filter(function (p) { return p.alive && p.wokeTonight; });
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Alive Players Marked "Woke Tonight":</strong></div>' +
        '<div class="action-helper-sub">' +
        (wokeList.length > 0
          ? wokeList.map(function (p) { return '#' + p.seat + ' ' + escapeHtml(p.name); }).join(', ')
          : 'None recorded yet (players are auto-marked as you step through Tonight\'s Wake Order).') +
        '</div>';
      return;
    }

    // ── Sects & Violets Specifics ──
    if (step.roleId === 'philosopher') {
      const scriptDetails = getScriptDetails();
      const goodChars = scriptDetails && Array.isArray(scriptDetails.characters)
        ? scriptDetails.characters.filter(function (c) { return c.team === 'townsfolk' || c.team === 'outsiders'; })
        : [];
      const opts = '<option value="">Select Good character ability to gain...</option>' +
        goodChars.map(function (c) {
          const inPlay = state.players.some(function (p) { return p.roleId === c.id; });
          return '<option value="' + c.id + '">' + escapeHtml(c.name) + (inPlay ? ' [In Play - Will Become Drunk]' : '') + '</option>';
        }).join('');

      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Philosopher (Once per game):</strong> Choose a Good character to gain that ability. If in play, that player becomes Drunk.</div>' +
        '<div class="pm-inline-control">' +
        '  <select id="night-philo-select" class="grim-select">' + opts + '</select>' +
        '  <button type="button" id="night-philo-btn" class="btn-secondary pm-small-btn">Apply</button>' +
        '</div>' +
        '<div id="night-philo-result" class="action-helper-sub"></div>';

      doc.getElementById('night-philo-btn').addEventListener('click', function () {
        const val = doc.getElementById('night-philo-select').value;
        const resEl = doc.getElementById('night-philo-result');
        if (!val) return;
        const duplicate = state.players.find(function (p) { return p.roleId === val; });
        if (duplicate) {
          duplicate.drunk = true;
          persistAll();
          renderAll();
          resEl.textContent = 'Duplicate in play: #' + duplicate.seat + ' ' + duplicate.name + ' is now DRUNK.';
        } else {
          resEl.textContent = 'Character is not in play. Philosopher gains the ability.';
        }
      });
      return;
    }

    if (step.roleId === 'snake-charmer') {
      const aliveOpts = buildPlayerOptions(function (p, i) {
        return p.alive && i !== step.playerIdx;
      }, 'Select chosen alive player...');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Snake Charmer:</strong> Chooses an alive player. If Demon, they swap characters &amp; alignments, and the new Demon is poisoned.</div>' +
        '<div class="pm-inline-control">' +
        '  <select id="night-sc-select" class="grim-select">' + aliveOpts + '</select>' +
        '  <button type="button" id="night-sc-check-btn" class="btn-secondary pm-small-btn">Check</button>' +
        '</div>' +
        '<div id="night-sc-result" class="action-helper-sub"></div>';

      doc.getElementById('night-sc-check-btn').addEventListener('click', function () {
        const val = doc.getElementById('night-sc-select').value;
        const resEl = doc.getElementById('night-sc-result');
        if (val === '') {
          resEl.textContent = 'Please select a player.';
          return;
        }
        const chosen = state.players[Number(val)];
        const chosenChar = getChar(chosen.roleId);
        const scPlayer = step.player;
        if (chosenChar && chosenChar.team === 'demon') {
          resEl.innerHTML =
            '<span style="color: var(--color-crimson, #e57373); font-weight: bold;">Demon Chosen! (' + escapeHtml(chosen.name) + ' is ' + escapeHtml(chosenChar.name) + ')</span><br>' +
            '<button type="button" id="night-sc-swap-btn" class="mini-action-btn" style="margin-top: 4px;">Execute Swap &amp; Poison New Demon</button>';
          doc.getElementById('night-sc-swap-btn').addEventListener('click', function () {
            const scRole = scPlayer.roleId;
            const demonRole = chosen.roleId;
            scPlayer.roleId = demonRole;
            scPlayer.alignmentOverride = 'evil';
            scPlayer.poisoned = true;
            chosen.roleId = scRole;
            chosen.alignmentOverride = 'good';
            persistAll();
            renderAll();
          });
        } else {
          resEl.textContent = 'Not a Demon (or healthy/poisoned snake charmer): Shake head NO. Nothing happens.';
        }
      });
      return;
    }

    if (step.roleId === 'evil-twin') {
      els.nightStepActionBox.hidden = false;
      const goodTwinIdx = state.players.findIndex(function (p) { return p.goodTwin; });
      const goodTwin = goodTwinIdx !== -1 ? state.players[goodTwinIdx] : null;
      const goodTwinChar = goodTwin ? getChar(goodTwin.roleId) : null;

      const goodOptions =
        '<option value="-1">' + (goodTwin ? 'Change Good Twin...' : 'Designate Good Twin...') + '</option>' +
        state.players.map(function (p, i) {
          if (i === step.playerIdx) return '';
          const c = getChar(p.roleId);
          const isGood = !isPlayerEvil(p);
          const roleDesc = c ? c.name : p.roleId;
          return '<option value="' + i + '"' + (i === goodTwinIdx ? ' selected' : '') + '>' +
            '#' + p.seat + ' ' + escapeHtml(p.name) + ' (' + escapeHtml(roleDesc) + ')' +
            (isGood ? '' : ' [Evil]') +
            '</option>';
        }).join('');

      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Evil Twin Pair:</strong> Wake Evil Twin &amp; Good Twin together to make eye contact.</div>' +
        (goodTwin
          ? '<div class="action-helper-line"><strong>Good Twin:</strong> #' + goodTwin.seat + ' ' + escapeHtml(goodTwin.name) + ' (' + escapeHtml(goodTwinChar ? goodTwinChar.name : goodTwin.roleId) + ')</div>'
          : '<div class="action-helper-sub">No Good Twin designated yet. Select the Good Twin below:</div>') +
        '<div class="pm-inline-control">' +
        '  <select id="night-goodtwin-select" class="grim-select">' + goodOptions + '</select>' +
        '</div>' +
        '<div class="bluffs-card-actions" style="margin-top: 8px; display: flex; flex-direction: column; gap: 6px;">' +
        '  <button type="button" id="night-show-to-evil-twin-btn" class="btn-secondary night-show-btn"' + (goodTwin ? '' : ' disabled') + '>' +
        '    1. Show ' + (goodTwinChar ? escapeHtml(goodTwinChar.name) : 'Good Character') + ' to Evil Twin' +
        '  </button>' +
        '  <button type="button" id="night-show-to-good-twin-btn" class="btn-secondary night-show-btn">' +
        '    2. Show Evil Twin Token to Good Twin' +
        '  </button>' +
        '</div>';

      doc.getElementById('night-goodtwin-select').addEventListener('change', function (e) {
        const val = Number(e.target.value);
        state.players.forEach(function (p, i) {
          p.goodTwin = (val >= 0 && i === val);
        });
        persistAll();
        renderAll();
      });

      const showToEvilBtn = doc.getElementById('night-show-to-evil-twin-btn');
      if (showToEvilBtn && goodTwin) {
        showToEvilBtn.addEventListener('click', function () {
          launchShowOverlay([goodTwin.roleId], 'Your Good Twin is');
        });
      }

      doc.getElementById('night-show-to-good-twin-btn').addEventListener('click', function () {
        launchShowOverlay(['evil-twin'], 'Your Evil Twin is');
      });

      return;
    }

    if (step.roleId === 'clockmaker') {
      const dist = computeClockmakerDistance();
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Shortest Demon → Minion Steps:</strong> <span class="helper-highlight">' +
        (dist !== null ? dist : 'N/A') +
        '</span></div>' +
        (hasAliveRole('vortox')
          ? '<div class="action-helper-sub">VORTOX ACTIVE: Show any number EXCEPT ' + dist + '!</div>'
          : '');
      return;
    }

    if (step.roleId === 'oracle') {
      const deadEvil = computeOracleEvilDead();
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Dead Evil Players:</strong> <span class="helper-highlight">' + deadEvil + '</span></div>' +
        (hasAliveRole('vortox')
          ? '<div class="action-helper-sub">VORTOX ACTIVE: Show any number EXCEPT ' + deadEvil + '!</div>'
          : '');
      return;
    }

    if (step.roleId === 'flowergirl') {
      const voted = state.game.demonVotedToday;
      const vortox = hasAliveRole('vortox');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Demon Voted Today:</strong> <span class="helper-highlight">' + (voted ? 'YES' : 'NO') + '</span></div>' +
        (vortox ? '<div class="action-helper-sub">VORTOX ACTIVE: Show ' + (voted ? 'NO' : 'YES') + ' instead!</div>' : '');
      return;
    }

    if (step.roleId === 'town-crier') {
      const nom = state.game.minionNominatedToday;
      const vortox = hasAliveRole('vortox');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-line"><strong>Minion Nominated Today:</strong> <span class="helper-highlight">' + (nom ? 'YES' : 'NO') + '</span></div>' +
        (vortox ? '<div class="action-helper-sub">VORTOX ACTIVE: Show ' + (nom ? 'NO' : 'YES') + ' instead!</div>' : '');
      return;
    }

    if (step.roleId === 'witch') {
      const currentIdx = state.players.findIndex(function (p) { return p.cursed; });
      const optionsHtml =
        '<option value="-1">No one cursed</option>' +
        state.players.map(function (p, i) {
          return '<option value="' + i + '"' + (i === currentIdx ? ' selected' : '') + '>#' + p.seat + ' ' + escapeHtml(p.name) + '</option>';
        }).join('');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-witch-select">Place Witch Curse On:</label>' +
        '<select id="night-witch-select" class="grim-select">' + optionsHtml + '</select>';
      doc.getElementById('night-witch-select').addEventListener('change', function (e) {
        setSingleMarker('cursed', Number(e.target.value));
      });
      return;
    }

    if (step.roleId === 'cerenovus') {
      const currentIdx = state.players.findIndex(function (p) { return p.mad; });
      const optionsHtml =
        '<option value="-1">No one Mad</option>' +
        state.players.map(function (p, i) {
          return '<option value="' + i + '"' + (i === currentIdx ? ' selected' : '') + '>#' + p.seat + ' ' + escapeHtml(p.name) + '</option>';
        }).join('');
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<label class="action-helper-label" for="night-mad-select">Place Mad Marker On:</label>' +
        '<select id="night-mad-select" class="grim-select">' + optionsHtml + '</select>' +
        '<button type="button" id="night-open-show-btn" class="btn-secondary night-show-btn">Show Cerenovus + Good Role...</button>';
      doc.getElementById('night-mad-select').addEventListener('change', function (e) {
        setSingleMarker('mad', Number(e.target.value));
      });
      doc.getElementById('night-open-show-btn').addEventListener('click', function () {
        openShowPicker({ presetBanner: 'You are Mad that you are', presetRoles: ['cerenovus'] });
      });
      return;
    }

    if (step.roleId === 'pit-hag') {
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        '<div class="action-helper-sub">Tap the target player on the Grimoire circle to change their character, then show them their new role:</div>' +
        '<button type="button" id="night-open-show-btn" class="btn-secondary night-show-btn">Show "You Are..." Role Card</button>';
      doc.getElementById('night-open-show-btn').addEventListener('click', function () {
        openShowPicker({ presetBanner: 'You are', presetRoles: [] });
      });
      return;
    }

    // ── Demons & Night Killers (TB Imp, BMR Demons/Killers, S&V Demons) ──
    if (step.roleId === 'pukka') {
      const prevPoisonedIdx = state.players.findIndex(function (p) { return p.poisoned; });
      const optionsHtml =
        '<option value="-1">Select new player to poison...</option>' +
        state.players.map(function (p, i) {
          return '<option value="' + i + '">#' + p.seat + ' ' + escapeHtml(p.name) + (p.poisoned ? ' [Currently Poisoned]' : '') + '</option>';
        }).join('');
      const lunaticHint = state.game.lunaticTarget
        ? '<div class="action-helper-line"><strong>Lunatic chose:</strong> ' + escapeHtml(state.game.lunaticTarget) + '</div>'
        : '';
      els.nightStepActionBox.hidden = false;
      els.nightStepActionBox.innerHTML =
        lunaticHint +
        (prevPoisonedIdx !== -1 && state.game.dayNumber > 1
          ? '<div class="action-helper-line"><strong>Previously Poisoned:</strong> #' + state.players[prevPoisonedIdx].seat + ' ' + escapeHtml(state.players[prevPoisonedIdx].name) + ' <button type="button" id="pukka-kill-prev-btn" class="mini-action-btn">Kill &amp; Cure</button></div>'
          : '') +
        '<label class="action-helper-label" for="night-pukka-select">Poison New Player Tonight:</label>' +
        '<select id="night-pukka-select" class="grim-select">' + optionsHtml + '</select>';

      const killPrevBtn = doc.getElementById('pukka-kill-prev-btn');
      if (killPrevBtn) {
        killPrevBtn.addEventListener('click', function () {
          const prev = state.players[prevPoisonedIdx];
          if (prev) {
            prev.poisoned = false;
            killPlayerTonight(prevPoisonedIdx);
          }
        });
      }
      doc.getElementById('night-pukka-select').addEventListener('change', function (e) {
        const val = Number(e.target.value);
        if (val >= 0) {
          state.players[val].poisoned = true;
          persistAll();
          renderAll();
        }
      });
      return;
    }

    if (step.roleId === 'po') {
      const lunaticHint = state.game.lunaticTarget
        ? '<div class="action-helper-line"><strong>Lunatic chose:</strong> ' + escapeHtml(state.game.lunaticTarget) + '</div>'
        : '';
      const chargeHtml =
        lunaticHint +
        '<div class="action-helper-head">' +
        '  <strong>Po Charge Status: ' + (state.game.poCharged ? 'CHARGED (3 Kills Tonight!)' : 'Standard (1 Kill or Charge)') + '</strong>' +
        '  <button type="button" id="po-charge-btn" class="mini-action-btn">' + (state.game.poCharged ? 'Clear Charge' : 'Charge (0 Kills)') + '</button>' +
        '</div>';
      renderQuickKillWidget('Record Po Kill(s):', chargeHtml);
      const chargeBtn = doc.getElementById('po-charge-btn');
      if (chargeBtn) {
        chargeBtn.addEventListener('click', function () {
          state.game.poCharged = !state.game.poCharged;
          persistAll();
          renderAll();
        });
      }
      return;
    }

    if (step.roleId === 'shabaloth') {
      const lunaticHint = state.game.lunaticTarget
        ? '<div class="action-helper-line"><strong>Lunatic chose:</strong> ' + escapeHtml(state.game.lunaticTarget) + '</div>'
        : '';
      renderQuickKillWidget('Record Shabaloth Kills (Pick 2):', lunaticHint);
      return;
    }

    if (step.roleId === 'no-dashii' && step.playerIdx !== null) {
      const tfNeighbors = computeNoDashiiTownsfolkNeighbors(step.playerIdx);
      const aliveNeighbors = computeAliveNeighbors(step.playerIdx);

      const cwPlayer = tfNeighbors.cw;
      const ccwPlayer = tfNeighbors.ccw;
      const cwChar = cwPlayer ? getChar(cwPlayer.roleId) : null;
      const ccwChar = ccwPlayer ? getChar(ccwPlayer.roleId) : null;

      const cwDesc = cwPlayer
        ? '#' + cwPlayer.seat + ' ' + escapeHtml(cwPlayer.name) + ' (' + escapeHtml(cwChar ? cwChar.name : cwPlayer.roleId) + ', ' + (cwPlayer.alive ? 'Alive' : 'Dead') + ') ' + (cwPlayer.poisoned ? '<span class="step-flag step-flag--drunk">POISONED</span>' : '[Healthy]')
        : 'None';
      const ccwDesc = ccwPlayer
        ? '#' + ccwPlayer.seat + ' ' + escapeHtml(ccwPlayer.name) + ' (' + escapeHtml(ccwChar ? ccwChar.name : ccwPlayer.roleId) + ', ' + (ccwPlayer.alive ? 'Alive' : 'Dead') + ') ' + (ccwPlayer.poisoned ? '<span class="step-flag step-flag--drunk">POISONED</span>' : '[Healthy]')
        : 'None';

      const aliveCwDesc = aliveNeighbors.cw ? '#' + aliveNeighbors.cw.seat + ' ' + escapeHtml(aliveNeighbors.cw.name) : 'None';
      const aliveCcwDesc = aliveNeighbors.ccw ? '#' + aliveNeighbors.ccw.seat + ' ' + escapeHtml(aliveNeighbors.ccw.name) : 'None';

      const bothPoisoned = Boolean((!cwPlayer || cwPlayer.poisoned) && (!ccwPlayer || ccwPlayer.poisoned));

      const hint =
        '<div class="action-helper-line"><strong>Townsfolk Neighbors (Poisoned by Rule):</strong></div>' +
        '<div class="action-helper-sub" style="margin-left: 8px;">• CW: ' + cwDesc + '<br>• CCW: ' + ccwDesc + '</div>' +
        '<div class="action-helper-line" style="font-size: 0.82rem; opacity: 0.85;">(Closest Alive Neighbors: ' + aliveCwDesc + ' &amp; ' + aliveCcwDesc + ')</div>' +
        '<div class="action-helper-sub" style="font-style: italic; margin-top: 4px;">Official Rule: No Dashii poisons its 2 closest Townsfolk neighbors (CW and CCW) regardless of alive/dead status; if a poisoned Townsfolk dies, poison remains and does not jump. If No Dashii dies, both are cured.</div>' +
        '<div class="bluffs-card-actions" style="margin: 6px 0 10px 0; display: flex; gap: 8px;">' +
        '  <button type="button" id="apply-nodashii-poison-btn" class="mini-action-btn' + (bothPoisoned ? ' is-active' : '') + '">' +
        (bothPoisoned ? 'Re-Apply Poison' : 'Apply Poison to Townsfolk Neighbors') +
        '  </button>' +
        '  <button type="button" id="clear-nodashii-poison-btn" class="mini-action-btn mini-action-btn--muted">Clear Neighbor Poison</button>' +
        '</div>';

      renderQuickKillWidget('Record No Dashii Kill:', hint);

      const applyBtn = doc.getElementById('apply-nodashii-poison-btn');
      if (applyBtn) {
        applyBtn.addEventListener('click', function () {
          if (cwPlayer) cwPlayer.poisoned = true;
          if (ccwPlayer) ccwPlayer.poisoned = true;
          persistAll();
          renderAll();
        });
      }
      const clearBtn = doc.getElementById('clear-nodashii-poison-btn');
      if (clearBtn) {
        clearBtn.addEventListener('click', function () {
          if (cwPlayer) cwPlayer.poisoned = false;
          if (ccwPlayer) ccwPlayer.poisoned = false;
          persistAll();
          renderAll();
        });
      }
      return;
    }

    if (step.roleId === 'vortox') {
      const hint =
        '<div class="action-helper-line"><strong>VORTOX ACTIVE:</strong> All Townsfolk must receive strictly FALSE info!</div>';
      renderQuickKillWidget('Record Vortox Kill:', hint);
      return;
    }

    if (
      step.roleId === 'imp' ||
      step.roleId === 'zombuul' ||
      step.roleId === 'fang-gu' ||
      step.roleId === 'vigormortis' ||
      step.roleId === 'gambler' ||
      step.roleId === 'assassin' ||
      step.roleId === 'gossip' ||
      step.roleId === 'tinker' ||
      step.roleId === 'moonchild'
    ) {
      const lunaticHint =
        step.roleId === 'zombuul' && state.game.lunaticTarget
          ? '<div class="action-helper-line"><strong>Lunatic chose:</strong> ' + escapeHtml(state.game.lunaticTarget) + '</div>'
          : '';
      renderQuickKillWidget('Record Night Kill (' + step.name + '):', lunaticHint);
    }
  }

  function renderNightGuide() {
    const steps = buildActiveNightSteps();
    els.nightChecklist.innerHTML = '';

    if (steps.length === 0) {
      els.nightStepCounter.textContent = 'No Active Night Steps';
      els.nightStepFlags.innerHTML = '';
      els.nightStepTitle.textContent = 'Night Complete';
      els.nightStepPlayer.textContent = '';
      els.nightStepInstruction.textContent =
        'No characters need to wake tonight. Tap Dawn to start the next day.';
      els.nightStepActionBox.hidden = true;
      els.nightPrevBtn.disabled = true;
      els.nightNextBtn.disabled = true;
      return;
    }

    if (state.game.nightStepIndex >= steps.length) {
      state.game.nightStepIndex = steps.length - 1;
    }
    const idx = state.game.nightStepIndex;
    const step = steps[idx];

    els.nightStepCounter.textContent = 'Step ' + (idx + 1) + ' of ' + steps.length;
    els.nightStepTitle.textContent = step.name;

    const flags = [];
    if (step.isDrunk) {
      flags.push('<span class="step-flag step-flag--drunk">DRUNK</span>');
    }
    if (step.isLunatic) {
      flags.push('<span class="step-flag step-flag--drunk">LUNATIC</span>');
    }
    if (step.isVigorKept) {
      flags.push('<span class="step-flag step-flag--poison">DEAD (VIGORMORTIS)</span>');
    }
    if (step.player && step.player.poisoned) {
      flags.push('<span class="step-flag step-flag--poison">POISONED</span>');
    }
    if (step.player && step.player.mad) {
      flags.push('<span class="step-flag step-flag--mad">MAD</span>');
    }
    if (step.player && step.player.cursed) {
      flags.push('<span class="step-flag step-flag--cursed">CURSED</span>');
    }
    els.nightStepFlags.innerHTML = flags.join('');

    if (step.player) {
      els.nightStepPlayer.textContent =
        'Wake Seat #' + step.player.seat + ' · ' + step.player.name;
      els.nightStepPlayer.hidden = false;
    } else {
      els.nightStepPlayer.textContent = '';
      els.nightStepPlayer.hidden = true;
    }

    let instruction = step.note;
    if (step.isDrunk) {
      instruction +=
        ' (Remember: this player is Drunk—their ability has no effect and the Storyteller may give false information.)';
    } else if (step.player && step.player.poisoned) {
      instruction +=
        ' (Remember: this player is Poisoned—their ability has no effect tonight.)';
    }
    els.nightStepInstruction.textContent = instruction;

    renderNightActionWidget(step);

    els.nightPrevBtn.disabled = idx === 0;
    els.nightNextBtn.disabled = false;
    els.nightNextBtnText.textContent =
      idx === steps.length - 1 ? 'Finish Night · Dawn →' : 'Next Step →';

    steps.forEach(function (s, i) {
      const isDone = state.game.completedSteps.indexOf(s.stepId) !== -1;
      const isCurrent = i === idx;
      const li = doc.createElement('li');
      li.className = 'checklist-item';
      if (isCurrent) li.classList.add('is-current');
      if (isDone) li.classList.add('is-done');

      const tag = s.isDrunk
        ? ' <span class="mini-tag mini-tag--drunk">Drunk</span>'
        : s.isLunatic
          ? ' <span class="mini-tag mini-tag--drunk">Lunatic</span>'
          : s.player && s.player.poisoned
            ? ' <span class="mini-tag mini-tag--poison">Poisoned</span>'
            : '';

      li.innerHTML =
        '<button type="button" class="checklist-btn">' +
        '  <span class="checklist-num">' + (isDone ? '✓' : i + 1) + '</span>' +
        '  <span class="checklist-name">' + escapeHtml(s.name) + tag + '</span>' +
        '  <span class="checklist-player">' + (s.player ? escapeHtml(s.player.name) : 'Setup') + '</span>' +
        '</button>';

      li.querySelector('button').addEventListener('click', function () {
        state.game.nightStepIndex = i;
        persistAll();
        renderAll();
      });

      els.nightChecklist.appendChild(li);
    });
  }

  // ── Script-Specialized Day Phase Panel ─────────────────────────────────

  function renderDayTrackers() {
    els.dayTrackersBody.innerHTML = '';

    if (state.scriptId === 'sects-and-violets') {
      const hasVortox = hasAliveRole('vortox');
      const hasFG = hasAliveRole('flowergirl');
      const hasTC = hasAliveRole('town-crier');

      if (!hasVortox && !hasFG && !hasTC) {
        els.dayTrackersCard.hidden = true;
        return;
      }

      els.dayTrackersCard.hidden = false;
      els.dayTrackersTitle.textContent = 'Sects & Violets Day Trackers';

      let html = '';
      if (hasVortox) {
        html +=
          '<p class="inline-notice">Vortox is alive: If no one is executed today, Evil wins immediately! All Townsfolk info is strictly false.</p>';
      }
      html += '<div class="day-tracker-toggles">';
      if (hasFG) {
        html +=
          '<button type="button" id="track-demon-voted" class="pm-toggle-btn ' +
          (state.game.demonVotedToday ? 'is-active-danger' : '') +
          '"><span class="pm-toggle-title">Flowergirl</span><span class="pm-toggle-state">Demon Voted: ' +
          (state.game.demonVotedToday ? 'YES' : 'No') +
          '</span></button>';
      }
      if (hasTC) {
        html +=
          '<button type="button" id="track-minion-nom" class="pm-toggle-btn ' +
          (state.game.minionNominatedToday ? 'is-active-danger' : '') +
          '"><span class="pm-toggle-title">Town Crier</span><span class="pm-toggle-state">Minion Nominated: ' +
          (state.game.minionNominatedToday ? 'YES' : 'No') +
          '</span></button>';
      }
      html += '</div>';
      els.dayTrackersBody.innerHTML = html;

      const fgBtn = doc.getElementById('track-demon-voted');
      if (fgBtn) {
        fgBtn.addEventListener('click', function () {
          state.game.demonVotedToday = !state.game.demonVotedToday;
          persistAll();
          renderDayTrackers();
        });
      }
      const tcBtn = doc.getElementById('track-minion-nom');
      if (tcBtn) {
        tcBtn.addEventListener('click', function () {
          state.game.minionNominatedToday = !state.game.minionNominatedToday;
          persistAll();
          renderDayTrackers();
        });
      }
      return;
    }

    if (state.scriptId === 'bad-moon-rising') {
      const hasZombuul = hasActualRoleInPlay('zombuul');
      const hasGodfather = hasAliveRole('godfather');
      const hasMinstrel = hasAliveRole('minstrel');

      if (!hasZombuul && !hasGodfather && !hasMinstrel) {
        els.dayTrackersCard.hidden = true;
        return;
      }

      els.dayTrackersCard.hidden = false;
      els.dayTrackersTitle.textContent = 'Bad Moon Rising Day Trackers';

      let html = '<div class="day-tracker-toggles">';
      if (hasZombuul) {
        html +=
          '<button type="button" id="track-died-today" class="pm-toggle-btn ' +
          (state.game.someoneDiedToday ? 'is-active-danger' : '') +
          '"><span class="pm-toggle-title">Zombuul Check</span><span class="pm-toggle-state">Died Today: ' +
          (state.game.someoneDiedToday ? 'YES' : 'No') +
          '</span></button>';
      }
      if (hasGodfather) {
        html +=
          '<button type="button" id="track-outsider-died" class="pm-toggle-btn ' +
          (state.game.outsiderDiedToday ? 'is-active-danger' : '') +
          '"><span class="pm-toggle-title">Godfather Check</span><span class="pm-toggle-state">Outsider Died: ' +
          (state.game.outsiderDiedToday ? 'YES' : 'No') +
          '</span></button>';
      }
      if (hasMinstrel) {
        html +=
          '<button type="button" id="track-minion-exec" class="pm-toggle-btn ' +
          (state.game.minionExecutedToday ? 'is-active-gold' : '') +
          '"><span class="pm-toggle-title">Minstrel Check</span><span class="pm-toggle-state">Minion Executed: ' +
          (state.game.minionExecutedToday ? 'YES' : 'No') +
          '</span></button>';
      }
      html += '</div>';
      els.dayTrackersBody.innerHTML = html;

      const zBtn = doc.getElementById('track-died-today');
      if (zBtn) {
        zBtn.addEventListener('click', function () {
          state.game.someoneDiedToday = !state.game.someoneDiedToday;
          persistAll();
          renderDayTrackers();
        });
      }
      const gfBtn = doc.getElementById('track-outsider-died');
      if (gfBtn) {
        gfBtn.addEventListener('click', function () {
          state.game.outsiderDiedToday = !state.game.outsiderDiedToday;
          persistAll();
          renderDayTrackers();
        });
      }
      const mBtn = doc.getElementById('track-minion-exec');
      if (mBtn) {
        mBtn.addEventListener('click', function () {
          state.game.minionExecutedToday = !state.game.minionExecutedToday;
          persistAll();
          renderDayTrackers();
        });
      }
      return;
    }

    els.dayTrackersCard.hidden = true;
  }

  function renderDayGuide() {
    const stats = getTownStats();
    els.dayAliveCount.textContent = String(stats.alive);
    els.dayMajorityCount.textContent = String(stats.majority);
    els.dayGhostCount.textContent = String(stats.ghostVotes);

    if (state.game.killedTonight.length > 0) {
      els.dayDawnReport.textContent =
        'Died during Night ' +
        state.game.dayNumber +
        ': ' +
        state.game.killedTonight.join(', ') +
        '.';
    } else {
      els.dayDawnReport.textContent =
        state.game.dayNumber === 1
          ? 'Night 1 has ended. No one died overnight.'
          : 'A peaceful night—no one died during Night ' + state.game.dayNumber + '.';
    }

    const executedPlayer = state.players.find(function (p) {
      return !p.alive && p.executedToday;
    });
    if (executedPlayer) {
      const c = getChar(executedPlayer.roleId);
      els.dayExecutedStatus.textContent =
        'Executed today: #' +
        executedPlayer.seat +
        ' ' +
        executedPlayer.name +
        ' (' +
        (c ? c.name : executedPlayer.roleId) +
        ').';
    } else {
      els.dayExecutedStatus.textContent = 'No execution recorded today.';
    }

    const hasLivingDemon = state.players.some(function (p) {
      const c = getChar(p.roleId);
      return c && c.team === 'demon' && p.alive;
    });
    if (stats.alive <= 2 && hasLivingDemon) {
      els.dayExecutedStatus.textContent +=
        ' · Note: Only ' + stats.alive + ' players alive with Demon living—Evil wins unless special win abilities apply!';
    }

    els.dayExecSelect.innerHTML = buildPlayerOptions(
      null,
      'Select player to execute...',
      function (p) {
        const tags = [];
        if (p.zombuulFakeDead && p.alive) tags.push('Zombuul Fake-Dead — 2nd Exec Kills');
        else if (!p.alive) tags.push('Dead');
        if (p.daProtected) tags.push('DA Exec-Safe');
        if (isTeaLadyProtected(p)) tags.push('Tea Lady Safe');
        if (p.roleId === 'sailor') tags.push('Sailor');
        if (p.roleId === 'fool') tags.push('Fool');
        if (p.roleId === 'saint') tags.push('Saint');
        return tags;
      }
    );

    renderDayTrackers();

    // Script-aware Active Day Abilities
    const dayRoleIds = [
      'virgin', 'slayer',
      'gossip', 'pacifist', 'tea-lady', 'mastermind',
      'savant', 'artist', 'mutant', 'klutz', 'evil-twin'
    ];
    const daySpecials = state.players.filter(function (p) {
      if (!p.alive) return false;
      if (dayRoleIds.indexOf(p.roleId) !== -1) return true;
      if (p.roleId === 'mayor' && stats.alive === 3) return true;
      if (p.roleId === 'juggler' && state.game.dayNumber === 1) return true;
      return false;
    });

    if (daySpecials.length > 0) {
      els.daySpecialsCard.hidden = false;
      els.daySpecialsList.innerHTML = daySpecials
        .map(function (p) {
          const c = getChar(p.roleId);
          let extra = '';
          if (p.roleId === 'tea-lady') {
            const tlIdx = state.players.indexOf(p);
            const info = computeAliveNeighbors(tlIdx);
            const active = p.alive && !p.drunk && !p.poisoned && info.cw && info.ccw && info.evilCount === 0;
            if (active) {
              extra = '<div class="action-helper-sub" style="color: var(--color-safe, #81c784); font-weight: bold; margin-top: 4px;">PROTECTION ACTIVE: Both alive neighbors (#' + info.cw.seat + ' ' + escapeHtml(info.cw.name) + ' &amp; #' + info.ccw.seat + ' ' + escapeHtml(info.ccw.name) + ') are Good and CANNOT DIE!</div>';
            } else if (p.drunk || p.poisoned) {
              extra = '<div class="action-helper-sub" style="color: var(--color-muted); margin-top: 4px;">Protection Inactive (Tea Lady is Drunk/Poisoned).</div>';
            } else {
              extra = '<div class="action-helper-sub" style="color: var(--color-muted); margin-top: 4px;">Protection Inactive: Alive neighbors are not both Good (' + info.evilCount + ' Evil/Misregistering neighbor).</div>';
            }
          }
          return (
            '<div class="day-special-item">' +
            '  <strong>#' + p.seat + ' ' + escapeHtml(p.name) + ' (' + escapeHtml(c ? c.name : p.roleId) + ')</strong>' +
            '  <span>' + escapeHtml(c ? c.ability : '') + '</span>' +
            extra +
            '</div>'
          );
        })
        .join('');
    } else {
      els.daySpecialsCard.hidden = true;
    }
  }

  function renderGuidePanel() {
    const isNight = state.game.phase === 'night';
    els.nightView.hidden = !isNight;
    els.dayView.hidden = isNight;

    if (isNight) {
      renderNightGuide();
    } else {
      renderDayGuide();
    }
  }

  // ── Phase Transitions ──────────────────────────────────────────────────

  function advancePhase() {
    els.dayExecAlert.hidden = true;

    if (state.game.phase === 'night') {
      // Night N -> Day N
      state.game.phase = 'day';
      state.game.demonVotedToday = false;
      state.game.minionNominatedToday = false;
      state.game.someoneDiedToday = false;
      state.game.outsiderDiedToday = false;
      state.game.minionExecutedToday = false;
      state.players.forEach(function (p) {
        p.executedToday = false;
      });
    } else {
      // Day N -> Night N+1
      state.game.phase = 'night';
      state.game.dayNumber += 1;
      state.game.nightStepIndex = 0;
      state.game.completedSteps = [];
      state.game.killedTonight = [];
      state.game.lunaticTarget = '';
      state.players.forEach(function (p) {
        p.diedTonight = false;
        p.protectedByMonk = false;
        p.daProtected = false;
        p.mad = false;
        p.cursed = false;
        p.wokeTonight = false;
        if (state.scriptId === 'trouble-brewing') {
          p.poisoned = false;
        }
      });
    }

    persistAll();
    renderAll();
  }

  function stepBackPhase() {
    els.dayExecAlert.hidden = true;
    if (state.game.phase === 'day') {
      state.game.phase = 'night';
      state.game.nightStepIndex = 0;
    } else if (state.game.dayNumber > 1) {
      state.game.phase = 'day';
      state.game.dayNumber -= 1;
    }
    persistAll();
    renderAll();
  }

  function handleDayExecution() {
    const val = els.dayExecSelect.value;
    if (val === '') return;
    const idx = Number(val);
    const target = state.players[idx];
    if (!target) return;

    const aliveBefore = getTownStats().alive;
    const char = getChar(target.roleId);
    let alertMsg = '';

    // Check Devil's Advocate execution survival first
    if (target.daProtected) {
      alertMsg =
        '#' + target.seat + ' ' + target.name + ' is protected by the Devil\'s Advocate and survives execution!';
      els.dayExecAlert.textContent = alertMsg;
      els.dayExecAlert.hidden = false;
      return;
    }

    // Zombuul's 1st death: registers as dead but lives!
    if (target.roleId === 'zombuul' && target.alive && !target.zombuulFakeDead) {
      target.zombuulFakeDead = true;
      state.game.someoneDiedToday = true;
      els.dayExecAlert.textContent =
        'Zombuul executed for the 1st time! They now register as Dead, but remain alive in secret.';
      els.dayExecAlert.hidden = false;
      persistAll();
      renderAll();
      return;
    }

    state.players.forEach(function (p) {
      p.executedToday = false;
    });
    target.alive = false;
    target.zombuulFakeDead = false;
    target.ghostVoteUsed = false;
    target.diedTonight = false;
    target.executedToday = true;
    state.game.someoneDiedToday = true;

    if (char && char.team === 'outsiders') {
      state.game.outsiderDiedToday = true;
    }
    if (char && char.team === 'minions') {
      state.game.minionExecutedToday = true;
    }

    if (target.roleId === 'no-dashii') {
      const ndNeighbors = computeNoDashiiTownsfolkNeighbors(val);
      if (ndNeighbors.cw) ndNeighbors.cw.poisoned = false;
      if (ndNeighbors.ccw) ndNeighbors.ccw.poisoned = false;
    }

    // Script-specific execution triggers & win conditions
    if (isTeaLadyProtected(target)) {
      alertMsg = 'Warning: #' + target.seat + ' ' + target.name + ' was protected by Tea Lady (both alive neighbors are Good) and should not die by execution unless Tea Lady was droisoned!';
    } else if (target.roleId === 'saint' && !target.poisoned && !target.drunk) {
      alertMsg = 'Saint executed while healthy—Evil wins immediately!';
    } else if (target.goodTwin && hasAliveRole('evil-twin')) {
      alertMsg = 'The Good Twin (#' + target.seat + ' ' + target.name + ') was executed while the Evil Twin lives—Evil wins immediately!';
    } else if (target.roleId === 'evil-twin') {
      alertMsg = 'The Evil Twin was executed! Good can now win by executing the Demon.';
    } else if (target.roleId === 'klutz' && !target.poisoned && !target.drunk) {
      alertMsg = 'Klutz died! They must publicly choose 1 alive player (if Evil, Evil wins).';
    } else if (target.roleId === 'moonchild' && !target.poisoned && !target.drunk) {
      alertMsg = 'Moonchild died! They must publicly choose 1 alive player (if Good, they die tonight).';
    } else if (char && char.team === 'minions' && hasAliveRole('minstrel')) {
      alertMsg = 'Minion executed with Minstrel alive—all other players are Drunk until dusk tomorrow!';
    } else if (char && char.team === 'demon') {
      const sw = state.players.find(function (p) {
        return p.roleId === 'scarlet-woman' && p.alive && !p.poisoned && !p.drunk;
      });
      const mm = state.players.find(function (p) {
        return p.roleId === 'mastermind' && p.alive && !p.poisoned && !p.drunk;
      });
      const et = state.players.find(function (p) {
        return p.roleId === 'evil-twin' && p.alive;
      });
      if (sw && aliveBefore >= 5) {
        sw.roleId = 'imp';
        alertMsg = 'Demon executed with ' + aliveBefore + ' alive—Scarlet Woman (#' + sw.seat + ' ' + sw.name + ') is now the Imp!';
      } else if (mm) {
        alertMsg = 'Demon executed with Mastermind alive—play 1 more day! If a player is executed tomorrow, their team loses.';
      } else if (et) {
        alertMsg = 'Demon executed, but Evil Twin (#' + et.seat + ' ' + et.name + ') is still alive—Good cannot win while both twins live!';
      } else {
        alertMsg = 'The Demon was executed—Good wins!';
      }
    } else if (hasAliveRole('evil-twin') && !isPlayerEvil(target)) {
      alertMsg = 'Good player executed with Evil Twin alive. If this was the Good Twin, Evil wins immediately!';
    }

    if (alertMsg) {
      els.dayExecAlert.textContent = alertMsg;
      els.dayExecAlert.hidden = false;
    } else {
      els.dayExecAlert.hidden = true;
    }

    persistAll();
    renderAll();
  }

  // ── Player Inspector Modal ─────────────────────────────────────────────

  function renderPlayerModal() {
    const idx = state.activePlayerIdx;
    if (idx === null || !state.players[idx]) return;
    const p = state.players[idx];
    const char = getChar(p.roleId);
    const believedChar = p.believedRoleId ? getChar(p.believedRoleId) : null;
    const teamInfo = char && TEAM_DISPLAY[char.team] ? TEAM_DISPLAY[char.team] : TEAM_DISPLAY.townsfolk;

    const isTB = state.scriptId === 'trouble-brewing';
    const isBMR = state.scriptId === 'bad-moon-rising';
    const isSV = state.scriptId === 'sects-and-violets';

    els.pmSeatLabel.textContent = 'Seat #' + (idx + 1);
    els.pmPlayerName.textContent = p.name;
    els.pmRoleName.textContent = char ? char.name : p.roleId;
    els.pmTeamPill.textContent = teamInfo.label;

    if ((p.roleId === 'drunk' || p.roleId === 'lunatic') && believedChar) {
      els.pmDrunkCallout.hidden = false;
      els.pmDrunkCallout.textContent = 'Believes they are: ' + believedChar.name;
    } else {
      els.pmDrunkCallout.hidden = true;
    }

    els.pmRoleAbility.textContent = char ? char.ability : '';

    // Core toggles
    els.pmToggleAlive.classList.toggle('is-active-danger', !p.alive);
    els.pmAliveState.textContent = p.alive ? 'Alive (Tap to Mark Dead)' : 'Dead (Tap to Revive)';

    els.pmToggleVote.hidden = p.alive && !p.zombuulFakeDead;
    els.pmToggleVote.classList.toggle('is-active-vote', (!p.alive || p.zombuulFakeDead) && !p.ghostVoteUsed);
    els.pmVoteState.textContent = !p.ghostVoteUsed
      ? '1 Vote Left (Tap to Remove)'
      : 'Vote Used (Tap to Restore)';

    els.pmTogglePoison.classList.toggle('is-active-poison', p.poisoned);
    els.pmPoisonState.textContent = p.poisoned ? 'Poisoned' : 'Healthy';

    // Script-specific toggles
    els.pmToggleDrunk.hidden = isTB;
    els.pmToggleDrunk.classList.toggle('is-active-gold', p.drunk);
    els.pmDrunkState.textContent = p.drunk ? 'Drunk' : 'Sober';

    els.pmToggleMonk.hidden = isSV;
    els.pmMonkTitle.textContent = isBMR ? 'Safe Tonight (Innkeeper)' : 'Monk Safe';
    els.pmToggleMonk.classList.toggle('is-active-safe', p.protectedByMonk);
    els.pmMonkState.textContent = p.protectedByMonk ? 'Protected' : 'Off';

    els.pmToggleDa.hidden = !isBMR;
    els.pmToggleDa.classList.toggle('is-active-safe', p.daProtected);
    els.pmDaState.textContent = p.daProtected ? 'Exec-Safe' : 'Off';

    const hasFT = hasRoleInPlay('fortune-teller');
    els.pmToggleHerring.hidden = !isTB || !hasFT;
    els.pmToggleHerring.classList.toggle('is-active-gold', p.redHerring);
    els.pmHerringState.textContent = p.redHerring ? 'Red Herring' : 'Off';

    els.pmToggleMad.hidden = !isSV;
    els.pmToggleMad.classList.toggle('is-active-gold', p.mad);
    els.pmMadState.textContent = p.mad ? 'Mad' : 'Off';

    els.pmToggleCursed.hidden = !isSV;
    els.pmToggleCursed.classList.toggle('is-active-danger', p.cursed);
    els.pmCursedState.textContent = p.cursed ? 'Cursed' : 'Off';

    const hasET = hasRoleInPlay('evil-twin');
    if (els.pmToggleGoodTwin) {
      els.pmToggleGoodTwin.hidden = !hasET;
      els.pmToggleGoodTwin.classList.toggle('is-active-safe', Boolean(p.goodTwin));
      if (els.pmGoodTwinState) {
        els.pmGoodTwinState.textContent = p.goodTwin ? 'Good Twin' : 'Off';
      }
    }

    const hasGM = hasRoleInPlay('grandmother');
    if (els.pmToggleGrandchild) {
      els.pmToggleGrandchild.hidden = !hasGM;
      els.pmToggleGrandchild.classList.toggle('is-active-safe', Boolean(p.grandchild));
      if (els.pmGrandchildState) {
        els.pmGrandchildState.textContent = p.grandchild ? 'Grandchild' : 'Off';
      }
    }

    els.pmToggleZombuul.hidden = !(isBMR && p.roleId === 'zombuul');
    els.pmToggleZombuul.classList.toggle('is-active-danger', p.zombuulFakeDead);
    els.pmZombuulState.textContent = p.zombuulFakeDead ? 'Fake-Dead' : 'Off';

    els.pmToggleWoke.hidden = !(isBMR && hasRoleInPlay('chambermaid'));
    els.pmToggleWoke.classList.toggle('is-active-gold', p.wokeTonight);
    els.pmWokeState.textContent = p.wokeTonight ? 'Yes' : 'No';

    els.pmToggleAlignment.hidden = isTB;
    els.pmToggleAlignment.classList.toggle('is-active-gold', Boolean(p.alignmentOverride));
    els.pmAlignmentState.textContent = p.alignmentOverride
      ? 'Flipped: ' + p.alignmentOverride.toUpperCase()
      : 'Default (' + (isPlayerEvil(p) ? 'Evil' : 'Good') + ')';

    els.pmToggleDiedTonight.classList.toggle('is-active-danger', Boolean(!p.alive && p.diedTonight));
    els.pmDiedTonightState.textContent = !p.alive && p.diedTonight ? 'Yes (Night Kill)' : 'No';

    els.pmToggleExecuted.classList.toggle('is-active-danger', Boolean(!p.alive && p.executedToday));
    els.pmExecutedState.textContent = !p.alive && p.executedToday ? 'Yes (Executed)' : 'No';

    // Swap Seat dropdown
    els.pmSwapSelect.innerHTML = state.players
      .map(function (other, i) {
        if (i === idx) return '';
        return '<option value="' + i + '">Seat #' + (i + 1) + ' — ' + escapeHtml(other.name) + '</option>';
      })
      .join('');

    // Change Role dropdown
    const details = getScriptDetails();
    if (details && Array.isArray(details.characters)) {
      els.pmRoleSelect.innerHTML = details.characters
        .map(function (c) {
          return '<option value="' + c.id + '"' + (c.id === p.roleId ? ' selected' : '') + '>' + escapeHtml(c.name) + '</option>';
        })
        .join('');
    }
  }

  function openPlayerModal(idx) {
    if (!state.players[idx]) return;
    lastFocusedEl = doc.activeElement;
    state.activePlayerIdx = idx;
    renderPlayerModal();
    els.playerModal.classList.add('is-open');
    els.playerModal.setAttribute('aria-hidden', 'false');
    els.pmCloseBtn.focus();
  }

  function closePlayerModal() {
    els.playerModal.classList.remove('is-open');
    els.playerModal.setAttribute('aria-hidden', 'true');
    state.activePlayerIdx = null;
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function setBoardView(view) {
    state.boardView = view;
    const isCircle = view === 'circle';
    els.viewCircleBtn.classList.toggle('is-active', isCircle);
    els.viewCircleBtn.setAttribute('aria-selected', isCircle ? 'true' : 'false');
    els.viewListBtn.classList.toggle('is-active', !isCircle);
    els.viewListBtn.setAttribute('aria-selected', !isCircle ? 'true' : 'false');
    els.circleStage.hidden = !isCircle;
    els.listStage.hidden = isCircle;
  }

  function renderAll() {
    renderTopChrome();
    renderCircle();
    renderList();
    renderBluffsCard();
    renderGuidePanel();
    if (state.activePlayerIdx !== null) {
      renderPlayerModal();
    }
  }

  // ── Show Role(s) Picker & Full-Screen Opaque Overlay ───────────────────

  function syncBannerPresetHighlight() {
    const val = els.showBannerInput.value;
    els.showBannerPresets.querySelectorAll('[data-banner]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.dataset.banner === val);
    });
  }

  function renderShowPickerGroups() {
    const details = getScriptDetails();
    if (!details || !Array.isArray(details.characters)) return;

    const inPlayMap = {};
    state.players.forEach(function (p) { inPlayMap[p.roleId] = true; });

    const groups = [
      { id: 'townsfolk', label: 'Townsfolk' },
      { id: 'outsiders', label: 'Outsiders' },
      { id: 'minions', label: 'Minions' },
      { id: 'demon', label: 'Demon' }
    ];

    els.showPickerGroups.innerHTML = '';

    groups.forEach(function (g) {
      const chars = details.characters.filter(function (c) { return c.team === g.id; });
      if (!chars.length) return;

      const wrap = doc.createElement('div');
      wrap.className = 'show-picker-group';
      wrap.innerHTML = '<h3 class="roster-summary-heading">' + escapeHtml(g.label) + '</h3>';

      const grid = doc.createElement('div');
      grid.className = 'bluff-picker-grid';

      chars.forEach(function (c) {
        const isSelected = state.showPickerRoles.indexOf(c.id) !== -1;
        const btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = 'bluff-pick-chip show-role-chip--' + c.team;
        if (isSelected) btn.classList.add('is-selected');
        btn.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        btn.innerHTML =
          '<span>' + escapeHtml(c.name) + '</span>' +
          (inPlayMap[c.id] ? '<span class="in-play-dot" title="In play" aria-label="In play"></span>' : '');

        btn.addEventListener('click', function () {
          const idx = state.showPickerRoles.indexOf(c.id);
          if (idx !== -1) state.showPickerRoles.splice(idx, 1);
          else state.showPickerRoles.push(c.id);
          renderShowPickerGroups();
        });

        grid.appendChild(btn);
      });

      wrap.appendChild(grid);
      els.showPickerGroups.appendChild(wrap);
    });

    els.showSelectedCount.textContent = String(state.showPickerRoles.length);
    els.showLaunchBtn.disabled = state.showPickerRoles.length === 0;
    els.showLoadBluffsBtn.disabled =
      state.teensyville || !state.game.bluffs || state.game.bluffs.length === 0;
  }

  function openShowPicker(options) {
    const opts = options || {};
    lastFocusedEl = doc.activeElement;
    state.showPickerBanner = typeof opts.presetBanner === 'string' ? opts.presetBanner : '';
    state.showPickerRoles = Array.isArray(opts.presetRoles) ? opts.presetRoles.slice() : [];

    els.showBannerInput.value = state.showPickerBanner;
    syncBannerPresetHighlight();
    renderShowPickerGroups();

    els.showPickerModal.classList.add('is-open');
    els.showPickerModal.setAttribute('aria-hidden', 'false');
    els.showPickerClose.focus();
  }

  function closeShowPicker() {
    els.showPickerModal.classList.remove('is-open');
    els.showPickerModal.setAttribute('aria-hidden', 'true');
  }

  function launchShowOverlay(roleIds, bannerText) {
    if (!Array.isArray(roleIds) || roleIds.length === 0) return;

    const cleanedBanner = typeof bannerText === 'string' ? bannerText.trim() : '';
    if (cleanedBanner) {
      els.showOverlayBanner.textContent = cleanedBanner;
      els.showOverlayBanner.hidden = false;
    } else {
      els.showOverlayBanner.textContent = '';
      els.showOverlayBanner.hidden = true;
    }

    els.showOverlayCards.innerHTML = '';
    els.showOverlayCards.dataset.count = String(Math.min(roleIds.length, 4));

    roleIds.forEach(function (id) {
      const char = getChar(id);
      if (!char) return;
      const teamInfo = TEAM_DISPLAY[char.team] || TEAM_DISPLAY.townsfolk;
      const card = doc.createElement('article');
      card.className = 'overlay-role-card overlay-role-card--' + char.team;
      card.innerHTML =
        '<span class="reveal-team-pill">' + escapeHtml(teamInfo.label) + '</span>' +
        '<h2 class="overlay-role-name">' + escapeHtml(char.name) + '</h2>';
      els.showOverlayCards.appendChild(card);
    });

    els.showOverlay.hidden = false;
    doc.body.classList.add('is-overlay-open');
    els.showOverlayClose.focus();
  }

  function closeShowOverlay() {
    els.showOverlay.hidden = true;
    els.showOverlayCards.innerHTML = '';
    doc.body.classList.remove('is-overlay-open');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  // ── End Game Modal ─────────────────────────────────────────────────────

  function renderEndGameModal() {
    els.endWinGood.classList.toggle('is-selected', state.endWinner === 'good');
    els.endWinEvil.classList.toggle('is-selected', state.endWinner === 'evil');

    els.endRevealList.innerHTML = '';
    state.players.forEach(function (p) {
      const char = getChar(p.roleId);
      const believed = p.believedRoleId ? getChar(p.believedRoleId) : null;
      const teamClass = char ? 'end-role--' + char.team : 'end-role--townsfolk';
      let roleLabel = char ? char.name : p.roleId;
      if (p.roleId === 'drunk' && believed) {
        roleLabel = 'Drunk (believed ' + believed.name + ')';
      } else if (p.roleId === 'lunatic' && believed) {
        roleLabel = 'Lunatic (believed ' + believed.name + ')';
      }

      const li = doc.createElement('li');
      li.className = 'end-reveal-item';
      li.innerHTML =
        '<span class="end-player-name">' +
        escapeHtml(p.name) +
        (!p.alive ? ' <span class="dead-inline-tag">DEAD</span>' : '') +
        '</span>' +
        '<span class="end-role-badge ' + teamClass + '">' + escapeHtml(roleLabel) + '</span>';
      els.endRevealList.appendChild(li);
    });
  }

  function openEndGameModal() {
    lastFocusedEl = doc.activeElement;
    renderEndGameModal();
    els.endGameModal.classList.add('is-open');
    els.endGameModal.setAttribute('aria-hidden', 'false');
    els.endGameClose.focus();
  }

  function closeEndGameModal() {
    els.endGameModal.classList.remove('is-open');
    els.endGameModal.setAttribute('aria-hidden', 'true');
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  function concludeAndNavigate(targetUrl) {
    Storage.save({
      players: [],
      remainingBag: null,
      drawComplete: false,
      game: null
    });
    global.location.href = targetUrl;
  }

  // ── Event Binding ──────────────────────────────────────────────────────

  function bindEvents() {
    els.viewCircleBtn.addEventListener('click', function () { setBoardView('circle'); });
    els.viewListBtn.addEventListener('click', function () { setBoardView('list'); });

    els.bluffsToggleBtn.addEventListener('click', function () {
      state.bluffsPickerOpen = !state.bluffsPickerOpen;
      renderBluffsCard();
    });

    els.bluffsRandomBtn.addEventListener('click', function () {
      state.game.bluffs = generateBluffs();
      persistAll();
      renderAll();
    });

    els.bluffsClearBtn.addEventListener('click', clearBluffs);

    els.resetGameBtn.addEventListener('click', function () {
      state.players.forEach(function (p) {
        p.alive = true;
        p.ghostVoteUsed = false;
        p.poisoned = false;
        p.drunk = false;
        p.redHerring = false;
        p.protectedByMonk = false;
        p.daProtected = false;
        p.mad = false;
        p.cursed = false;
        p.zombuulFakeDead = false;
        p.alignmentOverride = null;
        p.wokeTonight = false;
        p.diedTonight = false;
        p.executedToday = false;
      });
      state.game = Storage.getDefaultGameState();
      els.dayExecAlert.hidden = true;
      persistAll();
      renderAll();
    });

    els.prevPhaseBtn.addEventListener('click', stepBackPhase);
    els.nextPhaseBtn.addEventListener('click', advancePhase);

    els.nightPrevBtn.addEventListener('click', function () {
      if (state.game.nightStepIndex > 0) {
        state.game.nightStepIndex -= 1;
        persistAll();
        renderAll();
      }
    });

    els.nightNextBtn.addEventListener('click', function () {
      const steps = buildActiveNightSteps();
      if (steps.length === 0) {
        advancePhase();
        return;
      }
      const curr = steps[state.game.nightStepIndex];
      if (curr) {
        if (state.game.completedSteps.indexOf(curr.stepId) === -1) {
          state.game.completedSteps.push(curr.stepId);
        }
        // Auto-track wokeTonight for BMR Chambermaid on player ability steps
        if (curr.player && curr.team !== 'system' && curr.roleId !== 'chambermaid') {
          curr.player.wokeTonight = true;
        }
      }
      if (state.game.nightStepIndex < steps.length - 1) {
        state.game.nightStepIndex += 1;
        persistAll();
        renderAll();
      } else {
        advancePhase();
      }
    });

    els.dayExecBtn.addEventListener('click', handleDayExecution);

    // Player Modal Controls
    els.pmCloseBtn.addEventListener('click', closePlayerModal);
    els.pmDoneBtn.addEventListener('click', closePlayerModal);
    els.playerModal.addEventListener('click', function (e) {
      if (e.target === els.playerModal) closePlayerModal();
    });

    els.pmToggleAlive.addEventListener('click', function () {
      if (state.activePlayerIdx !== null) toggleAlive(state.activePlayerIdx);
    });

    els.pmToggleVote.addEventListener('click', function () {
      if (state.activePlayerIdx !== null) toggleGhostVote(state.activePlayerIdx);
    });

    els.pmTogglePoison.addEventListener('click', function () {
      if (state.activePlayerIdx !== null) togglePoison(state.activePlayerIdx);
    });

    els.pmToggleDrunk.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      p.drunk = !p.drunk;
      persistAll();
      renderAll();
    });

    els.pmToggleMonk.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      if (state.scriptId === 'trouble-brewing') {
        setSingleMarker('protectedByMonk', p.protectedByMonk ? -1 : state.activePlayerIdx);
      } else {
        // Innkeeper can protect 2 players simultaneously
        p.protectedByMonk = !p.protectedByMonk;
        persistAll();
        renderAll();
      }
    });

    els.pmToggleDa.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      setSingleMarker('daProtected', p.daProtected ? -1 : state.activePlayerIdx);
    });

    els.pmToggleHerring.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      setSingleMarker('redHerring', p.redHerring ? -1 : state.activePlayerIdx);
    });

    els.pmToggleMad.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      p.mad = !p.mad;
      persistAll();
      renderAll();
    });

    els.pmToggleCursed.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      setSingleMarker('cursed', p.cursed ? -1 : state.activePlayerIdx);
    });

    if (els.pmToggleGoodTwin) {
      els.pmToggleGoodTwin.addEventListener('click', function () {
        if (state.activePlayerIdx === null) return;
        const p = state.players[state.activePlayerIdx];
        setSingleMarker('goodTwin', p.goodTwin ? -1 : state.activePlayerIdx);
      });
    }

    if (els.pmToggleGrandchild) {
      els.pmToggleGrandchild.addEventListener('click', function () {
        if (state.activePlayerIdx === null) return;
        const p = state.players[state.activePlayerIdx];
        setSingleMarker('grandchild', p.grandchild ? -1 : state.activePlayerIdx);
      });
    }

    els.pmToggleZombuul.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      p.zombuulFakeDead = !p.zombuulFakeDead;
      persistAll();
      renderAll();
    });

    els.pmToggleWoke.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      p.wokeTonight = !p.wokeTonight;
      persistAll();
      renderAll();
    });

    els.pmToggleAlignment.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      if (!p.alignmentOverride) p.alignmentOverride = 'evil';
      else if (p.alignmentOverride === 'evil') p.alignmentOverride = 'good';
      else p.alignmentOverride = null;
      persistAll();
      renderAll();
    });

    els.pmToggleDiedTonight.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      const nextVal = !(!p.alive && p.diedTonight);
      if (nextVal) {
        p.alive = false;
        p.ghostVoteUsed = false;
        p.diedTonight = true;
        p.executedToday = false;
        if (p.roleId === 'poisoner') {
          state.players.forEach(function (other) { other.poisoned = false; });
        }
      } else {
        p.diedTonight = false;
      }
      persistAll();
      renderAll();
    });

    els.pmToggleExecuted.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const p = state.players[state.activePlayerIdx];
      const nextVal = !(!p.alive && p.executedToday);
      state.players.forEach(function (other) { other.executedToday = false; });
      if (nextVal) {
        p.alive = false;
        p.ghostVoteUsed = false;
        p.diedTonight = false;
        p.executedToday = true;
        state.game.someoneDiedToday = true;
        const c = getChar(p.roleId);
        if (c && c.team === 'outsiders') state.game.outsiderDiedToday = true;
        if (c && c.team === 'minions') state.game.minionExecutedToday = true;
      } else {
        p.executedToday = false;
      }
      persistAll();
      renderAll();
    });

    els.pmSwapBtn.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const targetIdx = Number(els.pmSwapSelect.value);
      if (Number.isInteger(targetIdx) && targetIdx !== state.activePlayerIdx) {
        swapSeats(state.activePlayerIdx, targetIdx);
        state.activePlayerIdx = targetIdx;
        renderPlayerModal();
      }
    });

    els.pmRoleBtn.addEventListener('click', function () {
      if (state.activePlayerIdx === null) return;
      const newRoleId = els.pmRoleSelect.value;
      const p = state.players[state.activePlayerIdx];
      if (p && newRoleId) {
        p.roleId = newRoleId;
        if (newRoleId !== 'drunk' && newRoleId !== 'lunatic') {
          p.believedRoleId = null;
        }
        persistAll();
        renderAll();
      }
    });

    // Show Roles Picker & Overlay
    els.openShowPickerBtn.addEventListener('click', function () {
      openShowPicker({ presetBanner: '', presetRoles: [] });
    });
    els.showPickerClose.addEventListener('click', closeShowPicker);
    els.showPickerCancel.addEventListener('click', closeShowPicker);
    els.showPickerModal.addEventListener('click', function (e) {
      if (e.target === els.showPickerModal) closeShowPicker();
    });
    els.showBannerPresets.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-banner]');
      if (!btn) return;
      state.showPickerBanner = btn.dataset.banner || '';
      els.showBannerInput.value = state.showPickerBanner;
      syncBannerPresetHighlight();
    });
    els.showBannerInput.addEventListener('input', function () {
      state.showPickerBanner = els.showBannerInput.value;
      syncBannerPresetHighlight();
    });
    els.showLoadBluffsBtn.addEventListener('click', function () {
      const bluffs = Array.isArray(state.game.bluffs) ? state.game.bluffs.slice() : [];
      if (bluffs.length === 0) return;
      state.showPickerRoles = bluffs;
      state.showPickerBanner = 'These characters are not in play';
      els.showBannerInput.value = state.showPickerBanner;
      syncBannerPresetHighlight();
      renderShowPickerGroups();
    });
    els.showClearRolesBtn.addEventListener('click', function () {
      state.showPickerRoles = [];
      renderShowPickerGroups();
    });
    els.showLaunchBtn.addEventListener('click', function () {
      if (state.showPickerRoles.length === 0) return;
      const rolesToShow = state.showPickerRoles.slice();
      const bannerText = els.showBannerInput.value.trim();
      closeShowPicker();
      launchShowOverlay(rolesToShow, bannerText);
    });
    els.showOverlayClose.addEventListener('click', closeShowOverlay);

    // End Game Modal
    els.endGameBtn.addEventListener('click', openEndGameModal);
    els.endGameClose.addEventListener('click', closeEndGameModal);
    els.endGameCancel.addEventListener('click', closeEndGameModal);
    els.endGameModal.addEventListener('click', function (e) {
      if (e.target === els.endGameModal) closeEndGameModal();
    });
    els.endWinGood.addEventListener('click', function () {
      state.endWinner = state.endWinner === 'good' ? null : 'good';
      renderEndGameModal();
    });
    els.endWinEvil.addEventListener('click', function () {
      state.endWinner = state.endWinner === 'evil' ? null : 'evil';
      renderEndGameModal();
    });
    els.endGameAgain.addEventListener('click', function () {
      concludeAndNavigate('./setup.html');
    });
    els.endGameHome.addEventListener('click', function () {
      concludeAndNavigate('./index.html');
    });

    doc.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (!els.showOverlay.hidden) closeShowOverlay();
      else if (els.showPickerModal.classList.contains('is-open')) closeShowPicker();
      else if (els.endGameModal.classList.contains('is-open')) closeEndGameModal();
      else if (els.playerModal.classList.contains('is-open')) closePlayerModal();
    });
  }

  function init() {
    cacheElements();

    const saved = Storage.load();
    state.gmName = saved.gmName;
    state.scriptId = saved.selectedScript;
    state.playerCount = saved.playerCount;
    state.teensyville = saved.teensyville;
    state.selectedRoles = saved.selectedRoles.slice();
    state.drunkRole = saved.drunkRole;
    state.lunaticRole = saved.lunaticRole;
    state.players = saved.players.slice();
    state.game = saved.game;

    if (!state.players.length || state.players.length !== state.playerCount) {
      els.missingView.hidden = false;
      els.workspace.hidden = true;
      return;
    }

    els.missingView.hidden = true;
    els.workspace.hidden = false;

    bindEvents();
    setBoardView('circle');
    renderAll();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
