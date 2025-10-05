// 音视频管理 - MediaManager.js
class MediaManager {
    constructor() {
        this.bgmAudio = null;
        this.skillVideo = null;
        this.isVideoPlaying = false;
        this.currentSkillId = null;
        this.pendingSkillParams = null;
        this.globalClickHandler = null;
        this.isMusicEnabled = true; // 音乐开关状态
        
        // 视频版本号（只在视频更新时才修改）
        this.videoVersion = '1.0.1';
        
        // 技能视频资源映射
        this.skillVideoMap = {
            'flyStone': ['飞沙走石.mp4', '飞沙走石1.mp4', '飞沙走石2.mp4', '飞沙走石3.mp4'],
            'pickGold': ['拾金不昧.mp4', '拾金不昧2.mp4'],
            'cleanHouse': ['保洁上门.mp4', '保洁上门2.mp4', '保洁上门3.mp4', '保洁上门4.mp4'],
            'silence': ['静如止水.mp4', '静如止水2.mp4', '静如止水3.mp4'],
            'reverseBoard': ['两级反转.mp4'],
            'clearAll': ['力拔山兮.mp4', '力拔山兮2.mp4', '力拔山兮3.mp4', '放大招.mp4']
        };
        
        this.videoOverlay = null;
    }
    
    initAudioVideo() {
        this.bgmAudio = document.getElementById('bgmAudio');
        this.skillVideo = document.getElementById('skillVideo');
        
        // 设置BGM循环播放
        if (this.bgmAudio) {
            this.bgmAudio.volume = 0.1; // 设置音量（调小）
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
        
        // 页面关闭时停止音乐
        window.addEventListener('beforeunload', () => {
            this.stopAll();
        });
        
        // 页面隐藏时暂停音乐
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseBGM();
            } else if (this.isMusicEnabled && !this.isVideoPlaying) {
                this.playBGM();
            }
        });
        
        // 初始化音乐按钮状态
        this.updateMusicButtonDisplay();
    }
    
    playBGM() {
        if (this.bgmAudio && !this.isVideoPlaying && this.isMusicEnabled) {
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
    
    stopAll() {
        // 停止BGM
        if (this.bgmAudio) {
            this.bgmAudio.pause();
            this.bgmAudio.currentTime = 0;
        }
        // 停止视频
        if (this.skillVideo) {
            this.skillVideo.pause();
            this.skillVideo.src = '';
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
        this.currentSkillId = skillId; // 保存当前技能ID用于延迟释放
        
        // 设置视频源并播放（添加版本号参数）
        this.skillVideo.src = `res/${randomVideo}?v=${this.videoVersion}`;
        this.skillVideo.loop = true; // 设置循环播放
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
        this.skillVideo.style.cursor = 'pointer';
        this.skillVideo.style.opacity = '1';
        this.skillVideo.style.transition = '';
        
        // 创建点击提示overlay
        this.createVideoOverlay();
        
        // 添加延迟后再添加点击事件监听器，避免立即触发
        setTimeout(() => {
            // 添加点击事件监听器来关闭视频
            this.skillVideo.onclick = (e) => {
                e.stopPropagation();
                this.closeSkillVideo();
            };
            
            // 添加全局点击监听器
            this.globalClickHandler = (e) => {
                // 如果点击的不是视频本身，也关闭视频
                if (e.target !== this.skillVideo && !e.target.classList.contains('video-overlay')) {
                    this.closeSkillVideo();
                }
            };
            document.addEventListener('click', this.globalClickHandler);
        }, 100);
        
        this.skillVideo.play().catch(e => {
            console.log('技能视频播放失败:', e);
            this.closeSkillVideo();
        });
    }
    
    createVideoOverlay() {
        // 移除已存在的overlay
        if (this.videoOverlay) {
            this.videoOverlay.remove();
        }
        
        // 创建半透明overlay
        this.videoOverlay = document.createElement('div');
        this.videoOverlay.className = 'video-overlay';
        this.videoOverlay.style.position = 'fixed';
        this.videoOverlay.style.top = '0';
        this.videoOverlay.style.left = '0';
        this.videoOverlay.style.width = '100vw';
        this.videoOverlay.style.height = '100vh';
        this.videoOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.videoOverlay.style.zIndex = '9998';
        this.videoOverlay.style.display = 'flex';
        this.videoOverlay.style.justifyContent = 'center';
        this.videoOverlay.style.alignItems = 'center';
        this.videoOverlay.style.cursor = 'pointer';
        
        // 创建提示文字
        const hint = document.createElement('div');
        hint.style.position = 'absolute';
        hint.style.bottom = '20px';
        hint.style.left = '50%';
        hint.style.transform = 'translateX(-50%)';
        hint.style.color = '#fff';
        hint.style.fontSize = '18px';
        hint.style.textAlign = 'center';
        hint.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
        hint.style.padding = '10px 20px';
        hint.style.backgroundColor = 'rgba(0,0,0,0.5)';
        hint.style.borderRadius = '10px';
        hint.innerHTML = '🎥 技能演示中...<br/>👆 点击任意位置关闭视频';
        
        this.videoOverlay.appendChild(hint);
        document.body.appendChild(this.videoOverlay);
    }
    
    removeVideoOverlay() {
        if (this.videoOverlay) {
            this.videoOverlay.remove();
            this.videoOverlay = null;
        }
    }
    
    closeSkillVideo() {
        if (!this.isVideoPlaying) return;
        
        // 移除overlay
        this.removeVideoOverlay();
        
        // 移除事件监听器
        if (this.skillVideo) {
            this.skillVideo.onclick = null;
        }
        if (this.globalClickHandler) {
            document.removeEventListener('click', this.globalClickHandler);
            this.globalClickHandler = null;
        }
        
        // 停止循环播放
        this.skillVideo.loop = false;
        this.skillVideo.pause();
        
        // 添加渐变消失效果
        this.skillVideo.style.transition = 'opacity 0.5s ease-out';
        this.skillVideo.style.opacity = '0';
        
        setTimeout(() => {
            this.isVideoPlaying = false;
            
            // 隐藏视频
            if (this.skillVideo) {
                this.skillVideo.style.display = 'none';
                this.skillVideo.style.opacity = '1';
                this.skillVideo.style.transition = '';
                this.skillVideo.src = '';
            }
            
            // 恢复BGM播放
            this.playBGM();
            
            // 立即执行技能效果，不延迟
            this.executeSkillImmediately();
        }, 500);
    }
    
    executeSkillImmediately() {
        if (!this.currentSkillId || !this.pendingSkillParams) return;
        
        const { skillId, row, col } = this.pendingSkillParams;
        
        // 执行技能效果
        if (window.skillSystem) {
            window.skillSystem.executeSkillEffect(skillId, row, col);
        }
        
        // 清理状态
        this.currentSkillId = null;
        this.pendingSkillParams = null;
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
    
    // 音乐控制方法
    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        this.updateMusicButtonDisplay();
        
        if (this.isMusicEnabled) {
            // 启用音乐 - 如果没有视频播放，则播放BGM
            if (!this.isVideoPlaying) {
                this.playBGM();
            }
            if (window.gameCore) {
                window.gameCore.addGameLog('🎵 背景音乐已开启');
            }
        } else {
            // 禁用音乐 - 暂停BGM
            this.pauseBGM();
            if (window.gameCore) {
                window.gameCore.addGameLog('🔇 背景音乐已关闭');
            }
        }
    }
    
    updateMusicButtonDisplay() {
        const musicBtn = document.getElementById('musicToggleBtn');
        if (musicBtn) {
            if (this.isMusicEnabled) {
                musicBtn.textContent = '🎵';
                musicBtn.title = '关闭音乐';
                musicBtn.classList.remove('music-off');
                musicBtn.classList.add('music-on');
            } else {
                musicBtn.textContent = '🔇';
                musicBtn.title = '开启音乐';
                musicBtn.classList.remove('music-on');
                musicBtn.classList.add('music-off');
            }
        }
    }
}
