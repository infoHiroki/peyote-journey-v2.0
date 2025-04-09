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
        
        // ポップアップ外クリックで閉じる
        document.addEventListener('click', function(event) {
            if (!popup.classList.contains('hidden')) {
                // イベントの発生元が対話ポップアップ内ではない場合
                if (!popup.contains(event.target) && event.target.id !== 'interaction-popup') {
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
            // ランダムな汎用反応
            const genericReactions = [
                "ありがとう、大切にするね。",
                "こんなものをくれるなんて、嬉しいな。",
                "これは...面白いものをありがとう。",
                "ふむ、興味深いものだね。"
            ];
            reaction = genericReactions[Math.floor(Math.random() * genericReactions.length)];
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
        
        // 効果音再生（あれば）
        // playSoundEffect('gift');
        
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
    
    // モジュールの公開API
    return {
        init,
        showInteractionPopup,
        hideInteractionPopup
    };
})();
