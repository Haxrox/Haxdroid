const Axios = require('axios');
const Cheerio = require('cheerio');

const {AlertBuilder} = require('./AlertService.js');
const CommandsService = require('./CommandsService.js');
const Styles = require('../configs/styles.json');

/**
 * @class CourseInfo
 * @description Class to represent course information extracted from 
 *  course website
 */
class CourseInfo {
  title;
  description;
  seatsRemaining;

  /**
   * Sets title of the course
   * @param {String} title title of the course
   * @return {SeatInfo} this
   */
  setTitle(title) {
    this.title = title;
    return this;
  }

  /**
   * Sets description of the course
   * @param {String} description description of the course
   * @return {SeatInfo} this
   */
  setDescription(description) {
    this.description = description;
    return this;
  }

  /**
   * Sets seats remaining for the course
   * @param {Integer} seatsRemaining seats remaining for the course
   * @return {SeatInfo} this
   */
  setSeatsRemaining(seatsRemaining) {
    this.seatsRemaining = seatsRemaining;
    return this;
  }
}

/**
 * @class WaitlistData
 * @description Class to represent waitlist data
 */
class WaitlistData {
  url;
  user;
  toggle;
  timestamp;
}

/**
 * @class WaitlistBuilder
 * @description Class to build waitlist data
 */
class WaitlistBuilder {
  #data;

  /**
   * Create WaitlistBuilder
   */
  constructor() {
    this.#data = new WaitlistData();
  }

  /**
   * Sets url for the waitlist
   * @param {CourseInfo} url url for the course
   * @return {WaitlistBuilder} this
   */
  setUrl(url) {
    this.#data.url = url;
    return this;
  }

  /**
   * Sets user to send alert to
   * @param {User} user user to send alert to
   * @return {WaitlistBuilder} this
   */
  setUser(user) {
    this.#data.user = user;
    return this;
  }

  /**
   * Toggles the alert
   * @param {Boolean} toggle toggle the alert
   * @return {WaitlistBuilder} this
   */
  setToggle(toggle) {
    this.#data.toggle = toggle;
    return this;
  }

  /**
   * Sets timestamp of last alert/check
   * @param {Date} timestamp timestamp of last alert/check
   * @return {WaitlistBuilder} this
   */
  setTimestamp(timestamp) {
    this.#data.timestamp = timestamp || new Date();
    return this;
  }

  /**
   * Builds waitlist data
   * @return {WaitlistData} waitlist data
   */
  build() {
    return this.#data;
  }
}

/**
 * @class Waitlist
 * @description Class to represent a waitlist in cache
 */
class Waitlist {
  #data;
  #baseEmbed;
  #id;
  #title;
  #description;
  #timestamp;
  #toggle;

  /**
   * Create Waitlist
   * @param {WaitlistBuilder} waitlistBuilder waitlist builder
   */
  constructor(waitlistBuilder) {
    this.#data = waitlistBuilder.build();
  }

  sendInfo() {
    getSeatInfo(this.#data.url).then((seatInfo) => {
      this.#baseEmbed
        .setDescription(seatInfo.description);
     
      if (seatInfo.seatsRemaining > 0) {
        const alertBuilder = new AlertBuilder()
          .setAlerter(this.#data.user)
          .setTarget(this.#data.user)
          .setContent(this.#data.user.toString())
          .setMessageEmbed(embed)
        let count = ALERT_COUNT;
        const alertID = setInterval(() => {
          if (count < 0 || this.#cache[id] === undefined) {
            clearInterval(alertID);
          }
          this.#data.user.send({
            content: seatInfo.seatsRemaining > 0 ? this.#data.user.toString() : null,
            embeds: [embed],
          });
          count--;
        }, ALERT_INTERVAL);
      }

      if (this.#cache[id].toggle) {
        this.#data.user.send({
          content: seatInfo.seatsRemaining > 0 ? this.#data.user.toString() : null,
          embeds: [embed],
        });
      }

      this.#cache[id].timestamp = new Date();
    }).catch((error) => {
      if (this.#cache[id].toggle) {
        const embed = new EmbedBuilder()
            .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
            .setTitle(`${this.#cache[id].title} Alert Failed`)
            .setColor(Styles.Colours.Red)
            .setTimestamp()
            .setDescription('Failed to retrieve seat information: '
                .concat(error.message),
            )
            .setFooter({text: `ID: ${id}`, iconURL: Styles.Icons.UBC});

        this.#cache[id].user.send({embeds: [embed]});
      }
    });
  }

  execute() {
    this.#id = setInterval(sendInfo, INTERVAL);

    this.#baseEmbed = this.#baseEmbed || CommandsService.createBaseEmbed(new EmbedBuilder()
      .setAuthor({
        name: 'UBC', 
        url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', 
        iconURL: Styles.Icons.UBC
      })
      .setTitle(`${this.#data.title} Waitlist Alert`)
      .setURL(this.#data.url)
      .setColor(Styles.Colours.UBC)
      .setFooter({
        text: `ID: ${id}`, 
        iconURL: Styles.Icons.UBC
      })
    );
}
/**
 * @class WaitlistService
 * @description Class to manage waitlists
 */
