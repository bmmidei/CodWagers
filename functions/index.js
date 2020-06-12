const functions = require('firebase-functions');
const admin = require('firebase-admin')
admin.initializeApp();
const firestore = admin.firestore()

const API = require('call-of-duty-api')({ platform: 'uno' });

exports.populateDbWithNewTournamentGames = functions.pubsub.schedule('*/20 * * * *')
  .timeZone('America/New_York')
  .onRun(async context => {
    console.log('Populate tournament games to be run every 20 minutes');
    const value = await addGamesToFirestore();
    console.log('Finished populating games!');
  });

exports.cleanOldDbGames = functions.pubsub.schedule('0 0 * * *')
  .timeZone('America/New_York')
  .onRun(async context => {
    console.log('Clearing database games older than a week');
    const value = await cleanFirestoreGames();
    console.log('Finished cleaning games from DB!');
  });

function cleanFirestoreGames() {
  return new Promise(async (resolve, reject) => {
    // Run this function for all servers in the database
    const serverSnapshot = await firestore.collection('servers').get()
    const serverIds = serverSnapshot.docs.map(doc => doc.id);
    console.log('Found Server IDs: ' + serverIds);

    const serverActions = serverIds.map((serverId) =>{
      // Returns a promise for each serverId
      return removeGamesForServer(serverId);
    });

    // We now have a promises array and we want to wait for it
    const results = Promise.all(serverActions);

    results.then(() => {
      resolve('Success removing games for all servers');
    }).catch((err) => {
      reject('Error removing games for all servers\n' + err);
    })
  })
}

function addGamesToFirestore() {
  return new Promise(async (resolve, reject) => {
    // Run this function for all servers in the database
    const serverSnapshot = await firestore.collection('servers').get()
    const serverIds = serverSnapshot.docs.map(doc => doc.id);
    console.log('Found Server IDs: ' + serverIds);

    const serverActions = serverIds.map((serverId) =>{
      // Returns a promise for each serverId
      return addGamesForServer(serverId);
    });

    // We now have a promises array and we want to wait for it
    const results = Promise.all(serverActions);

    results.then(() => {
      resolve('Success adding games for all servers');
    }).catch((err) => {
      reject('Error adding games for all servers\n' + err);
    })
  })
}

function removeGamesForServer(serverId) {
  return new Promise(async (resolve, reject) => {
    // Remove all games older than one week
    let lastWeek = new Date()
    lastWeek.setDate(lastWeek.getDate() - 7);

    let query = firestore.collection('servers')
                         .doc(serverId)
                         .collection('matches')
                         .where('utcStartSeconds', '<', lastWeek.getTime()/1000);
    query.get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        doc.ref.delete();
      });
    });
    resolve('Success writing for all teams in server: ' + serverId);
  })
}

function addGamesForServer(serverId) {
  return new Promise(async (resolve, reject) => {
    // Get all matchIds in the server
    const existingMatchesInServer = await getAllMatchIdsInServer(serverId);
    const teams = await getAllTeamsInServer(serverId);
    const teamActions = teams.map((team) =>{
      // Returns a promise for each serverId
      return processTeamData(team, serverId, existingMatchesInServer);
    });

    // we now have a promises array and we want to wait for it
    const results = Promise.all(teamActions);

    results.then(() => {
      resolve('Success writing for all teams in server: ' + serverId);
    }).catch((err) => {
      reject('Error writing for all teams in server: ' + serverId + '\n' + err);
    })
  })
}

function processTeamData(team, serverId, existingMatchesInServer) {
  return new Promise(async (resolve, reject) => {
    // get a random player for each team. We should only need one player's data
    // and randomness will allow for errors in data gathering for isolated activisionIds
    const player = team.players[Math.floor(Math.random() * team.players.length)];
    console.log('Analyzing matches from team: ' + team.teamName + ', player: ' + player.gamertag);

    // Query data for this player from the CoD API
    const data = await getMatchesForActivisionId(player.activisionId);
    if (!data) {
      console.log('No data found for ' + player.gamertag);
      return;
    }

    let matches = data.matches;
    console.log('Pulled ' + matches.length + ' matches from api');

    // Filter out all non-warzone games
    matches = filterWarzoneGamesOnly(matches);

    // Filter for matches where team members match the player's team exactly
    const teamGamertags = team.players.map(player => player.gamertag);
    matches = filterMatchesPlayedWithTeam(matches, player.gamertag, teamGamertags);

    // Filter out games that already exist in the database
    matches = filterMatchesAlreadyInDatabase(matches, existingMatchesInServer);

    // Match data is huge - remove unneccessary information to conserve DB space
    matches = extractRelevantData(matches);

    if (matches) {
      await writeMatchesToDatabase(matches, serverId);
    };
    console.log('Finished processing matches from team: ' + team.teamName + ', player: ' + player.gamertag);
    resolve();
  })
}

/*******************************************************************************
* API operations
*******************************************************************************/

async function getMatchesForActivisionId(activisionId) {
  await API.login(functions.config().cod_api.email,functions.config().cod_api.pw);

  const data = await API.MWcombatwz(activisionId)
    .catch((err) => {
      if (err === 'user not found.') {
        return null;
      } else {
        console.log(err);
        throw err;
      }
    });
  
  if (!data) {return null};
  return data;
}

/*******************************************************************************
* Database operations
*******************************************************************************/

async function getAllTeamsInServer(serverId) {
  const snapshot = await firestore.collection('servers')
                                  .doc(serverId)
                                  .collection('teams')
                                  .orderBy('teamName').get()
  return snapshot.docs.map(doc => doc.data());
}

async function getAllMatchIdsInServer(serverId) {
  const snapshot = await firestore.collection('servers')
                                  .doc(serverId)
                                  .collection('matches').get()
  const matchIds = snapshot.docs.map(doc => doc.id);
  return new Set(matchIds);
}

async function writeMatchesToDatabase(matches, serverId) {
  // Use batch write
  let batch = firestore.batch();
  matches.forEach(match => {
    let matchRef = firestore.collection('servers')
                            .doc(serverId)
                            .collection('matches')
                            .doc(match.matchID);
    batch.set(matchRef, match);
  });
  await batch.commit();
  console.log('Wrote ' + matches.length + ' matches to the database');
}

/*******************************************************************************
* Utility functions
*******************************************************************************/

function filterWarzoneGamesOnly(matches) {
  return matches.filter(match => match.gameType === 'wz');
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


function filterMatchesAlreadyInDatabase(matches, serverMatchIds) {
  return matches.filter(match => !serverMatchIds.has(match.matchID));
}

// Remove clantag from a string and return it
// eg. [TAG]someUsername -> someUsername
function stripClanTag(username) {
  return username.substring(username.indexOf(']') + 1);
}

// Each match data object has a ton of info that we don't need. This function is
// an attempt at removing a lot of the clutter
function extractRelevantData(matches) {
  const desiredFields = [
    'utcStartSeconds', 'utcEndSeconds', 'map', 'mode', 'matchID', 'duration',
    'playlistName', 'gameType', 'playerCount', 'player', 'teamCount', 'rankedTeams'
  ]
  matches = matches.map(match => {
    // Keep only a subset of the fields
    const matchData = desiredFields.reduce(function(o, k) { o[k] = match[k]; return o; }, {});

    // Remove all team data that isn't the host player's data
    // this is the majority of the data in the object and should considerably shrink the size
    const matchTeamId = matchData.player.team;
    matchData.rankedTeams = match.rankedTeams.filter(team => team.name === matchTeamId);
    return matchData;
  })
  return matches;
}
