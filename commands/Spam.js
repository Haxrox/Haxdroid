const Styles = require("../styles.json");
const Config = require("../config.json");
const Command = require('./Command.js');
const {MessageEmbed} = require('discord.js');
const {blockQuote, bold} = require('@discordjs/builders');

const SPAM_RATE = 1000; // rate to send each message
const MAX_SPAM = 25; // number of messages
const MAX_LENGTH = 60; // in seconds

function spam(spammer, target, message, duration, count) {
    const spamEmbed = new MessageEmbed()
    .setTitle(message)
    .setColor(Styles.Colours.Theme)
    .setFooter({text: `Spammed by: ${spammer.username}`, iconURL: spammer.avatarURL()});

    const resultEmbed = new MessageEmbed()
    .setTitle("Spam Complete")
    .setColor(Styles.Colours.Green)

    count = count ? Math.min(count, MAX_SPAM) : 0;

    const id = setInterval(() => {
        target.send({embeds: [spamEmbed.setTimestamp()]}).then(() => {
            count--;
            if (!duration && count <= 0) {
                clearInterval(id);
                spammer.send({embeds: [resultEmbed]});
            }
        }).catch(error => {
            clearInterval(id);
            spammer.send({embeds: [
                resultEmbed
                .setTitle("Spam Failed")
                .setDescription(`Cannot send messages to ${target}\n${blockQuote(error)}`)
                .setTimestamp()
            ]})
        });
    }, SPAM_RATE);

    if (duration) {
        duration = Math.min(duration, MAX_LENGTH);
        setTimeout(() => {
            clearInterval(id);
            spammer.send({embeds: [resultEmbed.setTimestamp()]});
        }, duration * 1000);
    }
}

/**
 * Spam command - SHOULD NOT BE ABUSED. I wrote this to help wake people up for valorant games
 */
class Spam extends Command {
    async Execute(interaction) {
        if (interaction.user.id === Config.OWNER_ID) {
            const message = interaction.options.getString("message", true);
            const target = interaction.options.getUser("target", true);
            const duration = interaction.options.getInteger("duration");
            const count = interaction.options.getInteger("count");

            if (duration != null || count != null) {
                spam(interaction.user, target, message, duration, count);

                const embed = new MessageEmbed()
                .setTitle("Spam Initialized")
                .setDescription(`Spamming ${target} ${duration ? `for ${bold(Math.min(duration, MAX_LENGTH))} seconds` : `${bold(Math.min(count, MAX_SPAM))} times`} with message:\n${blockQuote(message)}`)
                .setColor(Styles.Colours.Theme)
                .setTimestamp()
                .setFooter({text: `Spammed by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});

                interaction.reply({embeds: [embed]});
            } else {
                this.Error(interaction, "Field `duration` or `count` must be filled");
            }
        } else {
            this.Error(interaction, "Cannot user this command");
        }
    }
}

const SpamCommand = new Spam("Spam", "Repeatedly sends messages to a certain user");
SpamCommand.GetData()
.addUserOption(option => 
    option.setName("target").setDescription("user to spam").setRequired(true)
)
.addStringOption(option => 
    option.setName("message").setDescription("Message to spam").setRequired(true)
)
.addIntegerOption(option => 
    option.setName("duration").setDescription("length to spam the messages")
)
.addIntegerOption(option => 
    option.setName("count").setDescription("number of messages to send")
)
module.exports = SpamCommand;