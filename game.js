// 游戏状态管理
class SkillGomokuGame {
    constructor() {
        this.board = Array(15).fill(null).map(() => Array(15).fill(0));
        this.currentPlayer = 1; // 1为黑棋，2为白棋
        this.turnCount = 1;
        this.gameHistory = [];
        this.removedPieces = []; // 被移除的棋子
        this.gameLog = [];
        this.selectedSkill = null;
        this.selectedSkillForUse = null;
        this.skillMode = false;
        
        // 音视频管理
        this.bgmAudio = null;
        this.skillVideo = null;
        this.isVideoPlaying = false;
        
        // 技能视频资源映射
        this.skillVideoMap = {
            'flyStone': ['飞沙走石.mp4', '飞沙走石1.mp4', '飞沙走石3.mp4'],
            'pickGold': ['拾金不昧.mp4'],
            'cleanHouse': ['保洁上门.mp4', '保洁上门2.mp4'],
            'silence': ['静如止水.mp4', '静如止水2.mp4'],
            'reverseBoard': ['两级反转.mp4'],
            'clearAll': ['力拔山兮.mp4', '力拔山兮2.mp4', '力拔山兮3.mp4']
        };
        
        // 技能配置
        this.skills = {
            flyStone: { 
                name: '飞沙走石', 
                cooldown: 3, 
                description: '选择一个对手的棋子扔出棋盘',
                icon: '🌪️'
            },
            pickGold: { 
                name: '拾金不昧', 
                cooldown: 5, 
                description: '将被扔走的棋子随机恢复到棋盘',
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
        
        // 玩家技能冷却状态
        this.playerSkillCooldowns = {
            1: {}, // 黑棋玩家
            2: {}  // 白棋玩家
        };
        
        // 技能效果状态
        this.skillEffects = {
            silenced: 0,       // 沉默剩余回合
            silencedPlayer: 0  // 被沉默的玩家
        };
        
        this.gameEnded = false;
        this.init();
    }
    
    init() {
        this.createBoard();
        this.updateUI();
        this.addGameLog('🎯 游戏开始！让我们愉快地厮杀吧~');
        this.initSkillListeners();
    }
    
    createBoard() {
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
        
        if (this.skillMode && this.selectedSkillForUse) {
            this.useSkill(this.selectedSkillForUse, row, col);
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
        this.updateSkillCooldowns();
        this.updateSkillEffects();
        this.updateUI();
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
    
    // 技能系统 - 移除旧的监听器，现在通过HTML onclick处理
    initSkillListeners() {
        // 技能监听器现在通过HTML onclick="selectSkill(this)"处理
        // 这里可以添加其他初始化逻辑
    }
    
    // 音视频管理方法
    initAudioVideo() {
        this.bgmAudio = document.getElementById('bgmAudio');
        this.skillVideo = document.getElementById('skillVideo');
        
        // 设置BGM循环播放
        if (this.bgmAudio) {
            this.bgmAudio.volume = 0.3; // 设置音量
            this.bgmAudio.addEventListener('canplaythrough', () => {
                this.playBGM();
            });
        }
        
        // 设置技能视频播放完成后的回调
        if (this.skillVideo) {
            this.skillVideo.addEventListener('ended', () => {
                this.onSkillVideoEnded();
            });
        }
    }
    
    playBGM() {
        if (this.bgmAudio && !this.isVideoPlaying) {
            this.bgmAudio.play().catch(e => {
                console.log('BGM播放失败，可能需要用户交互:', e);
            });
        }
    }
    
    pauseBGM() {
        if (this.bgmAudio) {
            this.bgmAudio.pause();
        }
    }
    
    playSkillVideo(skillId) {
        if (!this.skillVideo || !this.skillVideoMap[skillId]) return;
        
        // 随机选择一个视频文件
        const videoFiles = this.skillVideoMap[skillId];
        const randomVideo = videoFiles[Math.floor(Math.random() * videoFiles.length)];
        
        // 暂停BGM
        this.pauseBGM();
        this.isVideoPlaying = true;
        
        // 设置视频源并播放
        this.skillVideo.src = `res/${randomVideo}`;
        this.skillVideo.style.display = 'block';
        this.skillVideo.style.position = 'fixed';
        this.skillVideo.style.top = '50%';
        this.skillVideo.style.left = '50%';
        this.skillVideo.style.transform = 'translate(-50%, -50%)';
        this.skillVideo.style.zIndex = '9999';
        this.skillVideo.style.maxWidth = '80vw';
        this.skillVideo.style.maxHeight = '80vh';
        this.skillVideo.style.borderRadius = '15px';
        this.skillVideo.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.5)';
        
        this.skillVideo.play().catch(e => {
            console.log('技能视频播放失败:', e);
            this.onSkillVideoEnded();
        });
    }
    
    onSkillVideoEnded() {
        this.isVideoPlaying = false;
        
        // 隐藏视频
        if (this.skillVideo) {
            this.skillVideo.style.display = 'none';
            this.skillVideo.src = '';
        }
        
        // 恢复BGM播放
        this.playBGM();
    }
    
    selectSkillForDisplay(skillId) {
        // 只是选择技能显示详情，不立即使用
        this.selectedSkill = skillId;
        this.updateSkillDisplay();
        this.updateUI();
    }
    
    updateSkillDisplay() {
        // 紧凑技能面板不需要单独的详情显示区域
        // 技能详情通过title属性显示，使用按钮状态显示可用性
        const useSkillBtn = document.getElementById('useSkillBtn');
        
        if (!this.selectedSkill) {
            useSkillBtn.disabled = true;
            useSkillBtn.textContent = '🚀 使用技能';
            return;
        }
        
        const skill = this.skills[this.selectedSkill];
        const cooldown = this.playerSkillCooldowns[this.currentPlayer][this.selectedSkill] || 0;
        const isSilenced = this.skillEffects.silencedPlayer === this.currentPlayer;
        
        // 检查是否可以使用技能
        const canUse = cooldown === 0 && !isSilenced && !this.gameEnded;
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
        
        const cooldown = this.playerSkillCooldowns[this.currentPlayer][this.selectedSkill] || 0;
        const isSilenced = this.skillEffects.silencedPlayer === this.currentPlayer;
        
        if (cooldown > 0) {
            this.addGameLog(`技能还在冷却中，剩余${cooldown}回合`);
            return;
        }
        
        if (isSilenced) {
            this.addGameLog('😵 你本回合被沉默，无法使用技能！');
            return;
        }
        
        // 准备使用技能
        this.selectedSkillForUse = this.selectedSkill;
        this.setSkillTargets(this.selectedSkill);
    }
    
    setSkillTargets(skillId) {
        // 清除之前的选择样式
        document.querySelectorAll('.cell').forEach(cell => {
            cell.classList.remove('selectable');
        });
        
        this.skillMode = true;
        const skillName = this.skills[skillId].name;
        
        switch (skillId) {
            case 'flyStone':
                // 飞沙走石：可以选择对手的棋子
                this.highlightOpponentPieces();
                this.addGameLog(`🌪️ 准备使用${skillName}！请点击对手的棋子`);
                break;
            case 'pickGold':
            case 'cleanHouse':
            case 'silence':
            case 'reverseBoard':
            case 'clearAll':
                // 这些技能不需要选择目标，直接执行
                this.addGameLog(`✨ 使用${skillName}！`);
                this.useSkill(skillId);
                break;
        }
    }
    
    highlightOpponentPieces() {
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (this.board[i][j] === opponent) {
                    const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                    cell.classList.add('selectable');
                }
            }
        }
    }
    
    useSkill(skillId, row = null, col = null) {
        const skill = this.skills[skillId];
        const playerName = this.currentPlayer === 1 ? '黑棋' : '白棋';
        
        // 播放技能视频
        this.playSkillVideo(skillId);
        
        // 保存历史状态
        this.saveGameState();
        
        switch (skillId) {
            case 'flyStone':
                this.executeFlyStone(row, col);
                break;
            case 'pickGold':
                this.executePickGold();
                break;
            case 'cleanHouse':
                this.executeCleanHouse();
                break;
            case 'silence':
                this.executeSilence();
                break;
            case 'reverseBoard':
                this.executeReverseBoard();
                break;
            case 'clearAll':
                this.executeClearAll();
                break;
        }
        
        // 设置冷却
        this.playerSkillCooldowns[this.currentPlayer][skillId] = skill.cooldown;
        
        // 重置技能选择状态
        this.resetSkillSelection();
        
        // 除了两级反转，其他技能使用后不换手
        if (skillId !== 'reverseBoard') {
            this.addGameLog(`${playerName}使用了${skill.name}，可以继续下棋`);
        } else {
            this.addGameLog(`${playerName}使用了${skill.name}，交换执手`);
            this.switchPlayer();
        }
        
        this.updateUI();
    }
    
    // 技能实现
    executeFlyStone(row, col) {
        if (row !== null && col !== null && this.board[row][col] !== 0) {
            const piece = { row, col, player: this.board[row][col] };
            this.removedPieces.push(piece);
            this.board[row][col] = 0;
            this.updateCellDisplay(row, col);
            this.addGameLog(`🌪️ 呼呼呼~棋子被卷上天了！对手在(${row + 1}, ${col + 1})的棋子被风吹走啦~`);
        }
    }
    
    executePickGold() {
        if (this.removedPieces.length === 0) {
            this.addGameLog('♻️ 咦？没有被扔走的棋子可以恢复呢，看来大家都很爱惜棋子嘛~');
            return;
        }
        
        // 随机选择一个被扔走的棋子
        const randomIndex = Math.floor(Math.random() * this.removedPieces.length);
        const piece = this.removedPieces[randomIndex];
        
        // 寻找空位放置，优先考虑棋盘中部
        const emptyPositions = [];
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (this.board[i][j] === 0) {
                    // 计算到中心的距离，中心位置权重更高
                    const distanceToCenter = Math.abs(i - 7) + Math.abs(j - 7);
                    const weight = Math.max(1, 15 - distanceToCenter);
                    for (let w = 0; w < weight; w++) {
                        emptyPositions.push({ row: i, col: j });
                    }
                }
            }
        }
        
