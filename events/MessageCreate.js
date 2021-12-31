const ClientEvent = require("./ClientEvent.js");

class MessageCreate extends ClientEvent {
    Execute(client, message) {
        super.Execute(client, message);
        console.log(message.content);
    }
}

module.exports = new MessageCreate("messageCreate", false);