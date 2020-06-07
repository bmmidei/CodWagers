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

function shouldProcessMessage(message) {
  // Message was not prefixed with the correct trigger phrase.
  if (!message.content.startsWith(prefix)) {
    //console.log("Message did not contain prefix");
    return false;
  }

  // Message was authored by the bot.
  if (message.author.id === client.user.id) {
    //console.log("Message is from bot");
    return false;
  }

  return true;
}

client.on('message', message => {
  console.log("Got message: " + message.content);
  if (!shouldProcessMessage(message)) {
    return;
  }

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  /*tournament.handleRequest(command, args, msg) */
  if (!client.commands.has(command)) {
    message.channel.send(`No command "${command}" exists`)
    return;
  }

  try {
    client.commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('there was an error trying to execute that command!');
  }
});

client.on('ready', () => {
  console.log('Your bot is now connected');
});

console.log("Using token: " + token);
client.login(token);
