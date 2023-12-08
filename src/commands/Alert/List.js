const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const {AlertService} = require('../../services/AlertService.js');
const NAME = 'List';
const DESCRIPTION = 'List all active alerts';

/**
 * @class List
 * @description List all active alerts
 */
class List extends Subcommand {
  /**
   * Create List Subcommand
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

    const user = interaction.options.getUser('user', false);
    const filter = user ? (alert) => alert.alerter === user : undefined;

    interaction.reply({
      embeds: [
        this.createEmbed(interaction, new EmbedBuilder()
            .setTitle(`${user ? user.username : 'All'} Alerts`)
            .setThumbnail(user ? user.avatarURL() :
              interaction.client.avatarURL(),
            )
            .setDescription(AlertService.list(filter)
                .reduce((alert) =>
                  alert.target.concat(': ')
                      .concat(''),
                ),
            ),
        ),
      ],
    });
  }
}

module.exports = new List(NAME, DESCRIPTION);
