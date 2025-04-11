/**
 * ペヨーテの旅路 - キャラクタースクリプト
 * プレイヤーキャラクターの制御を管理
 */

// キャラクターモジュール
const character = (function() {
    // プライベート変数
    let x = 2500; // 初期X座標
    let y = 1500; // 初期Y座標
    let targetX = x; // 移動目標X座標
    let targetY = y; // 移動目標Y座標
    let speed = 5; // 移動速度（ピクセル/フレーム）
    let isMoving = false; // 移動中フラグ
    let direction = 'right'; // キャラクターの向き（left/right）
    
    // キャラクターサイズ
    const characterSize = 60; // 基本サイズを60pxに設定
    
    // 初期化
    function init() {
        // 初期位置が世界の境界外にならないように調整
        const worldBounds = {
            width: world.assets.background ? world.assets.background.width * 3 : 5000, // 拡大率を考慮
            height: world.assets.background ? world.assets.background.height * 3 : 3000 // 拡大率を考慮
        };
        
        console.log("Character init with world bounds:", worldBounds);
        
        x = Math.min(Math.max(x, 0), worldBounds.width);
        y = Math.min(Math.max(y, 0), worldBounds.height);
        
        targetX = x;
        targetY = y;
    }
    
    // 更新処理
    function update(deltaTime) {
        // 移動前の位置を記録
        const prevX = x;
        const prevY = y;
        
        // 移動処理
        if (isMoving) {
            // 目標地点までの距離を計算
            const dx = targetX - x;
            const dy = targetY - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 一定距離以上なら移動を続ける
            if (distance > speed) {
                // 移動方向を正規化
                const moveX = dx / distance * speed;
                const moveY = dy / distance * speed;
                
                x += moveX;
                y += moveY;
                
                // 向きの更新
                if (moveX !== 0) {
                    direction = moveX > 0 ? 'right' : 'left';
                }
                
                // 移動中も低確率で接触チェック（50フレームに1回程度）
                if (Math.random() < 0.02) {
                    checkInteraction();
                }
            } else {
                // 目標に到達
                x = targetX;
                y = targetY;
                isMoving = false;
                
                // 到着イベント発火
                onArrival();
            }
        }
    }
    
    // 最後に接触したオブジェクトのID
    let lastInteractedObjectId = null;
    // 次の接触チェックを許可する時間
    let nextInteractionTime = 0;
    
    // オブジェクトとの接触チェック
    function checkInteraction() {
        // 時間制限をチェック - 連続接触の防止
        const now = Date.now();
        if (now < nextInteractionTime) {
            return;
        }
        
        // 広い検出範囲で周辺オブジェクトをチェック
        const interactionRadius = 60;
        const nearbyObject = world.getObjectNear(x, y, interactionRadius);
        
        // オブジェクトが見つからない場合は何もしない
        if (!nearbyObject) return;
        
        // アイテムの場合は自動的に拾う
        if (nearbyObject.type === 'item' && nearbyObject.canPickup) {
            // 最後に接触したオブジェクトを更新
            lastInteractedObjectId = nearbyObject.id;
            // 次の接触までのクールダウン（1.5秒）
            nextInteractionTime = now + 1500;
            
            // アイテムを自動的に拾う
            autoPickupItem(nearbyObject);
            return;
        }
        
        // キャラクターの場合は従来通りインタラクションポップアップを表示
        // 前回と異なるオブジェクトか3秒以上経過していること
        if (nearbyObject.id !== lastInteractedObjectId || now > nextInteractionTime + 3000) {
            // 近くにオブジェクトがある場合は移動を止めて対話を開始
            stopMoving();
            
            // 最後に接触したオブジェクトを更新
            lastInteractedObjectId = nearbyObject.id;
            // 次の接触までのクールダウン（2秒）
            nextInteractionTime = now + 2000;
            
            // インタラクションポップアップを表示
            if (typeof interaction !== 'undefined' && interaction.showInteractionPopup) {
                // デバッグログ
                console.log("オブジェクトと接触:", nearbyObject.name);
                
                // インタラクションを表示
                interaction.showInteractionPopup(nearbyObject);
                
                // 効果音を再生（存在する場合）
                if (typeof audio !== 'undefined' && audio.playSfx) {
                    try {
                        audio.playSfx('discover');
                    } catch (e) {
                        console.log("SFX playback failed:", e);
                    }
                }
                
                // ビジュアルフィードバック（通知マーカー）の表示
                // 既存のマーカーを削除
                const existingMarkers = document.querySelectorAll('.interaction-marker');
                existingMarkers.forEach(marker => {
                    if (marker.parentNode) {
                        marker.parentNode.removeChild(marker);
                    }
                });
                
                // 新しいマーカーを表示
                const interactionMarker = document.createElement('div');
                interactionMarker.className = 'interaction-marker';
                interactionMarker.innerHTML = '!';
                document.getElementById('game-container').appendChild(interactionMarker);
                
                // マーカーの位置を設定
                const screenPos = world.worldToScreenCoordinates(nearbyObject.x, nearbyObject.y);
                interactionMarker.style.left = `${screenPos.x}px`;
                interactionMarker.style.top = `${screenPos.y - 40}px`; // 少し上に表示
                
                // 一定時間後に消去
                setTimeout(() => {
                    if (interactionMarker.parentNode) {
                        interactionMarker.parentNode.removeChild(interactionMarker);
                    }
                }, 2000);
            }
        }
    }
    
    // アイテムを自動的に拾う処理
    function autoPickupItem(item) {
        if (!item || !item.canPickup) return;
        
        // コレクションに追加
        if (typeof collection !== 'undefined' && collection.addItem) {
            collection.addItem({
                id: item.id,
                name: item.name,
                description: item.description,
                image: item.image
            });
            
            // ジャーナルに記録
            if (typeof journal !== 'undefined' && journal.addEntry) {
                journal.addEntry({
                    type: 'item',
                    title: `${item.name}を見つけました`,
                    content: `${item.description}`,
                    timestamp: Date.now()
                });
            }
            
            // ワールドからオブジェクトを削除
            if (typeof world !== 'undefined' && world.removeObject) {
                world.removeObject(item.id);
            }
            
            // 効果音再生
            if (typeof audio !== 'undefined' && audio.playSfx) {
                try {
                    audio.playSfx('pickup');
                } catch (e) {
                    console.log("SFX playback failed:", e);
                }
            }
            
            // アイテム取得通知の表示（説明文も渡す）
            showItemNotification(item.name, item.description);
        }
    }
    
    // アイテム取得通知の表示
    function showItemNotification(itemName, itemDescription = "") {
        
        // すでに通知がある場合は削除
        const existingNotifications = document.querySelectorAll('.item-pickup-notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // 新しい通知を作成（二段構成）
        const notification = document.createElement('div');
        notification.className = 'item-pickup-notification';
        
        // アイテム名と説明を二段で表示
        notification.innerHTML = `
            <div class="notification-title">${itemName}を手に入れました！</div>
            ${itemDescription ? `<div class="notification-description">${itemDescription}</div>` : ''}
        `;
        
        document.getElementById('game-container').appendChild(notification);
        
        // 表示アニメーション
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 一定時間後に消去（説明文がある場合は少し長めに表示）
        const displayTime = itemDescription ? 3000 : 2000;
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, displayTime);
    }
    
    // 描画処理
    function draw(ctx) {
        // ワールド座標からスクリーン座標に変換
        const screenPos = world.worldToScreenCoordinates(x, y);
        
        // キャラクターの描画
        if (world.assets.character) {
            const image = world.assets.character;
            
            // 元の画像の比率を維持
            const imageRatio = image.width / image.height;
            const width = characterSize;
            const height = width / imageRatio;
            
            // 中心を基準に描画
            ctx.save();
            
            // 常に同じ位置を中心に描画（キャラクターの足元を基準に）
            if (direction === 'left') {
                // 左向きの場合は画像を水平反転
                ctx.translate(screenPos.x, screenPos.y - height / 2);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    image,
                    -width / 2, 0,
                    width, height
                );
            } else {
                // 右向きの場合はそのまま描画
                ctx.translate(screenPos.x, screenPos.y - height / 2);
                ctx.drawImage(
                    image,
                    -width / 2, 0,
                    width, height
                );
            }
            ctx.restore();
        } else {
            // 画像がない場合は円を描画
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, 20, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(50, 150, 200, 0.8)';
            ctx.fill();
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // デバッグ情報（開発時に必要な場合コメントを外す）
        if (false) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(screenPos.x + 10, screenPos.y - 50, 120, 40);
            ctx.fillStyle = 'white';
            ctx.font = '10px monospace';
            ctx.fillText(`X: ${Math.round(x)}`, screenPos.x + 15, screenPos.y - 35);
            ctx.fillText(`Y: ${Math.round(y)}`, screenPos.x + 15, screenPos.y - 20);
        }
    }
    
    // 指定位置への移動
    function moveTo(newX, newY) {
        // 世界の境界を取得
        let worldWidth, worldHeight;
        
        if (world.assets.background) {
            // 拡大率を考慮した世界サイズを取得
            worldWidth = world.assets.background.width * 3; // 拡大率を直接指定
            worldHeight = world.assets.background.height * 3;
        } else {
            worldWidth = 5000;
            worldHeight = 3000;
        }
        
        // 世界の境界チェック
        targetX = Math.min(Math.max(newX, 0), worldWidth);
        targetY = Math.min(Math.max(newY, 0), worldHeight);
        
        isMoving = true;
    }
    
    // 現在位置の取得
    function getPosition() {
        return { x, y };
    }
    
    // 移動停止
    function stopMoving() {
        isMoving = false;
    }
    
    // 目標地点到着時の処理
    function onArrival() {
        // 接触チェックを実行
        checkInteraction();
    }
    
    // ステート保存
    function saveState() {
        return {
            x,
            y,
            direction
        };
    }
    
    // ステート読み込み
    function loadState(state) {
        if (state) {
            x = state.x || 2500;
            y = state.y || 1500;
            targetX = x;
            targetY = y;
            direction = state.direction || 'right';
            isMoving = false;
        }
    }
    
    // モジュールの公開API
    return {
        init,
        update,
        draw,
        moveTo,
        getPosition,
        stopMoving,
        saveState,
        loadState
    };
})();
