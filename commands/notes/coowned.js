const {MessageEmbed} = require('discord.js')
module.exports = {
    name: "coowned",
    description: "View your co-owned notes!",
    type: 'notes',
    cooldown: 2,
    usage: '[ name ]',
    async execute(client, message, args, db) {
        if (!args[0]) {
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
        } else if (args[0]) {
            let obje;
            await db.fetchEverything().forEach(obj => {
                if (obj.type === 'note' && obj.coowner === message.author.id && obj.name === args[0].toLowerCase()) {
                    obje = obj;
                }
            })

            if (!obje) return message.channel.send('You don\'t co-own a note with that name!')

            return message.channel.send(new MessageEmbed()
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
                .setDescription(`\`\`\`diff\n${obje.value.split('\n').map((arr, i) => `${i + 1} | ${arr}`).join('\n')}\`\`\`\nMain Owner: <@${obje.owner}>\nCo-Owner: <@${obje.coowner}>`)
            );
        }
    }
}