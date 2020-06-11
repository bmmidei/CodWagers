const embedUtils = require('../embedUtils.js');


module.exports = {
  name: 'help',
  description: 'Help documentation',
  async execute(message, args) {
    const helpEmbed = embedUtils.generateHelpEmbed();
    message.channel.send(helpEmbed);
  }
}
