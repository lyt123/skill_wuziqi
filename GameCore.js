// 游戏核心逻辑 - GameCore.js
class GameCore {
    constructor() {
        this.board = Array(15).fill(null).map(() => Array(15).fill(0));
        this.currentPlayer = 1; // 1为黑棋，2为白棋
        this.turnCount = 1;
        this.gameHistory = [];
        this.removedPieces = []; // 被移除的棋子
        this.gameLog = [];
        this.gameEnded = false;
        
        this.initBoard();
    }
    
    initBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';
        
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                boardElement.appendChild(cell);
            }
        }
    }
    
    handleCellClick(row, col) {
        if (this.gameEnded) return;
        
        // 如果是技能模式，委托给技能系统处理
        if (window.skillSystem && window.skillSystem.skillMode && window.skillSystem.selectedSkillForUse) {
            window.skillSystem.useSkill(window.skillSystem.selectedSkillForUse, row, col);
            return;
        }
        
        // 正常下棋
        if (this.board[row][col] === 0) {
            this.makeMove(row, col);
        }
    }
    
    makeMove(row, col) {
        // 保存历史状态
        this.saveGameState();
        
        this.board[row][col] = this.currentPlayer;
        this.updateCellDisplay(row, col);
        
        const playerName = this.currentPlayer === 1 ? '黑棋' : '白棋';
        this.addGameLog(`${playerName}在(${row + 1}, ${col + 1})华丽落子！✨`);
        
        // 检查胜利
        if (this.checkWin(row, col)) {
            this.gameEnded = true;
            this.addGameLog(`🎊 ${playerName}获得了最伟大的胜利！恭喜恭喜~ 🎉`);
            setTimeout(() => {
                alert(`🏆 恭喜${playerName}大获全胜！\n真是场精彩的对决呢~ 🎯`);
            }, 100);
            return;
        }
        
        // 切换玩家
        this.switchPlayer();
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
        this.turnCount++;
        
        // 通知技能系统更新冷却和效果
        if (window.skillSystem) {
            window.skillSystem.updateSkillCooldowns();
            window.skillSystem.updateSkillEffects();
        }
        
        // 更新UI
        if (window.uiManager) {
            window.uiManager.updateUI();
        }
    }
    
    updateCellDisplay(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (this.board[row][col] === 1) {
            cell.className = 'cell black';
            cell.textContent = '●';
        } else if (this.board[row][col] === 2) {
            cell.className = 'cell white';
            cell.textContent = '○';
        } else {
            cell.className = 'cell';
            cell.textContent = '';
        }
    }
    
    updateCellDisplayWithAnimation(row, col) {
        const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        
        // 添加渐变效果
        cell.style.transition = 'all 0.8s ease-in-out';
        cell.style.transform = 'scale(1.2)';
        cell.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.8)';
        
        setTimeout(() => {
            if (this.board[row][col] === 1) {
                cell.className = 'cell black';
                cell.textContent = '●';
            } else if (this.board[row][col] === 2) {
                cell.className = 'cell white';
                cell.textContent = '○';
            } else {
                cell.className = 'cell';
                cell.textContent = '';
            }
            
            setTimeout(() => {
                cell.style.transform = 'scale(1)';
                cell.style.boxShadow = '';
                setTimeout(() => {
                    cell.style.transition = '';
                }, 300);
            }, 100);
        }, 200);
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            let count = 1;
            
            // 检查正方向
            let r = row + dx, c = col + dy;
            while (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === player) {
                count++;
                r += dx;
                c += dy;
            }
            
            // 检查反方向
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < 15 && c >= 0 && c < 15 && this.board[r][c] === player) {
                count++;
                r -= dx;
                c -= dy;
            }
            
            if (count >= 5) return true;
        }
        
        return false;
    }
    
    saveGameState() {
        const state = {
            board: this.board.map(row => [...row]),
            currentPlayer: this.currentPlayer,
            turnCount: this.turnCount,
            removedPieces: [...this.removedPieces],
            skillCooldowns: window.skillSystem ? { ...window.skillSystem.playerSkillCooldowns } : {},
            skillEffects: window.skillSystem ? { ...window.skillSystem.skillEffects } : {}
        };
        this.gameHistory.push(state);
    }
    
    undoMove() {
        if (this.gameHistory.length === 0) {
            this.addGameLog('⚠️ 没有可以悔棋的步骤了~');
            return;
        }
        
        const lastState = this.gameHistory.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.turnCount = lastState.turnCount;
        this.removedPieces = lastState.removedPieces;
        this.gameEnded = false;
        
        // 恢复技能状态
        if (window.skillSystem && lastState.skillCooldowns) {
            window.skillSystem.playerSkillCooldowns = lastState.skillCooldowns;
            window.skillSystem.skillEffects = lastState.skillEffects;
        }
        
        // 重新渲染棋盘
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                this.updateCellDisplay(i, j);
            }
        }
        
        if (window.uiManager) {
            window.uiManager.updateUI();
        }
        this.addGameLog('⏪ 悔棋成功！时光倒退~');
    }
    
    startNewGame() {
        this.board = Array(15).fill(null).map(() => Array(15).fill(0));
        this.currentPlayer = 1;
        this.turnCount = 1;
        this.gameHistory = [];
        this.removedPieces = [];
        this.gameLog = [];
        this.gameEnded = false;
        
        // 重置技能系统
        if (window.skillSystem) {
            window.skillSystem.resetSkills();
        }
        
        // 重新渲染棋盘
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                this.updateCellDisplay(i, j);
            }
        }
        
        if (window.uiManager) {
            window.uiManager.updateUI();
        }
        this.addGameLog('🎮 游戏重新开始！让我们愉快地厮杀吧~');
    }
    
    addGameLog(message) {
        this.gameLog.push(message);
        if (window.uiManager) {
            window.uiManager.updateGameLog();
        }
    }
}
