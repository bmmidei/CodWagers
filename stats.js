const log4js = require("log4js");
const logger = log4js.getLogger();
logger.level = "debug";

const numGames = 7;
const nBest = 5;
const ppk = 1;
const placementPts = new Map();
placementPts.set(15, 5);
placementPts.set(10, 10);
placementPts.set(5, 15);
placementPts.set(1, 30);


function getStats(args) {
  const userId = args[0];
  const teamStartTime = args[1];
  const teamMembers = [args[2], args[3], args[4]];

  return "Could not get stats at this time";
}

module.exports = { getStats };
