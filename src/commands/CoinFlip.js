const {EmbedBuilder, blockQuote} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const Time = require('../utils/Time.js');
const Random = require('../utils/Random.js');

const NAME = 'CoinFlip';
const DESCRIPTION = 'Flips a coin';

/**
 * CoinFlip - flips a coin
 */
class CoinFlip extends SlashCommand {
  /**
   * Create CoinFlip command
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addStringOption((option) =>
          option.setName('heads').setDescription('Enter the heads option'),
        )
        .addStringOption((option) =>
          option.setName('tails').setDescription('Enter the tails option'),
        );
  }

  /**
   * Executes command
   * @param {BaseInteraction} interaction interaction associated with command
   */
  async execute(interaction) {
    super.execute(interaction);

    await interaction.deferReply();
    Time.wait(1000).then(async () => {
      const choice = Random.generateInt(0, 1);
      const headOption = interaction.options.getString('heads') || 'Heads';
      const tailOption = interaction.options.getString('tails') || 'Tails';
      const question = `${headOption} or ${tailOption}`;
      const result = choice ? headOption : tailOption;

      await interaction.editReply({embeds: [
        this.createEmbed(interaction, new EmbedBuilder()
            .setTitle(`:coin: ${question}`)
            .setDescription(blockQuote(`${result}!`)),
        ),
      ]});
    });
  }
}

module.exports = new CoinFlip(NAME, DESCRIPTION);
