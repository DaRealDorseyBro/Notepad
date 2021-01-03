const Discord = require("discord.js");
module.exports = {
  name: "evaluate",
  description: "Evaluate Code",
  type: "creator",
  ownerOnly: true,
  aliases: ["eval", "e"],
  cooldown: 0,
  usage: "< code >",
  async execute(client, message, args, db, bldb, afkdb) {
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
      if(typeof evaled === "string") evaled = evaled.replace(regex, "#".repeat(client.token.length));
      if (evaled instanceof Promise) evaled = await evaled;
      if (typeof evaled !== "string") evaled = require("util").inspect(evaled, {depth: 5});
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
        .setFooter(`Page ${page} of ${pages.length}`);
      message.channel.send(embed).then(async msg => {
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
