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
