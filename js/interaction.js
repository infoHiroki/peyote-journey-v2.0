/**
 * ペヨーテの旅路 - インタラクションスクリプト
 * オブジェクトとの対話を管理
 */

// インタラクションモジュール
const interaction = (function() {
    // プライベート変数
    let currentObject = null; // 現在対話中のオブジェクト
    
    // 初期化
    function init() {
        // 対話UIの初期設定
        const popup = document.getElementById('interaction-popup');
        
        // 対話アクションボタンの設定
        const options = popup.querySelectorAll('.interaction-option');
        options.forEach(option => {
            option.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleAction(action);
            });
        });
        
        // 閉じるボタンの追加
        if (!popup.querySelector('.interaction-close-btn')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'interaction-close-btn';
            closeBtn.innerHTML = '×';
            closeBtn.addEventListener('click', hideInteractionPopup);
            popup.appendChild(closeBtn);
        }
        
        // ポップアップ自体のイベント伝播を止める
        popup.addEventListener('click', function(event) {
            event.stopPropagation();
        });
        
        // ポップアップ外クリックで閉じる（任意の位置をクリックで閉じる）
        document.addEventListener('click', function(event) {
            if (!popup.classList.contains('hidden')) {
                // ポップアップ外のクリックの場合
                if (!popup.contains(event.target)) {
                    hideInteractionPopup();
                }
            }
        });
    }
    
    // 対話ポップアップの表示
    function showInteractionPopup(object) {
        currentObject = object;
        
        const popup = document.getElementById('interaction-popup');
        const title = popup.querySelector('.interaction-title');
        const content = popup.querySelector('.interaction-content');
        const options = popup.querySelector('.interaction-options');
        
        // オブジェクト情報を表示
        title.textContent = object.name;
        content.textContent = object.description;
        
        // アクションボタンの更新
        options.innerHTML = '';
        
        // 対象に応じたアクションボタンを追加
        if (object.canPickup) {
            const pickupBtn = document.createElement('button');
            pickupBtn.className = 'interaction-option';
            pickupBtn.setAttribute('data-action', 'pickup');
            pickupBtn.textContent = '拾う';
            options.appendChild(pickupBtn);
        }
        
        if (object.canTalk) {
            const talkBtn = document.createElement('button');
            talkBtn.className = 'interaction-option';
            talkBtn.setAttribute('data-action', 'talk');
            talkBtn.textContent = '話す';
            options.appendChild(talkBtn);
        }
        
        if (object.acceptsGifts && collection.hasItems()) {
            const giftBtn = document.createElement('button');
            giftBtn.className = 'interaction-option';
            giftBtn.setAttribute('data-action', 'gift');
            giftBtn.textContent = 'プレゼントを渡す';
            options.appendChild(giftBtn);
        }
        
        // 共通のアクション
        const examineBtn = document.createElement('button');
        examineBtn.className = 'interaction-option';
        examineBtn.setAttribute('data-action', 'examine');
        examineBtn.textContent = '調べる';
        options.appendChild(examineBtn);
        
        // ポップアップを表示
        popup.classList.remove('hidden');
        
        // イベントリスナーを再設定
        const optionBtns = popup.querySelectorAll('.interaction-option');
        optionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleAction(action);
            });
        });
    }
    
    // 対話ポップアップを閉じる
    function hideInteractionPopup() {
        const popup = document.getElementById('interaction-popup');
        popup.classList.add('hidden');
        currentObject = null;
    }
    
    // アクション処理
    function handleAction(action) {
        if (!currentObject) return;
        
        switch (action) {
            case 'pickup':
                pickupObject();
                break;
            case 'talk':
                talkToObject();
                break;
            case 'gift':
                showGiftOptions();
                break;
            case 'examine':
                examineObject();
                break;
        }
    }
    
    // オブジェクトを拾う
    function pickupObject() {
        if (!currentObject || !currentObject.canPickup) return;
        
        // コレクションに追加
        collection.addItem({
            id: currentObject.id,
            name: currentObject.name,
            description: currentObject.description,
            image: currentObject.image
        });
        
        // ジャーナルに記録
        journal.addEntry({
            type: 'item',
            title: `${currentObject.name}を見つけました`,
            content: `${currentObject.description}`,
            timestamp: Date.now()
        });
        
        // ワールドからオブジェクトを削除
        world.removeObject(currentObject.id);
        
        // 効果音再生（あれば）
        // playSoundEffect('pickup');
        
        // ポップアップを閉じる
        hideInteractionPopup();
    }
    
    // オブジェクトと会話
    function talkToObject() {
        if (!currentObject || !currentObject.canTalk) return;
        
        // 対話ポップアップの内容を会話に変更
        const popup = document.getElementById('interaction-popup');
        const content = popup.querySelector('.interaction-content');
        content.textContent = currentObject.dialogue || "...";
        
        // アクションボタンを閉じるボタンに変更
        const options = popup.querySelector('.interaction-options');
        options.innerHTML = '';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'interaction-option';
        closeBtn.textContent = '閉じる';
        closeBtn.addEventListener('click', hideInteractionPopup);
        options.appendChild(closeBtn);
        
        // ジャーナルに記録
        journal.addEntry({
            type: 'conversation',
            title: `${currentObject.name}との会話`,
            content: currentObject.dialogue || "...",
            timestamp: Date.now()
        });
        
        // 効果音再生（あれば）
        // playSoundEffect('talk');
    }
    
    // プレゼント選択画面表示
    function showGiftOptions() {
        if (!currentObject || !currentObject.acceptsGifts) return;
        
        // 対話ポップアップの内容をプレゼント選択に変更
        const popup = document.getElementById('interaction-popup');
        const content = popup.querySelector('.interaction-content');
        content.textContent = "渡すプレゼントを選んでください";
        
        // アイテムリストを表示
        const options = popup.querySelector('.interaction-options');
        options.innerHTML = '';
        
        // コレクションからアイテムを取得
        const items = collection.getItems();
        
        // 各アイテムのボタンを作成
        items.forEach(item => {
            const itemBtn = document.createElement('button');
            itemBtn.className = 'interaction-option gift-option';
            itemBtn.textContent = item.name;
            itemBtn.setAttribute('data-item-id', item.id);
            itemBtn.addEventListener('click', function() {
                giveGift(item.id);
            });
            options.appendChild(itemBtn);
        });
        
        // キャンセルボタン
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'interaction-option';
        cancelBtn.textContent = 'キャンセル';
        cancelBtn.addEventListener('click', function() {
            // 元の対話ポップアップに戻す
            showInteractionPopup(currentObject);
        });
        options.appendChild(cancelBtn);
    }
    
    // プレゼントを渡す
    function giveGift(itemId) {
        if (!currentObject || !currentObject.acceptsGifts) return;
        
        // アイテムを取得
        const item = collection.getItemById(itemId);
        if (!item) return;
        
        // プレゼントの受け取り反応（ランダムな反応または設定された反応）
        let reaction = "ありがとう...";
        if (currentObject.giftReactions && currentObject.giftReactions[itemId]) {
            reaction = currentObject.giftReactions[itemId];
        } else {
            // アイテムタイプに基づく反応
            if (item.itemType === 'flower' || (item.image && item.image.includes('flower'))) {
                const flowerReactions = [
                    "わぁ、とても綺麗な花！ありがとう、大切にするね。",
                    "花をくれるなんて、素敵な気遣いだね。",
                    "こんなに可愛らしい花を見つけたの？ありがとう！"
                ];
                reaction = flowerReactions[Math.floor(Math.random() * flowerReactions.length)];
            } else if (item.itemType === 'stone' || (item.image && item.image.includes('stone'))) {
                const stoneReactions = [
                    "面白い形の石だね。コレクションに加えるよ。",
                    "こんな特別な石を見つけたの？ありがとう。",
                    "石集めが趣味なんだ。これは貴重なものだね。"
                ];
                reaction = stoneReactions[Math.floor(Math.random() * stoneReactions.length)];
            } else if (item.itemType === 'crystal' || (item.image && item.image.includes('crystal'))) {
                const crystalReactions = [
                    "きらきら輝いていて美しい...こんな素晴らしい結晶をありがとう。",
                    "神秘的な力を感じる結晶だね。貴重なプレゼントに感謝するよ。",
                    "こんな美しい結晶は初めて見た。特別な場所に飾るね。"
                ];
                reaction = crystalReactions[Math.floor(Math.random() * crystalReactions.length)];
            } else {
                // その他のアイテムに対する汎用反応
                const genericReactions = [
                    "ありがとう、大切にするね。",
                    "こんなものをくれるなんて、嬉しいな。",
                    "これは...面白いものをありがとう。",
                    "ふむ、興味深いものだね。"
                ];
                reaction = genericReactions[Math.floor(Math.random() * genericReactions.length)];
            }
        }
        
        // 対話ポップアップの内容を反応に変更
        const popup = document.getElementById('interaction-popup');
        const title = popup.querySelector('.interaction-title');
        const content = popup.querySelector('.interaction-content');
        
        title.textContent = `${currentObject.name}`;
        content.textContent = reaction;
        
        // アクションボタンを閉じるボタンに変更
        const options = popup.querySelector('.interaction-options');
        options.innerHTML = '';
        
        const closeBtn = document.createElement('button');
        closeBtn.className = 'interaction-option';
        closeBtn.textContent = '閉じる';
        closeBtn.addEventListener('click', hideInteractionPopup);
        options.appendChild(closeBtn);
        
        // ジャーナルに記録
        journal.addEntry({
            type: 'gift',
            title: `${currentObject.name}に${item.name}を渡しました`,
            content: `反応: ${reaction}`,
            timestamp: Date.now()
        });
        
        // コレクションからアイテムを削除
        // 数量が2以上の場合は減らし、1つの場合は削除
        if (item.quantity && item.quantity > 1) {
            // アイテムの数を減らす
            collection.decreaseItemQuantity(itemId);
        } else {
            // アイテムを完全に削除
            collection.removeItem(itemId);
        }
        
        // プレゼント通知表示
        showGiftNotification(item.name, currentObject.name);
        
        // 効果音再生（あれば）
        if (typeof audio !== 'undefined' && audio.playSfx) {
            try {
                audio.playSfx('gift');
            } catch (e) {
                console.log("SFX playback failed:", e);
            }
        }
        
        // 将来的な手紙のきっかけとして記録
        // 一定確率または条件で後に手紙が届く仕組み
    }
    
    // オブジェクトを調べる
    function examineObject() {
        if (!currentObject) return;
        
        // ジャーナルに記録
        journal.addEntry({
            type: 'examine',
            title: `${currentObject.name}を調べました`,
            content: currentObject.description,
            timestamp: Date.now()
        });
        
        // 単に閉じる（すでに説明は表示されている）
        hideInteractionPopup();
    }
    
    // プレゼント通知の表示
    function showGiftNotification(itemName, characterName) {
        // すでに通知がある場合は削除
        const existingNotifications = document.querySelectorAll('.item-gift-notification');
        existingNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
        
        // 新しい通知を作成
        const notification = document.createElement('div');
        notification.className = 'item-gift-notification';
        
        // 通知内容の設定
        notification.innerHTML = `
            <div class="notification-title">${itemName}を${characterName}に渡しました</div>
            <div class="notification-description">コレクションから${itemName}がなくなりました</div>
        `;
        
        document.getElementById('game-container').appendChild(notification);
        
        // 表示アニメーション
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 一定時間後に消去
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    // モジュールの公開API
    return {
        init,
        showInteractionPopup,
        hideInteractionPopup
    };
})();
