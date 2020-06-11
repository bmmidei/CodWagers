const Discord = require('discord.js');
const AsciiTable = require('ascii-table')


function createTeamsTable(teams) {
  const table = new AsciiTable()
  table.setHeading('Name', 'Gamertag')
  teams.forEach(team => {
    team.players.forEach((player, idx) => {
      if (idx == 0) {
        table.addRow(team.teamName, player.gamertag);
      } else {
        table.addRow('', player.gamertag);
      }
    })
  })
  return '```' + table.toString() + '```';
}

function generateTeamListInServerEmbed(teams) {
  if (teams.length === 0) {
    return 'No teams registered in server';
  }

  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Teams in server')
    .addFields({ name: '\u200B', value: createTeamsTable(teams) })
    .setTimestamp()
  return embed
}

function generateTeamListInTournamentEmbed(teams, tournamentName) {
  if (teams.length === 0) {
    return 'No teams registered for tournament ' + tournamentName;
  }

  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Teams in tournament ' + tournamentName)
    .addFields({ name: '\u200B', value: createTeamsTable(teams) })
    .setTimestamp()
  return embed
}

function createTeamSummaryTable(teamSummary) {
  const table = new AsciiTable();
  table.setHeading(' ', 'Place', 'Kills', 'Dmg', 'Score');
  teamSummary.gameSummaries.forEach((gameSummary, idx) => {
    const placement = gameSummary.scoreSummary.find(elem => elem.label === 'Placement');
    const kills = gameSummary.scoreSummary.find(elem => elem.label === 'Kills');
    const dmg = gameSummary.scoreSummary.find(elem => elem.label === 'Damage');
    table.addRow(`${idx+1}.`,
                 placement.value,
                 kills.value,
                 dmg.value.toFixed(0),
                 gameSummary.score.toFixed(2));
  });
  return '```' + table.toString() + '```';
}

function generateTeamSummaryEmbed(teamSummary) {
  const gameLinks = teamSummary.gameSummaries.map((gameSummary, idx) => {
    return `[Game ${idx+1}](${gameSummary.matchUrl})`;
  }).join(' ');
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Team ' + teamSummary.teamName+ ' Scores')
    .addFields({ name: '\u200B', value: createTeamSummaryTable(teamSummary) })
    .addFields({ name: 'Game Links', value: gameLinks })
    .setTimestamp()
  return embed;

  }

function generateTournamentSummaryEmbed(tournament, teamSummaries) {

  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(tournament.name + ' Summary')
    .addFields({ name: '\u200B', value: createTournamentTable(teamSummaries) })
    .setTimestamp()
  return embed;
}

function createTournamentTable(teamSummaries) {
  const table = new AsciiTable();
  table.setHeading('Team Name', 'Score', 'Games Played')
  teamSummaries.sort((a, b) => (a.score > b.score) ? -1 : 1);
  teamSummaries.forEach(teamSummary => {
    table.addRow(teamSummary.teamName,
                 teamSummary.score.toFixed(2),
                 teamSummary.gamesPlayed);
  });

  return '```' + table.toString() + '```';
}


module.exports = {
  generateTournamentSummaryEmbed,
  generateTeamSummaryEmbed,
  generateTeamListInServerEmbed,
  generateTeamListInTournamentEmbed,
}
