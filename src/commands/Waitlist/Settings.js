const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const NAME = 'Settings';
const DESCRIPTION = 'Toggle alert messages';

/**
 * @class Settings
 * @description Toggle alert messages
 */
class Settings extends Subcommand {
  /**
   * Create Settings Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addStringOption((option) =>
          option.setName('id')
              .setDescription('Id of the alert')
              .setRequired(true),
        )
        .addBooleanOption((option) =>
          option.setName('toggle')
              .setDescription('Toggle alert messages on/off'),
        );
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    const id = interaction.options.getString('id', true);
    if (cache[id] && cache[id].user.id === interaction.user.id) {
      cache[id].toggle = interaction.options.getBoolean('toggle', true);
      const embed = new EmbedBuilder()
          .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
          .setTitle('Waitlist Alerts')
          .setDescription(`Toggle: ${inlineCode(cache[id].toggle)}`)
          .setColor(Styles.Colours.UBC)
          .setTimestamp()
          .setFooter({
            text: `Set by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      interaction.editReply({embeds: [embed]});
    } else {
      this.deferError(
          interaction,
          'Invalid alert id or no permissions to toggle settings',
      );
    }
  }
}

module.exports = new Settings(NAME, DESCRIPTION);
