// 技能配置 - SkillConfig.js
const SKILL_CONFIG = {
    flyStone: { 
        name: '飞沙走石', 
        cooldown: 3, 
        description: '选择一个对手的棋子扔出棋盘',
        icon: '🌪️'
    },
    pickGold: { 
        name: '拾金不昧', 
        cooldown: 5, 
        description: '在棋盘空位随机生成一颗自己的棋子',
        icon: '♻️'
    },
    cleanHouse: { 
        name: '保洁上门', 
        cooldown: 7, 
        description: '随机清理对手1-3个棋子',
        icon: '🧹'
    },
    silence: { 
        name: '静如止水', 
        cooldown: 10, 
        description: '禁用对手下回合的技能使用',
        icon: '⏸️'
    },
    reverseBoard: { 
        name: '两级反转', 
        cooldown: 999, 
        description: '交换棋盘中双方的棋子',
        icon: '🔄'
    },
    clearAll: { 
        name: '力拔山兮', 
        cooldown: 999, 
        description: '清空棋盘中所有棋子',
        icon: '💥'
    }
};
