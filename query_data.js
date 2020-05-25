////////////////////////////////////////////////////////////////////////////////
// This file is used for reading data from the api
////////////////////////////////////////////////////////////////////////////////
const fs = require("fs");
const CONFIG = require("./config");
const log4js = require("log4js");
const logger = log4js.getLogger();
logger.level = CONFIG.logLevel;

const API = require("call-of-duty-api")({ platform: "uno" });

// Email login and password must be stored as environment variables
// These are the same credentials used to login to this website:
// https://my.callofduty.com/
API.login(process.env.COD_API_EMAIL, process.env.COD_API_PW)
    .then(batchQuery)
    .catch(logger.error);

async function batchQuery() {
    CONFIG.teamData.forEach(team => {
        let start = new Date(team.teamStartTime);
        let end = new Date(team.teamEndTime);

        team.teamPlayerInfo.forEach(playerInfo => {
            const username = playerInfo.username;
            const userId = playerInfo.id;
            if (userId === "") {return ;}
            logger.info("Getting data for user " + username + " between " +
                        start.toUTCString() + " and " + end.toUTCString());
            API.MWcombatwz(userId, start.getTime(), end.getTime()).then(data => {
                if (data) {
                    logger.info("Found " + data.matches.length + " matches for " + username);
                    writeDataToFile(data, username);
                } else {
                    logger.error("No matches found for " + username);
                }
            }).catch(err => {
                logger.error(err);
            });
        })
    });
}

function writeDataToFile(data, username) {
    const json = JSON.stringify(data);
    fs.writeFile("./player_data/player_data_" + username + ".json", json, "utf8", () => {
        logger.info("Finished writing data for user: " + username);
    });
}
