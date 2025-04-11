#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// world.jsを読み込む
const worldJsPath = path.join(__dirname, 'js', 'world.js');
let content = fs.readFileSync(worldJsPath, 'utf8');

// drawMinimap関数内のcharacter参照も修正
let fixedContent = content.replace(
    /const playerPos = character\.getPosition\(\);\s+const playerX = x \+ playerPos\.x \* scaleX;\s+const playerY = y \+ playerPos\.y \* scaleY;/,
    `// キャラクターが定義されているか確認
if (typeof character !== 'undefined' && character.getPosition) {
            const playerPos = character.getPosition();
            const playerX = x + playerPos.x * scaleX;
            const playerY = y + playerPos.y * scaleY;`
);

// 対応する描画部分も条件付きに
fixedContent = fixedContent.replace(
    /ctx\.fillStyle = 'rgba\(255, 0, 0, 0\.8\)';\s+ctx\.beginPath\(\);\s+ctx\.arc\(playerX, playerY, 4, 0, Math\.PI \* 2\);\s+ctx\.fill\(\);/,
    `ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
        ctx.fill();
        } else {
            // キャラクターが利用できない場合はスキップ
            console.log('Character not available for minimap');
        }`
);

// showFullMap関数内のcharacter参照も修正
fixedContent = fixedContent.replace(
    /\/\/ プレイヤー位置\s+const playerPos = character\.getPosition\(\);\s+const playerX = offsetX \+ playerPos\.x \* scale;\s+const playerY = offsetY \+ playerPos\.y \* scale;/,
    `// プレイヤー位置（キャラクターが利用可能な場合）
        if (typeof character !== 'undefined' && character.getPosition) {
            const playerPos = character.getPosition();
            const playerX = offsetX + playerPos.x * scale;
            const playerY = offsetY + playerPos.y * scale;`
);

// 対応する描画部分も条件付きに
fixedContent = fixedContent.replace(
    /mapCtx\.fillStyle = '#e53935';\s+mapCtx\.beginPath\(\);\s+mapCtx\.arc\(playerX, playerY, 7, 0, Math\.PI \* 2\);\s+mapCtx\.fill\(\);/,
    `mapCtx.fillStyle = '#e53935';
            mapCtx.beginPath();
            mapCtx.arc(playerX, playerY, 7, 0, Math.PI * 2);
            mapCtx.fill();
        } else {
            // キャラクターが利用できない場合はスキップ
            console.log('Character not available for map');
        }`
);

// 修正を保存
fs.writeFileSync(worldJsPath, fixedContent);

console.log('world.js マップ描画部分修正完了');
