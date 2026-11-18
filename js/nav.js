/**
 * Blood on the Clocktower — Shared Navigation Controller
 *
 * Manages the responsive navbar, hamburger drawer, and active session pill
 * across all pages.
 */
(function (global, doc) {
  'use strict';

  let menuBtn = null;
  let drawer = null;
  let sessionPill = null;
  let sessionPillText = null;
  let drawerSession = null;
  let drawerSessionText = null;

  function setMenuOpen(isOpen) {
    if (!menuBtn || !drawer) {
      return;
    }
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    menuBtn.classList.toggle('is-open', isOpen);
    drawer.hidden = !isOpen;
    drawer.classList.toggle('is-open', isOpen);
  }

  function syncSessionPill() {
    if (!global.BOTC || !global.BOTC.Storage || !global.BOTC.Scripts) {
      return;
    }

    const saved = global.BOTC.Storage.load();
    const script =
      global.BOTC.Scripts.getById(saved.selectedScript) ||
      global.BOTC.Scripts.getDefault();
    const hasSession = Boolean(saved.gmName && saved.updatedAt);

    const summaryText = hasSession
      ? 'GM: ' + saved.gmName + ' · ' + saved.playerCount + 'P · ' + script.name
      : '';

    if (sessionPill && sessionPillText) {
      sessionPill.hidden = !hasSession;
      sessionPillText.textContent = summaryText;
    }

    if (drawerSession && drawerSessionText) {
      drawerSession.hidden = !hasSession;
      drawerSessionText.textContent = summaryText;
    }
  }

  function initNav() {
    menuBtn = doc.getElementById('nav-menu-btn');
    drawer = doc.getElementById('mobile-nav-drawer');
    sessionPill = doc.getElementById('session-pill');
    sessionPillText = doc.getElementById('session-pill-text');
    drawerSession = doc.getElementById('drawer-session');
    drawerSessionText = doc.getElementById('drawer-session-text');

    syncSessionPill();

    if (!menuBtn || !drawer) {
      return;
    }

    menuBtn.addEventListener('click', function (event) {
      event.stopPropagation();
      const isCurrentlyOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      setMenuOpen(!isCurrentlyOpen);
    });

    // Close when clicking a navigation link inside the drawer
    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a')) {
        setMenuOpen(false);
      }
    });

    // Close when clicking outside the header
    doc.addEventListener('click', function (event) {
      if (menuBtn.getAttribute('aria-expanded') !== 'true') {
        return;
      }
      if (!event.target.closest('.site-header')) {
        setMenuOpen(false);
      }
    });

    // Close on Escape
    doc.addEventListener('keydown', function (event) {
      if (
        event.key === 'Escape' &&
        menuBtn.getAttribute('aria-expanded') === 'true'
      ) {
        setMenuOpen(false);
        menuBtn.focus();
      }
    });

    // Auto-close mobile drawer when viewport widens past hamburger breakpoint
    if (global.matchMedia) {
      const desktopMq = global.matchMedia('(min-width: 721px)');
      const handleMqChange = function (e) {
        if (e.matches) {
          setMenuOpen(false);
        }
      };
      if (desktopMq.addEventListener) {
        desktopMq.addEventListener('change', handleMqChange);
      } else if (desktopMq.addListener) {
        desktopMq.addListener(handleMqChange);
      }
    }
  }

  global.BOTC = global.BOTC || {};
  global.BOTC.Nav = {
    syncSessionPill: syncSessionPill,
    closeMenu: function () {
      setMenuOpen(false);
    }
  };

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', initNav);
  } else {
    initNav();
  }
})(window, document);

