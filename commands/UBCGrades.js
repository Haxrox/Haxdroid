const Axios = require('axios');
const {
  EmbedBuilder,
  AttachmentBuilder,
  bold,
  blockQuote,
} = require('discord.js');
const {ChartJSNodeCanvas} = require('chartjs-node-canvas');

const Command = require('./Command.js');
const Styles = require('../styles.json');

const API_URL = 'https://ubcgrades.com/api/v2/grades/CAMPUS/SESSION/SUBJECT/COURSE/SECTION';
const WEB_URL = 'https://ubcgrades.com/#CAMPUS-SESSION-SUBJECT-COURSE-SECTION';
const COURSE_FORMAT = 'CAMPUS - SESSION SUBJECT COURSE SECTION';

// eslint-disable-next-line max-len
const GRADE_DISTRIBUTION = ['<50%', '50-54%', '55-59%', '60-63%', '64-67%', '68-71%', '72-75%', '76-79%', '80-84%', '85-89%', '90-100%'];
const CURRENT_YEAR = 2023;
const SUBJECTS = [
  'APSC - Applied Sciences',
  'CPEN - Computer Engineering',
  'CPSC - Computer Science',
  'ELEC - Electrical Engineering',
  'MATH - Mathematics',
  'PHYS - Physics',
];

/**
 * Fetches UBC Course Information
 */
class UBCGrades extends Command {
  /**
   * Executes the given command interaction
   * @param {BaseInteraction} interaction interaction executed
   */
  async execute(interaction) {
    const campus = interaction.options.getString('campus') || 'UBCV';
    const session = interaction.options.getString('session', true);
    const subject = interaction.options.getString('subject', true);
    const course = interaction.options.getString('course', true);
    const section = interaction.options.getString('section') || 'OVERALL';

    const format = COURSE_FORMAT.replace(/CAMPUS/, campus)
        .replace(/SESSION/, session)
        .replace(/SUBJECT/, subject)
        .replace(/COURSE/, course)
        .replace(/SECTION/, section);
    const apiUrl = API_URL.replace(/CAMPUS/, campus)
        .replace(/SESSION/, session)
        .replace(/SUBJECT/, subject)
        .replace(/COURSE/, course)
        .replace(/SECTION/, section);

    Axios.get(apiUrl).then(async (response) => {
      const webUrl = WEB_URL.replace(/CAMPUS/, campus)
          .replace(/SESSION/, session)
          .replace(/SUBJECT/, subject)
          .replace(/COURSE/, course)
          .replace(/SECTION/, section);

      const courseTitle = response.data.course_title;
      const facultyTitle = response.data.faculty_title;
      let description = `${courseTitle} - ${facultyTitle}`;

      if (section != 'OVERALL') {
        description = description
            .concat('\n**Professor(s):** ')
            .concat(response.data.educators);
      }
      if (response.data.detail != '') {
        description = description
            .concat('\n')
            .concat(blockQuote(response.data.detail));
      }

      const grades = [];
      GRADE_DISTRIBUTION.forEach((grade) => {
        grades.push(response.data.grades[grade]);
      });

      const renderer = new ChartJSNodeCanvas({width: 800, height: 400});
      const image = await renderer.renderToBuffer({
        type: 'bar',
        color: 'rgb(235, 252, 255)',
        data: {
          labels: GRADE_DISTRIBUTION,
          datasets: [{
            label: 'GPA',
            data: grades,
            backgroundColor: 'rgba(24, 175, 244, 0.5)',
            borderColor: 'rgb(24, 175, 244)',
            color: 'rgb(235, 252, 255)',
            borderWidth: 1,
          }],
        },
        options: {
          plugins: {
            legend: {
              display: true,
              position: 'chartArea',
              align: 'top',
              title: {
                color: 'rgb(235, 252, 255)',
              },
              labels: {
                font: 'Roboto',
                color: 'rgb(235, 252, 255)',
              },
            },
          },
          scales: {
            x: {
              ticks: {
                backdropColor: 'rgb(235, 252, 255)',
                color: 'rgb(235, 252, 255)',
              },
            },
            y: {
              ticks: {
                backdropColor: 'rgb(235, 252, 255)',
                color: 'rgb(235, 252, 255)',
                grid: {
                  display: true,
                  drawTicks: true,
                  color: 'rgba(235, 252, 255, 0.5)',
                  lineWidth: 1,
                },
              },
            },

          },
        },
      });

      const attachment = new AttachmentBuilder(image, {
        name: 'distribution.png',
        description: 'Distrubition chart',
      });
      const embed = new EmbedBuilder()
          .setAuthor({name: 'UBCGrades', url: 'https://ubcgrades.com/', iconURL: Styles.Icons.UBC})
          .setTitle(`Grade Summary of ${format}`)
          .setDescription(description)
          .setURL(webUrl)
          .addFields(
              {
                name: 'Enrolled',
                value: `${response.data.enrolled} Student(s)`,
                inline: true,
              },
              {
                name: 'Average',
                value: `${parseFloat(response.data.average).toFixed(4)}%`,
                inline: true,
              },
              {
                name: 'Standard Deviation',
                value: `${parseFloat(response.data.stdev).toFixed(4)}%`,
                inline: true,
              },
              {
                name: 'Passed',
                // eslint-disable-next-line max-len
                value: `${response.data.enrolled - response.data.grades['<50%']} Student(s) (${parseFloat((response.data.enrolled - response.data.grades['<50%']) / response.data.enrolled * 100).toFixed(4)}%)`,
                inline: true,
              },
              {
                name: 'Failed',
                value: `${response.data.grades['<50%']} Student(s)`,
                inline: true,
              },
              {
                name: '\u200b',
                value: '\u200b',
                inline: true,
              },
              {
                name: 'Highest',
                value: `${response.data.high}%`,
                inline: true,
              },
              {
                name: 'Lowest',
                value: `${response.data.low}%`,
                inline: true,
              },
              {
                name: '\u200b',
                value: '\u200b',
                inline: true,
              },
          )
          .setImage('attachment://distribution.png')
          .setColor(Styles.Colours.UBC)
          .setTimestamp()
          .setFooter({
            // eslint-disable-next-line max-len
            text: `Requested by: ${interaction.user.username} | Data from ubcgrades.com`,
            iconURL: interaction.user.avatarURL(),
          });
      await interaction.reply({embeds: [embed], files: [attachment]});
    }).catch(async (error) => {
      if (error.response) {
        await this.error(
            interaction,
            `Grades of ${bold(format)} - ${error.response.data.error}.
            Retry, or find the course using **[this](https://ubcgrades.com)** link`,
        );
      } else if (error.request) {
        await this.error(
            interaction,
            'No response received. Try finding the course using [this](https://ubcgrades.com) link',
        );
      } else {
        await this.error(interaction, error.message);
      }
    });
  }
}

