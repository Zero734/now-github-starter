const Discord = require("discord.js");
const client = new Discord.Client();
const config = require("./config.json");

client.on("ready", () => {
    console.log(`봇이 ${client.users.size}명의 유저와 ${client.guilds.size}서버를 위해서 개방됬습니다.`);
    client.user.setGame(`악어 유튜브 시청 준비 중... (${client.users.size}명과 같이!!)`);
});

client.on("guildCreate", guild => {
    console.log(`봇이 ${guild.name}에 입성하였습니다. (서버 Id: <${guild.id}>, 서버 인원: ${guild.memberCount}명, 서버 오너: <${guild.owner}>, 서버 위치: ${guild.region} `)
    client.user.setActivity(`현재 이 봇은 ${client.guilds.size}서버에 있습니다.`);
});

client.on("guildDelete", guild => {
    console.log(`봇이 ${guild.name}에서 추방 당했습니다. (서버 Id: <${guild.id}> )   (stupid!!)`)
    client.user.setActivity(`현재 이 봇은 ${client.guilds.size} 서버에 있습니다.`);
});

client.on("message", async message => {

    if(message.author.bot) return;
    if(message.channel.type === "dm") return;
    if(!message.content.startsWith(config.prefix)) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const comando = args.shift().toLowerCase();

    if(comando === "ping") {
      const m = await message.channel.send("핑?");
      m.edit(`핑맨~! 봇의 핑 수치는 ${m.createdTimestamp - message.createdTimestamp}ms이고 디스코드 API의 핑 수치는 ${Math.round(client.ping)}ms입니다!`);
    }

    if(comando === "공지") { 
      const sayMessage = args.join(" ");
      message.delete().catch(O_o=>{});  
      message.channel.send(sayMessage);
    }

    if(comando === "청소") {
      const deleteCount = parseInt(args[0], 10);
      if(!deleteCount || deleteCount < 2 || deleteCount > 1000)
        return message.reply("2에서 1000까지의 숫자를 같이 써주세요!! 예) z!청소 <2~1000>");
        
      const fetched = await message.channel.fetchMessages({limit: deleteCount});
      message.channel.bulkDelete(fetched)
        .catch(error => message.reply(`${error}에 의해서 메세지를 삭제 하는데 실패 했습니다...`));
    }

    if(comando === "추방") {
      if(!message.member.roles.some(r=>["서버 관리자", "서버 부관리자, "].includes(r.name)) )
        return message.reply("이 명령어를 쓸 권한이 없습니다.");
      let member = message.mentions.members.first() || message.guild.members.get(args[0]);
      if(!member)
        return message.reply("멤버의 이름을 같이 써주세요! 예) z!추방 @<멤버 이름> <추방 사유>");
      if(!member.kickable) 
        return message.reply("제가 추방할수 있는 권한이 없거나 이 멤버는 저보다 권한이 높습니다...ㅠㅠ");
    
      let reason = args.slice(1).join(' ');
      if(!reason) reason = "추방 사유 미정";
    
      await member.kick(reason)
        .catch(error => message.reply(`${message.author}님, 죄송합니다... ${error}에 의해서 이 멤버를 추방 하는데 실패 했습니다.`));
      message.reply(`${member.user.tag}님이 ${message.author.tag}의해서 추방 당하셨습니다. 추방 사유: ${reason}`);
    }

    if(comando === "밴") {
      if(!message.member.roles.some(r=>["서버 관리자"].includes(r.name)) )
        return message.reply("이 명령어를 쓸 권한이 없습니다.");
      let member = message.mentions.members.first();
      if(!member)
        return message.reply("멤버의 이름을 같이 써주세요! 예) z!밴 @<멤버 이름> <밴 사유>");
      if(!member.bannable) 
        return message.reply("제가 밴할수 있는 권한이 없거나 이 멤버는 저보다 권한이 높습니다...ㅠㅠ");
      let reason = args.slice(1).join(' ');
      if(!reason) reason = "추방 사유 미정";
      await member.ban(reason)
        .catch(error => message.reply(`${message.author}님, 죄송합니다... ${error}에 의해서 이 멤버를 밴 하는데 실패 했습니다.`));
      message.reply(`${member.user.tag}님이 ${message.author.tag}의해서 밴 당하셨습니다. 밴 사유: ${reason}`);
    }

    if(comando === "tempmute") {
        module.exports.run = async (bot, message, args) => {
          if (!message.member.hasPermission("MANAGE_ROLES")) return message.reply("❌ Desculpe amigo ! Você não pode fazer isso!");
          if (args[0] == "help") {
              message.reply("Modo de usar: tempmute <user> <1s/m/h/d> <Motivo>");
              return;
          }
          let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
          if (!tomute) return message.reply("Mencione um usuario!"); 
          let reason = args.slice(2).join(" ");
          if (!reason) return message.reply("Indique um motivo");
       
          let muterole = message.guild.roles.find(`name`, "muted"); 
          if (!muterole) {
              try {
                  muterole = await message.guild.createRole({
                      name: "anonymus-muted",
                      color: "#000000",
                      permissions: []
                  })
                  message.guild.channels.forEach(async (channel, id) => {
                      await channel.overwritePermissions(muterole, {
                          SEND_MESSAGES: false,
                          ADD_REACTIONS: false
                      });
                  });
              } catch (e) {
                  console.log(e.stack);
              }
          }
          
          let mutetime = args[1];
          if (!mutetime) return message.reply("Indique um tempo"); 
       
          message.delete().catch(O_o => {});
       
          try {
              await tomute.send(`Olá você foi mutado por ${mutetime}. Desculpe !`) 
          } catch (e) {
              message.channel.send(`ERROR!!!!!`)
          }
       
          let muteembed = new Discord.RichEmbed()
              .setDescription(`Mute feito por ${message.author}`)
              .setColor("RANDOM")
              .addField("Usuario Silenciado:", tomute)
              .addField("Mutado na sala", message.channel)
              .addField("Mutado á", message.createdAt)
              .addField("Tempo mutado", mutetime)
              .addField("Motivo", reason);
       
          let incidentschannel = message.guild.channels.find(`name`, "log-staff" ) || message.guild.channels.find(`name`, "log" ) || message.guild.channels.find(`name`, "staff-log" ) || message.guild.channels.find(`name`, "logs" ) ; //Se o bot não achar as salas
          if(!incidentschannel) return message.channel.send("Crie um canal com essas seguintes opcões de nome 'log-staff' , 'log' , 'staff-log', 'log'"); //vamos retornar
          incidentschannel.send(muteembed);
          message.channel.send(`<@${tomute.id}> Foi mutado por ${mutetime}`)
          await (tomute.addRole(muterole.id));
       
          setTimeout(function() {
              tomute.removeRole(muterole.id);
              message.channel.send(`<@${tomute.id}> Foi desmutado`);
          }, ms(mutetime));
      }

      }});



client.login(config.token);
