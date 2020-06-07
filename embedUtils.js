const Discord = require('discord.js');


function generateTeamSummaryEmbed(teamSummary) {
  let gameLinks = '';
  let scores = '';
  teamSummary.gameSummaries.forEach((gameSummary, idx) => {
    gameLinks += (idx+1) + '. ' + gameSummary.matchUrl+ '\n';
    scores += gameSummary.score.toFixed(2) + '\n';
  });
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Team ' + teamSummary.teamName+ ' Scores')
    .addFields(
      { name: 'Game Link', value: gameLinks, inline: true},
      { name: 'Score', value: scores, inline: true},
    )
    .setTimestamp()
  return embed;
}

function generateTournamentSummaryEmbed(tournament, teamSummaries) {
  let teams = '';
  let scores = '';
  let gamesPlayed = '';
  teamSummaries.sort((a, b) => (a.score > b.score) ? 1 : -1)
  teamSummaries.forEach((teamSummary, idx) => {
    teams += (idx+1) + '. ' + teamSummary.teamName + '\n';
    scores += teamSummary.score.toFixed(2) + '\n';
    gamesPlayed += teamSummary.gamesPlayed+ '\n';
  });
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle(tournament.name + ' Summary')
    .addFields(
      { name: 'Team', value: teams, inline: true},
      { name: 'Score', value: scores, inline: true},
      { name: 'Games Played', value: gamesPlayed, inline: true},
    )
    .setTimestamp()
  return embed;
}

function generateTeamListInServerEmbed(teams) {
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Teams in server')
    .addFields(getTeamFields(teams))
    .setTimestamp()
  return embed
}

function generateTeamListInTournamentEmbed(teams, tournamentName) {
  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Teams in tournament ' + tournamentName)
    .addFields(getTeamFields(teams))
    .setTimestamp()
  return embed
}

function getTeamFields(teams) {
  let teamNames = '';
  let playersGamertags = '';
  let playersActivisionIds = '';
  teams.forEach(team => {
    teamNames += team.teamName + '\n\n\n\n';
    const teamGamertags = team.players.map(player => player.gamertag).join('\n');
    playersGamertags += teamGamertags + '\n';
    const teamActivisionIds = team.players.map(player => player.activisionId).join('\n');
    playersActivisionIds += teamActivisionIds + '\n';
  })

  return [
      { name: 'Team Name', value: teamNames, inline: true},
      { name: 'Gamertags', value: playersGamertags, inline: true},
      { name: 'ActivisionIds', value: playersActivisionIds, inline: true},
  ];
}

module.exports = {
  generateTournamentSummaryEmbed,
  generateTeamSummaryEmbed,
  generateTeamListInServerEmbed,
  generateTeamListInTournamentEmbed,
}
