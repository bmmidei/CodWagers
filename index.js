require('dotenv').config();

const token = process.env.DISCORD_BOT_TOKEN;
const Discord = require('discord.js');

const client = new Discord.Client();

client.on('message', msg => {
  console.log("Received message: " + msg.toString());
  if (msg.author.id === client.user.id) {
    console.log("Message is from bot");
  } else {
    msg.channel.send("Hello World!");
  }
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
