const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const authManager = require('../utils/auth');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('whitelist')
        .setDescription('管理白名单 (仅管理员)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-user')
                .setDescription('添加用户到白名单')
                .addUserOption(option =>
                    option.setName('用户')
                        .setDescription('要添加的用户')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-user')
                .setDescription('从白名单移除用户')
                .addUserOption(option =>
                    option.setName('用户')
                        .setDescription('要移除的用户')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add-role')
                .setDescription('添加角色到白名单')
                .addStringOption(option =>
                    option.setName('角色名')
                        .setDescription('要添加的角色名称')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove-role')
                .setDescription('从白名单移除角色')
                .addStringOption(option =>
                    option.setName('角色名')
                        .setDescription('要移除的角色名称')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('查看当前白名单'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reload')
                .setDescription('重新加载白名单配置')),
    adminOnly: true,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add-user': {
                const user = interaction.options.getUser('用户');
                const success = authManager.addUser(user.id);
                
                if (success) {
                    await interaction.reply({
                        content: `✅ 已将用户 ${user.tag} 添加到白名单`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `⚠️ 用户 ${user.tag} 已在白名单中`,
                        ephemeral: true
                    });
                }
                break;
            }

            case 'remove-user': {
                const user = interaction.options.getUser('用户');
                const success = authManager.removeUser(user.id);
                
                if (success) {
                    await interaction.reply({
                        content: `✅ 已将用户 ${user.tag} 从白名单移除`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `⚠️ 用户 ${user.tag} 不在白名单中`,
                        ephemeral: true
                    });
                }
                break;
            }

            case 'add-role': {
                const roleName = interaction.options.getString('角色名');
                const success = authManager.addRole(roleName);
                
                if (success) {
                    await interaction.reply({
                        content: `✅ 已将角色 "${roleName}" 添加到白名单`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `⚠️ 角色 "${roleName}" 已在白名单中`,
                        ephemeral: true
                    });
                }
                break;
            }

            case 'remove-role': {
                const roleName = interaction.options.getString('角色名');
                const success = authManager.removeRole(roleName);
                
                if (success) {
                    await interaction.reply({
                        content: `✅ 已将角色 "${roleName}" 从白名单移除`,
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: `⚠️ 角色 "${roleName}" 不在白名单中`,
                        ephemeral: true
                    });
                }
                break;
            }

            case 'list': {
                const whitelist = authManager.getWhitelist();
                
                const embed = new EmbedBuilder()
                    .setTitle('🛡️ 白名单信息')
                    .setColor(0x00AE86)
                    .addFields(
                        {
                            name: '👥 授权用户',
                            value: whitelist.users.length > 0 
                                ? whitelist.users.map(id => `<@${id}>`).join('\n')
                                : '无',
                            inline: true
                        },
                        {
                            name: '🎭 授权角色',
                            value: whitelist.roles.length > 0 
                                ? whitelist.roles.join('\n')
                                : '无',
                            inline: true
                        },
                        {
                            name: '👑 管理员',
                            value: whitelist.admins.length > 0 
                                ? whitelist.admins.map(id => `<@${id}>`).join('\n')
                                : '无',
                            inline: true
                        }
                    )
                    .setTimestamp();

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'reload': {
                authManager.reload();
                await interaction.reply({
                    content: '✅ 白名单配置已重新加载',
                    ephemeral: true
                });
                break;
            }
        }
    },
};