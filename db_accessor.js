
const admin = require('firebase-admin');

let serviceAccount = require('./db_serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();


async function getAllTeams(serverId) {
  const teamsRef = db.collection('servers').doc(serverId).collection('teams');
  const teams = await teamsRef.get()
  .then(snapshot => {
    if (snapshot.empty) {
      console.log('No teams exist!');
      return;
    }

    snapshot.forEach(team => {
      console.log(team.id, '=>', team.data());
    });
  })
  .catch(err => {
    console.log('Error getting documents', err);
  });
}

async function createTeam(serverId, team) {
  const setDoc = await db.collection('servers')
                         .doc(serverId)
                         .collection('teams')
                         .doc(team.teamName) // Use custom id of team name
                         .set(team)
}


function getAllTournaments() {
  db.collection('tournaments').get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        console.log(doc.id, '=>', doc.data());
      });
    })
    .catch((err) => {
      console.log('Error getting documents', err);
    });
}

function createTournament(tournament) {
  return new Promise((resolve,reject) => {
    let addTournament = db.collection('tournaments').add(tournament)
      .then(ref => {
        console.log('Added tournament with ID: ', ref.id);
        resolve(ref.id);
      })
      .catch(err => console.log(err));
  });
}

function getTournamentById(tournamentId) {
  return new Promise((resolve,reject) => {
    let tournamentRef = db.collection('tournaments').doc(tournamentId);
    let getTournament= tournamentRef.get()
      .then(tournament=> {
        if (!tournament.exists) {
          console.log('No tournament with this ID exists');
        } else {
          resolve(tournament.data());
        }
      })
      .catch(err => {
        console.log('Error getting tournament', err);
      });
  });
}

module.exports = {
  createTournament,
  getTournamentById,
  getAllTeams,
  createTeam,
}
