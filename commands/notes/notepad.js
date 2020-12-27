const {MessageEmbed} = require('discord.js')
const pretty = require('pretty-ms')
module.exports = {
    name: "notepad",
    description: "View your notes!",
    type: 'notes',
    aliases: ['pad'],
    cooldown: 2,
    usage: '{ [name] } | { --search < text > } | { --coowned [ name ] } | { --reminder [ name ] }',
    async execute(client, message, args, db) {
        if (!args[0]) {
            let data = []
            let number = 1;
            await db.fetchEverything().forEach(obj => {
                if (obj.type === 'note' && obj.owner === message.author.id) {
                    data.push(number + ". `" + obj.name + "`")
                    number += 1;
                }
            })
            if (!data.length >= 1) data.push('You have no notes!')

            return message.channel.send(new MessageEmbed()
                .setTitle('Your Notepad')
                .setDescription(data.join('\n'))
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        } else if (args[0] !== "--search" && args[0] !== "--coowned" && args[0] !== "--reminder") {
            let obj = await db.fetch(`${message.author.id}_${args[0].toLowerCase()}`)
            if (!obj) return message.channel.send('You don\'t have a note with that name!')

            let embed = new MessageEmbed()
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            if (obj.coowner === '`No One`') embed.setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\nCo-Owner: ${obj.coowner}`)
            if (obj.coowner !== '`No One`') embed.setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\nCo-Owner: <@${obj.coowner}>`)

            return message.channel.send(embed);
        } else if (args[0] === '--search') {
            if (!args[1]) return message.channel.send('You can\'t search with nothing!')
            let data = []
            await db.fetchEverything().forEach(obj => {
                if (obj.type === 'note' && obj.owner === message.author.id && obj.name.startsWith( args[1])) {
                    data.push("`" + obj.name + "`")
                }
            })

            if (!data.length >= 1) data.push('You have no notes starting with `' + args[1] + "`!")

            return message.channel.send(new MessageEmbed()
                .setTitle('Notes starting with `' + args[1] + '`')
                .setDescription(data.join(', '))
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        } else if (args[0] === '--coowned' && !args[1]) {
            let data = []
            let number = 1;
            await db.fetchEverything().forEach(obj => {
                if (obj.type === 'note' && obj.coowner === message.author.id) {
                    data.push(number + ". `" + obj.name + "`")
                    number += 1;
                }
            })

            if (!data.length >= 1) data.push('You don\'t co-own any notes!')

            return message.channel.send(new MessageEmbed()
                .setTitle('Your Co-Owned Notes')
                .setDescription(data.join(', '))
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        } else if (args[0] === '--coowned' && args[1]) {
            let obje;
            await db.fetchEverything().forEach(obj => {
                if (obj.type === 'note' && obj.coowner === message.author.id && obj.name === args[1].toLowerCase()) {
                    obje = obj;
                }
            })

            if (!obje) return message.channel.send('You don\'t co-own a note with that name!')

            return message.channel.send(new MessageEmbed()
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
                .setDescription(`\`\`\`\n${obje.value}\`\`\`\nMain Owner: <@${obje.owner}>\nCo-Owner: <@${obje.coowner}>`)
            );
        } else if (args[0] === '--reminder' && !args[1]) {
            let data = []
            let number = 1;
            await db.fetchEverything().forEach(obj => {
                if (obj.type === 'reminder' && obj.owner === message.author.id) {
                    data.push(number + ". `" + obj.name + "`")
                    number += 1;
                }
            })

            if (!data.length >= 1) data.push('You don\'t have any reminders!')

            return message.channel.send(new MessageEmbed()
                .setTitle('Your Reminders')
                .setDescription(data.join('\n'))
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        } else if (args[0] === '--reminder' && args[1]) {
            let obje = db.fetch(`remind_${message.author.id}_${args[1].toLowerCase()}`)

            if (!obje) return message.channel.send('You don\'t have a reminder with that name!')
            return message.channel.send(new MessageEmbed()
                .setTitle(`Reminder: \`${obje.name}\``)
                .setDescription(`I will remind you in:\`\`\`\n${pretty(obje.time - (Date.now() - obje.now))}\`\`\`\nLooped \`${obje.times}\` times`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        }
    }
}