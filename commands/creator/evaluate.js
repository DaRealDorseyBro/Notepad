const Discord = require("discord.js");
module.exports = {
<<<<<<< HEAD
    name: "evaluate",
    description: "Evaluate Code",
    type: 'creator',
    ownerOnly: true,
    aliases: ['eval', 'e'],
    cooldown: 0,
    usage: '< depth > < code >',
    async execute(client, message, args, db, bldb, afkdb) {
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

=======
  name: "evaluate",
  description: "Evaluate Code",
  type: "creator",
  ownerOnly: true,
  aliases: ["eval", "e"],
  cooldown: 0,
  usage: "< code >",
  async execute(client, message, args, db) {
    function clean(text) {
      if (typeof text === "string")
        return text
          .replace(/`​​/g, "`​​" + String.fromCharCode(8203))
          .replace(/@​​​/g, "@​​​" + String.fromCharCode(8203));
      else return text;
    }
    const stringToolsRequire = require("string-toolkit");
    let stringTools = new stringToolsRequire();
    let code = args[0];
    if (!code)
      return message.channel.send(
        "No code was provided please rerun the command and provide code"
      );
    try {
      code = args.join(" ");
      let evaled = eval(code.replace(/```js/g, "").replace(/```/g, ""));
      let regex = new RegExp(`${client.token}`, "g");
      evaled = evaled.replace(regex, "#".repeat(client.token.length));
      if (evaled instanceof Promise) evaled = await evaled;
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled);
      evaled = stringTools.toChunks(evaled, 1000);
      let pages = evaled;
      let page = 1;
      const embed = new Discord.MessageEmbed()
        .setColor(client.bot.color)
        .setFooter(`Page ${page}/${pages.length}`)
        .setDescription(`\`\`\`js\n${pages[page - 1]}\`\`\``)
        .addField("Type of", `\`\`\`css\n${typeof evaled}\`\`\``)
        .addField("Length", `\`\`\`css\n${evaled.length} character(s)\`\`\``)
        .addField(
          "Time:",
          `\`\`\`css\n${Date.now() - message.createdTimestamp} ms\`\`\``
        )
>>>>>>> b17ef9f2fffb3375f4f52352f72d890086a45dfd

        .setFooter(`Page ${page} of ${pages.length}`);
      message.channel.send(embed).then(async msg => {
        msg.deleteReact(message);
        let reactions = ["◀️", "⏪", "⏩", "▶️"];
        await Promise.all(reactions.map(r => msg.react(r)));
        const backwardsFilter = (reaction, user) =>
          user.id === message.author.id;
        const backwards = msg.createReactionCollector(backwardsFilter, {
          time: 60000
        });
        backwards.on("collect", r => {
          switch (r.emoji.name) {
            case "⏪":
              page = 1;
              break;
            case "⏩":
              page = pages.length;
              break;
            case "◀️":
              if (page === 1) {
                page = pages.length;
              } else {
                page--;
              }
              break;
            case "▶️":
              if (page === pages.length) {
                page = 1;
              } else {
                page++;
              }
              break;
          }
          embed.setDescription(`\`\`\`js\n ${pages[page - 1]} \`\`\``);
          embed.setFooter(`Page ${page}/${pages.length}`);
          msg.edit(embed);
        });
      });
    } catch (err) {
      const embed = new Discord.MessageEmbed()
        .setColor(client.bot.color)
        .setTitle(":x: Error")
        .setDescription(`\`\`\`js\n ${err.message}\`\`\``)
        .setFooter(client.bot.footer);
      message.channel.send(embed);
    }
  }
};
