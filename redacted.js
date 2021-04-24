/*
 * Werewolves role assign bot
 * Maxman013 2021
 */

// discord bot setupi
const Discord = require("discord.js");
const bot = new Discord.Client();
const TOKEN = "[REDACTED]";
// IDs from werewolves server
const GUILD = "811349244077277224";
const CHANNEL = "835508641322237992";
const MESSAGE = "835523310792081468";
const PLAYING = "811349665252507658";
const SPECTATING = "811550093030195240";
const WELCOME = "811349245125722114";
const RULES = "811548666275954728";

// reaction listener filter
const filter = (reaction, user) => {
	return reaction.emoji.name === '🦆';
};

// on startup set up listener
bot.on("ready", () => {
	console.log("Ready");
	bot.user.setActivity("d u c k");
	bot.guilds.fetch(GUILD).then(guild => {
		const message = guild.channels.cache.get(CHANNEL).messages.fetch(MESSAGE).then(message => {

			// create reaction listener, also listening for removals
			const collector = message.createReactionCollector(filter, {dispose: true});

			// on reaction add listener
			collector.on("collect", (reaction, user) => {
				guild.members.fetch(user).then(member => {
					member.roles.add(guild.roles.cache.get(PLAYING));
					member.roles.remove(guild.roles.cache.get(SPECTATING));
				});
			});

			// on reaction remove listener
			collector.on("remove", (reaction, user) => {
				guild.members.fetch(user).then(member => {
					member.roles.add(guild.roles.cache.get(SPECTATING));
					member.roles.remove(guild.roles.cache.get(PLAYING));
				});
			});

		});
	});
});

// if we need to redo the actual message at any point (will need to restart bot probably)
bot.on("message", message => {
	if (message.content == "!newemojilistener") {
		message.guild.channels.cache.get(CHANNEL).send({embed: {
		    "title": "Role Assignment",
		    "description": "React to this message with :duck: to give yourself the <@&" + PLAYING + "> role. Remove your reaction to give yourself the <@&" + SPECTATING + "> role. This channel will be inaccessible once the game starts.",
		    "color": 5661183,
		    "footer": {
		      "text": "The Bouncer"
		    },
		    "author": {
		      "name": "Werewolves"
		    },
		    "thumbnail": {
		      "url": "https://media.discordapp.net/attachments/811349435296120872/835511517310615622/IMG_20210423_1100442.jpg"
		    }
		}}).then(message => {
			message.react("🦆");
			MESSAGE = message.id;
		});
	}
});

// welcome message + auto assign spectator role
bot.on("guildMemberAdd", member => {
	bot.guilds.fetch(GUILD).then(guild => {
		member.roles.add(guild.roles.cache.get(SPECTATING));
		guild.channels.cache.get(WELCOME).send("Welcome <@" + member.id + ">! Please read the rules at <#" + RULES + ">!");
	});
})

bot.login(TOKEN);
