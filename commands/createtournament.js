const db = require('../db_accessor.js')

// Hardcoding some rules. We should figure out a way for the user to input these data
const placementPtValues = [
  {place: 20, pts: 1},
  {place: 15, pts: 3},
  {place: 10, pts: 5},
  {place: 5, pts: 10},
  {place: 4, pts: 15},
  {place: 3, pts: 20},
  {place: 2, pts: 25},
  {place: 1, pts: 35}
];

const rules = {
  killPts: {
    label: 'Points per Kill',
    value: 2
  },
  damagePts: {
    label: 'Points per 1000 damage',
    value: 1
  },
  placementPts: {
    label: 'Placement Points Breakdown',
    value: placementPtValues
  },
  numGames: {
    label: 'Total Number of Games',
    value: 7
  },
  nBest: {
    label: 'Number of games scored',
    value: 5
  },
}

const tournamentPrompts = [
  {
    id: 'name',
    label: 'Tournament Name',
    prompt: 'Enter the tournament name: ',
  },
  {
    id: 'teamSize',
    label: 'Size of each team',
    prompt: 'Enter the number of players on each team: ',
  },
  {
    id: 'numGames',
    label: 'Number of games played',
    prompt: 'Enter the number of total games each team will play: ',
  },
  {
    id: 'nBest',
    label: 'Number of games scored',
    prompt: 'Enter the number of games to be scored: ',
  },
];

module.exports = {
  name: 'createtournament',
  description: 'Command to create a tournament',
  async execute(message, args) {
    const initialPrompt = 'You are attempting to create a tournament. Please answer the following prompts.\n' +
                          'If at any time you would like to exit, send the message \"quit\". You can review the responses before submitting.';

    await message.channel.send(initialPrompt);

    const questions = tournamentPrompts.map(elem => elem.prompt);

    await message.channel.send(questions[0]);

    const filter = msg => msg.author.id === message.author.id; // creates the filter where it will only look for messages sent by the message author
    const collector = message.channel.createMessageCollector(filter, { time: 60 * 1000 }); // creates a message collector with a time limit of 60 seconds - upon that, it'll emit the 'end' event

    const responses = [];

    collector.on('collect', msg => { // when the collector finds a new message
      responses.push(msg.content);
      questions.shift();
      if (msg.content === 'quit') return collector.stop('quit');
      if (questions.length <= 0) return collector.stop('done'); // sends a string so we know the collector is done with the answers
      message.channel.send(questions[0]).catch(error => { // catch the error if the question message was deleted - or you could create a new question message
        console.error(error);
        collector.stop();
      });
    });

    collector.on('end', (collected, reason) => {
      if (reason && reason === 'quit') {
        message.channel.send('Discarding... You may start a new request at any time!');
      }
      else if (reason && reason === 'time') {
        message.channel.send('You took too long. Aborting...');
      }
      else if (reason && reason === 'done') {
        message.channel.send(printTournamentDataForReview(responses))
          .then(() => {
            message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
              .then(async messages => {
                if (messages.first().content === 'y') {
                  message.channel.send('Confirmed. Creating tournament...');

                  // Write to database here
                  const tournament = createTournamentObjectForDB(message, responses);
                  const tournamentId = await db.createTournament(message.guild.id, tournament);
                  message.channel.send('Created tournament successfully!\n Tournament ID: ' + tournamentId);
                }
                else {
                  message.channel.send('Aborting...');
                }
              })
          })
          .catch((err) => {
            console.log(err);
            message.channel.send('Error creating tournament. Maybe a timeout?');
          });
      }
    });
  }
}


function printTournamentDataForReview(responses) {
  response = 'Creating tournament with: \n';
  tournamentPrompts.forEach((elem, idx) => {
    response += elem.label + ': ' + responses[idx] + '\n';
  });
  response += 'Type \'y\' to confirm, \'n\' to cancel request:';
  return response;
}

function createTournamentObjectForDB(message, responses) {
  const tournament = {};
  tournamentPrompts.forEach((elem, idx) => {
    tournament[elem.id] = responses[idx];
  })
  tournament['createdAt'] = Date.now();
  tournament['admin'] = message.author.id;
  tournament['rules'] = rules;
  return tournament;
}
