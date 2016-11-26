const mysql = require('mysql');
const winston = require('winston');

class RankDB {
	constructor(host, user, password, database) {
		this.host = host;
		this.user = user;
		this.password = password;
		this.database = database;
	}
	createPool() {
		const sqlConnection = mysql.createPool({
			host: this.host,
			user: this.user,
			password: this.password,
			database: this.database
		});
		return sqlConnection;
	}
	connect() {
		var connection = this.createPool();
		connection.getConnection(function(err, connection) { //eslint-disable-line
			if (err) winston.error(`Ein Fehler ist bei der Verbindung zur Rank Datenbank aufgetreten: ${err}`);
			winston.info(`Erfolgreich zur Rank Datenbank verbunden!`);
		});
	}
	getConnection() {
		return this.createPool();
	}
}

class TagDB {
	constructor(host, user, password, database) {
		this.host = host;
		this.user = user;
		this.password = password;
		this.database = database;
	}
	createPool() {
		const sqlConnection = mysql.createPool({
			host: this.host,
			user: this.user,
			password: this.password,
			database: this.database
		});
		return sqlConnection;
	}
	connect() {
		var connection = this.createPool();
		connection.getConnection(function(err, connection) { //eslint-disable-line
			if (err) winston.error(`Ein Fehler ist bei der Verbindung zur Tag Datenbank aufgetreten: ${err}`);
			winston.info(`Erfolgreich zur Tag/Case Datenbank verbunden!`);
		});
	}
	getConnection() {
		return this.createPool();
	}
}

module.exports = { RankDB: RankDB, TagDB: TagDB };
