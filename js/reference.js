/**
 * Blood on the Clocktower — Script Reference Page Controller
 *
 * Allows Storytellers and players to browse official scripts, inspect script
 * overviews, search/filter characters & abilities, and review Night Order.
 */
(function (global, doc) {
  'use strict';

  const Scripts = global.BOTC.Scripts;
  const Storage = global.BOTC.Storage;
  const escapeHtml = global.BOTC.escapeHtml;

  const TEAM_META = [
    { id: 'townsfolk', label: 'Townsfolk', faction: 'Good', className: 'team-townsfolk' },
    { id: 'outsiders', label: 'Outsiders', faction: 'Good', className: 'team-outsiders' },
    { id: 'minions', label: 'Minions', faction: 'Evil', className: 'team-minions' },
    { id: 'demon', label: 'Demon', faction: 'Evil', className: 'team-demon' }
  ];

  const state = {
    scriptId: Scripts.getDefault().id,
    view: 'characters', // 'characters' | 'night-order'
    teamFilter: 'all',
    searchQuery: ''
  };

  const townCompState = {
    playerCount: 8,
    activeTableCount: null
  };

  const els = {};

  function cacheElements() {
    els.scriptSwitcher = doc.getElementById('reference-script-switcher');
    els.overviewIcon = doc.getElementById('overview-icon');
    els.overviewEdition = doc.getElementById('overview-edition');
    els.overviewTitle = doc.getElementById('overview-title');
    els.overviewStatus = doc.getElementById('overview-status');
    els.overviewTagline = doc.getElementById('overview-tagline');
    els.overviewDesc = doc.getElementById('overview-desc');
    els.overviewTags = doc.getElementById('overview-tags');

    els.toolsSection = doc.getElementById('reference-tools');
    els.viewCharactersBtn = doc.getElementById('view-characters-btn');
    els.viewNightBtn = doc.getElementById('view-night-btn');

    els.charactersControls = doc.getElementById('characters-controls');
    els.searchInput = doc.getElementById('character-search');
    els.searchClearBtn = doc.getElementById('search-clear-btn');
    els.teamFilters = doc.getElementById('team-filters');
    els.resultsMeta = doc.getElementById('results-meta');

    els.charactersPanel = doc.getElementById('characters-panel');
    els.nightOrderPanel = doc.getElementById('night-order-panel');

    // Town Composition Form Elements
    els.townPlayerRange = doc.getElementById('town-player-range');
    els.townPlayerDecBtn = doc.getElementById('town-player-dec-btn');
    els.townPlayerIncBtn = doc.getElementById('town-player-inc-btn');
    els.townPlayerCountValue = doc.getElementById('town-player-count-value');
    els.townDistTownsfolk = doc.getElementById('town-dist-townsfolk');
    els.townDistOutsiders = doc.getElementById('town-dist-outsiders');
    els.townDistMinions = doc.getElementById('town-dist-minions');
    els.townDistDemon = doc.getElementById('town-dist-demon');
    els.townDistGood = doc.getElementById('town-dist-good');
    els.townDistEvil = doc.getElementById('town-dist-evil');
    els.townCompModeBadge = doc.getElementById('town-comp-mode-badge');
    els.townTableSyncBadge = doc.getElementById('town-table-sync-badge');
  }

  function resolveInitialScriptId() {
    try {
      const params = new URLSearchParams(global.location.search);
      const fromUrl = params.get('script');
      if (fromUrl && Scripts.getById(fromUrl)) {
        return fromUrl;
      }
    } catch (_err) {
      // Ignore URLSearchParams issues
    }

    if (Storage && Storage.load) {
      const saved = Storage.load();
      if (saved.selectedScript && Scripts.getById(saved.selectedScript)) {
        return saved.selectedScript;
      }
    }

    return Scripts.getDefault().id;
  }

  function getActiveScript() {
    return Scripts.getById(state.scriptId) || Scripts.getDefault();
  }

  function renderScriptSwitcher() {
    const scripts = Scripts.getAll();
    els.scriptSwitcher.innerHTML = '';

    scripts.forEach(function (script) {
      const isSelected = script.id === state.scriptId;

      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'reference-script-tab';
      if (isSelected) {
        btn.classList.add('is-active');
      }
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
      btn.style.setProperty('--script-accent', 'var(' + script.accentVar + ')');

      btn.innerHTML =
        '<span class="script-icon-wrap">' + Scripts.getIcon(script.iconKey) + '</span>' +
        '<span class="reference-tab-text">' +
        '  <span class="reference-tab-name">' + escapeHtml(script.name) + '</span>' +
        '  <span class="reference-tab-sub">' + escapeHtml(script.difficulty) + ' · ' + escapeHtml(script.playerCount) + '</span>' +
        '</span>' +
        '<span class="script-badge script-badge--ready">Ready</span>';

      btn.addEventListener('click', function () {
        if (state.scriptId === script.id) {
          return;
        }
        state.scriptId = script.id;
        state.teamFilter = 'all';
        state.searchQuery = '';
        els.searchInput.value = '';
        els.searchClearBtn.hidden = true;
        renderAll();
      });

      els.scriptSwitcher.appendChild(btn);
    });
  }

  function renderOverview() {
    const script = getActiveScript();

    els.overviewIcon.innerHTML = Scripts.getIcon(script.iconKey);
    els.overviewIcon.style.setProperty('--script-accent', 'var(' + script.accentVar + ')');

    els.overviewEdition.textContent = script.editionLabel + ' · ' + script.difficulty + ' · ' + script.playerCount;
    els.overviewTitle.textContent = script.name;
    els.overviewTagline.textContent = script.tagline;
    els.overviewDesc.textContent = script.description;

    els.overviewStatus.className = 'script-badge script-badge--ready';
    els.overviewStatus.textContent = 'Full Reference Available';

    els.overviewTags.innerHTML = '';
    (script.highlights || []).forEach(function (tag) {
      const span = doc.createElement('span');
      span.className = 'reference-meta-tag';
      span.textContent = tag;
      els.overviewTags.appendChild(span);
    });
  }

  function renderTeamFilters(characters) {
    const counts = {
      all: characters.length,
      townsfolk: 0,
      outsiders: 0,
      minions: 0,
      demon: 0
    };

    characters.forEach(function (char) {
      if (Object.prototype.hasOwnProperty.call(counts, char.team)) {
        counts[char.team] += 1;
      }
    });

    const filters = [
      { id: 'all', label: 'All', count: counts.all },
      { id: 'townsfolk', label: 'Townsfolk', count: counts.townsfolk },
      { id: 'outsiders', label: 'Outsiders', count: counts.outsiders },
      { id: 'minions', label: 'Minions', count: counts.minions },
      { id: 'demon', label: 'Demon', count: counts.demon }
    ];

    els.teamFilters.innerHTML = '';
    filters.forEach(function (f) {
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-pill filter-pill--' + f.id;
      if (state.teamFilter === f.id) {
        btn.classList.add('is-active');
      }
      btn.setAttribute('aria-pressed', state.teamFilter === f.id ? 'true' : 'false');
      btn.innerHTML =
        '<span>' + escapeHtml(f.label) + '</span>' +
        '<span class="filter-count">' + f.count + '</span>';

      btn.addEventListener('click', function () {
        state.teamFilter = f.id;
        renderTeamFilters(characters);
        renderCharacters(characters);
      });

      els.teamFilters.appendChild(btn);
    });
  }

  function matchesQuery(char, query) {
    if (!query) {
      return true;
    }
    const q = query.toLowerCase();
    return (
      char.name.toLowerCase().indexOf(q) !== -1 ||
      char.ability.toLowerCase().indexOf(q) !== -1 ||
      char.timing.toLowerCase().indexOf(q) !== -1 ||
      (char.tip && char.tip.toLowerCase().indexOf(q) !== -1)
    );
  }

  function renderCharacters(characters) {
    const query = state.searchQuery.trim();
    const filtered = characters.filter(function (char) {
      const teamOk = state.teamFilter === 'all' || char.team === state.teamFilter;
      return teamOk && matchesQuery(char, query);
    });

    els.resultsMeta.textContent =
      filtered.length === characters.length
        ? 'Showing all ' + characters.length + ' characters'
        : 'Showing ' + filtered.length + ' of ' + characters.length + ' characters';

    els.charactersPanel.innerHTML = '';

    if (filtered.length === 0) {
      els.charactersPanel.innerHTML =
        '<div class="reference-empty">' +
        '  <h3>No matching characters</h3>' +
        '  <p>Try clearing your search or switching the team filter.</p>' +
        '</div>';
      return;
    }

    TEAM_META.forEach(function (team) {
      const groupChars = filtered.filter(function (c) {
        return c.team === team.id;
      });
      if (groupChars.length === 0) {
        return;
      }

      const section = doc.createElement('section');
      section.className = 'role-group ' + team.className;

      const header = doc.createElement('div');
      header.className = 'role-group-header';
      header.innerHTML =
        '<div class="role-group-title-wrap">' +
        '  <span class="role-group-dot" aria-hidden="true"></span>' +
        '  <h2 class="role-group-title">' + escapeHtml(team.label) + '</h2>' +
        '  <span class="role-group-faction">' + escapeHtml(team.faction) + '</span>' +
        '</div>' +
        '<span class="role-group-count">' + groupChars.length + '</span>';

      const grid = doc.createElement('div');
      grid.className = 'role-cards-grid';

      groupChars.forEach(function (char) {
        const card = doc.createElement('article');
        card.className = 'role-card role-card--' + char.team;

        const tipHtml = char.tip
          ? '<details class="role-tip">' +
            '  <summary class="role-tip-toggle">Explanation</summary>' +
            '  <p class="role-tip-body">' + escapeHtml(char.tip) + '</p>' +
            '</details>'
          : '';

        card.innerHTML =
          '<div class="role-card-head">' +
          '  <h3 class="role-name">' + escapeHtml(char.name) + '</h3>' +
          '  <span class="role-timing">' + escapeHtml(char.timing) + '</span>' +
          '</div>' +
          '<p class="role-ability">' + escapeHtml(char.ability) + '</p>' +
          tipHtml;

        grid.appendChild(card);
      });

      section.appendChild(header);
      section.appendChild(grid);
      els.charactersPanel.appendChild(section);
    });
  }

  function buildNightColumn(title, subtitle, steps) {
    const col = doc.createElement('section');
    col.className = 'night-column';

    const listItems = steps
      .map(function (step, idx) {
        return (
          '<li class="night-step night-step--' + escapeHtml(step.team) + '">' +
          '  <span class="night-step-num" aria-hidden="true">' + (idx + 1) + '</span>' +
          '  <div class="night-step-body">' +
          '    <div class="night-step-name">' + escapeHtml(step.name) + '</div>' +
          '    <p class="night-step-note">' + escapeHtml(step.note) + '</p>' +
          '  </div>' +
          '</li>'
        );
      })
      .join('');

    col.innerHTML =
      '<div class="night-column-head">' +
      '  <h2 class="night-column-title">' + escapeHtml(title) + '</h2>' +
      '  <p class="night-column-sub">' + escapeHtml(subtitle) + '</p>' +
      '</div>' +
      '<ol class="night-list">' + listItems + '</ol>';

    return col;
  }

  function renderNightOrder(nightOrder) {
    els.nightOrderPanel.innerHTML = '';
    if (!nightOrder) {
      return;
    }

    const grid = doc.createElement('div');
    grid.className = 'night-order-grid';

    grid.appendChild(
      buildNightColumn(
        'First Night',
        'Setup awakenings before Day 1 begins',
        nightOrder.firstNight || []
      )
    );
    grid.appendChild(
      buildNightColumn(
        'Other Nights',
        'Every subsequent night following executions',
        nightOrder.otherNights || []
      )
    );

    els.nightOrderPanel.appendChild(grid);
  }

  function updateViewTabs() {
    const isChars = state.view === 'characters';
    els.viewCharactersBtn.classList.toggle('is-active', isChars);
    els.viewCharactersBtn.setAttribute('aria-selected', isChars ? 'true' : 'false');
    els.viewNightBtn.classList.toggle('is-active', !isChars);
    els.viewNightBtn.setAttribute('aria-selected', !isChars ? 'true' : 'false');

    els.charactersControls.hidden = !isChars;
    els.charactersPanel.hidden = !isChars;
    els.nightOrderPanel.hidden = isChars;
  }

  function renderContent() {
    const script = getActiveScript();
    const details = Scripts.getDetails(script.id);
    if (!details || !Array.isArray(details.characters)) {
      return;
    }

    els.toolsSection.hidden = false;
    renderTeamFilters(details.characters);
    renderCharacters(details.characters);
    renderNightOrder(details.nightOrder);
    updateViewTabs();
  }

  function renderAll() {
    renderScriptSwitcher();
    renderOverview();
    renderContent();
  }

  function bindEvents() {
    els.viewCharactersBtn.addEventListener('click', function () {
      state.view = 'characters';
      updateViewTabs();
    });

    els.viewNightBtn.addEventListener('click', function () {
      state.view = 'night-order';
      updateViewTabs();
    });

    els.searchInput.addEventListener('input', function () {
      state.searchQuery = els.searchInput.value;
      els.searchClearBtn.hidden = state.searchQuery.length === 0;
      const details = Scripts.getDetails(state.scriptId);
      if (details && details.characters) {
        renderCharacters(details.characters);
      }
    });

    els.searchClearBtn.addEventListener('click', function () {
      state.searchQuery = '';
      els.searchInput.value = '';
      els.searchClearBtn.hidden = true;
      els.searchInput.focus();
      const details = Scripts.getDetails(state.scriptId);
      if (details && details.characters) {
        renderCharacters(details.characters);
      }
    });

    if (els.townPlayerDecBtn) {
      els.townPlayerDecBtn.addEventListener('click', function () {
        if (townCompState.playerCount > 5) {
          townCompState.playerCount -= 1;
          renderTownComposition();
        }
      });
    }

    if (els.townPlayerIncBtn) {
      els.townPlayerIncBtn.addEventListener('click', function () {
        if (townCompState.playerCount < 15) {
          townCompState.playerCount += 1;
          renderTownComposition();
        }
      });
    }

    if (els.townPlayerRange) {
      els.townPlayerRange.addEventListener('input', function (e) {
        townCompState.playerCount = parseInt(e.target.value, 10) || 8;
        renderTownComposition();
      });
    }
  }

  function renderTownComposition() {
    if (!els.townPlayerRange) {
      return;
    }

    const bounds = { min: 5, max: 15 };
    const count = Math.max(bounds.min, Math.min(bounds.max, townCompState.playerCount));
    townCompState.playerCount = count;

    const dist = Scripts.getRoleDistribution(count);

    els.townPlayerRange.min = String(bounds.min);
    els.townPlayerRange.max = String(bounds.max);
    els.townPlayerRange.value = String(count);

    const span = Math.max(1, bounds.max - bounds.min);
    const progressPct = ((count - bounds.min) / span) * 100;
    els.townPlayerRange.style.setProperty('--range-progress', progressPct + '%');

    if (els.townPlayerCountValue) {
      els.townPlayerCountValue.textContent = String(count);
    }
    if (els.townPlayerDecBtn) {
      els.townPlayerDecBtn.disabled = count <= bounds.min;
    }
    if (els.townPlayerIncBtn) {
      els.townPlayerIncBtn.disabled = count >= bounds.max;
    }

    if (els.townDistTownsfolk) {
      els.townDistTownsfolk.textContent = String(dist.townsfolk);
    }
    if (els.townDistOutsiders) {
      els.townDistOutsiders.textContent = String(dist.outsiders);
    }
    if (els.townDistMinions) {
      els.townDistMinions.textContent = String(dist.minions);
    }
    if (els.townDistDemon) {
      els.townDistDemon.textContent = String(dist.demon);
    }

    const totalGood = dist.townsfolk + dist.outsiders;
    const totalEvil = dist.minions + dist.demon;

    if (els.townDistGood) {
      els.townDistGood.textContent =
        totalGood + ' (' + dist.townsfolk + ' Townsfolk' + (dist.outsiders > 0 ? ' + ' + dist.outsiders + ' Outsider' + (dist.outsiders > 1 ? 's' : '') : '') + ')';
    }
    if (els.townDistEvil) {
      els.townDistEvil.textContent =
        totalEvil + ' (' + dist.minions + ' Minion' + (dist.minions > 1 ? 's' : '') + ' + ' + dist.demon + ' Demon)';
    }

    if (els.townCompModeBadge) {
      if (dist.supportsTeensyville) {
        els.townCompModeBadge.textContent = 'Teensyville Rules (5–6 Players)';
        els.townCompModeBadge.classList.add('is-teensy');
      } else {
        els.townCompModeBadge.textContent = 'Standard Village (' + count + ' Players)';
        els.townCompModeBadge.classList.remove('is-teensy');
      }
    }

    if (els.townTableSyncBadge) {
      if (townCompState.activeTableCount && townCompState.activeTableCount === count) {
        els.townTableSyncBadge.hidden = false;
        els.townTableSyncBadge.textContent = 'Your Active Table (' + count + 'P)';
      } else {
        els.townTableSyncBadge.hidden = true;
      }
    }
  }

  function initTownComp() {
    try {
      if (Storage && Storage.load) {
        const saved = Storage.load();
        if (saved && typeof saved.playerCount === 'number' && saved.playerCount >= 5 && saved.playerCount <= 15) {
          townCompState.playerCount = saved.playerCount;
          townCompState.activeTableCount = saved.playerCount;
        }
      }
    } catch (_err) {
      // Storage unavailable or empty
    }
    renderTownComposition();
  }

  function init() {
    cacheElements();
    state.scriptId = resolveInitialScriptId();
    renderAll();
    initTownComp();
    bindEvents();
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window, document);

