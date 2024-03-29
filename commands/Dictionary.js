const Axios = require('axios');
const {EmbedBuilder, blockQuote, hyperlink} = require('discord.js');

const Command = require('./Command.js');
const Styles = require('../styles.json');
const {
  DICTIONARY_BROWSE_URL, DICTIONARY_URL, THESAURUS_URL,
} = require('../Constants.js');
const Config = require('../configs/config.json');

/**
 * Searches the Oxford dictionary
 */
class Dictionary extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    await interaction.deferReply();
    const word = interaction.options.getString('word', true);
    const url = new URL(DICTIONARY_URL + '/' + word);
    url.searchParams.append('key', Config.DICTIONARY_KEY);

    Axios.get(url.href).then(async (response) => {
      if (response.status === 200) {
        const definition = response.data[0];
        let getSynonyms = interaction.options.getBoolean('synonyms');
        getSynonyms = getSynonyms !== null ? getSynonyms : true;
        const browseURL = new URL(
            DICTIONARY_BROWSE_URL.concat('/' + word),
        ).href;
        const definitionString = blockQuote(
            definition.shortdef.reduce((previousValue, currentValue, index) =>
              previousValue.concat(`${index + 1}. ${currentValue}\n`), '',
            ),
        );
        const embed = this.createEmbed(interaction, new EmbedBuilder()
            .setAuthor({
              name: 'Dictionary.com',
              url: 'https://www.dictionary.com/',
              iconURL: Styles.Icons.Dictionary,
            })
            .setTitle(word)
            .setURL(browseURL)
            .setDescription(`${definition.fl}
              ${definition.meta.stems.join(', ')}
              ${definitionString}
            `)
            .setColor(Styles.Colours.Dictionary)
            .setFooter({
              text: `Searched by: ${interaction.user.username}`
                  .concat(' | Data from dictionaryapi.com')
                  .concat(' | Links route to dictionary.com'),
              iconURL: interaction.user.avatarURL(),
            }),
        );

        if (getSynonyms) {
          const thesaurusUrl = new URL(THESAURUS_URL + '/' + word);
          thesaurusUrl.searchParams.append('key', Config.THESAURUS_KEY);
          const thesaurusResponse = (await Axios.get(thesaurusUrl.href));

          if (thesaurusResponse.status === 200) {
            const thesaurusData = thesaurusResponse?.data[0];
            const synonyms = thesaurusData.meta?.syns[0]?.length > 0 ?
            thesaurusData.meta.syns[0].reduce((previousValue, currentValue) => {
              // eslint-disable-next-line max-len
              const url = new URL(DICTIONARY_BROWSE_URL.concat('/' + currentValue)).href;
              return previousValue.concat(hyperlink(currentValue, url))
                  .concat(', ');
            }, '').slice(0, -2) : 'None';
            const antonyms = thesaurusData.meta?.ants[0]?.length > 0 ?
            thesaurusData.meta.ants[0].reduce((previousValue, currentValue) => {
              // eslint-disable-next-line max-len
              const url = new URL(DICTIONARY_BROWSE_URL.concat('/' + currentValue)).href;
              return previousValue.concat(hyperlink(currentValue, url))
                  .concat(', ');
            }, '')
                .slice(0, -2) : 'None';

            embed.addFields(
                {
                  name: 'Synonyms',
                  value: synonyms.slice(0, 1024),
                  inline: true,
                },
                {
                  name: 'Antonyms',
                  value: antonyms.slice(0, 1024),
                  inline: true,
                },
            );
          }
        }
        interaction.editReply({embeds: [embed]});
      } else {
        this.deferError(interaction, `Error Code: ${response.status}`);
      }
    }).catch((error) => {
      this.deferError(interaction, error.message);
    });
  }
}

const DictionaryCommand = new Dictionary(
    'Dictionary',
    'Find the definition / synonyms of a word',
);
DictionaryCommand.getData()
    .addStringOption((option) =>
      option.setName('word')
          .setDescription('searches the Oxford dictionary for the word')
          .setRequired(true),
    )
    .addBooleanOption((option) =>
      option.setName('synonyms')
          .setDescription('whether to get the synonyms of the word'),
    );

module.exports = DictionaryCommand;
