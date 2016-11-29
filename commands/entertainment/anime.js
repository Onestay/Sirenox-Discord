const { Command } = require('discord.js-commando');
const config = require('../../config.json');
const nani = require('nani').init(config.naniID, config.naniSecret);
const moment = require('moment');

const seasons = {
	1: 'Winter',
	2: 'Frühling',
	3: 'Sommer',
	4: 'Herbst'
};

module.exports = class AnimeCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'anime',
			group: 'entertainment',
			memberName: 'anime',
			description: 'Informationen zu einer Anime Serie',
			format: '<anime>',
			args: [
				{
					key: 'anime',
					prompt: 'Gebe einen Anime an, den du suchen willst.',
					type: 'string'
				}
			]
		});
	}
	async run(msg, args) {
		let anime = args.anime;

		try {
			let data = await nani.get(`anime/search/${anime}`);

			if (!Array.isArray(data)) {
				return msg.reply(`Es ist ein Fehler aufgetreten. ${data.error.messages[0]}`);
			}
			if (data.length > 1) {
				this.getMultipleAnime(data, msg);
				return;
			}
			this.getAnimeData(data, 0, msg);
		} catch (e) {
			return msg.reply(`Es ist ein Fehler aufgetreten ${e}`);
		}
	}
	async getMultipleAnime(data, msg) {
		let titleArray = [];
		for (let i = 0; i < data.length; i++) {
			titleArray.push(`${i}: ${data[i].title_romaji} (${data[i].title_english})`);
		}
		this.getAnimeNumber(titleArray.join('\n'), msg, data);
	}
	async getAnimeNumber(titleArray, msg, data) {
		msg.channel.sendCode('', titleArray.toString());
		msg.channel.sendMessage('Es wurden mehrere Anime mit einem ähnlichen Titel gefunden.\n**Gebe die Zahl von dem Anime an, den du suchen willst.**');
		const collector = msg.channel.createCollector(m => m.author === msg.author, { time: 30000 });
		collector.on('message', m => {
			if (typeof titleArray[m.content] !== 'undefined') {
				collector.stop();
				return this.getAnimeData(data, m.content, msg);
			}
			if (typeof titleArray[m.conent] === 'undefined') collector.stop('invalidNum');
			if (isNaN(m.content)) collector.stop('nan');
		});
		collector.on('end', (collected, reason) => {
			if (reason === 'time') return msg.reply('zeit abgelaufen. Versuchs nochmal.');
			if (reason === 'invalidNum') return msg.reply('es sieht nicht so aus, als ob diese Zahl zur Auswahl steht.');
			if (reason === 'nan') return msg.reply('das sieht mir nicht nach einer Zahl aus');
			if (reason === '') return;
		});
	}
	async getAnimeData(data, index, msg) {
		data = data[index];
		let title = data.title_english !== '' && data.title_romaji !== data.title_english ? `${data.title_english} / ${data.title_romaji}(${data.title_japanese})` : `${data.title_english}(${data.title_japanese})`;
		let synopsis = data.description ? data.description.replace(/\\n/g, '\n').replace(/<br>|\\r/g, '').substring(0, 1000) : 'No description.';
		let score = data.average_score / 10;

		let embed = {
			color: 0x0979E8,
			author: {
				name: title,
				url: `http://anilist.co/anime/${data.id}`
			},
			fields: [
				{
					name: 'Typ',
					value: `${data.type}\n${data.season !== null ? this.parseSeason(data.season) : '?'}\n${data.source !== null ? data.source : '?'}`,
					inline: true
				},
				{
					name: 'Episoden',
					value: data.total_episodes,
					inline: true
				},
				{
					name: 'Status',
					value: `${data.airing_status.replace(/(\b\w)/gi, lc => lc.toUpperCase())}`,
					inline: true
				},
				{
					name: 'Genre(s)',
					value: data.genres.join(', '),
					inline: true
				},
				{
					name: 'Episoden Länge',
					value: `${data.duration !== null ? data.duration : '?'} mins/ep`,
					inline: true
				},
				{
					name: 'Score',
					value: score.toFixed(2),
					inline: true
				},
				{
					name: 'Beschreibung',
					value: `${synopsis}\n\u200B`,
					inline: true
				}
			],
			thumbnail: { url: data.image_url_med },
			footer: {
			icon_url: msg.client.user.avatarURL, //eslint-disable-line 
				text: `Started: ${moment.utc(data.start_date).format('DD.MM.YYYY')} | Finished: ${data.end_date !== null ? moment.utc(data.end_date).format('DD.MM.YYYY') : '?'}`
			}
		};
		return msg.channel.sendMessage('', { embed });
	}
	parseSeason(season) {
		return season < 350 ? `${seasons[season % 10]} 20${Math.floor(season / 10)}` : `${seasons[season % 10]} 19${Math.floor(season / 10)}`;
	}
};

