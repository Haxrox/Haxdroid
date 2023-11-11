const Styles = require("../styles.json");
const Config = require("../configs/config.json");
const Command = require('./Command.js');
const { EmbedBuilder } = require('discord.js');
const { blockQuote, bold } = require('@discordjs/builders');

const ALERT_RATE = 500; // rate to send each message (ms / message)
const MAX_ALERT = 25; // number of messages
const MAX_LENGTH = 300; // in seconds

function alert(alerter, target, message, duration, count) {
    const alertEmbed = new EmbedBuilder()
        .setTitle(message)
        .setColor(Styles.Colours.Theme)
        .setFooter({ text: `Alerted by: ${alerter.username}`, iconURL: alerter.avatarURL() });

    const resultEmbed = new EmbedBuilder()
        .setTitle("Alert Complete")
        .setColor(Styles.Colours.Green)

    count = count ? Math.min(count, MAX_ALERT) : 0;

    const id = setInterval(() => {
        target.send({ embeds: [alertEmbed.setTimestamp()] }).then(() => {
            count--;
            if (!duration && count <= 0) {
                clearInterval(id);
                alerter.send({ embeds: [resultEmbed] });
            }
        }).catch(error => {
            clearInterval(id);
            alerter.send({
                embeds: [
                    resultEmbed
                        .setTitle("Alert Failed")
                        .setDescription(`Cannot send messages to ${target}\n${blockQuote(error)}`)
                        .setTimestamp()
                ]
            })
        });
    }, ALERT_RATE);

    if (duration) {
        duration = Math.min(duration, MAX_LENGTH);
        setTimeout(() => {
            clearInterval(id);
            alerter.send({ embeds: [resultEmbed.setTimestamp()] });
        }, duration * 1000);
    }
}

/**
 * Alert command - SHOULD NOT BE ABUSED. I wrote this to help wake people up for valorant games
 */
class Alert extends Command {
    Validate(member) {
        return member.user.id === Config.OWNER_ID;
    }

    async Execute(interaction) {
        if (interaction.user.id === Config.OWNER_ID) {
            const message = interaction.options.getString("message", true);
            const target = interaction.options.getUser("target", true);
            const duration = interaction.options.getInteger("duration");
            const count = interaction.options.getInteger("count");

            if (duration != null || count != null) {
                alert(interaction.user, target, message, duration, count);

                const embed = new EmbedBuilder()
                    .setTitle("Alert Initialized")
                    .setDescription(`Alerting ${target} ${duration ? `for ${bold(Math.min(duration, MAX_LENGTH))} seconds` : `${bold(Math.min(count, MAX_ALERT))} times`} with message:\n${blockQuote(message)}`)
                    .setColor(Styles.Colours.Theme)
                    .setTimestamp()
                    .setFooter({ text: `Alerted by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });

                interaction.reply({ embeds: [embed] });
            } else {
                this.Error(interaction, "Field `duration` or `count` must be filled");
            }
        } else {
            this.Error(interaction, "Cannot use this command");
        }
    }
}

const AlertCommand = new Alert("Alert", "Repeatedly sends messages to a certain user");
AlertCommand.GetData()
    .addUserOption(option =>
        option.setName("target").setDescription("user to alert").setRequired(true)
    )
    .addStringOption(option =>
        option.setName("message").setDescription("message to alert").setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName("duration").setDescription("length to alert the messages")
    )
    .addIntegerOption(option =>
        option.setName("count").setDescription("number of messages to send")
    )
module.exports = AlertCommand;