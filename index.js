require('dotenv').config();

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

client.on('message', message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

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
