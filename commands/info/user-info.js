const { Command } = require('discord.js-commando');
const moment = require('moment');
const stripIndents = require('common-tags').stripIndents;
require('moment-timezone');

module.exports = class UserInfoCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'user-info',
			aliases: ['user'],
			group: 'info',
			memberName: 'user-info',
			description: 'Informationen über einen User',
			format: '<user>',
			guildOnly: true,

			args: [
				{
					key: 'member',
					prompt: 'Über welchen User möchtest du Informationen?',
					type: 'member'
				}
			]
		});
	}

	async run(msg, args) {
		const member = args.member;
		const user = member.user;

		let embed = {
			color: 0x02eeff,
			author: {
				name: `${user.username}#${user.discriminator} (${user.id})`,
				icon_url: user.avatarURL //eslint-disable-line
			},
			fields: [
				{
					name: 'Server Info',
					value: stripIndents`
							${member.nickname !== null ? `> Nickname: ${member.nickname}` : '>No Nickname'}
							>Roles: ${member.roles.map(roles => `\`${roles.name}\``).join(' ')}
							>Beigetreten am: ${moment(member.joinedAt).tz('Europe/Berlin').format('DD.MM.YYYY HH:ss')}
					`
				},
				{
					name: 'User Info',
					value: stripIndents`
							>Erstellt am: ${moment(user.createdAt).tz('Europe/Berlin').format('DD.MM.YYYY HH:ss')}
							>Status: ${user.presence.status}
							>Spiel: ${user.presence.game ? user.presence.game.name : '-'}\n\u200b
					`
				}
			]
		};
		msg.channel.sendMessage('', { embed });
	}
};
