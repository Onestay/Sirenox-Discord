const { Command } = require('discord.js-commando');
const { TagDB } = require('../../mysql.js');
const config = require('../../config.json');
const SqlTag = new TagDB(config.tagHost, config.tagUser, config.tagPassword, config.caseDatabase);
const sql = SqlTag.getConnection();
const Embed = require('../../embeds.js');


module.exports = class BanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'ban',
			group: 'mod',
			memberName: 'ban',
			description: 'bant einen Nutzer vom Server',
			format: '<user> <reason>',

			args: [
				{
					key: 'user',
					prompt: 'Bitte gebe einen Nutzer, der gebannt werden soll an',
					type: 'user'
				},
				{
					key: 'reason',
					prompt: 'Bitte gebe einen Grund für den ban an.',
					type: 'string',
					default: '',
					max: 200
				}
			]
		});
	}

	async run(msg, args) {
		if (!msg.guild.member(this.client.user.id).hasPermission('BAN_MEMBERS')) {
			return msg.reply(`ich habe keine Rechte um zu banen.`);
		}
		if (!msg.member.hasPermission('BAN_MEMBERS')) {
			return msg.reply('du hast keine Rechte um zu banen');
		}
		const user = args.user;
		const reason = args.reason;
		const member = msg.guild.member(this.client.users.get(user.id));
		let caseNumber;

		if (!member.bannable) return msg.reply('Ich kann dies nicht tun.');

		// add query to save case in db

		sql.query('INSERT INTO `cases`(`caseAction`,`caseUser`,`caseModerator`,`caseReason`,`caseMessageID`) VALUES ("ban",?,?,?,"Placeholder")', [user.id, msg.author.id, reason.length === 0 ? 'None' : reason], (err, results) => {
			if (err) return msg.reply(`Ups... es gab ein Error beim Hinzufügen des Log Cases ${err}, ${results}`);
			caseNumber = results.insertId;
			this.message(caseNumber, msg);
			member.ban();
		});
	}
		// add code to write a modlog
	async message(caseNumber, msg) {
		sql.query('SELECT * FROM `cases` WHERE `caseNumber` = ?', [caseNumber], (err, results) => {
			if (err) msg.reply('es gab einen Error bei der query für den modlog: ${err}');
			let caseNum = results[0].caseNumber;
			let action = results[0].caseAction;
			let UserID = results[0].caseUser;
			let ModID = results[0].caseModerator;
			let reason = results[0].caseReason;
			let user = msg.client.users.get(UserID);
			let mod = msg.client.users.get(ModID);

			const newEmbed = new Embed(this.client, msg, caseNum, action, user, mod, reason, null, null, null);
			let embed = newEmbed.banCase();

			let modChannel = msg.guild.channels.find('name', 'mod_protokoll');
			return modChannel.sendMessage('', { embed })
			.then(message => {
				sql.query('UPDATE `cases` SET `caseMessageID` = ? WHERE `caseNumber` = ?', [message.id, caseNum], (er, res) => {
					if (err) return msg.reply(`Ups es ist ein Fehler Aufgetreten. ERROR ADDING MESSAGE ID TO CASE : ${er} ${res}`);
				});
			});
		});
	}
};
