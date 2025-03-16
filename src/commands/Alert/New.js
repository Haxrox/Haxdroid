const {EmbedBuilder, blockQuote} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const {AlertBuilder, AlertService} = require('../../services/AlertService.js');

const NAME = 'New';
const DESCRIPTION = 'Create new alert';

/**
 * @class New
 * @description Create new alert
 */
class New extends Subcommand {
  /**
   * Create New Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addUserOption((option) =>
          option.setName('target')
              .setDescription('user to alert')
              .setRequired(true),
        )
        .addStringOption((option) =>
          option.setName('message')
              .setDescription('message to alert')
              .setRequired(true),
        )
        .addIntegerOption((option) =>
          option.setName('duration')
              .setDescription('length to alert the messages'),
        )
        .addIntegerOption((option) =>
          option.setName('count')
              .setDescription('number of messages to send'),
        );
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    const message = interaction.options.getString('message', true);
    const target = interaction.options.getUser('target', true);
    const duration = interaction.options.getInteger('duration');
    const count = interaction.options.getInteger('count');

    if (duration != null || count != null) {
      const alertBuilder = new AlertBuilder()
          .setAlerter(interaction.user)
          .setTarget(target)
          .setMessage(message)
          .setDuration(duration)
          .setCount(count);

      const alertId = AlertService.execute(alertBuilder);

      interaction.reply({embeds: [
        this.createEmbed(interaction, new EmbedBuilder()
            .setTitle('Alert Initialized')
            .setDescription('Alerting '
                .concat(target)
                .concat(' ')
                .concat(alertBuilder.getDurationString())
                .concat(' with message:\n')
                .concat(blockQuote(message)),
            )
            .setFooter({
              text: 'Alerted by: '
                  .concat(interaction.user.username)
                  .concat(' | Alert ID: ')
                  .concat(alertId),
            }),
        ),
      ]});
    } else {
      this.error(interaction, 'Field `duration` or `count` must be filled');
    }
  }
}

module.exports = new New(NAME, DESCRIPTION);
