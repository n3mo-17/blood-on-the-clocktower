/**
 * Blood on the Clocktower — Theme Manager
 *
 * Manages the 3 dark themes across all pages:
 *   - gothic   : Monochrome black & white with surgical bits of colour
 *   - infernal : Deep flame blues & blazing oranges with flame-tip highlights
 *   - sanguine : Deep maroons, oxblood, and blood-crimson reds
 *
 * Loaded synchronously in <head> so the saved theme applies before first paint.
 */
(function (global, doc) {
  'use strict';

  const THEME_STORAGE_KEY = 'botc_theme';
  const DEFAULT_THEME = 'gothic';

  const THEMES = [
    {
      id: 'gothic',
      name: 'Gothic',
      tagline: 'Ink, bone & crimson',
      metaColor: '#09090b',
      swatches: ['#131317', '#eceef2', '#a82a38']
    },
    {
      id: 'infernal',
      name: 'Infernal',
      tagline: 'Soot blue & ember',
      metaColor: '#070a10',
      swatches: ['#101722', '#5284b0', '#c4571f']
    },
    {
      id: 'sanguine',
      name: 'Sanguine',
      tagline: 'Oxblood & maroon',
      metaColor: '#0c0507',
      swatches: ['#231015', '#7d1a28', '#a32436']
    }
  ];

  const VALID_IDS = THEMES.map(function (t) {
    return t.id;
  });

  function sanitizeTheme(themeId) {
    return VALID_IDS.indexOf(themeId) !== -1 ? themeId : DEFAULT_THEME;
  }

  function readSavedTheme() {
    try {
      const saved = global.localStorage.getItem(THEME_STORAGE_KEY);
      return sanitizeTheme(saved);
    } catch (_err) {
      return DEFAULT_THEME;
    }
  }

  function getThemeMeta(themeId) {
    const id = sanitizeTheme(themeId);
    return (
      THEMES.find(function (t) {
        return t.id === id;
      }) || THEMES[0]
    );
  }

  function applyTheme(themeId) {
    const valid = sanitizeTheme(themeId);
    doc.documentElement.setAttribute('data-theme', valid);

    const metaEl = doc.querySelector('meta[name="theme-color"]');
    if (metaEl) {
      metaEl.setAttribute('content', getThemeMeta(valid).metaColor);
    }
    return valid;
  }

  function setTheme(themeId) {
    const valid = applyTheme(themeId);
    try {
      global.localStorage.setItem(THEME_STORAGE_KEY, valid);
    } catch (_err) {
      // Ignore storage failures in restricted contexts
    }
    return valid;
  }

  // Apply immediately on parse to avoid any flash of wrong theme
  applyTheme(readSavedTheme());

  global.BOTC = global.BOTC || {};
  global.BOTC.Theme = {
    THEMES: THEMES,
    DEFAULT_THEME: DEFAULT_THEME,
    get: readSavedTheme,
    set: setTheme,
    apply: applyTheme
  };
})(window, document);

