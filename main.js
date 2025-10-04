// 主游戏文件 - main.js
// 全局变量
let gameCore;
let skillSystem;
let mediaManager;
let uiManager;

// 全局函数供HTML调用
function selectSkill(skillElement) {
    // 防止事件冒泡
    if (event) {
        event.stopPropagation();
    }
    
    const skillId = skillElement.dataset.skill;
    console.log('选择技能:', skillId);
    
    if (skillSystem && skillId) {
        skillSystem.selectSkillForDisplay(skillId);
    }
}

function confirmUseSkill() {
    if (skillSystem) {
        skillSystem.confirmUseSkill();
    }
}

function startNewGame() {
    if (gameCore) {
        gameCore.startNewGame();
    }
}

function undoMove() {
    if (gameCore) {
        gameCore.undoMove();
    }
}

function toggleMusic() {
    if (mediaManager) {
        mediaManager.toggleMusic();
    }
}

function showSkillHelp() {
    const modal = document.getElementById('skillHelpModal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

function closeSkillHelp() {
    const modal = document.getElementById('skillHelpModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 点击模态框外部关闭
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('skillHelpModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeSkillHelp();
            }
        });
    }
});

// 游戏初始化
function initGame() {
    // 检查依赖是否加载
    if (typeof GameCore === 'undefined' || 
        typeof SkillSystem === 'undefined' || 
        typeof MediaManager === 'undefined' || 
        typeof UIManager === 'undefined' ||
        typeof SKILL_CONFIG === 'undefined' ||
        typeof SkillExecutor === 'undefined') {
        console.error('❌ 游戏模块未完全加载，请检查文件引用顺序');
        return;
    }
    
    // 创建各个系统实例
    gameCore = new GameCore();
    skillSystem = new SkillSystem();
    mediaManager = new MediaManager();
    uiManager = new UIManager();
    
    // 将实例挂载到window对象，供其他模块访问
    window.gameCore = gameCore;
    window.skillSystem = skillSystem;
    window.mediaManager = mediaManager;
    window.uiManager = uiManager;
    
    // 初始化音视频系统
    mediaManager.initAudioVideo();
    
    // 初始化UI响应式监听
    uiManager.initResponsiveListener();
    
    // 初始化UI显示
    uiManager.updateUI();
    
    // 添加用户交互启动BGM（某些浏览器需要用户交互才能播放音频）
    document.addEventListener('click', function startBGM() {
        mediaManager.playBGM();
        document.removeEventListener('click', startBGM);
    }, { once: true });
    
    console.log('🎮 游戏系统初始化完成！');
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

// 导出供其他文件使用（如果需要）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameCore,
        skillSystem,
        mediaManager,
        uiManager,
        selectSkill,
        confirmUseSkill,
        startNewGame,
        undoMove,
        toggleMusic
    };
}
