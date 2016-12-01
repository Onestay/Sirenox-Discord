const { Command } = require('discord.js-commando');
const moment = require('moment');
const request = require('request');
const config = require('../../config.json');
const version = require('../../package').version;
const path = require('path');
const stripIndents = require('common-tags').stripIndents;
require('moment-timezone');
const winston = require('winston');

module.exports = class WetterCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'wetter',
			group: 'misc',
			memberName: 'wetter',
			description: 'Gibt dir das aktuelle Wetter oder ein Wettervorschau',
			guildOnly: true,

			args: [
				{
					key: 'location',
					prompt: 'Zu welchem Ort willst du Wetterinformationen?',
					type: 'string'
				}
			]
		});
	}
	async run(msg, args) { //eslint-disable-line
		const location = args.location;

		let uri = encodeURIComponent(location.replace(/ /g, '+'));
		this.getLocationData(uri)
		.then(res => {
			let latlng = res.geometry.location;
			let adress = res.formatted_address;
			this.getWeatherData(latlng, adress)
			.then(wRes => {
				this.sendWeatherData(wRes, adress, msg)
				.catch(e => {
					msg.reply(`Es ist ein Fehler aufgetreten ${e}`);
					return;
				});
			})
			.catch(e => {
				msg.reply(`Es ist ein Fehler aufgetreten ${e}`);
				return;
			});
		})
		.catch(e => {
			return msg.reply('Es ist ein Fehler aufgetreten...' + e); //eslint-disable-line
		});
	}
	async getLocationData(uri) {
		return new Promise((resolve, reject) => {
			request({
				uri: `https://maps.googleapis.com/maps/api/geocode/json?address=${uri}&key=${config.geoCodingApi}`,
				headers: { 'User-Agent': `Sirenox ${version} (https://github.com/onestay/sirenox-discord)` },
				json: true
			}, (err, response, body) => {
				if (err) reject(err);
				if (body.status === 'ZERO_RESULTS') return reject('Der Ort konnte nicht gefunden werden');
				if (body.status === 'REQUEST_DENIED') return reject('Die Geocode abfrage wurde abgelehnt');
				if (body.status === 'INVALID_REQUEST') return reject('Invalide anfrage');
				if (body.status === 'OVER_QUERY_LIMIT') return reject('Überm Query Limit. Versuche es später nochmal');
				resolve(body.results[0]);
			});
		});
	}
	async getWeatherData(res) {
		return new Promise((resolve, reject) => {
			request({
				uri: `https://api.darksky.net/forecast/${config.darkSkyApi}/${res.lat},${res.lng}?exclude=minutely&lang=de&units=ca`,
				headers: { 'User-Agent': `Sirenox ${version} (https://github.com/onestay/sirenox-discord)` },
				json: true
			}, (err, response, body) => {
				if (err) reject(err);
				resolve(body);
			});
		});
	}
	async sendWeatherData(data, adress, msg) {
		let formattedAdress = adress;
		let timezone = data.timezone;
		let temp = data.currently.temperature;
		let precip = data.currently.precipProbability * 100;
		let humidity = data.currently.humidity * 100;
		let windSpeed = data.currently.windSpeed;
		let summary = data.currently.summary;
		let icon = this.getIcon(data.currently.icon);
		let sunset = new Date(data.daily.data[0].sunsetTime * 1000);
		let sunrise = new Date(data.daily.data[0].sunriseTime * 1000);
		let formSunrise = moment(sunrise).tz(timezone).format('HH:ss');
		let formSunset = moment(sunset).tz(timezone).format('HH:ss');
		let dailyForecast = this.dailyForecast(data);
//		moment.updateLocale('de', {
//			weekdays: 'Montag_Dienstag_Mittwoch_Donnerstag_Freitag_Samstag_Sonntag'.split('_'),
//			weekdaysShort: 'MO_DI_MI_DO_FR_SA_SO'.split('_')
//		});
		moment.locale('de');
		let time = moment.unix(data.currently.time).tz(timezone)
		.format('dddd, HH:00');

		let embed = {
			color: 0xffe900,
			author: {
				name: `${summary}`,
				icon_url: icon,  //eslint-disable-line
				url: 'https://darksky.net/poweredby/'
			},
			description: `
					**${formattedAdress}**

		${time}
		**${temp}°C**			      
								Niederschlag: ${precip.toFixed(2)}%
						    	Luftfeutchte: ${humidity.toFixed(2)}%
						    	Wind: ${windSpeed} km/h

Sonnenaufgang: ${formSunrise}	Sonnenuntergang: ${formSunset} 
\n\u200b
			`,
			fields: [
				{
					name: 'Forecast',
					value: `${dailyForecast[0]}\n${dailyForecast[1]}\n${dailyForecast[2]}\n${dailyForecast[3]}`
				}
			],
			footer: {
				icon_url: this.client.user.avatarURL, //eslint-disable-line
				text: '[Powered by Darksky] | Weather Icons by Adam Whitcroft'
			}
		};
		msg.channel.sendMessage('', { embed });
	}
	getIcon(icon) {
		if (icon === 'clear-day') {
			return 'http://onestay.moe/bot/weather_icons/clear-day.png';
		} else if (icon === 'clear-night') {
			return 'http://onestay.moe/bot/weather_icons/clear-night.png';
		} else if (icon === 'cloudy') {
			return 'http://onestay.moe/bot/weather_icons/cloudy.png';
		} else if (icon === 'fog') {
			return 'http://onestay.moe/bot/weather_icons/fog.png';
		} else if (icon === 'partly-cloudy-day') {
			return 'http://onestay.moe/bot/weather_icons/partly-cloudy-day.png';
		} else if (icon === 'partly-cloudy-night') {
			return 'http://onestay.moe/bot/weather_icons/partly-cloudy-night.png';
		} else if (icon === 'rain') {
			return 'http://onestay.moe/bot/weather_icons/rain.png';
		} else if (icon === 'sleet') {
			return 'http://onestay.moe/bot/weather_icons/sleet.png';
		} else if (icon === 'snow') {
			return 'http://onestay.moe/bot/weather_icons/snow.png';
		} else if (icon === 'wind') {
			return 'http://onestay.moe/bot/weather_icons/wind.png';
		} else {
			return 'http://onestay.moe/bot/weather_icons/clear-day.png';
		}
	}
	dailyForecast(data) {
		moment.locale('de');
		let forecastArray = new Array(); //eslint-disable-line
		for (let i = 1; i < 5; i++) {
			let weekday = moment.unix(data.daily.data[i].time).tz(data.timezone).format('ddd');
			let maxTemp = data.daily.data[i].temperatureMax;
			let minTemp = data.daily.data[i].temperatureMin;
			let summary = data.daily.data[i].summary;
			forecastArray.push(`${weekday} ${minTemp}° - ${maxTemp}° (${summary})`);
		}
		forecastArray.join('\n\u200b');
		return forecastArray;
	}
};
