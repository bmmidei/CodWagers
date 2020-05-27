require('dotenv').config();
var tournament = require('./tournament');

const fs = require('fs');
const prefix = process.env.TRIGGER_PHRASE;
const token = process.env.DISCORD_BOT_TOKEN;
const Discord = require('discord.js');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

function shouldProcessMessage(msg) {
  // Message was not prefixed with the correct trigger phrase.
  if (!msg.content.startsWith(prefix)) {
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

  const split = msg.content.slice(prefix.length).trim().split(/ +/g);
  const command = split[0];
  const args = split.slice(1);

  tournament.handleRequest(command, args, msg);
  /* (commenting out temporarily)
    if (!client.commands.has(command)) {
      message.channel.send(`No command "${command}" exists`)

    try {
      client.commands.get(command).execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  });*/

  /*
    Add support for tournament commands here. Exact commands needed TBD (create
    tournament, add team, add player to team, start scoring, get leaderboard,
    etc.)
  */
})

client.on('ready', () => {
  console.log('Your bot is now connected');
});

console.log("Using token: " + token);
client.login(token);
