# Discord Bot

一个使用 Node.js 和 discord.js 构建的 Discord 机器人。

## 功能特性

- 🏓 Ping 命令 - 检查机器人延迟
- 👋 Hello 命令 - 向用户问好
- 🔧 模块化命令系统
- 📝 事件处理系统

## 安装步骤

1. **克隆项目并安装依赖**
   ```bash
   npm install
   ```

2. **配置环境变量**
   - 复制 `.env.example` 为 `.env`
   - 在 [Discord Developer Portal](https://discord.com/developers/applications) 创建应用程序
   - 获取 Bot Token 和 Client ID
   - 填写 `.env` 文件中的相应值

3. **部署斜杠命令**
   ```bash
   node deploy-commands.js
   ```

4. **启动机器人**
   ```bash
   npm start
   ```

   或者使用开发模式（自动重启）：
   ```bash
   npm run dev
   ```

## 环境变量

在 `.env` 文件中配置以下变量：

```env
DISCORD_TOKEN=你的机器人令牌
CLIENT_ID=你的客户端ID
GUILD_ID=你的服务器ID（可选，用于服务器特定命令）
```

## 项目结构

```
discord-bot/
├── commands/          # 斜杠命令文件
│   ├── ping.js
│   └── hello.js
├── events/            # 事件处理文件
│   └── ready.js
├── index.js           # 主入口文件
├── deploy-commands.js # 命令部署脚本
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## 添加新命令

1. 在 `commands/` 目录下创建新的 `.js` 文件
2. 使用以下模板：

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('命令名')
        .setDescription('命令描述'),
    async execute(interaction) {
        await interaction.reply('命令响应');
    },
};
```

3. 重新运行 `node deploy-commands.js` 部署新命令

## 许可证

MIT License