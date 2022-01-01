const Command = require('./Command.js');
const {MessageEmbed, CommandInteraction, CommandInteractionOptionResolver} = require('discord.js');
const wait = require('util').promisify(setTimeout);

/**
 * Gets the specified options based on an interaction
 * @param {String} optionType the optionType (heads or tails)
 * @param {CommandInteractionOptionResolver} options where the option data is stored
 * @returns the given option, or the optionType with the first letter capitalized
 */
function getOption(optionType, options) {
    var result;
    try {
        result = options.getString(optionType, true);
    } catch (exception) {
        result = optionType.charAt(0).toUpperCase().concat(optionType.slice(1));
    }
    return result;
}

class CoinFlip extends Command {
    async Execute(interaction) {
        const choice = Math.round(Math.random());
        const headOption = getOption("heads", interaction.options);
        const tailOption = getOption("tails", interaction.options)
        const question = `${headOption} or ${tailOption}`;
        const result = choice ? headOption : tailOption;
        await interaction.deferReply();
        await wait(1000);
        const embed = new MessageEmbed()
            .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle(question)
            .setDescription(`${result}!`)
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter(`Flipped by: ${interaction.user.username}`, interaction.user.avatarURL());
            // .setFooter({name: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.editReply({embeds: [embed]});
    }
}

const CoinFlipCommand = new CoinFlip("coinflip", "Flips a coin");
const Data = CoinFlipCommand.GetData()
Data.addStringOption(option => 
    option.setName("heads").setDescription("Enter the heads option")
)
.addStringOption(option => 
    option.setName("tails").setDescription("Enter the tails option")
)
module.exports = CoinFlipCommand;