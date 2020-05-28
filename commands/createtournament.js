const tournamentPrompts = [
  {
    id: 'name',
    label: 'Tournament Name',
    prompt: 'Enter the tournament name: ',
  },
  {
    id: 'ppk',
    label: 'Points per kill',
    prompt: 'Enter the desired points per kill: ',
  },
  {
    id: 'ppd',
    label: 'Points per 1000 damage',
    prompt: 'Enter the desired points per 1000 damage dealt: ',
  }
];

module.exports = {
  name: 'createtournament',
  description: 'Create Tournament',
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
              .then(messages => {
                if (messages.first().content === 'y') {
                  message.channel.send('Confirmed. Creating tournament...');

                  // write to database here
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

function createTournamentObjectForDB(responses) {
  return;
}
