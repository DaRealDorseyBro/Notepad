const Discord = require('discord.js')
const fs = require('fs')
const diffDefault = require('jest-diff').default
const fetch = require("node-fetch")
const Enmap = require('enmap')
const db = new Enmap({name: "notepads"})
const bldb = new Enmap({name: "blacklist"})
const afkdb = new Enmap({name: "afks"})
const client = new Discord.Client({fetchAllMembers: true})
const config = require('./config.json')

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
client.bot = {
    prefix: "note!",
    color: "#FDDED9",
    footer: "Notepad | By Rosey",
    owner: "531169498674233346",
    changes: async function changes(oldStr, newStr) { //
        return diffDefault(oldStr, newStr).split('\n').slice(2).join('\n')
    }
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

    try {
        fetch(`https://voidbots.net/api/auth/stats/${client.user.id}`, {
            method: "POST",
            headers: {
                Authorization: "JdmRNrcfjagL7W3Di7LDJGts7wBQHUdkn2bE7tRgQIz5",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"server_count": client.guilds.cache.size})
        })
        console.log('Server count posted to VoidBots (The best botlist)')
    } catch (e) {
        console.log(e)
    }

    setInterval(async function() {
        db.fetchEverything().forEach(c => {
            client.users.fetch('531169498674233346').then(async () => {
                if (c.type === 'reminder') {
                    let set = c.now
                    let timeout = c.time



                    if (!(timeout - (Date.now() - set) > 0)) {
                        if (c.times < 2) await db.delete(`remind_${c.owner}_${c.name}`)
                        if (c.times > 1) await db.set(`remind_${c.owner}_${c.name}`, {
                            type: c.type,
                            trueOwner: c.trueOwner,
                            channel: c.channel,
                            owner: c.owner,
                            name: c.name,
                            time: c.time,
                            now: Date.now(),
                            times: c.times - 1
                        })
                        let channel = client.channels.cache.get(c.channel)
                        if (!await db.get(`${c.trueOwner}_${c.name}`)) return channel.send(`<@${c.owner}>, You were supposed to be reminder but the note was corrupted!`)
                        return channel.send(`<@${c.owner}>,`, new Discord.MessageEmbed()
                            .setTitle('Reminder: `' + c.name + '`')
                            .setDescription(`\`\`\`\n${await db.get(`${c.trueOwner}_${c.name}`).value}\`\`\``)
                            .setColor(client.bot.color)
                            .setTimestamp(c.now)
                            .setFooter(client.bot.footer)
                        );
                    }
                }
            })
        }, 2000)
    })
})

client.on('message', async message => {

    if (message.mentions.members.first() && message.mentions.members.first().id === client.user.id) {
        message.channel.send(new Discord.MessageEmbed()
            .setAuthor(`Hey! My prefix is ${client.bot.prefix}, do ${client.bot.prefix}help for help!`, `https://cdn.discordapp.com/emojis/583109877262712846.gif`)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        ).then(msg => {
            setTimeout(() => {
                msg.delete()
            }, 10000)
        })
    }

    if (message.mentions.members.size) {
        if (message.mentions.members.size === 1) {
            if (await afkdb.get(message.mentions.members.first().id)) {
                let obj = await afkdb.get(message.mentions.members.first().id)
                await afkdb.set(message.mentions.members.first().id, {reason: obj.reason, pings: obj.pings + 1, now: obj.now})
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle('AFK')
                    .setDescription(`<@${message.mentions.members.first().id}> is AFK!\n\`\`\`${obj.reason}\`\`\``)
                    .setColor(client.bot.color)
                    .setTimestamp(obj.now)
                    .setFooter(client.bot.footer)
                )
            }
        } else if (message.mentions.members.size > 1 && message.mentions.members.size <= 10) {
            let people = []
            message.mentions.members.first(message.mentions.members.size).map(mem => mem.id).forEach(ar => {
                if (afkdb.get(ar)) people.push(ar)
            })
            for (const id of people) {
                console.log(people)
                let obj = afkdb.get(id)
                await afkdb.set(id, {reason: obj.reason, pings: obj.pings + 1, now: obj.now})
                message.channel.send(new Discord.MessageEmbed()
                    .setTitle(`AFK`)
                    .setDescription(`<@${id}> is AFK!\n\`\`\`${obj.reason}\`\`\``)
                    .setColor(client.bot.color)
                    .setTimestamp(obj.now)
                    .setFooter(client.bot.footer)
                );
            }
        }
    }

    if (await afkdb.get(`${message.author.id}`)) {
        await afkdb.delete(`${message.author.id}`)
        message.channel.send(`${message.author}, You are no longer afk!`)
    }

    if (message.content === client.bot.prefix) {
        try {
            client.commands.get('help').execute(client, message, [], db)
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command: `' + error + '`');
        }
    }

    let prefix = client.bot.prefix
    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    
    if (await bldb.get(`${message.author.id}`) && command.ownerOnly !== true) return message.channel.send(new Discord.MessageEmbed()
         .setTitle('Blacklisted')
         .setDescription(`\`\`\`${await bldb.get(`${message.author.id}`).reason}\`\`\``)
         .setColor(client.bot.color)
         .setTimestamp()
         .setFooter(client.bot.footer)
    )

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
        command.execute(client, message, args, db, bldb, afkdb);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command: `' + error + '`');
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

})

client.on('messageUpdate', async (oldMessage, message) => {

    if (message.mentions.members.first() && message.mentions.members.first().id === client.user.id) {
        message.channel.send(new Discord.MessageEmbed()
            .setAuthor(`Hey! My prefix is ${client.bot.prefix}, do ${client.bot.prefix}help for help!`, `https://cdn.discordapp.com/emojis/583109877262712846.gif`)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        ).then(msg => {
            setTimeout(() => {
                msg.delete()
            }, 10000)
        })
    }

    if (message.content === client.bot.prefix) {
        try {
            client.commands.get('help').execute(client, message, [], db)
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command: `' + error + '`');
        }
    }

    let prefix = client.bot.prefix
    if (!message.content.toLowerCase().startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

    if (!command) return;
    
    if (await bldb.get(`${message.author.id}`) && command.ownerOnly !== true) return message.channel.send(new Discord.MessageEmbed()
         .setTitle('Blacklisted')
         .setDescription(`\`\`\`${await bldb.get(`${message.author.id}`).reason}\`\`\``)
         .setColor(client.bot.color)
         .setTimestamp()
         .setFooter(client.bot.footer)
    )
    
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
        command.execute(client, message, args, db, bldb, afkdb);
    } catch (error) {
        console.error(error);
        message.reply('There was an error trying to execute that command: `' + error + '`');
    }

    timestamps.set(message.author.id, now);
    setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

})

client.login(config.token)