const { TagDB } = require('../mysql.js');
const config = require('../config.json');
const SqlTag = new TagDB(config.tagHost, config.tagUser, config.tagPassword, config.caseDatabase);
const sql = SqlTag.getConnection();
const Embed = require('../embeds.js');

module.exports = function start(user, guild, client) {
	let modChannel = guild.channels.find('name', 'mod-protokoll');
	let caseNumber;
	sql.query('INSERT INTO `cases`(`caseAction`, `caseUser`, `caseModerator`, `caseReason`, `caseMessageID`) VALUES("Ban",?,"Es wird auf eine Reason gewartet", "None", "Placeholder")', [user.id], (err, res) => {
		if (err) modChannel.sendMessage(`Error Querying: ${err}`);
		caseNumber = res.insertId;
		message(caseNumber, modChannel, client);
	});
};

function message(caseNumber, modChannel, client) {
	sql.query('SELECT * FROM `cases` WHERE `caseNumber` = ?', [caseNumber], (err, res) => {
		if (err) modChannel.sendMessage(`Error querying for results ${err}`);
		let data = res[0];
		let caseNum = data.caseNumber;
		let action = data.caseAction;
		let userID = data.caseUser;
		let mod = data.caseModerator;
		let reason = data.caseReason;
		let user = client.users.get(userID);

		const newEmbed = new Embed(client, null, caseNum, action, user, mod, reason);
		let embed = newEmbed.eventCase();

		return modChannel.sendMessage('', { embed })
		.then(m => {
			sql.query('UPDATE `cases` SET `caseMessageID` = ? WHERE `caseNumber` = ?', [m.id, caseNum], (e, results) => {
				if (err) return modChannel.sendMessage(`Ups es ist ein Fehler Aufgetreten. ERROR ADDING MESSAGE ID TO CASE : ${e} ${results}`);
			});
		});
	});
}
