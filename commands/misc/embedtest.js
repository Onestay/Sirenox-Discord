const { Command } = require('discord.js-commando');

module.exports = class PingCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'embedtest',
			group: 'misc',
			memberName: 'embedtest',
			description: 'Embedtest'
		});
	}


	async run(msg) { //eslint-disable-line
		let embed = {
			color: 0x0979E8,
			author: {
				name: msg.author.username,
				icon_url: msg.author.avatarURL //eslint-disable-line
			},
			title: 'This is an embed test.',
			url: 'http://onestay.moe',
			description: 'This is a test to see what embeds can do.',
			fields: [
				{
					name: 'Fields',
					value: 'Testing fields'
				},
				{
					name: 'Masked Links',
					value: 'There\'s something like [masked](http://onestay.moe) links'
				},
				{
					name: 'Markdown',
					value: '**Markdown** __**is**__ *working*'
				},
				{
					name: 'Inline?',
					value: 'What the fuck does that do?',
					inline: true
				},
				{
					name: 'THUMPNAILS',
					value: 'How do I do that?',
					inline: true
				}
			],
			image: { url: 'https://s-media-cache-ak0.pinimg.com/736x/92/9d/3d/929d3d9f76f406b5ac6020323d2d32dc.jpg' },
			timestamp: new Date(),
			footer: {
				icon_url: msg.author.avatarURL, //eslint-disable-line
				text: '@onestay'
			}
		};

		return msg.channel.sendMessage('', { embed });
	}
};
