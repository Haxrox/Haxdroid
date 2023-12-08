const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const NAME = 'List';
const DESCRIPTION = 'List all your alerts';

/**
 * @class List
 * @description List all your alerts
 */
class List extends Subcommand {
  /**
   * Create List Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    const embed = new EmbedBuilder()
        .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
        .setTitle('Waitlist Alerts')
        .setColor(Styles.Colours.UBC)
        .setTimestamp()
        .setFooter({
          text: `Requested by: ${interaction.user.username}`,
          iconURL: interaction.user.avatarURL(),
        });

    let description = '';
    for (const id in cache) {
      if (cache[id].user.id === interaction.user.id) {
        const emoji = cache[id].toggle ?
      Styles.Emojis.Green_Circle : Styles.Emojis.Red_Circle;
        const formattedId = inlineCode(id);
        const formattedCourse = bold(
            hyperlink(cache[id].title, cache[id].url),
        );
        // eslint-disable-next-line max-len
        const lastCheck = Math.round((Date.now() - cache[id].timestamp) / 10) / 100;
        // eslint-disable-next-line max-len
        description += `${emoji} ${formattedId} - ${formattedCourse} - ${lastCheck}s\n`;
      }
    }

    if (description === '') {
      description = 'No alerts registered';
    }

    embed.setDescription(description);
    interaction.editReply({embeds: [embed]});
  }
}

module.exports = new List(NAME, DESCRIPTION);
