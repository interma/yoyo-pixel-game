/**
 * 游戏通用资源创建模块
 * 包含可在多个场景中复用的纹理和资源创建函数
 */

import Phaser from 'phaser';

/**
 * 创建蘑菇怪敌人纹理
 */
export function createMushroomEnemyTexture(scene: Phaser.Scene): void {
  const enemyGraphics = scene.add.graphics();
  // 蘑菇帽
  enemyGraphics.fillStyle(0xff0000, 1);
  enemyGraphics.fillCircle(12, 8, 10);
  enemyGraphics.fillStyle(0xffffff, 1);
  enemyGraphics.fillCircle(8, 6, 3);
  enemyGraphics.fillCircle(16, 6, 3);
  // 蘑菇身体
  enemyGraphics.fillStyle(0xffe4b5, 1);
  enemyGraphics.fillRect(8, 12, 8, 8);
  // 眼睛
  enemyGraphics.fillStyle(0x000000, 1);
  enemyGraphics.fillRect(9, 14, 2, 2);
  enemyGraphics.fillRect(13, 14, 2, 2);
  enemyGraphics.generateTexture('enemy', 24, 24);
  enemyGraphics.destroy();
}

/**
 * 创建火龙敌人纹理
 */
export function createFireDragonTexture(scene: Phaser.Scene): void {
  const fireEnemyGraphics = scene.add.graphics();
  // 龙头（橙红色）
  fireEnemyGraphics.fillStyle(0xff4500, 1);
  fireEnemyGraphics.fillEllipse(12, 10, 14, 12);
  // 龙角
  fireEnemyGraphics.fillStyle(0x8b0000, 1);
  fireEnemyGraphics.fillTriangle(6, 8, 4, 4, 8, 6);
  fireEnemyGraphics.fillTriangle(18, 8, 20, 4, 16, 6);
  // 眼睛（黄色发光）
  fireEnemyGraphics.fillStyle(0xffff00, 1);
  fireEnemyGraphics.fillCircle(8, 9, 3);
  fireEnemyGraphics.fillCircle(16, 9, 3);
  fireEnemyGraphics.fillStyle(0xff0000, 1);
  fireEnemyGraphics.fillCircle(8, 9, 1);
  fireEnemyGraphics.fillCircle(16, 9, 1);
  // 鼻孔（喷火口）
  fireEnemyGraphics.fillStyle(0x000000, 1);
  fireEnemyGraphics.fillCircle(9, 13, 2);
  fireEnemyGraphics.fillCircle(15, 13, 2);
  // 翅膀
  fireEnemyGraphics.fillStyle(0xdc143c, 1);
  fireEnemyGraphics.fillTriangle(2, 10, 0, 6, 4, 12);
  fireEnemyGraphics.fillTriangle(22, 10, 24, 6, 20, 12);
  fireEnemyGraphics.generateTexture('fireEnemy', 24, 20);
  fireEnemyGraphics.destroy();
}

/**
 * 创建火球纹理
 */
export function createFireballTexture(scene: Phaser.Scene): void {
  const fireballGraphics = scene.add.graphics();
  // 火球核心
  fireballGraphics.fillStyle(0xffff00, 1);
  fireballGraphics.fillCircle(6, 6, 4);
  fireballGraphics.fillStyle(0xff4500, 1);
  fireballGraphics.fillCircle(6, 6, 5);
  fireballGraphics.fillStyle(0xff0000, 1);
  fireballGraphics.fillCircle(6, 6, 3);
  fireballGraphics.generateTexture('fireball', 12, 12);
  fireballGraphics.destroy();
}

/**
 * 创建所有敌人相关的纹理
 */
export function createEnemyTextures(scene: Phaser.Scene): void {
  createMushroomEnemyTexture(scene);
  createFireDragonTexture(scene);
  createFireballTexture(scene);
}

/**
 * 创建金币纹理
 */
export function createCoinTexture(scene: Phaser.Scene): void {
  const coinGraphics = scene.add.graphics();
  coinGraphics.fillStyle(0xffff00, 1);
  coinGraphics.fillCircle(8, 8, 8);
  coinGraphics.fillStyle(0xffa500, 1);
  coinGraphics.fillCircle(8, 8, 4);
  coinGraphics.generateTexture('coin', 16, 16);
  coinGraphics.destroy();
}
