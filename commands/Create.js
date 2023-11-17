const Styles = require('../styles.json');
const Command = require('./Command.js');
const {
  ChannelType,
  PermissionsBitField,
  EmbedBuilder,
  MessageMentions: {USERS_PATTERN, ROLES_PATTERN},
} = require('discord.js');

/**
 * Create channels in Discord
 */
class Create extends Command {
  /**
   * Creates a channel
   * @param {ChannelManager} channelManager manager to create the channel
   * @param {string} name channel name
   * @param {Object} channelOptions channel options
   * @return {Promise<GuildChannel>} created channel
   */
  async createChannel(channelManager, name, channelOptions) {
    return await channelManager.create(name, channelOptions);
  }

  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    await interaction.deferReply();
    if (interaction.options.getSubcommand() == 'channel') {
      // eslint-disable-next-line max-len
      if (interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        try {
          let reason = interaction.options.getString('reason');
          const channelType = interaction.options.getString('type', true);
          const allowedData = interaction.options.getString('allow');
          const denyData = interaction.options.getString('deny');

          reason = reason ? `for ${reason}` : '';

          const permissions = [];

          allowedData?.split(' ').forEach((permission) => {
            const matches = (permission.matchAll(USERS_PATTERN) ||
              permission.matchAll(ROLES_PATTERN)).next().value;

            if (matches) {
              permissions.push({
                id: matches[1],
                allow: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                ],
              });
            }
          });

          denyData?.split(' ').forEach((permission) => {
            const matches = (permission.matchAll(USERS_PATTERN) ||
             permission.matchAll(ROLES_PATTERN)).next().value;

            if (matches) {
              permissions.push({
                id: matches[1],
                deny: [
                  PermissionsBitField.Flags.ViewChannel,
                  PermissionsBitField.Flags.SendMessages,
                ],
              });
            } else if (permission.includes('everyone')) {
              interaction.guild.roles.cache.every((role) => {
                permissions.push({
                  id: role.id,
                  allow: [
                    PermissionsBitField.Flags.ViewChannel,
                    PermissionsBitField.Flags.SendMessages,
                  ],
                });
              });
            }
          });

          const channelOptions = {
            type: channelType,
            permissionOverwrites: permissions,
            reason: `created by ${interaction.client.user.username} ${reason}`,
          };

          const channel = await this.createChannel(
              interaction.guild.channels,
              interaction.options.getString('name', true),
              channelOptions,
          );

          const embed = new EmbedBuilder()
              .setTitle(`Channel created`)
              .setDescription(channelMention(channel.id))
              .setColor(Styles.Colours.Theme)
              .setTimestamp()
              .setFooter({
                text: `Created by: ${interaction.user.username}`,
                iconURL: interaction.user.avatarURL(),
              });
          interaction.editReply({embeds: [embed]});
        } catch (error) {
          this.deferError(interaction, error.message);
        }
      } else {
        this.deferError(interaction, 'Not enough permissions');
      }
    }
  }
}

const CreateCommand = new Create(
    'Create',
    'Creates stuff in the discord server',
);
CreateCommand.defaultPermission = true;
CreateCommand.getData()
    .addSubcommand((subcommand) =>
      subcommand.setName('channel')
          .setDescription('creates a channel in the discord server')
          .addStringOption((option) =>
            option.setName('name')
                .setDescription('sets the channel name')
                .setRequired(true),
          )
          .addStringOption((option) =>
            option.setName('type')
                .setDescription('type of the channel')
                .setRequired(true)
                .addChoices(
                    {name: 'text', value: `${ChannelType.GuildText}`},
                    {name: 'voice', value: `${ChannelType.GuildVoice}`},
                    {name: 'category', value: `${ChannelType.GuildCategory}`},
                ),
          )
          .addStringOption((option) =>
            option.setName('category')
                .setDescription('category for the channel'),
          )
          .addStringOption((option) =>
            option.setName('allow')
                .setDescription('user/roles that can see this channel'),
          )
          .addStringOption((option) =>
            option.setName('deny')
                .setDescription('user/roles that cannot see this channel'),
          )
          .addStringOption((option) =>
            option.setName('reason')
                .setDescription('reason for creating the channel'),
          ),
    );

module.exports = CreateCommand;
