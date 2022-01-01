const Command = require('./Command.js');
const {MessageEmbed} = require('discord.js');

class RandomNumberGenerator extends Command {
    async Execute(interaction) {
        var max = interaction.options.getInteger("max");
        var min = interaction.options.getInteger("min");

        max = max != null ? max : 10;
        min = min != null ? min : 0;

        const num = Math.round((Math.random() * (max - min)) + min);

        const embed = new MessageEmbed()
            // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
            .setTitle(`RNG [${min}-${max}]`)
            .setDescription(num.toString())
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter(`Requested by: ${interaction.user.username}`, interaction.user.avatarURL());
            // .setFooter({name: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL()});
        await interaction.reply({embeds: [embed]});
    }
}

const RNG = new RandomNumberGenerator("rng", "Generates a random number");
RNG.GetData()
.addIntegerOption(option => 
    option.setName("min").setDescription("Enter lower-bound")
)
.addIntegerOption(option => 
    option.setName("max").setDescription("Enter upper-bound (exclusive)")
)
module.exports = RNG;