//jshint esversion: 6

process.on('unhandledRejection', error => {
	console.error(error.stack);
});

const discord = require('discord.js');
var fs = require('fs');
const auth = require('./auth.json');

const client = new discord.Client();

client.login(auth.token)
  .then(console.log(`Logged in succesfully.`))
  .catch((err) => {
    console.log(err);
  });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('error', (err) => {
  console.log(err.stack());
});

var logpath = "discord.log";
fs.appendFileSync(logpath, '\n');
var log = {
	log: function (str) {
		var date = new Date();
		var timestamp = date.toLocaleDateString() + " " + date.toLocaleTimeString() + " - ";
		var line = timestamp + str;
		fs.appendFileSync(logpath, line + '\n');
	},
	channel: function (content, channel) {
		if (channel.guild && channel.guild.muted) return;
		if (channel.guild)
			this.log(`/${channel.guild.id}(${channel.guild.name})/${channel.id}(${channel.name})/${content}`);
		 else
			this.log(`/${channel.id}(DM)/${content}`);
	},
	guild: function (content, guild) {
		if (guild.muted) return;
		this.log(`/${guild.id}(${guild.name})/${content}`);
	},
	client: function (str) {
		this.log(str);
	}
};


// logging


client.on('message', (message) => {
  log.channel(`${message.author.tag}/${message.id} : ${message.content}`, message.channel);
});
client.on('messageDelete', (message) => {
  log.channel(`${message.id} has been deleted.`, message,channel);
});
client.on('messageUpdate', (oldMessage, newMessage) => {
  if(oldMessage.content != newMessage.content) {
    log.channel(`${oldMessage.id} has been updated. \nOld message : ${oldMessage.content} \nNew message : ${newMessage.content}`, message.channel);
  }
});
client.on('messageReactionAdd', (messageReaction, user) => {
  log.channel(`${user.id}/${user.tag} has reacted to ${messageReaction.message.id} with reaction ${messageReaction.emoji.name}`, messageReaction.message.channel);
});
client.on('messageReactionRemove', (messageReaction, user) => {
  log.channel(`${user.id}/${user.tag} reaction to ${messageReaction.message} has been removed`, messageReaction.message.channel);
});
client.on('messageReactionRemoveAll', (message) => {
  log.channel(`All reaction to ${message.id} were removed.`);
});

client.on('guildBanAdd', (guild, user) => {
  log.guild(`${user.id}/${user.tag} has been banned.`, guild);
});
client.on('guildBanRemove', (guild, user) => {
  log.guild(`${user.id}/${user.tag} has been unbanned.`, guild);
});
client.on('guildMemberAdd', (member) => {
  log.guild(`${member.user.id}/${member.user.tag} has joined the guild.`, member.guild);
  // member.send(`Welcome to ${member.guild.name}. Message 'pls help' for the list of commands.`);
});
client.on('guildMemberAvailable', (member) => {
  log.guild(`${member.user.id}/${member.user.tag} is now available in the guild.`, member.guild);
});
client.on('guildMemberRemove', (member) => {
  log.guild(`${member.user.id}/${member.user.tag} has been removed from the guild.`, member.guild);
});
client.on('guildMemberUpdate', (oldMember, newMember) => {
	if (newMember.nickname !== oldMember.nickname) log.guild(`User ${newMember.user.id} (${newMember.user.tag}) changed their nickname from "${oldMember.nickname || '(none)'}" to "${newMember.nickname || '(none)'}"`, newMember.guild);
	if (newMember.roles !== oldMember.roles) log.guild(`Roles on user ${newMember.user.id} (${newMember.user.tag}) have been updated.`, newMember.guild);
	if (newMember.serverMute !== oldMember.serverMute) log.guild(`User ${newMember.user.id} (${newMember.user.tag}) has been ${newMember.serverMute ? '' : 'un-'}server-muted.`, newMember.guild);
	if (newMember.serverDeaf !== oldMember.serverDeaf) log.guild(`User ${newMember.user.id} (${newMember.user.tag}) has been ${newMember.serverMute ? '' : 'un-'}server-deafened.`, newMember.guild);
});

