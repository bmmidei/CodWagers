module.exports = {
  name: 'createtournament',
  description: 'Create Tournament',
  execute(message, args) {
    console.log("Create Tournament request received with args: " + args)

    // creates the filter where it will only look for messages sent by the message author
    const filter = response => response.author.id === message.author.id; 
    const tournament = {};
    message.channel.send("It looks like you're trying to create a tournament - Please enter the tournament name:")
      .then(() => {
        message.channel.awaitMessages(filter, { max: 1, time: 10000, errors: ['time'] })
          .then(collected => {
            tournament['name'] = collected.first().content;
            message.channel.send(`Tournament Name set to ${tournament.name}\n`);
            console.log(tournament);
          })
          .catch(collected => {
            message.channel.send('Probably took too long to respond. Timeout is set to 10 seconds');
          });
      })
      .catch(err => console.log(err));
  },
};
