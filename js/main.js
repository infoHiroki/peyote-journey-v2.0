/**
 * ペヨーテの旅路 - メインスクリプト
 * ゲームの初期化、メインループ、イベント処理を管理
 */

// グローバル変数
let lastTimestamp = 0;
let isGameInitialized = false;
let isAssetsLoaded = false;
let isPressing = false; // タッチ/クリック押下状態
let lastTouchX = 0; // 最後のタッチX座標
let lastTouchY = 0; // 最後のタッチY座標

// ゲーム初期化
function initGame() {
    // Canvas初期化
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    
    // キャンバスサイズをウィンドウサイズに合わせる
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    // 初期サイズ設定とリサイズイベント登録
    resizeCanvas();
    window.addEventListener('resize', function() {
        resizeCanvas();
        world.updateViewport(canvas.width, canvas.height);
    });
    
    // ワールド初期化
    world.init(canvas.width, canvas.height);
    
    // キャラクター初期化
    character.init();
    
    // オーディオ初期化
    audio.init();
    
    // UI初期化
    ui.init();
    
    // インタラクション初期化
    interaction.init();
    
    // ジャーナル初期化
    journal.init();
    
    // コレクション初期化
    collection.init();
    
    // 保存データのロード
    if (storage.hasGameData()) {
        const gameData = storage.loadGameData();

        // ワールドとキャラは初期化、ジャーナルとコレクションは保持
        gameData.world = null;
        gameData.character = null;

        world.loadState(gameData.world);
        character.loadState(gameData.character);
        journal.loadState(gameData.journal);
        collection.loadState(gameData.collection);
    }
    
    // マウス/タッチイベント処理の追加
    setupTouchControls(canvas);
    
    // メニューのサウンドトグルが対応するので削除
    
    // ユーザー操作でBGMをランダム再生
    document.addEventListener('click', function onFirstClick() {
        const bgmCandidates = ['main', 'peaceful', 'forest', 'beach', 'adventure', 'mystery'];
        const randomKey = bgmCandidates[Math.floor(Math.random() * bgmCandidates.length)];
        audio.playBgm(randomKey);
        document.removeEventListener('click', onFirstClick);
    });
    
    // 定期的な保存
    setInterval(function() {
        saveGameState();
    }, 60000); // 1分ごとに保存
    
    // ロード画面を非表示
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.opacity = '0';
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
    
    // ゲームループ開始
    isGameInitialized = true;
    requestAnimationFrame(gameLoop);
}

// マウス/タッチコントロールのセットアップ
function setupTouchControls(canvas) {
    // タッチイベント (モバイル)
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    // マウスイベント (デスクトップ)
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);
    
    // イベント伝播停止のための関数
    function preventEventPropagation(event) {
        // UIボタンの上でのクリック/タッチは処理しない
        const uiContainer = document.getElementById('ui-container');
        if (uiContainer && uiContainer.contains(event.target)) {
            return true;
        }
        
        // ポップアップが表示されている場合は処理しない
        const popupElement = document.getElementById('interaction-popup');
        if (popupElement && !popupElement.classList.contains('hidden')) {
            return true;
        }
        
        // 画面上の他のUI要素をチェック
        const screens = document.querySelectorAll('.screen');
        for (let i = 0; i < screens.length; i++) {
            if (!screens[i].classList.contains('hidden')) {
                return true;
            }
        }
        
        return false;
    }
    
    // タッチ開始
    function handleTouchStart(event) {
        // UIイベント伝播防止
        if (preventEventPropagation(event)) return;
        
        // スクロール中の場合はpreventDefaultを避ける
        if (event.cancelable) {
            event.preventDefault();
        }
        
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // 座標を保存
        lastTouchX = touchX;
        lastTouchY = touchY;
        
        // 直接移動開始（クリックでの対話を廃止）
        isPressing = true;
        moveCharacterToPosition(touchX, touchY);
    }
    
    // タッチ移動
    function handleTouchMove(event) {
        if (!isPressing) return;
        
        // スクロール中の場合はpreventDefaultを避ける
        if (event.cancelable) {
            event.preventDefault();
        }
        
        const touch = event.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        const touchY = touch.clientY - rect.top;
        
        // 座標を保存
        lastTouchX = touchX;
        lastTouchY = touchY;
        
        // 押下中は継続的に移動先更新
        moveCharacterToPosition(touchX, touchY);
    }
    
    // タッチ終了
    function handleTouchEnd(event) {
        isPressing = false;
    }
    
    // マウス押下
    function handleMouseDown(event) {
        // UIイベント伝播防止
        if (preventEventPropagation(event)) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // 座標を保存
        lastTouchX = clickX;
        lastTouchY = clickY;
        
        // 直接移動開始（クリックでの対話を廃止）
        isPressing = true;
        moveCharacterToPosition(clickX, clickY);
    }
    
    // マウス移動
    function handleMouseMove(event) {
        if (!isPressing) return;
        
        const rect = canvas.getBoundingClientRect();
        const clickX = event.clientX - rect.left;
        const clickY = event.clientY - rect.top;
        
        // 座標を保存
        lastTouchX = clickX;
        lastTouchY = clickY;
        
        // 押下中は継続的に移動先更新
        moveCharacterToPosition(clickX, clickY);
    }
    
    // マウスボタン離し
    function handleMouseUp(event) {
        isPressing = false;
    }
    
    // キャラクターを指定位置に移動
    function moveCharacterToPosition(screenX, screenY) {
        const worldPos = world.screenToWorldCoordinates(screenX, screenY);
        character.moveTo(worldPos.x, worldPos.y);
    }
}

