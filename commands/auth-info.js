const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const authManager = require('../utils/auth');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('auth-info')
        .setDescription('查看你的授权状态'),
    async execute(interaction) {
        const userId = interaction.user.id;
        const member = interaction.member;
        const isAuthorized = authManager.isAuthorized(interaction);
        const isAdmin = authManager.isAdmin(userId);

        let userRoles = [];
        if (member && member.roles && member.roles.cache) {
            userRoles = member.roles.cache
                .filter(role => role.name !== '@everyone')
                .map(role => role.name);
        }

        const embed = new EmbedBuilder()
            .setTitle('🔐 你的授权信息')
            .setColor(isAuthorized ? 0x00FF00 : 0xFF0000)
            .addFields(
                {
                    name: '👤 用户信息',
                    value: `用户: ${interaction.user.tag}\nID: ${userId}`,
                    inline: false
                },
                {
                    name: '🛡️ 授权状态',
                    value: isAuthorized ? '✅ 已授权' : '❌ 未授权',
                    inline: true
                },
                {
                    name: '👑 管理员权限',
                    value: isAdmin ? '✅ 是' : '❌ 否',
                    inline: true
                },
                {
                    name: '🎭 你的角色',
                    value: userRoles.length > 0 ? userRoles.join(', ') : '无特殊角色',
                    inline: false
                }
            )
            .setTimestamp()
            .setFooter({ text: '如需授权请联系管理员' });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    },
};