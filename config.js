const logLevel = "debug";

const ppk = 1;

const placementPts = new Map();
placementPts.set(15, 5);
placementPts.set(10, 10);
placementPts.set(5, 15);
placementPts.set(1, 30);

const numGames = 7;
const nBest = 5;

const teamData = [
    {
        teamNum: 1,
        teamPlayerInfo: [
            {
                id: "megalegit#9527355",
                username: "megalegit"
            },
            {
                id: "Stewpot#6739127",
                username: "Stewpot"
            },
            {
                id: "ScaryBarry69#6048185",
                username: "ScaryBarry69"
            }

        ],
        // Start and end times but be in milliseconds (i.e. epoch timestamp * 1000)
        teamStartTime: 1590364800000,
        teamEndTime: 1590379200000,
    },
];

module.exports = {
    logLevel,
    ppk,
    placementPts,
    numGames,
    nBest,
    teamData
}


