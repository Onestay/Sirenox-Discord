const { Command } = require('discord.js-commando');
const { TagDB } = require('../../mysql.js');
const config = require('../../config.json');
const SqlTag = new TagDB(config.tagHost, config.tagUser, config.tagPassword, config.caseDatabase);
const sql = SqlTag.getConnection();
const Embed = require('../../embeds.js');

module.exports = class ReasonCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'reason',
			group: 'mod',
			memberName: 'reason',
			description: 'Fügt einen Grund zu einem Log Case hinzu.',
			format: '<caseNumber> <Reason>',

			args: [
				{
					key: 'caseNumber',
					prompt: 'Bitte gebe eine Case Number an.',
					type: 'integer',
					max: 999
				},
				{
					key: 'reason',
					prompt: 'Bitte gebe einen Grund an.',
					type: 'string',
					max: 200
				}
			]
		});
	}
	async run(msg, args) {
		let caseNumber = args.caseNumber;
		let reason = args.reason;

		if (!msg.member.hasPermission('BAN_MEMBERS' || !msg.member.hasPermission('KICK_MEMBERS'))) return msg.reply(' du hast keine Rechte den Grund eines Log Cases zu ändern');
		sql.query('SELECT * FROM `cases` WHERE `caseNumber` = ?', [caseNumber], (err, results) => {
			if (err) msg.reply(`Ups... es ist ein Fehler bei der Query für den Case aufgetreten ${err}`);
			let data = results[0];
			if (msg.author.id !== results[0].caseModerator && msg.author.id !== msg.guild.ownerID) return msg.reply('nur der Mod, der gebannt oder gekickt hat kann den Grund ändern');
			if (results[0].caseReason !== 'None') {
				this.forceUpdateText(msg, data, reason);
				return;
			}
			this.fetchMessage(msg, data, reason);
		});
	}
	async fetchMessage(msg, data, reason) {
		let caseNum = data.caseNumber;
		let action = data.caseAction;
		let UserID = data.caseUser;
		let fullUser = `${msg.guild.members.get(UserID).user.username}#${msg.guild.members.get(UserID).user.discriminator} (${UserID})`;
		let ModID = data.caseModerator;
		let messageID = data.caseMessageID;
		let fullMod = `${msg.guild.members.get(ModID).user.username}#${msg.guild.members.get(ModID).user.discriminator} (${ModID})`;
		let newReason = reason;

		let modChannel = msg.guild.channels.find('name', 'logtest');
		modChannel.fetchMessage(messageID)
		.then(message => {
			this.updateText(caseNum, action, fullUser, fullMod, newReason, message, msg);
		});
	}
	async updateText(caseNum, action, fullUser, fullMod, reason, message, msg) {
		const newEmbed = new Embed(this.client, caseNum, action, fullUser, fullMod, reason, null, null, null);
		const embed = newEmbed.banCase();
		sql.query('UPDATE `cases` SET `caseReason` = ? WHERE `caseNumber` = ?;', [reason, caseNum], (err, results) => {
			if (err) msg.reply(`Ups... Error beim update der Reason ${err}, ${results}`);
		});
		message.edit('', { embed });
	}
	async forceUpdateText(msg, data, newRason) {
		const collector = msg.channel.createCollector(m => m.author === msg.author, { time: 10000 });
		msg.reply('der Grund dieses Cases wurde bereits einmal geändert. Möchtest du es überschreiben? (Ja/Nein)');
		collector.on('message', m => {
			if (m.content.toLowerCase() === 'nein') collector.stop('aborted');
			if (m.content.toLowerCase() === 'ja') collector.stop('success');
		});
		collector.on('end', (collected, reason) => {
			if (reason === 'time') return msg.reply('Keine Antwort erhalten... breche ab');
			if (reason === 'aborted') return msg.reply('Erfolgreich abgebrochen.');
			if (reason === 'success') return this.fetchMessage(msg, data, newRason);
		});
	}
};
