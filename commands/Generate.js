const {EmbedBuilder, blockQuote, inlineCode, spoiler} = require('discord.js');
const Uuid = require('uuid'); // might write own algorithm for each version

const Command = require('./Command.js');
const Styles = require('../styles.json');
const {LOWER_CASE, UPPER_CASE, SPECIAL, DIGITS} = require('../Constants.js');
const Random = require('../utils/Random.js');

/**
 * Generate pieces of data
 */
class Generate extends Command {
  Subcommands = {
    array: function(interaction) {
      const length = interaction.options.getInteger('length') ||
        Random.generate(10);
      const ordering = interaction.options.getString('order') || 'unordered';
      const type = interaction.options.getString('type') || 'int';
      const min = interaction.options.getInteger('min');
      const max = interaction.options.getInteger('max');
      let data = [];
      for (let index = 0; index < length; index++) {
        let value = Random.generate(min, max);
        switch (type) {
          case 'int':
            value = Math.round(value);
            break;
          case 'float':
            value = Math.fround(value);
            break;
          case 'double':
            break;
        }
        data.push(value);
      }
      // Sort on insert rather than sorting entire array for better optimization
      data = ordering == 'unordered' ? data :
        data.sort((a, b) =>
          ordering == 'ascending' ? a - b : b - a,
        );
      return inlineCode(data.join(', '));
    },
    uuid: function(interaction) {
      const version = interaction.options.getString('version', true);

      if (Uuid[version]) {
        return Uuid[version]();
      } else {
        return Uuid.v4();
      }
    },
    password: function(interaction) {
      const length = interaction.options.getInteger('length', true);
      const strength = interaction.options.getString('strength', true);
      let upperCase = interaction.options.getBoolean('upper');
      let digits = interaction.options.getBoolean('digits');
      let special = interaction.options.getBoolean('special');
      const password = [];
      for (let index = 0; index < length; index++) {
        if (upperCase) {
          password.push(
              UPPER_CASE.charAt(Random.generateSecure(0, UPPER_CASE.length)),
          );
          password.push(
              UPPER_CASE.charAt(Random.generateSecure(0, UPPER_CASE.length)),
          );
          upperCase = false;
          index++;
        } else if (digits) {
          password.push(
              DIGITS.charAt(Random.generateSecure(0, DIGITS.length)),
          );
          password.push(
              DIGITS.charAt(Random.generateSecure(0, DIGITS.length)),
          );
          digits = false;
          index++;
        } else if (special) {
          password.push(
              SPECIAL.charAt(Random.generateSecure(0, SPECIAL.length)),
          );
          password.push(
              SPECIAL.charAt(Random.generateSecure(0, SPECIAL.length)),
          );
          special = false;
          index++;
        } else {
          let value;
          switch (strength) {
            case 'weak':
              password.push(ALL.charAt(Random.generateSecure(0, ALL.length)));
              break;
            case 'medium':
              switch (Random.generateSecure(0, 3)) {
                case 0:
                  value = ALPHABET.charAt(
                      Random.generateSecure(0, ALPHABET.length),
                  );
                  break;
                case 1:
                  value = DIGITS.charAt(
                      Random.generateSecure(0, DIGITS.length),
                  );
                  break;
                case 2:
                  value = SPECIAL.charAt(
                      Random.generateSecure(0, SPECIAL.length),
                  );
                  break;
              }
              break;
            case 'strong':
              switch (Random.generateSecure(0, 3)) {
                case 0:
                  value = LOWER_CASE.charAt(
                      Random.generateSecure(0, LOWER_CASE.length),
                  );
                  break;
                case 1:
                  value = UPPER_CASE.charAt(
                      Random.generateSecure(0, UPPER_CASE.length),
                  );
                  break;
                case 2:
                  value = DIGITS.charAt(
                      Random.generateSecure(0, DIGITS.length),
                  );
                  break;
                case 3:
                  value = SPECIAL.charAt(
                      Random.generateSecure(0, SPECIAL.length),
                  );
                  break;
              }
              break;
            default:
              break;
          }
          password.push(value);
        }
      }
      // Fisher-yates shuffle
      for (let index = length - 1; index > 0; index--) {
        // Pick random index to swap with
        const swap = Math.round(Random.generateSecure(0, index + 1));
        // Swap elements
        const temp = password[index];
        password[index] = password[swap];
        password[swap] = temp;
      }
      return spoiler(password.join(''));
    },
    random_number: function(interaction) {
      const min = interaction.options.getInteger('min');
      const max = interaction.options.getInteger('max');
      return Random.generate(min, max);
    },
  };
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    if (this.Subcommands[subcommand]) {
      const data = await this.Subcommands[subcommand](interaction);
      const embed = new EmbedBuilder()
          .setTitle(`Generated ${subcommand} data`)
          .setDescription(blockQuote(data || 'none'))
          .setColor(Styles.Colours.Theme)
          .setTimestamp()
          .setFooter({
            text: `Requested by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      interaction.reply({embeds: [embed], ephemeral: subcommand == 'password'});
    } else {
      this.error(interaction, 'Invalid subcommand - ' + subcommand);
    }
  }
}

const GenerateCommand = new Generate('Generate', 'Generate uesful properties');
GenerateCommand.getData()
    .addSubcommand((subcommand) =>
      subcommand.setName('array')
          .setDescription('Generates an array of X elements')
          .addIntegerOption((option) =>
            option.setName('length').setDescription('length of array'),
          )
          .addStringOption((option) =>
            option.setName('type').setDescription('type of the data')
                .addChoices(
                    {name: 'Integer', value: 'int'},
                    {name: 'Float', value: 'float'},
                    {name: 'Double', value: 'double'},
                ),
          )
          .addStringOption((option) =>
            option.setName('order')
                // eslint-disable-next-line max-len
                .setDescription('whether the array is in ascending, descending, or unsorted order')
                .addChoices(
                    {name: 'Unordered', value: 'unordered'},
                    {name: 'Ascending', value: 'ascending'},
                    {name: 'Descending', value: 'descending'},
                ),
          )
          .addIntegerOption((option) =>
            option.setName('min')
                .setDescription('Enter lower-bound'),
          )
          .addIntegerOption((option) =>
            option.setName('max')
                .setDescription('Enter upper-bound (exclusive)'),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('random_number')
          .setDescription('Generates random number (alias of RNG command)')
          .addIntegerOption((option) =>
            option.setName('min')
                .setDescription('Enter lower-bound'),
          )
          .addIntegerOption((option) =>
            option.setName('max')
                .setDescription('Enter upper-bound (exclusive)'),
          ),
    )
    // https://www.baeldung.com/java-uuid
    // https://en.wikipedia.org/wiki/Universally_unique_identifier
    .addSubcommand((subcommand) =>
      subcommand.setName('uuid').setDescription('Generates a UUID')
          .addStringOption((option) =>
            option.setName('version')
                .setDescription('version of the UUID to generate')
                .setRequired(true)
                .addChoices(
                    {
                      name: 'Version 1 (date-time + MAC address)', value: 'v1',
                    },
                    {
                      // eslint-disable-next-line max-len
                      name: 'Version 2 (date-time + MAC address, DCE security version)',
                      value: 'v2',
                    },
                    {
                      name: 'Version 3 (namespace name-based w/ MD5 hashing)',
                      value: 'v3',
                    },
                    {
                      name: 'Version 4 (random)', value: 'v4',
                    },
                    {
                      name: 'Version 5 (namespace name-based w/ SHA-1 hashing)',
                      value: 'v5',
                    },
                ),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('password')
      // eslint-disable-next-line max-len
          .setDescription('Generates a password. NOTE: these passwords shouldn\'t be used for security-heavy accounts')
          .addIntegerOption((option) =>
            option.setName('length')
                .setDescription('Length of the password')
                .setMinValue(8)
                .setRequired(true),
          )
          .addStringOption((option) =>
            option.setName('strength')
                .setDescription('Strength of the password')
                .setRequired(true)
                .addChoices(
                    {name: 'Weak', value: 'weak'},
                    {name: 'Medium', value: 'medium'},
                    {name: 'Strong', value: 'strong'},
                ),
          )
          .addBooleanOption((option) =>
            option.setName('upper')
            // eslint-disable-next-line max-len
                .setDescription(`Adds 2 uppercase letters to password (${inlineCode(UPPER_CASE)})`),
          )
          .addBooleanOption((option) =>
            option.setName('digits')
            // eslint-disable-next-line max-len
                .setDescription(`Adds 2 digits to the password (${inlineCode(DIGITS)})`),
          )
          .addBooleanOption((option) =>
            option.setName('special')
            // eslint-disable-next-line max-len
                .setDescription(`Adds 2 special characters to the password (${inlineCode(SPECIAL)})`),
          ));

module.exports = GenerateCommand;
