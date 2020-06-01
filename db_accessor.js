const admin = require('firebase-admin');

let serviceAccount = require('./db_serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();


async function getAllTeams(serverId) {
  const snapshot = await db.collection('servers').doc(serverId).collection('teams')
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
  return snapshot.data();
}

module.exports = {
  createTournament,
  getAllTeams,
  createTeam,
  getLatestTournament,
}