client.on('emojiCreate', (emoji) => {
  log.guild(`Emoji ${emoji.identifier}/${emoji.id} has been created. \nURL : ${emoji.url}`, emoji.guild);
});
client.on('emojiDelete', (emoji) => {
  log.guild(`Emoji ${emoji.identifier}/${emoji.id} has been deleted.\nURL : ${emoji.url}`, emoji.guild);
});
client.on('emojiUpdate', (oldEmoji, newEmoji) => {
  log.guild(`Emoji ${oldEmoji.identifier} has been updated to ${newEmoji.identifier}`, oldEmoji.guild);
});

client.on('roleCreate', (role) => {
  log.guild(`${role.id}/${role.name} has been created.`, role.guild);
});
client.on('roleDelete', (role) => {
  log.guild(`${role.id}/${role.name} has been deleted.`, role.guild);
});
client.on('roleUpdate', (oldRole, newRole) => {
	if (newRole.name !== oldRole.name) log.guild(`Role ${oldRole.id} (${oldRole.name}) has been renamed to "${newRole.name}"`, newRole.guild);
	if (newRole.color !== oldRole.color) log.guild(`Color of role ${oldRole.id} (${oldRole.name}) has changed from ${oldRole.color} to ${newRole.color}`, newRole.guild);
	if (newRole.position !== oldRole.position) log.guild(`Position of role ${oldRole.id} (${oldRole.name}) changed from ${oldRole.position} to ${newRole.position}`, newRole.guild);
	if (newRole.permissions !== oldRole.perissions) log.guild(`Permissions of role ${oldRole.id} (${oldRole.name}) changed from ${oldRole.permissions} to ${newRole.permissions}`, newRole.guild);
});

client.on('channelCreate', (channel) => {
  log.channel(`Client gained access to channel.`, channel);
});
client.on('channelDelete', (channel) => {
  log.channel(`Client lost access to channel.`, channel);
});
client.on('channelPinsUpdate', (channel) => {
  log.channel(`Pinned messages have been updated.`, channel);
});
client.on('channelUpdate', (oldChannel, newChannel) => {
	if (newChannel.type === "text") {
		if (newChannel.name !== oldChannel.name) log.channel(`Channel renamed from #${oldChannel.name} to #${newChannel.name}`, newChannel);
		if (newChannel.topic !== oldChannel.topic) log.channel(`Topic changed from "${oldChannel.topic}" to "${newChannel.topic}"`, newChannel);
		if (newChannel.nsfw !== oldChannel.nsfw) log.channel(`NSFW mode is now ${newChannel.nsfw ? 'enabled' : 'disabled'}.`, newChannel);
		if (newChannel.permissionOverwrites !== oldChannel.permissionOverwrites) log.channel(`Permissions have been updated.`, newChannel);
		if (newChannel.position !== oldChannel.position) log.channel(`Channel position has changed to ${newChannel.position}`, newChannel);
	}
	if (newChannel.type === "voice") {
		if (newChannel.name !== oldChannel.name) log.channel(`Channel name changed from "${oldChannel.name}" to "${newChannel.name}"`, newChannel);
		if (newChannel.bitrate !== oldChannel.bitrate) log.channel(`Bitrate changed from "${oldChannel.bitrate}" to "${newChannel.bitrate}"`, newChannel)
		if (newChannel.userLimit !== oldChannel.userLimit) log.channel(`User limit changed from "${oldChannel.userLimit}" to "${newChannel.userLimit}"`, newChannel);
		if (newChannel.permissionOverwrites !== oldChannel.permissionOverwrites)  log.channel(`Permissions have been updated.`, newChannel);
	}
});

client.on('guildCreate', (guild) => {
  log.client(`Client joined guild ${guild.id}/${guild.name}`);
});
client.on('guildDelete', (guild) => {
  log.client(`Client left guild ${guild.id}/${guild.name}`);
});
client.on('userUpdate', (oldUser, newUser) => {
	if (newUser.tag !== oldUser.tag) log.client(`User ${newUser.id} changed their username from "${oldUser.tag}" to "${newUser.tag}"`);
	if (newUser.displayAvatarURL !== oldUser.displayAvatarURL) log.client(`User ${newUser.id} (${newUser.tag}) changed their avatar. Old avatar: ${oldUser.displayAvatarURL} New avatar: ${newUser.displayAvatarURL}`);
});


