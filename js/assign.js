/**
 * Blood on the Clocktower — Pass-and-Play Player Assignment (Step 3)
 *
 * Allows the Storyteller to enter each player's name one by one while the
 * player draws a random character from the remaining bag. Previously drawn
 * characters are never shown, drawn tokens are removed immediately, and the
 * Drunk is shown strictly as their assigned believed Townsfolk.
 */
(function (global, doc) {
  'use strict';

  const Scripts = global.BOTC.Scripts;
  const Storage = global.BOTC.Storage;

  const TEAM_DISPLAY = {
    townsfolk: { label: 'Good · Townsfolk', className: 'reveal-card--townsfolk' },
    outsiders: { label: 'Good · Outsider', className: 'reveal-card--outsiders' },
    minions: { label: 'Evil · Minion', className: 'reveal-card--minions' },
    demon: { label: 'Evil · Demon', className: 'reveal-card--demon' }
  };

  const state = {
    gmName: '',
    scriptId: Scripts.getDefault().id,
    playerCount: 8,
    teensyville: false,
    selectedRoles: [],
    drunkRole: null,
    lunaticRole: null,
    players: [],
    remainingBag: [],
    drawComplete: false,
    currentReveal: null // { playerName, displayChar }
  };

  const els = {};

  function cacheElements() {
    els.missingView = doc.getElementById('assign-missing-view');
    els.stage = doc.getElementById('assign-stage');

    els.stepLabel = doc.getElementById('assign-step-label');
    els.remainingBadge = doc.getElementById('assign-remaining-badge');
    els.progressFill = doc.getElementById('assign-progress-fill');

    // View 1: Entry
    els.entryView = doc.getElementById('draw-entry-view');
    els.entryHeading = doc.getElementById('entry-heading');
    els.drawForm = doc.getElementById('player-draw-form');
    els.nameInput = doc.getElementById('player-name-input');
    els.nameError = doc.getElementById('player-name-error');
    els.drawBtn = doc.getElementById('draw-btn');

    // View 2: Reveal
    els.revealView = doc.getElementById('draw-reveal-view');
    els.revealGreeting = doc.getElementById('reveal-player-greeting');
    els.revealTeam = doc.getElementById('reveal-team');
    els.revealTiming = doc.getElementById('reveal-timing');
    els.revealName = doc.getElementById('reveal-name');
    els.nextBtn = doc.getElementById('next-player-btn');
    els.nextBtnText = doc.getElementById('next-player-btn-text');

    // View 3: Empty / No Characters Left
    els.emptyView = doc.getElementById('draw-empty-view');
    els.emptySummaryText = doc.getElementById('empty-summary-text');
    els.assignedPlayersList = doc.getElementById('assigned-players-list');
    els.proceedNextBtn = doc.getElementById('proceed-next-btn');
    els.redrawBtn = doc.getElementById('redraw-btn');
  }

  function getCharacterById(charId) {
    const details = Scripts.getDetails(state.scriptId);
    if (!details || !Array.isArray(details.characters)) {
      return null;
    }
    return (
      details.characters.find(function (c) {
        return c.id === charId;
      }) || null
    );
  }

  function isSetupValid(cfg) {
    if (!Array.isArray(cfg.selectedRoles) || cfg.selectedRoles.length !== cfg.playerCount) {
      return false;
    }
    if (cfg.selectedRoles.indexOf('drunk') !== -1 && !cfg.drunkRole) {
      return false;
    }
    if (cfg.selectedRoles.indexOf('lunatic') !== -1 && !cfg.lunaticRole) {
      return false;
    }
    return true;
  }

  function buildFreshBag(selectedRoles, drunkRole, lunaticRole) {
    return selectedRoles.map(function (roleId) {
      let believed = null;
      if (roleId === 'drunk') {
        believed = drunkRole;
      } else if (roleId === 'lunatic') {
        believed = lunaticRole;
      }
      return {
        roleId: roleId,
        believedRoleId: believed
      };
    });
  }

  function pickRandomIndex(length) {
    if (length <= 1) {
      return 0;
    }
    if (global.crypto && typeof global.crypto.getRandomValues === 'function') {
      const arr = new Uint32Array(1);
      global.crypto.getRandomValues(arr);
      return arr[0] % length;
    }
    return Math.floor(Math.random() * length);
  }

  function persistDrawState() {
    const saved = Storage.save({
      players: state.players,
      remainingBag: state.remainingBag,
      drawComplete: state.drawComplete
    });
    state.players = saved.players;
    state.remainingBag = saved.remainingBag || [];
    state.drawComplete = saved.drawComplete;
  }

  function setNameError(message) {
    if (message) {
      els.nameError.textContent = message;
      els.nameError.hidden = false;
      els.nameInput.setAttribute('aria-invalid', 'true');
    } else {
      els.nameError.textContent = '';
      els.nameError.hidden = true;
      els.nameInput.setAttribute('aria-invalid', 'false');
    }
  }

  function updateProgress() {
    const total = state.playerCount;
    const assignedCount = state.players.length;
    const remaining = state.remainingBag.length;

    const pct = total > 0 ? Math.min(100, (assignedCount / total) * 100) : 0;
    els.progressFill.style.width = pct + '%';

    if (remaining === 0 && !state.currentReveal) {
      els.stepLabel.textContent = 'All ' + total + ' Players Assigned';
      els.remainingBadge.textContent = '0 characters left';
      els.remainingBadge.classList.add('is-empty');
    } else if (state.currentReveal) {
      els.stepLabel.textContent = 'Player ' + assignedCount + ' of ' + total;
      els.remainingBadge.textContent =
        remaining === 1 ? '1 character left' : remaining + ' characters left';
      els.remainingBadge.classList.toggle('is-empty', remaining === 0);
    } else {
      const nextSeat = Math.min(total, assignedCount + 1);
      els.stepLabel.textContent = 'Player ' + nextSeat + ' of ' + total;
      els.remainingBadge.textContent =
        remaining === 1 ? '1 character left' : remaining + ' characters left';
      els.remainingBadge.classList.remove('is-empty');
    }
  }

  function showEntryView() {
    state.currentReveal = null;
    els.revealView.hidden = true;
    els.emptyView.hidden = true;
    els.entryView.hidden = false;

    const nextSeat = state.players.length + 1;
    els.entryHeading.textContent = 'Player ' + nextSeat;
    els.nameInput.value = '';
    setNameError('');

    // Clear sensitive reveal DOM fields
    els.revealName.textContent = '';

    updateProgress();
    els.nameInput.focus();
  }

  function showRevealView(playerName, drawnToken) {
    // CRITICAL: Never expose 'drunk' or 'lunatic' to the player—always display their believed character
    const isMaskedRole = drawnToken.roleId === 'drunk' || drawnToken.roleId === 'lunatic';
    const displayId =
      isMaskedRole && drawnToken.believedRoleId
        ? drawnToken.believedRoleId
        : drawnToken.roleId;

    const displayChar = getCharacterById(displayId);
    if (!displayChar) {
      showEntryView();
      return;
    }

    state.currentReveal = {
      playerName: playerName,
      displayChar: displayChar
    };

    const teamInfo = TEAM_DISPLAY[displayChar.team] || TEAM_DISPLAY.townsfolk;

    els.revealView.classList.remove(
      'reveal-card--townsfolk',
      'reveal-card--outsiders',
      'reveal-card--minions',
      'reveal-card--demon'
    );
    els.revealView.classList.add(teamInfo.className);

    els.revealGreeting.textContent = playerName + ', your character is';
    els.revealTeam.textContent = teamInfo.label;
    els.revealTiming.textContent = displayChar.timing;
    els.revealName.textContent = displayChar.name;

    els.nextBtnText.textContent =
      state.remainingBag.length > 0 ? 'Next Player' : 'Hide & Finish';

    els.entryView.hidden = true;
    els.emptyView.hidden = true;
    els.revealView.hidden = false;

    updateProgress();
    els.nextBtn.focus();
  }

  function showEmptyView() {
    state.currentReveal = null;
    state.drawComplete = true;
    persistDrawState();

    // Clear sensitive reveal DOM fields
    els.revealName.textContent = '';

    els.entryView.hidden = true;
    els.revealView.hidden = true;
    els.emptyView.hidden = false;

    els.emptySummaryText.textContent =
      'All ' +
      state.playerCount +
      ' players have drawn their secret characters. Hand the device back to ' +
      (state.gmName || 'the Storyteller') +
      ' to continue.';

    els.assignedPlayersList.innerHTML = '';
    state.players.forEach(function (player) {
      const li = doc.createElement('li');
      li.className = 'assigned-player-item';
      li.textContent = player.name;
      els.assignedPlayersList.appendChild(li);
    });

    updateProgress();
    els.proceedNextBtn.focus();
  }

  function handleDrawSubmit(event) {
    event.preventDefault();
    if (state.remainingBag.length === 0) {
      showEmptyView();
      return;
    }

    const cleanedName = els.nameInput.value.trim();
    if (!cleanedName) {
      setNameError('Please enter a player name before drawing.');
      els.nameInput.focus();
      return;
    }

    if (cleanedName.length > 36) {
      setNameError('Please keep the player name to 36 characters or fewer.');
      els.nameInput.focus();
      return;
    }

    const duplicate = state.players.some(function (p) {
      return p.name.toLowerCase() === cleanedName.toLowerCase();
    });
    if (duplicate) {
      setNameError('"' + cleanedName + '" is already assigned. Enter a distinct name.');
      els.nameInput.focus();
      return;
    }

    setNameError('');

    // Draw random token and remove it from the remaining bag immediately
    const randomIdx = pickRandomIndex(state.remainingBag.length);
    const drawnToken = state.remainingBag.splice(randomIdx, 1)[0];

    state.players.push({
      seat: state.players.length + 1,
      name: cleanedName,
      roleId: drawnToken.roleId,
      believedRoleId: drawnToken.believedRoleId,
      alive: true,
      ghostVoteUsed: false
    });
    state.drawComplete = false;
    persistDrawState();

    showRevealView(cleanedName, drawnToken);
  }

  function handleNextPlayer() {
    if (state.remainingBag.length > 0) {
      showEntryView();
    } else {
      showEmptyView();
    }
  }

  function handleRedraw() {
    state.players = [];
    state.remainingBag = buildFreshBag(state.selectedRoles, state.drunkRole, state.lunaticRole);
    state.drawComplete = false;
    Storage.save({
      players: [],
      remainingBag: state.remainingBag,
      drawComplete: false,
      game: null
    });
    showEntryView();
  }

  function handleProceedToGrimoire() {
    if (state.remainingBag.length > 0) {
      return;
    }
    Storage.save({
      players: state.players,
      remainingBag: state.remainingBag,
      drawComplete: true,
      teensyville: state.teensyville
    });
    global.location.href = './grimoire.html';
  }

  function bindEvents() {
    els.nameInput.addEventListener('input', function () {
      if (els.nameInput.value.trim().length > 0) {
        setNameError('');
      }
    });

    els.drawForm.addEventListener('submit', handleDrawSubmit);
    els.nextBtn.addEventListener('click', handleNextPlayer);
    els.redrawBtn.addEventListener('click', handleRedraw);
    els.proceedNextBtn.addEventListener('click', handleProceedToGrimoire);
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

    if (!isSetupValid(saved)) {
      els.missingView.hidden = false;
      els.stage.hidden = true;
      return;
    }

    els.missingView.hidden = true;
    els.stage.hidden = false;

    if (saved.remainingBag === null) {
      state.players = [];
      state.remainingBag = buildFreshBag(state.selectedRoles, state.drunkRole, state.lunaticRole);
      state.drawComplete = false;
      persistDrawState();
    } else {
      state.players = saved.players.slice();
      state.remainingBag = saved.remainingBag.slice();
      state.drawComplete = saved.drawComplete;
    }

    bindEvents();

    if (state.remainingBag.length === 0) {
      showEmptyView();
    } else {
      showEntryView();
    }
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);

