const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const authManager = require('./utils/auth');
require('dotenv').config();

// 创建客户端实例
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
});

// 创建命令集合
client.commands = new Collection();

// 加载命令文件
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        
        if ('data' in command && 'execute' in command) {
            client.commands.set(command.data.name, command);
            console.log(`✅ 已加载命令: ${command.data.name}`);
        } else {
            console.log(`⚠️ 命令文件 ${filePath} 缺少必要的 "data" 或 "execute" 属性`);
        }
    }
}

// 加载事件处理器
const eventsPath = path.join(__dirname, 'events');
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
    
    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);
        
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
        console.log(`✅ 已加载事件: ${event.name}`);
    }
}

// 基础事件处理
client.once('ready', () => {
    console.log(`🤖 Bot已上线! 登录为 ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`未找到命令: ${interaction.commandName}`);
        return;
    }

    // 身份验证检查 (管理命令除外)
    if (!command.adminOnly && !authManager.isAuthorized(interaction)) {
        await interaction.reply({
            content: '❌ 你没有权限使用此机器人。请联系管理员将你添加到白名单。',
            ephemeral: true
        });
        console.log(`🚫 未授权用户尝试使用命令: ${interaction.user.tag} (${interaction.user.id}) - ${interaction.commandName}`);
        return;
    }

    // 管理员命令检查
    if (command.adminOnly && !authManager.isAdmin(interaction.user.id)) {
        await interaction.reply({
            content: '❌ 此命令仅限管理员使用。',
            ephemeral: true
        });
        console.log(`🚫 非管理员尝试使用管理命令: ${interaction.user.tag} (${interaction.user.id}) - ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
        console.log(`✅ 命令执行: ${interaction.user.tag} (${interaction.user.id}) - ${interaction.commandName}`);
    } catch (error) {
        console.error('执行命令时出错:', error);
        
        const errorMessage = { content: '执行命令时出现错误!', ephemeral: true };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
});

// 登录到Discord
client.login(process.env.DISCORD_TOKEN);