const {EmbedBuilder} = require('discord.js');

const Command = require('./Command.js');
const Random = require('../utils/Random.js');

/**
 * Generates a random number
 */
class RandomNumberGenerator extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
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

const RNG = new RandomNumberGenerator('RNG', 'Generates a random number');
RNG.getData()
    .addIntegerOption((option) =>
      option.setName('min')
          .setDescription('Enter lower-bound'),
    )
    .addIntegerOption((option) =>
      option.setName('max')
          .setDescription('Enter upper-bound (exclusive)'),
    );
module.exports = RNG;
