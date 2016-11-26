const { Command } = require('discord.js-commando');

const answers = ['Es ist sicher', 'Ohne zweifel', 'Ja, auf jeden Fall', 'Du kannst dich drauf verlassen', 'Wie ich es sehe, ja', 'Höchstwahrscheinlich', 'Ja', 'Alle Zeichen sagen Ja',
	'Ich habe keine Ahnung, versuchs nochmal', 'Frag mich später nochmal', 'Erzähl ich dir lieber nicht...', 'Vielleicht',
	'Verlass dich nicht drauf', 'Meine Antwort ist nein', 'Meine Quellen sagen nein', 'Sehr unglaubwürdig', 'Nein', 'Ich denke nicht'
];

module.exports = class FortuneCommand extends Command {
	constructor(client) {
		super(client, {
			name: 'fortune',
			group: 'fun',
			memberName: 'fortune',
			description: 'Sagt dir deine Zukunft vorraus.',
			format: '<frage>'
		});
	}

	async run(msg) {
		if (msg.content.endsWith('?')) {
			return msg.reply(`:8ball: Meine Antwort ist... ${answers[Math.floor(Math.random() * answers.length)]}`);
		} else {
			return msg.reply('Das sieht mir nicht nach einer Frage aus.');
		}
	}
};
