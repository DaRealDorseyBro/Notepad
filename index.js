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

client.reminders = new Discord.Collection()

module.exports.setReminders = function setReminders(c) {
    let set = c.now
    let timeout = c.time
    let currentTimeout;
    currentTimeout = setTimeout(async() => {
        if (c.times <= 1) await db.delete(`remind_${c.owner}_${c.name}`)
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
        await channel.send(`<@${c.owner}>,`, new Discord.MessageEmbed()
            .setTitle('Reminder: `' + c.name + '`')
            .setDescription(`\`\`\`\n${await db.get(`${c.trueOwner}_${c.name}`).value}\`\`\``)
            .setColor(client.bot.color)
            .setTimestamp(c.now)
            .setFooter(client.bot.footer)
        );
        await client.reminders.delete(`${c.owner}_${c.name}`)
        if (c.times > 1) return setReminders(await db.get(`remind_${c.owner}_${c.name}`))
    }, timeout - (Date.now() - set))
    client.reminders.set(`${c.owner}_${c.name}`, currentTimeout)
}

String.prototype.parseFlags = function parseFlags(amount) {
    let regex = /(^--|\s--)(\w+)/g, flags = [], string = [];
    let maxFlags = false
    !amount ? amount = Infinity : amount = amount
    this.split(' ').map(arr => {
        maxFlags === false ? (arr.match(regex) ? flags.push(arr.slice(2)) : string.push(arr)) : string.push(arr)
        flags.length >= amount ? maxFlags = true : maxFlags = false
    })
    return {flags: flags, str: string.join(' '), maxFlags: amount}
}

String.prototype.parseFlagsWithOptions = function parseFlagsWithOptions(amount) {
    let regex = /(^--|\s--)(\w+)(:)(\w+)/g, flags = [], string = [];
    let maxFlags = false
    !amount ? amount = Infinity : amount = amount
    this.split(' ').map(arr => {
        maxFlags === false ? (arr.match(regex) ? flags.push({flag: arr.split(':')[0].slice(2), option: arr.split(':')[1]}) : string.push(arr)) : string.push(arr);
        flags.length >= amount ? maxFlags = true : maxFlags = false;
    })
    return {flags: flags, str: string.join(' '), maxFlags: amount}
}


Array.prototype.parseFlags = function parseFlags(amount) {
    let str = this.join(' ')
    let regex = /(^--|\s--)(\w+)/g, flags = [], string = [];
    let maxFlags = false
    !amount ? amount = Infinity : amount = amount
    str.split(' ').forEach(arr => {
        maxFlags === false ? (arr.match(regex) ? flags.push(arr.slice(2)) : string.push(arr)) : string.push(arr)
        flags.length >= amount ? maxFlags = true : maxFlags = false
    })
    return {flags: flags, arr: string, maxFlags: amount}
}

Array.prototype.parseFlagsWithOptions = function parseFlagsWithOptions(amount) {
    let str = this.join(' ')
    let regex = /(^--|\s--)(\w+)(:)(\w+)/g, flags = [], string = [];
    let maxFlags = false
    !amount ? amount = Infinity : amount = amount
    str.split(' ').forEach(arr => {
        maxFlags === false ? (arr.match(regex) ? flags.push({flag: arr.split(':')[0].slice(2), option: arr.split(':')[1]}) : string.push(arr)) : string.push(arr)
        flags.length >= amount ? maxFlags = true : maxFlags = false
    })
    return {flags: flags, arr: string, maxFlags: amount}
}

/* global.forDaMemes = {
    c: {
        o: {
            c: {
                k: {
                    s: {
                        u: {
                            c: {
                                k: function (msg) {
                                    msg.channel.send('<:astolfo_blush:789535568387506188>')
                                }
                            }
                        }
                    }
                }
            },
            n: {
                s: {
                    o: {
                        l: {
                            e: {
                                l: {
                                    o: {
                                        g: function (str) {
                                            return console.log(str)
                                        }
                                    }
                                },
                                e: {
                                    r: {
                                        r: {
                                            o: {
                                                r: function (str) {
                                                    console.error(str)
                                                }
                                            }
                                        }
                                    }
                                },
                                w: {
                                    a: {
                                        r: {
                                            n: function (str) {
                                            n: function (str) {
                                                console.warn(str)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
} */

let fuckyousort = []
Array.prototype.sort = fuckyousort.sort

client.commands = new Discord.Collection();
const cooldowns = new Discord.Collection();
client.bot = {
    prefix: "note!",
    color: "#FDDED9",
    footer: "Notepad.js | By Rosey",
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
    let statuss = [`note!help | ${client.guilds.cache.size} Servers!`, `note!help | ${client.users.cache.size} Users!`, `note!help | ${client.channels.cache.size} Channels!`]

    console.log(`${client.user.tag} is online on ${client.guilds.cache.size} servers, protecting ${client.users.cache.size} users, looking over ${client.channels.cache.size} channels`)

    setInterval(function () {
        let status = statuss[Math.floor(Math.random() * statuss.length)];
        client.user.setActivity(status, {type: 'PLAYING'})
    }, 5555)

    try {
        fetch(`https://api.voidbots.net/bot/stats/${client.user.id}`, {
            method: "POST",
            headers: {
                Authorization: config.voidbots,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({"server_count": client.guilds.cache.size})
        })
        console.log('Server count posted to VoidBots (The best botlist)')
    } catch (e) {
        console.log(e)
    }

    db.fetchEverything().forEach(c => {
        if (c.type === 'reminder') {
            return this.setReminders(c)
        }
    })
})

client.on('message', async message => {

    if (message.mentions.members.first() && message.mentions.members.first().id === client.user.id && !message.author.bot) {
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

    if (message.mentions.members.size && !message.author.bot) {
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
    let objee = afkdb.get(`${message.author.id}`)
    let grammar = objee.pings === 1 ? `${objee.pings} ping` : `${objee.pings} pings`
        await afkdb.delete(`${message.author.id}`)
        message.reply(`You are no longer afk! You got \`${objee.pings === 0 ? `no pings` : grammar}\` while you were gone!`)
    }

    if (message.content === client.bot.prefix && !message.author.bot) {
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
    if(oldMessage.content !== message.content) client.emit('message', message)
})

client.login(config.token)