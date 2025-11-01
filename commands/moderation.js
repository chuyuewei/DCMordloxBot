const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('moderation')
        .setDescription('管理工具')
        .addSubcommand(subcommand =>
            subcommand
                .setName('banlist')
                .setDescription('查看封禁列表'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('userinfo')
                .setDescription('查看用户信息')
                .addUserOption(option =>
                    option.setName('用户')
                        .setDescription('要查看的用户')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('serverinfo')
                .setDescription('查看服务器信息'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
    adminOnly: true,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'banlist': {
                try {
                    const bans = await interaction.guild.bans.fetch();
                    
                    if (bans.size === 0) {
                        return await interaction.reply({
                            content: '✅ 当前没有被封禁的用户。',
                            ephemeral: true
                        });
                    }

                    const banList = bans.map((ban, index) => {
                        const user = ban.user;
                        const reason = ban.reason || '未提供原因';
                        return `${index + 1}. **${user.tag}** (${user.id})\n   原因: ${reason}`;
                    }).slice(0, 10); // 限制显示前10个

                    const embed = new EmbedBuilder()
                        .setTitle(`🔨 封禁列表 (${bans.size} 个用户)`)
                        .setDescription(banList.join('\n\n'))
                        .setColor(0xFF0000)
                        .setTimestamp()
                        .setFooter({ text: bans.size > 10 ? '仅显示前10个封禁用户' : '' });

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('获取封禁列表时出错:', error);
                    await interaction.reply({
                        content: '❌ 获取封禁列表失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'userinfo': {
                const targetUser = interaction.options.getUser('用户');
                
                try {
                    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
                    
                    const embed = new EmbedBuilder()
                        .setTitle(`👤 用户信息: ${targetUser.tag}`)
                        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                        .setColor(member ? 0x00FF00 : 0xFF0000)
                        .addFields(
                            {
                                name: '🆔 用户ID',
                                value: targetUser.id,
                                inline: true
                            },
                            {
                                name: '📅 账号创建时间',
                                value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:F>`,
                                inline: true
                            },
                            {
                                name: '🤖 是否为机器人',
                                value: targetUser.bot ? '是' : '否',
                                inline: true
                            }
                        );

                    if (member) {
                        const roles = member.roles.cache
                            .filter(role => role.name !== '@everyone')
                            .map(role => role.toString())
                            .slice(0, 10);

                        embed.addFields(
                            {
                                name: '📥 加入服务器时间',
                                value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:F>`,
                                inline: true
                            },
                            {
                                name: '🎭 角色数量',
                                value: `${member.roles.cache.size - 1}`,
                                inline: true
                            },
                            {
                                name: '🏆 最高角色',
                                value: member.roles.highest.toString(),
                                inline: true
                            }
                        );

                        if (roles.length > 0) {
                            embed.addFields({
                                name: '🎭 角色列表',
                                value: roles.join(', ') + (member.roles.cache.size > 11 ? '...' : ''),
                                inline: false
                            });
                        }
                    } else {
                        embed.addFields({
                            name: '⚠️ 状态',
                            value: '用户不在此服务器中',
                            inline: false
                        });
                    }

                    embed.setTimestamp();

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('获取用户信息时出错:', error);
                    await interaction.reply({
                        content: '❌ 获取用户信息失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'serverinfo': {
                try {
                    const guild = interaction.guild;
                    const owner = await guild.fetchOwner();
                    
                    const embed = new EmbedBuilder()
                        .setTitle(`🏰 服务器信息: ${guild.name}`)
                        .setThumbnail(guild.iconURL({ dynamic: true }))
                        .setColor(0x00AE86)
                        .addFields(
                            {
                                name: '🆔 服务器ID',
                                value: guild.id,
                                inline: true
                            },
                            {
                                name: '👑 服务器所有者',
                                value: owner.user.tag,
                                inline: true
                            },
                            {
                                name: '📅 创建时间',
                                value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:F>`,
                                inline: true
                            },
                            {
                                name: '👥 成员数量',
                                value: `${guild.memberCount}`,
                                inline: true
                            },
                            {
                                name: '🎭 角色数量',
                                value: `${guild.roles.cache.size}`,
                                inline: true
                            },
                            {
                                name: '📢 频道数量',
                                value: `${guild.channels.cache.size}`,
                                inline: true
                            },
                            {
                                name: '🔒 验证等级',
                                value: guild.verificationLevel.toString(),
                                inline: true
                            },
                            {
                                name: '🛡️ 内容过滤',
                                value: guild.explicitContentFilter.toString(),
                                inline: true
                            },
                            {
                                name: '📊 提升等级',
                                value: `等级 ${guild.premiumTier} (${guild.premiumSubscriptionCount} 个提升)`,
                                inline: true
                            }
                        )
                        .setTimestamp();

                    if (guild.description) {
                        embed.addFields({
                            name: '📝 服务器描述',
                            value: guild.description,
                            inline: false
                        });
                    }

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error('获取服务器信息时出错:', error);
                    await interaction.reply({
                        content: '❌ 获取服务器信息失败！',
                        ephemeral: true
                    });
                }
                break;
            }
        }
    },
};