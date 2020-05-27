module.exports = this

const API = require("call-of-duty-api")({ platform: "uno" });
// Will be loaded from storage.
const teamSize = 3;

// Email login and password must be stored as environment variables
// These are the same credentials used to login to this website:
// https://my.callofduty.com/
API.login(process.env.COD_API_EMAIL, process.env.COD_API_PW)
    .then(function(res) {
      console.log("Successfully logged into COD API: " + res);
    })
    .catch(res => console.log("Failed to log into COD API: " + res));

function getMatchStartTime(match) {
  return match.utcStartSeconds;
}

function getMatchEndTime(match) {
  return match.utcEndSeconds;
}

// Currently checks if the match was played within the time range. Should be
// expanded to check if the correct team members played, and also if the match
// was marked as explicitly ignored (teammate lagged out so they're discarding
// it, etc).
function isValidMatch(match, teamData, teamConstraints) {
  if (getMatchStartTime(match) < teamConstraints.startDateTime) {
    return false;
  }

  if (getMatchEndTime(match) > teamConstraints.endDateTime) {
    return false;
  }

  // TODO: check team members and valid match id.
  return true;
}

// TODO: maybe pipe tournament-specific score settings through to here.
function computeScore(kills, placement) {
  var score = 0;

  score += kills;

  if (placement == 1) {
    score += 35;
  } else if (placement == 2) {
    score += 25;
  } else if (placement == 3) {
    score += 20;
  } else if (placement == 4) {
    score += 15;
  } else if (placement == 5) {
    score += 10;
  } else if (placement <= 10) {
    score += 5;
  } else if (placement <= 15) {
    score += 3;
  } else if (placement <= 20) {
    score += 1;
  }

  return score;
}

// Extract match data from a warzone game.
//
// Applies teamConstraints to the match and sets isValid=false if the game
// should not be counted.
function getWarzoneMatchData(match, teamConstraints) {
  const teamId = match.player.team;
  // We could potentially skip matches based on id here.
  const matchId = match.matchID;

  var teamData = {};
  var foundTeam = false;

  for (var i = 0; i < match.rankedTeams.length; i++) {
    const team = match.rankedTeams[i];

    if (team.name == teamId) {
      foundTeam = true;
      teamData = team;
      break;
    }
  }

  var matchData = {};

  if (!foundTeam || !isValidMatch(match, teamData, teamConstraints)) {
    matchData.isValid = false;
    return matchData;
  }

  matchData.isValid = true;
  matchData.startDateTime = getMatchStartTime(match);
  matchData.EndDateTime = getMatchEndTime(match);
  matchData.placement = teamData.placement;
  matchData.kills = 0;
  matchData.playerKills = {};

  teamData.players.forEach(function(player) {
    matchData.kills += player.playerStats.kills;
    matchData.playerKills[player.username] = player.playerStats.kills;
  });

  matchData.score = computeScore(matchData.kills, matchData.placement);

  // TODO: contracts??
  return matchData;
}

// Given all match data within the tournament window, compute final stats.
// Currently this just sums the top 5 games. We should pipe through the
// actual tournament constraints.
function computeFinalStats(allMatchData, numberOfGamesToCount) {
  var finalStats = {};
  finalStats.finalScore = 0;
  finalStats.matchData = [];
  finalStats.playerKills = {};
  var scoringGames = allMatchData.sort(function (a, b) {
    return b.score - a.score;
  }).slice(0, numberOfGamesToCount);

  scoringGames.forEach(function(matchData, index) {
    finalStats.finalScore += matchData.score;
    // Track full match data for a more verbose report.
    finalStats.matchData.push(matchData);

    Object.keys(matchData.playerKills).forEach(function(playerName) {
      if (playerName in finalStats.playerKills) {
        finalStats.playerKills[playerName] += matchData.playerKills[playerName];
      } else {
        finalStats.playerKills[playerName] = matchData.playerKills[playerName];
      }
    });
  });

  return finalStats;
}

// Generate a readable message from the final warzone stats for a team.
function verbalizeFinalStats(finalStats) {
  var response = "";
  response += "Final score: " + finalStats.finalScore;

  Object.keys(finalStats.playerKills).forEach(function(playerName) {
    response += "\n" + playerName + ": " + finalStats.playerKills[playerName]
      + " kills";
  });

  return response;
}

// Send response string back to Discord.
function sendResponse(msg, response) {
  msg.channel.send(response)
}

// Returns the final score for the specified activision id.
//
// Applies teamConstraints as a filter of match data to determine which games
// occurred during the tournament window.
function getWarzoneData(activisionId, teamConstraints) {
  console.log("Getting warzone data for id: " + activisionId);
  return API.MWcombatwz(activisionId).then(function(data) {
    var allMatchData = [];
    data.matches.sort(function (a, b) {
      return getMatchStartTime(a) < getMatchStartTime(b);
    }).forEach(function(match) {
      var matchData = getWarzoneMatchData(match, teamConstraints);
      if (matchData.isValid) {
        allMatchData.push(matchData);
      }
    });
    return computeFinalStats(allMatchData, /*numberOfGamesToCount=*/5);
  }).catch(err => {
    throw err;
  });
}


// command - the command to be executed
// args - array of string arguments for the command
this.handleRequest = function(command, args, msg) {
  console.log("Command: " + command + ", args: " + args);
  switch(command) {
    case "getWarzoneData":
      // TODO: load from storage based on activision id.
      var teamConstraints = {};
      teamConstraints.startDateTime = 1589691195;
      teamConstraints.endDateTime = new Date().getTime();
      getWarzoneData(args[0], teamConstraints)
        .then(function(finalStats) {
          sendResponse(msg, verbalizeFinalStats(finalStats));
        }).catch(err => console.log(err));
      break;
    default:
      console.log("Unhandled command: " + command);
      break;
  }
}
