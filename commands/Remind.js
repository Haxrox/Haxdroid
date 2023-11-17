const Styles = require('../styles.json');
const Command = require('./Command.js');
const CONSTANTS = require('../Constants.js');
const {EmbedBuilder, Permissions, bold, blockQuote} = require('discord.js');
const GUILD_TEXT = 0;

const Reminders = {};

/**
 * Reminds people of an event
 */
class Remind extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    if (interaction.options.getSubcommand() == 'cancel') {
      const id = interaction.options.getInteger('id', true);
      const reminderInfo = Reminders[id];
      if (reminderInfo != null) {
        if (interaction.user === reminderInfo.Reminder ||
          interaction.user === reminderInfo.Target) {
          clearTimeout(id);
          delete Reminders[id];

          const embed = new EmbedBuilder()
              .setTitle(`${interaction.client.user.username} Reminder Deleted`)
              .addFields(
                  {
                    name: 'Task',
                    value: reminderInfo.Task,
                    inline: true,
                  },
                  {
                    name: 'Time',
                    value: reminderInfo.Date,
                    inline: true,
                  },
                  {
                    name: 'Reminder',
                    value: reminderInfo.Reminder,
                    inline: true,
                  },
              )
              .setColor(Styles.Colours.Reminder_Cancelled)
              .setTimestamp()
              .setFooter({
                text: `Reminder cancelled by: ${interaction.user.username}`,
                iconURL: interaction.user.avatarURL(),
              });
          interaction.reply({embeds: [embed]});
        } else {
          await this.error(
              interaction,
              'You are not related to this reminder. Cannot delete',
          );
        }
      } else {
        await this.error(interaction, 'Invalid reminder ID');
      }
    } else {
      const username = interaction.client.user.username;
      const currentTime = Date.now();
      const task = interaction.options.getString('task', true);
      const remindTime = interaction.options.getNumber('time', true);
      const unitTime = interaction.options.getInteger('unit', true);
      const unitString = unitTime == 60 ? 'minute' :
        (unitTime == 60 * 60 ? 'hour' : 'day');
      const remindDate = new Date(currentTime + (remindTime * 1000 * unitTime));
      const dateString = unitTime == 60 * 60 * 24 ?
        remindDate.toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour12: true,
        }) : remindDate.toLocaleTimeString('en-US', {
          timeZone: 'America/Los_Angeles',
          hour12: true,
        });
      // eslint-disable-next-line max-len
      const reminderDescription = `to do ${bold(task)} at ${bold(`${dateString} PST (${remindTime} ${unitString}(s))`)}`;
      let mention;
      let remindChannel;

      const replyEmbed = new EmbedBuilder()
          // eslint-disable-next-line max-len
          .setTitle(`${Styles.Emojis.Reminder}  ${interaction.client.user.username} Reminder Set!`)
          .setColor(Styles.Colours.Reminder_Set)
          .setTimestamp();

      if (interaction.options.getSubcommand() == 'user') {
        const channel = interaction.options.getChannel('channel');
        const user = interaction.options.getUser('target') || interaction.user;
        const author = user == interaction.user ?
          interaction.client.user : interaction.user;
        mention = user;

        if (channel == null) {
          const confirmationEmbed = new EmbedBuilder()
              .setAuthor({name: author.username, iconURL: author.avatarURL()})
              .setTitle(`${Styles.Emojis.Reminder}  ${username} Reminder`)
              .setDescription(`Reminder ${reminderDescription}`)
              .setColor(Styles.Colours.Reminder_Confirmation)
              .setTimestamp()
              .setFooter({
                text: `Reminder set by: ${username}`,
                iconURL: interaction.user.avatarURL(),
              });

          await user.send({embeds: [confirmationEmbed]}).then(() => {
            remindChannel = user.dmChannel;
            // eslint-disable-next-line max-len
            replyEmbed.setDescription(`${interaction.client.user} will DM ${user} ${reminderDescription}`);
          }).catch((error) => {
            remindChannel = interaction.channel;
            // eslint-disable-next-line max-len
            replyEmbed.setDescription(`${interaction.client.user} cannot DM ${user}. ${interaction.client.user} will ping ${user} ${reminderDescription} in ${interaction.channel}`);
          });
        } else {
          const permissions = channel.permissionsFor(interaction.member);
          if (permissions.has(Permissions.FLAGS.SEND_MESSAGES) &&
            (channel.isText() ||
              (channel.isThread() &&
              permissions.has(Permissions.FLAGS.SEND_MESSAGES_IN_THREADS))
            )) {
            remindChannel = channel;
            // eslint-disable-next-line max-len
            replyEmbed.setDescription(`${interaction.client.user} will remind ${user} ${reminderDescription} in ${channel}`);
          } else {
            return await this.error(
                interaction,
                `Cannot send messages in ${channel}`,
            );
          }
        }
      } else if (interaction.options.getSubcommand() == 'role') {
        const channel = interaction.options.getChannel('channel') ||
          interaction.channel;
        const role = interaction.options.getRole('target') ||
          interaction.guild.roles.everyone;
        mention = role;

        const permissions = channel.permissionsFor(interaction.member);
        if (permissions.has(Permissions.FLAGS.SEND_MESSAGES) &&
          (channel.isText() ||
            (channel.isThread() &&
              permissions.has(Permissions.FLAGS.SEND_MESSAGES_IN_THREADS)
            )
          )) {
          remindChannel = channel;
          // eslint-disable-next-line max-len
          replyEmbed.setDescription(`${interaction.client.user} will remind ${role} ${reminderDescription} in ${channel}`);
        } else {
          return await this.error(
              interaction,
              `Cannot send messages in ${channel}`,
          );
        }
      }

      if (remindChannel) {
        const reminderID = setTimeout(() => {
          const emoji = Styles.Emojis.Reminder;
          const remindEmbed = new EmbedBuilder()
              .setTitle(`${emoji}  ${username} Reminder`)
              .setDescription(blockQuote(task))
              .setColor(Styles.Colours.Reminder_Alarm)
              .setFooter({
                // eslint-disable-next-line max-len
                text: `Reminder set by: ${interaction.user.username} | ID: ${reminderID}`,
                iconURL: interaction.user.avatarURL(),
              });

          if (remindChannel.type == 'DM') {
            const author = mention === interaction.user ?
            interaction.client.user : interaction.user;
            remindEmbed.setAuthor({
              name: author.username,
              iconURL: author.avatarURL(),
            });
          }

          remindChannel.send({
            content: `${mention}`,
            embeds: [remindEmbed],
          });

          delete Reminders[reminderID];
        }, remindTime * 1000 * unitTime);

        Reminders[reminderID] = {
          Reminder: interaction.user,
          Task: task,
          Target: mention,
          Date: dateString,
        };
        replyEmbed.setFooter({
          // eslint-disable-next-line max-len
          text: `Reminder set by: ${interaction.user.username} | ID: ${reminderID}`,
          iconURL: interaction.user.avatarURL(),
        });
        await interaction.reply({embeds: [replyEmbed]});
      } else {
        await this.error(interaction, 'Failed to create reminder');
      }
    }
  }
}

