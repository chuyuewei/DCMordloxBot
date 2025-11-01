const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('发送公告消息')
        .addSubcommand(subcommand =>
            subcommand
                .setName('send')
                .setDescription('发送普通公告消息')
                .addChannelOption(option =>
                    option.setName('频道')
                        .setDescription('要发送公告的频道')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('内容')
                        .setDescription('公告内容')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('提及所有人')
                        .setDescription('是否提及 @everyone')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('embed')
                .setDescription('发送嵌入式公告消息')
                .addChannelOption(option =>
                    option.setName('频道')
                        .setDescription('要发送公告的频道')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('标题')
                        .setDescription('公告标题')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('内容')
                        .setDescription('公告内容')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('颜色')
                        .setDescription('嵌入消息颜色')
                        .setRequired(false)
                        .addChoices(
                            { name: '🔴 红色', value: 'red' },
                            { name: '🟢 绿色', value: 'green' },
                            { name: '🔵 蓝色', value: 'blue' },
                            { name: '🟡 黄色', value: 'yellow' },
                            { name: '🟣 紫色', value: 'purple' },
                            { name: '🟠 橙色', value: 'orange' },
                            { name: '⚫ 黑色', value: 'black' }
                        ))
                .addStringOption(option =>
                    option.setName('图片链接')
                        .setDescription('公告图片URL (可选)')
                        .setRequired(false))
                .addBooleanOption(option =>
                    option.setName('提及所有人')
                        .setDescription('是否提及 @everyone')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('预览公告消息 (不发送)')
                .addStringOption(option =>
                    option.setName('标题')
                        .setDescription('公告标题')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('内容')
                        .setDescription('公告内容')
                        .setRequired(true)))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    adminOnly: true,
    async execute(interaction) {
        // 检查是否在服务器中使用命令
        if (!interaction.guild) {
            return await interaction.reply({
                content: '❌ 此命令只能在服务器中使用！',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'send': {
                const channel = interaction.options.getChannel('频道');
                const content = interaction.options.getString('内容');
                const mentionEveryone = interaction.options.getBoolean('提及所有人') || false;

                // 检查频道类型
                if (!channel.isTextBased()) {
                    return await interaction.reply({
                        content: '❌ 只能向文字频道发送公告！',
                        ephemeral: true
                    });
                }

                // 检查机器人权限
                if (!channel.permissionsFor(interaction.guild.members.me).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel])) {
                    return await interaction.reply({
                        content: '❌ 机器人没有在该频道发送消息的权限！',
                        ephemeral: true
                    });
                }

                // 检查 @everyone 权限
                if (mentionEveryone && !channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.MentionEveryone)) {
                    return await interaction.reply({
                        content: '❌ 机器人没有提及所有人的权限！',
                        ephemeral: true
                    });
                }

                try {
                    const messageContent = mentionEveryone ? `@everyone\n\n${content}` : content;
                    
                    await channel.send({
                        content: messageContent,
                        allowedMentions: mentionEveryone ? { everyone: true } : { everyone: false }
                    });

                    await interaction.reply({
                        content: `✅ 公告已成功发送到 ${channel}！`,
                        ephemeral: true
                    });

                    console.log(`📢 公告发送: ${interaction.user.tag} -> ${channel.name} | 内容: ${content.substring(0, 50)}...`);

                } catch (error) {
                    console.error('发送公告失败:', error);
                    await interaction.reply({
                        content: '❌ 发送公告失败！请检查权限设置。',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'embed': {
                const channel = interaction.options.getChannel('频道');
                const title = interaction.options.getString('标题');
                const content = interaction.options.getString('内容');
                const colorChoice = interaction.options.getString('颜色') || 'blue';
                const imageUrl = interaction.options.getString('图片链接');
                const mentionEveryone = interaction.options.getBoolean('提及所有人') || false;

                // 检查频道类型
                if (!channel.isTextBased()) {
                    return await interaction.reply({
                        content: '❌ 只能向文字频道发送公告！',
                        ephemeral: true
                    });
                }

                // 检查机器人权限
                if (!channel.permissionsFor(interaction.guild.members.me).has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks])) {
                    return await interaction.reply({
                        content: '❌ 机器人没有在该频道发送嵌入消息的权限！',
                        ephemeral: true
                    });
                }

                // 检查 @everyone 权限
                if (mentionEveryone && !channel.permissionsFor(interaction.guild.members.me).has(PermissionFlagsBits.MentionEveryone)) {
                    return await interaction.reply({
                        content: '❌ 机器人没有提及所有人的权限！',
                        ephemeral: true
                    });
                }

                // 颜色映射
                const colors = {
                    red: 0xFF0000,
                    green: 0x00FF00,
                    blue: 0x0099FF,
                    yellow: 0xFFFF00,
                    purple: 0x9932CC,
                    orange: 0xFF8C00,
                    black: 0x000000
                };

                try {
                    const embed = new EmbedBuilder()
                        .setTitle(title)
                        .setDescription(content)
                        .setColor(colors[colorChoice])
                        .setTimestamp()
                        .setFooter({ 
                            text: `公告发布者: ${interaction.user.tag}`,
                            iconURL: interaction.user.displayAvatarURL()
                        });

                    if (imageUrl) {
                        // 简单的URL验证
                        try {
                            new URL(imageUrl);
                            embed.setImage(imageUrl);
                        } catch (urlError) {
                            return await interaction.reply({
                                content: '❌ 图片链接格式无效！',
                                ephemeral: true
                            });
                        }
                    }

                    const messageOptions = {
                        embeds: [embed],
                        allowedMentions: mentionEveryone ? { everyone: true } : { everyone: false }
                    };

                    if (mentionEveryone) {
                        messageOptions.content = '@everyone';
                    }

                    await channel.send(messageOptions);

                    await interaction.reply({
                        content: `✅ 嵌入式公告已成功发送到 ${channel}！`,
                        ephemeral: true
                    });

                    console.log(`📢 嵌入式公告发送: ${interaction.user.tag} -> ${channel.name} | 标题: ${title}`);

                } catch (error) {
                    console.error('发送嵌入式公告失败:', error);
                    await interaction.reply({
                        content: '❌ 发送嵌入式公告失败！请检查权限设置。',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'schedule': {
                const title = interaction.options.getString('标题');
                const content = interaction.options.getString('内容');

                const previewEmbed = new EmbedBuilder()
                    .setTitle(`📋 公告预览: ${title}`)
                    .setDescription(content)
                    .setColor(0x00AE86)
                    .setTimestamp()
                    .setFooter({ 
                        text: `预览 - 发布者: ${interaction.user.tag}`,
                        iconURL: interaction.user.displayAvatarURL()
                    });

                await interaction.reply({
                    content: '📋 **公告预览** (此消息不会发送到其他频道)',
                    embeds: [previewEmbed],
                    ephemeral: true
                });
                break;
            }
        }
    },
};