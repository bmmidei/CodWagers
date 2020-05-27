require('dotenv').config();

const triggerPhrase = process.env.TRIGGER_PHRASE;
const token = process.env.DISCORD_BOT_TOKEN;
const Discord = require('discord.js');

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

client.on('message', msg => {
  console.log("Got message: " + msg.content);
  if (!shouldProcessMessage(msg)) {
    return;
  }

  msg.channel.send("Hello World (David)");

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
