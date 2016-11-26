const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'pong',
			group: 'misc',
			memberName: 'pong',
			description: 'Ping Pong Ping Pong Ping Pong'
		});
	}


	async run(msg) { //eslint-disable-line
		if (msg.author.id === '118425585163698183') {
			msg.channel.sendMessage('Validating...')
			.then(message => {
				return message.edit(`Took: ${message.createdTimestamp - msg.createdTimestamp}ms`);
			});
		} else {
			return msg.channel.sendMessage('Ping... ne, ähm Pong... warte was?');
		}
	}
};
