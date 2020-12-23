const Discord = require("discord.js");
const config = require("../../config.json");
const fs = require('fs')
let name, category;

module.exports = {
    name: "reload",
    description: "Reload Commands",
    type: "creator",
    aliases: ["r"],
    cooldown: 0,
    ownerOnly: true,
    usage: "< category > < command name >",
    async execute(client, message, args) {
        const { commands } = message.client;
        let categories = ['other', 'notes', 'creator']

            if (!args.length) return message.channel.send("Please provide a category and a command to reload!");

            if (args[1]) name = args[1].toLowerCase();
            if (args[0]) category = args[0].toLowerCase();
            const command = commands.get(name) || commands.find((c) => c.aliases && c.aliases.includes(name));
            if (!command && args[1] && categories.includes(category)) {
                return message.channel.send('That command doesn\'t exist!')
            }
            if (command && args[1] && !categories.includes(category)) {
                return message.channel.send('That category doesn\'t exist!')
            }
            if (!command && args[1] && !categories.includes(category)) {
                return message.channel.send('That category and command don\'t exist!')
            }
            if (!categories.includes(category)) {
                return message.channel.send('That category doesn\'t exist!')
            }


            if (args[1] && categories.includes(category)) {
                try {
                    delete require.cache[require.resolve(`../${category}/${command.name}.js`)];
                    client.commands.delete(command.name);
                    const pull = require(`../${category}/${command.name}.js`);
                    client.commands.set(command.name, pull);
                } catch (error) {
                    return message.channel.send(
                        `Could not reload \`${args[1].toUpperCase()}.JS\`: \`${error}\``
                    );
                }

                message.channel.send(
                    `Reloaded \`${command.name.toUpperCase()}.JS\``
                );
            } else if (!args[1] && categories.includes(category)) {
                let data = []
                await fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js')).forEach(cmdname => {
                    try {
                        delete require.cache[require.resolve(`../${category}/${cmdname}`)];
                        client.commands.delete(require(`../${category}/${cmdname}`).name);
                        const pull = require(`../${category}/${cmdname}`);
                        client.commands.set(require(`../${category}/${cmdname}`).name, pull);
                        data.push(`Reloaded \`${cmdname.toUpperCase()}\``)
                    } catch (error) {
                        data.push(`Could not reload \`${cmdname.toUpperCase()}\`: \`${error}\``);
                    }

                })
                return message.channel.send(`${data.join('\n')}`)
            }
        }
};
