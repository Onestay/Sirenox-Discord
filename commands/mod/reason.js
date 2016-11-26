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

		sql.query('SELECT * FROM `cases` WHERE `caseNumber` = ?', [caseNumber], (err, results) => {
			if (err) msg.reply(`Ups... es ist ein Fehler bei der Query für den Case aufgetreten ${err}`);
			let data = results[0];
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
		message.edit('', { embed });
	}
}