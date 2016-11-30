const { Command } = require('discord.js-commando');
const oneLine = require('common-tags').oneLine;
const config = require('../../config.json');
const { RankDB } = require('../../mysql.js');
const SqlRank = new RankDB(config.rankHost, config.rankUser, config.rankPassword, config.rankDatabase);
const sql = SqlRank.getConnection();

module.exports = class RankCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'rank',
			group: 'misc',
			memberName: 'rank',
			description: oneLine`
							Zeigt dir deinen Rank aus dem Twitch Chat an.
							Kann ohne Argument benutzt werden, wenn Twitch mit Discord verbunden wurde.`,
			format: '<TwitchUsername>',

			args: [
				{
					key: 'twitchName',
					prompt: 'Bitte gebe deinen Twitch Nutzernamen ein.',
					type: 'string',
					default: ''
				}
			]
		});
	}

	async run(msg, args) {
		if (args.twitchName.length === 0) {
			sql.query({
				sql: 'SELECT * FROM `user` WHERE `idDiscordUser` = ?',
				values: [msg.author.id]
			}, (err, results) => { //eslint-disable-line
				if (err) return msg.reply(`Ups... ein Fehler ist aufgetreten. ${err}`);
				if (results.length === 0) return msg.reply('es sieht so aus, als ob du Twitch noch nicht mit Discord verknüpft hast. Gebe !verify ein um dies zu tun. Wenn du denkst, dass dier ein Fehler ist Kontaktiere Onestay.');
				let totalTime = results[0].timeTotal / 60;
				return msg.reply(` du hast momentan **${JSON.stringify(results[0].postTotal)}** Punkte und **${totalTime.toFixed(2)}** Stunden um Chat verbracht.`);
			});
		} else {
			let user = args.twitchName;
			sql.query({
				sql: 'SELECT * FROM `user` WHERE `user` = ?',
				values: [user]
			}, (err, results) => {
				if (err) return msg.reply(`Ups... ein Fehler ist aufgetreten. ${err}`);
				if (results.length === 0) return msg.reply(`dieser Twitch Name existiert nicht. Versuche es nochmal`);
				let totalTime = results[0].timeTotal / 60;
				return msg.channel.sendMessage(`**${user}** hat momentan **${JSON.stringify(results[0].postTotal)}** Punkte und **${totalTime.toFixed(2)}** Stunden im Chat verbracht.`);
			});
		}
	}
};
