const { Command } = require('discord.js-commando');
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
			aliases: ['prune', 'clean'],
			description: `Löscht Nachrichten. Hier ist eine Liste von Filtern:
				__text ...:__ Nachrichten die den folgenden Text enthalten
				__invites:__ Nachrichten die einen Invite enthalten
				__user @user:__ Nachrichten die von @user gesendet wurden
				__bots:__ Nachrichten die von Bots gesendet wurden
				__uploads:__ Nachrichten die ein Attachment haben
				__links:__ Nachrichten die einen Link haben
				__length #:__ Nachrichten länger als die angegebene Länge`,
			format: '<limit> <filter> <args>',
			examples: ['purge 10', 'purge 10 text test nachricht', 'purge 10 invites', 'purge 10 user @Onestay|ステー#9756', 'purge 10 bots', 'pruge 10 uploads', 'purge 10 links', 'purge 10 length 50'],
			guildOnly: true,
			argsType: 'multiple',
			argsCount: 3
		});
	}

	hasPermission(msg) {
		return msg.member.roles.find('name', 'Test');
	}

	async run(msg, args) {
		let caseNumber;
		if (!msg.guild.member(this.client.user.id).hasPermission('MANAGE_MESSAGES')) return msg.reply('Ich habe keine Rechte Nachrichten zu Löschen');
		if (!args[0] || isNaN(args[0])) {
			msg.channel.sendMessage('Gebe eine Zahl an, die gepurgt werden soll');
			return;
		}

		let limit = 100;
		let filter = null;
		if (/^[1-9]+/.test(args[0])) {
			limit = parseInt(args[0]) + 1;
			if (limit > 100) {
				limit = 100;
			}
		}

		if (args[1]) {
			if (/^text/.test(args[1])) {
				filter = m => m.content.includes(args[2]);
			} else if (args[1] === 'invite') {
				filter = m => m.content.search(/(discord\.gg\/.+|discordapp\.com\/invite\/.+)/i) !== -1;
			} else if (args[1] === 'user') {
				if (args[2]) {
					filter = msg.mentions.users.size !== 0 ? m => m.author.id === msg.mentions.users.first().id : null;
				} else {
					msg.channel.sendMessage('Du musst jemanden mention');
					return;
				}
			} else if (args[1] === 'bots') {
				filter = m => m.author.bot === true;
			} else if (args[1] === 'upload') {
				filter = m => m.attachments.size !== 0;
			} else if (args[1] === 'links') {
				filter = m => m.content.search(/https?:\/\/[^ /.]+\.[^ /.]+/) !== -1;
			} else if (args[1] === 'length' && /\d+/.test(args[2])) {
				let max = parseInt(args[2]);
				filter = m => m.content.length > max;
			} else {
				msg.channel.sendMessage('Das sieht mir nicht nach einem Filter aus. Benutze `!help purge` für alle möglichen filter.');
				return;
			}
		}

		if (args[1]) {
			msg.channel.fetchMessages({ limit: limit })
			.then(m => {
				let messageFilter = m.filter(filter);
				msg.channel.bulkDelete(messageFilter);
			}).catch(e => {
				msg.channel.sendMessage(`Ups... ein Fehler ist Aufgetreten ${e}`);
			});
		} else {
			msg.channel.fetchMessages({ limit: limit })
			.then(m => {
				msg.channel.bulkDelete(m);
			}).catch(e => {
				msg.channel.sendMessage(`Ups... ein Fehler ist Aufgetreten ${e}`);
			});
		}

		sql.query('INSERT INTO `cases`(`caseAction`, `caseModerator`,`caseReason`,`caseMessageID`, `caseChannel`, `caseLimit`, `casePurgeFilter`) VALUES ("Purge", ?, ?, ?, ?, ?, ?)', [msg.author.id, 'None', 'Placeholder', msg.channel.id, limit, args[2] === 0 ? args[1] : `${args[1]}: ${args[2]}`], (err, results) => {
			if (err) return msg.reply(`Ups... Querry Error: ${err}`);
			caseNumber = results.insertId;
			msg.channel.sendMessage(`Benutze jetzt \`!reason ${caseNumber} <reason>\` um den Grund zu ändern`);
			this.message(caseNumber, msg);
		});
	}
	async message(caseNumber, msg) {
		sql.query('SELECT * FROM `cases` WHERE `caseNumber` = ?', [caseNumber], (err, results) => {
			if (err) msg.channel.sendMessage(`Ups... Error getting Query for Modlog ${err}`);
			let caseNum = results[0].caseNumber;
			let action = results[0].caseAction;
			let ModID = results[0].caseModerator;
			let reason = results[0].caseReason;
			let mod = this.client.users.get(ModID);
			let channel = msg.guild.channels.get(results[0].caseChannel);
			let channelName = channel.name;
			let limit = results[0].caseLimit;
			let filter = results[0].casePurgeFilter;
			const newEmbed = new Embed(this.client, msg, caseNum, action, null, mod, reason, null, limit, channelName, filter);
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
