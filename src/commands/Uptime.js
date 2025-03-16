const {EmbedBuilder} = require('discord.js');
const os = require('os');

const SlashCommand = require('../core/SlashCommand.js');
const Constants = require('../Constants.js');
const Time = require('../utils/Time.js' );

const NAME = 'Uptime';
const DESCRIPTION = 'Gets uptime statistics';

/**
 * Uptime - Gets uptime statistics
 */
class Uptime extends SlashCommand {
  /**
   * Create Uptime SlashCommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);
  }

  /**
   * Executes command
   * @param {BaseInteraction} interaction interaction associated with command
   */
  async execute(interaction) {
    super.execute(interaction);

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

module.exports = new Uptime(NAME, DESCRIPTION);
