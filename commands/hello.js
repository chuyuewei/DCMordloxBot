const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('hello')
        .setDescription('向用户问好')
        .addUserOption(option =>
            option.setName('用户')
                .setDescription('要问好的用户')
                .setRequired(false)),
    async execute(interaction) {
        const user = interaction.options.getUser('用户') || interaction.user;
        await interaction.reply(`👋 你好, ${user}!`);
    },
};