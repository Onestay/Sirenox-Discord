const commando = require('discord.js-commando');
const winston = require('winston');
const oneLine = require('common-tags').oneLine;
const path = require('path');
const { RankDB } = require('./mysql.js');
const { TagDB } = require('./mysql.js');
const Embed = require('./embeds.js');


const config = require('./config.json');

// creates the Discord Client, Tag and Rank DB Objects
const SqlRank = new RankDB(config.rankHost, config.rankUser, config.rankPassword, config.rankDatabase);
const SqlTag = new TagDB(config.tagHost, config.tagUser, config.tagPassword, config.tagDatabase);
const SqlCase = new TagDB(config.tagHost, config.tagUser, config.tagPassword, config.caseDatabase);
const sql = SqlCase.getConnection();

const client = new commando.Client({
	owner: config.owner,
	commandPrefix: '!',
	disableEveryone: true,
	unknownCommandResponse: false,
	disabledEvents: [
		'TYPING_START',
		'VOICE_STATE_UPDATE'
	]
});

client.on('error', winston.error)
		.on('warn', winston.warn)
		.on('ready', () => {
			winston.info(oneLine`
					Sirenox is Ready!
					${client.user.username}#${client.user.discriminator} (${client.user.id})
					`);
			winston.info(`Guilds: ${client.guilds.size} Channels: ${client.channels.size} Users: ${client.users.size} Ready at: ${client.readyAt}`);
		})
		.on('disconnect', () => { winston.warn('Disconnected!'); })
		.on('reconnect', () => { winston.warn('Reconnecting...'); })
		.on('commandError', (cmd, err) => {
			if (err instanceof commando.FriendlyError) return;
			winston.error(`Error in command ${cmd.groupID}:${cmd.memberName}`, err);
		})
		.on('commandBlocked', (msg, reason) => {
			winston.info(oneLine`
					Commands ${msg.command ? `${msg.command.groupID}:${msg.command.memberName}` : ''}
					blocked; ${reason}
				`);
		})
		.on('commandPrefixChange', (guild, prefix) => {
			winston.info(oneLine`
			Prefix changed to ${prefix || 'the default'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
				`);
		})
		.on('commandStatusChange', (guild, command, enabled) => {
			winston.info(oneLine`
			Command ${command.groupID}:${command.memberName}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
				`);
		})
		.on('groupStatusChange', (guild, group, enabled) => {
			winston.info(oneLine`
			Group ${group.id}
			${enabled ? 'enabled' : 'disabled'}
			${guild ? `in guild ${guild.name} (${guild.id})` : 'globally'}.
			`);
		})
		.on('message', message => {
			if (message.channel.id === '230637703266304000') {
				message.delete();
			}
			if (message.author.id === '118425585163698183' && message.content === 'ayy') return message.channel.sendMessage('lmao')
		});

client.registry
		.registerGroups([
			['misc', 'Misc'],
			['mod', 'Moderation'],
			['fun', 'Fun'],
			['entertainment', 'Filme, Serien und Anime'],
			['info', 'Informationen']
		])
		.registerDefaults()
		.registerCommandsIn(path.join(__dirname, 'commands'));

SqlTag.connect();
SqlRank.connect();
client.login(config.token);
