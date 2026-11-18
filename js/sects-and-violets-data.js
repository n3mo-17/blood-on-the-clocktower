/**
 * Blood on the Clocktower — Sects & Violets Character, Setup & Night Order Data
 *
 * Registers all 25 Sects & Violets characters (13 Townsfolk, 4 Outsiders,
 * 4 Minions, 4 Demons), official First Night & Other Nights order, and
 * Fang Gu (+1 Outsider) / Vigormortis (-1 Outsider) setup modifiers.
 */
(function (global) {
  'use strict';

  const SECTS_AND_VIOLETS_DETAILS = {
    scriptId: 'sects-and-violets',
    characters: [
      // ── Townsfolk (13) ────────────────────────────────────────────────
      {
        id: 'clockmaker',
        name: 'Clockmaker',
        team: 'townsfolk',
        timing: 'First Night',
        ability: 'You start knowing how many steps from the Demon to its nearest Minion.',
        tip: 'On Night 1, the Storyteller counts the shortest number of seats (clockwise or counterclockwise) from the Demon to the closest Minion (adjacent = 1, one seat between = 2, etc.) and shows that number.'
      },
      {
        id: 'dreamer',
        name: 'Dreamer',
        team: 'townsfolk',
        timing: 'Each Night',
        ability: 'Each night, choose a player (not yourself): you learn 1 good and 1 evil character, 1 of which is correct.',
        tip: 'The Dreamer points to any other player. The Storyteller shows 2 character tokens—one Good and one Evil—such that one matches the chosen player\'s actual character and the other is any character of the opposite alignment.'
      },
      {
        id: 'snake-charmer',
        name: 'Snake Charmer',
        team: 'townsfolk',
        timing: 'Each Night',
        ability: 'Each night, choose an alive player: a chosen Demon swaps characters & alignments with you & is then poisoned.',
        tip: 'If a sober, healthy Snake Charmer chooses the Demon, the Storyteller swaps their characters and alignments immediately: the Snake Charmer becomes the new Evil Demon, and the former Demon becomes a Good, permanently poisoned Snake Charmer. The Storyteller wakes both to inform them of their new roles and alignments.'
      },
      {
        id: 'mathematician',
        name: 'Mathematician',
        team: 'townsfolk',
        timing: 'Each Night',
        ability: 'Each night, you learn how many players\' abilities worked abnormally (since dawn) due to another character\'s ability.',
        tip: 'Waking last each night, the Storyteller shows the count of players whose ability malfunctioned since the previous dawn due to another player\'s ability (such as Vortox false info, No Dashii/Vigormortis poison, Philosopher/Sweetheart drunkenness, or an already-drunk target).'
      },
      {
        id: 'flowergirl',
        name: 'Flowergirl',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, you learn if a Demon voted today.',
        tip: 'The Storyteller tracks whether any Demon player raised their hand to vote during the day\'s nominations, then nods "Yes" or shakes "No" to the Flowergirl that night.'
      },
      {
        id: 'town-crier',
        name: 'Town Crier',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, you learn if a Minion nominated today.',
        tip: 'The Storyteller tracks whether any Minion player made a nomination during the day, then nods "Yes" or shakes "No" to the Town Crier that night.'
      },
      {
        id: 'oracle',
        name: 'Oracle',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, you learn how many dead players are evil.',
        tip: 'Each night after the first, the Storyteller counts all currently dead players whose alignment is Evil and shows that number to the Oracle.'
      },
      {
        id: 'savant',
        name: 'Savant',
        team: 'townsfolk',
        timing: 'Day',
        ability: 'Each day, you may visit the Storyteller to learn 2 things in private: 1 is true & 1 is false.',
        tip: 'Once each day, the Savant visits the Storyteller privately to receive two factual statements about the game—exactly one is true and one is false (unless Vortox is in play, in which case both statements are false).'
      },
      {
        id: 'seamstress',
        name: 'Seamstress',
        team: 'townsfolk',
        timing: 'Once Per Game',
        ability: 'Once per game, at night, choose 2 players (not yourself): you learn if they are the same alignment.',
        tip: 'Once per game, the Seamstress points to 2 other players. The Storyteller nods "Yes" if both share the same alignment (both Good or both Evil), or shakes "No" if they are opposite alignments.'
      },
      {
        id: 'philosopher',
        name: 'Philosopher',
        team: 'townsfolk',
        timing: 'Once Per Game',
        ability: 'Once per game, at night, choose a good character: gain that ability. If this character is in play, they are drunk.',
        tip: 'Once per game, the Philosopher points to any Good character on the script sheet and gains that ability for the rest of the game. If another player already holds that character, the Storyteller marks that other player Drunk while the Philosopher is alive.'
      },
      {
        id: 'artist',
        name: 'Artist',
        team: 'townsfolk',
        timing: 'Once Per Game',
        ability: 'Once per game, during the day, privately ask the Storyteller any yes/no question.',
        tip: 'Once per game during the day, the Artist visits the Storyteller privately and asks any yes/no question about the game. The Storyteller answers truthfully with "Yes" or "No" (or falsely if Vortox is in play or the Artist is drunk/poisoned).'
      },
      {
        id: 'juggler',
        name: 'Juggler',
        team: 'townsfolk',
        timing: 'Day 1 / Night 2',
        ability: 'On your 1st day, publicly guess up to 5 players\' characters. That night, you learn how many you got correct.',
        tip: 'On Day 1 only, the Juggler may publicly announce up to 5 player-character guesses. On Night 2, the Storyteller shows the Juggler how many of those guesses were correct.'
      },
      {
        id: 'sage',
        name: 'Sage',
        team: 'townsfolk',
        timing: 'Night Trigger',
        ability: 'If the Demon kills you, you learn that it is 1 of 2 players.',
        tip: 'If a sober, healthy Sage is killed by the Demon at night, the Storyteller wakes the Sage and points to 2 players, one of whom is the Demon that killed them.'
      },

      // ── Outsiders (4) ─────────────────────────────────────────────────
      {
        id: 'mutant',
        name: 'Mutant',
        team: 'outsiders',
        timing: 'Passive',
        ability: 'If you are "mad" about being an Outsider, you might be executed.',
        tip: 'If the Mutant tries to convince the town that they are an Outsider (including claiming Mutant, Sweetheart, Barber, or Klutz), the Storyteller may execute them immediately during the day.'
      },
      {
        id: 'sweetheart',
        name: 'Sweetheart',
        team: 'outsiders',
        timing: 'Death Trigger',
        ability: 'When you die, 1 player is drunk from now on.',
        tip: 'When a sober, healthy Sweetheart dies (by night or execution), the Storyteller chooses 1 player to become permanently Drunk for the rest of the game.'
      },
      {
        id: 'barber',
        name: 'Barber',
        team: 'outsiders',
        timing: 'Death Trigger',
        ability: 'If you died today or tonight, the Demon may choose 2 players (not another Demon) to swap characters.',
        tip: 'On the night after a sober, healthy Barber dies (whether by day execution or night kill), the Storyteller wakes the Demon and shows "This character selected you" + Barber. The Demon may choose 2 non-Demon players to swap characters; the Storyteller wakes both to inform them.'
      },
      {
        id: 'klutz',
        name: 'Klutz',
        team: 'outsiders',
        timing: 'Death Trigger',
        ability: 'When you learn that you died, publicly choose 1 alive player: if they are evil, your team loses.',
        tip: 'When a sober, healthy Klutz learns they have died, they must publicly pick 1 alive player. If that player is Evil, Evil wins immediately; if Good, the game continues.'
      },

      // ── Minions (4) ───────────────────────────────────────────────────
      {
        id: 'evil-twin',
        name: 'Evil Twin',
        team: 'minions',
        timing: 'Setup / Passive',
        ability: 'You & an opposing player know each other. If the good player is executed, evil wins. Good can\'t win if you both live.',
        tip: 'During setup, the Storyteller designates one Good player as the Good Twin. On Night 1, the Storyteller wakes both twins together so they see each other and shows the Evil Twin the Good Twin\'s character token. Good cannot win while both twins are alive, and if the Good Twin is executed, Evil wins immediately.'
      },
      {
        id: 'witch',
        name: 'Witch',
        team: 'minions',
        timing: 'Each Night',
        ability: 'Each night, choose a player: if they nominate tomorrow, they die. If just 3 players live, you lose this ability.',
        tip: 'Each night while 4 or more players are alive, the Witch places a Cursed marker on a player. If that player makes a nomination tomorrow, they die immediately (the nomination still proceeds). When 3 or fewer players remain alive, the Witch stops waking.'
      },
      {
        id: 'cerenovus',
        name: 'Cerenovus',
        team: 'minions',
        timing: 'Each Night',
        ability: 'Each night, choose a player & a good character: they are "mad" they are this character tomorrow, or might be executed.',
        tip: 'Each night, the Cerenovus points to a player and a Good character on the script. The Storyteller wakes that player, shows "This character selected you" + Cerenovus + the chosen Good character, and marks them Mad. If they fail to genuinely claim to be that character tomorrow, the Storyteller may execute them.'
      },
      {
        id: 'pit-hag',
        name: 'Pit-Hag',
        team: 'minions',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose a player & a character they become (if not in play). If a Demon is made, deaths tonight are arbitrary.',
        tip: 'Each night after the first, the Pit-Hag chooses a player and any not-in-play character. The Storyteller updates that player\'s role in the Grimoire and wakes them with "You are" + the new character (keeping their current alignment). If a new Demon is created, the Storyteller decides who dies tonight.'
      },

      // ── Demons (4) ────────────────────────────────────────────────────
      {
        id: 'fang-gu',
        name: 'Fang Gu',
        team: 'demon',
        timing: 'Setup / Each Night (Not 1st)',
        setupTag: '+1 Outsider',
        ability: 'Each night but the first, choose a player: they die. The 1st Outsider this kills becomes an evil Fang Gu & you die instead. [+1 Outsider]',
        tip: 'During setup, replace 1 Townsfolk with 1 Outsider. The first time a sober, healthy Fang Gu kills an Outsider at night, the old Fang Gu dies instead and the Outsider becomes an Evil Fang Gu (the Storyteller wakes them with "You are" + Fang Gu + Evil thumbs-down). This jump happens at most once per game.'
      },
      {
        id: 'vigormortis',
        name: 'Vigormortis',
        team: 'demon',
        timing: 'Setup / Each Night (Not 1st)',
        setupTag: '-1 Outsider',
        ability: 'Each night but the first, choose a player: they die. Minions you kill keep their ability & poison 1 Townsfolk neighbor. [-1 Outsider]',
        tip: 'During setup (when at least 1 Outsider is in play), replace 1 Outsider with 1 Townsfolk. Whenever the Vigormortis kills a Minion at night, that dead Minion keeps their ability for the rest of the game and the Storyteller marks one of that Minion\'s Townsfolk neighbors permanently Poisoned.'
      },
      {
        id: 'no-dashii',
        name: 'No Dashii',
        team: 'demon',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose a player: they die. Your 2 Townsfolk neighbors are poisoned.',
        tip: 'The No Dashii\'s nearest Townsfolk clockwise and nearest Townsfolk counterclockwise (skipping over Outsiders and Minions, alive or dead) are permanently Poisoned while the No Dashii is alive.'
      },
      {
        id: 'vortox',
        name: 'Vortox',
        team: 'demon',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose a player: they die. Townsfolk abilities yield false info. Each day, if no-one is executed, evil wins.',
        tip: 'While the Vortox is alive, every Townsfolk ability must yield strictly false information (Outsiders, Minions, and Demons are unaffected). At the end of every day, if no player was executed, Evil wins immediately.'
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
          note: 'Standard games only (skipped in Teensyville): The Storyteller wakes the Demon, points out their Minions, and shows 3 not-in-play Good bluffs.'
        },
        {
          id: 'philosopher',
          name: 'Philosopher',
          team: 'townsfolk',
          note: 'May use their once-per-game ability to choose a Good character to gain (making any in-play holder Drunk).'
        },
        {
          id: 'snake-charmer',
          name: 'Snake Charmer',
          team: 'townsfolk',
          note: 'Chooses an alive player; if they pick the Demon, they swap characters & alignments and the former Demon is poisoned.'
        },
        {
          id: 'evil-twin',
          name: 'Evil Twin',
          team: 'minions',
          note: 'Wake the Evil Twin and Good Twin together so they make eye contact. Show the Evil Twin the Good Twin\'s character token, and show the Good Twin the Evil Twin token.'
        },
        {
          id: 'witch',
          name: 'Witch',
          team: 'minions',
          note: 'Chooses a player to Curse; if that player nominates tomorrow, they die immediately.'
        },
        {
          id: 'cerenovus',
          name: 'Cerenovus',
          team: 'minions',
          note: 'Chooses a player and a Good character; the Storyteller wakes that player to inform them they are Mad as that character tomorrow.'
        },
        {
          id: 'clockmaker',
          name: 'Clockmaker',
          team: 'townsfolk',
          note: 'The Storyteller shows the shortest number of steps from the Demon to its nearest Minion.'
        },
        {
          id: 'dreamer',
          name: 'Dreamer',
          team: 'townsfolk',
          note: 'Chooses a player (not themselves) and is shown 1 Good and 1 Evil character (one is correct).'
        },
        {
          id: 'seamstress',
          name: 'Seamstress',
          team: 'townsfolk',
          note: 'If unused, may choose 2 other players and learn whether they share the same alignment.'
        },
        {
          id: 'mathematician',
          name: 'Mathematician',
          team: 'townsfolk',
          note: 'The Storyteller shows how many players\' abilities worked abnormally since dawn due to another character\'s ability.'
        }
      ],
      otherNights: [
        {
          id: 'philosopher',
          name: 'Philosopher',
          team: 'townsfolk',
          note: 'If unused, may choose a Good character to gain its ability (making any in-play holder Drunk).'
        },
        {
          id: 'snake-charmer',
          name: 'Snake Charmer',
          team: 'townsfolk',
          note: 'Chooses an alive player; if they pick the Demon, they swap characters & alignments and the former Demon is poisoned.'
        },
        {
          id: 'witch',
          name: 'Witch',
          team: 'minions',
          note: 'Only wakes if 4 or more players are alive: chooses a player to Curse for tomorrow\'s nominations.'
        },
        {
          id: 'cerenovus',
          name: 'Cerenovus',
          team: 'minions',
          note: 'Chooses a player and a Good character to make them Mad as tomorrow.'
        },
        {
          id: 'pit-hag',
          name: 'Pit-Hag',
          team: 'minions',
          note: 'Chooses a player and a not-in-play character they become (update their role in the Grimoire and wake them).'
        },
        {
          id: 'fang-gu',
          name: 'Fang Gu',
          team: 'demon',
          note: 'Chooses a player to kill. The 1st Outsider killed becomes an Evil Fang Gu and the old Fang Gu dies instead.'
        },
        {
          id: 'vigormortis',
          name: 'Vigormortis',
          team: 'demon',
          note: 'Chooses a player to kill. Minions killed by the Vigormortis keep their abilities and poison 1 Townsfolk neighbor.'
        },
        {
          id: 'no-dashii',
          name: 'No Dashii',
          team: 'demon',
          note: 'Chooses a player to kill. Its 2 nearest Townsfolk neighbors remain poisoned.'
        },
        {
          id: 'vortox',
          name: 'Vortox',
          team: 'demon',
          note: 'Chooses a player to kill. Remember: all Townsfolk information must be strictly false!'
        },
        {
          id: 'barber',
          name: 'Barber',
          team: 'outsiders',
          note: 'Only triggers if the Barber died today or tonight: the Storyteller wakes the Demon to optionally swap 2 non-Demon players\' characters.'
        },
        {
          id: 'sweetheart',
          name: 'Sweetheart',
          team: 'outsiders',
          note: 'Only triggers if the Sweetheart died today or tonight: the Storyteller chooses 1 player to become permanently Drunk.'
        },
        {
          id: 'sage',
          name: 'Sage',
          team: 'townsfolk',
          note: 'Only wakes if killed tonight by the Demon: the Storyteller points to 2 players, one of whom is the Demon.'
        },
        {
          id: 'dreamer',
          name: 'Dreamer',
          team: 'townsfolk',
          note: 'Chooses a player (not themselves) and is shown 1 Good and 1 Evil character (one is correct).'
        },
        {
          id: 'flowergirl',
          name: 'Flowergirl',
          team: 'townsfolk',
          note: 'The Storyteller nods "Yes" or shakes "No" for whether a Demon voted today.'
        },
        {
          id: 'town-crier',
          name: 'Town Crier',
          team: 'townsfolk',
          note: 'The Storyteller nods "Yes" or shakes "No" for whether a Minion nominated today.'
        },
        {
          id: 'oracle',
          name: 'Oracle',
          team: 'townsfolk',
          note: 'The Storyteller shows how many currently dead players are Evil.'
        },
        {
          id: 'seamstress',
          name: 'Seamstress',
          team: 'townsfolk',
          note: 'If unused, may choose 2 other players and learn whether they share the same alignment.'
        },
        {
          id: 'juggler',
          name: 'Juggler',
          team: 'townsfolk',
          note: 'Only wakes on Night 2 if they publicly juggled on Day 1: the Storyteller shows how many guesses were correct.'
        },
        {
          id: 'mathematician',
          name: 'Mathematician',
          team: 'townsfolk',
          note: 'The Storyteller shows how many players\' abilities worked abnormally since dawn due to another character\'s ability.'
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

      const hasFangGu = Array.isArray(selectedIds) && selectedIds.indexOf('fang-gu') !== -1;
      const hasVigor = Array.isArray(selectedIds) && selectedIds.indexOf('vigormortis') !== -1;

      if (hasFangGu && adjusted.outsiders < 4 && adjusted.townsfolk > 0) {
        adjusted.outsiders += 1;
        adjusted.townsfolk -= 1;
        adjusted.modifiers.push({
          id: 'fang-gu',
          label: 'Fang Gu: -1 Townsfolk, +1 Outsider'
        });
      }

      if (hasVigor && adjusted.outsiders > 0) {
        adjusted.outsiders -= 1;
        adjusted.townsfolk += 1;
        adjusted.modifiers.push({
          id: 'vigormortis',
          label: 'Vigormortis: +1 Townsfolk, -1 Outsider'
        });
      }

      return adjusted;
    }
  };

  if (global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.registerDetails) {
    global.BOTC.Scripts.registerDetails('sects-and-violets', SECTS_AND_VIOLETS_DETAILS);
  }
})(window);

