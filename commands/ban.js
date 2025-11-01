const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('封禁用户')
        .addUserOption(option =>
            option.setName('用户')
                .setDescription('要封禁的用户')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('原因')
                .setDescription('封禁原因')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('删除消息天数')
                .setDescription('删除该用户多少天内的消息 (0-7天)')
                .setMinValue(0)
                .setMaxValue(7)
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

        const targetUser = interaction.options.getUser('用户');
        const reason = interaction.options.getString('原因') || '未提供原因';
        const deleteMessageDays = interaction.options.getInteger('删除消息天数') || 0;

        // 检查机器人权限
        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
            return await interaction.reply({
                content: '❌ 机器人没有封禁成员的权限！',
                ephemeral: true
            });
        }

        try {
            // 获取目标成员
            const targetMember = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
            
            // 检查是否可以封禁该用户
            if (targetMember) {
                // 检查目标用户是否是服务器所有者
                if (targetUser.id === interaction.guild.ownerId) {
                    return await interaction.reply({
                        content: '❌ 无法封禁服务器所有者！',
                        ephemeral: true
                    });
                }

                // 检查目标用户是否是机器人自己
                if (targetUser.id === interaction.client.user.id) {
                    return await interaction.reply({
                        content: '❌ 我不能封禁自己！',
                        ephemeral: true
                    });
                }

                // 检查权限层级
                if (targetMember.roles.highest.position >= interaction.member.roles.highest.position) {
                    return await interaction.reply({
                        content: '❌ 你无法封禁权限等级相同或更高的用户！',
                        ephemeral: true
                    });
                }

                if (targetMember.roles.highest.position >= interaction.guild.members.me.roles.highest.position) {
                    return await interaction.reply({
                        content: '❌ 机器人无法封禁权限等级相同或更高的用户！',
                        ephemeral: true
                    });
                }

                // 检查目标用户是否可以被封禁
                if (!targetMember.bannable) {
                    return await interaction.reply({
                        content: '❌ 无法封禁该用户！可能是权限不足。',
                        ephemeral: true
                    });
                }
            }

            // 执行封禁
            await interaction.guild.members.ban(targetUser, {
                reason: `${reason} | 执行者: ${interaction.user.tag}`,
                deleteMessageSeconds: deleteMessageDays * 24 * 60 * 60
            });

            // 发送确认消息
            await interaction.reply({
                content: `✅ 已成功封禁用户 ${targetUser.tag}\n📝 原因: ${reason}${deleteMessageDays > 0 ? `\n🗑️ 已删除 ${deleteMessageDays} 天内的消息` : ''}`,
                ephemeral: false
            });

            console.log(`🔨 用户被封禁: ${targetUser.tag} (${targetUser.id}) | 执行者: ${interaction.user.tag} | 原因: ${reason}`);

        } catch (error) {
            console.error('封禁用户时出错:', error);
            
            let errorMessage = '❌ 封禁用户失败！';
            if (error.code === 10007) {
                errorMessage = '❌ 找不到该用户！';
            } else if (error.code === 50013) {
                errorMessage = '❌ 权限不足，无法封禁该用户！';
            }

            await interaction.reply({
                content: errorMessage,
                ephemeral: true
            });
        }
    },
};