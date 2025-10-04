// UI管理 - UIManager.js
class UIManager {
    constructor() {
        // UI管理不需要特殊的初始化
    }
    
    updateUI() {
        this.updatePlayerDisplay();
        this.updateSkillDisplay();
        this.updateGameLog();
    }
    
    updatePlayerDisplay() {
        // 更新当前玩家显示
        const currentPlayerElement = document.getElementById('currentPlayer');
        if (currentPlayerElement && window.gameCore) {
            const isBlack = window.gameCore.currentPlayer === 1;
            currentPlayerElement.textContent = isBlack ? '黑棋' : '白棋';
            
            // 动态改变父元素背景色，让当前玩家更明显
            const statusItem = currentPlayerElement.closest('.status-item');
            if (statusItem) {
                if (isBlack) {
                    statusItem.style.backgroundColor = '#2c3e50';
                    statusItem.style.color = '#fff';
                    statusItem.style.borderColor = '#2c3e50';
                } else {
                    statusItem.style.backgroundColor = '#ecf0f1';
                    statusItem.style.color = '#333';
                    statusItem.style.borderColor = '#bdc3c7';
                }
            }
        }
        
        // 更新回合数显示
        const turnCountElement = document.getElementById('turnCount');
        if (turnCountElement && window.gameCore) {
            turnCountElement.textContent = window.gameCore.turnCount;
        }
    }
    
    updateSkillDisplay() {
        if (!window.skillSystem || !window.gameCore) return;
        
        // 检查是否被沉默
        const isSilenced = window.skillSystem.skillEffects.silencedPlayer === window.gameCore.currentPlayer;
        
        // 更新紧凑技能显示
        document.querySelectorAll('.compact-skill-item').forEach(item => {
            const skillId = item.dataset.skill;
            const cooldown = window.skillSystem.playerSkillCooldowns[window.gameCore.currentPlayer][skillId] || 0;
            const cdText = item.querySelector('.cd-text');
            
            // 先移除所有状态类
            item.classList.remove('on-cooldown');
            
            if (isSilenced) {
                // 被沉默时，所有技能都不可用
                cdText.textContent = '被沉默';
                item.classList.add('on-cooldown');
            } else if (cooldown > 0) {
                // 冷却中
                cdText.textContent = `${cooldown}回合`;
                item.classList.add('on-cooldown');
            } else {
                // 可用状态
                cdText.textContent = window.skillSystem.skills[skillId].cooldown + '回合';
            }
            
            // 更新选中状态
            if (window.skillSystem.selectedSkill === skillId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // 更新技能使用按钮
        if (window.skillSystem.updateSkillDisplay) {
            window.skillSystem.updateSkillDisplay();
        }
    }
    
    updateGameLog() {
        if (!window.gameCore) return;
        
        const gameLogElement = document.getElementById('gameLog');
        if (gameLogElement) {
            gameLogElement.innerHTML = '';
            
            // 只显示最近的10条日志
            const recentLogs = window.gameCore.gameLog.slice(-10);
            recentLogs.forEach(message => {
                const logItem = document.createElement('div');
                logItem.className = 'log-item';
                logItem.textContent = message;
                gameLogElement.appendChild(logItem);
            });
            
            // 滚动到底部
            gameLogElement.scrollTop = gameLogElement.scrollHeight;
        }
    }
    
    showMessage(message, type = 'info') {
        // 可以扩展为显示不同类型的消息
        if (window.gameCore) {
            window.gameCore.addGameLog(message);
        }
    }
    
    showAlert(message) {
        alert(message);
    }
    
    confirmAction(message) {
        return confirm(message);
    }
    
    // 工具方法：高亮元素
    highlightElement(selector, duration = 2000) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.transition = 'all 0.3s ease';
            element.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.8)';
            element.style.transform = 'scale(1.05)';
            
            setTimeout(() => {
                element.style.boxShadow = '';
                element.style.transform = '';
                setTimeout(() => {
                    element.style.transition = '';
                }, 300);
            }, duration);
        }
    }
    
    // 工具方法：显示加载状态
    showLoading(show = true) {
        let loadingElement = document.getElementById('loading');
        
        if (show) {
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.id = 'loading';
                loadingElement.innerHTML = '⏳ 处理中...';
                loadingElement.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    z-index: 10000;
                    font-size: 1.2rem;
                `;
                document.body.appendChild(loadingElement);
            }
            loadingElement.style.display = 'block';
        } else {
            if (loadingElement) {
                loadingElement.style.display = 'none';
            }
        }
    }
    
    // 工具方法：动画效果
    animateElement(selector, animationClass, duration = 1000) {
        const element = document.querySelector(selector);
        if (element) {
            element.classList.add(animationClass);
            setTimeout(() => {
                element.classList.remove(animationClass);
            }, duration);
        }
    }
    
    // 响应式布局检查
    checkResponsiveLayout() {
        const width = window.innerWidth;
        const body = document.body;
        
        // 移除所有响应式类
        body.classList.remove('mobile', 'tablet', 'desktop');
        
        // 根据屏幕宽度添加对应类
        if (width <= 480) {
            body.classList.add('mobile');
        } else if (width <= 768) {
            body.classList.add('tablet');
        } else {
            body.classList.add('desktop');
        }
    }
    
    // 初始化响应式监听
    initResponsiveListener() {
        window.addEventListener('resize', () => {
            this.checkResponsiveLayout();
        });
        this.checkResponsiveLayout(); // 初始检查
    }
}
