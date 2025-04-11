/**
 * ペヨーテの旅路 - ワールドスクリプト
 * 背景と世界オブジェクトの管理
 */

// ワールドモジュール
const world = (function() {
    // プライベート変数
    let worldWidth = 5000; // 世界の幅
    let worldHeight = 3000; // 世界の高さ
    let viewportWidth = window.innerWidth; // ビューポートの幅
    let viewportHeight = window.innerHeight; // ビューポートの高さ
    let cameraX = 0; // カメラX座標
    let cameraY = 0; // カメラY座標
    
    // 背景拡大倍率 - より広大なマップにするために拡大
    const bgScaleFactor = 3.0; // 背景を3倍に拡大
    
    // アセット
    const assets = {};
    
    // 世界に配置されるオブジェクト
    let worldObjects = [];
    
    // カスタム背景
    let customBackground = null;
    
    // 初期化
    function init(width, height) {
        viewportWidth = width;
        viewportHeight = height;
        
        // 背景画像が読み込まれるまで待機
        setTimeout(() => {
            // 背景画像のサイズに基づいてオブジェクトを配置
            if (assets.background && worldObjects.length === 0) {
                // オリジナルの画像サイズを保存
                const origBgWidth = assets.background.width;
                const origBgHeight = assets.background.height;
                
                // スケールを適用した世界サイズを設定
                worldWidth = origBgWidth * bgScaleFactor;
                worldHeight = origBgHeight * bgScaleFactor;
                
                // 新しいオブジェクトの配置（拡大後の背景サイズに基づいて）
                const charImages = [];
                for (let i = 2; i <= 20; i++) {
                    charImages.push('char' + i);
                }

                function randomCharImage() {
                    return charImages[Math.floor(Math.random() * charImages.length)];
                }

                // ピクセルアート画像の読み込み
                const itemImages = ['flower', 'stone', 'crystal'];
                const characterImages = ['pixel_rabbit', 'pixel_fox'];
                
                // SVG画像をアセットに読み込む
                for (const img of itemImages) {
                    const imgElement = new Image();
                    imgElement.src = `assets/images/item/${img}.svg`;
                    assets[`item_${img}`] = imgElement;
                }
                
                for (const img of characterImages) {
                    const imgElement = new Image();
                    imgElement.src = `assets/images/character/${img}.svg`;
                    assets[`char_${img}`] = imgElement;
                }

                worldObjects = [
                    {
                        id: "flower1",
                        x: worldWidth * 0.2,
                        y: worldHeight * 0.3,
                        type: "item",
                        image: "item_flower",
                        name: "ひまわり",
                        description: "明るく輝く黄色い花",
                        radius: 25,
                        canPickup: true
                    },
                    {
                        id: "stone1",
                        x: worldWidth * 0.8,
                        y: worldHeight * 0.7,
                        type: "item",
                        image: "item_stone",
                        name: "不思議な石",
                        description: "模様が美しい丸い石",
                        radius: 20,
                        canPickup: true
                    },
                    {
                        id: "rabbit1",
                        x: worldWidth * 0.5,
                        y: worldHeight * 0.4,
                        type: "character",
                        image: "char_pixel_rabbit",
                        name: "森のうさぎ",
                        description: "白いうさぎがこちらを見ています",
                        dialogue: "こんにちは、旅人さん。広い世界を旅しているんですね。",
                        radius: 30,
                        canTalk: true,
                        acceptsGifts: true
                    },
                    {
                        id: "crystal1",
                        x: worldWidth * 0.3,
                        y: worldHeight * 0.8,
                        type: "item",
                        image: "item_crystal",
                        name: "輝く結晶",
                        description: "神秘的な力を秘めた紫色の結晶",
                        radius: 25,
                        canPickup: true
                    },
                    {
                        id: "fox1",
                        x: worldWidth * 0.1,
                        y: worldHeight * 0.6,
                        type: "character",
                        image: "char_pixel_fox",
                        name: "キツネ",
                        description: "オレンジ色の毛並みが美しいキツネ",
                        dialogue: "こんにちは、旅人。何か面白いものを見つけた？",
                        radius: 30,
                        canTalk: true,
                        acceptsGifts: true
                    }
                ];
                
                // キャラクターの初期位置も調整
                const characterPos = character.getPosition();
                if (characterPos.x === 2500 && characterPos.y === 1500) {
                    // デフォルト位置のままなら中央に配置
                    character.moveTo(worldWidth * 0.5, worldHeight * 0.6);
                    character.stopMoving();
                }

                // 追加のオブジェクトをランダム配置
                for (let i = 0; i < 20; i++) {
                    const type = Math.random() < 0.5 ? 'item' : 'character';
                    const id = `${type}_extra_${i}`;
                    const x = Math.random() * worldWidth;
                    const y = Math.random() * worldHeight;
                    
                    if (type === 'item') {
                        // アイテムをランダムに選択
                        const randomItemImage = itemImages[Math.floor(Math.random() * itemImages.length)];
                        let itemName, itemDesc;
                        
                        // アイテムのタイプに合わせた名前と説明
                        if (randomItemImage === 'flower') {
                            itemName = '野の花';
                            itemDesc = '野原に咲く可憐な花';
                        } else if (randomItemImage === 'stone') {
                            itemName = '古い石';
                            itemDesc = '長い時を経た石';
                        } else if (randomItemImage === 'crystal') {
                            itemName = '神秘の結晶';
                            itemDesc = '不思議な力を秘めた結晶';
                        }
                        
                        worldObjects.push({
                            id,
                            x,
                            y,
                            type: 'item',
                            image: `item_${randomItemImage}`,
                            name: itemName,
                            description: itemDesc,
                            radius: 25,
                            canPickup: true
                        });
                    } else {
                        // キャラクターをランダムに選択
                        const randomCharImage = characterImages[Math.floor(Math.random() * characterImages.length)];
                        let charName, charDesc, charDialogue;
                        
                        // キャラクタータイプに合わせた名前と説明
                        if (randomCharImage === 'pixel_rabbit') {
                            charName = '森のうさぎ';
                            charDesc = '白いうさぎがこちらを見ています';
                            charDialogue = 'こんにちは、旅人さん。';
                        } else if (randomCharImage === 'pixel_fox') {
                            charName = '野生のキツネ';
                            charDesc = '好奇心旺盛なキツネ';
                            charDialogue = '何か面白いものを見つけた？';
                        }
                        
                        worldObjects.push({
                            id,
                            x,
                            y,
                            type: 'character',
                            image: `char_${randomCharImage}`,
                            name: charName,
                            description: charDesc,
                            dialogue: charDialogue,
                            radius: 30,
                            canTalk: true,
                            acceptsGifts: true
                        });
                    }
                }
                
                // デバッグログでオブジェクト数を確認
                console.log(`ワールドに${worldObjects.length}個のオブジェクトを配置しました`);
            }
        }, 300); // 少し遅延させて背景画像のロードを待つ
    }
    
    // 更新処理
    function update(deltaTime) {
        // 背景サイズの確認と設定
        if (assets.background && !customBackground) {
            const origBgWidth = assets.background.width;
            const origBgHeight = assets.background.height;
            worldWidth = origBgWidth * bgScaleFactor;
            worldHeight = origBgHeight * bgScaleFactor;
        }
        
        // キャラクターの位置に基づいてカメラを更新
        const characterPos = character.getPosition();
        
        // カメラの更新（キャラクターを中心に）
        cameraX = characterPos.x - viewportWidth / 2;
        cameraY = characterPos.y - viewportHeight / 2;
        
        // カメラが世界の外に出ないように制限
        cameraX = Math.max(0, Math.min(cameraX, worldWidth - viewportWidth));
        cameraY = Math.max(0, Math.min(cameraY, worldHeight - viewportHeight));
        
        // 世界の境界を越えないようにオブジェクトの位置を制限
        worldObjects.forEach(object => {
            object.x = Math.max(0, Math.min(object.x, worldWidth));
            object.y = Math.max(0, Math.min(object.y, worldHeight));
        });
    }
    
    // 描画処理
    function draw(ctx) {
        // 背景描画
        if (customBackground) {
            // カスタム背景がある場合
            ctx.drawImage(
                customBackground,
                cameraX, cameraY,
                viewportWidth, viewportHeight,
                0, 0,
                viewportWidth, viewportHeight
            );
        } else if (assets.background) {
            // シンプルに拡大して描画する方法に戻す
            const bg = assets.background;
            
            // 背景画像の実際のサイズ
            const origBgWidth = bg.width;
            const origBgHeight = bg.height;
            
            // 拡大後の世界サイズ
            const scaledWidth = origBgWidth * bgScaleFactor;
            const scaledHeight = origBgHeight * bgScaleFactor;
            
            // 拡大倍率に合わせた座標とサイズを計算
            const sourceX = (cameraX / bgScaleFactor);
            const sourceY = (cameraY / bgScaleFactor);
            const sourceWidth = (viewportWidth / bgScaleFactor);
            const sourceHeight = (viewportHeight / bgScaleFactor);
            
            // 背景の一部を切り出して描画
            ctx.drawImage(
                bg,
                sourceX, sourceY,
                sourceWidth, sourceHeight,
                0, 0,
                viewportWidth, viewportHeight
            );
        } else {
            // 背景がない場合はグラデーション
            const gradient = ctx.createLinearGradient(0, 0, 0, viewportHeight);
            gradient.addColorStop(0, '#87CEEB');
            gradient.addColorStop(1, '#E0F7FA');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, viewportWidth, viewportHeight);
        }
        
        // ビューポート内にあるオブジェクトのみ描画
        worldObjects.forEach(object => {
            // 世界の境界内にあるか確認
            if (object.x >= 0 && object.x <= worldWidth && 
                object.y >= 0 && object.y <= worldHeight) {
                
                // スクリーン座標に変換
                const screenX = object.x - cameraX;
                const screenY = object.y - cameraY;
                
                // ビューポート内にあるか確認（少し余裕を持たせる）
                if (
                    screenX > -100 && screenX < viewportWidth + 100 &&
                    screenY > -100 && screenY < viewportHeight + 100
                ) {
                    // オブジェクトの描画
                    const objectImage = assets[object.image];
                    if (objectImage) {
                        // オブジェクトのサイズを調整
                        const width = 40; // 固定サイズに設定
                        const height = 40;
                        
                        ctx.drawImage(
                            objectImage,
                            screenX - width / 2,
                            screenY - height / 2,
                            width, height
                        );
                    } else {
                        // 画像がなければ円を描画
                        ctx.beginPath();
                        ctx.arc(screenX, screenY, object.radius || 20, 0, Math.PI * 2);
                        
                        if (object.type === 'item') {
                            ctx.fillStyle = 'rgba(255, 200, 100, 0.7)';
                        } else if (object.type === 'character') {
                            ctx.fillStyle = 'rgba(100, 200, 255, 0.7)';
                        } else {
                            ctx.fillStyle = 'rgba(200, 200, 200, 0.7)';
                        }
                        
                        ctx.fill();
                        ctx.strokeStyle = '#333';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                }
            }
        });
        
        // デバッグ情報（開発中のみ表示）
        if (false) { // テスト時にtrueに変更
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(10, 10, 250, 120);
            ctx.fillStyle = 'white';
            ctx.font = '12px monospace';
            ctx.fillText(`World: ${worldWidth}x${worldHeight}`, 20, 30);
            ctx.fillText(`Camera: ${Math.round(cameraX)},${Math.round(cameraY)}`, 20, 50);
            ctx.fillText(`Viewport: ${viewportWidth}x${viewportHeight}`, 20, 70);
            ctx.fillText(`BG Original: ${assets.background ? assets.background.width : 0}x${assets.background ? assets.background.height : 0}`, 20, 90);
            ctx.fillText(`Objects: ${worldObjects.length}`, 20, 110);
        }
    }
    
    // スクリーン座標をワールド座標に変換
    function screenToWorldCoordinates(screenX, screenY) {
        return {
            x: screenX + cameraX,
            y: screenY + cameraY
        };
    }
    
    // ワールド座標をスクリーン座標に変換
    function worldToScreenCoordinates(worldX, worldY) {
        return {
            x: worldX - cameraX,
            y: worldY - cameraY
        };
    }
    
    // オブジェクトの検索
    function getObjectAt(x, y) {
        // クリック位置から最も近いオブジェクトを検索
        for (let i = 0; i < worldObjects.length; i++) {
            const object = worldObjects[i];
            const dx = object.x - x;
            const dy = object.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 距離がオブジェクトの半径以内であればそのオブジェクトを返す
            if (distance <= (object.radius || 25)) {
                return object;
            }
        }
        
        // 見つからなければnullを返す
        return null;
    }
    
    // オブジェクトの削除
    function removeObject(id) {
        const index = worldObjects.findIndex(obj => obj.id === id);
        if (index !== -1) {
            worldObjects.splice(index, 1);
            return true;
        }
        return false;
    }
    
    // オブジェクトの追加
    function addObject(object) {
        // 世界の境界内に収める
        object.x = Math.max(0, Math.min(object.x, worldWidth));
        object.y = Math.max(0, Math.min(object.y, worldHeight));
        
        worldObjects.push(object);
    }
    
    // ビューポートのサイズ更新
    function updateViewport(width, height) {
        viewportWidth = width;
        viewportHeight = height;
    }
    
    // カスタム背景の設定
    function setCustomBackground(imageObject) {
        customBackground = imageObject;
        worldWidth = imageObject.width;
        worldHeight = imageObject.height;
        
        // オブジェクトの位置を調整
        worldObjects.forEach(object => {
            object.x = Math.min(object.x, worldWidth);
            object.y = Math.min(object.y, worldHeight);
        });
    }
    
    // カスタム背景のクリア
    function clearCustomBackground() {
        customBackground = null;
        if (assets.background) {
            const origBgWidth = assets.background.width;
            const origBgHeight = assets.background.height;
            worldWidth = origBgWidth * bgScaleFactor;
            worldHeight = origBgHeight * bgScaleFactor;
        } else {
            worldWidth = 5000;
            worldHeight = 3000;
        }
    }
    
    // ステート保存
    function saveState() {
        return {
            objects: worldObjects,
            customBackground: customBackground ? true : false,
            worldWidth: worldWidth,
            worldHeight: worldHeight,
            cameraX: cameraX,
            cameraY: cameraY
        };
    }
    
    // ステート読み込み
    function loadState(state) {
        if (state) {
            worldObjects = state.objects || [];
            // カスタム背景は画像データとして保存できないため
            // 実際の画像データはstorage.jsで別途処理
            worldWidth = state.worldWidth || 5000;
            worldHeight = state.worldHeight || 3000;
            cameraX = state.cameraX || 0;
            cameraY = state.cameraY || 0;
        }
    }
    
    // 指定位置の近くにあるオブジェクトを検索（広い範囲で）
    function getObjectNear(x, y, radius = 50) {
        let closestObject = null;
        let closestDistance = radius;
        
        // すべてのオブジェクトをチェックして最も近いものを見つける
        for (let i = 0; i < worldObjects.length; i++) {
            const object = worldObjects[i];
            const dx = object.x - x;
            const dy = object.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // 指定範囲内で最も近いオブジェクトを記録
            if (distance <= closestDistance) {
                closestObject = object;
                closestDistance = distance;
            }
        }
        
        return closestObject;
    }
    
    // ミニマップを描画
    function drawMinimap(ctx, x, y, width, height) {
        // ミニマップの背景
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(x, y, width, height);
        
        // 世界の縮尺を計算
        const scaleX = width / worldWidth;
        const scaleY = height / worldHeight;
        
        // 背景画像の縮小描画（可能であれば）
        if (assets.background) {
            ctx.drawImage(
                assets.background,
                x, y,
                width, height
            );
        }
        
        // 現在のビューポート範囲を表示
        const vpX = x + cameraX * scaleX;
        const vpY = y + cameraY * scaleY;
        const vpW = viewportWidth * scaleX;
        const vpH = viewportHeight * scaleY;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(vpX, vpY, vpW, vpH);
        
        // プレイヤーの位置
        const playerPos = character.getPosition();
        const playerX = x + playerPos.x * scaleX;
        const playerY = y + playerPos.y * scaleY;
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
        ctx.fill();
        
        // オブジェクトも表示
        worldObjects.forEach(obj => {
            const objX = x + obj.x * scaleX;
            const objY = y + obj.y * scaleY;
            
            // オブジェクトの種類に応じた色
            if (obj.type === 'item') {
                ctx.fillStyle = 'rgba(255, 200, 0, 0.8)';
            } else if (obj.type === 'character') {
                ctx.fillStyle = 'rgba(0, 200, 255, 0.8)';
            } else {
                ctx.fillStyle = 'rgba(200, 200, 200, 0.8)';
            }
            
            ctx.beginPath();
            ctx.arc(objX, objY, 2, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // 全体マップの表示
    function showFullMap() {
        // マップ画面を取得
        const mapScreen = document.getElementById('map-screen');
        if (!mapScreen) return;
        
        // マップを表示
        mapScreen.classList.remove('hidden');
        
        // マップキャンバスを更新
        const mapCanvas = document.getElementById('mapCanvas');
        if (!mapCanvas) return;
        
        const mapWidth = mapScreen.clientWidth;
        const mapHeight = mapScreen.clientHeight - 50; // ヘッダー分を引く
        
        mapCanvas.width = mapWidth;
        mapCanvas.height = mapHeight;
        
        const mapCtx = mapCanvas.getContext('2d');
        
        // マップ背景
        mapCtx.fillStyle = '#f0f7f1';
        mapCtx.fillRect(0, 0, mapWidth, mapHeight);
        
        // 縮尺を計算
        const padding = 20;
        const contentWidth = mapWidth - padding * 2;
        const contentHeight = mapHeight - padding * 2;
        
        const scaleX = contentWidth / worldWidth;
        const scaleY = contentHeight / worldHeight;
        const scale = Math.min(scaleX, scaleY);
        
        // 中央に配置するための計算
        const scaledWidth = worldWidth * scale;
        const scaledHeight = worldHeight * scale;
        const offsetX = (mapWidth - scaledWidth) / 2;
        const offsetY = (mapHeight - scaledHeight) / 2;
        
        // 背景画像の描画
        if (assets.background) {
            mapCtx.drawImage(
                assets.background,
                offsetX, offsetY,
                scaledWidth, scaledHeight
            );
        } else {
            // 背景画像がない場合はシンプルな背景
            mapCtx.fillStyle = '#e0efe2';
            mapCtx.fillRect(offsetX, offsetY, scaledWidth, scaledHeight);
        }
        
        // オブジェクト描画
        worldObjects.forEach(obj => {
            const objX = offsetX + obj.x * scale;
            const objY = offsetY + obj.y * scale;
            
            // オブジェクトの種類に応じた色
            if (obj.type === 'item') {
                mapCtx.fillStyle = '#ffc107';
            } else if (obj.type === 'character') {
                mapCtx.fillStyle = '#2196f3';
            } else {
                mapCtx.fillStyle = '#9e9e9e';
            }
            
            // オブジェクト表示
            mapCtx.beginPath();
            mapCtx.arc(objX, objY, 5, 0, Math.PI * 2);
            mapCtx.fill();
            
            // ラベル表示（オプション）
            if (scale > 0.1) { // 一定以上の拡大率の場合のみ名前を表示
                mapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                mapCtx.font = '10px sans-serif';
                mapCtx.fillText(obj.name, objX + 7, objY + 3);
            }
        });
        
        // プレイヤー位置
        const playerPos = character.getPosition();
        const playerX = offsetX + playerPos.x * scale;
        const playerY = offsetY + playerPos.y * scale;
        
        mapCtx.fillStyle = '#e53935';
        mapCtx.beginPath();
        mapCtx.arc(playerX, playerY, 7, 0, Math.PI * 2);
        mapCtx.fill();
        
        // 現在のビューポートを表示
        const vpX = offsetX + cameraX * scale;
        const vpY = offsetY + cameraY * scale;
        const vpW = viewportWidth * scale;
        const vpH = viewportHeight * scale;
        
        mapCtx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        mapCtx.lineWidth = 2;
        mapCtx.strokeRect(vpX, vpY, vpW, vpH);
        
        // 凡例の表示
        const legendY = mapHeight - 40;
        
        mapCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        mapCtx.font = '12px sans-serif';
        
        mapCtx.fillStyle = '#e53935';
        mapCtx.beginPath();
        mapCtx.arc(30, legendY, 5, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.fillStyle = 'black';
        mapCtx.fillText('プレイヤー', 40, legendY + 4);
        
        mapCtx.fillStyle = '#2196f3';
        mapCtx.beginPath();
        mapCtx.arc(120, legendY, 5, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.fillStyle = 'black';
        mapCtx.fillText('キャラクター', 130, legendY + 4);
        
        mapCtx.fillStyle = '#ffc107';
        mapCtx.beginPath();
        mapCtx.arc(220, legendY, 5, 0, Math.PI * 2);
        mapCtx.fill();
        mapCtx.fillStyle = 'black';
        mapCtx.fillText('アイテム', 230, legendY + 4);
    }

    // モジュールの公開API
    return {
        init,
        update,
        draw,
        screenToWorldCoordinates,
        worldToScreenCoordinates,
        getObjectAt,
        getObjectNear,
        removeObject,
        addObject,
        updateViewport,
        setCustomBackground,
        clearCustomBackground,
        saveState,
        loadState,
        assets,
        drawMinimap,
        showFullMap
    };
})();