/**
 * ペヨーテの旅路 - コレクションスクリプト
 * アイテムコレクションを管理
 */

// コレクションモジュール
const collection = (function() {
    // プライベート変数
    let items = []; // 収集したアイテム
    let selectedItemId = null; // 選択中のアイテムID
    
    // 初期化
    function init() {
        // コレクション画面の初期化
        const collectionScreen = document.getElementById('collection-screen');
        const closeButton = collectionScreen.querySelector('.close-button');
        
        // 閉じるボタンのイベントリスナー
        closeButton.addEventListener('click', function() {
            collectionScreen.classList.add('hidden');
        });
        
        // コレクション内容の表示
        updateCollectionDisplay();
    }
    
    // アイテムの追加
    function addItem(item) {
        // アイテムが有効かチェック
        if (!item || !item.id || !item.name) return false;
        
        // アイテムタイプの決定（優先順位：itemType > image > 名前）
        let itemType = item.itemType || '';
        
        // itemTypeがない場合は画像から推測
        if (!itemType && item.image) {
            const imageParts = item.image.split('_');
            if (imageParts.length >= 2) {
                itemType = imageParts[1]; // 例：item_flower -> flower
            }
        }
        
        // 画像からも判断できない場合は名前を使う
        if (!itemType && item.name) {
            if (item.name.includes('花') || item.name.includes('ひまわり')) {
                itemType = 'flower';
            } else if (item.name.includes('石')) {
                itemType = 'stone';
            } else if (item.name.includes('結晶')) {
                itemType = 'crystal';
            }
        }
        
        // 同じタイプのアイテムを探す
        let existingItem = null;
        
        if (itemType) {
            // まず、itemTypeが一致するものを探す（最も正確）
            existingItem = items.find(i => i.itemType === itemType);
            
            // itemTypeが一致しない場合は画像名を確認
            if (!existingItem) {
                existingItem = items.find(i => {
                    // 画像IDに同じタイプが含まれるか
                    return i.image && i.image.includes(itemType);
                });
            }
            
            // それでも見つからない場合は名前の類似性で判断
            if (!existingItem) {
                existingItem = items.find(i => {
                    // 名前が似ているか
                    return i.name === item.name || 
                        (i.name.includes(item.name) || item.name.includes(i.name));
                });
            }
        }
        
        if (!existingItem) {
            // 上記の方法で見つからなければ従来の完全一致IDで検索
            existingItem = items.find(i => i.id === item.id);
        }
        
        if (existingItem) {
            // 既に持っている場合は数量を増やす
            if (existingItem.quantity) {
                existingItem.quantity++;
            } else {
                existingItem.quantity = 2;
            }
            console.log(`${existingItem.name}の数を増やしました。現在の数量: ${existingItem.quantity}`);
        } else {
            // 新しいアイテムを追加
            const newItem = {
                ...item,
                acquired: Date.now(),
                itemType: itemType || 'unknown' // アイテムタイプも保存
            };
            
            items.push(newItem);
            console.log(`新しいアイテム『${item.name}』を追加しました`);
        }
        
        // コレクション表示を更新
        updateCollectionDisplay();
        return true;
    }
    
    // コレクション画面の更新
    function updateCollectionDisplay() {
        const collectionGrid = document.querySelector('.collection-grid');
        if (!collectionGrid) return;
        
        // コンテンツをクリア
        collectionGrid.innerHTML = '';
        
        // アイテムがない場合
        if (items.length === 0) {
            collectionGrid.innerHTML = '<p class="empty-collection">まだ何も持っていません。</p>';
            return;
        }
        
        // 各アイテムをHTMLに変換
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'collection-item';
            itemElement.setAttribute('data-item-id', item.id);
            
            // 選択中のアイテムはハイライト
            if (item.id === selectedItemId) {
                itemElement.classList.add('selected');
            }
            
            // アイテム画像がある場合
            if (item.image && world.assets[item.image]) {
                const img = document.createElement('img');
                img.src = world.assets[item.image].src;
                img.alt = item.name;
                itemElement.appendChild(img);
            } else {
                // 画像がない場合はテキスト表示
                itemElement.textContent = item.name.substring(0, 2); // 頭文字
            }
            
            // 数量表示（2以上の場合）
            if (item.quantity && item.quantity > 1) {
                const quantityBadge = document.createElement('span');
                quantityBadge.className = 'item-quantity';
                quantityBadge.textContent = item.quantity;
                itemElement.appendChild(quantityBadge);
            }
            
            // アイテムクリック時の詳細表示
            itemElement.addEventListener('click', function() {
                showItemDetails(item.id);
            });
            
            collectionGrid.appendChild(itemElement);
        });
    }
    
    // アイテム詳細の表示
    function showItemDetails(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        
        selectedItemId = itemId;
        
        // 詳細ポップアップの作成（存在しなければ）
        let detailsPopup = document.getElementById('item-details-popup');
        if (!detailsPopup) {
            detailsPopup = document.createElement('div');
            detailsPopup.id = 'item-details-popup';
            detailsPopup.className = 'popup';
            document.getElementById('game-container').appendChild(detailsPopup);
        }
        
        // 取得日の表示
        const acquiredDate = new Date(item.acquired);
        const dateStr = `${acquiredDate.getFullYear()}/${(acquiredDate.getMonth() + 1).toString().padStart(2, '0')}/${acquiredDate.getDate().toString().padStart(2, '0')}`;
        
        // HTML構造
        detailsPopup.innerHTML = `
            <div class="popup-header">
                <h3>${item.name}</h3>
                <span class="close-button">×</span>
            </div>
            <div class="popup-content">
                <div class="item-image">
                    ${item.image && world.assets[item.image] ? 
                      `<img src="${world.assets[item.image].src}" alt="${item.name}">` : 
                      `<div class="placeholder-image">${item.name.substring(0, 1)}</div>`}
                </div>
                <div class="item-info">
                    <p class="item-description">${item.description || 'No description available.'}</p>
                    <p class="item-acquired">取得日: ${dateStr}</p>
                    ${item.quantity ? `<p class="item-quantity">数量: ${item.quantity}</p>` : ''}
                </div>
            </div>
            <div class="popup-footer">
                <button class="action-button use-button" ${item.canUse ? '' : 'disabled'}>使う</button>
                <button class="action-button drop-button">捨てる</button>
            </div>
        `;
        
        // ポップアップを表示
        detailsPopup.classList.add('active');
        
        // 閉じるボタンのイベントリスナー
        const closeButton = detailsPopup.querySelector('.close-button');
        closeButton.addEventListener('click', function() {
            detailsPopup.classList.remove('active');
            selectedItemId = null;
            updateCollectionDisplay();
        });
        
        // 「使う」ボタンのイベントリスナー
        const useButton = detailsPopup.querySelector('.use-button');
        if (useButton) {
            useButton.addEventListener('click', function() {
                useItem(itemId);
                detailsPopup.classList.remove('active');
            });
        }
        
        // 「捨てる」ボタンのイベントリスナー
        const dropButton = detailsPopup.querySelector('.drop-button');
        if (dropButton) {
            dropButton.addEventListener('click', function() {
                if (confirm(`${item.name}を捨てますか？`)) {
                    removeItem(itemId);
                    detailsPopup.classList.remove('active');
                }
            });
        }
        
        // コレクションの表示を更新
        updateCollectionDisplay();
    }
    
    // アイテムの使用
    function useItem(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) return;
        
        // アイテム使用のロジック（必要に応じて実装）
        
        // 消費アイテムであれば数量を減らす
        if (item.consumable) {
            if (item.quantity && item.quantity > 1) {
                item.quantity--;
            } else {
                removeItem(itemId);
            }
        }
        
        // コレクション表示を更新
        updateCollectionDisplay();
    }
    
    // アイテムの削除
    function removeItem(itemId) {
        const index = items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            items.splice(index, 1);
            
            // 選択中のアイテムだった場合はクリア
            if (selectedItemId === itemId) {
                selectedItemId = null;
            }
            
            // コレクション表示を更新
            updateCollectionDisplay();
            return true;
        }
        return false;
    }
    
    // コレクション画面の表示
    function showCollection() {
        const collectionScreen = document.getElementById('collection-screen');
        collectionScreen.classList.remove('hidden');
        
        // 内容を最新に更新
        updateCollectionDisplay();
    }
    
    // コレクション画面を閉じる
    function hideCollection() {
        const collectionScreen = document.getElementById('collection-screen');
        collectionScreen.classList.add('hidden');
    }
    
    // アイテム所持チェック
    function hasItem(itemId) {
        return items.some(i => i.id === itemId);
    }
    
    // アイテムリストの取得
    function getItems() {
        return [...items]; // コピーを返す
    }
    
    // IDによるアイテム取得
    function getItemById(itemId) {
        return items.find(i => i.id === itemId);
    }
    
    // アイテム所持チェック
    function hasItems() {
        return items.length > 0;
    }
    
    // 全アイテムのクリア
    function clearAllItems() {
        items = [];
        selectedItemId = null;
        updateCollectionDisplay();
    }
    
    // ステート保存
    function saveState() {
        return {
            items
        };
    }
    
    // ステート読み込み
    function loadState(state) {
        if (state && state.items) {
            items = state.items;
            updateCollectionDisplay();
        }
    }
    
    // アイテム数量を減らす
    function decreaseItemQuantity(itemId) {
        const item = items.find(i => i.id === itemId);
        if (!item) return false;
        
        // 数量がある場合は減らす
        if (item.quantity && item.quantity > 1) {
            item.quantity--;
            console.log(`${item.name}の数量が減りました。残り: ${item.quantity}`);
            updateCollectionDisplay();
            return true;
        } else {
            // 数量が1以下の場合は削除
            return removeItem(itemId);
        }
    }
    
    // モジュールの公開API
    return {
        init,
        addItem,
        removeItem,
        decreaseItemQuantity,
        showCollection,
        hideCollection,
        hasItem,
        getItems,
        getItemById,
        hasItems,
        clearAllItems,
        saveState,
        loadState
    };
})();
