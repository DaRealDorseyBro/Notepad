const { MessageEmbed } = require("discord.js");
module.exports = {
  name: "notepad",
  description: "View your notes!",
  type: "notes",
  aliases: ["pad", "notes"],
  cooldown: 2,
  usage: "[name] | [ --search ] < text >",
  async execute(client, message, args, db) {
    if (!args[0]) {
      let array = [];
      let data = await db
        .fetchEverything()
        .filter(obj => obj.type === "note" && obj.owner === message.author.id)
        .map(t => array.push(t));
      data = array;
      let reactions = ["◀️", "❎", "▶️"];
      data = Array.from(
        {
          length: Math.ceil(data.length / 5)
        },
        (a, r) => data.slice(r * 5, r * 5 + 5)
      );
      let pages = Math.ceil(data.length / 5),
        page = 0;
      data = data.map(e =>
        new Discord.MessageEmbed()
          .setTitle("Your Notepad")
          .setDescription(`${data.indexOf(e)}. ${e.name}`)
          .setColor(client.bot.color)
          .setTimestamp()
          .setFooter(`${page + 1}/${data.length}`)
      );
      let mainMessage = await message.channel.send(data[page]);
      await Promise.all(reactions.map(r => mainMessage.react(r)));
      let collector = mainMessage.createReactionCollector(
        (reaction, user) =>
          reactions.some(e => e === reaction.emoji.name) &&
          user.id === message.author.id
      );
      collector.on("collect", async (reaction, user) => {
        switch (reaction.emoji.name) {
          case "◀️":
            page === 0 ? (page = data.length - 1) : (page -= 1);
            break;
          case "❎":
            collector.stop();
            break;
          case "▶️":
            page === data.length - 1 ? (page = 1) : (page += 1);
            break;
        }
        await mainMessage.edit({
          embed: data[page]
        });
      });
    } else if (
      args[0] !== "--search" &&
      args[0] !== "--coowned" &&
      args[0] !== "--reminder"
    ) {
      let obj = await db.fetch(`${message.author.id}_${args[0].toLowerCase()}`);
      if (!obj)
        return message.channel.send("You don't have a note with that name!");

      let embed = new MessageEmbed()
        .setColor(client.bot.color)
        .setTimestamp()
        .setFooter(client.bot.footer);
      if (obj.coowner === "`No One`")
        embed.setDescription(
          `\`\`\`diff\n${obj.value
            .split("\n")
            .map((arr, i) => `${i + 1} | ${arr}`)
            .join("\n")}\`\`\`\nMain Owner: <@${obj.owner}>\nCo-Owner: ${
            obj.coowner
          }`
        );
      if (obj.coowner !== "`No One`")
        embed.setDescription(
          `\`\`\`diff\n${obj.value
            .split("\n")
            .map((arr, i) => `${i + 1} | ${arr}`)
            .join("\n")}\`\`\`\nMain Owner: <@${obj.owner}>\nCo-Owner: <@${
            obj.coowner
          }>`
        );

      return message.channel.send(embed);
    } else if (args[0] === "--search") {
      if (!args[1])
        return message.channel.send("You can't search with nothing!");
      let data = [];
      await db.fetchEverything().forEach(obj => {
        if (
          obj.type === "note" &&
          obj.owner === message.author.id &&
          obj.name.startsWith(args[1])
        ) {
          data.push("`" + obj.name + "`");
        }
      });

      if (!data.length >= 1)
        data.push("You have no notes starting with `" + args[1] + "`!");

      return message.channel.send(
        new MessageEmbed()
          .setTitle("Notes starting with `" + args[1] + "`")
          .setDescription(data.join(", "))
          .setColor(client.bot.color)
          .setTimestamp()
          .setFooter(client.bot.footer)
      );
    }
  }
};