        if (emptyPositions.length > 0) {
            const pos = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
            this.board[pos.row][pos.col] = piece.player;
            this.updateCellDisplay(pos.row, pos.col);
            
            // 从被移除列表中删除
            this.removedPieces.splice(randomIndex, 1);
            
            const playerName = piece.player === 1 ? '黑棋' : '白棋';
            this.addGameLog(`♻️ 哇！拾金不昧显神威！${playerName}的棋子从天而降到(${pos.row + 1}, ${pos.col + 1})啦！`);
        }
    }
    
    executeCleanHouse() {
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        const opponentPieces = [];
        
        // 找到所有对手的棋子
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (this.board[i][j] === opponent) {
                    opponentPieces.push({ row: i, col: j });
                }
            }
        }
        
        if (opponentPieces.length === 0) {
            this.addGameLog('对手没有棋子可以清理');
            return;
        }
        
        // 随机清理1-3个棋子
        const removeCount = Math.min(opponentPieces.length, Math.floor(Math.random() * 3) + 1);
        
        for (let i = 0; i < removeCount; i++) {
            const randomIndex = Math.floor(Math.random() * opponentPieces.length);
            const piece = opponentPieces[randomIndex];
            
            this.removedPieces.push({ ...piece, player: opponent });
            this.board[piece.row][piece.col] = 0;
            this.updateCellDisplay(piece.row, piece.col);
            
            opponentPieces.splice(randomIndex, 1);
        }
        
        this.addGameLog(`清理了对手${removeCount}个棋子`);
    }
    
    executeSilence() {
        const opponent = this.currentPlayer === 1 ? 2 : 1;
        this.skillEffects.silenced = 1;
        this.skillEffects.silencedPlayer = opponent;
        const opponentName = opponent === 1 ? '黑棋' : '白棋';
        this.addGameLog(`${opponentName}下回合将被沉默，无法使用技能`);
    }
    
    executeReverseBoard() {
        // 交换棋盘上所有棋子的颜色
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (this.board[i][j] === 1) {
                    this.board[i][j] = 2;
                } else if (this.board[i][j] === 2) {
                    this.board[i][j] = 1;
                }
                this.updateCellDisplay(i, j);
            }
        }
        
        // 交换被移除棋子的颜色
        this.removedPieces.forEach(piece => {
            piece.player = piece.player === 1 ? 2 : 1;
        });
        
        this.addGameLog('交换了棋盘中双方的所有棋子');
    }
    
    executeClearAll() {
        // 清空整个棋盘
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                this.board[i][j] = 0;
                this.updateCellDisplay(i, j);
            }
        }
        
        this.removedPieces = [];
        this.addGameLog('清空了棋盘上的所有棋子');
    }
    
    // 游戏状态管理
    saveGameState() {
        this.gameHistory.push({
            board: this.board.map(row => [...row]),
            currentPlayer: this.currentPlayer,
            turnCount: this.turnCount,
            removedPieces: [...this.removedPieces]
        });
        
        // 限制历史记录数量
        if (this.gameHistory.length > 20) {
            this.gameHistory.shift();
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
    }
    
    updateSkillCooldowns() {
        // 减少当前玩家的技能冷却
        Object.keys(this.playerSkillCooldowns[this.currentPlayer]).forEach(skillId => {
            if (this.playerSkillCooldowns[this.currentPlayer][skillId] > 0) {
                this.playerSkillCooldowns[this.currentPlayer][skillId]--;
            }
        });
    }
    
    updateSkillEffects() {
        // 更新沉默效果
        if (this.skillEffects.silenced > 0) {
            this.skillEffects.silenced--;
            if (this.skillEffects.silenced === 0) {
                this.skillEffects.silencedPlayer = 0;
            }
        }
    }
    
    updateUI() {
        // 更新当前玩家显示
        const currentPlayerElement = document.getElementById('currentPlayer');
        currentPlayerElement.textContent = this.currentPlayer === 1 ? '黑棋' : '白棋';
        
        // 更新回合数显示
        const turnCountElement = document.getElementById('turnCount');
        turnCountElement.textContent = this.turnCount;
        
        // 更新紧凑技能显示
        document.querySelectorAll('.compact-skill-item').forEach(item => {
            const skillId = item.dataset.skill;
            const cooldown = this.playerSkillCooldowns[this.currentPlayer][skillId] || 0;
            const cdText = item.querySelector('.cd-text');
            
            if (cooldown > 0) {
                cdText.textContent = `${cooldown}回合`;
                item.classList.add('on-cooldown');
            } else {
                cdText.textContent = this.skills[skillId].cooldown + '回合';
                item.classList.remove('on-cooldown');
            }
            
            // 更新选中状态
            if (this.selectedSkill === skillId) {
                item.classList.add('selected');
            } else {
                item.classList.remove('selected');
            }
        });
        
        // 检查沉默状态
        if (this.skillEffects.silencedPlayer === this.currentPlayer) {
            document.querySelectorAll('.compact-skill-item').forEach(item => {
                item.classList.add('on-cooldown');
            });
        }
        
        // 更新技能显示面板
        this.updateSkillDisplay();
    }
    
    addGameLog(message) {
        this.gameLog.push(message);
        const gameLogElement = document.getElementById('gameLog');
        const logItem = document.createElement('div');
        logItem.className = 'log-item';
        logItem.textContent = message;
        gameLogElement.appendChild(logItem);
        
        // 滚动到最新日志
        gameLogElement.scrollTop = gameLogElement.scrollHeight;
        
        // 限制日志数量
        if (this.gameLog.length > 50) {
            this.gameLog.shift();
            gameLogElement.removeChild(gameLogElement.firstChild);
        }
    }
    
    // 公共方法
    startNewGame() {
        this.board = Array(15).fill(null).map(() => Array(15).fill(0));
        this.currentPlayer = 1;
        this.turnCount = 1;
        this.gameHistory = [];
        this.removedPieces = [];
        this.gameLog = [];
        this.playerSkillCooldowns = { 1: {}, 2: {} };
        this.skillEffects = { silenced: 0, silencedPlayer: 0 };
        this.gameEnded = false;
        this.resetSkillSelection();
        
        // 清空日志显示
        document.getElementById('gameLog').innerHTML = '';
        
        // 重新渲染棋盘
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                this.updateCellDisplay(i, j);
            }
        }
        
        this.updateUI();
        this.addGameLog('🎮 游戏重新开始！让我们再次愉快地厮杀吧~');
    }
    
    undoMove() {
        if (this.gameHistory.length === 0) {
            this.addGameLog('🤷‍♂️ 没有可以悔棋的步数，重新开始吧！');
            return;
        }
        
        // 恢复到上一个状态
        const lastState = this.gameHistory.pop();
        this.board = lastState.board;
        this.currentPlayer = lastState.currentPlayer;
        this.turnCount = lastState.turnCount;
        this.removedPieces = lastState.removedPieces;
        this.gameEnded = false;
        
        // 重新渲染棋盘
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                this.updateCellDisplay(i, j);
            }
        }
        
        this.updateUI();
        this.addGameLog('⏪ 悔棋成功！时光倒退~');
    }
}

// 技能选择函数 - 全局函数供HTML调用
function selectSkill(skillElement) {
    const skillId = skillElement.dataset.skill;
    if (game) {
        game.selectSkillForDisplay(skillId);
    }
}

// 确认使用技能函数 - 全局函数供HTML调用  
function confirmUseSkill() {
    if (game) {
        game.confirmUseSkill();
    }
}

// 全局变量
let game;

// 全局函数
function startNewGame() {
    if (game) {
        game.startNewGame();
    }
}

function undoMove() {
    if (game) {
        game.undoMove();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    game = new SkillGomokuGame();
    
    // 初始化音视频系统
    game.initAudioVideo();
    
    // 添加用户交互启动BGM（某些浏览器需要用户交互才能播放音频）
    document.addEventListener('click', function startBGM() {
        game.playBGM();
        document.removeEventListener('click', startBGM);
    }, { once: true });
});
