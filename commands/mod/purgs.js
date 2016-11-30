const { Command } = require('discord.js-commando');
const oneline = require('common-tags').oneLine;
const { TagDB } = require('../../mysql.js');
const config = require('../../config.json');
const SqlTag = new TagDB(config.tagHost, config.tagUser, config.tagPassword, config.caseDatabase);
const sql = SqlTag.getConnection();
const Embed = require('../../embeds.js');
const winston = require('winston');

module.exports = class PurgeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'purge',
			group: 'mod',
			memberName: 'purge',
			description: oneline`
						Purgt eine bestimmte Anzahl an Nachrichten.
						Es kann ein User oder String angegeben werden um nur Nachrichten von diesem User oder mit dem angegeben String zu löschen.`,
			format: '<Messages to purge> <reason> <user>',

			args: [
				{
					key: 'limit',
					prompt: 'Bitte gebe eine Anzahl von Nachrichten an, die gelöscht werden sollen',
					type: 'integer',
					max: 100
				},
				{
					key: 'reason',
					prompt: 'Gebe einen Grund für den Purge an (Nicht mehr bearbeitbar!)',
					type: 'string',
					max: 200
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
		let user;
		if (args.user === '') {
			user = 0;
		} else {
			user = args.user;
		}
		let query = args.content;
		let reason = args.reason;
		let caseNumber;
		if (!msg.member.hasPermission('MANAGE_MESSAGES')) return msg.reply('du hast keine Rechte Nachrichten zu löschen');
		if (!msg.guild.member(this.client.user.id).hasPermission('MANAGE_MESSAGES')) return msg.reply('Ich habe keine Rechte Nachrichten zu Löschen');
		if (user.length > 0 && query.length > 0) {
			msg.reply('Du kannst nur entweder ein User oder eine Nachricht eingeben');
			return;
		}
		sql.query('INSERT INTO `cases`(`caseAction`, `caseModerator`,`caseReason`,`caseMessageID`, `caseChannel`, `caseLimit`) VALUES ("Purge", ?, ?, ?, ?, ?)', [msg.author.id, reason.length === 0 ? 'None' : reason, 'Placeholder', msg.channel.id, limit], (err, results) => {
			if (err) return msg.reply(`Ups... Querry Error: ${err}`);
			caseNumber = results.insertId;
			this.message(caseNumber, msg);
		});
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
		return;
	}

	async purgeQuery(msg, query, limit) {
		msg.channel.fetchMessages({ limit: limit })
		.then(messages => {
			let filtered = messages.filter(m => m.content.toLowerCase() === query.toLowerCase());
			msg.channel.bulkDelete(filtered);
		});
		return;
	}

	async purge(msg, limit) {
		msg.channel.fetchMessages({ limit: limit })
		.then(messages => {
			msg.channel.bulkDelete(messages);
		});
		return;
	}
	async message(caseNumber, msg) {
		sql.query('SELECT * FROM `cases` WHERE `caseNumber` = ?', [caseNumber], (err, results) => {
			if (err) msg.channel.sendMessage(`Ups... Error getting Query for Modlog ${err}`);
			let caseNum = results[0].caseNumber;
			let action = results[0].caseAction;
			let ModID = results[0].caseModerator;
			let reason = results[0].caseReason;
			let mod = msg.guild.members.get(ModID);
			let channel = msg.guild.channels.get(results[0].caseChannel);
			let channelName = channel.name;
			let limit = results[0].caseLimit;
			const newEmbed = new Embed(this.client, msg, caseNum, action, null, mod, reason, null, limit, channelName);
			let embed = newEmbed.purgeCase();

			let modChannel = msg.guild.channels.find('name', 'mod_protokoll');
			modChannel.sendMessage('', { embed })
			.then(message => {
				sql.query('UPDATE `cases` SET `caseMessageID` = ? WHERE `caseNumber` = ?', [message.id, caseNum], (er, res) => {
					if (err) return msg.reply(`Ups es ist ein Fehler Aufgetreten. ERROR ADDING MESSAGE ID TO CASE : ${er} ${res}`);
				});
			}).catch(e => winston.error(e));
		});
	}
};
// fuck this fucking fuck I'll do that later