const RemindCommand = new Remind('Remind', 'Remind a user/role');
RemindCommand.getData()
    .addSubcommand((subcommand) =>
      subcommand.setName('user')
          .setDescription('Remind a user')
          .addStringOption((option) =>
            option.setName('task')
                .setDescription('What to remind the user')
                .setRequired(true),
          )
          .addNumberOption((option) =>
            option.setName('time')
                .setDescription('When to remind the user')
                .setRequired(true),
          )
          .addIntegerOption((option) =>
            option.setName('unit')
                .setDescription('Unit of time')
                .setRequired(true)
                .addChoices(
                    {name: 'Minutes', value: CONSTANTS.SECONDS_TO_MINUTES},
                    {name: 'Hours', value: CONSTANTS.SECONDS_TO_HOURS},
                    {name: 'Days', value: CONSTANTS.SECONDS_TO_DAYS},
                ),
          )
          .addUserOption((option) =>
            option.setName('target')
                .setDescription('The user'),
          )
          .addChannelOption((option) =>
            option.setName('channel')
                .setDescription('Where to remind everyone')
                .addChannelTypes(GUILD_TEXT),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('role')
          .setDescription('Remind all users with the role')
          .addStringOption((option) =>
            option.setName('task')
                .setDescription('What to remind the role')
                .setRequired(true),
          )
          .addNumberOption((option) =>
            option.setName('time')
                .setDescription('When to remind the role (minutes)')
                .setRequired(true),
          )
          .addIntegerOption((option) =>
            option.setName('unit')
                .setDescription('Unit of time')
                .setRequired(true)
                .addChoices(
                    {name: 'Minutes', value: CONSTANTS.SECONDS_TO_MINUTES},
                    {name: 'Hours', value: CONSTANTS.SECONDS_TO_HOURS},
                    {name: 'Days', value: CONSTANTS.SECONDS_TO_DAYS},
                ),
          )
          .addRoleOption((option) =>
            option.setName('target')
                .setDescription('The role'),
          )
          .addChannelOption((option) =>
            option.setName('channel')
                .setDescription('Where to remind everyone'),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('cancel')
          .setDescription('Cancel a reminder')
          .addIntegerOption((option) =>
            option.setName('id')
                .setDescription('ID given when setting the reminder')
                .setRequired(true),
          ),
    );

module.exports = RemindCommand;
