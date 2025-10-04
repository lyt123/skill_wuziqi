// 技能执行器 - SkillExecutor.js
class SkillExecutor {
    static executeFlyStone(row, col) {
        if (row !== null && col !== null && window.gameCore.board[row][col] !== 0) {
            const piece = { row, col, player: window.gameCore.board[row][col] };
            window.gameCore.removedPieces.push(piece);
            
            // 添加视觉效果延迟
            setTimeout(() => {
                window.gameCore.board[row][col] = 0;
                window.gameCore.updateCellDisplayWithAnimation(row, col);
                window.gameCore.addGameLog(`🌪️ 呼呼呼~棋子被卷上天了！对手在(${row + 1}, ${col + 1})的棋子被风吹走啦~`);
            }, 500);
        }
    }
    
    static executePickGold() {
        if (window.gameCore.removedPieces.length === 0) {
            window.gameCore.addGameLog('♻️ 咦？没有被扔走的棋子可以恢复呢，看来大家都很爱惜棋子嘛~');
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * window.gameCore.removedPieces.length);
        const piece = window.gameCore.removedPieces.splice(randomIndex, 1)[0];
        
        const emptySpots = [];
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (window.gameCore.board[i][j] === 0) {
                    emptySpots.push({ row: i, col: j });
                }
            }
        }
        
        if (emptySpots.length > 0) {
            const randomSpot = emptySpots[Math.floor(Math.random() * emptySpots.length)];
            
            // 添加视觉效果延迟
            setTimeout(() => {
                window.gameCore.board[randomSpot.row][randomSpot.col] = piece.player;
                window.gameCore.updateCellDisplayWithAnimation(randomSpot.row, randomSpot.col);
                window.gameCore.addGameLog(`♻️ 哇！拾金不昧的精神让棋子回来啦！放在了(${randomSpot.row + 1}, ${randomSpot.col + 1})~`);
            }, 500);
        }
    }
    
    static executeCleanHouse() {
        const opponentPlayer = window.gameCore.currentPlayer === 1 ? 2 : 1;
        const opponentPieces = [];
        
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (window.gameCore.board[i][j] === opponentPlayer) {
                    opponentPieces.push({ row: i, col: j });
                }
            }
        }
        
        if (opponentPieces.length > 0) {
            const cleanCount = Math.min(Math.floor(Math.random() * 3) + 1, opponentPieces.length);
            const piecesToClean = [];
            
            // 选择要清理的棋子
            for (let i = 0; i < cleanCount; i++) {
                const randomIndex = Math.floor(Math.random() * opponentPieces.length);
                const piece = opponentPieces.splice(randomIndex, 1)[0];
                piecesToClean.push(piece);
            }
            
            // 逐个清理棋子，每个有延迟
            piecesToClean.forEach((piece, index) => {
                setTimeout(() => {
                    window.gameCore.board[piece.row][piece.col] = 0;
                    window.gameCore.updateCellDisplayWithAnimation(piece.row, piece.col);
                    
                    // 只在最后一个棋子清理完后显示完成消息
                    if (index === piecesToClean.length - 1) {
                        window.gameCore.addGameLog(`🧹 专业保洁服务！清理了${cleanCount}个对手棋子，房间焕然一新~`);
                    }
                }, index * 300);
            });
        }
    }
    
    static executeSilence() {
        const opponentPlayer = window.gameCore.currentPlayer === 1 ? 2 : 1;
        window.skillSystem.skillEffects.silencedPlayer = opponentPlayer;
        window.skillSystem.skillEffects.silenceDuration = 1;
        window.gameCore.addGameLog('⏸️ 静如止水~对手下回合将无法使用技能！');
    }
    
    static executeReverseBoard() {
        const changes = [];
        
        // 收集所有需要变更的棋子位置
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (window.gameCore.board[i][j] !== 0) {
                    const newPlayer = window.gameCore.board[i][j] === 1 ? 2 : 1;
                    changes.push({ row: i, col: j, newPlayer });
                }
            }
        }
        
        // 逐个执行变更，营造波浪效果
        changes.forEach((change, index) => {
            setTimeout(() => {
                window.gameCore.board[change.row][change.col] = change.newPlayer;
                window.gameCore.updateCellDisplayWithAnimation(change.row, change.col);
                
                // 在最后一个变更后显示完成消息
                if (index === changes.length - 1) {
                    window.gameCore.addGameLog('🔄 乾坤大挪移！黑白棋子全部互换，天地颠倒啦~');
                }
            }, index * 50); // 每个棋子间隔50ms，创造波浪效果
        });
    }
    
    static executeClearAll() {
        const piecesToClear = [];
        
        // 收集所有棋子位置
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (window.gameCore.board[i][j] !== 0) {
                    piecesToClear.push({ row: i, col: j });
                }
            }
        }
        
        // 随机打乱清除顺序，制造随机消失效果
        for (let i = piecesToClear.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [piecesToClear[i], piecesToClear[j]] = [piecesToClear[j], piecesToClear[i]];
        }
        
        // 逐个清除棋子
        piecesToClear.forEach((piece, index) => {
            setTimeout(() => {
                window.gameCore.board[piece.row][piece.col] = 0;
                window.gameCore.updateCellDisplayWithAnimation(piece.row, piece.col);
                
                // 在最后一个棋子清除后显示完成消息并清空removed pieces
                if (index === piecesToClear.length - 1) {
                    window.gameCore.removedPieces = [];
                    window.gameCore.addGameLog('💥 力拔山兮气盖世！所有棋子都被清空了，重新开始吧~');
                }
            }, index * 80); // 每个棋子间隔80ms
        });
    }
}

