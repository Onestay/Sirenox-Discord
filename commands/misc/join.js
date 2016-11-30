const { Command } = require('discord.js-commando');
const winston = require('winston');

module.exports = class JoinCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'join',
			group: 'misc',
			memberName: 'join',
			description: 'Wird benutzt um den Rest des Servers freizuschalten'
		});
	}

	async run(msg) {
		let initialRole = msg.guild.roles.find('name', 'Xonerianer');
		msg.delete();
		msg.member.addRole(initialRole)
		.then(res => winston.info(`Added ${res.user.username}#${res.user.discriminator} to the Server`))
		.catch(winston.error);
	}
};
