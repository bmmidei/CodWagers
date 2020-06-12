const Discord = require('discord.js');
const AsciiTable = require('ascii-table')
require('dotenv').config();

const prefix = process.env.TRIGGER_PHRASE;


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

  if (teamSummary.gameSummaries.length === 0) {
    return 'No games played';
  }

  const gameLinks= teamSummary.gameSummaries.map((gameSummary, idx) => {
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

function generateHelpEmbed() {
  const createTeam = 'Create a new team in the server. You must create a team before you add it to the active tournament' +
                     `\n\`${prefix} createteam Team1\` will add "Team1" to the server`;
 
  const addTeam = 'Add an existing team (already registered on the server) to the active tournament' +
                  `\n\`${prefix} addteam Team1\` will add "Team1" to the active tournament`;

  const teams = 'Get all teams in the server or in the active tournament' +
                  `\n\`${prefix} teams server\` will get all teams in the server` +
                  `\n\`${prefix} teams tournament\` will get all teams in the active tournament`;

  const summary = 'Get a summary of the active tournament' +
                  `\n\`${prefix} summary\` will produce a tournament summary`;

  const teamScore = 'Get a score report for a single team for the active tournament' +
                    `\n\`${prefix} teamscore Team1\` will produce a score report for Team1`;

  const start = 'Signal to the scoring system that you would like to start the game session for a team' +
                    `\n\`${prefix} start Team1\` will start the game session for Team1. Games following this time will be scored`;

  const ping = 'A simple command to test if the discord bot is responding to requests' +
               `\n\`${prefix} ping\``;

  const embed = new Discord.MessageEmbed()
    .setColor('#0099ff')
    .setTitle('Help Documentation')
    .addFields(
      { name: 'Create Team', value: createTeam},
      { name: 'Add Team', value: addTeam},
      { name: 'List Teams', value: teams},
      { name: 'Start', value: start},
      { name: 'Summary', value: summary},
      { name: 'Team Score', value: teamScore},
      { name: 'Ping', value: ping})
    .setTimestamp()
  return embed;
 
}

module.exports = {
  generateTournamentSummaryEmbed,
  generateTeamSummaryEmbed,
  generateTeamListInServerEmbed,
  generateTeamListInTournamentEmbed,
  generateHelpEmbed,
}
