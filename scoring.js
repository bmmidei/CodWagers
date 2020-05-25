////////////////////////////////////////////////////////////////////////////////
// This file is used for processing data obtained from the api
////////////////////////////////////////////////////////////////////////////////
const fs = require("fs");
const CONFIG = require("./config");
const log4js = require("log4js");
const logger = log4js.getLogger();
logger.level = CONFIG.logLevel;

CONFIG.teamData.forEach(team => {
    team.teamPlayerInfo.forEach(playerInfo => {
        logger.info("Analyzing " + playerInfo.username + "'s matches");
        const dataPath = "./player_data/player_data_" + playerInfo.username + ".json";
        if (!fs.existsSync(dataPath)) {
            logger.warn("File not found for " + playerInfo.username + "'s matches")
            return;
        }
        let matches = require(dataPath).matches;
        logger.debug("Pulled " + matches.length + " matches from file.");

        // Filter for warzone games only
        matches = filterWarzoneGamesOnly(matches);

        // Filter out matches started before start time
        const startTime = new Date(team.teamStartTime);
        matches = findAllMatchesAfterStartTime(matches, startTime);

        // Filter for matches where team members match the player's team exactly
        const teamMembers = team.teamPlayerInfo.map(player => player.username);
        matches = filterMatchesPlayedWithTeam(matches, playerInfo.username, teamMembers);

        // Sort matches by start time
        matches.sort((a, b) => (a.utcStartSeconds > b.utcStartSeconds) ? 1 : -1)

        // Take the first n games where n is parameter
        logger.debug("Taking the first " + CONFIG.numGames + " games");
        if (matches.length < CONFIG.numGames) {
            logger.error("Not enough games found for " + playerInfo.username)
            return;
        }
        matches = matches.slice(0, CONFIG.numGames);

        // Process n games and produce a score for the team
        // Later we will check that scores for all team members match
        // effectively giving us 3 players' data to confirm the scores
        const gameScores = matches.map((match, idx) => {
            matchSummary = createMatchSummary(match);
            const gameScore = scoreGame(matchSummary);
            logger.debug("Score for game " + (idx+1) + ": " + gameScore);
            logger.debug("Game ID: " + matchSummary.matchId);
            return gameScore;
        })

        // Take n best games
        logger.info("Game Scores: " + gameScores)
        const topScores = gameScores.sort((a,b) => b-a).slice(0,CONFIG.nBest);
        const arrSum = arr => arr.reduce((a,b) => a + b, 0)

        logger.info("Total score for team " + teamMembers + " : " + arrSum(topScores));
    });
})

function createMatchSummary(match) {
    logger.debug("Processing game id: " + match.matchID);
    const matchTime = new Date(match.utcStartSeconds*1000);
    logger.debug("Match started at " + matchTime.toString());

    const matchTeamId = match.player.team;
    const matchTeamData = match.rankedTeams.find(team => team.name === matchTeamId);
    const sumReducer = (accumulator, currentValue) => accumulator + currentValue;
    const matchTotalKills = matchTeamData.players.map(player => {
        const kills = player.playerStats.kills;
        logger.debug("Player " + player.username + " had " + kills + " kills")
        return kills;
    }).reduce(sumReducer);

    const matchSummary = {
        matchId: match.matchID,
        totalKills: matchTotalKills,
        placement: matchTeamData.placement
    }
    logger.debug("Total Kills: " + matchSummary.totalKills);
    logger.debug("Placement: " + matchSummary.placement);
    return matchSummary;
}

function scoreGame(matchSummary) {
    let totalPts = 0;
    const killPts = matchSummary.totalKills * CONFIG.ppk;
    logger.debug("Team kills: " + matchSummary.totalKills + " Awarding kill pts: " + killPts)
    totalPts += killPts;

    const placement = matchSummary.placement;
    let placementPts = 0;
    for (let [place, pts] of CONFIG.placementPts) {
        if (placement > place) {break;}
        placementPts = pts;
    }
    logger.debug("Team placement: " + placement + " Awarding placement pts: " + placementPts)
    totalPts += placementPts;
    return totalPts;
}

function findAllMatchesAfterStartTime(matches, startTime) {
    matches = matches.filter((match) => {
        return new Date(match.utcStartSeconds * 1000) >= startTime;
    });
    logger.debug(matches.length + " matches found after " + startTime.toUTCString());
    return matches;
}

function filterWarzoneGamesOnly(matches) {
    matches = matches.filter(match => match.gameType === "wz");
    logger.debug(matches.length + " warzone matches found");
    return matches;
}

function isMatchPlayedWithTeam(match, username, teamMembers) {
    logger.debug("Checking if match is played with team")
    logger.debug("Team members are " + teamMembers);

    const matchTeamId = match.player.team;
    const matchTeamData = match.rankedTeams.find(team => team.name === matchTeamId);
    const matchTeamMembers = matchTeamData.players.map(player => {
        return stripClanTag(player.username);
    });
    logger.debug("Team members for this match are " + matchTeamMembers);
    const setMembers = new Set([...teamMembers, ...matchTeamMembers]);
    const withTeam = ((teamMembers.length === matchTeamMembers.length) &&
                      (Array.from(setMembers).length === teamMembers.length)) ? true : false;
    logger.debug("Match played with team: " + withTeam);
    return withTeam;
}

function filterMatchesPlayedWithTeam(matches, username, teamMembers) {
    matches = matches.filter(match => isMatchPlayedWithTeam(match, username, teamMembers));
    logger.debug(matches.length + " matches found played with team");
    return matches;
}

function stripClanTag(username) {
    return username.substring(username.indexOf("]") + 1);
}
