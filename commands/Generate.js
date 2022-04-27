const Styles = require("../styles.json");
const Command = require('./Command.js');
const {MessageEmbed} = require('discord.js');
const {blockQuote, inlineCode, spoiler} = require('@discordjs/builders');
const RNG = require('./RNG.js');
const Random = require("../services/Random");

const LOWER_CASE = "abcdefghijklmnopqrstuvwxyz"
const UPPER_CASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const DIGITS = "0123456789"
const SPECIAL = "!\"#$%&'*+,./:;=?@\\^`|~_-[]{}()<>"
const ALPHABET = LOWER_CASE + UPPER_CASE;
const ALL = ALPHABET + DIGITS + SPECIAL;

class Generate extends Command {
    Subcommands = {
        array: function(interaction) {
            const length = interaction.options.getInteger("length") || 10;
            const ordering = interaction.options.getString("order") || "unordered"
            const type = interaction.options.getString("type") || "int"
            var min = interaction.options.getInteger("min");
            var max = interaction.options.getInteger("max");
            var data = [];
            for (var index = 0; index < length; index++) {
                var value = Random.Generate(min, max);
                switch (type) {
                    case "int":
                        value = Math.round(value);
                        break;
                    case "float":
                        value = Math.fround(value);
                        break;
                    case "double":
                        break;
                }
                data.push(value);
            }
            // Sort on insert rather than sorting entire array for better optimization
            data = ordering == "unordered" ? data : data.sort((a, b) => ordering == "ascending" ? a - b : b - a)
            return inlineCode(data.join(", "));
        },
        reverse: function(interaction) {
            const input = interaction.options.getString("input", true);
            return [...input].reverse().join("")
        },
        uuid: function(interaction) {
    
        },
        password: function(interaction) {
            const length = interaction.options.getInteger("length", true);
            const strength = interaction.options.getString("strength", true);
            var upperCase = interaction.options.getBoolean("upper");
            var digits = interaction.options.getBoolean("digits");
            var special = interaction.options.getBoolean("special");
            var password = [];
            for (var index = 0; index < length; index++) {
                if (upperCase) {
                    password.push(UPPER_CASE.charAt(Random.GenerateSecure(0, UPPER_CASE.length)));
                    password.push(UPPER_CASE.charAt(Random.GenerateSecure(0, UPPER_CASE.length)));
                    upperCase = false;
                    index++;
                } else if (digits) {
                    password.push(DIGITS.charAt(Random.GenerateSecure(0, DIGITS.length)));
                    password.push(DIGITS.charAt(Random.GenerateSecure(0, DIGITS.length)));
                    digits = false;
                    index++;
                } else if (special) {
                    password.push(SPECIAL.charAt(Random.GenerateSecure(0, SPECIAL.length)));
                    password.push(SPECIAL.charAt(Random.GenerateSecure(0, SPECIAL.length)));
                    special = false;
                    index++;
                } else {
                    let value;
                    switch (strength) {
                        case "weak":
                            password.push(ALL.charAt(Random.GenerateSecure(0, ALL.length)));
                            break;
                        case "medium":
                            var next = Random.GenerateSecure(0, 3);
                            switch (next) {
                                case 0:
                                    value = ALPHABET.charAt(Random.GenerateSecure(0, ALPHABET.length));
                                    break;
                                case 1:
                                    value = DIGITS.charAt(Random.GenerateSecure(0, DIGITS.length));
                                    break;
                                case 2:
                                    value = SPECIAL.charAt(Random.GenerateSecure(0, SPECIAL.length));
                                    break;
                            }
                            break;
                        case "strong":
                            var next = Random.GenerateSecure(0, 4);
                            switch (next) {
                                case 0:
                                    value = LOWER_CASE.charAt(Random.GenerateSecure(0, LOWER_CASE.length));
                                    break;
                                case 1:
                                    value = UPPER_CASE.charAt(Random.GenerateSecure(0, UPPER_CASE.length));
                                    break;
                                case 2:
                                    value = DIGITS.charAt(Random.GenerateSecure(0, DIGITS.length));
                                    break;
                                case 3:
                                    value = SPECIAL.charAt(Random.GenerateSecure(0, SPECIAL.length));
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
            for (var index = length - 1; index > 0; index--) {
                // Pick random index to swap with
                var swap = Math.round(Random.GenerateSecure(0, index + 1));
                // Swap elements
                var temp = password[index];
                password[index] = password[swap];
                password[swap] = temp;
            }
            return spoiler(password.join(""));
        },
        random_number: function(interaction) {
            return Random.Generate(interaction.options.getInteger("min"), interaction.options.getInteger("max"));
        }
    }
    async Execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand != "Execute" && this.Subcommands[subcommand]) {
            const data = await this.Subcommands[subcommand](interaction);
            const embed = new MessageEmbed()
            .setTitle(`Generated ${subcommand} data`)
            .setDescription(blockQuote(data || "none"))
            .setColor(Styles.Colours.Theme)
            .setTimestamp()
            .setFooter({text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
            interaction.reply({embeds: [embed], ephemeral: subcommand == "password"});
        } else {
            this.Error(interaction, "Invalid subcommand - " + subcommand);
        }
    }
}

const GenerateCommand = new Generate("Generate", "Generate uesful properties");
GenerateCommand.GetData()
.addSubcommand(subcommand => 
    subcommand.setName("array").setDescription("Generates random array of X integers")
    .addIntegerOption(option => 
        option.setName("length").setDescription("length of array")
    )
    .addStringOption(option => 
        option.setName("type").setDescription("type of the data")
        .addChoice("Integer", "int")
        .addChoice("Float", "float")
        .addChoice("Double", "double")
    )
    .addStringOption(option => 
        option.setName("order").setDescription("whether the array is in ascending, descending, or unsorted order")
        .addChoice("Unordered", "unordered")
        .addChoice("Ascending", "ascending")
        .addChoice("Descending", "descending")
    )
    .addIntegerOption(option => 
        option.setName("min").setDescription("Enter lower-bound")
    )
    .addIntegerOption(option => 
        option.setName("max").setDescription("Enter upper-bound (exclusive)")
    )
)
.addSubcommand(subcommand => 
    subcommand.setName("reverse").setDescription("Reverses the given input")
    .addStringOption(option => 
        option.setName("input").setDescription("string to reverse").setRequired(true)
    )
)
.addSubcommand(subcommand => 
    subcommand.setName("random_number").setDescription("Generates random number (alias of RNG command)")
    .addIntegerOption(option => 
        option.setName("min").setDescription("Enter lower-bound")
    )
    .addIntegerOption(option => 
        option.setName("max").setDescription("Enter upper-bound (exclusive)")
    )
)
// https://www.baeldung.com/java-uuid
// https://en.wikipedia.org/wiki/Universally_unique_identifier
.addSubcommand(subcommand =>
    subcommand.setName('uuid').setDescription('Generates an X bit UUID')
    .addIntegerOption(option => 
        option.setName("version").setDescription("version of the UUID to generate").setRequired(true)
        .addChoice("Version 1 (date-time + MAC address)", 1)
        .addChoice("Version 2 (date-time + MAC address, DCE security version", 2)
        .addChoice("Version 3 (namespace name-based w/ MD5 hashing)", 3)
        .addChoice("Version 4 (random)", 4)
        .addChoice("Version 5 (namespace name-based w/ SHA-1 hashing)", 5)
    )
)
.addSubcommand(subcommand =>
    subcommand.setName('password').setDescription('Generates a password. NOTE: these passwords should not be used for personal or private accounts')
    .addIntegerOption(option => 
        option.setName("length").setDescription("Length of the password").setMinValue(8).setRequired(true)
    )
    .addStringOption(option => 
        option.setName("strength").setDescription("Strength of the password").setRequired(true)
        .addChoice("Weak", "weak")
        .addChoice("Medium", "medium")
        .addChoice("Strong", "strong")
    )
    .addBooleanOption(option => 
        option.setName("upper").setDescription(`Adds 2 uppercase letters to password (${inlineCode(UPPER_CASE)})`)
    )
    .addBooleanOption(option => 
        option.setName("digits").setDescription(`Adds 2 digits to the password (${inlineCode(DIGITS)})`)
    )
    .addBooleanOption(option => 
        option.setName("special").setDescription(`Adds 2 special characters to the password (${inlineCode(SPECIAL)})`)
)   )

module.exports = GenerateCommand;