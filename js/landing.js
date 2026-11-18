/**
 * Blood on the Clocktower — Landing Page Controller
 *
 * Hydrates and persists Storyteller (GM) nickname and script selection
 * using localStorage via window.BOTC.Storage.
 */
(function (global, doc) {
  'use strict';

  const Scripts = global.BOTC.Scripts;
  const Storage = global.BOTC.Storage;
  const Theme = global.BOTC.Theme;
  const escapeHtml = global.BOTC.escapeHtml;

  const state = {
    gmName: '',
    selectedScript: Scripts.getDefault().id,
    playerCount: Scripts.getPlayerBounds(Scripts.getDefault().id).defaultCount,
    teensyville: false,
    hasSaved: false
  };

  let saveDebounce = null;

  // DOM References
  const els = {};

  function cacheElements() {
    els.sessionPill = doc.getElementById('session-pill');
    els.sessionPillText = doc.getElementById('session-pill-text');
    els.themeGrid = doc.getElementById('theme-switcher-grid');
    els.form = doc.getElementById('storyteller-form');
    els.gmInput = doc.getElementById('gm-name');
    els.gmError = doc.getElementById('gm-name-error');
    els.scriptGrid = doc.getElementById('script-grid');
    els.playerDecBtn = doc.getElementById('player-dec-btn');
    els.playerIncBtn = doc.getElementById('player-inc-btn');
    els.playerCountValue = doc.getElementById('player-count-value');
    els.playerRange = doc.getElementById('player-count-range');
    els.teensyRow = doc.getElementById('teensy-toggle-row');
    els.teensyToggle = doc.getElementById('teensy-toggle');
    els.distTownsfolk = doc.getElementById('dist-townsfolk');
    els.distOutsiders = doc.getElementById('dist-outsiders');
    els.distMinions = doc.getElementById('dist-minions');
    els.distDemon = doc.getElementById('dist-demon');
    els.resetBtn = doc.getElementById('reset-btn');
    els.submitBtn = doc.getElementById('submit-btn');
  }

  function getActiveScript() {
    return Scripts.getById(state.selectedScript) || Scripts.getDefault();
  }

  function renderThemeSwitcher() {
    if (!els.themeGrid || !Theme || !Array.isArray(Theme.THEMES)) {
      return;
    }

    const activeTheme = Theme.get();
    els.themeGrid.innerHTML = '';

    Theme.THEMES.forEach(function (theme) {
      const isSelected = theme.id === activeTheme;
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'theme-btn';
      if (isSelected) {
        btn.classList.add('is-active');
      }
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.dataset.themeId = theme.id;

      const dotsHtml = theme.swatches
        .map(function (hex) {
          return '<span class="theme-dot" style="background:' + hex + '"></span>';
        })
        .join('');

      btn.innerHTML =
        '<div class="theme-btn-top">' +
        '  <span class="theme-btn-name">' + escapeHtml(theme.name) + '</span>' +
        '  <span class="theme-swatches" aria-hidden="true">' + dotsHtml + '</span>' +
        '</div>' +
        '<span class="theme-btn-tagline">' + escapeHtml(theme.tagline) + '</span>';

      btn.addEventListener('click', function () {
        Theme.set(theme.id);
        renderThemeSwitcher();
      });

      els.themeGrid.appendChild(btn);
    });
  }

  function renderScriptGrid() {
    const scripts = Scripts.getAll();
    els.scriptGrid.innerHTML = '';

    scripts.forEach(function (script) {
      const isSelected = script.id === state.selectedScript;

      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'script-option';
      if (isSelected) {
        btn.classList.add('script-option--selected');
      }

      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');
      btn.dataset.scriptId = script.id;
      btn.style.setProperty('--script-accent', 'var(' + script.accentVar + ')');

      const checkMarkup = isSelected
        ? '<span class="script-check" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5 6.5 11.5 12.5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>'
        : '';

      btn.innerHTML =
        '<span class="script-icon-wrap">' + Scripts.getIcon(script.iconKey) + '</span>' +
        '<div class="script-option-body">' +
        '  <div class="script-option-name">' + escapeHtml(script.name) + '</div>' +
        '  <div class="script-option-meta">' + escapeHtml(script.difficulty) + ' · ' + escapeHtml(script.playerCount) + '</div>' +
        '</div>' +
        '<div class="script-option-status">' +
        '  <span class="script-badge script-badge--ready">Ready</span>' +
        '  ' + checkMarkup +
        '</div>';

      btn.addEventListener('click', function () {
        handleScriptClick(script);
      });

      els.scriptGrid.appendChild(btn);
    });
  }

  function renderPlayerControls() {
    const bounds = Scripts.getPlayerBounds(state.selectedScript);
    const dist = Scripts.getRoleDistribution(state.playerCount);

    els.playerRange.min = String(bounds.min);
    els.playerRange.max = String(bounds.max);
    els.playerRange.value = String(dist.players);

    const span = Math.max(1, bounds.max - bounds.min);
    const progressPct = ((dist.players - bounds.min) / span) * 100;
    els.playerRange.style.setProperty('--range-progress', progressPct + '%');

    els.playerCountValue.textContent = String(dist.players);
    els.playerDecBtn.disabled = dist.players <= bounds.min;
    els.playerIncBtn.disabled = dist.players >= bounds.max;

    els.teensyRow.hidden = !dist.supportsTeensyville;
    if (!dist.supportsTeensyville) {
      state.teensyville = false;
    }
    els.teensyToggle.checked = Boolean(state.teensyville && dist.supportsTeensyville);

    els.distTownsfolk.textContent = String(dist.townsfolk);
    els.distOutsiders.textContent = String(dist.outsiders);
    els.distMinions.textContent = String(dist.minions);
    els.distDemon.textContent = String(dist.demon);
  }

  function updateSessionChrome() {
    const script = getActiveScript();
    const hasName = state.gmName.trim().length > 0;

    if (global.BOTC && global.BOTC.Nav && global.BOTC.Nav.syncSessionPill) {
      global.BOTC.Nav.syncSessionPill();
    } else if (hasName && state.hasSaved) {
      els.sessionPill.hidden = false;
      els.sessionPillText.textContent =
        'GM: ' + state.gmName + ' · ' + state.playerCount + 'P · ' + script.name;
    } else {
      els.sessionPill.hidden = true;
    }

    els.resetBtn.hidden = !state.hasSaved;
  }

  function setGmError(message) {
    if (message) {
      els.gmError.textContent = message;
      els.gmError.hidden = false;
      els.gmInput.setAttribute('aria-invalid', 'true');
    } else {
      els.gmError.textContent = '';
      els.gmError.hidden = true;
      els.gmInput.setAttribute('aria-invalid', 'false');
    }
  }

  function persistState() {
    const saved = Storage.save({
      gmName: state.gmName,
      selectedScript: state.selectedScript,
      playerCount: state.playerCount,
      teensyville: state.teensyville
    });
    state.gmName = saved.gmName;
    state.selectedScript = saved.selectedScript;
    state.playerCount = saved.playerCount;
    state.teensyville = saved.teensyville;
    state.hasSaved = Boolean(saved.updatedAt);
    updateSessionChrome();
  }

  function setPlayerCount(nextCount) {
    const bounds = Scripts.getPlayerBounds(state.selectedScript);
    const clamped = Math.max(bounds.min, Math.min(bounds.max, Math.round(Number(nextCount) || bounds.defaultCount)));
    if (clamped === state.playerCount && state.hasSaved) {
      return;
    }
    state.playerCount = clamped;
    if (!Scripts.getRoleDistribution(clamped).supportsTeensyville) {
      state.teensyville = false;
    }
    renderPlayerControls();
    persistState();
  }

  function handleTeensyToggle() {
    const dist = Scripts.getRoleDistribution(state.playerCount);
    state.teensyville = dist.supportsTeensyville ? Boolean(els.teensyToggle.checked) : false;
    persistState();
  }

  function handleScriptClick(script) {
    state.selectedScript = script.id;
    persistState();
    renderScriptGrid();
    renderPlayerControls();
  }

  function handleGmInput() {
    const raw = els.gmInput.value;
    state.gmName = raw.trim();

    if (state.gmName.length > 0) {
      setGmError('');
    }

    if (saveDebounce) {
      global.clearTimeout(saveDebounce);
    }

    saveDebounce = global.setTimeout(function () {
      if (state.gmName.length > 0 || state.hasSaved) {
        persistState();
      }
    }, 250);
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    const cleanedName = els.gmInput.value.trim();

    if (!cleanedName) {
      setGmError('Please enter your Storyteller (GM) nickname to continue.');
      els.gmInput.focus();
      return;
    }

    if (cleanedName.length > 40) {
      setGmError('Please keep your nickname to 40 characters or fewer.');
      els.gmInput.focus();
      return;
    }

    setGmError('');
    state.gmName = cleanedName;
    els.gmInput.value = cleanedName;
    persistState();
    global.location.href = './setup.html';
  }

  function handleReset() {
    const cleared = Storage.clear();
    state.gmName = cleared.gmName;
    state.selectedScript = cleared.selectedScript;
    state.playerCount = cleared.playerCount;
    state.teensyville = cleared.teensyville;
    state.hasSaved = false;

    els.gmInput.value = '';
    setGmError('');
    renderScriptGrid();
    renderPlayerControls();
    updateSessionChrome();
    els.gmInput.focus();
  }

  function bindEvents() {
    els.gmInput.addEventListener('input', handleGmInput);
    els.gmInput.addEventListener('blur', function () {
      const cleaned = els.gmInput.value.trim();
      if (cleaned !== els.gmInput.value) {
        els.gmInput.value = cleaned;
      }
      state.gmName = cleaned;
      if (cleaned.length > 0) {
        persistState();
      }
    });

    els.playerDecBtn.addEventListener('click', function () {
      setPlayerCount(state.playerCount - 1);
    });

    els.playerIncBtn.addEventListener('click', function () {
      setPlayerCount(state.playerCount + 1);
    });

    els.playerRange.addEventListener('input', function () {
      setPlayerCount(els.playerRange.value);
    });

    els.teensyToggle.addEventListener('change', handleTeensyToggle);

    els.form.addEventListener('submit', handleFormSubmit);
    els.resetBtn.addEventListener('click', handleReset);
  }

  function init() {
    cacheElements();

    const saved = Storage.load();
    state.gmName = saved.gmName;
    state.selectedScript = saved.selectedScript;
    state.playerCount = saved.playerCount;
    state.teensyville = saved.teensyville;
    state.hasSaved = Boolean(saved.updatedAt);

    els.gmInput.value = state.gmName;

    renderThemeSwitcher();
    renderScriptGrid();
    renderPlayerControls();
    updateSessionChrome();
    bindEvents();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);

