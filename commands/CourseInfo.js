const Command = require('./Command.js');
const Styles = require('../styles.json');
const {EmbedBuilder} = require('discord.js');
const {bold, blockQuote, hyperlink} = require('@discordjs/builders');
const Axios = require('axios');
const Cheerio = require('cheerio');

const ORIGIN = 'https://courses.students.ubc.ca';
const BASE_URL = `${ORIGIN}/cs/courseschedule?pname=subjarea&tname=subj-course`;

/**
 * Gets UBC Course Information
 */
class CourseInfo extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    await interaction.deferReply();

    const department = interaction.options.getString('department', true);
    const course = interaction.options.getString('course', true);
    // const section = interaction.options.getString("section");
    // const sessionYear = interaction.options.getString("year");
    // const session = interaction.options.getString("session");

    const queryUrl = new URL(BASE_URL);
    queryUrl.searchParams.append('dept', department);
    queryUrl.searchParams.append('course', course);
    // queryUrl.searchParams.append("section", section);
    // queryUrl.searchParams.append("sessyr", sessionYear);
    // queryUrl.searchParams.append("sesscd", session);

    Axios.get(queryUrl.href).then(async (response) => {
      const htmlParser = Cheerio.load(response.data);
      const title = htmlParser('.content.expand > h4').text();
      const paragraphElements = [];

      htmlParser('.content.expand > p').each((index, element) => {
        paragraphElements.push(htmlParser(element).text());
      });

      const credits = paragraphElements[1] ?
      paragraphElements[1].slice(8).trim() : 0;
      // paragraphElements[1].search("Credits:")
      const preReqs = paragraphElements[2] ?
      paragraphElements[2].slice(9).trim() : 'None';
      // paragraphElements[2].search("Pre-reqs:")
      const coReqs = paragraphElements[3] ?
      paragraphElements[3].slice(8).trim() : 'None';
      // paragraphElements[2].search("Pre-reqs:")

      const sections = htmlParser('.section-summary > tbody').children();
      let sectionsList = '';
      let prevLength = 0;

      // eslint-disable-next-line max-len
      for (let index = 0; index < sections.length && sectionsList.length < 1000; index++) {
        const sectionInfo = htmlParser(sections.get(index)).children();
        const status = htmlParser(sectionInfo.get(0)).text().trim();
        const section = htmlParser(sectionInfo.get(1)).text().slice(-3).trim();
        const url = htmlParser(sectionInfo.get(1)).find('a').attr('href');
        const term = htmlParser(sectionInfo.get(3)).text().trim();
        const days = htmlParser(sectionInfo.get(6)).text().trim();
        const start = htmlParser(sectionInfo.get(7)).text().trim();
        const end = htmlParser(sectionInfo.get(8)).text().trim();

        prevLength = sectionsList.length;

        // eslint-disable-next-line max-len
        sectionsList += `${status !== '' ? ':no_entry_sign:' : ''} ${bold(hyperlink(`${section} T${term}`, ORIGIN + url))} | `;
        // eslint-disable-next-line max-len
        sectionsList += ((days !== '' || start !== '') ? `${days} ${start} - ${end}` : 'Waitlist') + '\n';
      }

      const embed = new EmbedBuilder()
          .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=subjarea&tname=subj-all-departments', iconURL: Styles.Icons.UBC})
          .setTitle(`${title} Information`)
          .setDescription(blockQuote(paragraphElements[0].trim()))
          .setURL(queryUrl.href)
          .addFields(
              {name: 'Credits', value: `${credits} Credits`},
              {name: 'Pre-Requisites', value: `${preReqs}`},
              {name: 'Co-Requisites', value: `${coReqs}`},
          )
          .setColor(Styles.Colours.UBC);

      const sectionsEmbed = new EmbedBuilder()
          .setTitle(`Sections [${sections.length}]`)
          .setDescription(sectionsList.slice(0,
            sectionsList.length < 1024 ? sectionsList.length : prevLength),
          )
          .setColor(Styles.Colours.UBC)
          .setTimestamp()
          .setFooter({
            // eslint-disable-next-line max-len
            text: `Requested by: ${interaction.user.username} | Data from UBC SSC Course Schedule`,
            iconURL: interaction.user.avatarURL(),
          });

      await interaction.editReply({embeds: [embed, sectionsEmbed]});
    }).catch(async (error) => {
      console.log(error);
      // eslint-disable-next-line max-len
      await this.deferError(interaction, `Failed to get course info. Please retry. If this command constantly fails, try to use this **[link](${queryUrl.href})** to manually find the course`);
    });
  }
}

CourseInfoCommand = new CourseInfo('CourseInfo', 'Gets UBC course information');
CourseInfoCommand.getData()
    .addStringOption((option) =>
      option.setName('department')
          .setDescription('Department of the course')
          .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('course')
          .setDescription('Course code')
          .setRequired(true),
    );

module.exports = CourseInfoCommand;
