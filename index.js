require('dotenv').config();

const triggerPhrase = process.env.TRIGGER_PHRASE;
const token = process.env.DISCORD_BOT_TOKEN;
const Discord = require('discord.js');
const stats = require('./stats.js');

const client = new Discord.Client();

function shouldProcessMessage(msg) {
  // Message was not prefixed with the correct trigger phrase.
  if (!msg.content.startsWith(triggerPhrase)) {
    console.log("Message did not contain prefix");
    return false;
  }

  // Message was authored by the bot.
  if (msg.author.id === client.user.id) {
    console.log("Message is from bot");
    return false;
  }

  return true;
}

client.on("message", async msg => {
  if (!shouldProcessMessage(msg)) {
    return;
  }

  // Separate the command from the (optional) arguments
  const args = msg.content.slice(triggerPhrase.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log("Command: " + command);

  if(command === "ping") {
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
    const m = await msg.channel.send("Ping?");
    m.edit(`Pong! Latency is ${m.createdTimestamp - msg.createdTimestamp}ms.`);
    return;
  }

  if (command === "stats") {
    console.log("Get stats request received with args: " + args)
    if (args.length != 5) {
      msg.channel.send("Incorrect number of arguments. Stats request must be formatted as follows:\n" +
                       triggerPhrase + " stats [activision ID] [team start time] [gamertag] [teammate1 gamertag] [teammate2 gamertag]");
    } else {
      msg.channel.send(stats.getStats(args));
    }
    return;
  }

  if(command === "createtournament") {
    const response = "We don't yet have this functionality";
    console.log("Create Tournament request received with args: " + args)
    msg.channel.send(response);
    return;
  }

  if(command === "addteam") {
    const response = "We don't yet have this functionality";
    console.log("Add team request received with args: " + args)
    msg.channel.send(response);
    return;
  }


  msg.channel.send("Command not recognized");

  /*
    Add support for tournament commands here. Exact commands needed TBD (create
    tournament, add team, add player to team, start scoring, get leaderboard,
    etc.)
  */
});

client.on('ready', () => {
  console.log('Your bot is now connected');
});

console.log("Using token: " + token);
client.login(token);
