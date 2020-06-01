const db = require('../db_accessor.js')
const api = require('../api_accessor.js');

module.exports = {
  name: 'createteam',
  description: 'Command to create a team',
  async execute(message, args) {
    message.channel.send('You are attempting to create a team on server ' + message.guild.id);
    const teamName = await queryForTeamName(message);
    const teamSize = 3; // Hardcode
    const players = [];
    for (let idx = 0; idx != teamSize; idx++) {
      let player = await queryForPlayer(message, idx);
      players.push(player);
    };
    const team = {teamName, players};
    const formattedTeam = formatTeamOutput(team);
    const m = await message.channel.send(formattedTeam + "\n\nCreating team...");
    await db.createTeam(message.guild.id, team);
    m.edit(formattedTeam + "\n\nTeam created successfully!");
  }
}

function formatTeamOutput(team) {
  out = "Team Name: " + team.teamName;
  out += "\n\nPlayers:"
  team.players.forEach((elem, idx) => {
    if (idx != 0) {out += "\n";};
    out += "\n\tActivisionID: " + elem.activisionId;
    out += "\n\tGamertag: " + elem.gamertag;
  })
  return out;
}

function queryForTeamName(message) {
  const filter = msg => msg.author.id === message.author.id;
  return new Promise((resolve,reject) => {
    message.channel.send('Please enter team name: ')
      .then(() => {
        message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
          .then(messages => {
            resolve(messages.first().content);
          })
      })
      .catch((err) => console.log(err))
  });
}

function queryForPlayer(message, idx) {
  const filter = msg => msg.author.id === message.author.id;
  return new Promise((resolve,reject) => {
    message.channel.send(`Please enter player ${(idx+1)}'s Activision ID: `)
      .then(() => {
        message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
          .then(async messages => {
            let activisionId = messages.first().content;

            // Verify ActivisionId with api
            // - Simultaneously get gamertag
            const gamertag = await api.getGamertagFromActivisionId(activisionId);

            if (gamertag){
              resolve({activisionId, gamertag});
            }
          })
      })
      .catch((err) => console.log(err))
  });
}
