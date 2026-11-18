/**
 * Blood on the Clocktower — Trouble Brewing Character & Night Order Data
 *
 * Registers the complete 22-character Trouble Brewing script (13 Townsfolk,
 * 4 Outsiders, 4 Minions, 1 Demon) plus official First Night & Other Nights order.
 */
(function (global) {
  'use strict';

  const TROUBLE_BREWING_DETAILS = {
    scriptId: 'trouble-brewing',
    characters: [
      // ── Townsfolk (13) ────────────────────────────────────────────────
      {
        id: 'washerwoman',
        name: 'Washerwoman',
        team: 'townsfolk',
        timing: 'First Night',
        ability: 'You start knowing that 1 of 2 players is a particular Townsfolk.',
        tip: 'The Storyteller shows one in-play Townsfolk token and points to two players—one is that Townsfolk and the other is any other player (not the Washerwoman). The Storyteller does not show the Drunk as a Townsfolk unless the Washerwoman is poisoned. A Spy may register as a Townsfolk.'
      },
      {
        id: 'librarian',
        name: 'Librarian',
        team: 'townsfolk',
        timing: 'First Night',
        ability: 'You start knowing that 1 of 2 players is a particular Outsider. (Or that zero are in play.)',
        tip: 'The Storyteller shows one in-play Outsider token (the Drunk counts as an Outsider) and points to two players—one is that Outsider and the other is any other player. If zero Outsiders are in play, the Storyteller shows a "0" hand signal instead. A Spy may register as an Outsider.'
      },
      {
        id: 'investigator',
        name: 'Investigator',
        team: 'townsfolk',
        timing: 'First Night',
        ability: 'You start knowing that 1 of 2 players is a particular Minion.',
        tip: 'The Storyteller shows one in-play Minion token and points to two players—one is that Minion and the other is any other player. The Recluse may register as a Minion for this check.'
      },
      {
        id: 'chef',
        name: 'Chef',
        team: 'townsfolk',
        timing: 'First Night',
        ability: 'You start knowing how many pairs of evil players there are.',
        tip: 'The Storyteller shows the number of adjacent pairs of evil players seated next to each other (for example, 3 evil players in a row count as 2 pairs; 2 separate pairs also count as 2). The Recluse may register as evil and the Spy may register as good.'
      },
      {
        id: 'empath',
        name: 'Empath',
        team: 'townsfolk',
        timing: 'Each Night',
        ability: 'Each night, you learn how many of your 2 alive neighbors are evil.',
        tip: 'The Storyteller checks the Empath\'s nearest alive neighbor clockwise and nearest alive neighbor counterclockwise (skipping dead players), then shows 0, 1, or 2 for how many are evil. The Recluse may register as evil and the Spy may register as good.'
      },
      {
        id: 'fortune-teller',
        name: 'Fortune Teller',
        team: 'townsfolk',
        timing: 'Each Night',
        ability: 'Each night, choose 2 players: you learn if either is a Demon. There is a good player that registers as a Demon to you.',
        tip: 'During setup, the Storyteller places the Red Herring reminder on one good player (this can be the Fortune Teller); it stays on that player all game. Each night, the Storyteller nods "Yes" if either chosen player is the Demon, the Red Herring, or a misregistering Recluse—otherwise shakes "No".'
      },
      {
        id: 'undertaker',
        name: 'Undertaker',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, you learn which character died by execution today.',
        tip: 'The Storyteller only wakes the Undertaker if a player died by execution today (including a Virgin execution; skipped if no one was executed). The Storyteller shows the executed player\'s true character token (for example, the Drunk token, not the Townsfolk they think they are). The Recluse or Spy may misregister.'
      },
      {
        id: 'monk',
        name: 'Monk',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose a player (not yourself): they are safe from the Demon tonight.',
        tip: 'The Storyteller places the Safe reminder on the chosen player until dusk. If the Imp targets that player while the Monk is sober and healthy, the attack fails and no one dies tonight. Protection does not block the Poisoner.'
      },
      {
        id: 'ravenkeeper',
        name: 'Ravenkeeper',
        team: 'townsfolk',
        timing: 'Night Trigger',
        ability: 'If you die at night, you are woken to choose a player: you learn their character.',
        tip: 'If a sober, healthy Ravenkeeper dies at night (from the Imp or a Mayor redirect), the Storyteller wakes them right after the Imp\'s turn to point at any player—alive or dead—and shows them that player\'s character token. This does not trigger if the Ravenkeeper is executed during the day.'
      },
      {
        id: 'virgin',
        name: 'Virgin',
        team: 'townsfolk',
        timing: 'Day Trigger',
        ability: 'The 1st time you are nominated, if the nominator is a Townsfolk, they are executed immediately.',
        tip: 'Only the very first nomination the Virgin receives is checked; even if that nominator is not a Townsfolk, the ability is spent. If a sober, healthy Virgin is nominated by a Townsfolk (or a misregistering Spy), that nominator is executed immediately and the day ends. The Drunk is an Outsider and does not trigger the Virgin.'
      },
      {
        id: 'slayer',
        name: 'Slayer',
        team: 'townsfolk',
        timing: 'Once Per Game',
        ability: 'Once per game, during the day, publicly choose a player: if they are the Demon, they die.',
        tip: 'Any player may publicly claim Slayer once per day, though only the real, sober, healthy Slayer\'s shot works (once per game). If the target is the Demon (or a misregistering Recluse), the Storyteller announces that the target dies immediately—the Scarlet Woman can still become the Imp if 5+ players were alive. If the shot misses, the Storyteller announces that nothing happens.'
      },
      {
        id: 'soldier',
        name: 'Soldier',
        team: 'townsfolk',
        timing: 'Passive',
        ability: 'You are safe from the Demon.',
        tip: 'If the Imp targets a sober, healthy Soldier at night, the attack fails and no one dies. If the Soldier is poisoned by the Poisoner that night, their ability does not work and they die normally.'
      },
      {
        id: 'mayor',
        name: 'Mayor',
        team: 'townsfolk',
        timing: 'Passive',
        ability: 'If only 3 players live & no execution occurs, your team wins. If you die at night, another player might die instead.',
        tip: 'If exactly 3 players are alive at the end of the day and no execution occurs (including due to a tied vote), Good wins immediately—unless the Mayor is poisoned. If the Imp targets a sober, healthy Mayor at night, the Storyteller may redirect the kill to any other player (including an evil player, or a dead player so no one dies).'
      },

      // ── Outsiders (4) ─────────────────────────────────────────────────
      {
        id: 'butler',
        name: 'Butler',
        team: 'outsiders',
        timing: 'Each Night',
        ability: 'Each night, choose a player (not yourself): tomorrow, you may only vote if they are voting too.',
        tip: 'Each night, the Butler points to any other player (alive or dead) as their master. Tomorrow, the Butler may nominate freely, but may only raise their hand to vote if their master\'s hand is raised or already counted. Once dead, the Butler has no restriction on their ghost vote.'
      },
      {
        id: 'drunk',
        name: 'Drunk',
        team: 'outsiders',
        timing: 'Setup / Passive',
        setupTag: 'Uses Fake Townsfolk',
        ability: 'You do not know you are the Drunk. You think you are a Townsfolk character, but you are not.',
        tip: 'The Storyteller does not put the Drunk token in the bag; instead, the Storyteller adds one extra not-in-play Townsfolk token and marks whichever player draws it with "Is the Drunk". The Storyteller wakes and treats that player as that Townsfolk, but their ability does not work—the Storyteller may give them false (or occasionally true) information.'
      },
      {
        id: 'recluse',
        name: 'Recluse',
        team: 'outsiders',
        timing: 'Passive',
        ability: 'You might register as evil & as a Minion or Demon, even if dead.',
        tip: 'The Recluse is still on the Good team, but on each individual ability check (Chef, Empath, Investigator, Fortune Teller, Undertaker, Slayer, etc.), the Storyteller may choose for them to register as evil, a Minion, or a Demon—even after death. Each check is decided independently.'
      },
      {
        id: 'saint',
        name: 'Saint',
        team: 'outsiders',
        timing: 'Passive',
        ability: 'If you die by execution, your team loses.',
        tip: 'If a sober, healthy Saint dies by execution (including by nominating the Virgin), Evil wins immediately. Dying at night to the Demon—or being executed while poisoned—does not end the game.'
      },

      // ── Minions (4) ───────────────────────────────────────────────────
      {
        id: 'poisoner',
        name: 'Poisoner',
        team: 'minions',
        timing: 'Each Night',
        ability: 'Each night, choose a player: they are poisoned tonight and tomorrow day.',
        tip: 'The Storyteller places the Poisoned reminder on the chosen player each night (removing it from the previous target). While poisoned, that player\'s ability has no effect and the Storyteller may give them false information, though the Storyteller still wakes them normally. If the Poisoner dies, the Storyteller immediately removes the Poisoned reminder.'
      },
      {
        id: 'spy',
        name: 'Spy',
        team: 'minions',
        timing: 'Each Night',
        ability: 'Each night, you see the Grimoire. You might register as good & as a Townsfolk or Outsider, even if dead.',
        tip: 'The Storyteller wakes the Spy each night and lets them inspect the entire Grimoire (all characters, reminder tokens, and statuses). The Spy is still Evil, but on any individual Good ability check (Washerwoman, Librarian, Chef, Empath, Undertaker, Virgin, etc.), the Storyteller may register them as Good, a Townsfolk, or an Outsider—even after death.'
      },
      {
        id: 'scarlet-woman',
        name: 'Scarlet Woman',
        team: 'minions',
        timing: 'Passive',
        ability: 'If there are 5 or more players alive & the Demon dies, you become the Demon.',
        tip: 'The Storyteller counts living players before the Demon dies. If 5 or more players are alive and the Scarlet Woman is alive and not poisoned, the game continues—the Storyteller swaps their token to the Imp in the Grimoire and wakes them that night to show "You are" + the Imp token.'
      },
      {
        id: 'baron',
        name: 'Baron',
        team: 'minions',
        timing: 'Setup',
        setupTag: '+2 Outsiders',
        ability: 'There are extra Outsiders in play. [+2 Outsiders]',
        tip: 'During setup before handing out tokens, the Storyteller replaces 2 Townsfolk with 2 Outsiders (capped at the 4 Outsiders in Trouble Brewing). This setup change is permanent even if the Baron later dies or is poisoned.'
      },

      // ── Demon (1) ─────────────────────────────────────────────────────
      {
        id: 'imp',
        name: 'Imp',
        team: 'demon',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose a player: they die. If you kill yourself this way, a Minion becomes the Imp.',
        tip: 'Each night after the first, the Imp points to any player to kill (targeting a dead player causes no new death). If a sober, healthy Imp targets themselves, they die and the Storyteller chooses one alive Minion to become the new Imp (if the Scarlet Woman is alive, the Storyteller must pick them). The Storyteller wakes the new Imp right away and shows "You are" + the Imp token.'
      }
    ],

    nightOrder: {
      firstNight: [
        {
          id: 'minion-info',
          name: 'Minion Info',
          team: 'system',
          note: 'Standard games only (skipped in Teensyville): The Storyteller wakes all Minions together and points out who the Demon is.'
        },
        {
          id: 'demon-info',
          name: 'Demon Info',
          team: 'system',
          note: 'Standard games only (skipped in Teensyville): The Storyteller wakes the Demon, points out their Minions, and shows 3 not-in-play Good character tokens as bluffs.'
        },
        {
          id: 'poisoner',
          name: 'Poisoner',
          team: 'minions',
          note: 'Wakes to choose a player to poison tonight and tomorrow day.'
        },
        {
          id: 'washerwoman',
          name: 'Washerwoman',
          team: 'townsfolk',
          note: 'Shown 1 in-play Townsfolk token and pointed to 2 players (one is that Townsfolk).'
        },
        {
          id: 'librarian',
          name: 'Librarian',
          team: 'townsfolk',
          note: 'Shown 1 in-play Outsider token and pointed to 2 players (or shown "0" if no Outsiders are in play).'
        },
        {
          id: 'investigator',
          name: 'Investigator',
          team: 'townsfolk',
          note: 'Shown 1 in-play Minion token and pointed to 2 players (one is that Minion).'
        },
        {
          id: 'chef',
          name: 'Chef',
          team: 'townsfolk',
          note: 'Shown the number of adjacent pairs of evil players seated next to each other.'
        },
        {
          id: 'empath',
          name: 'Empath',
          team: 'townsfolk',
          note: 'Shown 0, 1, or 2 for how many of their 2 alive neighbors are evil.'
        },
        {
          id: 'fortune-teller',
          name: 'Fortune Teller',
          team: 'townsfolk',
          note: 'Chooses 2 players and learns "Yes" or "No" for whether either is a Demon (or their Red Herring).'
        },
        {
          id: 'butler',
          name: 'Butler',
          team: 'outsiders',
          note: 'Chooses a player (not themselves) whose vote they must follow tomorrow.'
        },
        {
          id: 'spy',
          name: 'Spy',
          team: 'minions',
          note: 'Views the entire Grimoire (all roles, reminders, and statuses).'
        }
      ],
      otherNights: [
        {
          id: 'poisoner',
          name: 'Poisoner',
          team: 'minions',
          note: 'Moves the Poisoned reminder to a newly chosen player.'
        },
        {
          id: 'monk',
          name: 'Monk',
          team: 'townsfolk',
          note: 'Chooses a player (not themselves) to protect from the Demon tonight.'
        },
        {
          id: 'spy',
          name: 'Spy',
          team: 'minions',
          note: 'Views the updated Grimoire.'
        },
        {
          id: 'scarlet-woman',
          name: 'Scarlet Woman',
          team: 'minions',
          note: 'If the Demon died today while 5 or more players were alive, the Storyteller wakes the Scarlet Woman to show "You are" + the Imp.'
        },
        {
          id: 'imp',
          name: 'Imp',
          team: 'demon',
          note: 'Chooses any player to kill—or kills themselves to die and pass the Imp role to an alive Minion (Scarlet Woman first if alive).'
        },
        {
          id: 'ravenkeeper',
          name: 'Ravenkeeper',
          team: 'townsfolk',
          note: 'Only wakes if killed tonight while sober and healthy: chooses any player and learns their character.'
        },
        {
          id: 'undertaker',
          name: 'Undertaker',
          team: 'townsfolk',
          note: 'Only wakes if a player died by execution today: learns that executed player\'s character.'
        },
        {
          id: 'empath',
          name: 'Empath',
          team: 'townsfolk',
          note: 'Shown 0, 1, or 2 for how many of their 2 alive neighbors are evil.'
        },
        {
          id: 'fortune-teller',
          name: 'Fortune Teller',
          team: 'townsfolk',
          note: 'Chooses 2 players and learns "Yes" or "No" for whether either is a Demon (or their Red Herring).'
        },
        {
          id: 'butler',
          name: 'Butler',
          team: 'outsiders',
          note: 'Chooses a player (not themselves) whose vote they must follow tomorrow.'
        }
      ]
    },

    adjustDistribution: function (baseDist, selectedIds) {
      const adjusted = {
        players: baseDist.players,
        townsfolk: baseDist.townsfolk,
        outsiders: baseDist.outsiders,
        minions: baseDist.minions,
        demon: baseDist.demon,
        modifiers: []
      };

      const hasBaron = Array.isArray(selectedIds) && selectedIds.indexOf('baron') !== -1;
      if (hasBaron) {
        const maxOutsiders = 4;
        const delta = Math.min(2, maxOutsiders - adjusted.outsiders, adjusted.townsfolk);
        if (delta > 0) {
          adjusted.outsiders += delta;
          adjusted.townsfolk -= delta;
          adjusted.modifiers.push({
            id: 'baron',
            label: 'Baron: -' + delta + ' Townsfolk, +' + delta + ' Outsiders'
          });
        }
      }

      return adjusted;
    }
  };

  if (global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.registerDetails) {
    global.BOTC.Scripts.registerDetails('trouble-brewing', TROUBLE_BREWING_DETAILS);
  }
})(window);
