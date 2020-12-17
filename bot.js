const { token, owners } = require("./config")
const blacklistedPermissions = ["administrator", "banMembers", "kickMembers", "manageChannels", "manageRoles"];
const { Client } = require("eris");
const client = new Client(token, {
  disableEvents: ["TYPING_START", "PRESENCE_UPDATE", "VOICE_STATE_UPDATE", "USER_UPDATE", "MESSAGE_UPDATE", "MESSAGE_DELETE", "MESSAGE_DELETE_BULK"],
  disableEveryone: true,
  getAllUsers: true
});

var actions = [];

const FetchAduitLogs = (guild, type, targetID) => new Promise(async (resolve, reject) => {
    const auditLogs = await guild.getAuditLogs(10, undefined, type);
    const audit = auditLogs && auditLogs.entries ? auditLogs.entries.sort((a, b) => b.id - a.id).find(log => log.targetID == targetID) : undefined;
    if (audit && audit.user) return resolve(audit.user);
    return resolve(false);
  });
  


const RegisterAction = (action)=>{ actions.push(action); setTimeout(()=> actions = actions.filter(x=> x.code !== action.code), action.endsAt);};

client
  .on("ready", ()=> { client.editStatus("invisible"); console.log("Logined to Discord API"); })
  .on("messageCreate", message=>{
  if(!message.author.bot && owners.includes(message.author.id) && message.content.toLowerCase().startsWith("here"))message.channel.createMessage("Yes. i'm here").then(m=> setTimeout(()=>m.delete(), 20000));
  }).on("guildBanAdd", async (guild, user) => {
    const Logs = await FetchAduitLogs(guild, 22, user.id);
    if (Logs)return RegisterAction({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: guild.id,
        action: "guildBanAdd",
        time: Date.now(),
        maxTimes: 2, // عدد محاولات تبنيد اي شخص
        endsAt: 86400000 // الوقت , علشان اذا بند اكتر من 2 خلال الوقت المحدد تنسحب الرول منه
      });
  }).on("guildMemberRemove", async (guild, user) => {
    const Logs = await FetchAduitLogs(guild, 20, user.id);
    if (Logs && !owners.includes(Logs.id)) return actions.push({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: guild.id,
        action: "guildMemberRemove",
        time: Date.now(),
        maxTimes: 2, // عدد محاولات طرد اي شخص
        endsAt: 86400000 // الوقت , علشان اذا طرد اكتر من 2 خلال الوقت المحدد  تنسحب الرول منه
      });
  }).on("channelDelete", async channel => {
    const Logs = await FetchAduitLogs(channel.guild, 12, channel.id);
    if (Logs && !owners.includes(Logs.id)) return actions.push({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: channel.guild.id,
        action: "channelDelete",
        time: Date.now(),
        maxTimes: 2, // عدد محاولات مسح رومات
        endsAt: 21600000  // الوقت , علشان اذا مسح اكتر من 2 خلال الوقت المحدد  تنسحب الرول منه
      });
  }).on("channelCreate", async channel => {
    if(!channel.guild)return;
    const Logs = await FetchAduitLogs(channel.guild, 10, channel.id);
    if (Logs && !owners.includes(Logs.id)) return actions.push({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: channel.guild.id,
        action: "channelCreate",
        time: Date.now(),
        maxTimes: 2, // عدد انشاء رومات
        endsAt: 21600000 // الوقت , علشان اذا انشيء اكتر من 3 خلال الوقت المحدد  تنسحب الرول منه
      });
  }).on("channelUpdate", async (channel, newChannel) => {
    const Logs = await FetchAduitLogs(channel.guild, 11, channel.id);
    if (Logs && !owners.includes(Logs.id)) return actions.push({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: channel.guild.id,
        action: "channelUpdate",
        time: Date.now(),
        maxTimes: 2, // عدد تعديل رومات
        endsAt: 21600000 // الوقت , علشان اذا عدل اكتر من 5 خلال الوقت المحدد  تنسحب الرول منه
      });
  }).on("guildRoleUpdate", async (guild, newRole, oldRole) => {
    const Logs = await FetchAduitLogs(guild, 31, newRole.id);
    if (Logs && !owners.includes(Logs.id)) actions.push({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: guild.id,
        action: "guildRoleUpdate",
        time: Date.now(),
        maxTimes: 2, // عدد تعديل رولات
        endsAt: 21600000 // الوقت , علشان اذا عدل اكتر من 2 خلال الوقت المحدد تنسحب الرول منه
      });
  
const permissions = Object.keys(newRole.permissions.json).filter(e => Object.keys(oldRole.permissions.json).every(x=> x !== e));
if(Logs && !owners.includes(Logs.id) && permissions.find(x=> blacklistedPermissions.includes(x)))newRole.edit({ permissions: oldRole.permissions.allow }).catch(()=>{});
  }).on("guildRoleDelete", async (guild, role) => {
    const Logs = await FetchAduitLogs(guild, 32, role.id);
    if (Logs) return RegisterAction({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: guild.id,
        action: "guildRoleDelete",
        time: Date.now(),
        maxTimes: 2, // عدد حذف رولات
        endsAt: 21600000 // الوقت , علشان اذا حذف اكتر من 2 خلال الوقت المحدد  تنسحب الرول منه
      });
  }).on("guildRoleCreate", async (guild, role) => {
    const Logs = await FetchAduitLogs(guild, 30, role.id);
    if (Logs && !owners.includes(Logs.id)) actions.push({
        ID: Logs.id,
        code: Logs.id+Date.now(),
        guild: guild.id,
        action: "guildRoleCreate",
        time: Date.now(),
        maxTimes: 2, // عدد انشاء رولات
        endsAt: 21600000 // الوقت , علشان اذا انشيء اكتر من 3 خلال الوقت المحدد  تنسحب الرول منه
      });
  
let permissions = Object.keys(role.permissions.json);
if(Logs && !owners.includes(Logs.id) && permissions.find(x=> blacklistedPermissions.includes(x)))role.edit({ permissions: 0 }).catch(()=>{});
}).connect();


setInterval(()=> ["guildBanAdd", "guildMemberRemove", "channelDelete", "channelCreate", "channelUpdate", "guildRoleUpdate", "guildRoleCreate"].forEach(async event=>{
for(let ID of actions.filter(x=> x.action == event).map(x=> x.ID)){
let a = actions.filter(x=> x.action == event && x.ID == ID);
for(let guildID of [...new Set(a.map(x=> x.guild))]){
if(a.length !== 0 && a.length >= a.find(g=> g.guild == guildID).maxTimes && !owners.includes(ID)){
try {
console.log("Trying to stop him...");
actions = actions.filter(x=> (x.ID !== ID));
const member = client.guilds.get(guildID).members.get(ID);
for(let roleID of member.roles){
  let role = client.guilds.get(guildID).roles.get(roleID);
  if(role && Object.keys(role.permissions.json).find(x=> blacklistedPermissions.includes(x)))member.removeRole(roleID).catch(()=>role.edit({permissions: 0 }).catch(()=>{}));
}}catch(err){ console.error(err); }}}}}), 5000);
