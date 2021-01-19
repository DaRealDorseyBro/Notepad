const {MessageEmbed} = require('discord.js')
let pretty = require('pretty-ms')
const dhms = require('dhms')
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
    name: "editreminder",
    description: "Edit Reminders!",
    type: 'notes',
    cooldown: 5,
    usage: '< name > < time >',
    async execute(client, message, args, db) {
        if (args[0]) {
            let name = args[0].toLowerCase()
            let time = dhms(args.slice(1).join(' ').toLowerCase())
            let reminder = await db.get(`remind_${message.author.id}_${name}`)

            if (time > 2073600000) return message.channel.send('Please use a time that\'s under `24` days!')
            if (time <= 1000) return message.channel.send('Please use a time greater than 1 second!')

            if (!reminder) return message.channel.send('You don\'t have a reminder with that name!')
            await db.set(`remind_${message.author.id}_${name}`, {
                type: reminder.type,
                trueOwner: reminder.trueOwner,
                channel: reminder.channel,
                owner: reminder.owner,
                name: reminder.name,
                time: time,
                now: Date.now(),
                times: reminder.times
            })
            await clearTimeout(client.reminders.get(`${message.author.id}_${reminder.name}`))
            await client.reminders.delete(`${message.author.id}_${reminder.name}`)
            console.log(client.reminders.get(`${message.author.id}_${reminder.name}`))
            await message.channel.send(new MessageEmbed()
                .setTitle('Edited Reminder: `' + name + '`')
                .setDescription(`\`\`\`diff\n- | ${pretty(reminder.time - (Date.now() - reminder.now))} Left\n+ | ${pretty(time)} Left\`\`\``)
                .setColor(client.bot.color)
                .setTimestamp(Date.now() + time)
                .setFooter(client.bot.footer)
            );
            return require('../../index').setReminders(await db.get(`remind_${message.author.id}_${name}`))
        } else if (!args[0]) {
            let array = [];
            let data = await db
                .fetchEverything()
                .filter(obj => obj.type === "reminder" && obj.owner === message.author.id)
                .map(t => array.push(t));
            data = array.sort((a, b) => a.now - b.now);
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
                    .setTitle(`Choose a reminder to edit: \`${e.map(a => a.name)}\``)
                    .setDescription(`${e.map((a) => `\`\`\`\n${pretty(a.time - (Date.now() - a.now))}\`\`\``).join('\n')}`)
                    .setColor(client.bot.color)
                    .setTimestamp(e.map((a) => `${a.name}`))
                    .setFooter(`${page}/${data.length - 1}`)
            );
            if (!data.length) return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Your Reminders")
                .setDescription(`You have no reminders!`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            )
            let arrayTwo = [];
            let dataTwo = await db
                .fetchEverything()
                .filter(obj => obj.type === "reminder" && obj.owner === message.author.id)
                .map(t => arrayTwo.push(t));
            dataTwo = arrayTwo.sort((a, b) => a.now - b.now);
            data.push(new Discord.MessageEmbed()
                .setTitle("Your Reminders")
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
                        if (data[page].footer !== `Turn the page!`) {
                            let obj = await db.get(`remind_${message.author.id}_${data[page].timestamp[0].split(' ')[0]}`)
                            if (!obj) return message.channel.send('That reminder already went off!')
                            collector.stop()
                            if (message.guild.me.hasPermission('MANAGE_MESSAGES')) await mainMessage.reactions.removeAll()
                            await mainMessage.edit(new MessageEmbed()
                                .setTitle(`Editing Reminder \`${obj.name}\`...`)
                                .setDescription(`\`\`\`\n${pretty(obj.time - (Date.now() - obj.now))}\`\`\`\nSend the new time in chat!`)
                                .setColor(client.bot.color)
                                .setTimestamp()
                                .setFooter(client.bot.footer)
                            );
                            return collectReminderEdits()
                        }
                        function collectReminderEdits() {
                            let editedNoteFilter = (m) => m.author.id === message.author.id;
                            let editedNoteCollector = message.channel.createMessageCollector(editedNoteFilter, {max: 1})

                            editedNoteCollector.on('collect', async collected => {
                                if (!await db.get(`remind_${message.author.id}_${data[page].timestamp[0].split(' ')[0]}`)) return message.channel.send('That reminder already went off!')
                                let time = dhms(collected.content.toLowerCase())

                                if (time > 2073600000) return message.channel.send('Please use a time that\'s under `24` days!')
                                if (time <= 1000) return message.channel.send('Please use a time greater than 1 second!')

                                await db.set(`remind_${message.author.id}_${obj.name}`, {
                                    type: obj.type,
                                    trueOwner: obj.trueOwner,
                                    channel: obj.channel,
                                    owner: obj.owner,
                                    name: obj.name,
                                    time: time,
                                    now: Date.now(),
                                    times: obj.times
                                })
                                await clearTimeout(client.reminders.get(`${message.author.id}_${obj.name}`))
                                await client.reminders.delete(`${message.author.id}_${obj.name}`)
                                await mainMessage.edit(new MessageEmbed()
                                    .setTitle('Edited Reminder: `' + name + '`')
                                    .setDescription(`\`\`\`diff\n- | ${pretty(obj.time - (Date.now() - obj.now))} Left\n+ | ${pretty(time)} Left\`\`\``)
                                    .setColor(client.bot.color)
                                    .setTimestamp(Date.now() + time)
                                    .setFooter(client.bot.footer)
                                );
                                return require('../../index').setReminders(await db.get(`remind_${message.author.id}_${name}`))
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