class WaitlistService {
  #cache;

  /**
   * Create WaitlistService
   */
  constructor() {
    this.#cache = new Map();
  }

  /**
   * Gets seat information from the given url
   * @param {String} url url to get seat information from
   * @return {SeatInfo} seat information
   * @throws {Error} if unable to retrieve seat information
   */
  getSeatInfo(url) {
    return Axios.get(url).then((response) => {
      const seatInfo = new SeatInfo();
      const htmlParser = Cheerio.load(response.data);

      let seatsRemaining = 0;
      let description = '';

      htmlParser('.\'table > tbody > tr > td').each((index, element) => {
        if (index % 2 === 0) {
          seatsRemaining = htmlParser(element)
              .text()
              .includes('Total Seats Remaining:') ?
              htmlParser(element).next().text() : seatsRemaining;
          description += bold(htmlParser(element).text())
              .concat(' ')
              .concat(htmlParser(element).next().text())
              .concat('\n');
        }
      });

      seatInfo.setTitle(htmlParser('.content.expand > h4').text())
          .setDescription(description)
          .setSeatsRemaining(seatsRemaining);

      return seatInfo;
    });
  }

  /**
   * Creates a new waitlist
   * @param {WaitlistBuilder} waitlistBuilder waitlist builder
   */
  newWaitlist(waitlistBuilder) {
    const waitlistData = waitlistBuilder.data;
    const id = setInterval(() => {
      getSeatInfo(waitlistData.url).then((seatInfo) => {
        const embed = new EmbedBuilder()
            .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
            .setTitle(`${seatInfo.title} Waitlist Alert`)
            .setURL(waitlistData.url)
            .setColor(Styles.Colours.UBC)
            .setTimestamp()
            .setDescription(seatInfo.description)
            .setFooter({text: `ID: ${id}`, iconURL: Styles.Icons.UBC});
        if (seatInfo.seatsRemaining > 0) {
          let count = ALERT_COUNT;
          const alertID = setInterval(() => {
            if (count < 0 || this.#cache[id] === undefined) {
              clearInterval(alertID);
            }
            waitlistData.user.send({
              content: seatInfo.seatsRemaining > 0 ? waitlistData.user.toString() : null,
              embeds: [embed],
            });
            count--;
          }, ALERT_INTERVAL);
        }

        if (this.#cache[id].toggle) {
          waitlistData.user.send({
            content: seatInfo.seatsRemaining > 0 ? waitlistData.user.toString() : null,
            embeds: [embed],
          });
        }

        this.#cache[id].timestamp = new Date();
      }).catch((error) => {
        if (this.#cache[id].toggle) {
          const embed = new EmbedBuilder()
              .setAuthor({name: 'UBC', url: 'https://courses.students.ubc.ca/cs/courseschedule?pname=welcome&tname=welcome', iconURL: Styles.Icons.UBC})
              .setTitle(`${this.#cache[id].title} Alert Failed`)
              .setColor(Styles.Colours.Red)
              .setTimestamp()
              .setDescription('Failed to retrieve seat information: '
                  .concat(error.message),
              )
              .setFooter({text: `ID: ${id}`, iconURL: Styles.Icons.UBC});

          waitlistData.user.send({embeds: [embed]});
        }
      });
    }, INTERVAL);

    this.#cache[id] = {
      url: waitlistData.url,
      title: waitlistData.title,
      user: wait,
    };
  }
}

module.exports = {
  WaitlistBuilder,
  WaitlistService,
};
