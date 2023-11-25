const Styles = require('../styles.json');
const Command = require('./Command.js');
const {EmbedBuilder} = require('discord.js');
const Time = require('../utils/Time.js');
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
      const choice = Math.round(Math.random());
      const headOption = interaction.options.getString('heads') || 'Heads';
      const tailOption = interaction.options.getString('tails') || 'Tails';
      const question = `${headOption} or ${tailOption}`;
      const result = choice ? headOption : tailOption;

      const embed = new EmbedBuilder()
          /*
          .setAuthor({
            name: interaction.client.user.username,
            iconURL: interaction.client.user.avatarURL()
          })
          */
          .setTitle(`:coin: ${question}`)
          .setDescription(`${result}!`)
          .setColor(Styles.Colours.Theme)
          .setTimestamp()
          .setFooter({
            text: `Flipped by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL()},
          );
      await interaction.editReply({embeds: [embed]});
    });
  }
}

const CoinFlipCommand = new CoinFlip('CoinFlip', 'Flips a coin');
const Data = CoinFlipCommand.getData();
Data.addStringOption((option) =>
  option.setName('heads').setDescription('Enter the heads option'),
)
    .addStringOption((option) =>
      option.setName('tails').setDescription('Enter the tails option'),
    );

module.exports = CoinFlipCommand;
