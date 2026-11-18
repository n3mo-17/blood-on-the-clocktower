/**
 * Blood on the Clocktower — Script Registry
 *
 * Designed to be data-driven and easily extensible.
 * To enable a future script, set `status: 'available'` and attach its
 * character/night-order module when implemented.
 */
(function (global) {
  'use strict';

  const PLAYER_DISTRIBUTIONS = {
    5: { townsfolk: 3, outsiders: 0, minions: 1, demon: 1, supportsTeensyville: true },
    6: { townsfolk: 3, outsiders: 1, minions: 1, demon: 1, supportsTeensyville: true },
    7: { townsfolk: 5, outsiders: 0, minions: 1, demon: 1, supportsTeensyville: false },
    8: { townsfolk: 5, outsiders: 1, minions: 1, demon: 1, supportsTeensyville: false },
    9: { townsfolk: 5, outsiders: 2, minions: 1, demon: 1, supportsTeensyville: false },
    10: { townsfolk: 7, outsiders: 0, minions: 2, demon: 1, supportsTeensyville: false },
    11: { townsfolk: 7, outsiders: 1, minions: 2, demon: 1, supportsTeensyville: false },
    12: { townsfolk: 7, outsiders: 2, minions: 2, demon: 1, supportsTeensyville: false },
    13: { townsfolk: 9, outsiders: 0, minions: 3, demon: 1, supportsTeensyville: false },
    14: { townsfolk: 9, outsiders: 1, minions: 3, demon: 1, supportsTeensyville: false },
    15: { townsfolk: 9, outsiders: 2, minions: 3, demon: 1, supportsTeensyville: false }
  };

  const DEFAULT_PLAYER_BOUNDS = {
    min: 5,
    max: 15,
    defaultCount: 8
  };

  const BOTC_SCRIPTS = [
    {
      id: 'trouble-brewing',
      name: 'Trouble Brewing',
      editionLabel: 'Official Edition',
      tagline: 'Classic intrigue, subtle misinformation, and shadows in Ravenswood Bluff.',
      difficulty: 'Beginner',
      playerCount: '5–15 Players',
      minPlayers: 5,
      maxPlayers: 15,
      defaultPlayers: 8,
      status: 'available',
      accentVar: '--accent-tb',
      counts: {
        townsfolk: 13,
        outsiders: 4,
        minions: 4,
        demon: 1
      },
      description:
        'The quintessential Blood on the Clocktower experience. Every character has a clear, iconic ability, while hidden drunkenness, poisoning, and Scarlet Woman backups keep the village guessing until the final execution.',
      highlights: ['13 Townsfolk', '4 Outsiders', '4 Minions', '1 Demon'],
      iconKey: 'trouble-brewing'
    },
    {
      id: 'bad-moon-rising',
      name: 'Bad Moon Rising',
      editionLabel: 'Official Edition',
      tagline: 'A night of multiple deaths, dark protection, and unnatural resurrections.',
      difficulty: 'Intermediate',
      playerCount: '5–15 Players',
      minPlayers: 5,
      maxPlayers: 15,
      defaultPlayers: 8,
      status: 'available',
      accentVar: '--accent-bmr',
      counts: {
        townsfolk: 13,
        outsiders: 4,
        minions: 4,
        demon: 4
      },
      description:
        'Information comes not from what players learn, but from who lives and who dies. Expect erratic night kills, protective wards, resurrections, and four distinct Demons.',
      highlights: ['13 Townsfolk', '4 Outsiders', '4 Minions', '4 Demons'],
      iconKey: 'bad-moon-rising'
    },
    {
      id: 'sects-and-violets',
      name: 'Sects & Violets',
      editionLabel: 'Official Edition',
      tagline: 'Wild revelations, creeping madness, and shifting allegiances.',
      difficulty: 'Advanced',
      playerCount: '5–15 Players',
      minPlayers: 5,
      maxPlayers: 15,
      defaultPlayers: 8,
      status: 'available',
      accentVar: '--accent-snv',
      counts: {
        townsfolk: 13,
        outsiders: 4,
        minions: 4,
        demon: 4
      },
      description:
        'Good players gain powerful, explosive information—at the cost of rampant Vortox lies, Cerenovus madness, and the ever-present threat of changing alignments.',
      highlights: ['13 Townsfolk', '4 Outsiders', '4 Minions', '4 Demons'],
      iconKey: 'sects-and-violets'
    }
  ];

  const SCRIPT_ICONS = {
    'trouble-brewing': `
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M9 6h14l-1.6 7.2a5.5 5.5 0 0 1-5.4 4.3 5.5 5.5 0 0 1-5.4-4.3L9 6Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M16 17.5V25" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M11.5 25.5h9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        <path d="M12.5 10.5c1.2 1 2.4 1 3.5 0s2.3-1 3.5 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="16" cy="3.5" r="1.2" fill="currentColor"/>
      </svg>
    `,
    'bad-moon-rising': `
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M21.8 20.6A9.5 9.5 0 0 1 11.4 10.2a9.5 9.5 0 1 0 10.4 10.4Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M21 7l.8 2.2L24 10l-2.2.8L21 13l-.8-2.2L18 10l2.2-.8L21 7Z" fill="currentColor"/>
      </svg>
    `,
    'sects-and-violets': `
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M4.5 16S9 9.5 16 9.5 27.5 16 27.5 16 23 22.5 16 22.5 4.5 16 4.5 16Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="16" cy="16" r="3.4" stroke="currentColor" stroke-width="1.6"/>
        <circle cx="16" cy="16" r="1.2" fill="currentColor"/>
      </svg>
    `
  };

  function getAllScripts() {
    return BOTC_SCRIPTS.slice();
  }

  function getScriptById(id) {
    return BOTC_SCRIPTS.find(function (script) {
      return script.id === id;
    }) || null;
  }

  function getDefaultScript() {
    return (
      BOTC_SCRIPTS.find(function (script) {
        return script.status === 'available';
      }) || BOTC_SCRIPTS[0]
    );
  }

  function getScriptIcon(iconKey) {
    return SCRIPT_ICONS[iconKey] || SCRIPT_ICONS['trouble-brewing'];
  }

  function getPlayerBounds(scriptId) {
    const script = getScriptById(scriptId) || getDefaultScript();
    return {
      min: typeof script.minPlayers === 'number' ? script.minPlayers : DEFAULT_PLAYER_BOUNDS.min,
      max: typeof script.maxPlayers === 'number' ? script.maxPlayers : DEFAULT_PLAYER_BOUNDS.max,
      defaultCount:
        typeof script.defaultPlayers === 'number'
          ? script.defaultPlayers
          : DEFAULT_PLAYER_BOUNDS.defaultCount
    };
  }

  function getRoleDistribution(playerCount) {
    const clamped = Math.max(
      DEFAULT_PLAYER_BOUNDS.min,
      Math.min(DEFAULT_PLAYER_BOUNDS.max, Math.round(Number(playerCount) || DEFAULT_PLAYER_BOUNDS.defaultCount))
    );
    const dist = PLAYER_DISTRIBUTIONS[clamped] || PLAYER_DISTRIBUTIONS[DEFAULT_PLAYER_BOUNDS.defaultCount];
    return {
      players: clamped,
      townsfolk: dist.townsfolk,
      outsiders: dist.outsiders,
      minions: dist.minions,
      demon: dist.demon,
      supportsTeensyville: dist.supportsTeensyville
    };
  }

  const SCRIPT_DETAILS = {};

  function registerScriptDetails(scriptId, details) {
    if (!scriptId || !details) {
      return;
    }
    SCRIPT_DETAILS[scriptId] = details;
  }

  function getScriptDetails(scriptId) {
    return SCRIPT_DETAILS[scriptId] || null;
  }

  function escapeHtml(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  global.BOTC = global.BOTC || {};
  global.BOTC.escapeHtml = escapeHtml;
  global.BOTC.Scripts = {
    getAll: getAllScripts,
    getById: getScriptById,
    getDefault: getDefaultScript,
    getIcon: getScriptIcon,
    getPlayerBounds: getPlayerBounds,
    getRoleDistribution: getRoleDistribution,
    registerDetails: registerScriptDetails,
    getDetails: getScriptDetails
  };
})(window);

