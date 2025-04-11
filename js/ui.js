/**
 * ペヨーテの旅路 - UIスクリプト
 * ユーザーインターフェースの管理
 */

// UIモジュール
const ui = (function() {
    // 初期化
    function init() {
        // メニューボタンのイベント設定
        const menuButton = document.getElementById('menu-button');
        if (menuButton) {
            menuButton.addEventListener('click', showMenu);
        }
        
        // メニュー画面の初期化
        initMenuScreen();
        
        // 設定画面の初期化
        initSettingsScreen();
    }
    
    // メニュー画面の初期化
    function initMenuScreen() {
        const menuScreen = document.getElementById('menu-screen');
        if (!menuScreen) return;
        
        // 閉じるボタンの設定
        const closeButton = menuScreen.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', hideMenu);
        }
        
        // メニュー項目のイベント設定
        const menuItems = menuScreen.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            // サウンド切り替えボタンの特別処理
            if (item.id === 'sound-toggle') {
                item.addEventListener('click', function() {
                    toggleSound(this);
                });
                
                // 初期状態の設定
                updateSoundToggleState(item, false);
            } else {
                // 他のメニュー項目は通常処理
                item.addEventListener('click', function() {
                    const screenId = this.getAttribute('data-screen');
                    if (screenId) {
                        if (screenId === 'map') {
                            // マップ画面の特別処理
                            world.showFullMap();
                        } else {
                            // 通常画面表示
                            showScreen(screenId);
                        }
                        hideMenu();
                    }
                });
            }
        });
    }
    
    // サウンド切り替え
    function toggleSound(element) {
        // 現在の状態を反転
        let isMuted = element.classList.contains('muted');
        isMuted = !isMuted;
        
        // 見た目の更新
        updateSoundToggleState(element, isMuted);
        
        // 実際のサウンド変更
        if (typeof audio !== 'undefined' && audio.setMute) {
            audio.setMute(isMuted);
        }
    }
    
    // サウンドトグルの表示状態更新
    function updateSoundToggleState(element, isMuted) {
        if (isMuted) {
            element.classList.add('muted');
            element.querySelector('.menu-item-icon').textContent = '🔇';
            element.querySelector('.menu-item-text').textContent = 'BGM: オフ';
        } else {
            element.classList.remove('muted');
            element.querySelector('.menu-item-icon').textContent = '🔊';
            element.querySelector('.menu-item-text').textContent = 'BGM: オン';
        }
    }
    
    // 設定画面の初期化
    function initSettingsScreen() {
        const settingsScreen = document.getElementById('settings-screen');
        if (!settingsScreen) return;
        
        // 閉じるボタンの設定
        const closeButton = settingsScreen.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                settingsScreen.classList.add('hidden');
            });
        }
        
        // 設定値の初期読み込み
        const settings = storage.loadSettings() || {
            bgmVolume: 60,
            sfxVolume: 80
        };
        
        // BGM音量スライダーの設定
        const bgmVolumeSlider = document.getElementById('bgm-volume');
        if (bgmVolumeSlider) {
            bgmVolumeSlider.value = settings.bgmVolume;
            bgmVolumeSlider.addEventListener('change', function() {
                settings.bgmVolume = parseInt(this.value, 10);
                storage.saveSettings(settings);
                // BGM音量の反映（実装時に追加）
            });
        }
        
        // 効果音音量スライダーの設定
        const sfxVolumeSlider = document.getElementById('sfx-volume');
        if (sfxVolumeSlider) {
            sfxVolumeSlider.value = settings.sfxVolume;
            sfxVolumeSlider.addEventListener('change', function() {
                settings.sfxVolume = parseInt(this.value, 10);
                storage.saveSettings(settings);
                // 効果音音量の反映（実装時に追加）
            });
        }
        
        // 背景画像アップロードの設定
        const backgroundUpload = document.getElementById('backgroundUpload');
        if (backgroundUpload) {
            backgroundUpload.addEventListener('change', handleBackgroundUpload);
        }
    }
    
    // 背景画像アップロードの処理
    function handleBackgroundUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // ファイルサイズのチェック
        if (file.size > 5 * 1024 * 1024) { // 5MB以上
            alert('ファイルサイズが大きすぎます（5MB以下にしてください）');
            return;
        }
        
        // 画像タイプのチェック
        if (!file.type.match('image.*')) {
            alert('画像ファイルを選択してください');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const image = new Image();
            image.onload = function() {
                // 画像サイズの制限（必要に応じて）
                if (image.width > 8000 || image.height > 8000) {
                    alert('画像サイズが大きすぎます（8000x8000以下にしてください）');
                    return;
                }
                
                // 背景画像の設定
                world.setCustomBackground(image);
                
                // LocalStorageに保存（容量に注意）
                try {
                    // キャンバスを使用して画像を圧縮
                    const canvas = document.createElement('canvas');
                    const maxSize = 2048; // 最大サイズ
                    
                    let width = image.width;
                    let height = image.height;
                    
                    // 大きすぎる場合はリサイズ
                    if (width > maxSize || height > maxSize) {
                        if (width > height) {
                            height = Math.floor(height * (maxSize / width));
                            width = maxSize;
                        } else {
                            width = Math.floor(width * (maxSize / height));
                            height = maxSize;
                        }
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(image, 0, 0, width, height);
                    
                    // JPEG形式で圧縮して保存
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    storage.saveCustomBackground(dataUrl);
                    
                    // 成功メッセージ
                    showNotification('背景画像を設定しました');
                } catch (error) {
                    console.error('Failed to save background:', error);
                    alert('背景画像の保存に失敗しました。サイズを小さくしてみてください。');
                }
            };
            
            image.src = e.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    // メニューの表示
    function showMenu() {
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.classList.remove('hidden');
        }
    }
    
    // メニューを隠す
    function hideMenu() {
        const menuScreen = document.getElementById('menu-screen');
        if (menuScreen) {
            menuScreen.classList.add('hidden');
        }
    }
    
    // 指定した画面を表示
    function showScreen(screenId) {
        // 全画面を一旦隠す
        hideAllScreens();
        
        // 指定した画面を表示
        const screen = document.getElementById(`${screenId}-screen`);
        if (screen) {
            screen.classList.remove('hidden');
            
            // 特定の画面に応じた追加処理
            switch (screenId) {
                case 'journal':
                    journal.showJournal();
                    break;
                case 'collection':
                    collection.showCollection();
                    break;
                case 'map':
                    // マップ画面が表示されたら描画更新
                    const mapCanvas = document.getElementById('mapCanvas');
                    if (mapCanvas && typeof world.showFullMap === 'function') {
                        world.showFullMap();
                    }
                    break;
                // 他の画面に対する処理
            }
        }
    }
    
    // 全ての画面を隠す
    function hideAllScreens() {
        const screens = document.querySelectorAll('.screen');
        screens.forEach(screen => {
            screen.classList.add('hidden');
        });
    }
    
    // 通知の表示
    function showNotification(message, duration = 3000) {
        // 既存の通知があれば削除
        const existingNotification = document.getElementById('notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // 通知要素の作成
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = 'notification';
        notification.textContent = message;
        
        // 画面に追加
        document.getElementById('game-container').appendChild(notification);
        
        // アニメーション用クラスを追加
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 一定時間後に削除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300); // フェードアウト後に削除
        }, duration);
    }
    
    // 確認ダイアログの表示
    function showConfirm(message, onConfirm, onCancel) {
        // 既存の確認ダイアログがあれば削除
        const existingConfirm = document.getElementById('confirm-dialog');
        if (existingConfirm) {
            existingConfirm.remove();
        }
        
        // 確認ダイアログの作成
        const confirmDialog = document.createElement('div');
        confirmDialog.id = 'confirm-dialog';
        confirmDialog.className = 'dialog';
        
        confirmDialog.innerHTML = `
            <div class="dialog-content">
                <p>${message}</p>
                <div class="dialog-buttons">
                    <button class="dialog-button confirm-button">はい</button>
                    <button class="dialog-button cancel-button">いいえ</button>
                </div>
            </div>
        `;
        
        // 画面に追加
        document.getElementById('game-container').appendChild(confirmDialog);
        
        // ボタンのイベント設定
        const confirmButton = confirmDialog.querySelector('.confirm-button');
        const cancelButton = confirmDialog.querySelector('.cancel-button');
        
        confirmButton.addEventListener('click', function() {
            confirmDialog.remove();
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
        
        cancelButton.addEventListener('click', function() {
            confirmDialog.remove();
            if (typeof onCancel === 'function') {
                onCancel();
            }
        });
    }
    
    // モジュールの公開API
    return {
        init,
        showMenu,
        hideMenu,
        showScreen,
        hideAllScreens,
        showNotification,
        showConfirm
    };
})();
