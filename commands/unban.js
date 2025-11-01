const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('解封用户')
        .addStringOption(option =>
            option.setName('用户id')
                .setDescription('要解封的用户ID')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('原因')
                .setDescription('解封原因')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
    adminOnly: true,
    async execute(interaction) {
        // 检查是否在服务器中使用命令
        if (!interaction.guild) {
            return await interaction.reply({
                content: '❌ 此命令只能在服务器中使用！',
                ephemeral: true
            });
        }

        const userId = interaction.options.getString('用户id');
        const reason = interaction.options.getString('原因') || '未提供原因';

        // 检查机器人权限
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({
                content: '❌ 机器人没有管理封禁的权限！',
                ephemeral: true
            });
        }

        // 验证用户ID格式
        if (!/^\d{17,19}$/.test(userId)) {
            return await interaction.reply({
                content: '❌ 无效的用户ID格式！用户ID应该是17-19位数字。',
                ephemeral: true
            });
        }

        try {
            // 检查用户是否被封禁
            const bans = await interaction.guild.bans.fetch();
            const bannedUser = bans.get(userId);

            if (!bannedUser) {
                return await interaction.reply({
                    content: '❌ 该用户没有被封禁，或者用户ID不正确！',
                    ephemeral: true
                });
            }

            // 执行解封
            await interaction.guild.members.unban(userId, `${reason} | 执行者: ${interaction.user.tag}`);

            // 发送确认消息
            await interaction.reply({
                content: `✅ 已成功解封用户 ${bannedUser.user.tag} (${userId})\n📝 原因: ${reason}`,
                ephemeral: false
            });

            console.log(`🔓 用户被解封: ${bannedUser.user.tag} (${userId}) | 执行者: ${interaction.user.tag} | 原因: ${reason}`);

        } catch (error) {
            console.error('解封用户时出错:', error);
            
            let errorMessage = '❌ 解封用户失败！';
            if (error.code === 10026) {
                errorMessage = '❌ 该用户没有被封禁！';
            } else if (error.code === 50013) {
                errorMessage = '❌ 权限不足，无法解封该用户！';
            } else if (error.code === 10007) {
                errorMessage = '❌ 找不到该用户！请检查用户ID是否正确。';
            }

            await interaction.reply({
                content: errorMessage,
                ephemeral: true
            });
        }
    },
};