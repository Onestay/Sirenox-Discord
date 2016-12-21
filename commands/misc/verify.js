const { Command } = require('discord.js-commando');
const tmi = require('tmi.js');
const config = require('../../config.json');
const { RankDB } = require('../../mysql.js');
const SqlRank = new RankDB(config.rankHost, config.rankUser, config.rankPassword, config.rankDatabase);
const sql = SqlRank.getConnection();

const options = {
	options: { debug: true },
	connection: { cluster: 'aws' },
	identity: {
		username: 'Sirenox',
		password: config.twitchToken
	},
	channels: ['Xoneris']
};

const twitchClient = new tmi.client(options); //eslint-disable-line
twitchClient.connect();
twitchClient.on('connected', (add, port) => {
	console.log(`Twitch Client logged in with ${add} ${port}`);
});

module.exports = class VerifyCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'verify',
			group: 'misc',
			memberName: 'verify',
			description: 'Soon',
			guildOnly: false,

			args: [
				{
					key: 'user',
					prompt: 'Bitte gebe einen Twitchusernamen an.',
					type: 'string'
				}
			]
		});
	}
	async run(msg, args) {
		if (msg.channel.type === 'text') return msg.reply('Dieser Command kann nur in einer DM benutzt werden.');

		let user = args.user;

		let code = '';
		const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

		for (var i = 0; i < 6; i++) {
			code += possible.charAt(Math.floor(Math.random() * possible.length));
		}

		twitchClient.whisper(user, `Dein Token, um dich mit deinem Discord Account zu verifizieren: ${code}. (If you didn't expect to receive this feel free to ignore it.)`)
		.catch(e => `Es ist ein Fehler aufgetreten! Bitte sende diesen an Onestay ${e}`);

		msg.channel.sendMessage('Dir wurde ein Code auf Twitch zugewhispered. Gebe den hier ein.');
		const collector = msg.channel.createCollector(m => m.author === msg.author, { time: 45000 });

		collector.on('message', m => {
			if (m.content === code) collector.stop('correct');
			if (m.content !== code) collector.stop('wrong');
		});

		collector.on('end', (collected, reason) => {
			if (reason === 'time') return msg.channel.sendMessage('Zeit Abgelaufen. Bitte versuche es nochmal.');
			if (reason === 'wrong') return msg.channel.sendMessage('Falscher Code. Bitte versuche es nochmal');
			if (reason === 'correct') this.success(user, msg);
			console.log(collected);
		});
	}

	async success(user, msg) {
		msg.channel.sendMessage('Code erfolgreich verifiziert. Deine Discord ID wird nun mit Twitch verbunden.');
		sql.query('UPDATE user SET idDiscordUser = ? WHERE user = ?', [msg.author.id, user.toLowerCase()], (err, res) => {
			if (err) return msg.channel.sendMessage(`Es ist ein Fehler aufgetreten. Sende diese Nachricht an Onestay: err: ${err} , res:${res}`);
			msg.channel.sendFile('http://vignette2.wikia.nocookie.net/kancolle/images/e/eb/Kongou_chibi_render_by_mali_n-d7z1fzz-1-.png');
			msg.channel.sendMessage('Erfolgreich verifiziert');
		});
	}
};
