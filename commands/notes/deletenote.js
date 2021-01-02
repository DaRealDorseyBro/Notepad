const {MessageEmbed} = require('discord.js')
module.exports = {
    name: "deletenote",
    description: "Delete Notes!",
    type: 'notes',
    aliases: ['delete'],
    cooldown: 3,
    usage: '< name >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please specify a note to delete!')
        if (!await db.get(`${message.author.id}_${args[0].toLowerCase()}`)) return message.channel.send("You don't own a note with that name!")
        let obj = await db.get(`${message.author.id}_${args[0].toLowerCase()}`)

        message.channel.send(new MessageEmbed()
            .setTitle('Deleting Note `' + args[0].toLowerCase() + '`...')
            .setDescription(`\`\`\`diff\n${obj.value.split('\n').map((arr, i) => `${i + 1} | ${arr}`).join(' ')}\`\`\`\n\nAre you sure you want to delete it?`)
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
                await db.delete(`${message.author.id}_${args[0].toLowerCase()}`)
                if (await db.get(`remind_${message.author.id}_${args[0].toLowerCase()}`)) await db.delete(`remind_${message.author.id}_${args[0].toLowerCase()}`)
                return msg.edit(new MessageEmbed()
                    .setTitle('Deleted Note: `' + args[0].toLowerCase() + '`')
                    .setDescription(`\`\`\`diff\n${await client.bot.changes(obj.value, '')}\`\`\``)
                    .setColor(client.bot.color)
                    .setTimestamp()
                    .setFooter(client.bot.footer)
                    )
                })
           })
        }
    }