const {EmbedBuilder, blockQuote} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const Styles = require('../configs/styles.json');
const wolframAlphaAPI = require('../services/WolframAlphaAPI.js');
const Configuration = require('../configs/config.json');

const wolframAPI = wolframAlphaAPI(Configuration.WOLFRAM_KEY);
const BASE_URL = `https://www.wolframalpha.com/input`;

const NAME = 'Wolfram';
const DESCRIPTION = 'Get answers from WolframAlpha';

/**
 * Wolfram - Get answers from WolframAlpha
 */
class Wolfram extends SlashCommand {
  /**
   * Create Wolfram SlashCommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addStringOption((option) =>
          option.setName('query')
              .setDescription('WolframAlpha Query')
              .setRequired(true),
        );
  }

  /**
   * Executes command
   * @param {BaseInteraction} interaction interaction associated with command
   */
  async execute(interaction) {
    super.execute(interaction);

    await interaction.deferReply();
    const query = interaction.options.getString('query', true);

    const url = new URL(BASE_URL);
    url.searchParams.append('i', query);

    wolframAPI.getFull({
      input: query,
    }).then((response) => {
      if (response.success && !response.error) {
        const plotPod = response.pods.find((pod) => pod.id.includes('Plot'));
        let fieldCount = 0;

        const embed = new EmbedBuilder()
            .setAuthor({
              name: 'WolframAlpha',
              url: 'https://www.wolframalpha.com/',
              iconURL: Styles.Icons.Wolfram,
            })
            .setTitle('Wolfram Query')
            .setURL(url.href)
            .setImage(plotPod ? plotPod.subpods[0].img.src : '')
            .setColor(Styles.Colours.Wolfram)
            .setTimestamp()
            .setFooter({
              text: `Queried by: ${interaction.user.username}`,
              iconURL: interaction.user.avatarURL(),
            });

        response.pods.forEach((pod) => {
          if (!pod.id.includes('Plot')) {
            let data = '';
            pod.subpods.forEach((podData) => {
              data = data.concat(`${podData.plaintext}\n`);
            });
            if (data != '' && data != '\n' && fieldCount < 25) {
              embed.addFields(
                  {
                    name: pod.id,
                    value: blockQuote(data),
                    inline: fieldCount != 0 && fieldCount % 3 != 0,
                  },
              );
              fieldCount++;
            }
          }
        });
        interaction.editReply({embeds: [embed]});
      } else {
        this.deferError(
            interaction,
            // eslint-disable-next-line max-len
            `Query failed. Visit this **[link](${url.href})** to fix your query`,
        );
      }
    }).catch((error) => {
      this.deferError(
          interaction,
          // eslint-disable-next-line max-len
          `Query failed. Failed to communicate with **[WolframAPI](https://products.wolframalpha.com/api/)**
        \n
        **Error**\m ${blockQuote(error.message)}
        `);
    });
  }
}

module.exports = new Wolfram(NAME, DESCRIPTION);
