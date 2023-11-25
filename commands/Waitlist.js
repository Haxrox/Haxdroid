const {
  EmbedBuilder,
  bold,
  inlineCode,
  hyperlink,
} = require('discord.js');
const Axios = require('axios');
const Cheerio = require('cheerio');

const Command = require('./Command.js');
const Styles = require('../styles.json');

const cache = {};
const INTERVAL = 60000; // 1 minute
const ALERT_INTERVAL = 1000;
const ALERT_COUNT = 10;

/**
 * Returns number of seats for a course
 * @param {string} url url for the course
 * @return {Promise} to the title, description and seat count
 */
function getSeatInfo(url) {
  return Axios.get(url).then((response) => {
    const htmlParser = Cheerio.load(response.data);
    const title = htmlParser('.content.expand > h4').text();

    let seatsRemaining = 0;
    let description = '';

    htmlParser('.\'table > tbody > tr > td').each((index, element) => {
      if (index % 2 === 0) {
        seatsRemaining = htmlParser(element).text()
            .includes('Total Seats Remaining:') ?
          htmlParser(element).next().text() : seatsRemaining;
        description += bold(htmlParser(element).text()).concat(' ')
            .concat(htmlParser(element).next().text())
            .concat('\n');
      }
    });

    return [title, description, seatsRemaining];
  });
}

/**
 * Initialize the alert
 * @param {GuildMember} user user to alert
 * @param {string} title title of the course
 * @param {string} url url to the course
 * @param {boolean} toggle whether the alert is active
 * @return {integer} id to the alert
 */
function initAlert(user, title, url, toggle = false) {
  const id = setInterval(() => {
    getSeatInfo(url).then(([title, description, seatsRemaining]) => {
      const embed = new EmbedBuilder()
          .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
          .setTitle(`${title} Waitlist Alert`)
          .setURL(url)
          .setColor(Styles.Colours.UBC)
          .setTimestamp()
          .setDescription(description)
          .setFooter({text: `ID: ${id}`, iconURL: Styles.Icons.UBC});
      if (seatsRemaining > 0) {
        let count = ALERT_COUNT;
        const alertID = setInterval(() => {
          if (count < 0 || cache[id] === undefined) {
            clearInterval(alertID);
          }
          user.send({
            content: seatsRemaining > 0 ? user.toString() : null,
            embeds: [embed],
          });
          count--;
        }, ALERT_INTERVAL);
      }

      if (cache[id].toggle) {
        user.send({
          content: seatsRemaining > 0 ? user.toString() : null,
          embeds: [embed],
        });
      }

      cache[id].timestamp = new Date();
    }).catch((error) => {
      if (cache[id].toggle) {
        const embed = new EmbedBuilder()
            .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
            .setTitle(`${cache[id].title} Alert Failed`)
            .setColor(Styles.Colours.Red)
            .setTimestamp()
            .setDescription('Failed to retrieve seat information: '
                .concat(error.message),
            )
            .setFooter({text: `ID: ${id}`, iconURL: Styles.Icons.UBC});

        user.send({embeds: [embed]});
      }
    });
  }, INTERVAL);

  cache[id] = {
    url: url,
    title: title,
    user: user,
    toggle: toggle,
    timestamp: Date.now(),
  };
  return id;
}

/**
 * Set an alert for when a seat opens up for a course
 */
