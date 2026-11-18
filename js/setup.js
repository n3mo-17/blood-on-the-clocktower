/**
 * Blood on the Clocktower — Character Selection (Step 2) Controller
 *
 * Lets the Storyteller choose which characters are in play for the active
 * script and player count, applying script-specific setup modifiers:
 * - Trouble Brewing: Baron (+2 Outsiders) & Drunk (believed Townsfolk)
 * - Bad Moon Rising: Godfather (-1/+1 Outsider) & Lunatic (believed Demon)
 * - Sects & Violets: Fang Gu (+1 Outsider) & Vigormortis (-1 Outsider)
 */
(function (global, doc) {
  'use strict';

  const Scripts = global.BOTC.Scripts;
  const Storage = global.BOTC.Storage;
  const escapeHtml = global.BOTC.escapeHtml;

  const TEAM_ORDER = [
    { id: 'townsfolk', label: 'Townsfolk', faction: 'Good', className: 'team-townsfolk' },
    { id: 'outsiders', label: 'Outsiders', faction: 'Good', className: 'team-outsiders' },
    { id: 'minions', label: 'Minions', faction: 'Evil', className: 'team-minions' },
    { id: 'demon', label: 'Demon', faction: 'Evil', className: 'team-demon' }
  ];

  const state = {
    gmName: '',
    scriptId: Scripts.getDefault().id,
    playerCount: 8,
    teensyville: false,
    selectedRoles: [],
    drunkRole: null,
    lunaticRole: null,
    godfatherDelta: 1
  };

  let lastFocusedElement = null;
  const els = {};

  function cacheElements() {
    els.missingGmBanner = doc.getElementById('missing-gm-banner');
    els.ctxGmName = doc.getElementById('ctx-gm-name');
    els.ctxScriptName = doc.getElementById('ctx-script-name');
    els.ctxPlayerCount = doc.getElementById('ctx-player-count');
    els.ctxTeensyChip = doc.getElementById('ctx-teensy-chip');

    els.quotaPills = {
      townsfolk: doc.getElementById('quota-townsfolk'),
      outsiders: doc.getElementById('quota-outsiders'),
      minions: doc.getElementById('quota-minions'),
      demon: doc.getElementById('quota-demon')
    };
    els.quotaVals = {
      townsfolk: doc.getElementById('quota-townsfolk-val'),
      outsiders: doc.getElementById('quota-outsiders-val'),
      minions: doc.getElementById('quota-minions-val'),
      demon: doc.getElementById('quota-demon-val')
    };

    els.modifierBadges = doc.getElementById('modifier-badges');
    els.statusHint = doc.getElementById('roster-status-hint');
    els.randomizeBtn = doc.getElementById('randomize-roles-btn');
    els.clearBtn = doc.getElementById('clear-roles-btn');
    els.confirmBtn = doc.getElementById('confirm-roles-btn');

    els.drunkPanel = doc.getElementById('drunk-role-panel');
    els.drunkOptions = doc.getElementById('drunk-role-options');
    els.drunkRandomBtn = doc.getElementById('drunk-random-btn');

    els.lunaticPanel = doc.getElementById('lunatic-role-panel');
    els.lunaticOptions = doc.getElementById('lunatic-role-options');
    els.lunaticRandomBtn = doc.getElementById('lunatic-random-btn');

    els.godfatherPanel = doc.getElementById('godfather-panel');
    els.gfMinusBtn = doc.getElementById('gf-minus-btn');
    els.gfPlusBtn = doc.getElementById('gf-plus-btn');

    els.roleGroups = doc.getElementById('role-picker-groups');

    // Confirmation Modal
    els.modalBackdrop = doc.getElementById('roster-modal');
    els.modalClose = doc.getElementById('roster-modal-close');
    els.modalEdit = doc.getElementById('roster-modal-edit');
    els.modalProceed = doc.getElementById('roster-modal-proceed');
    els.modalMeta = doc.getElementById('roster-modal-meta');
    els.modalGroups = doc.getElementById('roster-modal-groups');
  }

  function getActiveScript() {
    return Scripts.getById(state.scriptId) || Scripts.getDefault();
  }

  function getScriptDetails() {
    return Scripts.getDetails(state.scriptId);
  }

  function getCharactersByTeam(teamId) {
    const details = getScriptDetails();
    if (!details || !Array.isArray(details.characters)) {
      return [];
    }
    return details.characters.filter(function (c) {
      return c.team === teamId;
    });
  }

  function getCharacterById(charId) {
    const details = getScriptDetails();
    if (!details || !Array.isArray(details.characters)) {
      return null;
    }
    return (
      details.characters.find(function (c) {
        return c.id === charId;
      }) || null
    );
  }

  function getTargetDistribution() {
    const baseDist = Scripts.getRoleDistribution(state.playerCount);
    const details = getScriptDetails();
    if (details && typeof details.adjustDistribution === 'function') {
      return details.adjustDistribution(baseDist, state.selectedRoles, {
        godfatherDelta: state.godfatherDelta
      });
    }
    return {
      players: baseDist.players,
      townsfolk: baseDist.townsfolk,
      outsiders: baseDist.outsiders,
      minions: baseDist.minions,
      demon: baseDist.demon,
      modifiers: []
    };
  }

  function getSelectedCounts() {
    const counts = { townsfolk: 0, outsiders: 0, minions: 0, demon: 0 };
    state.selectedRoles.forEach(function (id) {
      const char = getCharacterById(id);
      if (char && Object.prototype.hasOwnProperty.call(counts, char.team)) {
        counts[char.team] += 1;
      }
    });
    return counts;
  }

  function hasRole(roleId) {
    return state.selectedRoles.indexOf(roleId) !== -1;
  }

  function getAvailableDrunkTownsfolk() {
    return getCharactersByTeam('townsfolk').filter(function (c) {
      return state.selectedRoles.indexOf(c.id) === -1;
    });
  }

  function persistSelection() {
    const saved = Storage.save({
      selectedRoles: state.selectedRoles,
      drunkRole: state.drunkRole,
      lunaticRole: state.lunaticRole,
      godfatherDelta: state.godfatherDelta
    });
    state.selectedRoles = saved.selectedRoles;
    state.drunkRole = saved.drunkRole;
    state.lunaticRole = saved.lunaticRole;
    state.godfatherDelta = saved.godfatherDelta;
  }

  function evaluateReadiness(counts, target) {
    const issues = [];

    TEAM_ORDER.forEach(function (team) {
      const diff = target[team.id] - counts[team.id];
      if (diff > 0) {
        issues.push('select ' + diff + ' more ' + team.label);
      } else if (diff < 0) {
        issues.push('remove ' + Math.abs(diff) + ' ' + team.label);
      }
    });

    if (hasRole('drunk') && !state.drunkRole) {
      issues.push("choose the Drunk's believed Townsfolk");
    }

    if (hasRole('lunatic') && !state.lunaticRole) {
      issues.push("choose the Lunatic's believed Demon");
    }

    return {
      isReady: issues.length === 0,
      issues: issues
    };
  }

  function renderContextHeader() {
    const script = getActiveScript();
    const hasName = state.gmName.trim().length > 0;

    els.missingGmBanner.hidden = hasName;
    els.ctxGmName.textContent = hasName ? state.gmName : 'Not set';
    els.ctxScriptName.textContent = script.name;
    els.ctxPlayerCount.textContent = state.playerCount + ' Players';
    els.ctxTeensyChip.hidden = !state.teensyville;
  }

  function renderQuotaBar() {
    const target = getTargetDistribution();
    const counts = getSelectedCounts();
    const readiness = evaluateReadiness(counts, target);

    TEAM_ORDER.forEach(function (team) {
      const current = counts[team.id];
      const goal = target[team.id];
      const pill = els.quotaPills[team.id];
      const val = els.quotaVals[team.id];

      val.textContent = current + ' / ' + goal;
      pill.classList.remove('is-complete', 'is-over');
      if (current === goal) {
        pill.classList.add('is-complete');
      } else if (current > goal) {
        pill.classList.add('is-over');
      }
    });

    if (target.modifiers && target.modifiers.length > 0) {
      els.modifierBadges.hidden = false;
      els.modifierBadges.innerHTML = target.modifiers
        .map(function (mod) {
          return '<span class="modifier-chip">' + escapeHtml(mod.label) + '</span>';
        })
        .join('');
    } else {
      els.modifierBadges.hidden = true;
      els.modifierBadges.innerHTML = '';
    }

    els.clearBtn.disabled = state.selectedRoles.length === 0;
    els.confirmBtn.disabled = !readiness.isReady;

    if (readiness.isReady) {
      els.statusHint.textContent =
        'All ' + state.playerCount + ' characters selected—ready to confirm.';
      els.statusHint.classList.add('is-ready');
    } else {
      const joined = readiness.issues.join(' · ');
      els.statusHint.textContent =
        'To continue: ' + joined.charAt(0).toUpperCase() + joined.slice(1) + '.';
      els.statusHint.classList.remove('is-ready');
    }
  }

  function renderDrunkPanel() {
    if (!hasRole('drunk')) {
      els.drunkPanel.hidden = true;
      return;
    }

    const available = getAvailableDrunkTownsfolk();
    if (
      state.drunkRole &&
      !available.some(function (c) {
        return c.id === state.drunkRole;
      })
    ) {
      state.drunkRole = null;
      persistSelection();
    }

    els.drunkPanel.hidden = false;
    els.drunkOptions.innerHTML = '';

    if (available.length === 0) {
      els.drunkOptions.innerHTML =
        '<p class="drunk-empty">All Townsfolk are currently selected. Deselect one Townsfolk to assign as the Drunk\'s believed role.</p>';
      els.drunkRandomBtn.disabled = true;
      return;
    }

    els.drunkRandomBtn.disabled = false;

    available.forEach(function (char) {
      const isPicked = state.drunkRole === char.id;
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'drunk-option-chip';
      if (isPicked) {
        btn.classList.add('is-selected');
      }
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', isPicked ? 'true' : 'false');
      btn.textContent = char.name;

      btn.addEventListener('click', function () {
        state.drunkRole = char.id;
        persistSelection();
        renderDrunkPanel();
        renderQuotaBar();
      });

      els.drunkOptions.appendChild(btn);
    });
  }

  function renderLunaticPanel() {
    if (!hasRole('lunatic')) {
      els.lunaticPanel.hidden = true;
      return;
    }

    const demons = getCharactersByTeam('demon');
    els.lunaticPanel.hidden = false;
    els.lunaticOptions.innerHTML = '';

    demons.forEach(function (char) {
      const isPicked = state.lunaticRole === char.id;
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'drunk-option-chip';
      if (isPicked) {
        btn.classList.add('is-selected');
      }
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', isPicked ? 'true' : 'false');
      btn.textContent = char.name;

      btn.addEventListener('click', function () {
        state.lunaticRole = char.id;
        persistSelection();
        renderLunaticPanel();
        renderQuotaBar();
      });

      els.lunaticOptions.appendChild(btn);
    });
  }

  function renderGodfatherPanel() {
    if (!hasRole('godfather')) {
      els.godfatherPanel.hidden = true;
      return;
    }

    const baseDist = Scripts.getRoleDistribution(state.playerCount);
    const canMinus = baseDist.outsiders > 0;
    const canPlus = baseDist.outsiders < 4;

    if (!canMinus && state.godfatherDelta === -1) {
      state.godfatherDelta = 1;
      persistSelection();
    }

    els.godfatherPanel.hidden = false;
    els.gfMinusBtn.disabled = !canMinus;
    els.gfPlusBtn.disabled = !canPlus;
    els.gfMinusBtn.classList.toggle('is-selected', state.godfatherDelta === -1);
    els.gfPlusBtn.classList.toggle('is-selected', state.godfatherDelta === 1);
  }

  function toggleCharacter(char) {
    const idx = state.selectedRoles.indexOf(char.id);
    const target = getTargetDistribution();
    const counts = getSelectedCounts();

    if (idx !== -1) {
      state.selectedRoles.splice(idx, 1);
      if (char.id === 'drunk') {
        state.drunkRole = null;
      }
      if (char.id === 'lunatic') {
        state.lunaticRole = null;
      }
    } else {
      const teamTarget = target[char.team];
      const teamCurrent = counts[char.team];

      if (teamTarget === 0) {
        return;
      }

      if (teamTarget === 1 && teamCurrent === 1) {
        const existingId = state.selectedRoles.find(function (id) {
          const found = getCharacterById(id);
          return found && found.team === char.team;
        });
        if (existingId) {
          const existingIdx = state.selectedRoles.indexOf(existingId);
          if (existingIdx !== -1) {
            state.selectedRoles.splice(existingIdx, 1);
            if (existingId === 'drunk') {
              state.drunkRole = null;
            }
            if (existingId === 'lunatic') {
              state.lunaticRole = null;
            }
          }
        }
        state.selectedRoles.push(char.id);
      } else if (teamCurrent < teamTarget) {
        state.selectedRoles.push(char.id);
      } else {
        return;
      }

      if (char.team === 'townsfolk' && state.drunkRole === char.id) {
        state.drunkRole = null;
      }
    }

    persistSelection();
    renderAll();
  }

  function getZeroOutsiderHint() {
    if (state.scriptId === 'trouble-brewing') {
      return '0 needed (select Baron for +2)';
    }
    if (state.scriptId === 'bad-moon-rising') {
      return '0 needed (select Godfather for +1)';
    }
    if (state.scriptId === 'sects-and-violets') {
      return '0 needed (select Fang Gu for +1)';
    }
    return '0 needed';
  }

  function renderRoleGroups() {
    const target = getTargetDistribution();
    const counts = getSelectedCounts();
    els.roleGroups.innerHTML = '';

    TEAM_ORDER.forEach(function (team) {
      const chars = getCharactersByTeam(team.id);
      const current = counts[team.id];
      const goal = target[team.id];
      const isFull = current >= goal;

      const section = doc.createElement('section');
      section.className = 'role-group ' + team.className;

      let statusLabel = '';
      let statusClass = 'group-status';
      if (goal === 0 && current === 0) {
        statusLabel = team.id === 'outsiders' ? getZeroOutsiderHint() : '0 needed';
        statusClass += ' group-status--muted';
      } else if (current === goal) {
        statusLabel = 'Complete';
        statusClass += ' group-status--complete';
      } else if (current > goal) {
        statusLabel = 'Remove ' + (current - goal);
        statusClass += ' group-status--over';
      } else {
        statusLabel = 'Pick ' + (goal - current) + ' more';
      }

      const header = doc.createElement('div');
      header.className = 'role-group-header';
      header.innerHTML =
        '<div class="role-group-title-wrap">' +
        '  <span class="role-group-dot" aria-hidden="true"></span>' +
        '  <h2 class="role-group-title">' + escapeHtml(team.label) + '</h2>' +
        '  <span class="role-group-faction">' + escapeHtml(team.faction) + '</span>' +
        '</div>' +
        '<div class="group-header-right">' +
        '  <span class="' + statusClass + '">' + escapeHtml(statusLabel) + '</span>' +
        '  <span class="role-group-count">' + current + ' / ' + goal + '</span>' +
        '</div>';

      const grid = doc.createElement('div');
      grid.className = 'role-cards-grid';

      chars.forEach(function (char) {
        const isSelected = state.selectedRoles.indexOf(char.id) !== -1;
        const canSwapSingle = goal === 1 && current === 1 && !isSelected;
        const isDisabled = !isSelected && (goal === 0 || (isFull && !canSwapSingle));

        const card = doc.createElement('button');
        card.type = 'button';
        card.className = 'pick-card pick-card--' + char.team;
        if (isSelected) {
          card.classList.add('is-selected');
        }
        if (isDisabled) {
          card.classList.add('is-disabled');
        }

        card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');
        card.disabled = isDisabled;

        const setupTagHtml = char.setupTag
          ? '<span class="pick-setup-tag">' + escapeHtml(char.setupTag) + '</span>'
          : '';

        const checkHtml =
          '<span class="pick-check" aria-hidden="true">' +
          (isSelected
            ? '<svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>'
            : '') +
          '</span>';

        card.innerHTML =
          '<div class="pick-card-head">' +
          '  <div class="pick-title-group">' +
          '    <span class="role-name">' + escapeHtml(char.name) + '</span>' +
          '    <span class="role-timing">' + escapeHtml(char.timing) + '</span>' +
          '  </div>' +
          '  ' + checkHtml +
          '</div>' +
          '<p class="role-ability">' + escapeHtml(char.ability) + '</p>' +
          (setupTagHtml ? '<div class="pick-card-foot">' + setupTagHtml + '</div>' : '');

        card.addEventListener('click', function () {
          toggleCharacter(char);
        });

        grid.appendChild(card);
      });

      section.appendChild(header);
      section.appendChild(grid);
      els.roleGroups.appendChild(section);
    });
  }

  function shuffleArray(items) {
    const copy = items.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i];
      copy[i] = copy[j];
      copy[j] = tmp;
    }
    return copy;
  }

  function handleRandomize() {
    const baseDist = Scripts.getRoleDistribution(state.playerCount);
    const details = getScriptDetails();

    // Pick Demon & Minions first so Baron / Godfather / Fang Gu / Vigormortis adjust accurately
    const allDemons = getCharactersByTeam('demon');
    const pickedDemons = shuffleArray(allDemons).slice(0, baseDist.demon);
    const pickedMinions = shuffleArray(getCharactersByTeam('minions')).slice(0, baseDist.minions);
    const evilIds = pickedDemons.concat(pickedMinions).map(function (c) {
      return c.id;
    });

    if (evilIds.indexOf('godfather') !== -1) {
      if (baseDist.outsiders > 0 && baseDist.outsiders < 4) {
        state.godfatherDelta = Math.random() < 0.5 ? -1 : 1;
      } else {
        state.godfatherDelta = baseDist.outsiders <= 0 ? 1 : -1;
      }
    }

    const adjusted =
      details && typeof details.adjustDistribution === 'function'
        ? details.adjustDistribution(baseDist, evilIds, { godfatherDelta: state.godfatherDelta })
        : baseDist;

    const pickedOutsiders = shuffleArray(getCharactersByTeam('outsiders')).slice(
      0,
      adjusted.outsiders
    );
    const shuffledTownsfolk = shuffleArray(getCharactersByTeam('townsfolk'));
    const pickedTownsfolk = shuffledTownsfolk.slice(0, adjusted.townsfolk);

    state.selectedRoles = pickedTownsfolk
      .concat(pickedOutsiders, pickedMinions, pickedDemons)
      .map(function (c) {
        return c.id;
      });

    if (hasRole('drunk')) {
      const remainingTownsfolk = shuffledTownsfolk.slice(adjusted.townsfolk);
      state.drunkRole = remainingTownsfolk.length > 0 ? remainingTownsfolk[0].id : null;
    } else {
      state.drunkRole = null;
    }

    if (hasRole('lunatic')) {
      const randomDemon = shuffleArray(allDemons)[0];
      state.lunaticRole = randomDemon ? randomDemon.id : null;
    } else {
      state.lunaticRole = null;
    }

    persistSelection();
    renderAll();
  }

  function handleClear() {
    state.selectedRoles = [];
    state.drunkRole = null;
    state.lunaticRole = null;
    persistSelection();
    renderAll();
  }

  function handleRandomDrunk() {
    const available = getAvailableDrunkTownsfolk();
    if (available.length === 0) {
      return;
    }
    const choice = available[Math.floor(Math.random() * available.length)];
    state.drunkRole = choice.id;
    persistSelection();
    renderDrunkPanel();
    renderQuotaBar();
  }

  function handleRandomLunatic() {
    const demons = getCharactersByTeam('demon');
    if (demons.length === 0) {
      return;
    }
    const choice = demons[Math.floor(Math.random() * demons.length)];
    state.lunaticRole = choice.id;
    persistSelection();
    renderLunaticPanel();
    renderQuotaBar();
  }

  function openRosterModal() {
    const script = getActiveScript();
    lastFocusedElement = doc.activeElement;

    els.modalMeta.textContent =
      (state.gmName || 'Storyteller') +
      ' · ' +
      script.name +
      ' · ' +
      state.playerCount +
      ' Players' +
      (state.teensyville ? ' · Teensyville Rules' : '');

    els.modalGroups.innerHTML = '';

    TEAM_ORDER.forEach(function (team) {
      const picked = state.selectedRoles
        .map(getCharacterById)
        .filter(function (c) {
          return c && c.team === team.id;
        });

      if (picked.length === 0) {
        return;
      }

      const groupDiv = doc.createElement('div');
      groupDiv.className = 'roster-summary-group';

      const chipsHtml = picked
        .map(function (char) {
          let label = escapeHtml(char.name);
          if (char.id === 'drunk' && state.drunkRole) {
            const fake = getCharacterById(state.drunkRole);
            if (fake) {
              label +=
                ' <span class="roster-fake-note">(thinks ' +
                escapeHtml(fake.name) +
                ')</span>';
            }
          } else if (char.id === 'lunatic' && state.lunaticRole) {
            const fakeDemon = getCharacterById(state.lunaticRole);
            if (fakeDemon) {
              label +=
                ' <span class="roster-fake-note">(thinks ' +
                escapeHtml(fakeDemon.name) +
                ')</span>';
            }
          }
          return (
            '<span class="roster-chip roster-chip--' +
            team.id +
            '">' +
            label +
            '</span>'
          );
        })
        .join('');

      groupDiv.innerHTML =
        '<h3 class="roster-summary-heading">' +
        escapeHtml(team.label) +
        ' (' +
        picked.length +
        ')</h3>' +
        '<div class="roster-summary-chips">' +
        chipsHtml +
        '</div>';

      els.modalGroups.appendChild(groupDiv);
    });

    els.modalBackdrop.classList.add('is-open');
    els.modalBackdrop.setAttribute('aria-hidden', 'false');
    els.modalClose.focus();
  }

  function closeRosterModal() {
    els.modalBackdrop.classList.remove('is-open');
    els.modalBackdrop.setAttribute('aria-hidden', 'true');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }

  function renderAll() {
    renderContextHeader();
    renderQuotaBar();
    renderDrunkPanel();
    renderLunaticPanel();
    renderGodfatherPanel();
    renderRoleGroups();
  }

  function bindEvents() {
    els.randomizeBtn.addEventListener('click', handleRandomize);
    els.clearBtn.addEventListener('click', handleClear);
    els.drunkRandomBtn.addEventListener('click', handleRandomDrunk);
    els.lunaticRandomBtn.addEventListener('click', handleRandomLunatic);

    els.gfMinusBtn.addEventListener('click', function () {
      state.godfatherDelta = -1;
      persistSelection();
      renderAll();
    });

    els.gfPlusBtn.addEventListener('click', function () {
      state.godfatherDelta = 1;
      persistSelection();
      renderAll();
    });

    els.confirmBtn.addEventListener('click', function () {
      const target = getTargetDistribution();
      const counts = getSelectedCounts();
      const readiness = evaluateReadiness(counts, target);
      if (!readiness.isReady) {
        return;
      }
      persistSelection();
      openRosterModal();
    });

    els.modalClose.addEventListener('click', closeRosterModal);
    els.modalEdit.addEventListener('click', closeRosterModal);
    els.modalProceed.addEventListener('click', function () {
      Storage.save({
        selectedRoles: state.selectedRoles,
        drunkRole: state.drunkRole,
        lunaticRole: state.lunaticRole,
        godfatherDelta: state.godfatherDelta,
        teensyville: state.teensyville,
        players: [],
        remainingBag: null,
        drawComplete: false,
        game: null
      });
      global.location.href = './assign.html';
    });
    els.modalBackdrop.addEventListener('click', function (event) {
      if (event.target === els.modalBackdrop) {
        closeRosterModal();
      }
    });

    doc.addEventListener('keydown', function (event) {
      if (
        event.key === 'Escape' &&
        els.modalBackdrop.classList.contains('is-open')
      ) {
        closeRosterModal();
      }
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
    state.godfatherDelta = saved.godfatherDelta;

    renderAll();
    bindEvents();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);
