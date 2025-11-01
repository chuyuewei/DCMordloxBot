const { SlashCommandBuilder, ActivityType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('status')
        .setDescription('设置机器人状态')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('设置机器人活动状态')
                .addStringOption(option =>
                    option.setName('类型')
                        .setDescription('活动类型')
                        .setRequired(true)
                        .addChoices(
                            { name: '🎮 正在玩', value: 'playing' },
                            { name: '🎵 正在听', value: 'listening' },
                            { name: '📺 正在看', value: 'watching' },
                            { name: '🎯 正在竞争', value: 'competing' },
                            { name: '📱 正在直播', value: 'streaming' }
                        ))
                .addStringOption(option =>
                    option.setName('内容')
                        .setDescription('活动内容')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('链接')
                        .setDescription('直播链接 (仅直播类型需要)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('online')
                .setDescription('设置为在线状态'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('idle')
                .setDescription('设置为离开状态'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dnd')
                .setDescription('设置为请勿打扰状态'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('invisible')
                .setDescription('设置为隐身状态'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clear')
                .setDescription('清除活动状态'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('查看当前状态')),
    adminOnly: true,
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'set': {
                const type = interaction.options.getString('类型');
                const content = interaction.options.getString('内容');
                const url = interaction.options.getString('链接');

                let activityType;
                let activityName;

                switch (type) {
                    case 'playing':
                        activityType = ActivityType.Playing;
                        activityName = '正在玩';
                        break;
                    case 'listening':
                        activityType = ActivityType.Listening;
                        activityName = '正在听';
                        break;
                    case 'watching':
                        activityType = ActivityType.Watching;
                        activityName = '正在看';
                        break;
                    case 'competing':
                        activityType = ActivityType.Competing;
                        activityName = '正在竞争';
                        break;
                    case 'streaming':
                        activityType = ActivityType.Streaming;
                        activityName = '正在直播';
                        if (!url) {
                            return await interaction.reply({
                                content: '❌ 直播类型需要提供直播链接！',
                                ephemeral: true
                            });
                        }
                        break;
                }

                try {
                    const options = {
                        type: activityType
                    };

                    if (type === 'streaming' && url) {
                        options.url = url;
                    }

                    await interaction.client.user.setActivity(content, options);

                    await interaction.reply({
                        content: `✅ 已设置机器人状态为: ${activityName} ${content}${type === 'streaming' && url ? `\n🔗 直播链接: ${url}` : ''}`,
                        ephemeral: true
                    });

                    console.log(`🤖 机器人状态已更新: ${activityName} ${content} | 执行者: ${interaction.user.tag}`);
                } catch (error) {
                    console.error('设置机器人状态时出错:', error);
                    await interaction.reply({
                        content: '❌ 设置机器人状态失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'online': {
                try {
                    await interaction.client.user.setStatus('online');
                    await interaction.reply({
                        content: '✅ 已设置机器人为在线状态 🟢',
                        ephemeral: true
                    });
                    console.log(`🤖 机器人状态已更新: 在线 | 执行者: ${interaction.user.tag}`);
                } catch (error) {
                    console.error('设置机器人状态时出错:', error);
                    await interaction.reply({
                        content: '❌ 设置机器人状态失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'idle': {
                try {
                    await interaction.client.user.setStatus('idle');
                    await interaction.reply({
                        content: '✅ 已设置机器人为离开状态 🟡',
                        ephemeral: true
                    });
                    console.log(`🤖 机器人状态已更新: 离开 | 执行者: ${interaction.user.tag}`);
                } catch (error) {
                    console.error('设置机器人状态时出错:', error);
                    await interaction.reply({
                        content: '❌ 设置机器人状态失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'dnd': {
                try {
                    await interaction.client.user.setStatus('dnd');
                    await interaction.reply({
                        content: '✅ 已设置机器人为请勿打扰状态 🔴',
                        ephemeral: true
                    });
                    console.log(`🤖 机器人状态已更新: 请勿打扰 | 执行者: ${interaction.user.tag}`);
                } catch (error) {
                    console.error('设置机器人状态时出错:', error);
                    await interaction.reply({
                        content: '❌ 设置机器人状态失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'invisible': {
                try {
                    await interaction.client.user.setStatus('invisible');
                    await interaction.reply({
                        content: '✅ 已设置机器人为隐身状态 ⚫',
                        ephemeral: true
                    });
                    console.log(`🤖 机器人状态已更新: 隐身 | 执行者: ${interaction.user.tag}`);
                } catch (error) {
                    console.error('设置机器人状态时出错:', error);
                    await interaction.reply({
                        content: '❌ 设置机器人状态失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'clear': {
                try {
                    await interaction.client.user.setActivity(null);
                    await interaction.reply({
                        content: '✅ 已清除机器人活动状态',
                        ephemeral: true
                    });
                    console.log(`🤖 机器人活动状态已清除 | 执行者: ${interaction.user.tag}`);
                } catch (error) {
                    console.error('清除机器人状态时出错:', error);
                    await interaction.reply({
                        content: '❌ 清除机器人状态失败！',
                        ephemeral: true
                    });
                }
                break;
            }

            case 'info': {
                const client = interaction.client;
                const presence = client.user.presence;
                
                let statusText = '未知';
                let statusEmoji = '❓';
                
                switch (presence.status) {
                    case 'online':
                        statusText = '在线';
                        statusEmoji = '🟢';
                        break;
                    case 'idle':
                        statusText = '离开';
                        statusEmoji = '🟡';
                        break;
                    case 'dnd':
                        statusText = '请勿打扰';
                        statusEmoji = '🔴';
                        break;
                    case 'invisible':
                        statusText = '隐身';
                        statusEmoji = '⚫';
                        break;
                }

                let activityInfo = '无活动';
                if (presence.activities && presence.activities.length > 0) {
                    const activity = presence.activities[0];
                    let activityTypeText = '';
                    
                    switch (activity.type) {
                        case ActivityType.Playing:
                            activityTypeText = '🎮 正在玩';
                            break;
                        case ActivityType.Listening:
                            activityTypeText = '🎵 正在听';
                            break;
                        case ActivityType.Watching:
                            activityTypeText = '📺 正在看';
                            break;
                        case ActivityType.Competing:
                            activityTypeText = '🎯 正在竞争';
                            break;
                        case ActivityType.Streaming:
                            activityTypeText = '📱 正在直播';
                            break;
                    }
                    
                    activityInfo = `${activityTypeText} ${activity.name}`;
                    if (activity.url) {
                        activityInfo += `\n🔗 链接: ${activity.url}`;
                    }
                }

                await interaction.reply({
                    content: `🤖 **机器人当前状态**\n\n${statusEmoji} **状态**: ${statusText}\n🎭 **活动**: ${activityInfo}`,
                    ephemeral: true
                });
                break;
            }
        }
    },
};