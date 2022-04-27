const Styles = require("../styles.json");
const Command = require('./Command.js');
const {MessageEmbed, Permissions} = require('discord.js');

class Embed extends Command {
    async Execute(interaction) {
        const channel = interaction.options.getChannel("channel") || interaction.channel
        const permissions = channel.permissionsFor(interaction.member)

        if (permissions.has(Permissions.FLAGS.SEND_MESSAGES) && (channel.isText() || (channel.isThread() && permissions.has(Permissions.FLAGS.SEND_MESSAGES_IN_THREADS)))) {
            const embed = new MessageEmbed()
            .setAuthor({
                name: interaction.options.getString("author-name") || "",
                iconURL: interaction.options.getString("author-iconURL") || "",
                url: interaction.options.getString("author-url") || ""
            })
            .setTitle(interaction.options.getString("title") || "")
            .setURL(interaction.options.getString("url") || "")
            .setDescription(interaction.options.getString("description", true))
            .setColor(interaction.options.getString("colour") || Styles.Colours.Theme)
            .setImage(interaction.options.getString("image") || "")
            .setThumbnail(interaction.options.getString("thumbnail") || "")
            .setFooter({
                text: interaction.options.getString("footer-name") || "",
                iconURL: interaction.options.getString("footer-iconURL") || ""
            })
        
            if (interaction.options.getBoolean("timestamp")) {
                embed.setTimestamp()
            }

            channel.send({embeds: [embed]}).then(async data => {
                console.log("Embed sent");
                const responseEmbed = new MessageEmbed()
                    .setTitle("Embed")
                    .setDescription(`Embed sent to: ${channel}`)
                    .setColor(Styles.Colours.Theme)
                    .setTimestamp()
                    .setFooter({
                        text: `Created by: ${interaction.user.username}`, 
                        iconURL: interaction.user.avatarURL()
                    });
                await interaction.reply({embeds: [responseEmbed]})
            }).catch(error => {
                this.Error(interaction, error);
            })
        } else {
            this.Error(interaction, `You do not have permissions to speak in ${channel}`)
        }
    }
}

const EmbedCommand = new Embed("embed", "Creates an embedded message");
EmbedCommand.GetData()
.addStringOption(option => 
    option.setName("description").setDescription("Sets the description field").setRequired(true)
)
.addChannelOption(option => 
    option.setName("channel").setDescription("Sets the channel to send the embed")
)
.addStringOption(option => 
    option.setName("author-name").setDescription("Sets the author name field")
)
.addStringOption(option => 
    option.setName("author-iconurl").setDescription("Sets the author iconURL field")
)
.addStringOption(option => 
    option.setName("author-url").setDescription("Sets the author url field")
)
.addStringOption(option => 
    option.setName("title").setDescription("Sets the title field")
)
.addStringOption(option => 
    option.setName("colour").setDescription("Sets the colour field")
)
.addStringOption(option => 
    option.setName("url").setDescription("Sets the url field")
)
.addStringOption(option => 
    option.setName("footer-name").setDescription("Sets the footer name field")
)
.addStringOption(option => 
    option.setName("footer-iconurl").setDescription("Sets the footer iconURL field")
)
.addStringOption(option => 
    option.setName("thumbnail").setDescription("Sets the thumbnail field")
)
.addStringOption(option => 
    option.setName("image").setDescription("Sets the image field")
)
.addBooleanOption(option => 
    option.setName("timestamp").setDescription("Whether to add the timestamp")
)

module.exports = EmbedCommand;