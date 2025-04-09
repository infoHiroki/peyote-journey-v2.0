/**
 * ペヨーテの旅路 - オーディオスクリプト
 * BGMと効果音の管理
 */

// オーディオモジュール
const audio = (function() {
    // プライベート変数
    let bgmPlayer = null; // BGMプレーヤー
    let sfxPlayers = {}; // 効果音プレーヤー
    let bgmVolume = 0.6; // BGM音量 (0-1)
    let sfxVolume = 0.8; // 効果音音量 (0-1)
    let isMuted = false; // ミュート状態
    let currentBgm = null; // 現在再生中のBGM
    
    const bgmList = {
        'main': 'assets/audio/bgm/main_theme.mp3',
        'peaceful': 'assets/audio/bgm/peaceful.mp3',
        'forest': 'assets/audio/bgm/forest.mp3',
        'beach': 'assets/audio/bgm/beach.mp3'
    };
    
    const sfxList = {
        'walk': 'assets/audio/sfx/walk.mp3',
        'pickup': 'assets/audio/sfx/pickup.mp3',
        'discover': 'assets/audio/sfx/discover.mp3',
        'gift': 'assets/audio/sfx/gift.mp3',
        'menu_open': 'assets/audio/sfx/menu_open.mp3',
        'menu_close': 'assets/audio/sfx/menu_close.mp3',
        'letter': 'assets/audio/sfx/letter.mp3'
    };
    
    // 初期化
    function init() {
        // 設定の読み込み
        const settings = storage.loadSettings();
        if (settings) {
            bgmVolume = settings.bgmVolume !== undefined ? settings.bgmVolume / 100 : 0.6;
            sfxVolume = settings.sfxVolume !== undefined ? settings.sfxVolume / 100 : 0.8;
        }
        
        // BGMプレーヤーの初期化
        bgmPlayer = new Audio();
        bgmPlayer.loop = true;
        bgmPlayer.volume = bgmVolume;
        
        // BGM読み込み終了イベント
        bgmPlayer.addEventListener('canplaythrough', function() {
            console.log('BGM loaded successfully');
        });
        
        // BGMエラーイベント
        bgmPlayer.addEventListener('error', function() {
            console.error('BGM load error:', bgmPlayer.error);
        });
        
        // BGM終了イベント（念のため）
        bgmPlayer.addEventListener('ended', function() {
            // ループ設定が効かない場合の対策
            if (currentBgm) {
                playBgm(currentBgm);
            }
        });
    }
    
    // BGM再生
    function playBgm(key, fadeTime = 1000) {
        if (!bgmList[key]) {
            console.error('BGM not found:', key);
            return;
        }
        
        // 現在と同じBGMの場合は何もしない
        if (currentBgm === key && !bgmPlayer.paused) {
            return;
        }
        
        // 前のBGMをフェードアウト
        if (currentBgm && !bgmPlayer.paused) {
            fadeOutBgm(fadeTime / 2, function() {
                // フェードアウト完了後、新しいBGMを設定
                bgmPlayer.src = bgmList[key];
                bgmPlayer.load();
                bgmPlayer.volume = 0;
                bgmPlayer.play().catch(e => console.error('BGM play error:', e));
                
                // フェードイン
                fadeInBgm(fadeTime / 2);
                currentBgm = key;
            });
        } else {
            // 前のBGMがない場合は直接再生
            bgmPlayer.src = bgmList[key];
            bgmPlayer.load();
            bgmPlayer.volume = 0;
            bgmPlayer.play().catch(e => console.error('BGM play error:', e));
            
            // フェードイン
            fadeInBgm(fadeTime);
            currentBgm = key;
        }
    }
    
    // BGM停止
    function stopBgm(fadeTime = 1000) {
        if (!currentBgm) return;
        
        fadeOutBgm(fadeTime, function() {
            bgmPlayer.pause();
            currentBgm = null;
        });
    }
    
    // BGMフェードイン
    function fadeInBgm(duration = 1000) {
        if (bgmPlayer.paused) return;
        
        let startVolume = 0;
        let endVolume = isMuted ? 0 : bgmVolume;
        let startTime = null;
        
        bgmPlayer.volume = startVolume;
        
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            bgmPlayer.volume = startVolume + (endVolume - startVolume) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        }
        
        requestAnimationFrame(step);
    }
    
    // BGMフェードアウト
    function fadeOutBgm(duration = 1000, callback) {
        if (bgmPlayer.paused) {
            if (callback) callback();
            return;
        }
        
        let startVolume = bgmPlayer.volume;
        let endVolume = 0;
        let startTime = null;
        
        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            bgmPlayer.volume = startVolume + (endVolume - startVolume) * progress;
            
            if (progress < 1) {
                requestAnimationFrame(step);
            } else if (callback) {
                callback();
            }
        }
        
        requestAnimationFrame(step);
    }
    
    // 効果音再生
    function playSfx(key) {
        if (!sfxList[key]) {
            console.error('SFX not found:', key);
            return;
        }
        
        // ミュート時は再生しない
        if (isMuted) return;
        
        // 効果音プレーヤーの取得または作成
        let player = sfxPlayers[key];
        if (!player) {
            player = new Audio();
            player.src = sfxList[key];
            player.volume = sfxVolume;
            sfxPlayers[key] = player;
        }
        
        // 既に再生中なら一度停止してから再生
        player.pause();
        player.currentTime = 0;
        
        // 再生
        player.play().catch(e => console.error('SFX play error:', e));
    }
    
    // BGM音量設定
    function setBgmVolume(volume) {
        bgmVolume = Math.max(0, Math.min(1, volume));
        if (!isMuted && bgmPlayer) {
            bgmPlayer.volume = bgmVolume;
        }
        
        // 設定の保存
        const settings = storage.loadSettings() || {};
        settings.bgmVolume = Math.round(bgmVolume * 100);
        storage.saveSettings(settings);
    }
    
    // 効果音音量設定
    function setSfxVolume(volume) {
        sfxVolume = Math.max(0, Math.min(1, volume));
        
        // 全ての効果音プレーヤーの音量を更新
        for (const key in sfxPlayers) {
            sfxPlayers[key].volume = sfxVolume;
        }
        
        // 設定の保存
        const settings = storage.loadSettings() || {};
        settings.sfxVolume = Math.round(sfxVolume * 100);
        storage.saveSettings(settings);
    }
    
    // ミュート設定
    function setMute(mute) {
        isMuted = mute;
        
        if (bgmPlayer) {
            bgmPlayer.volume = isMuted ? 0 : bgmVolume;
        }
    }
    
    // BGMロード状態チェック
    function isBgmReady() {
        return bgmPlayer && bgmPlayer.readyState >= 3;
    }
    
    // モジュールの公開API
    return {
        init,
        playBgm,
        stopBgm,
        playSfx,
        setBgmVolume,
        setSfxVolume,
        setMute,
        isBgmReady
    };
})();
