const ClientEvent = require("./ClientEvent.js");

class MessageCreate extends ClientEvent {
    Execute(message) {
        super();
        console.log(message.content);
    }
}

module.exports = new MessageCreate("messageCreate", false);