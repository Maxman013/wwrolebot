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
const REACT_CHANNEL = "835508641322237992";
const REACT_MESSAGE = "835523310792081468";
const RULES_MESSAGE = "835866126499708968";
const PLAYING = "811349665252507658";
const SPECTATING = "811550093030195240";
const WELCOME = "811349245125722114";
const RULES = "811548666275954728";
const DELETION_LOG = "835763598625996800";
const LEAVE = "835803145702866974";

// reaction listener filter
const filterPlay = (reaction, user) => {
	return reaction.emoji.name === '🦆';
};

const filterRules = (reaction, user) => {
	return reaction.emoji.name === "✅";
};

// on startup set up listener
bot.on("ready", () => {
	console.log("Ready");
	bot.user.setActivity("d u c k");
	bot.guilds.fetch(GUILD).then(guild => {
		const channels = guild.channels.cache;

		var message = channels.get(REACT_CHANNEL).messages.fetch(REACT_MESSAGE).then(message => {

			// create playing reaction listener, also listening for removals
			const collector = message.createReactionCollector(filterPlay, {dispose: true});

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

		message = channels.get(RULES).messages.fetch(RULES_MESSAGE).then(message => {
			// create rules reaction listener
			const collector = message.createReactionCollector(filterRules, {});

			// on reaction add listener
			collector.on("collect", (reaction, user) => {
				guild.members.fetch(user).then(member => {
					if (!member.roles.cache.some(r => r.name == "Playing") && !member.roles.cache.some(r => r.name == "Spectating")) {
						member.roles.add(guild.roles.cache.get(SPECTATING));
					}
				});
			});

		});
	});
});

// if we need to redo the actual message at any point (will need to restart bot probably)
bot.on("message", message => {
	if (message.content == "!newemojilistener") {
		message.guild.channels.cache.get(REACT_CHANNEL).send({embed: {
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
		});
	}

	if (message.content == "!rulesembed") {
		message.channel.send({embed: {
    "title": "General Rules",
    "description": "Welcome to Werewolves, a real time social deduction game hosted via discord! These rules are in place to keep the game and this server a fun and happy place.\n\u200B",
    "color": 7254209,
    "footer": {
      "text": "The Bouncer"
    },
    "thumbnail": {
      "url": "https://i1.sndcdn.com/avatars-000486250830-gwg59v-t500x500.jpg"
    },
    "author": {
      "name": "Werewolves"
    },
    "fields": [
      {
        "name": "Metagaming",
        "value": "- No sending any screenshots, not even in the wolf chat\n- Making group chats to talk about in-game happenings is NOT permitted\n- Do not talk about the game outside this server except for DMs and whispers\n\u200B"
      },
      {
        "name": "Whispers",
        "value": "Players get 3 whispers daily, a whisper can consist of multiple messages, must be announced in the main chat with the message “player is whispering player”, and cannot be privately responded to without the receiver using a whisper or a DM.\n\nWhispers reset once the dawn message is sent.\n\u200B"
      },
      {
        "name": "DMs",
        "value": "Players get 5 DMs per game. DMs are only 1 message, do not have to be publicly announced, and cannot be privately responded to by the receiver without them using a DM or a whisper.\n\u200B"
      },
      {
        "name": "THE NUMBER 1 RULE OF ALL SOCIAL DEDUCTION DISCORD SERVERS",
        "value": "What happens in game, stays in game\nNothing should be taken personally\nWe will not tolerate insults, being rude, or bullying in any other way\n\nWe are a collective, if you do one of these things, all of the social deduction servers in the hub will know\nIf you feel like you were banned unjustly for breaking this rule, appeal it in the hub server\n\u200B"
      },
      {
        "name": "Important",
        "value": "If you have read everything, react with ✅ to this message. Then go to <#835508641322237992> to get <@&811349665252507658>, or take away your reaction to get <@&811550093030195240>\n\u200B"
      },
      {
        "name": "Server invite",
        "value": "Use this Link to share the server\nhttps://discord.gg/jnJk99ZKdx"
      }
    ]
}}).then(message => {
	message.react("✅");
})
	}
});

// message deletion log
bot.on("messageDelete", message => {
	var date = new Date();
	var time = date.toUTCString();
	message.guild.channels.cache.get(DELETION_LOG).send({embed: {
		"title": "Message deletion in " + message.channel.name,
		"description": message.content,
		"color": 14354697,
		"author": {
			"name": message.author.tag
		},
		"footer": {
	    	"text": "The Bouncer"
	    },
		"thumbnail": {
			"url": message.author.avatarURL()
		},
		"timestamp": time
	}});
});

// welcome message + auto assign spectator role
bot.on("guildMemberAdd", member => {
	bot.guilds.fetch(GUILD).then(guild => {
		member.roles.add(guild.roles.cache.get(SPECTATING));
		guild.channels.cache.get(WELCOME).send("Welcome <@" + member.id + ">! Please read the rules at <#" + RULES + ">!");
	});
})

// leave message
bot.on("guildMemberRemove", member => {
	bot.guilds.fetch(GUILD).then(guild => {
		guild.channels.cache.get(LEAVE).send(member.user.toString() + " left the server.");
	});
})

bot.login(TOKEN);
