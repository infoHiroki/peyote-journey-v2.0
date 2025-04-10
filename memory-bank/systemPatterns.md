# System Patterns

## 全体構成
- **index.html**  
  アプリのエントリポイント。HTML構造と主要なUI要素を定義。

- **css/styles.css**  
  全体のスタイルを管理。レスポンシブ対応。

- **js/**  
  機能ごとに分割されたJavaScriptモジュール群。

## 主なモジュールと責務
- **js/main.js**  
  アプリの初期化、イベントリスナー設定、全体の制御。

- **js/audio.js**  
  音楽の再生・停止・切り替え管理。

- **js/character.js**  
  キャラクターの表示・切り替え。

- **js/collection.js**  
  ユーザーの収集物や進行状況の管理。

- **js/interaction.js**  
  ユーザーの操作やインタラクションの処理。

- **js/journal.js**  
  ユーザーの記録やメモの管理。

- **js/storage.js**  
  ローカルストレージを用いたデータ保存・取得。

- **js/ui.js**  
  UIの表示・更新・操作。

- **js/world.js**  
  ワールド背景やカバー画像の管理。

## 設計パターン・技術方針
- **モジュール分割**  
  関心ごとにJSファイルを分離し、責務を明確化。

- **イベント駆動**  
  ユーザー操作に応じてイベントを発火し、各モジュールが連携。

- **状態管理**  
  ローカルストレージを用いてユーザーデータを永続化。

- **拡張性重視**  
  新しいキャラクターや音楽、物語の追加が容易な構造。

- **クライアントサイド完結**  
  サーバー連携なしで完結するシングルページアプリ。

## コンポーネント間の関係
- `main.js`が全体の制御ハブ  
- `audio.js`や`character.js`は`ui.js`と連携し表示を更新  
- `storage.js`は他モジュールのデータ保存・取得を担当  
- `interaction.js`はユーザー操作を検知し、必要なモジュールに通知
