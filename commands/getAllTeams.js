const db = require('../db_accessor.js')
const embedUtils = require('../embedUtils.js');

module.exports = {
  name: 'teams',
  description: 'Command to get a list of all teams in the server or tournament',
  async execute(message, args) {
    if (args.length != 1) {
      message.channel.send('You must specify whether you are requesting the teams for the server or the tournament');
    }

    if (args[0] === 'server') {
      const teams = await db.getAllTeamsInServer(message.guild.id);
      message.channel.send(embedUtils.generateTeamListInServerEmbed(teams));
      return;
    }

    if (args[0] === 'tournament') {
      const tournament = await db.getLatestTournament(message.guild.id);
      const teams = await db.getTeamsInTournament(message.guild.id, tournament.id);
      message.channel.send(embedUtils.generateTeamListInTournamentEmbed(teams, tournament.name));
      return;
    }
  }
}

function formatTeamsForOutput(teams) {
  // TODO formatting needs work. Look into discord embed objects
  // TODO bring this into a util function. It'll get used in a few places
  let out = ''
  teams.forEach(team => {
    out += 'Team Name: ' + team.teamName;
    out += '\n\nPlayers:'
    team.players.forEach((elem, idx) => {
      if (idx != 0) {out += '\n';};
      out += '\n\tActivisionID: ' + elem.activisionId;
      out += '\n\tGamertag: ' + elem.gamertag;
    })
    out += '\n';
  })
  return out;
}
