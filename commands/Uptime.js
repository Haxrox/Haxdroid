const Styles = require('../styles.json');
const Constants = require('../Constants.js');
const Command = require('./Command.js');
const {EmbedBuilder} = require('discord.js');
const Time = require('../utils/Time.js' );

const os = require('os');

/**
 * Gets uptime statistics
 */
class Uptime extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    const botUptime = interaction.client.uptime;
    const procUptime = process.uptime();
    const vmUptime = os.uptime();

    interaction.reply({embeds: [
      this.createEmbed(interaction, new EmbedBuilder()
          .setTitle('Uptime Information')
          .setThumbnail(interaction.client.user.avatarURL())
          .addFields([
            {
              name: 'VM Uptime',
              value: Time.secondsToDuration(vmUptime),
              inline: true,
            },
            {
              name: 'Proc Uptime',
              value: Time.secondsToDuration(procUptime),
              inline: true,
            },
            {
              name: 'Bot Uptime',
              value: Time.secondsToDuration(botUptime * Constants.MS_TO_S),
              inline: true,
            },
          ]),
      ),
    ]});
  }
}

const UptimeCommand = new Uptime('Uptime', 'Returns uptime statistics');

module.exports = UptimeCommand;
