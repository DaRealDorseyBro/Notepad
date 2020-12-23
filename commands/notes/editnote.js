const {MessageEmbed} = require('discord.js')

async function collectEditedNote(message, db, obj, client) {
    let editedNoteFilter = (m) => m.author.id === message.author.id;
    let editedNoteCollector = message.channel.createMessageCollector(editedNoteFilter, {max: 1})

    editedNoteCollector.on('collect', async collected => {
        if (collected.content.length > 250) {
            await message.channel.send('Please use a note that is less than 250 characters!')
            return this(message, db, obj)
        } else {
            await db.set(`${obj.owner}_${obj.name}`, {
                name: obj.name,
                value: collected.content,
                owner: obj.owner,
                coowner: message.author.id
            })
            return message.channel.send(new MessageEmbed()
                .setTitle(`Edited \`${obj.name}\`!`)
                .setDescription(`\`\`\`\n${collected.content}\`\`\`\nMain Owner: <@${obj.owner}>`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        }
    })

}

module.exports = {
    name: "editnote",
    description: "Edit Notes!",
    type: 'notes',
    aliases: ['edit'],
    cooldown: 5,
    usage: '< owner mention | owner id > < name >',
    async execute(client, message, args, db) {
        if (!args[0]) return message.channel.send('Please include the owner of the note!')
        else if (!args[1]) return message.channel.send('Please include the name of the note!')
        let owner = message.mentions.members.first() || await message.guild.members.fetch(args[0])
        if (!owner) return message.channel.send('Please mention the main owner of the note!')

        if (!await db.get(`${owner.id}_${args[1].toLowerCase()}`)) return message.channel.send("There isn't a note with that name and main owner!")
        if (await db.get(`${owner.id}_${args[1].toLowerCase()}`).coowner !== message.author.id) return message.channel.send('You aren\'t a co-owner of that note!')

        let obj = await db.get(`${owner.id}_${args[1].toLowerCase()}`)

        message.channel.send(new MessageEmbed()
            .setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\n\nWould you like to edit it?`)
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

            yesCollector.on('collect', async collected => {
                await noCollector.stop()
                await msg.edit(new MessageEmbed()
                    .setTitle(`Editing \`${obj.name}\`...`)
                    .setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\n\nSend the edited note in chat!`)
                    .setColor(client.bot.color)
                    .setTimestamp()
                    .setFooter(client.bot.footer)
                );
                return collectEditedNote(message, db, obj, client)
            })
            noCollector.on('collect', async collected => {
                await yesCollector.stop()
                return message.channel.send('Editing Canceled!')
            })
        })
    }
}