const db = require('./db_accessor.js')


async function getScoreSummaryForTeam(serverId, tournament, team) {
  return new Promise(async (resolve, reject) => {
    if (!team.hasOwnProperty('startTime')) {
      return resolve({gameSummaries: [],
                      teamName: team.teamName,
                      gamesPlayed: 0,
                      score: 0.0});
    }

    const player = team.players[Math.floor(Math.random() * team.players.length)];
    console.log('Analyzing matches from team: ' + team.teamName + ', player: ' + player.gamertag)

    let matches = await db.getAllMatchesInServer(serverId);
    matches = matches.filter((match) => {
      //return new Date(match.utcStartSeconds * 1000) >= team.startTime;
      return new Date(match.utcStartSeconds * 1000) >= new Date(1591403447000);
      // return new Date(* 1000) >= team.startTime;
    });

    const teamGamertags = team.players.map(player => player.gamertag);
    matches = filterMatchesPlayedWithTeam(matches, player.gamertag, teamGamertags);

    // Sort matches by start time
    matches.sort((a, b) => (a.utcStartSeconds > b.utcStartSeconds) ? 1 : -1)

    // Take the first n games where n is parameter
    matches = matches.slice(0, tournament.rules.numGames.value);

    // Filter matches in some "ignore" list

    gameSummaries = matches.map(match => generateGameSummary(match, tournament.rules));
    teamSummary = {}
    teamSummary['gameSummaries'] = gameSummaries;
    teamSummary['teamName'] = team.teamName;
    teamSummary['gamesPlayed'] = matches.length;
    teamSummary['score'] = generateTotalScore(gameSummaries);
    resolve(teamSummary);
  });
}

function generateTotalScore(gameSummaries, nBest) {
  const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
  const gameScores = gameSummaries.map(gameSummary => generateGameScore(gameSummary));
  const topScores = gameScores.sort((a,b) => b-a).slice(0, nBest);
  return topScores.reduce(sumReducer);
}

function generateGameScore(gameSummary) {
  const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
  return gameSummary.scoreSummary.map(score => {
    return score.awardedPts
  }).reduce(sumReducer);
}


function generateGameSummary(match, rules) {
  const gameSummary = {};
  const matchTeamId = match.player.team;
  const matchTeamData = match.rankedTeams.find(team => team.name === matchTeamId);
  gameSummary['matchUrl'] = 'https://cod.tracker.gg/warzone/match/' + match.matchID;
  gameSummary['scoreSummary'] = [];
  gameSummary['scoreSummary'].push(generatePlacementSummary(matchTeamData, rules.placementPts));
  gameSummary['scoreSummary'].push(generateKillSummary(matchTeamData, rules.killPts));
  gameSummary['scoreSummary'].push(generateDamageSummary(matchTeamData, rules.damagePts));
  gameSummary['score'] = gameSummary.scoreSummary.map(score => score.awardedPts).reduce((a, b) => a + b);

  return gameSummary;
}

function generatePlacementSummary(matchTeamData, placementPts) {
  const placement = matchTeamData.placement;
  let awardedPts = 0;
  for (let elem of placementPts.value) {
    if (placement > elem.place) {break;}
    awardedPts = elem.pts;
  }
  return {label: 'Placement', value: placement, awardedPts};
}

function generateKillSummary(matchTeamData, killPts) {
  const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
  const matchTotalKills = matchTeamData.players.map(player => {
    const kills = player.playerStats.kills;
    return kills;
  }).reduce(sumReducer);
  const awardedPts = killPts.value * matchTotalKills;
  return {label: 'Kills', value: matchTotalKills, awardedPts};
}

function generateDamageSummary(matchTeamData, damagePts) {
  const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
  const matchTotalDamage = matchTeamData.players.map(player => {
    const damage = player.playerStats.damageDone;
    return damage;
  }).reduce(sumReducer);
  const awardedPts = damagePts.value * matchTotalDamage / 1000;
  return {label: 'Damage', value: matchTotalDamage, awardedPts};
}

function isMatchPlayedWithTeam(match, gamertag, teamGamertags) {
  const matchTeamId = match.player.team;
  const matchTeamData = match.rankedTeams.find(team => team.name === matchTeamId);
  const matchTeamGamertags = matchTeamData.players.map(player => {
    return stripClanTag(player.username);
  });
  const setGamertags = new Set([...teamGamertags, ...matchTeamGamertags]);
  return ((teamGamertags.length === matchTeamGamertags.length) &&
          (Array.from(setGamertags).length === teamGamertags.length)) ? true : false;
}

function filterMatchesPlayedWithTeam(matches, gamertag, teamGamertags) {
  return matches.filter(match => isMatchPlayedWithTeam(match, gamertag, teamGamertags));
}

function stripClanTag(username) {
  return username.substring(username.indexOf("]") + 1);
}

module.exports = {
  getScoreSummaryForTeam,
}

