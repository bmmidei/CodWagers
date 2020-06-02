require('dotenv').config();
const db = require('../db_accessor.js')


module.exports = {
  name: 'addteam',
  description: 'Command to add a team to a tournament',
  async execute(message, args) {
    const prefix = process.env.TRIGGER_PHRASE;
    if (args.length == 0) {
      message.channel.send("Incorrectly formatted command\n" + 
                           "Add team command must be formatted as follows:\n" +
                           prefix + " addteam [team name]");
    }
    const teamName = args.join(' ');

    // Make sure team already exists before being added to the tournament
    const team = await db.getTeamById(message.guild.id, teamName)
      .catch((err) => {
        message.channel.send(err);
        return;
      })

    // Check if team size matches the tournament team size
    const tournament  = await db.getLatestTournament(message.guild.id);
    if (team.players.length != tournament.teamSize) {
      message.channel.send('Could not add team ' + team.teamName +
        ' because the tournament team size is ' + tournament.teamSize +
        ' but there are ' + team.players.length + ' players on team ' + team.teamName + '.');
      return;
    }

    // Check if team is already registered in the tournament
    const tournamentTeams = await db.getTeamsInTournament(message.guild.id, tournament.id);
    const tournamentTeamNames = tournamentTeams.map(team => team.teamName);
    if (tournamentTeamNames.includes(team.teamName)) {
      message.channel.send('Could not add team ' + team.teamName + ' because it already exists in the tournament');
      return;
    }

    const filter = msg => msg.author.id === message.author.id;
    message.channel.send('Would you like to add ' + teamName + ' to tournament ' +  tournament.name + '? y/n')
      .then(() => {
        message.channel.awaitMessages(filter, { time: 60000, max: 1, errors: ['time'] })
          .then(async messages => {
            if (messages.first().content === 'y') {
              const m = await message.channel.send('Confirmed. Adding team...');

              // Write to database here
              await db.addTeamToTournament(message.guild.id, tournament.id, team);
              m.edit('Added team successfully');
            }
            else {
              message.channel.send('Aborting...');
            }
          })
      })
      .catch((err) => {
        console.log(err);
        message.channel.send('Error adding team. Maybe a timeout?');
      });

  }
}
