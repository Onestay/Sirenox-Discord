module.exports = class Embeds {
	constructor(client, msg, caseNumber, action, user, moderator, reason, duration, limit, channel, filter) {
		this.client = client;
		this.caseNumber = caseNumber;
		this.action = action;
		this.user = user;
		this.moderator = moderator;
		this.reason = reason;
		this.duration = duration;
		this.limit = limit;
		this.channel = channel;
		this.filter = filter;
	}
	banCase() {
		this.fullUser = `${this.user.username}#${this.user.discriminator} (${this.user.id})`;
		this.fullMod = `${this.moderator.username}#${this.moderator.discriminator} (${this.moderator.id})`;

		let embed = {
			color: 0xF50029,
			author: {
				name: this.fullMod,
					icon_url: this.moderator.avatarURL //eslint-disable-line
			},
			url: 'http://thisisaplaceholderurltomaybeleadtoamodlogontheweb.com',
			fields: [
				{
					name: 'Action',
					value: `${this.action}`
				},
				{
					name: 'User',
					value: this.fullUser
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
		this.fullMod = `${this.moderator.username}#${this.moderator.discriminator} (${this.moderator.id})`;
		let embed = {
			color: 0xFFEE00,
			author: {
				name: this.fullMod,
					icon_url: this.moderator.avatarURL //eslint-disable-line
			},
			fields: [
				{
					name: 'Action',
					value: `${this.action}`
				},
				{
					name: 'Channel',
					value: this.channel
				},
				{
					name: 'Purged Messages',
					value: this.limit - 1,
					inline: true
				},
				{
					name: 'Filter',
					value: this.filter,
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
	muteCase() {
		let embed = {
			color: 0x079E8,
			author: {
				name: this.client.user.username,
					icon_url: this.client.user.avatarURL //eslint-disable-line
			},
			title: this.moderator,
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
	eventCase() {
		this.fullUser = `${this.user.username}#${this.user.discriminator} (${this.user.id})`;

		let embed = {
			color: 0xF50029,
			author: {
				name: this.moderator,
					icon_url: this.client.user.avatarURL //eslint-disable-line
			},
			url: 'http://thisisaplaceholderurltomaybeleadtoamodlogontheweb.com',
			fields: [
				{
					name: 'Action',
					value: `${this.action}`
				},
				{
					name: 'User',
					value: this.fullUser
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
