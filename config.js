const logLevel = "debug";

const ppk = 1;

const placementPts = new Map();
placementPts.set(15, 5);
placementPts.set(10, 10);
placementPts.set(5, 15);
placementPts.set(1, 30);

const numGames = 7;

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
                username: "XxStewpotxX"
            },
            {
                id: "",
                username: "ScaryBarry69"
            }

        ],
        // Start and end times but be in milliseconds (i.e. epoch timestamp * 1000)
        teamStartTime: 1589673777000,
        teamEndTime: 1589686257000,
    },
];

module.exports = {
    logLevel,
    ppk,
    placementPts,
    numGames,
    teamData
}


