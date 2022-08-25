const Styles = require("../styles.json");
const Command = require('./Command.js');
const { Permissions, MessageEmbed, MessageMentions: { USERS_PATTERN, ROLES_PATTERN } } = require('discord.js');

const GUILD_TEXT = "GUILD_TEXT";
const GUILD_VOICE = "GUILD_VOICE";
const GUILD_CATEGORY = "GUILD_CATEGORY";

class Create extends Command {
    async CreateCategory(channelManager, name, channelOptions) {
        return await channelManager.create(name, channelOptions);
    }

    async CreateChannel(name, channelOptions, category) {
        return await category.createChannel(name, channelOptions);
    }

    async Execute(interaction) {
        await interaction.deferReply();
        if (interaction.options.getSubcommand() == "channel") {
            if (interaction.member.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS), true) {
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
                                allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                            })
                        }
                    });

                    denyData?.split(" ").forEach(permission => {
                        const matches = permission.matchAll(USERS_PATTERN).next().value || permission.matchAll(ROLES_PATTERN).next().value;

                        if (matches) {
                            permissions.push({
                                id: matches[1],
                                deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                            })
                        } else if (permission.includes("everyone")) {
                            interaction.guild.roles.cache.every(role => {
                                permissions.push({
                                    id: role.id,
                                    deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
                                })
                            })
                        }
                    })

                    const channelOptions = {
                        type: channelType,
                        permissionOverwrites: permissions,
                        reason: `created by ${interaction.client.user.username} ${reason}`,
                    };

                    if (channelType == GUILD_CATEGORY) {
                        var channel = await this.CreateCategory(interaction.guild.channels, interaction.options.getString("name", true), channelOptions);
                    } else {
                        var channel = await this.CreateChannel(interaction.options.getString("name", true), channelOptions, await interaction.guild.channels.fetch(categoryId));
                    }

                    const embed = new MessageEmbed()
                        .setTitle(`Channel created`)
                        .setDescription(channelType === GUILD_CATEGORY ? `<${channel}>` : channel.toString())
                        .setColor(Styles.Colours.Theme)
                        .setTimestamp()
                        .setFooter({ text: `Created by: ${interaction.user.username}`, iconURL: interaction.user.avatarURL() });
                    interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    this.DeferError(interaction, error.message);
                }
            } else {
                this.DeferError(interaction, "Not enough permissions");
            }
        }
    }
}

const CreateCommand = new Create("Create", "Creates stuff in the discord server");
CreateCommand.defaultPermission = true;
CreateCommand.GetData()
    .addSubcommand(subcommand =>
        subcommand.setName("channel").setDescription("creates a channel in the discord server")
            .addStringOption(option =>
                option.setName("name").setDescription("sets the channel name").setRequired(true)
            )
            .addStringOption(option =>
                option.setName("type").setDescription("type of the channel").setRequired(true)
                    .addChoice("text", GUILD_TEXT)
                    .addChoice("voice", GUILD_VOICE)
                    .addChoice("category", GUILD_CATEGORY)
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