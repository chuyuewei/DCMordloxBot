# Discord Bot

一个使用 Node.js 和 discord.js 构建的 Discord 机器人。

## 功能特性

- 🏓 Ping 命令 - 检查机器人延迟
- 👋 Hello 命令 - 向用户问好
- � ️ 白名单身份验证系统
- � 事管理员权限管理
- 🔨 服务器管理命令 (ban/kick/unban)
- 📊 管理工具 (用户信息/服务器信息/封禁列表)
- 🔧 模块化命令系统
- 📝 事件处理系统

## 安装步骤

1. **克隆项目并安装依赖**
   ```bash
   npm install
   ```

2. **配置Discord应用程序**
   - 在 [Discord Developer Portal](https://discord.com/developers/applications) 创建应用程序
   - 在 "Bot" 页面创建机器人并获取 Token
   - 在 "OAuth2" > "General" 页面获取 Client ID
   - **重要**: 在 "Bot" 页面的 "Privileged Gateway Intents" 部分，确保以下设置：
     - ✅ SERVER MEMBERS INTENT (如果需要成员管理功能)
     - ✅ MESSAGE CONTENT INTENT (如果需要读取消息内容)
   - 复制 `.env.example` 为 `.env` 并填写相应值

3. **邀请机器人到服务器**
   - 在 Discord Developer Portal 的 "OAuth2" > "URL Generator" 页面
   - 选择 Scopes: `bot` 和 `applications.commands`
   - 选择 Bot Permissions (根据需要):
     - `Send Messages` - 发送消息
     - `Use Slash Commands` - 使用斜杠命令
     - `Ban Members` - 封禁成员 (如果使用ban命令)
     - `Kick Members` - 踢出成员 (如果使用kick命令)
     - `Manage Roles` - 管理角色
     - `Manage Channels` - 管理频道
     - `View Audit Log` - 查看审计日志
     - `Create Instant Invite` - 创建邀请
   - 复制生成的URL并在浏览器中打开
   - 选择要添加机器人的服务器并授权

4. **部署斜杠命令**
   ```bash
   node deploy-commands.js
   ```

5. **启动机器人**
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
│   ├── hello.js
│   ├── ban.js         # 封禁用户命令
│   ├── kick.js        # 踢出用户命令
│   ├── unban.js       # 解封用户命令
│   ├── moderation.js  # 管理工具命令
│   ├── whitelist.js   # 白名单管理命令
│   ├── auth-info.js   # 授权信息查看
│   ├── status.js      # 机器人状态管理
│   ├── createserver.js # 创建服务器命令
│   ├── help.js        # 帮助命令
│   └── announce.js    # 公告命令
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

MIT License#
# 管理命令

### 服务器管理
- `/ban` - 封禁用户
  - 用户: 要封禁的用户
  - 原因: 封禁原因 (可选)
  - 删除消息天数: 删除该用户多少天内的消息 (0-7天，可选)

- `/kick` - 踢出用户
  - 用户: 要踢出的用户
  - 原因: 踢出原因 (可选)

- `/unban` - 解封用户
  - 用户ID: 要解封的用户ID
  - 原因: 解封原因 (可选)

### 管理工具
- `/moderation banlist` - 查看封禁列表
- `/moderation userinfo` - 查看用户详细信息
- `/moderation serverinfo` - 查看服务器信息

### 机器人状态管理
- `/status set` - 设置机器人活动状态
  - 类型: 正在玩/正在听/正在看/正在竞争/正在直播
  - 内容: 活动内容
  - 链接: 直播链接 (仅直播类型需要)
- `/status online` - 设置为在线状态 🟢
- `/status idle` - 设置为离开状态 🟡
- `/status dnd` - 设置为请勿打扰状态 🔴
- `/status invisible` - 设置为隐身状态 ⚫
- `/status clear` - 清除活动状态
- `/status info` - 查看当前状态

### 服务器创建
- `/createserver` - 创建新的Discord服务器
  - name: 服务器名称 (必需，2-100字符)
  - description: 服务器描述 (可选，最多120字符)
  - icon: 服务器图标 (可选，支持PNG/JPG/GIF/WebP，最大8MB)

### 公告系统
- `/announce send` - 发送普通公告
  - 频道: 目标频道
  - 内容: 公告内容
  - 提及所有人: 是否@everyone (可选)
- `/announce embed` - 发送嵌入式公告
  - 频道: 目标频道
  - 标题: 公告标题
  - 内容: 公告内容
  - 颜色: 嵌入消息颜色 (可选)
  - 图片链接: 公告图片URL (可选)
  - 提及所有人: 是否@everyone (可选)
- `/announce schedule` - 预览公告 (不发送)

### 帮助系统
- `/help` - 显示所有命令概览
- `/help 命令:[命令名]` - 查看特定命令的详细帮助

### 权限要求
- 所有管理命令都需要机器人白名单管理员权限
- 机器人需要相应的Discord权限 (封禁成员、踢出成员等)
- 无法对权限等级相同或更高的用户执行操作

### 安全特性
- 自动权限层级检查
- 防止对服务器所有者执行操作
- 详细的错误处理和日志记录
- 操作原因记录到Discord审计日志
## 服务器创建
功能

### 功能说明
`/createserver` 命令允许管理员通过机器人创建新的Discord服务器，并自动生成邀请链接。

### 创建的服务器包含：
- **默认频道:**
  - 📝 欢迎 - 文字频道，包含欢迎信息
  - 💬 一般聊天 - 日常聊天频道
  - 🔊 语音聊天 - 语音频道 (最多10人)

- **默认角色:**
  - 👥 成员 - 基础权限角色

- **自动功能:**
  - 生成一次性邀请链接
  - 发送欢迎消息到欢迎频道
  - 设置服务器描述 (如果提供)
  - 设置服务器图标 (如果提供)

### 使用示例
```
/createserver name:我的服务器
/createserver name:游戏公会 description:专门用于游戏的服务器
/createserver name:学习小组 description:一起学习编程 icon:[上传图片]
```

### 注意事项
- 仅白名单管理员可使用
- 机器人有服务器数量限制 (通常为100个)
- 邀请链接只能使用一次，请妥善保管
- 服务器名称不能包含特殊字符
- 图标文件大小不能超过8MB
##
 故障排除

### "Used disallowed intents" 错误
如果遇到此错误，请检查：

1. **Discord Developer Portal 设置**
   - 进入你的应用程序页面
   - 点击 "Bot" 标签
   - 向下滚动到 "Privileged Gateway Intents"
   - 根据需要启用以下意图：
     - `SERVER MEMBERS INTENT` - 用于成员管理功能
     - `MESSAGE CONTENT INTENT` - 用于读取消息内容

2. **当前配置**
   - 机器人默认使用基础意图 (`Guilds`, `GuildMessages`)
   - 如需更多功能，请在 Discord Developer Portal 启用相应意图
   - 然后在 `index.js` 中添加对应的 `GatewayIntentBits`

### 权限问题
- 确保机器人在服务器中有足够的权限
- 管理命令需要相应的Discord权限 (如封禁成员、踢出成员等)
- 检查机器人角色的权限设置

### 白名单配置
- 确保 `config/whitelist.json` 文件存在且格式正确
- 将你的用户ID添加到 `admins` 数组中
- 使用 `/auth-info` 命令检查授权状态#
# 机器人邀请和部署

### 快速邀请链接生成

你可以使用以下URL模板快速生成邀请链接：

```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=PERMISSIONS&scope=bot%20applications.commands
```

**替换参数：**
- `YOUR_CLIENT_ID` - 你的机器人客户端ID
- `PERMISSIONS` - 权限数值 (见下方权限计算)

### 推荐权限配置

**基础功能 (权限值: 2147483648)**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=2147483648&scope=bot%20applications.commands
```
- 使用斜杠命令

**完整管理功能 (权限值: 8590065664)**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8590065664&scope=bot%20applications.commands
```
包含所有管理权限：
- 发送消息
- 使用斜杠命令  
- 封禁成员
- 踢出成员
- 管理角色
- 管理频道
- 查看审计日志
- 创建邀请

### 手动配置步骤

1. **访问 Discord Developer Portal**
   - 打开 https://discord.com/developers/applications
   - 选择你的应用程序

2. **生成邀请链接**
   - 点击左侧 "OAuth2" > "URL Generator"
   - 在 "Scopes" 中选择：
     - ☑️ `bot`
     - ☑️ `applications.commands`

3. **选择机器人权限**
   
   **必需权限：**
   - ☑️ `Send Messages` - 发送回复消息
   - ☑️ `Use Slash Commands` - 使用斜杠命令
   
   **管理功能权限 (可选)：**
   - ☑️ `Ban Members` - 使用 `/ban` 和 `/unban` 命令
   - ☑️ `Kick Members` - 使用 `/kick` 命令
   - ☑️ `Manage Roles` - 角色相关操作
   - ☑️ `Manage Channels` - 频道管理
   - ☑️ `View Audit Log` - 查看操作日志
   - ☑️ `Create Instant Invite` - 创建邀请链接
   - ☑️ `Manage Guild` - 服务器管理 (创建服务器功能需要)

4. **复制并使用邀请链接**
   - 复制页面底部生成的URL
   - 在浏览器中打开链接
   - 选择要添加机器人的服务器
   - 点击 "授权" 完成添加

### 首次设置

添加机器人到服务器后：

1. **配置白名单**
   ```bash
   # 编辑 config/whitelist.json
   # 将你的用户ID添加到 admins 数组
   ```

2. **部署命令**
   ```bash
   node deploy-commands.js
   ```

3. **启动机器人**
   ```bash
   npm start
   ```

4. **测试功能**
   - 使用 `/ping` 测试基础功能
   - 使用 `/auth-info` 检查权限状态
   - 使用 `/whitelist list` 查看白名单 (管理员)

### 获取用户ID

要将自己添加到管理员白名单：

1. **启用开发者模式**
   - Discord设置 > 高级 > 开发者模式 ✅

2. **获取用户ID**
   - 右键点击你的用户名/头像
   - 选择 "复制ID"
   - 将ID添加到 `config/whitelist.json` 的 `admins` 数组中

### 权限故障排除

**机器人无响应：**
- 检查机器人是否在线
- 确认已部署斜杠命令
- 检查机器人是否有 "发送消息" 权限

**命令执行失败：**
- 确认你在白名单中
- 检查机器人是否有相应的Discord权限
- 查看控制台错误日志

**权限不足错误：**
- 重新邀请机器人并授予更多权限
- 或在服务器设置中手动调整机器人角色权限#
# 公告系统功能

### 功能说明
`/announce` 命令允许管理员向指定频道发送公告消息，支持普通文本和嵌入式消息。

### 公告类型

**普通公告 (`/announce send`)**
- 发送简单的文本公告
- 可选择是否提及所有人
- 适合快速通知

**嵌入式公告 (`/announce embed`)**
- 美观的嵌入式消息格式
- 支持自定义标题、颜色和图片
- 自动添加发布者信息和时间戳
- 适合重要公告和正式通知

**公告预览 (`/announce schedule`)**
- 预览公告效果而不实际发送
- 用于检查格式和内容

### 使用示例
```
# 普通公告
/announce send 频道:#公告 内容:服务器将在今晚维护

# 嵌入式公告
/announce embed 频道:#公告 标题:重要更新 内容:新功能已上线 颜色:绿色

# 带图片的公告
/announce embed 频道:#公告 标题:活动通知 内容:周末活动开始 图片链接:https://example.com/image.png

# 预览公告
/announce schedule 标题:测试 内容:这是一个测试公告
```

### 权限要求
- 仅白名单管理员可使用
- 机器人需要目标频道的发送消息权限
- 嵌入式公告需要嵌入链接权限
- @everyone 提及需要提及所有人权限

## 帮助系统功能

### 功能说明
`/help` 命令提供完整的机器人使用指南和命令说明。

### 帮助类型

**命令概览 (`/help`)**
- 显示所有可用命令的分类列表
- 按功能分组 (基础、管理、服务器管理等)
- 提供快速参考

**详细帮助 (`/help 命令:[命令名]`)**
- 特定命令的详细说明
- 使用方法和参数说明
- 实际使用示例
- 权限要求说明

### 支持的命令帮助
所有机器人命令都有详细的帮助信息，包括：
- 命令描述和用途
- 参数说明和格式
- 使用示例
- 权限要求

### 使用示例
```
# 查看所有命令
/help

# 查看特定命令帮助
/help 命令:ban
/help 命令:announce
/help 命令:whitelist
```