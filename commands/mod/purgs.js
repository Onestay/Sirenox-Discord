const { Command } = require('discord.js-commando');
const oneline = require('common-tags').oneLine;

module.exports = class PurgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'purge',
			group: 'mod',
			memberName: 'purge',
			description: oneline`
						Purgt eine bestimmte Anzahl an Nachrichten.
						Es kann ein User oder String angegeben werden um nur Nachrichten von diesem User oder mit dem angegeben String zu löschen.`,
			format: '<user oder String>',

			args: [
				{
					key: 'limit',
					prompt: 'Bitte gebe eine Anzahl von Nachrichten an, die gelöscht werden sollen',
					type: 'integer',
					max: 100
				},
				{
					key: 'user',
					prompt: 'Gebe einen Nutzer an. Nachrichten von diesem User werden gelöscht',
					type: 'user',
					default: ''
				},
				{
					key: 'content',
					prompt: 'Gebe eine Nachricht an. Nachrichten mit diesem Inhalt werden gelöscht',
					type: 'string',
					default: ''
				}
			]
		});
	}
	async run(msg, args) {
		let limit = args.limit + 1;
		let user = args.user.id;
		let query = args.content;
		if (user.length > 0 && query.length > 0) {
			msg.reply('Du kannst nur entweder ein User oder eine Nachricht eingeben');
			return;
		}
		if (user.length > 0) return this.purgeUser(msg, user, limit);
		if (query.length > 0) return this.purgeQuery(msg, query, limit);
		return this.purge(msg, limit);
	}
	async purgeUser(msg, user, limit) {
		msg.channel.fetchMessages({ limit: limit })
		.then(messages => {
			let filtered = messages.filter(m => m.author.id === user);
			msg.channel.bulkDelete(filtered);
		});
	}

	async purgeQuery(msg, query, limit) {
		msg.channel.fetchMessages({ limit: limit })
		.then(messages => {
			let filtered = messages.filter(m => m.content.toLowerCase() === query.toLowerCase());
			msg.channel.bulkDelete(filtered);
		});
	}

	async purge(msg, args) {

	}
};
// fuck this fucking fuck I'll do that later
