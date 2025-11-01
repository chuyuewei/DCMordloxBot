module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`🚀 ${client.user.tag} 已准备就绪!`);
        console.log(`📊 服务器数量: ${client.guilds.cache.size}`);
        console.log(`👥 用户数量: ${client.users.cache.size}`);
        
        // 设置Bot状态
        client.user.setActivity('使用 /help 获取帮助', { type: 'PLAYING' });
    },
};