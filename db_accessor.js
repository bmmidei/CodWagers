
const admin = require('firebase-admin');

let serviceAccount = require('./db_serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

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
}
