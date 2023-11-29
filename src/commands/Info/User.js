const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Time = require('../../utils/Time.js');

const NAME = 'User';
const DESCRIPTION = 'Info about a user';

/**
 * User - Info about a user
 */
class User extends Subcommand {
  /**
   * Create User Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addUserOption((option) =>
          option.setName('target').setDescription('The user'),
        );
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    const user = interaction.options.getUser('target') || interaction.user;

    await interaction.reply({embeds: [
      this.createEmbed(interaction, new EmbedBuilder()
          // Force fetch user to get accurate .hexAccentColor
          .setColor(user.hexAccentColor || user.accentColor || null)
          .setTitle(`${user.username} Info`)
          .setURL(user === interaction.client.user ? 'https://haxtech.web.app/projects/Haxdroid' : null)
          .setDescription(`**Profile:** ${user}`)
          .setThumbnail(user.avatarURL())
          .addFields(
              {
                name: 'Created',
                value: user.createdAt.toDateString(),
                inline: true,
              },
              {
                name: 'Tag',
                value: user.tag,
                inline: true,
              },
              {
                name: '\u200b',
                value: '\u200b',
                inline: true,
              },
              // {
              //   name: 'Uptime',
              //   value: Time.secondsToDuration(user.client.uptime),
              //   inline: true,
              // },
              // {
              //   name: 'Ping',
              //   value: `${user.client.ws.ping}ms`,
              //   inline: true,
              // }
          ),
      ),
    ]});
  }
}

module.exports = new User(NAME, DESCRIPTION);