const UBCGradesCommand = new UBCGrades(
    'UBCGrades',
    'Retrieves grade information for a course',
);
UBCGradesCommand.getData()
    .addStringOption((option) => {
      option.setName('session')
          .setDescription('Course session')
          .setRequired(true);

      for (let index = CURRENT_YEAR; index >= CURRENT_YEAR - 10; index--) {
        option.addChoices({
          name: index.toString().concat('W'),
          value: index.toString().concat('W'),
        });
        option.addChoices({
          name: index.toString().concat('S'),
          value: index.toString().concat('S'),
        });
      }
      // option.addChoices(choices);
      return option;
    })
    .addStringOption((option) => {
      option.setName('subject')
          .setDescription('Subject code')
          .setRequired(true);

      for (const code of SUBJECTS) {
        option.addChoices({name: code, value: code.slice(0, 4)});
      }

      return option;
    })
    .addStringOption((option) =>
      option.setName('course')
          .setDescription('Course code')
          .setRequired(true),
    )
    .addStringOption((option) =>
      option.setName('campus')
          .setDescription('Campus for the course')
          .addChoices(
              {name: 'Vancouver Campus', value: 'UBCV'},
              {name: 'Okanagan Campus', value: 'UBCO'},
          ),
    )
    .addStringOption((option) =>
      option.setName('section')
          .setDescription('Section of the course'),
    );


module.exports = UBCGradesCommand;