// メインゲームループ
function gameLoop(timestamp) {
    try {
        // 前回からの経過時間（ミリ秒）
        const deltaTime = timestamp - lastTimestamp;
        lastTimestamp = timestamp;
        
        // ゲームが初期化されていない場合はループを続ける
        if (!isGameInitialized) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        // キャンバス取得
        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        
        // 画面クリア
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 押下中なら移動先を更新し続ける
        if (isPressing) {
            moveCharacterToPosition(lastTouchX, lastTouchY);
        }
        
        // ワールド更新と描画
        world.update(deltaTime);
        world.draw(ctx);
        
        // キャラクター更新と描画
        character.update(deltaTime);
        character.draw(ctx);
        
        // デバッグ情報の表示（1%の確率で表示）
        if (Math.random() < 0.005) {
            const characterPos = character.getPosition();
            console.log(`キャラクター位置: (${Math.round(characterPos.x)}, ${Math.round(characterPos.y)})`);
        }
        
        // ゲームループ継続
        requestAnimationFrame(gameLoop);
    } catch (e) {
        console.error("Game loop error:", e);
        // エラーがあってもループを継続
        requestAnimationFrame(gameLoop);
    }
}

// カーソル位置にキャラクターを移動
function moveCharacterToPosition(screenX, screenY) {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const worldPos = world.screenToWorldCoordinates(screenX, screenY);
    character.moveTo(worldPos.x, worldPos.y);
}

// ゲーム状態の保存
function saveGameState() {
    if (!isGameInitialized) return;
    
    const gameData = {
        world: world.saveState(),
        character: character.saveState(),
        journal: journal.saveState(),
        collection: collection.saveState(),
        timestamp: Date.now()
    };
    
    storage.saveGameData(gameData);
}

