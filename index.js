const Discord = require('discord.js')
const fs = require('fs')
const Enmap = require('enmap')
const db = new Enmap({name: "notepads"})
const client = new Discord.Client({fetchAllMembers: true})
const config = require('./config.json')

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
client.bot = {
    prefix: "note!",
    color: "#FDDED9",
    footer: "Notepad | By Rosey",
    owner: "531169498674233346"
}

const otherCommandFiles = fs.readdirSync('./commands/other').filter(file => file.endsWith('.js'));
const notesCommandFiles = fs.readdirSync('./commands/notes').filter(file => file.endsWith('.js'));
const creatorCommandFiles = fs.readdirSync('./commands/creator').filter(file => file.endsWith('.js'));
for (const file of otherCommandFiles) {
    const command = require(`./commands/other/${file}`);
    try {
    client.commands.set(command.name, command);
        console.log(`Loaded ${command.name}`)
    } catch (e) {
        console.log(`Failed to load ${command.name}`)
    }
}

for (const file of notesCommandFiles) {
    const command = require(`./commands/notes/${file}`);
    try {
        client.commands.set(command.name, command);
        console.log(`Loaded ${command.name}`)
    } catch (e) {
        console.log(`Failed to load ${command.name}`)
    }
}

for (const file of creatorCommandFiles) {
    const command = require(`./commands/creator/${file}`);
    try {
        client.commands.set(command.name, command);
        console.log(`Loaded ${command.name}`)
    } catch (e) {
        console.log(`Failed to load ${command.name}`)
    }
}

client.on('ready', () => {
    let statuss = [ `note!help | ${client.guilds.cache.size} Servers!`, `note!help | ${client.users.cache.size} Users!`, `note!help | ${client.channels.cache.size} Channels!`]

    console.log(`${client.user.tag} is online on ${client.guilds.cache.size} servers, protecting ${client.users.cache.size} users, looking over ${client.channels.cache.size} channels`)

    setInterval(function() {
        let status = statuss[Math.floor(Math.random() * statuss.length)];
        client.user.setActivity(status, {type : 'PLAYING'})
    }, 5555)
})

client.on('message', message => {
    if (!message.content.toLowerCase().startsWith(client.bot.prefix) || message.author.bot) return;
    const args = message.content.slice(client.bot.prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;

    if (command.ownerOnly === true && message.author.id !== client.bot.owner) return

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 1) * 1000;

    if (timestamps.has(message.author.id)) {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return message.reply(`Please wait \`${timeLeft.toFixed(1)}\` more second(s) before reusing the \`${command.name}\` command.`);
        }
    }

    try {
        command.execute(client, message, args, db);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command: `' + error + '`');
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

})

client.login(config.token)