const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const commands = [];

// 读取所有命令文件
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    
    if ('data' in command && 'execute' in command) {
        commands.push(command.data.toJSON());
    } else {
        console.log(`⚠️ 命令文件 ${filePath} 缺少必要的 "data" 或 "execute" 属性`);
    }
}

// 构建和准备REST模块实例
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// 部署命令
(async () => {
    try {
        console.log(`🔄 开始刷新 ${commands.length} 个应用程序(/)命令...`);

        // 全局部署命令 (所有服务器)
        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`✅ 成功重新加载了 ${data.length} 个应用程序(/)命令`);
    } catch (error) {
        console.error('❌ 部署命令时出错:', error);
    }
})();