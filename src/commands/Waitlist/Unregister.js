const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const NAME = 'Unregister';
const DESCRIPTION = 'Unregister alerts for a class';

/**
 * @class Unregister
 * @description Unregister alerts for a class
 */
class Unregister extends Subcommand {
  /**
   * Create Unregister Subcommand
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
      clearInterval(id);
      delete cache[id];
      const embed = new EmbedBuilder()
          .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
          .setTitle('Waitlist Alerts')
          .setDescription(`Alert: ${inlineCode(id)} deregistered`)
          .setColor(Styles.Colours.UBC)
          .setTimestamp()
          .setFooter({
            text: `Deregistered by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      interaction.editReply({embeds: [embed]});
    } else {
      this.deferError(
          interaction,
          'Invalid alert id or no permissions to deregister',
      );
    }
  }
}

module.exports = new Unregister(NAME, DESCRIPTION);