// アセットのロード
function loadAssets() {
    return new Promise((resolve) => {
        // ここで必要な画像や音声をロード
        const bgImages = [
            'assets/images/world/SongCoverImage1.jpg',
            'assets/images/world/SongCoverImage2.jpg',
            'assets/images/world/SongCoverImage3.jpg',
            'assets/images/world/SongCoverImage4.jpg',
            'assets/images/world/SongCoverImage5.jpg',
            'assets/images/world/SongCoverImage6.jpg'
        ];
        const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];

        const assetsToLoad = [
            // 背景画像（ランダム）
            { type: 'image', id: 'background', src: randomBg },
            
            // 主人公キャラ画像
            { type: 'image', id: 'character', src: 'assets/images/character/1.png' },
            
            // アイテム・キャラ用画像（2〜20を全部ロード）
            { type: 'image', id: 'char2', src: 'assets/images/character/2.png' },
            { type: 'image', id: 'char3', src: 'assets/images/character/3.png' },
            { type: 'image', id: 'char4', src: 'assets/images/character/4.png' },
            { type: 'image', id: 'char5', src: 'assets/images/character/5.png' },
            { type: 'image', id: 'char6', src: 'assets/images/character/6.png' },
            { type: 'image', id: 'char7', src: 'assets/images/character/7.png' },
            { type: 'image', id: 'char8', src: 'assets/images/character/8.png' },
            { type: 'image', id: 'char9', src: 'assets/images/character/9.png' },
            { type: 'image', id: 'char10', src: 'assets/images/character/10.png' },
            { type: 'image', id: 'char11', src: 'assets/images/character/11.png' },
            { type: 'image', id: 'char12', src: 'assets/images/character/12.png' },
            { type: 'image', id: 'char13', src: 'assets/images/character/13.png' },
            { type: 'image', id: 'char14', src: 'assets/images/character/14.png' },
            { type: 'image', id: 'char15', src: 'assets/images/character/15.png' },
            { type: 'image', id: 'char16', src: 'assets/images/character/16.png' },
            { type: 'image', id: 'char17', src: 'assets/images/character/17.png' },
            { type: 'image', id: 'char18', src: 'assets/images/character/18.png' },
            { type: 'image', id: 'char19', src: 'assets/images/character/19.png' },
            { type: 'image', id: 'char20', src: 'assets/images/character/20.png' }
        ];
        
        let loadedCount = 0;
        const totalAssets = assetsToLoad.length;
        
        // ロード進捗の更新
        function updateLoadingProgress() {
            const progress = Math.floor((loadedCount / totalAssets) * 100);
            const loadingText = document.querySelector('#loading-screen p');
            if (loadingText) {
                loadingText.textContent = `アセットをロードしています... ${progress}%`;
            }
        }
        
        assetsToLoad.forEach(asset => {
            if (asset.type === 'image') {
                const img = new Image();
                img.onload = () => {
                    // 背景画像の場合は世界サイズを設定
                    if (asset.id === 'background') {
                        console.log(`Background image loaded: ${img.width}x${img.height}`);
                    }
                    
                    loadedCount++;
                    updateLoadingProgress();
                    if (loadedCount === totalAssets) {
                        isAssetsLoaded = true;
                        resolve();
                    }
                };
                img.onerror = () => {
                    console.error(`Failed to load image: ${asset.src}`);
                    // エラーの場合はデフォルト画像を使用
                    if (asset.id === 'background') {
                        const defaultImg = new Image();
                        defaultImg.src = 'assets/images/world/SongCoverImage1.jpg';
                        world.assets[asset.id] = defaultImg;
                    }
                    
                    loadedCount++;
                    updateLoadingProgress();
                    if (loadedCount === totalAssets) {
                        isAssetsLoaded = true;
                        resolve();
                    }
                };
                img.src = asset.src;
                world.assets[asset.id] = img;
            }
        });
        
        // アセットがない場合でも進行
        if (assetsToLoad.length === 0) {
            isAssetsLoaded = true;
            resolve();
        }
    });
}

// カスタム背景画像のロード（LocalStorageから）
function loadCustomBackground() {
    return new Promise((resolve) => {
        if (storage.hasCustomBackground()) {
            const dataUrl = storage.loadCustomBackground();
            if (dataUrl) {
                const img = new Image();
                img.onload = () => {
                    world.setCustomBackground(img);
                    resolve();
                };
                img.onerror = () => {
                    console.error('Failed to load custom background');
                    resolve();
                };
                img.src = dataUrl;
            } else {
                resolve();
            }
        } else {
            resolve();
        }
    });
}

// ゲーム開始時の処理
window.onload = async function() {
    try {
        const loadingText = document.querySelector('#loading-screen p');

        // アセットロード開始メッセージ
        if (loadingText) {
            loadingText.textContent = 'アセットをロードしています... 0%';
        }

        // アセットのロード
        await loadAssets();

        // カスタム背景のロード
        if (loadingText) {
            loadingText.textContent = 'カスタム設定を読み込んでいます...';
        }
        await loadCustomBackground();

        // ゲーム初期化
        if (loadingText) {
            loadingText.textContent = 'ゲームを初期化しています...';
        }

        // 保存済みゲームデータがあれば読み込む（クリアしない）
        if (storage.hasGameData()) {
            console.log('既存のゲームデータを読み込みます');
        } else {
            console.log('新しいゲームを開始します');
        }

        // ゲーム初期化
        initGame();
    } catch (error) {
        console.error("Game initialization failed:", error);
        
        // エラーメッセージを表示
        const loadingText = document.querySelector('#loading-screen p');
        if (loadingText) {
            loadingText.textContent = 'ゲームの初期化に失敗しました。ページを再読み込みしてください。';
        }
    }
};

// ブラウザの閉じる前に保存
window.addEventListener('beforeunload', function() {
    saveGameState();
});
