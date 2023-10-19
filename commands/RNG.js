const Styles = require("../styles.json");
const Command = require('./Command.js');
const Random = require('../services/Random.js');
const { EmbedBuilder } = require('discord.js');

class RandomNumberGenerator extends Command {
    async Execute(interaction) {
        var max = interaction.options.getInteger("max");
        var min = interaction.options.getInteger("min");

        if (min <= max) {
            const num = Math.round(Random.Generate(min, max));
            const embed = new EmbedBuilder()
                // .setAuthor({name: interaction.client.user.username, iconURL: interaction.client.user.avatarURL()})
                .setTitle(`RNG [${min}-${max}]`)
                .setDescription(num.toString())
                .setColor(Styles.Colours.Theme)
                .setTimestamp()
                .setFooter({ text: `Requested by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
            await interaction.reply({ embeds: [embed] });
        } else {
            await super.Error(interaction, "`max` must be greater than `min`");
        }
    }
}

const RNG = new RandomNumberGenerator("RNG", "Generates a random number");
RNG.GetData()
    .addIntegerOption(option =>
        option.setName("min").setDescription("Enter lower-bound")
    )
    .addIntegerOption(option =>
        option.setName("max").setDescription("Enter upper-bound (exclusive)")
    )
module.exports = RNG;