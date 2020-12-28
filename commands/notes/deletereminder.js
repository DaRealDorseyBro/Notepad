const {MessageEmbed} = require('discord.js')
let pretty = require('pretty-ms')
const dhms = require('dhms')
module.exports = {
    name: "deletereminder",
    description: "Delete Reminders!",
    type: 'notes',
    cooldown: 5,
    usage: '< name >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please add the name of the note!')

        let name = args[0].toLowerCase()
        let reminder = await db.get(`remind_${message.author.id}_${name}`)

        if (!reminder) return message.channel.send('You don\'t have a reminder with that name!')

        message.channel.send(new MessageEmbed()
            .setTitle('Deleting Reminder `' + name + '`...')
            .setDescription(`\`\`\`${reminder.time} Time Left\`\`\`\n\nAre you sure you want to delete it?`)
            .setColor(client.bot.color)
            .setTimestamp()
            .setFooter(client.bot.footer)
        ).then(async msg => {
            await msg.react('✅')
            await msg.react('❌')

            let filter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === "✅";
            let yesCollector = msg.createReactionCollector(filter, {max: 1, time: 30000})
            let filter2 = (reaction, user) => user.id === message.author.id && reaction.emoji.name === "❌";
            let noCollector = msg.createReactionCollector(filter2, {max: 1, time: 30000})

            noCollector.on('collect', async collected => {
                await yesCollector.stop()
                return message.channel.send('Deleting Canceled!')
            })

            yesCollector.on('collect', async collected => {
                await noCollector.stop()
                await db.delete(`remind_${message.author.id}_${name}`)
                return msg.edit(new MessageEmbed()
                    .setTitle('Deleted Reminder `' + name + '`')
                    .setDescription(`\`\`\`diff\n- | ${name}\`\`\``)
                    .setColor(client.bot.color)
                    .setTimestamp()
                    .setFooter(client.bot.footer)
                )
            })
        })
    }
}