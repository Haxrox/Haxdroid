const Command = require('./Command.js');
const {MessageEmbed} = require('discord.js');
const {blockQuote} = require('@discordjs/builders');
const RNG = require('./RNG.js');

class Generate extends Command {
    Subcommands = {
        array: function(interaction) {
            const length = interaction.options.getInteger("length", true);
            const ordering = interaction.options.getString("order") || "unordered"
            const data = [];
            for (var index = 0; index < length; index++) {
                // generate random # and insert into data based off of ordering
            }
            return data.join("")
        },
        reverse: function(interaction) {
            const input = interaction.options.getString("input", true);
            return [...input].reverse().join("")
        },
        uuid: function(interaction) {
    
        },
        ["random number"]: function(interaction) {
            
        }
    }
    async Execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand != "Execute" && this.Subcommands[subcommand]) {
            const data = await this.Subcommands[subcommand](interaction);
            const embed = new MessageEmbed()
            .setTitle(`Generated ${subcommand}`)
            .setDescription(blockQuote(data || "none"))
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter({text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
			
            interaction.reply({embeds: [embed]})
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
        option.setName("length").setDescription("length of array").setRequired(true)
    )
    .addIntegerOption(option => 
        option.setName("min").setDescription("Enter lower-bound")
    )
    .addIntegerOption(option => 
        option.setName("max").setDescription("Enter upper-bound (exclusive)")
    )
    .addStringOption(option => 
        option.setName("order").setDescription("whether the array is in ascending, descending, or unsorted order")
        .addChoice("Unordered", "unordered")
        .addChoice("Ascending", "ascending")
        .addChoice("Descending", "descending")
    )
)
.addSubcommand(subcommand => 
    subcommand.setName("reverse").setDescription("Reverses the given input")
    .addStringOption(option => 
        option.setName("input").setDescription("string to reverse").setRequired(true)
    )
)
.addSubcommand(subcommand => 
    subcommand.setName("random number").setDescription("Generates random number (alias of RNG command)")
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
    .addStringOption(option => 
        option.setName("strength").setDescription("strength of the password").setRequired(true)
        .addChoice("Weak", "weak")
        .addChoice("Medium", "medium")
        .addChoice("Strong", "strong")
    )
)

module.exports = GenerateCommand;