class Waitlist extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    await interaction.deferReply();
    if (subcommand === 'register') {
      const url = interaction.options.getString('url', true);
      getSeatInfo(url).then(([title, description, seatsRemaining]) => {
        const embed = new EmbedBuilder()
            .setAuthor({
              name: 'UBC',
              url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome',
              iconURL: Styles.Icons.UBC,
            })
            .setTitle(`${title} Waitlist Alert Registered`)
            .setURL(url)
            .setColor(Styles.Colours.UBC)
            .setTimestamp();

        embed.setDescription(description);

        const alertID = initAlert(
            interaction.user,
            title,
            url,
            interaction.options.getBoolean('toggle'),
        );
        embed.setFooter({
          text: `Requested by: ${interaction.user.username} | ID: ${alertID}`,
          iconURL: interaction.user.avatarURL(),
        });

        interaction.editReply({embeds: [embed]});
      }).catch((error) => {
        this.deferError(interaction, error);
      });
    } else if (subcommand === 'list') {
      const embed = new EmbedBuilder()
          .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
          .setTitle('Waitlist Alerts')
          .setColor(Styles.Colours.UBC)
          .setTimestamp()
          .setFooter({
            text: `Requested by: ${interaction.user.username}`,
            iconURL: interaction.user.avatarURL(),
          });

      let description = '';
      for (const id in cache) {
        if (cache[id].user.id === interaction.user.id) {
          const emoji = cache[id].toggle ?
            Styles.Emojis.Green_Circle : Styles.Emojis.Red_Circle;
          const formattedId = inlineCode(id);
          const formattedCourse = bold(
              hyperlink(cache[id].title, cache[id].url),
          );
          // eslint-disable-next-line max-len
          const lastCheck = Math.round((Date.now() - cache[id].timestamp) / 10) / 100;
          // eslint-disable-next-line max-len
          description += `${emoji} ${formattedId} - ${formattedCourse} - ${lastCheck}s\n`;
        }
      }

      if (description === '') {
        description = 'No alerts registered';
      }

      embed.setDescription(description);
      interaction.editReply({embeds: [embed]});
    } else if (subcommand === 'unregister') {
      const id = interaction.options.getString('id', true);
      if (cache[id] && cache[id].user.id === interaction.user.id) {
        clearInterval(id);
        delete cache[id];
        const embed = new EmbedBuilder()
            .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
            .setTitle('Waitlist Alerts')
            .setDescription(`Alert: ${inlineCode(id)} deregistered`)
            .setColor(Styles.Colours.UBC)
            .setTimestamp()
            .setFooter({
              text: `Deregistered by: ${interaction.user.username}`,
              iconURL: interaction.user.avatarURL(),
            });

        interaction.editReply({embeds: [embed]});
      } else {
        this.deferError(
            interaction,
            'Invalid alert id or no permissions to deregister',
        );
      }
    } else if (subcommand === 'settings') {
      const id = interaction.options.getString('id', true);
      if (cache[id] && cache[id].user.id === interaction.user.id) {
        cache[id].toggle = interaction.options.getBoolean('toggle', true);
        const embed = new EmbedBuilder()
            .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
            .setTitle('Waitlist Alerts')
            .setDescription(`Toggle: ${inlineCode(cache[id].toggle)}`)
            .setColor(Styles.Colours.UBC)
            .setTimestamp()
            .setFooter({
              text: `Set by: ${interaction.user.username}`,
              iconURL: interaction.user.avatarURL(),
            });

        interaction.editReply({embeds: [embed]});
      } else {
        this.deferError(
            interaction,
            'Invalid alert id or no permissions to toggle settings',
        );
      }
    } else {
      this.deferError(interaction, 'Invalid subcommand');
    }
  }
}

const WaitlistCommand = new Waitlist(
    'Waitlist',
    'Alerts you when a class waitlist opens up.',
);
WaitlistCommand.getData()
    .addSubcommand((subcommand) =>
      subcommand.setName('register')
          .setDescription('Register alerts for a class')
          .addStringOption((option) =>
            option.setName('url')
                .setDescription('The class url you want to Waitlist for.')
                .setRequired(true),
          )
          .addBooleanOption((option) =>
            option.setName('toggle')
                .setDescription('Toggle alert messages on/off')
                .setRequired(false),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('unregister')
          .setDescription('Unregister alerts for a class')
          .addStringOption((option) =>
            option.setName('id')
                .setDescription('Id of the alert')
                .setRequired(true),
          ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('list')
          .setDescription('List all your alerts'),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('settings')
          .setDescription('Toggle settings')
          .addStringOption((option) =>
            option.setName('id')
                .setDescription('Id of the alert')
                .setRequired(true),
          )
          .addBooleanOption((option) =>
            option.setName('toggle')
                .setDescription('Toggle alert messages on/off'),
          ),
    );

module.exports = WaitlistCommand;
