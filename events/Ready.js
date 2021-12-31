const ClientEvent = require("./ClientEvent.js");

class Ready extends ClientEvent {
    
}

module.exports = new Ready("ready", true);