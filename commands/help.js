const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('显示帮助信息')
        .addStringOption(option =>
            option.setName('命令')
                .setDescription('查看特定命令的详细信息')
                .setRequired(false)
                .addChoices(
                    { name: 'ping', value: 'ping' },
                    { name: 'hello', value: 'hello' },
                    { name: 'auth-info', value: 'auth-info' },
                    { name: 'whitelist', value: 'whitelist' },
                    { name: 'ban', value: 'ban' },
                    { name: 'kick', value: 'kick' },
                    { name: 'unban', value: 'unban' },
                    { name: 'moderation', value: 'moderation' },
                    { name: 'status', value: 'status' },
                    { name: 'createserver', value: 'createserver' },
                    { name: 'announce', value: 'announce' }
                )),
    async execute(interaction) {
        const specificCommand = interaction.options.getString('命令');

        if (specificCommand) {
            // 显示特定命令的详细信息
            const commandHelp = getCommandHelp(specificCommand);
            
            const embed = new EmbedBuilder()
                .setTitle(`📖 命令帮助: /${specificCommand}`)
                .setDescription(commandHelp.description)
                .setColor(0x00AE86)
                .setTimestamp();

            if (commandHelp.usage) {
                embed.addFields({
                    name: '📝 使用方法',
                    value: commandHelp.usage,
                    inline: false
                });
            }

            if (commandHelp.examples) {
                embed.addFields({
                    name: '💡 示例',
                    value: commandHelp.examples,
                    inline: false
                });
            }

            if (commandHelp.permissions) {
                embed.addFields({
                    name: '🔒 权限要求',
                    value: commandHelp.permissions,
                    inline: false
                });
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            // 显示所有命令的概览
            const embed = new EmbedBuilder()
                .setTitle('🤖 机器人帮助')
                .setDescription('以下是所有可用的命令。使用 `/help 命令:[命令名]` 查看详细信息。')
                .setColor(0x00AE86)
                .addFields(
                    {
                        name: '🎯 基础命令',
                        value: '`/ping` - 检查机器人延迟\n`/hello` - 向用户问好\n`/auth-info` - 查看授权状态\n`/help` - 显示此帮助信息',
                        inline: false
                    },
                    {
                        name: '🛡️ 管理员命令',
                        value: '`/whitelist` - 管理白名单\n`/status` - 管理机器人状态\n`/announce` - 发送公告',
                        inline: false
                    },
                    {
                        name: '🔨 服务器管理',
                        value: '`/ban` - 封禁用户\n`/kick` - 踢出用户\n`/unban` - 解封用户\n`/moderation` - 管理工具',
                        inline: false
                    },
                    {
                        name: '🏰 服务器功能',
                        value: '`/createserver` - 创建新服务器',
                        inline: false
                    }
                )
                .setFooter({ text: '💡 提示: 使用 /help 命令:[命令名] 查看详细用法' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    },
};

function getCommandHelp(commandName) {
    const helpData = {
        ping: {
            description: '检查机器人的延迟和响应时间。',
            usage: '`/ping`',
            examples: '`/ping` - 显示机器人延迟信息',
            permissions: '所有授权用户'
        },
        hello: {
            description: '向指定用户或自己发送问候消息。',
            usage: '`/hello [用户:@用户]`',
            examples: '`/hello` - 向自己问好\n`/hello 用户:@张三` - 向张三问好',
            permissions: '所有授权用户'
        },
        'auth-info': {
            description: '查看你的授权状态和权限信息。',
            usage: '`/auth-info`',
            examples: '`/auth-info` - 显示你的授权状态',
            permissions: '所有用户'
        },
        whitelist: {
            description: '管理机器人的白名单系统，控制谁可以使用机器人。',
            usage: '`/whitelist <子命令>`',
            examples: '`/whitelist add-user 用户:@张三` - 添加用户到白名单\n`/whitelist list` - 查看白名单\n`/whitelist add-role 角色名:管理员` - 添加角色到白名单',
            permissions: '仅管理员'
        },
        ban: {
            description: '封禁服务器中的用户。',
            usage: '`/ban 用户:@用户 [原因:原因] [删除消息天数:天数]`',
            examples: '`/ban 用户:@张三 原因:违规行为` - 封禁用户\n`/ban 用户:@张三 原因:刷屏 删除消息天数:7` - 封禁并删除7天消息',
            permissions: '仅管理员 + Discord封禁权限'
        },
        kick: {
            description: '踢出服务器中的用户。',
            usage: '`/kick 用户:@用户 [原因:原因]`',
            examples: '`/kick 用户:@张三` - 踢出用户\n`/kick 用户:@张三 原因:违反规则` - 踢出用户并记录原因',
            permissions: '仅管理员 + Discord踢出权限'
        },
        unban: {
            description: '解封被封禁的用户。',
            usage: '`/unban 用户id:用户ID [原因:原因]`',
            examples: '`/unban 用户id:123456789012345678` - 解封用户\n`/unban 用户id:123456789012345678 原因:申诉成功` - 解封并记录原因',
            permissions: '仅管理员 + Discord封禁权限'
        },
        moderation: {
            description: '管理工具集合，包含用户信息、服务器信息等功能。',
            usage: '`/moderation <子命令>`',
            examples: '`/moderation userinfo 用户:@张三` - 查看用户信息\n`/moderation serverinfo` - 查看服务器信息\n`/moderation banlist` - 查看封禁列表',
            permissions: '仅管理员'
        },
        status: {
            description: '管理机器人的状态和活动显示。',
            usage: '`/status <子命令>`',
            examples: '`/status set 类型:正在玩 内容:Minecraft` - 设置活动状态\n`/status online` - 设置为在线\n`/status info` - 查看当前状态',
            permissions: '仅管理员'
        },
        createserver: {
            description: '创建新的Discord服务器并生成邀请链接。',
            usage: '`/createserver name:服务器名称 [description:描述] [icon:图标]`',
            examples: '`/createserver name:我的服务器` - 创建基础服务器\n`/createserver name:游戏公会 description:专门用于游戏` - 创建带描述的服务器',
            permissions: '仅管理员'
        },
        announce: {
            description: '向指定频道发送公告消息。',
            usage: '`/announce <子命令>`',
            examples: '`/announce send 频道:#公告 标题:重要通知 内容:服务器维护` - 发送公告\n`/announce embed 频道:#公告 标题:更新 内容:新功能上线` - 发送嵌入式公告',
            permissions: '仅管理员'
        }
    };

    return helpData[commandName] || {
        description: '未找到该命令的帮助信息。',
        usage: '请检查命令名称是否正确。',
        examples: '',
        permissions: '未知'
    };
}