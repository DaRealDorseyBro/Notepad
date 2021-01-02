const pretty = require('pretty-ms')
const {MessageEmbed} = require('discord.js')
module.exports = {
    name: "reminders",
    description: "View your reminders!",
    type: 'notes',
    cooldown: 2,
    usage: '[ name ]',
    async execute(client, message, args, db) {

        if (!args[0]) {
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
        } else if (args[0]) {
            let obje = db.fetch(`remind_${message.author.id}_${args[0].toLowerCase()}`)

            if (!obje) return message.channel.send('You don\'t have a reminder with that name!')
            return message.channel.send(new MessageEmbed()
                .setTitle(`Reminder: \`${obje.name}\``)
                .setDescription(`\`\`\`diff\n+ ${pretty(obje.time - (Date.now() - obje.now))} Time Left\`\`\`\nReminding \`${obje.times}\` times`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        }
    }
}