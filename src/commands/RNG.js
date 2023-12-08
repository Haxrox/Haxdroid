const {EmbedBuilder} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const Random = require('../utils/Random.js');

const NAME = 'RNG';
const DESCRIPTION = 'Generates a random number';

/**
 * RNG - Generates a random number
 */
class RNG extends SlashCommand {
  /**
   * Create RNG SlashCommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addIntegerOption((option) =>
          option.setName('min')
              .setDescription('Enter lower-bound'),
        )
        .addIntegerOption((option) =>
          option.setName('max')
              .setDescription('Enter upper-bound (exclusive)'),
        );
  }

  /**
   * Executes command
   * @param {BaseInteraction} interaction interaction associated with command
   */
  async execute(interaction) {
    super.execute(interaction);

    const max = interaction.options.getInteger('max');
    const min = interaction.options.getInteger('min');

    if (min <= max) {
      const num = Math.round(Random.generate(min, max));
      await interaction.reply({embeds: [
        this.createEmbed(interaction, new EmbedBuilder()
            .setTitle(`RNG [${min}-${max}]`)
            .setDescription(num.toString()),
        ),
      ]});
    } else {
      await super.Error(interaction, '`max` must be greater than `min`');
    }
  }
}

module.exports = new RNG(NAME, DESCRIPTION);
