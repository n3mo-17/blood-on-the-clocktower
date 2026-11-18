/**
 * Blood on the Clocktower — Bad Moon Rising Character, Setup & Night Order Data
 *
 * Registers all 25 Bad Moon Rising characters (13 Townsfolk, 4 Outsiders,
 * 4 Minions, 4 Demons), official First Night & Other Nights order, and
 * Godfather's [-1 or +1 Outsider] setup modifier.
 */
(function (global) {
  'use strict';

  const BAD_MOON_RISING_DETAILS = {
    scriptId: 'bad-moon-rising',
    characters: [
      // ── Townsfolk (13) ────────────────────────────────────────────────
      {
        id: 'grandmother',
        name: 'Grandmother',
        team: 'townsfolk',
        timing: 'First Night',
        ability: 'You start knowing a good player & their character. If the Demon kills them, you die too.',
        tip: 'On Night 1, the Storyteller points to one good player (the Grandchild) and shows their character token. If the Demon kills the Grandchild at night while the Grandmother is sober and healthy, the Grandmother dies that same night.'
      },
      {
        id: 'sailor',
        name: 'Sailor',
        team: 'townsfolk',
        timing: 'Each Night',
        ability: 'Each night, choose an alive player: either you or they are drunk until dusk. You can\'t die.',
        tip: 'The Sailor chooses any alive player (including themselves). If they choose themselves or an evil player, the Storyteller makes the Sailor drunk; if they choose another good player, the Storyteller chooses whether the Sailor or the chosen player is drunk until dusk. While sober and healthy, the Sailor cannot die by night or execution.'
      },
      {
        id: 'chambermaid',
        name: 'Chambermaid',
        team: 'townsfolk',
        timing: 'Each Night',
        ability: 'Each night, choose 2 alive players (not yourself): you learn how many woke tonight due to their ability.',
        tip: 'Waking last each night, the Chambermaid points to 2 alive players (not themselves). The Storyteller shows 0, 1, or 2 for how many of those players woke earlier tonight because of their own character ability (Minion Info and Demon Info do not count; a Lunatic waking counts).'
      },
      {
        id: 'exorcist',
        name: 'Exorcist',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose a player (different to last night): the Demon, if chosen, learns who you are then doesn\'t wake tonight.',
        tip: 'If the Exorcist picks the Demon while sober and healthy, the Storyteller wakes the Demon, shows "This character selected you" + the Exorcist token, points to the Exorcist, and skips the Demon\'s kill turn tonight.'
      },
      {
        id: 'innkeeper',
        name: 'Innkeeper',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose 2 players: they can\'t die tonight, but 1 is drunk until dusk.',
        tip: 'The Storyteller places Safe markers on both chosen players for tonight (blocking Demon, Gambler, Gossip, Moonchild, and Godfather kills, though not the Assassin) and marks 1 of the two players Drunk until dusk.'
      },
      {
        id: 'gambler',
        name: 'Gambler',
        team: 'townsfolk',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose a player & guess their character: if you guess wrong, you die.',
        tip: 'The Gambler points to any player and indicates a character on the script sheet. If the guess is wrong and the Gambler is sober, healthy, and unprotected, the Storyteller kills the Gambler tonight.'
      },
      {
        id: 'gossip',
        name: 'Gossip',
        team: 'townsfolk',
        timing: 'Day',
        ability: 'Each day, you may make a public statement. Tonight, if it was true, a player dies.',
        tip: 'During the day, the Gossip may make one public statement. If the Gossip is sober and healthy that night and the statement was factually true when spoken, the Storyteller chooses any player to die tonight.'
      },
      {
        id: 'courtier',
        name: 'Courtier',
        team: 'townsfolk',
        timing: 'Once Per Game',
        ability: 'Once per game, at night, choose a character: they are drunk for 3 nights & 3 days.',
        tip: 'Once per game, the Courtier points to any character on the script sheet (even if not in play). If that character is in play, the Storyteller marks that player Drunk for the next 3 nights and 3 days.'
      },
      {
        id: 'professor',
        name: 'Professor',
        team: 'townsfolk',
        timing: 'Once Per Game',
        ability: 'Once per game, at night (not the first), choose a dead player: if they are a Townsfolk, they are resurrected.',
        tip: 'Once per game on Night 2 or later, the Professor points to a dead player. If that player is a Townsfolk and the Professor is sober and healthy, the Storyteller restores them to Alive at dawn.'
      },
      {
        id: 'minstrel',
        name: 'Minstrel',
        team: 'townsfolk',
        timing: 'Passive',
        ability: 'When a Minion dies by execution, all other players are drunk until dusk tomorrow.',
        tip: 'If a Minion dies by execution while the Minstrel is alive and sober, every other player is drunk tonight and throughout tomorrow day until dusk.'
      },
      {
        id: 'tea-lady',
        name: 'Tea Lady',
        team: 'townsfolk',
        timing: 'Passive',
        ability: 'If both your alive neighbors are good, they can\'t die.',
        tip: 'The Storyteller checks the Tea Lady\'s nearest alive clockwise and counterclockwise neighbors. If both are good and the Tea Lady is sober and healthy, neither neighbor can die by night or execution (except to the Assassin).'
      },
      {
        id: 'pacifist',
        name: 'Pacifist',
        team: 'townsfolk',
        timing: 'Passive',
        ability: 'Executed good players might not die.',
        tip: 'Whenever a good player is executed while the Pacifist is alive and sober, the Storyteller may announce that the executed player survives instead of dying.'
      },
      {
        id: 'fool',
        name: 'Fool',
        team: 'townsfolk',
        timing: 'Passive',
        ability: 'The 1st time you die, you don\'t.',
        tip: 'The first time a sober, healthy Fool would die (by night or execution, except to the Assassin), they survive and their ability is spent.'
      },

      // ── Outsiders (4) ─────────────────────────────────────────────────
      {
        id: 'goon',
        name: 'Goon',
        team: 'outsiders',
        timing: 'Passive',
        ability: 'Each night, the 1st player to choose you with their ability is drunk until dusk. You become their alignment.',
        tip: 'The first player each night to target a sober, healthy Goon with an ability becomes drunk until dusk, and the Goon changes to match that player\'s alignment (the Storyteller wakes the Goon to inform them if their alignment flipped).'
      },
      {
        id: 'lunatic',
        name: 'Lunatic',
        team: 'outsiders',
        timing: 'Setup / Each Night',
        setupTag: 'Uses Fake Demon',
        ability: 'You think you are a Demon, but you are not. The Demon knows who you are & who you choose at night.',
        tip: 'During setup, the Storyteller places a Demon token into the bag for the Lunatic instead of the Lunatic token. The Lunatic wakes on Night 1 for fake Demon Info (in standard games) and wakes before the real Demon on Other Nights; the Storyteller tells the real Demon who the Lunatic is and whom the Lunatic chose.'
      },
      {
        id: 'tinker',
        name: 'Tinker',
        team: 'outsiders',
        timing: 'Passive',
        ability: 'You might die at any time.',
        tip: 'While the Tinker is alive and sober, the Storyteller may kill the Tinker at any moment—during the night or even in the middle of the day.'
      },
      {
        id: 'moonchild',
        name: 'Moonchild',
        team: 'outsiders',
        timing: 'Death Trigger',
        ability: 'When you learn that you died, publicly choose 1 alive player. Tonight, if it was a good player, they die.',
        tip: 'When the Moonchild learns they have died, they publicly pick one alive player. If that player is good (and the Moonchild is sober and healthy), the Storyteller kills that chosen player tonight.'
      },

      // ── Minions (4) ───────────────────────────────────────────────────
      {
        id: 'godfather',
        name: 'Godfather',
        team: 'minions',
        timing: 'Setup / Night Trigger',
        setupTag: '-1 or +1 Outsider',
        ability: 'You start knowing which Outsiders are in play. If 1 died today, choose a player tonight: they die. [-1 or +1 Outsider]',
        tip: 'During setup, the Storyteller adds or removes 1 Outsider. On Night 1, the Storyteller shows the Godfather all Outsider tokens in play. On any night after an Outsider died during the day, the Godfather wakes to choose a player to kill.'
      },
      {
        id: 'devils-advocate',
        name: 'Devil\'s Advocate',
        team: 'minions',
        timing: 'Each Night',
        ability: 'Each night, choose a living player (different to last night): if executed tomorrow, they don\'t die.',
        tip: 'Each night, the Devil\'s Advocate chooses a living player (not the same player two nights in a row). If that player is executed tomorrow while the Devil\'s Advocate is alive and sober, they survive the execution.'
      },
      {
        id: 'assassin',
        name: 'Assassin',
        team: 'minions',
        timing: 'Once Per Game',
        ability: 'Once per game, at night (not the first), choose a player: they die, even if for some reason they could not.',
        tip: 'Once per game on Night 2 or later, the Assassin may point to any player to kill them—bypassing Sailor, Innkeeper, Tea Lady, and Fool protections.'
      },
      {
        id: 'mastermind',
        name: 'Mastermind',
        team: 'minions',
        timing: 'Passive',
        ability: 'If the Demon dies by execution (ending the game), play for 1 more day. If a player is then executed, their team loses.',
        tip: 'If the Demon dies by execution while the Mastermind is alive and sober, the game does not end immediately. One final day is played; if a player is executed on that extra day, that executed player\'s team loses (if no one is executed, Good wins).'
      },

      // ── Demons (4) ────────────────────────────────────────────────────
      {
        id: 'zombuul',
        name: 'Zombuul',
        team: 'demon',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, if no-one died today, choose a player: they die. The 1st time you die, you live but register as dead.',
        tip: 'The Zombuul only wakes at night if zero players died during the preceding day. The first time the Zombuul dies, the Storyteller marks them Fake Dead (they register as dead and lose nominations, but remain alive and still wake on nights after deathless days).'
      },
      {
        id: 'pukka',
        name: 'Pukka',
        team: 'demon',
        timing: 'Each Night',
        ability: 'Each night, choose a player: they are poisoned. The previously poisoned player dies then becomes healthy.',
        tip: 'The Pukka wakes starting on Night 1 to poison a player. On Night 2 and onward, the Pukka chooses a new player to poison, and the previously Pukka-poisoned player dies tonight and becomes healthy.'
      },
      {
        id: 'shabaloth',
        name: 'Shabaloth',
        team: 'demon',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, choose 2 players: they die. A dead player you chose last night might be regurgitated.',
        tip: 'Each night after the first, the Shabaloth chooses 2 players to die. Before dawn, the Storyteller may choose to resurrect one dead player whom the Shabaloth targeted on the previous night.'
      },
      {
        id: 'po',
        name: 'Po',
        team: 'demon',
        timing: 'Each Night (Not 1st)',
        ability: 'Each night but the first, you may choose a player: they die. If your last choice was no-one, choose 3 players tonight.',
        tip: 'Each night after the first, the Po may either choose 1 player to kill or shake their head to charge (killing no one tonight). After charging, the Po chooses 3 players to kill on the following night.'
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
          id: 'lunatic',
          name: 'Lunatic',
          team: 'outsiders',
          note: 'Standard games only: The Storyteller wakes the Lunatic for fake Demon Info (fake Minions and 3 bluffs). If the Lunatic thinks they are the Pukka, they also choose a Night 1 target.'
        },
        {
          id: 'demon-info',
          name: 'Demon Info',
          team: 'system',
          note: 'Standard games only (skipped in Teensyville): The Storyteller wakes the Demon, points out their Minions (plus the Lunatic if in play), and shows 3 not-in-play Good bluffs.'
        },
        {
          id: 'sailor',
          name: 'Sailor',
          team: 'townsfolk',
          note: 'Chooses an alive player; the Storyteller marks either the Sailor or the chosen player Drunk until dusk.'
        },
        {
          id: 'courtier',
          name: 'Courtier',
          team: 'townsfolk',
          note: 'May use their once-per-game ability to choose a character to make Drunk for 3 nights and 3 days.'
        },
        {
          id: 'godfather',
          name: 'Godfather',
          team: 'minions',
          note: 'The Storyteller shows the Godfather which Outsider character tokens are in play.'
        },
        {
          id: 'devils-advocate',
          name: 'Devil\'s Advocate',
          team: 'minions',
          note: 'Chooses a living player who will survive if executed tomorrow.'
        },
        {
          id: 'pukka',
          name: 'Pukka',
          team: 'demon',
          note: 'Chooses a player to poison tonight (they will die on Night 2).'
        },
        {
          id: 'grandmother',
          name: 'Grandmother',
          team: 'townsfolk',
          note: 'The Storyteller points to one good player (the Grandchild) and shows their character token.'
        },
        {
          id: 'chambermaid',
          name: 'Chambermaid',
          team: 'townsfolk',
          note: 'Chooses 2 alive players (not themselves) and learns how many woke tonight due to their ability.'
        }
      ],
      otherNights: [
        {
          id: 'minstrel',
          name: 'Minstrel',
          team: 'townsfolk',
          note: 'Storyteller reminder: If a Minion died by execution today, all other players are drunk until dusk tomorrow.'
        },
        {
          id: 'sailor',
          name: 'Sailor',
          team: 'townsfolk',
          note: 'Chooses an alive player; either the Sailor or the chosen player is Drunk until dusk.'
        },
        {
          id: 'innkeeper',
          name: 'Innkeeper',
          team: 'townsfolk',
          note: 'Chooses 2 players: both are protected from death tonight, and the Storyteller marks 1 of them Drunk until dusk.'
        },
        {
          id: 'courtier',
          name: 'Courtier',
          team: 'townsfolk',
          note: 'If unused, may choose a character to make Drunk for 3 nights and 3 days.'
        },
        {
          id: 'gambler',
          name: 'Gambler',
          team: 'townsfolk',
          note: 'Chooses a player and guesses their character; if wrong, the Gambler dies tonight.'
        },
        {
          id: 'devils-advocate',
          name: 'Devil\'s Advocate',
          team: 'minions',
          note: 'Chooses a living player (different from last night) who will survive execution tomorrow.'
        },
        {
          id: 'lunatic',
          name: 'Lunatic',
          team: 'outsiders',
          note: 'Wakes to choose night target(s) as their believed Demon. The Storyteller then informs the real Demon of the Lunatic\'s choice.'
        },
        {
          id: 'exorcist',
          name: 'Exorcist',
          team: 'townsfolk',
          note: 'Chooses a player (different from last night). If the Demon is chosen, the Demon learns who the Exorcist is and does not wake tonight.'
        },
        {
          id: 'zombuul',
          name: 'Zombuul',
          team: 'demon',
          note: 'Only wakes if no one died today: chooses a player to kill.'
        },
        {
          id: 'pukka',
          name: 'Pukka',
          team: 'demon',
          note: 'Chooses a new player to poison; the previously Pukka-poisoned player dies and becomes healthy.'
        },
        {
          id: 'shabaloth',
          name: 'Shabaloth',
          team: 'demon',
          note: 'Chooses 2 players to kill. The Storyteller may regurgitate a dead player chosen by the Shabaloth last night.'
        },
        {
          id: 'po',
          name: 'Po',
          team: 'demon',
          note: 'May choose 1 player to kill, or charge (choose no one) to kill 3 players next night. If charged last night, chooses 3 players.'
        },
        {
          id: 'assassin',
          name: 'Assassin',
          team: 'minions',
          note: 'If unused, may choose any player to die tonight—ignoring all death protections.'
        },
        {
          id: 'godfather',
          name: 'Godfather',
          team: 'minions',
          note: 'Only wakes if an Outsider died today: chooses a player to die tonight.'
        },
        {
          id: 'professor',
          name: 'Professor',
          team: 'townsfolk',
          note: 'If unused, may choose a dead player; if they are a Townsfolk, they are resurrected.'
        },
        {
          id: 'gossip',
          name: 'Gossip',
          team: 'townsfolk',
          note: 'Storyteller check: If the Gossip made a true public statement today, choose a player to die tonight.'
        },
        {
          id: 'tinker',
          name: 'Tinker',
          team: 'outsiders',
          note: 'Storyteller option: The Tinker may die at any time, including tonight.'
        },
        {
          id: 'moonchild',
          name: 'Moonchild',
          team: 'outsiders',
          note: 'Only triggers if the Moonchild died today and publicly picked a good player: that chosen player dies tonight.'
        },
        {
          id: 'grandmother',
          name: 'Grandmother',
          team: 'townsfolk',
          note: 'Storyteller check: If the Demon killed the Grandchild tonight, the Grandmother dies too.'
        },
        {
          id: 'chambermaid',
          name: 'Chambermaid',
          team: 'townsfolk',
          note: 'Chooses 2 alive players (not themselves) and learns how many woke tonight due to their ability.'
        }
      ]
    },

    adjustDistribution: function (baseDist, selectedIds, options) {
      const adjusted = {
        players: baseDist.players,
        townsfolk: baseDist.townsfolk,
        outsiders: baseDist.outsiders,
        minions: baseDist.minions,
        demon: baseDist.demon,
        modifiers: []
      };

      const hasGodfather = Array.isArray(selectedIds) && selectedIds.indexOf('godfather') !== -1;
      if (hasGodfather) {
        const requested = options && options.godfatherDelta === -1 ? -1 : 1;
        let delta = requested;
        if (delta === -1 && adjusted.outsiders <= 0) {
          delta = 1;
        }
        if (delta === 1 && adjusted.outsiders >= 4) {
          delta = -1;
        }
        adjusted.outsiders += delta;
        adjusted.townsfolk -= delta;
        adjusted.modifiers.push({
          id: 'godfather',
          label:
            delta > 0
              ? 'Godfather: -1 Townsfolk, +1 Outsider'
              : 'Godfather: +1 Townsfolk, -1 Outsider'
        });
      }

      return adjusted;
    }
  };

  if (global.BOTC && global.BOTC.Scripts && global.BOTC.Scripts.registerDetails) {
    global.BOTC.Scripts.registerDetails('bad-moon-rising', BAD_MOON_RISING_DETAILS);
  }
})(window);

