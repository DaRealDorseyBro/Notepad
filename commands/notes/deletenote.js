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
module.exports = {
    name: "deletenote",
    description: "Delete Notes!",
    type: 'notes',
    aliases: ['delete'],
    cooldown: 3,
    usage: '< name >',
    async execute(client, message, args, db) {
        if (args[0]) {
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
        } else {
            let array = [];
            let data = await db
                .fetchEverything()
                .filter(obj => obj.type === "note" && obj.owner === message.author.id)
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
                    .setTitle("Choose a note to delete!")
                    .setDescription(`${e.map((a) => `\`${a.name}\`\n\`\`\`\n${a.value}\`\`\``).join('\n')}`)
                    .setColor(client.bot.color)
                    .setTimestamp(e.map((a) => `${a.name},${a.value}`))
                    .setFooter(`${page}/${data.length}`)
            );
            if (!data.length) return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Choose a note to delete!")
                .setDescription(`You have no notes!`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            )
            let arrayTwo = [];
            let dataTwo = await db
                .fetchEverything()
                .filter(obj => obj.type === "note" && obj.owner === message.author.id)
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
                        if (data[page].title === 'Choose a note to delete!') {
                            await db.delete(`${message.author.id}_${data[page].timestamp[0].split(',')[0]}`)
                            if (await db.get(`remind_${message.author.id}_${data[page].timestamp[0].split(',')[0]}`)) await db.delete(`remind_${message.author.id}_${data[page].timestamp[0].split(',')[0]}`)
                            let value = data[page].timestamp[0].split(',')[1]
                            mainMessage.edit({
                                embed: data[page].setTitle('Deleted Note: ' + data[page].timestamp[0].split(',')[0]).setTimestamp().setDescription(`\`\`\`diff\n${await client.bot.changes(value, '')}\`\`\``)
                            })
                        }
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
            }
        }
    }
