const { Command } = require('discord.js-commando');
const figlet = require('figlet');

module.exports = class BannerCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'banner',
			group: 'fun',
			memberName: 'banner',
			description: 'Erstellt einen ASCII Banner aus angegeben Text.',
			format: '<BannerText>',

			args: [
				{
					key: 'bannerText',
					prompt: 'Bitte gebe einen Banner Text ein.',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) { //eslint-disable-line
		const text = args.bannerText;

		if (text.length > 30) return msg.reply('Es können maximal 30 Buchstaben angegeben werden.');
		if (msg.channel.id !== '205067539938541568' && msg.channel.type !== 'dm') return msg.reply('Dieser Command kann nur in der Spam und Memezone ausgeführt werden.');
		figlet(text, (err, data) => {
			if (err) return msg.reply(`Ups... ein Fehler ist aufgetreten. ${err}`);
			return msg.channel.sendCode('', data);
		});
	}
};
