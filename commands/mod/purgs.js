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
					prompt: 'Gebe einen User an, von dem die Nachrichten gelöscht werden sollen',
					type: 'user',
					default: ''
				},
				{
					key: 'content',
					prompt: 'Gebe einen Inhalt an, von dem die Nachrichten gelöscht werden sollen',
					type: 'string',
					default: ''
				}
			]
		});
	}
	async run(msg, args) {
		let limit = args.limit + 1;
		let user = args.user;
		let userID = user.id;
		msg.channel.fetchMessages({ limit: limit })
		.then(messages => {
			messages.filter(this.checkUserID(userID, messages));
		});
	}
	async checkUserID(userid, messages) {
		return messages.indexOf(userid) === -1;
	}
};
// fuck this fucking fuck I'll do that later
