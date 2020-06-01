require('dotenv').config();

const API = require('call-of-duty-api')({ platform: 'uno' });

async function getGamertagFromActivisionId(activisionId) {
  await API.login(process.env.COD_API_EMAIL, process.env.COD_API_PW);

  const data = await API.MWcombatwz(activisionId)
    .catch((err) => {
      if (err === "user not found.") {
        return null;
      } else {
        console.log(err);
        throw err;
      }
    });
  
  if (!data) {return null};
  return data.matches[0].player.username
}
 
module.exports = {
  getGamertagFromActivisionId,
}

