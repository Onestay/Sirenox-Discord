const { Command } = require('discord.js-commando');
const request = require('request');

module.exports = class UrbanCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'urban',
			group: 'fun',
			memberName: 'urban',
			description: 'Gibt dir die Definition eines Wortes von Urbandictionary',
			format: '<wort>',

			args: [
				{
					key: 'word',
					prompt: 'Gebe ein Wort ein, das gesucht werden soll',
					type: 'string'
				}
			]
		});
	}

	async run(msg, args) {
		let word = args.word;
		let data = await this.getWord(msg, word)
		.catch(e => msg.reply(e));
		let embed = {
			color: 0x4800ff,
			title: `**__${data.word}__**`,
			url: data.permalink,
			fields: [
				{
					name: 'Definition',
					value: data.definition
				},
				{
					name: 'Beispiel',
					value: data.example
				},
				{
					name: 'Info',
					value: `Author: ${data.author}\n:thumbsup: ${data.thumbs_up} || :thumbsdown: ${data.thumbs_down}`
				}
			]
		};
		msg.channel.sendMessage('', { embed });
	}
	async getWord(msg, word) {
		return new Promise((resolve, reject) => {
			request({
				url: `http://api.urbandictionary.com/v0/define?term=${word}`,
				json: true
			}, (err, response, body) => {
				if (err) reject(err);
				if (body.result_type === 'no_results') return reject('Dieses Wort existiert nicht.');
				resolve(body.list[0]);
			});
		});
	}
};
