const { Command } = require('discord.js-commando');
const discordversion = require('discord.js').version;
const stripIndents = require('common-tags').stripIndents;
const version = require('../../package').version;


module.exports = class InfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'about',
			group: 'info',
			memberName: 'about',
			description: 'Informationen über den Bot'
		});
	}

	async run(msg) {
		let embed = {
			color: 0x02eeff,
			description: stripIndents`
					**Sirenox**

					>Creator	: Onestay|ステー (ID: 118425585163698183)
					>Libary	   : Discord.js (v${discordversion})
					>Verion	  : ${version}

					Sirenox ist ein Bot für den Xoneria Discord. Geschrieben von Onestay.
					Für alle möglichen Commands benutze \`!commands\`.

					>Website	: http://onestay.moe
			`,
			timestamp: new Date(),
			footer: {
				icon_url: this.client.user.avatarURL, //eslint-disable-line
				text: 'Info'
			}
		};
		return msg.channel.sendMessage('', { embed });
	}
};
