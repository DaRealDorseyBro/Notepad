const {MessageEmbed} = require('discord.js')
async function collectEditedNote(message, db, obj, client, msg) {
    let editedNoteFilter = (m) => m.author.id === message.author.id;
    let editedNoteCollector = message.channel.createMessageCollector(editedNoteFilter, {max: 1})

    editedNoteCollector.on('collect', async collected => {
        if (collected.content.length > 500) {
            await message.channel.send('Please use a note that is less than 500 characters!')
            return collectEditedNote(message, db, obj, client, msg)
        }
        if (collected.mentions.members.size >= 1)  {
            await message.channel.send('Please do not add any mentions in the note!')
            return collectEditedNote(message, db, obj, client, msg)
        }
        if (collected.content.includes('```')) {
            await message.channel.send('Please do note include \`\`\` in your note!')
            return collectEditedNote(message, db, obj, client, msg)
        }
            await db.set(`${obj.owner}_${obj.name}`, {
                type: 'note',
                name: obj.name,
                value: collected.content,
                owner: obj.owner,
                coowner: obj.coowner
            })
            if (message.guild.me.hasPermission('MANAGE_MESSAGES')) await collected.delete()
            return msg.edit(new MessageEmbed()
                .setTitle(`Edited \`${obj.name}\`!`)
                .setDescription(`\`\`\`diff\n${await client.bot.changes(obj.value, collected.content)}\`\`\`\nMain Owner: <@${obj.owner}>`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );

    })

}

module.exports = {
    name: "editnote",
    description: "Edit Notes!",
    type: 'notes',
    aliases: ['edit'],
    cooldown: 5,
    usage: '{ [ owner mention ] < name > } | { --name < current name > < new name > }',
    async execute(client, message, args, db) {

        if (args[0] !== '--name') {
            // let errored = false;
            let owner = message.mentions.members.first() // || await message.guild.members.fetch(args[0]).catch(e => { errored = true; })
            let name = args[1]
            if (!owner) {
                owner = message.member
                name = args[0]
            }
            if (!name) return message.channel.send('Please include the name of the note!')

            // if (errored === true) return message.channel.send('Please mention the valid main owner of the note!')

            if (!await db.get(`${owner.id}_${name.toLowerCase()}`)) return message.channel.send("You don't own a note with that name (If you are a co-owner, ping the main owner)!")
            if (await db.get(`${owner.id}_${name.toLowerCase()}`).coowner !== message.author.id && await db.get(`${owner.id}_${name.toLowerCase()}`).owner !== message.author.id) return message.channel.send('You aren\'t a owner/co-owner of that note!')

            let obj = await db.get(`${owner.id}_${name.toLowerCase()}`)

            message.channel.send(new MessageEmbed()
                .setDescription(`\`\`\`${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\n\nWould you like to edit it?`)
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
                        .setDescription(`\`\`\`${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\n\nSend the edited note in chat!`)
                        .setColor(client.bot.color)
                        .setTimestamp()
                        .setFooter(client.bot.footer)
                    );
                    return collectEditedNote(message, db, obj, client, msg)
                })
                noCollector.on('collect', async collected => {
                    await yesCollector.stop()
                    return message.channel.send('Editing Canceled!')
                })
            })
        } else if (args[0] === '--name') {
            if (!args[1]) return message.channel.send('Please include the name of the note!')
            if (!args[1]) return message.channel.send('Please include the name you want to change it to!')

            let name = args[1].toLowerCase()
            let newName = args[2].toLowerCase()

            if (!await db.get(`${message.author.id}_${name}`)) return message.channel.send('You don\'t own a note with that name!')
            if (await db.get(`${message.author.id}_${newName}`)) return message.channel.send('You already own a note with that name!')

            let obj = await db.get(`${message.author.id}_${name}`)

            await (db.delete(`${message.author.id}_${name}`))

            await db.set(`${message.author.id}_${newName}`, {
                type: obj.type,
                name: newName,
                value: obj.value,
                owner: obj.owner,
                coowner: obj.coowner
            })

            return message.channel.send(new MessageEmbed()
                .setTitle(`New Name For: \`${name}\``)
                .setDescription(`\`\`\`diff\n${await client.bot.changes(name, newName)}\`\`\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        }
    }
}