require('dotenv').config();
const db = require('../db_accessor.js')

module.exports = {
  name: 'start',
  description: 'Command to start a team\'s game session',
  async execute(message, args) {
    const prefix = process.env.TRIGGER_PHRASE;
    if (args.length == 0) {
      message.channel.send("Incorrectly formatted command\n" + 
                           "Start command must be be supplied a team name as follows:\n" +
                           prefix + " start [team name]");
    }
    const teamName = args.join(' ');

    // Check if team is registered in the tournament
    const tournament = await db.getLatestTournament(message.guild.id);
    const tournamentTeams = await db.getTeamsInTournament(message.guild.id, tournament.id);
    const tournamentTeamNames = tournamentTeams.map(team => team.teamName);
    if (!tournamentTeamNames.includes(teamName)) {
      message.channel.send('Could not start team ' + teamName + ' because it does not exist in the tournament');
      return;
    }

    const filter = msg => msg.author.id === message.author.id;
    message.channel.send('Would you like to start ' + teamName + '\'s games for the tournament ' +  tournament.name + '? (y/n) ')
      .then(() => {
        message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
          .then(async messages => {
            if (messages.first().content === 'y') {
              const m = await message.channel.send('Confirmed. Session starting...');

              // Write start time to database here
              await db.addStartTimeForTeam(message.guild.id, tournament.id, teamName);
              m.edit('Session started...good luck');
            }
            else {
              message.channel.send('Aborting...');
            }
          })
      })
      .catch((err) => {
        console.log(err);
        message.channel.send('Error starting session. Maybe a timeout?');
      });
  }
}
