const {MessageEmbed} = require('discord.js')
const Discord = require('discord.js')
function domalildancydance(arr) {
    let kek = []
    let number = 0
    arr.forEach(a => {
        if (a === arr[0]) kek.push(arr[arr.length - 1])
        else kek.push(arr[number - 1])
        number += 1
    })
    return kek
}
async function collectEditedNote(message, db, obj, client, msg, copy) {
    let editedNoteFilter = (m) => m.author.id === message.author.id;
    let editedNoteCollector = message.channel.createMessageCollector(editedNoteFilter, {max: 1})

    editedNoteCollector.on('collect', async collected => {
        if (collected.content.length > 1000) {
            await message.channel.send('Please use a note that is less than 1000 characters!')
            return collectEditedNote(message, db, obj, client, msg, copy)
        }
        if (collected.mentions.members.size >= 1)  {
            await message.channel.send('Please do not add any mentions in the note!')
            return collectEditedNote(message, db, obj, client, msg, copy)
        }
        if (collected.content.includes('```')) {
            await message.channel.send('Please do note include \`\`\` in your note!')
            return collectEditedNote(message, db, obj, client, msg, copy)
        }
            await db.set(`${obj.owner}_${obj.name}`, {
                type: 'note',
                name: obj.name,
                value: collected.content,
                owner: obj.owner,
                coowner: obj.coowner,
                timeAdded: obj.timeAdded
            })
            if (message.guild.me.hasPermission('MANAGE_MESSAGES')) await collected.delete()
            copy.stop()
            return msg.edit(new MessageEmbed()
                .setTitle(`Edited \`${obj.name}\`!`)
                .setDescription(`\`\`\`diff\n${obj.value !== collected.content ? await client.bot.changes(obj.value, collected.content) : collected.content.split('\n').map(a => ' ' + a).join('\n')}\`\`\`\nMain Owner: <@${obj.owner}>`)
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
    usage: '[ owner mention ] < name> | --editname:< current name > < new name > | --editcoowner:< name > < mention | "none" >',
    async execute(client, message, args, db) {
        let flags = args.join(' ').parseFlags(1).flags
        let str = args.join(' ').parseFlags(1).str.split(' ')
        if (!flags.length) flags = 'no flags'
        if (!flags[0].startsWith('editname') && !flags[0].startsWith('editcoowner') && str[0]) {
            let owner = message.mentions.members.first()
            let name = str[1]
            if (!owner) {
                owner = message.member
                name = str[0]
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
                await msg.react('📱')

                let filter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === "✅";
                let yesCollector = msg.createReactionCollector(filter, {max: 1, time: 30000})
                let filter2 = (reaction, user) => user.id === message.author.id && reaction.emoji.name === "❌";
                let noCollector = msg.createReactionCollector(filter2, {max: 1, time: 30000})
                let copyFilter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === "📱";
                let copyCollector = msg.createReactionCollector(copyFilter, {max: 1, time: 30000})

                yesCollector.on('collect', async collected => {
                    await noCollector.stop()
                    await msg.edit(new MessageEmbed()
                        .setTitle(`Editing \`${obj.name}\`...`)
                        .setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\n\nSend the edited note in chat!`)
                        .setColor(client.bot.color)
                        .setTimestamp()
                        .setFooter(client.bot.footer)
                    );
                    return collectEditedNote(message, db, obj, client, msg, copyCollector)
                })
                noCollector.on('collect', async collected => {
                    await yesCollector.stop()
                    await copyCollector.stop()
                    return msg.edit(new MessageEmbed()
                        .setTitle(`Editing Canceled`)
                        .setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>`)
                        .setColor(client.bot.color)
                        .setTimestamp()
                        .setFooter(client.bot.footer)
                    )
                })
                copyCollector.on('collect', async collected => {

                    return message.channel.send(obj.value).then(mssg => {
                        setTimeout(() => {
                            mssg.delete()
                        }, 30000)
                    })
                })
            })
        } else if (!str[0]) {
            let array = [];
            let data = await db
                .fetchEverything()
                .filter(obj => obj.type === "note" && obj.owner === message.author.id || obj.type === "note" && obj.coowner === message.author.id)
                .map(t => array.push(t));
            data = array.sort((a,b) => a.timeAdded - b.timeAdded);
            let reactions = ["⏪", "◀️", "✅", "▶️", "⏩", "❌"];
            data = Array.from(
                {
                    length: Math.ceil(data.length)
                },
                (a, r) => data.slice(r, r + 1)
            );
            let pages = data.length,
                page = 0;
            data = data.map(e =>
                new Discord.MessageEmbed()
                    .setTitle("Choose a note to edit!")
                    .setDescription(`${e.map((a) => `\`${a.name}\`\n\`\`\`\n${a.value}\`\`\`\nMain Owner: <@${a.owner}>`).join('\n')}`)
                    .setColor(client.bot.color)
                    .setTimestamp(e.map((a) => `${a.name},${a.owner}`))
                    .setFooter(`${page}/${data.length - 1}`)
            );
            if (!data.length) return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Choose a note to edit!")
                .setDescription(`You have no notes!`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            )
            let arrayTwo = [];
            let dataTwo = await db
                .fetchEverything()
                .filter(obj => obj.type === "note" && obj.owner === message.author.id || obj.type === "note" && obj.coowner === message.author.id)
                .map(t => arrayTwo.push(t));
            dataTwo = arrayTwo.sort((a, b) => a.timeAdded - b.timeAdded);
            data.push(new Discord.MessageEmbed()
                .setTitle("Your Notepad")
                .setDescription(`${dataTwo.map((a, i) => `${i + 1}. \`${a.name}\``).join('\n')}`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(`Turn the page!`)
            )
            data = domalildancydance(data)
            let mainMessage = await message.channel.send(data[page]);
            await Promise.all(reactions.map(r => mainMessage.react(r)));
            let collector = mainMessage.createReactionCollector(
                (reaction, user) =>
                    reactions.some(e => e === reaction.emoji.name) &&
                    user.id === message.author.id
            );
            collector.on("collect", async (reaction, user) => {
                switch (reaction.emoji.name) {
                    case "⏪" :
                        page !== 0 ? page = 1 : page = 0
                        break;
                    case "◀️":
                        page === 0 ? (page = data.length - 1) : (page -= 1);
                        break;
                    case "✅":
                        let obj = await db.get(`${data[page].timestamp[0].split(',')[1]}_${data[page].timestamp[0].split(',')[0].toLowerCase()}`)
                        collector.stop()
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES')) await mainMessage.reactions.removeAll()
                        await mainMessage.react('📱')
                        let copyFilter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === "📱";
                        let copyCollector = mainMessage.createReactionCollector(copyFilter, {max: 1, time: 30000})
                            await mainMessage.edit(new MessageEmbed()
                                .setTitle(`Editing \`${obj.name}\`...`)
                                .setDescription(`\`\`\`\n${obj.value}\`\`\`\nMain Owner: <@${obj.owner}>\n\nSend the edited note in chat!`)
                                .setColor(client.bot.color)
                                .setTimestamp()
                                .setFooter(client.bot.footer)
                            );
                        copyCollector.on('collect', async collected => {

                            return message.channel.send(obj.value).then(mssg => {
                                setTimeout(() => {
                                    mssg.delete()
                                }, 30000)
                            })
                        })
                        return collectEditedNote(message, db, obj, client, mainMessage, copyCollector)
                        break;
                    case "▶️":
                        page === data.length - 1 ? (page = 0) : (page += 1);
                        break;
                    case "⏩":
                        page = data.length - 1;
                        break;
                    case "❌":
                        collector.stop()
                        await mainMessage.edit({
                            embed: data[page].setFooter(`Ended!`)
                        })
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES')) return mainMessage.reactions.removeAll()
                        else return;
                }
                if (data[page].footer.text === 'Turn the page!') await mainMessage.edit({
                    embed: data[page].setFooter('Turn the page!')
                })
                else await mainMessage.edit({
                    embed: data[page].setFooter(`${page}/${data.length - 1}`)
                })
            });
        } else if (flags[0].startsWith('editname')) {
            if (!args.join(' ').parseFlagsWithOptions(1).flags[0]) return message.channel.send('Please include the current name of the note as follows: ' + `\`--editnote:<name>\``)
            let newStr = args.join(' ').parseFlagsWithOptions(1).str.split(' ')
            let newFlags = args.join(' ').parseFlagsWithOptions(1).flags
            if (!newStr[0]) return message.channel.send('Please include the name you want to change it to!')

            let name = newFlags[0].option.toLowerCase()
            let newName = newStr[0].toLowerCase()

            if (name === '--search' || name === '--editname' || name === '--editcoowner') return message.channel.send('You can\'t have that as a name!')
            if (newName.length > 25) return message.channel.send('Please use a name that is less than 25 characters!')

            if (!await db.get(`${message.author.id}_${name}`)) return message.channel.send('You don\'t own a note with that name!')
            if (await db.get(`${message.author.id}_${newName}`)) return message.channel.send('You already own a note with that name!')

            let obj = await db.get(`${message.author.id}_${name}`)

            await (db.delete(`${message.author.id}_${name}`))

            await db.set(`${message.author.id}_${newName}`, {
                type: obj.type,
                name: newName,
                value: obj.value,
                owner: obj.owner,
                coowner: obj.coowner,
                timeAdded: obj.timeAdded
            })

            return message.channel.send(new MessageEmbed()
                .setTitle(`New Name For: \`${name}\``)
                .setDescription(`\`\`\`diff\n${await client.bot.changes(name, newName)}\`\`\``)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            );
        } else if (flags[0].startsWith('editcoowner')) {
            let cowner;
            let newStr = args.join(' ').parseFlagsWithOptions(1).str.split(' ')
            let newFlags = args.join(' ').parseFlagsWithOptions(1).flags
            if (!newFlags[0].option) return message.channel.send('Please specify a note to set the co-owner of!')
            if (!await db.get(`${message.author.id}_${newFlags[0].option.toLowerCase()}`)) return message.channel.send("You don't own a note with that name!")
            if (message.mentions.members.first()) cowner = message.mentions.members.first().id
            if (newStr[0] === 'none' || !message.mentions.members.first()) cowner = '`No One`'

            if (message.mentions.members.first()) {
                if (cowner !== '`No One`' && message.mentions.members.first().bot) return message.channel.send('You can\'t add a bot as a co-owner!')
                if (cowner !== '`No One`' && message.mentions.members.first().id === message.author.id) return message.channel.send('You can\'t add yourself as a co-owner!')
            }

            let ownedNum = 0;
            await db.fetchEverything().forEach(obj => {
                if (obj.coowner !== '`No One`' && obj.value !== 'reminder' && obj.coowner === cowner) ownedNum += 1
            })

            if (ownedNum >= 50) return message.channel.send('They already have over 50 notes, please ask them to delete some and then try again!')


            let obj = await db.get(`${message.author.id}_${newFlags[0].option.toLowerCase()}`)
            await db.set(`${message.author.id}_${newFlags[0].option.toLowerCase()}`, {name: obj.name, type: obj.type, value: obj.value, owner: obj.owner, coowner: cowner, timeAdded: obj.timeAdded})
            let embed = new MessageEmbed()
                .setTitle('Set Co-Owner Of: `' + newFlags[0].option.toLowerCase() + '`')
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            if (cowner === '`No One`') embed.setDescription(`New Co-Owner: ${cowner}`)
            if (cowner !== '`No One`') embed.setDescription(`New Co-Owner: <@${cowner}>`)
            return message.channel.send(embed)
        }
    }
}