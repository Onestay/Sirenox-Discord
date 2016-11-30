const { Command } = require('discord.js-commando');

module.exports = class InfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'info',
			group: 'misc',
			memberName: 'info',
			description: 'Informationen über den Bot'
		});
	}

	async run(msg) {
		msg.channel.sendMessage(`Sirenox ist ein Discord Bot, der von @Onestay|ステー#9756. Er basiert auf der Discord.js Libary mit der Discord.js-Commando Command Framework
Er ist Open-Source auf GitHub (https://github.com/Onestay/Sirenox-Discord). Für Probleme oder Vorschläge schreibt mich in Discord an oder schreibt mir eine E-Mail unter onestay@onestay.moe
Vielen Dank an Crawl#3280 der sich täglich meine Fragen anhören muss :') <3`);
	}
};
