const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createserver')
        .setDescription('创建新的Discord服务器并邀请你加入')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('服务器名称')
                .setRequired(true)
                .setMaxLength(100))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('服务器描述')
                .setRequired(false)
                .setMaxLength(120))
        .addAttachmentOption(option =>
            option.setName('icon')
                .setDescription('服务器图标 (可选)')
                .setRequired(false)),
    adminOnly: true,
    async execute(interaction) {
        const serverName = interaction.options.getString('name');
        const serverDescription = interaction.options.getString('description');
        const serverIcon = interaction.options.getAttachment('icon');

        // 检查服务器名称长度和内容
        if (serverName.length < 2) {
            return await interaction.reply({
                content: '❌ 服务器名称至少需要2个字符！',
                ephemeral: true
            });
        }

        // 检查图标文件类型
        if (serverIcon) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(serverIcon.contentType)) {
                return await interaction.reply({
                    content: '❌ 服务器图标必须是图片文件 (PNG, JPG, GIF, WebP)！',
                    ephemeral: true
                });
            }

            // 检查文件大小 (Discord限制为8MB，但我们设置更小的限制)
            if (serverIcon.size > 8 * 1024 * 1024) {
                return await interaction.reply({
                    content: '❌ 服务器图标文件大小不能超过8MB！',
                    ephemeral: true
                });
            }
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            // 创建服务器的选项
            const guildOptions = {
                name: serverName,
                channels: [
                    {
                        name: '欢迎',
                        type: ChannelType.GuildText,
                        topic: '欢迎来到服务器！'
                    },
                    {
                        name: '一般聊天',
                        type: ChannelType.GuildText,
                        topic: '日常聊天频道'
                    },
                    {
                        name: '语音聊天',
                        type: ChannelType.GuildVoice,
                        userLimit: 10
                    }
                ],
                roles: [
                    {
                        name: '成员',
                        color: 0x3498db,
                        permissions: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory,
                            PermissionFlagsBits.Connect,
                            PermissionFlagsBits.Speak
                        ]
                    }
                ]
            };

            // 如果有图标，添加到选项中
            if (serverIcon) {
                guildOptions.icon = serverIcon.url;
            }

            // 创建服务器
            const newGuild = await interaction.client.guilds.create(guildOptions);

            console.log(`🏰 新服务器已创建: ${newGuild.name} (${newGuild.id}) | 创建者: ${interaction.user.tag}`);

            // 等待服务器完全创建
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                // 创建邀请链接
                const welcomeChannel = newGuild.channels.cache.find(channel => 
                    channel.type === ChannelType.GuildText && channel.name === '欢迎'
                );

                if (!welcomeChannel) {
                    throw new Error('找不到欢迎频道');
                }

                const invite = await welcomeChannel.createInvite({
                    maxAge: 0, // 永不过期
                    maxUses: 1, // 只能使用一次
                    unique: true,
                    reason: `为 ${interaction.user.tag} 创建的邀请`
                });

                // 设置服务器描述
                if (serverDescription) {
                    try {
                        await newGuild.edit({ description: serverDescription });
                    } catch (error) {
                        console.log('设置服务器描述失败:', error.message);
                    }
                }

                // 在欢迎频道发送欢迎消息
                try {
                    await welcomeChannel.send({
                        content: `🎉 **欢迎来到 ${newGuild.name}！**\n\n👋 这个服务器是由 ${interaction.user} 通过机器人创建的。\n\n📋 **服务器信息:**\n• 服务器名称: ${newGuild.name}\n• 创建时间: <t:${Math.floor(newGuild.createdTimestamp / 1000)}:F>\n• 服务器ID: ${newGuild.id}\n\n🎊 享受你的新服务器吧！`
                    });
                } catch (error) {
                    console.log('发送欢迎消息失败:', error.message);
                }

                // 回复用户
                await interaction.editReply({
                    content: `✅ **服务器创建成功！**\n\n🏰 **服务器名称:** ${newGuild.name}\n🆔 **服务器ID:** ${newGuild.id}\n👥 **成员数量:** ${newGuild.memberCount}\n📅 **创建时间:** <t:${Math.floor(newGuild.createdTimestamp / 1000)}:F>\n\n🔗 **邀请链接:** ${invite.url}\n\n⚠️ **注意:** 邀请链接只能使用一次，请妥善保管！`
                });

            } catch (inviteError) {
                console.error('创建邀请链接失败:', inviteError);
                
                // 即使邀请创建失败，也要告知用户服务器创建成功
                await interaction.editReply({
                    content: `✅ **服务器创建成功！**\n\n🏰 **服务器名称:** ${newGuild.name}\n🆔 **服务器ID:** ${newGuild.id}\n\n⚠️ **注意:** 无法创建邀请链接，请手动在服务器中创建邀请。\n\n你可以在Discord的服务器列表中找到新创建的服务器。`
                });
            }

        } catch (error) {
            console.error('创建服务器失败:', error);
            
            let errorMessage = '❌ 创建服务器失败！';
            
            if (error.code === 50013) {
                errorMessage = '❌ 机器人没有创建服务器的权限！';
            } else if (error.code === 50035) {
                errorMessage = '❌ 服务器名称包含无效字符或格式错误！';
            } else if (error.message.includes('Maximum number of guilds reached')) {
                errorMessage = '❌ 机器人已达到最大服务器数量限制！';
            } else if (error.message.includes('icon')) {
                errorMessage = '❌ 服务器图标格式或大小不符合要求！';
            }

            await interaction.editReply({
                content: `${errorMessage}\n\n🔍 **错误详情:** ${error.message}`
            });
        }
    },
};