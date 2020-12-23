const Discord = require('discord.js')
const { stripIndents } = require("common-tags");
const { VultrexHaste } = require("vultrex.haste");
const haste = new VultrexHaste({ url: "https://hasteb.in" });
const fs = require('fs')
module.exports = {
    name: "evaluate",
    description: "Evaluate Code",
    type: 'creator',
    ownerOnly: true,
    aliases: ['eval', 'e'],
    cooldown: 2,
    usage: '< depth > < code >',
    async execute(client, message, args, db) {
        let evalArgs = args.slice(1).join(" ");
        let depth = args[0];
        if (isNaN(depth))
            return message.channel.send(
                "Please provide a number for the depth of the evaluation"
            );
        if (!args[1])
            return message.channel.send("Please provide code to evaluate!");
        if (evalArgs === "client.token")
            return message.channel.send(
                "```DWIHdaoidsjOIWDAWDiodwjdOJWA lol jk no```"
            );
        try {
            const start = process.hrtime();
            let output = eval(args.slice(1).join(" "));
            const difference = process.hrtime(start);
            if (typeof output !== "string") output = eval(output, { depth: depth });
            const hastelink =
                output.length > 1900 ? await haste.post(output) : output;
            const embed = new Discord.MessageEmbed();
            embed.setTitle("Evaluating <a:loading1:726722335075336263>");
            embed.setColor(client.bot.color);
            message.channel.send(embed).then((sentmsg) => {
                const embed1 = new Discord.MessageEmbed();
                embed1.setTitle(
                    `**Evaluated in ${difference[0] > 0 ? `${difference[0]}s` : ""}${
                        difference[1] / 1e6
                    }ms**`
                );
                embed1.setDescription(stripIndents`
                **Asked to evaluate:**\n\`\`\`javascript\n${evalArgs}\n\`\`\`\n**Evaluated:**\n\`\`\`javascript\n${hastelink}\n\`\`\``);
                embed1.setColor(client.bot.color);
                setTimeout(() => {
                    return sentmsg.edit(embed1);
                }, 100);
            });
        } catch (err) {
            const start = process.hrtime();
            const difference = process.hrtime(start);
            const embed2 = new Discord.MessageEmbed();
            embed2.setTitle(
                `**Evaluated in ${difference[0] > 0 ? `${difference[0]}s` : ""}${
                    difference[1] / 1e6
                }ms**`
            );
            embed2.setDescription(
                stripIndents`\n**Asked to evaluate:**\n\`\`\`javascript\n${evalArgs}\n\`\`\`\n**Error:**\n\`\`\`javascript\n${err}\n\`\`\``
            );
            embed2.setColor(0x38b6ff);
            return message.channel.send(embed2);
        }


    }
}