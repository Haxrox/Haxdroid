const Command = require('./Command.js');
const {MessageEmbed} = require('discord.js');
const wait = require('util').promisify(setTimeout);

class CoinFlip extends Command {
    async Execute(interaction) {
        const choice = Math.round(Math.random());
        var result;
        try {
            const resultString = choice ? interaction.options.getString("heads", true) : interaction.options.getString("tails", true);
            result = `**${choice ? "HEADS" : "TAILS"}:** ${resultString}`;
        } catch(exception) {
            result = `**${choice ? "HEADS" : "TAILS"}!**`;
        } 
        await interaction.deferReply();
        await wait(1000);
        const embed = new MessageEmbed()
            .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle("Coinflip")
            .setDescription(result)
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