const fs = require('fs');
const path = require('path');

class AuthManager {
    constructor() {
        this.whitelistPath = path.join(__dirname, '../config/whitelist.json');
        this.loadWhitelist();
    }

    loadWhitelist() {
        try {
            const data = fs.readFileSync(this.whitelistPath, 'utf8');
            this.whitelist = JSON.parse(data);
        } catch (error) {
            console.error('❌ 加载白名单失败:', error);
            this.whitelist = { users: [], roles: [], admins: [] };
        }
    }

    saveWhitelist() {
        try {
            fs.writeFileSync(this.whitelistPath, JSON.stringify(this.whitelist, null, 2));
            return true;
        } catch (error) {
            console.error('❌ 保存白名单失败:', error);
            return false;
        }
    }

    // 检查用户是否有权限
    isAuthorized(interaction) {
        const userId = interaction.user.id;
        const member = interaction.member;

        // 检查用户ID白名单
        if (this.whitelist.users.includes(userId)) {
            return true;
        }

        // 检查角色白名单
        if (member && member.roles && member.roles.cache) {
            const userRoles = member.roles.cache.map(role => role.name);
            const hasAuthorizedRole = userRoles.some(role => 
                this.whitelist.roles.includes(role)
            );
            if (hasAuthorizedRole) {
                return true;
            }
        }

        return false;
    }

    // 检查是否为管理员
    isAdmin(userId) {
        return this.whitelist.admins.includes(userId);
    }

    // 添加用户到白名单
    addUser(userId) {
        if (!this.whitelist.users.includes(userId)) {
            this.whitelist.users.push(userId);
            return this.saveWhitelist();
        }
        return false;
    }

    // 从白名单移除用户
    removeUser(userId) {
        const index = this.whitelist.users.indexOf(userId);
        if (index > -1) {
            this.whitelist.users.splice(index, 1);
            return this.saveWhitelist();
        }
        return false;
    }

    // 添加角色到白名单
    addRole(roleName) {
        if (!this.whitelist.roles.includes(roleName)) {
            this.whitelist.roles.push(roleName);
            return this.saveWhitelist();
        }
        return false;
    }

    // 从白名单移除角色
    removeRole(roleName) {
        const index = this.whitelist.roles.indexOf(roleName);
        if (index > -1) {
            this.whitelist.roles.splice(index, 1);
            return this.saveWhitelist();
        }
        return false;
    }

    // 获取白名单信息
    getWhitelist() {
        return {
            users: [...this.whitelist.users],
            roles: [...this.whitelist.roles],
            admins: [...this.whitelist.admins]
        };
    }

    // 重新加载白名单
    reload() {
        this.loadWhitelist();
    }
}

module.exports = new AuthManager();