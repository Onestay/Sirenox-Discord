const { Command } = require('discord.js-commando');

module.exports = class WetterCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'wetter',
			group: 'misc',
			memberName: 'wetter',
			description: 'Soon'
		});
	}
	async run(msg) { //eslint-disable-line
		msg.channel.sendMessage('Wegen neuen Bot und neuer Framework geht das alte Wettercommand nicht mehr.\nEin neues kommt ASAP <3');
	}
};
