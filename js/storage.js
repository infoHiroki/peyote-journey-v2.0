/**
 * ペヨーテの旅路 - ストレージスクリプト
 * LocalStorageを使用したデータ保存を管理
 */

// ストレージモジュール
const storage = (function() {
    // 定数
    const GAME_DATA_KEY = 'peyoteJourney_gameData';
    const SETTINGS_KEY = 'peyoteJourney_settings';
    const CUSTOM_BG_KEY = 'peyoteJourney_customBackground';
    
    // LocalStorageが利用可能かチェック
    function isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }
    
    // ゲームデータの保存
    function saveGameData(data) {
        if (!isAvailable()) return false;
        
        try {
            // 大きなデータ（画像など）を除外
            const serializableData = {
                ...data,
                // カスタム背景や大きな画像データは別途処理
            };
            
            localStorage.setItem(GAME_DATA_KEY, JSON.stringify(serializableData));
            return true;
        } catch (e) {
            console.error('Failed to save game data:', e);
            return false;
        }
    }
    
    // ゲームデータの読み込み
    function loadGameData() {
        if (!isAvailable()) return null;
        
        try {
            const data = localStorage.getItem(GAME_DATA_KEY);
            if (!data) return null;
            
            const parsedData = JSON.parse(data);
            
            // データの整合性チェック
            if (!validateGameData(parsedData)) {
                console.warn('保存データの形式が正しくないため、新しいゲームを開始します。');
                return null;
            }
            
            return parsedData;
        } catch (e) {
            console.error('Failed to load game data:', e);
            return null;
        }
    }
    
    // ゲームデータの整合性検証
    function validateGameData(data) {
        // 必須フィールドの存在確認
        if (!data || typeof data !== 'object') return false;
        
        // タイムスタンプのチェック
        if (!data.timestamp || typeof data.timestamp !== 'number') return false;
        
        // 少なくともjournal、collectionのどちらかが存在するか
        if (!data.journal && !data.collection) return false;
        
        return true;
    }
    
    // ゲームデータの存在確認
    function hasGameData() {
        if (!isAvailable()) return false;
        return localStorage.getItem(GAME_DATA_KEY) !== null;
    }
    
    // ゲームデータの削除
    function clearGameData() {
        if (!isAvailable()) return false;
        
        try {
            localStorage.removeItem(GAME_DATA_KEY);
            return true;
        } catch (e) {
            console.error('Failed to clear game data:', e);
            return false;
        }
    }
    
    // 設定の保存
    function saveSettings(settings) {
        if (!isAvailable()) return false;
        
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (e) {
            console.error('Failed to save settings:', e);
            return false;
        }
    }
    
    // 設定の読み込み
    function loadSettings() {
        if (!isAvailable()) return null;
        
        try {
            const settings = localStorage.getItem(SETTINGS_KEY);
            return settings ? JSON.parse(settings) : null;
        } catch (e) {
            console.error('Failed to load settings:', e);
            return null;
        }
    }
    
    // カスタム背景の保存
    function saveCustomBackground(dataUrl) {
        if (!isAvailable()) return false;
        
        try {
            localStorage.setItem(CUSTOM_BG_KEY, dataUrl);
            return true;
        } catch (e) {
            console.error('Failed to save custom background:', e);
            
            // データが大きすぎる場合は警告
            if (e.code === 22 || e.name === 'QuotaExceededError') {
                alert('背景画像が大きすぎます。より小さな画像を選択してください。');
            }
            
            return false;
        }
    }
    
    // カスタム背景の読み込み
    function loadCustomBackground() {
        if (!isAvailable()) return null;
        
        try {
            return localStorage.getItem(CUSTOM_BG_KEY);
        } catch (e) {
            console.error('Failed to load custom background:', e);
            return null;
        }
    }
    
    // カスタム背景の存在確認
    function hasCustomBackground() {
        if (!isAvailable()) return false;
        return localStorage.getItem(CUSTOM_BG_KEY) !== null;
    }
    
    // カスタム背景の削除
    function clearCustomBackground() {
        if (!isAvailable()) return false;
        
        try {
            localStorage.removeItem(CUSTOM_BG_KEY);
            return true;
        } catch (e) {
            console.error('Failed to clear custom background:', e);
            return false;
        }
    }
    
    // 全データの削除（リセット）
    function clearAllData() {
        if (!isAvailable()) return false;
        
        try {
            localStorage.removeItem(GAME_DATA_KEY);
            localStorage.removeItem(SETTINGS_KEY);
            localStorage.removeItem(CUSTOM_BG_KEY);
            return true;
        } catch (e) {
            console.error('Failed to clear all data:', e);
            return false;
        }
    }
    
    // ストレージ使用量の取得（バイト数）
    function getStorageUsage() {
        if (!isAvailable()) return 0;
        
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key.startsWith('peyoteJourney_')) {
                const value = localStorage.getItem(key);
                total += key.length + value.length;
            }
        }
        
        return total * 2; // UTF-16エンコーディングなので1文字2バイト
    }
    
    // 残り容量の確認
    function checkStorageSpace() {
        if (!isAvailable()) return false;
        
        // 試験的に徐々に大きなデータを保存してみる
        try {
            const testKey = '__storage_space_test__';
            let testString = '';
            let size = 0;
            
            // 1MBずつ増やして保存テスト
            while (size < 5 * 1024 * 1024) { // 最大5MBまでチェック
                testString += new Array(1024 * 1024).join('a');
                localStorage.setItem(testKey, testString);
                size += 1024 * 1024;
            }
            
            localStorage.removeItem(testKey);
            return size; // 保存できた最大サイズ
        } catch (e) {
            // エラーが発生した場合、その時点のサイズが上限
            const testKey = '__storage_space_test__';
            localStorage.removeItem(testKey);
            return false;
        }
    }
    
    // モジュールの公開API
    return {
        isAvailable,
        saveGameData,
        loadGameData,
        hasGameData,
        clearGameData,
        saveSettings,
        loadSettings,
        saveCustomBackground,
        loadCustomBackground,
        hasCustomBackground,
        clearCustomBackground,
        clearAllData,
        getStorageUsage,
        checkStorageSpace
    };
})();