// commands

client.on('message', (message) => {
  if (!message.guild) return;

  var args = message.content.split(' ');

  if (message.content.toLowerCase().startsWith('pls')) {
    cmd = args[1].toLowerCase();
    switch(cmd) {

      case 'kick' :
        const userk = message.mentions.users.first();
        if(userk) {
          const memberk = message.guild.member(userk);

          if(message.member.hasPermission('KICK_MEMBERS')) {
            memberk.kick()
              .then(() => {
                message.reply(`Succesfully kicked ${userk.tag}`);
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            message.reply(`You don't have the permission to kick members.`);
          }
        } else {
          message.reply(`You didn't mention the user to kick.`);
        }
        break;

      case 'ban' :

        number_days = args[4];

        const userb = message.mentions.users.first();
        if(userb) {
          const memberb = message.guild.member(userb);

          if(message.member.hasPermission('BAN_MEMBERS')) {
            memberb.ban(number_days)
              .then(() => {
                message.reply(`Succesfully banned ${userb.tag}`);
              })
              .catch((error) => {
                console.log(error);
              });
          } else {
            message.reply(`You don't have the permission to ban members.`);
          }
        } else {
          message.reply(`You didn't mention the user to ban.`);
        }
        break;

      case 'mute' :

        const userm = message.mentions.users.first();
        if(userm) {
          const memberm = message.guild.member(userm);
          if(message.member.hasPermission('MUTE_MEMBERS')) {
            memberm.setMute('true')
                .then(() => {
                  message.reply(`Succesfully muted ${userm.tag}`);
                })
                .catch((error) => {
                  console.log(error);
                });
          } else {
            message.reply(`You don't have the required permissions.`);
          }

        } else {
          message.member.setMute('true')
            .then(() => {
              message.reply(`Your mic is now muted.`);
            })
            .catch((error) => {
              console.log(error);
            });
        }
        break;

      case 'unmute' :
        const useru = message.mentions.users.first();
        if(useru) {
          const memberu = message.guild.member(useru);
          if(message.member.hasPermission('MUTE_MEMBERS')) {
            memberu.setMute('false')
                .then(() => {
                  message.reply(`Succesfully unmuted ${useru.tag}`);
                })
                .catch((error) => {
                  console.log(error);
                });
          } else {
            message.reply(`You don't have the required permissions.`);
          }
        } else {
          message.member.setMute('false')
            .then(() => {
              message.reply(`Your mic is now unmuted.`);
            })
            .catch((error) => {
              console.log(error);
            });
        }
        break;

      case 'deaf' :
        const userd = message.mentions.users.first();
        if(userd) {
          const memberd = message.guild.member(userd);
          if(message.member.hasPermission('DEAFEN_MEMBERS')) {
            memberd.setDeaf('true')
                .then(() => {
                  message.reply(`Succesfully deafened ${userd.tag}`);
                })
                .catch((error) => {
                  console.log(error);
                });
          } else {
            message.reply(`You don't have the required permissions.`);
          }

        } else {
          message.member.setDeaf('true')
            .then(() => {
              message.reply(`You have been deafened.`);
            })
            .catch((error) => {
              console.log(error);
            });
        }
        break;

      case 'undeaf' :
        const userud = message.mentions.users.first();
        if(userud) {
          const memberud = message.guild.member(userud);
          if(message.member.hasPermission('DEAFEN_MEMBERS')) {
            memberud.setDeaf('false')
                .then(() => {
                  message.reply(`Succesfully undeafened ${userud.tag}`);
                })
                .catch((error) => {
                  console.log(error);
                });
          } else {
            message.reply(`You don't have the required permissions.`);
          }

        } else {
          message.member.setDeaf('false')
            .then(() => {
              message.reply(`You have been undeafened.`);
            })
            .catch((error) => {
              console.log(error);
            });
        }
        break;


    }
  }
});
