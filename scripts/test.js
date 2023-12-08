const {Collection} = require('discord.js');

const collection = new Collection();

collection.set('Hello', 1);
collection.set('Foo', 2);

const collection2 = collection.map(val => val * 2);
collection.each(console.log);
console.log(collection2);