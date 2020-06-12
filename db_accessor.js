const admin = require('firebase-admin');

/* REQUIRED ONLY FOR LOCAL DEVELOPMENT
let serviceAccount = require('./db_serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
*/
admin.initializeApp();   // Use for deployment
let db = admin.firestore();

async function getAllTeamsInServer(serverId) {
  const snapshot = await db.collection('servers').doc(serverId).collection('teams')
    .orderBy('teamName').get()
  return snapshot.docs.map(doc => doc.data());
}

async function getAllMatchesInServer(serverId) {
  const snapshot = await db.collection('servers')
                           .doc(serverId)
                           .collection('matches')
                           .get()
  return snapshot.docs.map(doc => doc.data());
}

async function getTeamsInTournament(serverId, tournamentId) {
  const snapshot = await db.collection('servers')
                           .doc(serverId)
                           .collection('tournaments')
                           .doc(tournamentId)
                           .collection('teams')
                           .orderBy('teamName').get()
  return snapshot.docs.map(doc => doc.data());
}


async function createTeam(serverId, team) {
  const setDoc = await db.collection('servers')
                         .doc(serverId)
                         .collection('teams')
                         .doc(team.teamName) // Use team name as the DB custom id
                         .set(team)
}

async function addStartTimeForTeam(serverId, tournamentId, teamName) {
  const setDoc = await db.collection('servers')
                         .doc(serverId)
                         .collection('tournaments')
                         .doc(tournamentId)
                         .collection('teams')
                         .doc(teamName) // Use team name as the DB custom id
                         .update({startTime: Date.now()})
}


async function createTournament(serverId, tournament) {
  const setRef = await db.collection('servers')
                         .doc(serverId)
                         .collection('tournaments')
                         .add(tournament)
                         .then(ref => {
                           console.log('Added document with ID: ', ref.id);
                           return ref.id;
                         });
  return setRef;
}

async function getLatestTournament(serverId) {
  const query = await db.collection('servers').doc(serverId).collection('tournaments')
    .orderBy('createdAt', 'desc').limit(1).get()
  const snapshot = query.docs[0];
  const tournament = snapshot.data();
  tournament['id'] = snapshot.id;
  return tournament;
}

async function getTeamById(serverId, teamId) {
  const query = await db.collection('servers').doc(serverId).collection('teams').doc(teamId);
  const snapshot = query.get()
    .then((docRef) => {
      if (!docRef.exists) {
        throw 'No team with this name exists!';
      } else {
        return docRef.data();
      }
    })
    .catch(err => {
      throw 'Error getting team - ' + err;
    });
  return snapshot
}

async function getTeamInTournamentByTeamName(serverId, tournamentId, teamName) {
  const query = await db.collection('servers')
                        .doc(serverId)
                        .collection('tournaments')
                        .doc(tournamentId)
                        .collection('teams')
                        .doc(teamName);
  const snapshot = query.get()
    .then((docRef) => {
      if (!docRef.exists) {
        throw 'No team with this name exists!';
      } else {
        return docRef.data();
      }
    })
    .catch(err => {
      throw 'Error getting team - ' + err;
    });
  return snapshot
}

async function addTeamToTournament(serverId, tournamentId, team) {
  const setRef = await db.collection('servers')
                         .doc(serverId)
                         .collection('tournaments')
                         .doc(tournamentId)
                         .collection('teams')
                         .doc(team.teamName) // Use team name as the DB custom id
                         .set(team)
                         .then(() => {
                           console.log('Added team to tournament');
                         });
}

module.exports = {
  createTournament,
  getTeamsInTournament,
  getAllTeamsInServer,
  createTeam,
  getLatestTournament,
  getTeamById,
  addTeamToTournament,
  getAllMatchesInServer,
  addStartTimeForTeam,
  getTeamInTournamentByTeamName,
}
