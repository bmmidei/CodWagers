const db = require('../db_accessor.js');
const scoringUtils = require('../scoringUtils.js');
const embedUtils = require('../embedUtils.js');


module.exports = {
  name: 'summary',
  description: 'Command to get score summary for all teams',
  async execute(message, args) {
    const tournament = await db.getLatestTournament(message.guild.id);
    const teams = await db.getTeamsInTournament(message.guild.id, tournament.id);
    console.log(teams);

    const scorePromises = teams.map((team) =>{
      // Returns a promise for each serverId
      return scoringUtils.getScoreSummaryForTeam(message.guild.id, tournament, team);
    });
    const teamSummaries = await Promise.all(scorePromises);

    const tournamentSummaryEmbed = embedUtils.generateTournamentSummaryEmbed(tournament, teamSummaries);
    message.channel.send(tournamentSummaryEmbed);

  }
}
