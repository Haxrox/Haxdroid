const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const NAME = 'Register';
const DESCRIPTION = 'Register alerts for a class';

/**
 * @class Register
 * @description Register alerts for a class
 */
class Register extends Subcommand {
  /**
   * Create Register Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addStringOption((option) =>
          option.setName('url')
              .setDescription('The class url you want to Waitlist for.')
              .setRequired(true),
        )
        .addBooleanOption((option) =>
          option.setName('toggle')
              .setDescription('Toggle alert messages on/off')
              .setRequired(false),
        );
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    const url = interaction.options.getString('url', true);
    getSeatInfo(url).then(([title, description, seatsRemaining]) => {
      const embed = new EmbedBuilder()
          .setAuthor({
            name: 'UBC',
            url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome',
            iconURL: Styles.Icons.UBC,
          })
          .setTitle(`${title} Waitlist Alert Registered`)
          .setURL(url)
          .setColor(Styles.Colours.UBC)
          .setTimestamp();

      embed.setDescription(description);

      const alertID = initAlert(
          interaction.user,
          title,
          url,
          interaction.options.getBoolean('toggle'),
      );
      embed.setFooter({
        text: `Requested by: ${interaction.user.username} | ID: ${alertID}`,
        iconURL: interaction.user.avatarURL(),
      });

      interaction.editReply({embeds: [embed]});
    }).catch((error) => {
      this.deferError(interaction, error);
    });
  }
}

module.exports = new Register(NAME, DESCRIPTION);
