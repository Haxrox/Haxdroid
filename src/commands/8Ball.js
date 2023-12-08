const {EmbedBuilder} = require('discord.js');

const SlashCommand = require('../core/SlashCommand.js');
const Styles = require('../configs/styles.json');
const Time = require('../utils/Time.js');
const Random = require('../utils/Random.js');

const NAME = '8Ball';
const DESCRIPTION = 'Asks a Magic 8-Ball question';

const EIGHT_BALL_EMOJI = ':8ball:';

const RESPONSES = [
  'It is certain',
  'It is decidedly so',
  'Without a doubt',
  'Yes definitely',
  'You may rely on it',
  'As I see it, yes',
  'Most likely',
  'Outlook good',
  'Yes',
  'Signs point to yes',
  'Reply hazy, try again',
  'Ask again later',
  'Better not tell you now',
  'Cannot predict now',
  'Concentrate and ask again',
  'Don\'t count on it',
  'My reply is no',
  'My sources say no',
  'Outlook not so good',
  'Very doubtful',
];

const RESPONSE_DATA = {
  Red: {
    Emoji: Styles.Emojis.Red_Circle,
    Colour: Styles.Colours.Red,
  },
  Yellow: {
    Emoji: Styles.Emojis.Yellow_Circle,
    Colour: Styles.Colours.Yellow,
  },
  Green: {
    Emoji: Styles.Emojis.Green_Circle,
    Colour: Styles.Colours.Green,
  },
};

/**
 * Magic8Ball - asks a Magic 8-Ball question
 */
class Magic8Ball extends SlashCommand {
  /**
   * Create 8Ball Command
   * @param {String} name name of command
   * @param {String} description description of command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addStringOption((option) =>
          option.setName('question')
              .setDescription('Enter your question')
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
    Time.wait(1000).then(async () => {
      const responseIndex = Random.generateInt(0, RESPONSES.length);
      const responseColour = responseIndex < 10 ? 'Green' :
        (responseIndex < 15 ? 'Yellow' : 'Red');

      const question = interaction.options.getString('question', true);
      const responseEmoji = RESPONSE_DATA[responseColour].Emoji;
      const response = RESPONSES[responseIndex];

      await interaction.editReply({embeds: [
        this.createEmbed(interaction, new EmbedBuilder()
            .setTitle(`Magic ${EIGHT_BALL_EMOJI}, ${question}?`)
            .setDescription(`${responseEmoji}  ${response}.`)
            .setColor(RESPONSE_DATA[responseColour].Colour),
        ),
      ]});
    });
  }
}

module.exports = new Magic8Ball(NAME, DESCRIPTION);
