const {MessageEmbed} = require('discord.js')
async function collectEditedNote(message, db, obj, client, msg) {
    let editedNoteFilter = (m) => m.author.id === message.author.id;
    let editedNoteCollector = message.channel.createMessageCollector(editedNoteFilter, {max: 1})

    editedNoteCollector.on('collect', async collected => {
        if (collected.content.length > 1000) {
            await message.channel.send('Please use a note that is less than 1000 characters!')
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
    usage: '[ owner mention ] < name> | "--name" < current name > < new name > | "--coowner" < name > < mention | "none" >',
    async execute(client, message, args, db) {

        if (args[0] !== '--name' && args[0] !== '--coowner') {
            // let errored = false;
            let owner = message.mentions.members.first()
            let name = args[1]
            if (!owner) {
                owner = message.member
                name = args[0]
            }
            if (!name) return message.channel.send('Please include the name of the note!')

            if (!await db.get(`${owner.id}_${name.toLowerCase()}`)) return message.channel.send("You don't own a note with that name (If you are a co-owner, ping the main owner)!")
            if (await db.get(`${owner.id}_${name.toLowerCase()}`).coowner !== message.author.id && await db.get(`${owner.id}_${name.toLowerCase()}`).owner !== message.author.id) return message.channel.send('You aren\'t a owner/co-owner of that note!')

            let obj = await db.get(`${owner.id}_${name.toLowerCase()}`)

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

            if (name === '--search' || name === '--name' || name === '--coowner') return message.channel.send('You can\'t have that as a name!')
            if (name.length > 25) return message.channel.send('Please use a name that is less than 25 characters!')

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
        } else if (args[0] === '--coowner') {
            let cowner;
            if (!args[0]) return message.channel.send('Please specify a note to set the co-owner of!')
            if (!await db.get(`${message.author.id}_${args[1].toLowerCase()}`)) return message.channel.send("You don't own a note with that name!")
            if (message.mentions.members.first()) cowner = message.mentions.members.first().id
            if (args[1] === 'none' || !message.mentions.members.first()) cowner = '`No One`'

            if (message.mentions.members.first()) {
                if (cowner !== '`No One`' && message.mentions.members.first().bot) return message.channel.send('You can\'t add a bot as a co-owner!')
                if (cowner !== '`No One`' && message.mentions.members.first().id === message.author.id) return message.channel.send('You can\'t add yourself as a co-owner!')
            }

            let ownedNum = 0;
            await db.fetchEverything().forEach(obj => {
                if (obj.coowner !== '`No One`' && obj.value !== 'reminder' && obj.coowner === cowner) ownedNum += 1
            })

            if (ownedNum >= 10) return message.channel.send('They already have over 10 (Will change to 50) notes, please ask them to delete some and then try again!')


            let obj = await db.get(`${message.author.id}_${args[1].toLowerCase()}`)
            await db.set(`${message.author.id}_${args[1].toLowerCase()}`, {name: obj.name, type: obj.type, value: obj.value, owner: obj.owner, coowner: cowner})
            let embed = new MessageEmbed()
                .setTitle('Set Co-Owner Of: `' + args[1].toLowerCase() + '`')
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            if (cowner === '`No One`') embed.setDescription(`New Co-Owner: ${cowner}`)
            if (cowner !== '`No One`') embed.setDescription(`New Co-Owner: <@${cowner}>`)
            return message.channel.send(embed)
        }
    }
}