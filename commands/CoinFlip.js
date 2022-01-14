const Command = require('./Command.js');
const {MessageEmbed, CommandInteraction, CommandInteractionOptionResolver} = require('discord.js');
const wait = require('util').promisify(setTimeout);

class CoinFlip extends Command {
    async Execute(interaction) {
        const choice = Math.round(Math.random());
        const headOption = interaction.options.getString("heads") || "Heads";
        const tailOption =  interaction.options.getString("tails") || "Tails";
        const question = `${headOption} or ${tailOption}`;
        const result = choice ? headOption : tailOption;
        await interaction.deferReply();
        await wait(1000);
        const embed = new MessageEmbed()
            // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle(`:coin: ${question}`)
            .setDescription(`${result}!`)
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter({text: `Flipped by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.editReply({embeds: [embed]});
    }
}

const CoinFlipCommand = new CoinFlip("CoinFlip", "Flips a coin");
const Data = CoinFlipCommand.GetData()
Data.addStringOption(option => 
    option.setName("heads").setDescription("Enter the heads option")
)
.addStringOption(option => 
    option.setName("tails").setDescription("Enter the tails option")
)
module.exports = CoinFlipCommand;