#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// world.jsを読み込む
const worldJsPath = path.join(__dirname, 'js', 'world.js');
let content = fs.readFileSync(worldJsPath, 'utf8');

// 構文エラーの修正（余分な閉じ括弧の削除）
// 問題のある部分を正規表現で特定
const errorPattern = /}\s*}\s*\n\s*\/\/ モジュールの公開API/;
const fixedContent = content.replace(errorPattern, '}\n\n    // モジュールの公開API');

// 修正を保存
fs.writeFileSync(worldJsPath, fixedContent);

console.log('world.js修正完了');
