// 技能系统 - SkillSystem.js
class SkillSystem {
    constructor() {
        this.selectedSkill = null;
        this.selectedSkillForUse = null;
        this.skillMode = false;
        
        // 使用外部配置
        this.skills = SKILL_CONFIG;
        
        // 技能冷却系统
        this.playerSkillCooldowns = {
            1: {}, // 黑棋技能冷却
            2: {}  // 白棋技能冷却
        };
        
        // 技能效果系统
        this.skillEffects = {
            silencedPlayer: null,
            silenceDuration: 0
        };
        
        this.initSkillCooldowns();
    }
    
    initSkillCooldowns() {
        Object.keys(this.skills).forEach(skillId => {
            this.playerSkillCooldowns[1][skillId] = 0;
            this.playerSkillCooldowns[2][skillId] = 0;
        });
    }
    
    selectSkillForDisplay(skillId) {
        console.log('设置选中技能:', skillId, '当前选中:', this.selectedSkill);
        this.selectedSkill = skillId;
        this.updateSkillDisplay();
        if (window.uiManager) {
            window.uiManager.updateUI();
        }
        console.log('技能选择完成，当前选中:', this.selectedSkill);
    }
    
    updateSkillDisplay() {
        const useSkillBtn = document.getElementById('useSkillBtn');
        
        if (!this.selectedSkill) {
            useSkillBtn.disabled = true;
            useSkillBtn.textContent = '🚀 使用技能';
            return;
        }
        
        const skill = this.skills[this.selectedSkill];
        const cooldown = this.playerSkillCooldowns[window.gameCore.currentPlayer][this.selectedSkill] || 0;
        const isSilenced = this.skillEffects.silencedPlayer === window.gameCore.currentPlayer;
        
        const canUse = cooldown === 0 && !isSilenced && !window.gameCore.gameEnded;
        useSkillBtn.disabled = !canUse;
        
        if (isSilenced) {
            useSkillBtn.textContent = '🤐 被沉默中...';
        } else if (cooldown > 0) {
            useSkillBtn.textContent = `⏳ 冷却中 (${cooldown}回合)`;
        } else {
            useSkillBtn.textContent = `🚀 使用 ${skill.name}`;
        }
    }
    
    confirmUseSkill() {
        if (!this.selectedSkill) return;
        
        const cooldown = this.playerSkillCooldowns[window.gameCore.currentPlayer][this.selectedSkill] || 0;
        const isSilenced = this.skillEffects.silencedPlayer === window.gameCore.currentPlayer;
        
        if (cooldown > 0) {
            window.gameCore.addGameLog(`技能还在冷却中，剩余${cooldown}回合`);
            return;
        }
        
        if (isSilenced) {
            window.gameCore.addGameLog('😵 你本回合被沉默，无法使用技能！');
            return;
        }
        
        this.selectedSkillForUse = this.selectedSkill;
        this.setSkillTargets(this.selectedSkill);
    }
    
    setSkillTargets(skillId) {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selectable');
        });
        
        this.skillMode = true;
        const skillName = this.skills[skillId].name;
        
        switch (skillId) {
            case 'flyStone':
                this.highlightOpponentPieces();
                window.gameCore.addGameLog(`🌪️ 准备使用${skillName}！请点击对手的棋子`);
                break;
            case 'pickGold':
            case 'cleanHouse':
            case 'silence':
            case 'reverseBoard':
            case 'clearAll':
                window.gameCore.addGameLog(`✨ 使用${skillName}！`);
                this.useSkill(skillId);
                break;
        }
    }
    
    highlightOpponentPieces() {
        const opponentPlayer = window.gameCore.currentPlayer === 1 ? 2 : 1;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (window.gameCore.board[i][j] === opponentPlayer) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    cell.classList.add('selectable');
                }
            }
        }
    }
    
    resetSkillSelection() {
        this.selectedSkillForUse = null;
        this.skillMode = false;
        
        document.querySelectorAll('.compact-skill-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selectable');
        });
        this.updateSkillDisplay();
    }
    
    useSkill(skillId, row = null, col = null) {
        const skill = this.skills[skillId];
        const playerName = window.gameCore.currentPlayer === 1 ? '黑棋' : '白棋';
        
        // 保存技能参数，等待延迟执行
        if (window.mediaManager) {
            window.mediaManager.pendingSkillParams = { skillId, row, col };
            window.mediaManager.playSkillVideo(skillId);
        }
        
        window.gameCore.addGameLog(`🎬 ${playerName}发动了${skill.name}！`);
    }
    
    executeSkillEffect(skillId, row, col) {
        const skill = this.skills[skillId];
        const playerName = window.gameCore.currentPlayer === 1 ? '黑棋' : '白棋';
        
        window.gameCore.saveGameState();
        window.gameCore.addGameLog(`🌟 ${skill.name} 正在生效...`);
        
        // 使用技能执行器执行具体效果
        switch (skillId) {
            case 'flyStone':
                SkillExecutor.executeFlyStone(row, col);
                break;
            case 'pickGold':
                SkillExecutor.executePickGold();
                break;
            case 'cleanHouse':
                SkillExecutor.executeCleanHouse();
                break;
            case 'silence':
                SkillExecutor.executeSilence();
                break;
            case 'reverseBoard':
                SkillExecutor.executeReverseBoard();
                break;
            case 'clearAll':
                SkillExecutor.executeClearAll();
                break;
        }
        
        this.playerSkillCooldowns[window.gameCore.currentPlayer][skillId] = skill.cooldown;
        this.resetSkillSelection();
        
        if (skillId !== 'reverseBoard') {
            window.gameCore.addGameLog(`💫 ${playerName}的${skill.name}生效完毕，可以继续下棋`);
        } else {
            window.gameCore.addGameLog(`💫 ${playerName}的${skill.name}生效完毕，交换执手`);
            window.gameCore.switchPlayer();
        }
        
        if (window.uiManager) {
            window.uiManager.updateUI();
        }
    }
    
    updateSkillCooldowns() {
        Object.keys(this.playerSkillCooldowns[window.gameCore.currentPlayer]).forEach(skillId => {
            if (this.playerSkillCooldowns[window.gameCore.currentPlayer][skillId] > 0) {
                this.playerSkillCooldowns[window.gameCore.currentPlayer][skillId]--;
            }
        });
    }
    
    updateSkillEffects() {
        if (this.skillEffects.silenceDuration > 0) {
            this.skillEffects.silenceDuration--;
            if (this.skillEffects.silenceDuration === 0) {
                this.skillEffects.silencedPlayer = null;
            }
        }
    }
    
    resetSkills() {
        this.selectedSkill = null;
        this.selectedSkillForUse = null;
        this.skillMode = false;
        this.skillEffects = {
            silencedPlayer: null,
            silenceDuration: 0
        };
        this.initSkillCooldowns();
    }
}