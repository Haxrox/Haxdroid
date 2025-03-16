const {EmbedBuilder} = require('discord.js');

const Subcommand = require('../../core/Subcommand.js');
const Styles = require('../../configs/styles.json');

const {CheckerBuilder, CheckerService} = require('../../services/CheckerService.js');

const puppeteer = require('puppeteer');

const NAME = 'Badminton';
const DESCRIPTION = 'Badminton registration check';

/**
 * Check whether enroll button is active
 * @param {string} url url for the badminton registration
 * @return {Promise} which returns boolean whether the enroll button is active
*/
function checkEnrollBtn(url) {
  return async () => {
    const BROWSER = await puppeteer.launch();
    const PAGE = await BROWSER.newPage();

    await PAGE.goto(url, {waitUntil: 'networkidle0'});
    const enroll_btns = await PAGE.$$eval(`.${ENROLL_BTN_CLASS} > *`, (el) => el.map(el => el.outerHTML));

    BROWSER.close();

    if (enroll_btns.length == 0) {
      return CheckerService.CheckStatus.ERROR, 'No enroll button found';
    } else if (enroll_btns[0].includes('openings remaining Enroll Now')) {
      return CheckerService.CheckStatus.ALERT, 'Badminton is open';
    } else if (enroll_btns[0].includes('aria-label="Full undefined"')) {
      return CheckerService.CheckStatus.ALIVE, 'Badminton is full';
    } else if (enroll_btns[0].includes('aria-label="Closed undefined"')) {
      return CheckerService.CheckStatus.CANCELLED, 'Badminton passed';
    } else {
      return CheckerService.CheckStatus.ERROR, 'No matching found';
    }
  }
}

/**
 * @class Badminton
 * @description Badminton registration check
 */
class Badminton extends Subcommand {
  /**
   * Create Badminton Subcommand
   * @param {String} name name of the command
   * @param {String} description description of the command
   */
  constructor(name, description) {
    super(name, description);

    this.getData()
        .addStringOption((option) =>
          option.setName('url')
              .setDescription('The badminton url you want to enroll for.')
              .setRequired(true),
        )
        .addBooleanOption((option) =>
          option.setName('toggle')
              .setDescription('Toggle alert messages on/off')
              .setRequired(false),
        );
  }

  /**
   * Executes Slash Command interaction
   * @param {BaseInteraction} interaction interaction created
   */
  async execute(interaction) {
    super.execute(interaction);

    const url = interaction.options.getString('url', true);

    const checkerBuilder = new CheckerBuilder()
      .setChecker(checkEnrollBtn(url))
      .setPeriod(CheckerService.CHECKER_INTERVAL_IN_S);

    const checkId = CheckerService.execute(checkerBuilder);

    interaction.reply({embeds : [
      this.createEmbed(interaction, new EmbedBuilder()
        .setTitle('Badminton Registration Check')
        .setDescription('Badminton registration check is active')
        .setURL(url)
        .setFooter({
          text: 'Checking by: '
            .concat(interaction.user.username)
            .concat(' | Check ID: ')
            .concat(checkId),
        })
      ),
    ]})
  }
}

module.exports = new Badminton(NAME, DESCRIPTION);
