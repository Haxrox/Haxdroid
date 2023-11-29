const {EmbedBuilder} = require('discord.js');
const Styles = require('../configs/styles.json');
const CommandsService = require('../services/CommandsService.js');

/**
 * Core Command class
 */
class Command {
  /**
   * Base constructor for command
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    console.debug('[Command] %s created - %s', name, description);
    this.commandName = name;
    this.description = description;
  }

  /**
   * Sets the permissions necessary to execute the command
   * @param {Array} permissions permissions array
   */
  setPermissions(permissions) {
    this.permissions = permissions;
  }

  /**
   * Returns whether the GuildMember has permissions to execute this command
   * @param {GuildMember} member member to check
   * @return {boolean} whether `member` can execute this command
   */
  validate(member) {
    return true;
  }

  /**
   * Creates an embed with the given data
   * @param {BaseInteraction} interaction interaction associated with embed
   * @param {EmbedBuilder} embedBuilder embedBuilder for the embed
   * @return {EmbedBuilder} embed builder with embedBuilder data merged
   */
  createEmbed(interaction, embedBuilder) {
    const embedData = embedBuilder.data;

    return CommandsService.createBaseEmbed(embedBuilder)
        .setAuthor(embedData.author ? {
          name: embedData.author.name, // interaction.client.user.username,
          // eslint-disable-next-line max-len
          iconURL: embedData.author.icon_url, // interaction.client.user.avatarURL(),
          url: embedData.author.url,
          proxy_icon_url: embedData.author.proxy_icon_url,
        } : null)
        .setFooter({
          text: embedData.footer?.text ||
            `Requested by: ${interaction.user.username}`,
          iconURL: embedData.footer?.iconURL ||
            interaction.user.avatarURL(),
        });
  }

  /**
   * Executes command
   * @param {BaseInteraction} interaction interaction associated with command
   */
  execute(interaction) {
    console.debug(`${this.commandName} executed: ${interaction}`);
  }

  /**
   * Called when the command errors
   * @param {BaseInteraction} interaction interaction executed
   * @param {String} message error message
   */
  async error(interaction, message) {
    console.log('%s error: %s', this.commandName, message);
    const embed = this.createEmbed(interaction,
        new EmbedBuilder()
            .setTitle(`${this.commandName} Error`)
            .setDescription(`${Styles.Emojis.Error}  ${message}`)
            .setColor(Styles.Colours.Error),
    );
    await interaction.reply({embeds: [embed]});
  }

  /**
   * Called when the command errors and the reply needs to be deferred
   * @param {BaseInteraction} interaction interaction executed
   * @param {String} message error message
   */
  async deferError(interaction, message) {
    console.log('%s error: %s', this.commandName, message);
    const embed = this.createEmbed(interaction,
        new EmbedBuilder()
            .setTitle(`${this.commandName} Error`)
            .setDescription(`${Styles.Emojis.Error}  ${message}`)
            .setColor(Styles.Colours.Error),
    );
    await interaction.editReply({embeds: [embed]});
  }
};

module.exports = Command;
