const db = require('../db_accessor.js');
const scoringUtils = require('../scoringUtils.js');
const embedUtils = require('../embedUtils.js');


module.exports = {
  name: 'teamscore',
  description: 'Command to get score summary for all teams',
  async execute(message, args) {
    if (args.length == 0) {
      const prefix = process.env.TRIGGER_PHRASE;
      message.channel.send("Incorrectly formatted command\n" + 
                           "Team Score command must be formatted as follows:\n" +
                           prefix + " teamscore [team name]");
    }
    const teamName = args.join(' ');

    // Make sure team name is in the tournament
    const tournament = await db.getLatestTournament(message.guild.id);
    const team = await db.getTeamInTournamentByTeamName(message.guild.id, tournament.id, teamName)
      .catch((err) => {
        message.channel.send(err);
        return;
      })

    const teamSummary = await scoringUtils.getScoreSummaryForTeam(message.guild.id, tournament, team);
    console.log(teamSummary);

    const teamSummaryEmbed = embedUtils.generateTeamSummaryEmbed(teamSummary);
    message.channel.send(teamSummaryEmbed);
  }
}
