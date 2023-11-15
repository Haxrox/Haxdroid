const Styles = require("../styles.json");
const Command = require('./Command.js');
const { ChannelType, PermissionsBitField, EmbedBuilder, MessageMentions: { USERS_PATTERN, ROLES_PATTERN } } = require('discord.js');

class Create extends Command {
    async CreateChannel(channelManager, name, channelOptions) {
        return await channelManager.create(name, channelOptions);
    }

    async execute(interaction) {
        await interaction.deferReply();
        if (interaction.options.getSubcommand() == "channel") {
            if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels), true) {
                try {
                    var reason = interaction.options.getString("reason");
                    var categoryId = interaction.options.getString("category") || interaction.guild.systemChannel.parentId;
                    const channelType = interaction.options.getString("type", true);
                    const allowedData = interaction.options.getString("allow");
                    const denyData = interaction.options.getString("deny");

                    reason = reason ? `for ${reason}` : "";

                    const permissions = [];

                    allowedData?.split(" ").forEach(permission => {
                        const matches = permission.matchAll(USERS_PATTERN).next().value || permission.matchAll(ROLES_PATTERN).next().value;

                        if (matches) {
                            permissions.push({
                                id: matches[1],
                                allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                            })
                        }
                    });

                    denyData?.split(" ").forEach(permission => {
                        const matches = permission.matchAll(USERS_PATTERN).next().value || permission.matchAll(ROLES_PATTERN).next().value;

                        if (matches) {
                            permissions.push({
                                id: matches[1],
                                deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                            })
                        } else if (permission.includes("everyone")) {
                            interaction.guild.roles.cache.every(role => {
                                permissions.push({
                                    id: role.id,
                                    allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
                                })
                            })
                        }
                    })

                    const channelOptions = {
                        type: channelType,
                        permissionOverwrites: permissions,
                        reason: `created by ${interaction.client.user.username} ${reason}`,
                    };

                    var channel = await this.CreateChannel(interaction.guild.channels, interaction.options.getString("name", true), channelOptions);

                    const embed = new EmbedBuilder()
                        .setTitle(`Channel created`)
                        .setDescription(channelMention(channel.id))
                        .setColor(Styles.Colours.Theme)
                        .setTimestamp()
                        .setFooter({ text: `Created by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
                    interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    this.deferError(interaction, error.message);
                }
            } else {
                this.deferError(interaction, "Not enough permissions");
            }
        }
    }
}

const CreateCommand = new Create("Create", "Creates stuff in the discord server");
CreateCommand.defaultPermission = true;
CreateCommand.getData()
    .addSubcommand(subcommand =>
        subcommand.setName("channel").setDescription("creates a channel in the discord server")
            .addStringOption(option =>
                option.setName("name").setDescription("sets the channel name").setRequired(true)
            )
            .addStringOption(option =>
                option.setName("type").setDescription("type of the channel").setRequired(true)
                    .addChoices(
                        { name: "text", value: `${ChannelType.GuildText}` },
                        { name: "voice", value: `${ChannelType.GuildVoice}` },
                        { name: "category", value: `${ChannelType.GuildCategory}` }
                    )
            )
            .addStringOption(option =>
                option.setName("category").setDescription("category for the channel")
            )
            .addStringOption(option =>
                option.setName("allow").setDescription("user/roles that can see this channel")
            )
            .addStringOption(option =>
                option.setName("deny").setDescription("user/roles that cannot see this channel")
            )
            .addStringOption(option =>
                option.setName("reason").setDescription("reason for creating the channel")
            )
    );

module.exports = CreateCommand;