/**
 * ペヨーテの旅路 - ジャーナルスクリプト
 * 旅の記録を管理
 */

// ジャーナルモジュール
const journal = (function() {
    // プライベート変数
    let entries = []; // ジャーナルエントリー
    
    // 初期化
    function init() {
        // ジャーナル画面の初期化
        const journalScreen = document.getElementById('journal-screen');
        const closeButton = journalScreen.querySelector('.close-button');
        
        // 閉じるボタンのイベントリスナー
        closeButton.addEventListener('click', function() {
            journalScreen.classList.add('hidden');
        });
        
        // 初期エントリーがない場合は最初のエントリーを追加
        if (entries.length === 0) {
            entries.push({
                type: 'system',
                title: 'ペヨーテの旅の始まり',
                content: '今日から旅が始まります。出会いと発見の旅路を記録していきましょう。',
                timestamp: Date.now()
            });
        }
        
        // ジャーナル内容の表示
        updateJournalDisplay();
    }
    
    // エントリーの追加
    function addEntry(entry) {
        // エントリーが有効かチェック
        if (!entry || !entry.title || !entry.content) return;
        
        // タイムスタンプがない場合は現在時刻を設定
        if (!entry.timestamp) {
            entry.timestamp = Date.now();
        }
        
        // エントリーを追加
        entries.unshift(entry); // 新しいエントリーを先頭に追加
        
        // ジャーナル内容の更新
        updateJournalDisplay();
    }
    
    // ジャーナル画面の更新
    function updateJournalDisplay() {
        const journalContent = document.querySelector('.journal-content');
        if (!journalContent) return;
        
        // コンテンツをクリア
        journalContent.innerHTML = '';
        
        // エントリーがない場合
        if (entries.length === 0) {
            journalContent.innerHTML = '<p class="empty-journal">まだ記録はありません。</p>';
            return;
        }
        
        // 各エントリーをHTMLに変換
        entries.forEach(entry => {
            const entryElement = document.createElement('div');
            entryElement.className = `journal-entry ${entry.type}`;
            
            // 日付フォーマット
            const date = new Date(entry.timestamp);
            const dateStr = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            
            // エントリータイプに応じたアイコン
            let typeIcon = '';
            switch (entry.type) {
                case 'item':
                    typeIcon = '🔍';
                    break;
                case 'conversation':
                    typeIcon = '💬';
                    break;
                case 'gift':
                    typeIcon = '🎁';
                    break;
                case 'examine':
                    typeIcon = '🔍';
                    break;
                case 'system':
                    typeIcon = '📝';
                    break;
                case 'letter':
                    typeIcon = '✉️';
                    break;
                default:
                    typeIcon = '📌';
            }
            
            // HTML構造
            entryElement.innerHTML = `
                <div class="entry-header">
                    <span class="entry-icon">${typeIcon}</span>
                    <h3 class="entry-title">${entry.title}</h3>
                    <span class="entry-date">${dateStr}</span>
                </div>
                <div class="entry-body">
                    <p>${entry.content}</p>
                </div>
            `;
            
            journalContent.appendChild(entryElement);
        });
    }
    
    // ジャーナル画面の表示
    function showJournal() {
        const journalScreen = document.getElementById('journal-screen');
        journalScreen.classList.remove('hidden');
        
        // 内容を最新に更新
        updateJournalDisplay();
    }
    
    // ジャーナル画面を閉じる
    function hideJournal() {
        const journalScreen = document.getElementById('journal-screen');
        journalScreen.classList.add('hidden');
    }
    
    // エントリーの取得
    function getEntries() {
        return [...entries]; // コピーを返す
    }
    
    // エントリーの検索
    function searchEntries(term) {
        if (!term) return [];
        
        const lowerTerm = term.toLowerCase();
        return entries.filter(entry => 
            entry.title.toLowerCase().includes(lowerTerm) ||
            entry.content.toLowerCase().includes(lowerTerm)
        );
    }
    
    // エントリーの削除
    function removeEntry(timestamp) {
        const index = entries.findIndex(entry => entry.timestamp === timestamp);
        if (index !== -1) {
            entries.splice(index, 1);
            updateJournalDisplay();
            return true;
        }
        return false;
    }
    
    // 全エントリーのクリア
    function clearAllEntries() {
        entries = [];
        updateJournalDisplay();
    }
    
    // ステート保存
    function saveState() {
        return {
            entries
        };
    }
    
    // ステート読み込み
    function loadState(state) {
        if (state && state.entries) {
            entries = state.entries;
            updateJournalDisplay();
        }
    }
    
    // モジュールの公開API
    return {
        init,
        addEntry,
        showJournal,
        hideJournal,
        getEntries,
        searchEntries,
        removeEntry,
        clearAllEntries,
        saveState,
        loadState
    };
})();
