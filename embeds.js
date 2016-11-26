module.exports = class Embeds {
	constructor(client, caseNumber, action, user, moderator, reason, duration, limit, channel) {
		this.client = client;
		this.caseNumber = caseNumber;
		this.action = action;
		this.user = user;
		this.moderator = moderator;
		this.reason = reason;
		this.duration = duration;
		this.limit = limit;
		this.channel = channel;
	}
	banCase() {
		let embed = {
			color: 0x079E8,
			author: {
				name: this.client.user.username,
					icon_url: this.client.user.avatarURL //eslint-disable-line
			},
			title: 'Discord Log Case',
			url: 'http://thisisaplaceholderurltomaybeleadtoamodlogontheweb.com',
			description: `Discord Log Case **${this.caseNumber}**`,
			fields: [
				{
					name: 'Action',
					value: `${this.action}`
				},
				{
					name: 'User',
					value: this.user,
					inline: true
				},
				{
					name: 'Mod',
					value: this.moderator,
					inline: true
				},
				{
					name: 'Reason',
					value: this.reason
				}
			],
			timestamp: new Date(),
			footer: {
				icon_url: this.client.user.avatarURL, //eslint-disable-line
				text: `Log Case ${this.caseNumber}`
			}
		};
		return embed;
	}
	purgeCase() {
		let embed = {
			color: 0x079E8,
			author: {
				name: this.client.user.username,
					icon_url: this.client.user.avatarURL //eslint-disable-line
			},
			title: 'Discord Log Case',
			url: 'http://thisisaplaceholderurltomaybeleadtoamodlogontheweb.com',
			description: `Discord Log Case **${this.caseNumber}**`,
			fields: [
				{
					name: 'Action',
					value: `${this.action}`
				},
				{
					name: 'Channel',
					value: this.channel,
					inline: true
				},
				{
					name: 'Messages',
					value: this.limit,
					inline: true
				},
				{
					name: 'Mod',
					value: this.moderator
				},
				{
					name: 'Reason',
					value: this.reason
				}
			],
			timestamp: new Date(),
			footer: {
				icon_url: this.client.user.avatarURL, //eslint-disable-line
				text: `Log Case ${this.caseNumber}`
			}
		};
		return embed;
	}
	muteCase() {
		let embed = {
			color: 0x079E8,
			author: {
				name: this.client.user.username,
					icon_url: this.client.user.avatarURL //eslint-disable-line
			},
			title: 'Discord Log Case',
			url: 'http://thisisaplaceholderurltomaybeleadtoamodlogontheweb.com',
			description: `Discord Log Case **${this.caseNumber}**`,
			fields: [
				{
					name: 'Action',
					value: `${this.action}`
				},
				{
					name: 'User',
					value: this.user,
					inline: true
				},
				{
					name: 'Mod',
					value: this.moderator,
					inline: true
				},
				{
					name: 'Länge',
					value: this.duration
				},
				{
					name: 'Reason',
					value: this.reason
				}
			],
			timestamp: new Date(),
			footer: {
				icon_url: this.client.user.avatarURL, //eslint-disable-line
				text: `Log Case ${this.caseNumber}`
			}
		};
		return embed;
	}
};
