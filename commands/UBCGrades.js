const Command = require('./Command.js');
const Axios = require('axios');
const {MessageEmbed, MessageAttachment, DiscordAPIError} = require('discord.js');
const { ChartJSNodeCanvas } = require("chartjs-node-canvas");
const {bold, blockQuote} = require('@discordjs/builders');

const API_URL = "https://ubcgrades.com/api/v2/grades/CAMPUS/SESSION/SUBJECT/COURSE/SECTION";
const WEB_URL = "https://ubcgrades.com/#CAMPUS-SESSION-SUBJECT-COURSE-SECTION"
const COURSE_FORMAT = "CAMPUS - SESSION SUBJECT COURSE SECTION";

const GRADE_DISTRIBUTION = ["<50%", "50-54%", "55-59%", "60-63%", "64-67%", "68-71%", "72-75%", "76-79%", "80-84%", "85-89%", "90-100%"];
const CURRENT_YEAR = 2020;
const SUBJECTS = [
    "APSC - Applied Sciences",
    "CPEN - Computer Engineering",
    "CPSC - Computer Science",
    "ELEC - Electrical Engineering",
    "MATH - Mathematics",
    "PHYS - Physics"
];

class UBCGrades extends Command {
    async Execute(interaction) {
        const campus = interaction.options.getString("campus") || "UBCV";
        const session = interaction.options.getString("session", true);
        const subject = interaction.options.getString("subject", true);
        const course = interaction.options.getString("course", true);
        const section = interaction.options.getString("section") || "OVERALL";
        
        const format = COURSE_FORMAT.replace(/CAMPUS/, campus).replace(/SESSION/, session).replace(/SUBJECT/, subject).replace(/COURSE/, course).replace(/SECTION/, section);
        const apiUrl = API_URL.replace(/CAMPUS/, campus).replace(/SESSION/, session).replace(/SUBJECT/, subject).replace(/COURSE/, course).replace(/SECTION/, section);

        Axios.get(apiUrl).then(async response => {
            const webUrl = WEB_URL.replace(/CAMPUS/, campus).replace(/SESSION/, session).replace(/SUBJECT/, subject).replace(/COURSE/, course).replace(/SECTION/, section);

            var description = `${response.data.course_title} - ${response.data.faculty_title}`;
            if (section != "OVERALL") {
                description = description.concat("\n**Professor(s):** ").concat(response.data.educators);
            }
            if (response.data.detail != "") {
                description = description.concat("\n").concat(blockQuote(response.data.detail));
            }

            var passCount = 0;
            for (var index = 1; index < GRADE_DISTRIBUTION.length; index++) {
                passCount += response.data.grades[GRADE_DISTRIBUTION[index]];
            }

            const grades = [];
            GRADE_DISTRIBUTION.forEach(grade => {
                grades.push(response.data.grades[grade]);
            })

            const renderer = new ChartJSNodeCanvas({ width: 800, height: 400 });
            const image = await renderer.renderToBuffer({
                type: "bar",
                color: "rgb(235, 252, 255)",
                data: {
                    labels: GRADE_DISTRIBUTION,
                    datasets: [{
                        label: "GPA",
                        data: grades,
                        backgroundColor: "rgba(24, 175, 244, 0.5)",
                        borderColor: "rgb(24, 175, 244)",
                        color: "rgb(235, 252, 255)",
                        borderWidth: 1
                    }]
                },
                options: {
                    plugins: {
                        legend: {
                            display: true,
                            position: "chartArea",
                            align: "top",
                            title: {
                                color: "rgb(235, 252, 255)"
                            },
                            labels: {
                                font: "Roboto",
                                color: "rgb(235, 252, 255)"
                            },
                        }
                    }
                }
            });

            const attachment = new MessageAttachment(image, "distribution.png");
            const embed = new MessageEmbed()
            .setTitle(`Grade Summary of ${format}`)
            .setDescription(description)
            .setURL(webUrl)
            .addField("Enrolled", `${response.data.enrolled} Students`, true)
            .addField("Average", `${parseFloat(response.data.average).toFixed(4)}%`, true)
            .addField("Standard Deviation", `${parseFloat(response.data.stdev).toFixed(4)}%`, true)
            .addField("Passed", `${passCount} Students (${parseFloat((passCount / response.data.enrolled)*100).toFixed(4)}%)`, true)
            .addField("Failed", `${response.data.enrolled - passCount} Students`, true)
            .addField('\u200b', '\u200b', true)
            .addField("Highest", `${response.data.high}%`, true)
            .addField("Lowest", `${response.data.low}%`, true)
            .addField('\u200b', '\u200b', true)
            .setImage("attachment://distribution.png")
            .setColor('#cacaca')
            .setTimestamp()
            .setFooter(`Requested by: ${interaction.user.username} | Data from ubcgrades.com`, interaction.user.avatarURL());
            await interaction.reply({embeds: [embed], files: [attachment]});
        }).catch(async error => {
            if (error.response) {
                await this.Error(interaction, `Grades of ${bold(format)} - ${error.response.data.error}.\nRetry, or find the course using **[this](https://ubcgrades.com)** link`);
            } else if (error.request) {
                await this.Error(interaction, "No response received. Try finding the course using [this](https://ubcgrades.com) link");
            } else {
                await this.Error(interaction, error.message);
            }
        });
    }
}

const UBCGradesCommand = new UBCGrades("UBCGrades", "Retrieves grade information for a course");
UBCGradesCommand.GetData()
.addStringOption(option => {
    option.setName("session").setDescription("Course session").setRequired(true);
    for (var index = CURRENT_YEAR ; index >= CURRENT_YEAR - 10; index--) {
        option.addChoice(index.toString().concat("W"), index.toString().concat("W"));
        option.addChoice(index.toString().concat("S"), index.toString().concat("S"));
    }
    return option;
})
.addStringOption(option => {
    option.setName("subject").setDescription("Subject code").setRequired(true);
    for (var code of SUBJECTS) {
        option.addChoice(code, code.slice(0, 4));
    }
    return option;
})
.addStringOption(option => 
    option.setName("course").setDescription("Course code").setRequired(true)
)
.addStringOption(option => 
    option.setName("campus").setDescription("Campus for the course").addChoice("Vancouver Campus", "UBCV").addChoice("Okanagan Campus", "UBCO")
)
.addStringOption(option => 
    option.setName("section").setDescription("Section of the course")
)


module.exports = UBCGradesCommand;