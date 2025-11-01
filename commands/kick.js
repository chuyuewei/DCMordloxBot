const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('踢出用户')
        .addUserOption(option =>
            option.setName('用户')
                .setDescription('要踢出的用户')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('原因')
                .setDescription('踢出原因')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
    adminOnly: true,
    async execute(interaction) {
        // 检查是否在服务器中使用命令
        if (!interaction.guild) {
            return await interaction.reply({
                content: '❌ 此命令只能在服务器中使用！',
                ephemeral: true
            });
        }

        const targetUser = interaction.options.getUser('用户');
        const reason = interaction.options.getString('原因') || '未提供原因';

        // 检查机器人权限
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
            return await interaction.reply({
                content: '❌ 机器人没有踢出成员的权限！',
                ephemeral: true
            });
        }

        try {
            // 获取目标成员
            const targetMember = await interaction.guild.members.fetch(targetUser.id);

            // 检查目标用户是否是服务器所有者
            if (targetUser.id === interaction.guild.ownerId) {
                return await interaction.reply({
                    content: '❌ 无法踢出服务器所有者！',
                    ephemeral: true
                });
            }

            // 检查目标用户是否是机器人自己
            if (targetUser.id === interaction.client.user.id) {
                return await interaction.reply({
                    content: '❌ 我不能踢出自己！',
                    ephemeral: true
                });
            }

            // 检查权限层级
            if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
                return await interaction.reply({
                    content: '❌ 你无法踢出权限等级相同或更高的用户！',
                    ephemeral: true
                });
            }

            if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                return await interaction.reply({
                    content: '❌ 机器人无法踢出权限等级相同或更高的用户！',
                    ephemeral: true
                });
            }

            // 检查目标用户是否可以被踢出
            if (!targetMember.kickable) {
                return await interaction.reply({
                    content: '❌ 无法踢出该用户！可能是权限不足。',
                    ephemeral: true
                });
            }

            // 执行踢出
            await targetMember.kick(`${reason} | 执行者: ${interaction.user.tag}`);

            // 发送确认消息
            await interaction.reply({
                content: `✅ 已成功踢出用户 ${targetUser.tag}\n📝 原因: ${reason}`,
                ephemeral: false
            });

            console.log(`👢 用户被踢出: ${targetUser.tag} (${targetUser.id}) | 执行者: ${interaction.user.tag} | 原因: ${reason}`);

        } catch (error) {
            console.error('踢出用户时出错:', error);
            
            let errorMessage = '❌ 踢出用户失败！';
            if (error.code === 10007) {
                errorMessage = '❌ 找不到该用户！';
            } else if (error.code === 50013) {
                errorMessage = '❌ 权限不足，无法踢出该用户！';
            } else if (error.code === 10013) {
                errorMessage = '❌ 该用户不在服务器中！';
            }

            await interaction.reply({
                content: errorMessage,
                ephemeral: true
            });
        }
    },
};