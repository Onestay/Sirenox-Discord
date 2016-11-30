const { Command } = require('discord.js-commando');

module.exports = class VerifyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'verify',
			group: 'misc',
			memberName: 'verify',
			description: 'Soon'
		});
	}
	async run(msg) { //eslint-disable-line
		msg.channel.sendMessage('Wegen neuen Bot und neuer Framework geht das alte Verify Command nicht mehr.\nEin neues kommt ASAP <3');
	}
};
