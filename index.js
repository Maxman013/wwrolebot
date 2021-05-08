/*
 * Werewolves role assign bot
 * Maxman013 2021
 */

// discord bot setup
const Discord = require("discord.js");
const bot = new Discord.Client();
const fs = require("fs");
const TOKEN = fs.readFileSync("token.txt", "utf8");
// IDs from werewolves server
const GUILD = "811349244077277224";
const REACT_CHANNEL = "835508641322237992";
const REACT_MESSAGE = "839073713672028170";
const RULES_MESSAGE = "836248844290228284";
const PLAYING = "811349665252507658";
const SPECTATING = "811550093030195240";
const DEAD = "811352352871153674";
const WELCOME = "811349245125722114";
const RULES = "811548666275954728";
const DELETION_LOG = "835763598625996800";
const LEAVE = "835803145702866974";
const MAIN_CHAT = "811349535896895498";
// executing role list generator
const spawn = require("child_process").spawn;

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

bot.on("message", message => {
    // create play-or-no-play embed (will need to restart bot probably)
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

    // create rules embed (will need to restart bot probably)
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
		      		"name": "Message deletion",
		      		"value": "Deleting messages is not allowed in any game-related channel. We have a deletion log and can see if you delete messages.\n\u200B"
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
		        	"value": "If you have read everything, react with ✅ to this message. Then go to <#" + REACT_CHANNEL + "> to get <@&" + PLAYING + ">, or take away your reaction to get <@&" + SPECTATING + ">\n\u200B"
		      	},
		      	{
		        	"name": "Server invite",
		        	"value": "Use this Link to share the server\nhttps://discord.gg/jnJk99ZKdx"
		      	}
		    ]
		}}).then(message => {
			message.react("✅");
		});
	}

    // generate role list
    // arg1 = number of players
    // arg2 = number of extra neutrals (default floor(num players / 9) + 1) - can be negative
    // arg3 = number of extra wolves (default floor(num players / 4)) - can be negative
	if (message.content.substring(0, 9) == "!rolelist") {
		var args = ["-W", "ignore", "rolelist.py"]
		var givenArgs = message.content.split(" ");
		givenArgs.shift();
		args = args.concat(givenArgs);
		var rolelist = spawn("python3", args);
		rolelist.stdout.on("data", data => {
			message.channel.send(data.toString());
		});
	}

    // start of game sequence - closes #play-or-no-play to spectating and playing
    if (message.content == "!startgame") {
        if (message.member.roles.cache.some(r => (r.name == "Game master" || r.name == "Moderator"))) {
            message.guild.channels.cache.get(REACT_CHANNEL).updateOverwrite(SPECTATING, {
                "VIEW_CHANNEL": false
            });
            message.guild.channels.cache.get(REACT_CHANNEL).updateOverwrite(PLAYING, {
                "VIEW_CHANNEL": false
            });
        } else {
            message.channel.send("You do not have permission to perform this command.");
        }
    }

    // end of game sequence - remove playing and dead roles from all players and give them spectating
    // also opens up #play-or-no-play to spectating and playing
    if (message.content == "!endgame") {
        if (message.member.roles.cache.some(r => (r.name == "Game master" || r.name == "Moderator"))) {
            var guild = message.guild;
            guild.members.fetch().then(members => {
                members.each(member => {
                    if (member.roles.cache.some(r => (r.id == PLAYING || r.id == DEAD))) {
                        member.roles.remove(guild.roles.cache.get(PLAYING));
                        member.roles.remove(guild.roles.cache.get(DEAD));
                        member.roles.add(guild.roles.cache.get(SPECTATING));
                    }
                });
            });

            guild.channels.cache.get(REACT_CHANNEL).updateOverwrite(SPECTATING, {
                "VIEW_CHANNEL": true
            });
            guild.channels.cache.get(REACT_CHANNEL).updateOverwrite(PLAYING, {
                "VIEW_CHANNEL": true
            });
        } else {
            message.channel.send("You do not have permission to perform this command.");
        }
    }

    // kill mentioned users in game - remove playing role and give dead role
    // can mention multiple people - will kill each player mentioned
    if (message.content.substring(0,5) == "!kill") { 
        if (message.member.roles.cache.some(r => (r.name == "Game master" || r.name == "Moderator"))) {
            var toKill = message.mentions.members;
            var guild = message.guild;
            toKill.each(member => {
                member.roles.remove(guild.roles.cache.get(PLAYING));
                member.roles.add(guild.roles.cache.get(DEAD));
            });
        } else {
            message.channel.send("You do not have permission to perform this command.");
        }
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

        // if in #main-chat, post notification
        if (message.channel == message.guild.channels.cache.get(MAIN_CHAT) && 
            !message.member.roles.cache.some(r => (r.name == "Game master" || r.name == "Moderator")) &&
            !message.author.equals(bot.user)) {
        message.channel.send(`<@${message.author.id}> deleted a message.`);
    }
});

// message edit log
bot.on("messageUpdate", (oldMessage, newMessage) => {
    var date = new Date();
    var time = date.toUTCString();
    // if message content was not changed
    if (oldMessage.content == newMessage.content) {
        return;
    }
    oldMessage.guild.channels.cache.get(DELETION_LOG).send({embed: {
        "title": "Message edit in " + oldMessage.channel.name,
        "fields": [
            {
                "name": "Old message",
                "value": oldMessage.content
            }, 
            {
                "name": "New message",
                "value": newMessage.content
            }
        ],
        "color": 1124280,
        "author": {
            "name": oldMessage.author.tag
        },
        "footer": {
            "text": "The Bouncer"
        },
        "thumbnail": {
            "url": oldMessage.author.avatarURL()
        },
        "timestamp": time
    }});

    // if in #main-chat, post notification
    if (oldMessage.channel == oldMessage.guild.channels.cache.get(MAIN_CHAT) && 
            !oldMessage.member.roles.cache.some(r => (r.name == "Game master" || r.name == "Moderator")) &&
            !oldMessage.author.equals(bot.user)) {
        oldMessage.channel.send(`<@${oldMessage.author.id}> edited a message.\nOld message: ${oldMessage.content}`);
    }
});

// welcome message
bot.on("guildMemberAdd", member => {
	bot.guilds.fetch(GUILD).then(guild => {
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
