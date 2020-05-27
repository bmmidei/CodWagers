module.exports = {
  name: 'createtournament',
  description: 'Create Tournament',
  execute(message, args) {
    const response = "We don't yet have this functionality";
    console.log("Create Tournament request received with args: " + args)
    message.channel.send(response);
  },
};
