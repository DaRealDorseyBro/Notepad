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
    name: "coowned",
    description: "View your co-owned notes!",
    type: 'notes',
    aliases: ['coowner'],
    cooldown: 2,
    usage: '[ name ]',
    async execute(client, message, args, db) {
        if (!args[0]) {
            let array = [];
            let data = await db
                .fetchEverything()
                .filter(obj => obj.type === "note" && obj.coowner === message.author.id)
                .map(t => array.push(t));
            data = array.sort((a, b) => a.timeAdded - b.timeAdded);
            let reactions = ["⏪", "◀️", "❌", "▶️", "⏩"];
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
                    .setTitle("Your Co-Owned Notes")
                    .setDescription(`${e.map((a, i) => `\`\`\`diff\n${a.value
                        .split("\n")
                        .map((arr, i) => `${i + 1} | ${arr}`)
                        .join("\n")}\`\`\`\nMain Owner: <@${a.owner}>\nCo-Owner: ${
                        a.coowner === '`No One`' ? a.coowner : `<@${a.coowner}>`
                    }`).join('\n')}`)
                    .setColor(client.bot.color)
                    .setTimestamp()
                    .setFooter(`${page}/${data.length - 1}`)
            );
            if (!data.length) return message.channel.send(new Discord.MessageEmbed()
                .setTitle("Your Co-Owned Notes")
                .setDescription(`You have no co-owned notes!`)
                .setColor(client.bot.color)
                .setTimestamp()
                .setFooter(client.bot.footer)
            )
            let arrayTwo = [];
            let dataTwo = await db
                .fetchEverything()
                .filter(obj => obj.type === "note" && obj.coowner === message.author.id)
                .map(t => arrayTwo.push(t));
            dataTwo = arrayTwo.sort((a, b) => a.timeAdded - b.timeAdded);
            data.push(new Discord.MessageEmbed()
                .setTitle("Your Co-Owned Notes")
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
                    case "❌":
                        collector.stop()
                        await mainMessage.edit({
                            embed: data[page].setFooter(`Ended!`)
                        })
                        if (message.guild.me.hasPermission('MANAGE_MESSAGES')) return mainMessage.reactions.removeAll()
                        else return;
                        break;
                    case "▶️":
                        page === data.length - 1 ? (page = 1) : (page += 1);
                        break;
                    case "⏩":
                        page = data.length - 1;
                }
                if (data[page].footer.text === 'Turn the page!') await mainMessage.edit({
                    embed: data[page].setFooter('Turn the page!')
                })
                else await mainMessage.edit({
                    embed: data[page].setFooter(`${page}/${data.length - 1}`)
                })
            });
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