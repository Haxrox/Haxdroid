const {EmbedBuilder} = require('discord.js');

const Command = require('./Command.js');
const Time = require('../utils/Time.js');
const Random = require('../utils/Random.js');
/**
 * Flips a coin
 */
class CoinFlip extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    await interaction.deferReply();
    Time.wait(1000).then(async () => {
      const choice = Random.generate(0, 1);
      const headOption = interaction.options.getString('heads') || 'Heads';
      const tailOption = interaction.options.getString('tails') || 'Tails';
      const question = `${headOption} or ${tailOption}`;
      const result = Math.round(choice) ? headOption : tailOption;

      await interaction.editReply({embeds: [
        this.createEmbed(interaction, new EmbedBuilder()
            .setTitle(`:coin: ${question}`)
            .setDescription(`${result}!`),
        ),
      ]});
    });
  }
}

const CoinFlipCommand = new CoinFlip('CoinFlip', 'Flips a coin');
CoinFlipCommand.getData()
    .addStringOption((option) =>
      option.setName('heads').setDescription('Enter the heads option'),
    )
    .addStringOption((option) =>
      option.setName('tails').setDescription('Enter the tails option'),
    );

module.exports = CoinFlipCommand;
