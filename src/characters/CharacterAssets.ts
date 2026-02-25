import Phaser from 'phaser';

/**
 * 创建Sonic（索尼克）角色纹理
 * 蓝色刺猬，红色鞋子
 */
export function createSonicTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  
  // 蓝色身体（圆形）
  graphics.fillStyle(0x0080ff, 1);
  graphics.fillCircle(10, 10, 7);
  
  // 刺猬的尖刺（背后的3个尖刺）
  graphics.fillStyle(0x0060dd, 1);
  graphics.fillTriangle(14, 8, 18, 6, 16, 10);
  graphics.fillTriangle(14, 10, 18, 12, 16, 10);
  graphics.fillTriangle(13, 12, 16, 15, 14, 12);
  
  // 肚子（浅色）
  graphics.fillStyle(0xffe4b5, 1);
  graphics.fillCircle(9, 11, 4);
  
  // 大眼睛（白色底）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(7, 8, 5, 4);
  graphics.fillEllipse(11, 8, 5, 4);
  
  // 眼珠（黑色）
  graphics.fillStyle(0x000000, 1);
  graphics.fillCircle(7, 8, 2);
  graphics.fillCircle(11, 8, 2);
  
  // 眼睛高光
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(7.5, 7.5, 1);
  graphics.fillCircle(11.5, 7.5, 1);
  
  // 红色鞋子
  graphics.fillStyle(0xff0000, 1);
  graphics.fillEllipse(6, 16, 3, 2);
  graphics.fillEllipse(12, 16, 3, 2);
  
  // 鞋子白色装饰
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(5, 15, 3, 1);
  graphics.fillRect(11, 15, 3, 1);
  
  graphics.generateTexture('player', 20, 20);
  graphics.destroy();
}

/**
 * 创建Shadow（夏特）角色纹理
 * 黑色刺猬，红色条纹和鞋子
 */
export function createShadowTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  
  // 黑色身体（圆形）
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillCircle(10, 10, 7);
  
  // 刺猬的尖刺（红色条纹）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillTriangle(14, 8, 18, 6, 16, 10);
  graphics.fillTriangle(14, 10, 18, 12, 16, 10);
  graphics.fillTriangle(13, 12, 16, 15, 14, 12);
  
  // 胸部（白色/灰色）
  graphics.fillStyle(0xd0d0d0, 1);
  graphics.fillCircle(9, 11, 4);
  
  // 红色条纹（手臂）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(4, 10, 2, 4);
  graphics.fillRect(14, 10, 2, 4);
  
  // 大眼睛（红色）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(7, 8, 5, 4);
  graphics.fillEllipse(11, 8, 5, 4);
  
  // 眼珠（红色）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillCircle(7, 8, 2);
  graphics.fillCircle(11, 8, 2);
  
  // 眼睛高光
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(7.5, 7.5, 1);
  graphics.fillCircle(11.5, 7.5, 1);
  
  // 黑红色鞋子
  graphics.fillStyle(0x1a1a1a, 1);
  graphics.fillEllipse(6, 16, 3, 2);
  graphics.fillEllipse(12, 16, 3, 2);
  
  // 鞋子红色装饰
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(5, 15, 3, 1);
  graphics.fillRect(11, 15, 3, 1);
  
  graphics.generateTexture('player2', 20, 20);
  graphics.destroy();
}

/**
 * 创建Amy（艾米·罗斯）角色纹理
 * 粉红色刺猬，红色裙子
 */
export function createAmyTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  
  // 粉红色身体（圆形）
  graphics.fillStyle(0xff69b4, 1);
  graphics.fillCircle(10, 10, 7);
  
  // 刺猬的尖刺（粉红色，背后的3个尖刺）
  graphics.fillStyle(0xff1493, 1);
  graphics.fillTriangle(14, 8, 18, 6, 16, 10);
  graphics.fillTriangle(14, 10, 18, 12, 16, 10);
  graphics.fillTriangle(13, 12, 16, 15, 14, 12);
  
  // 额前刺猬毛（特色）
  graphics.fillStyle(0xff1493, 1);
  graphics.fillTriangle(6, 4, 4, 2, 7, 5);
  
  // 肚子（浅粉色）
  graphics.fillStyle(0xffb6c1, 1);
  graphics.fillCircle(9, 11, 4);
  
  // 大眼睛（白色底）
  graphics.fillStyle(0xffffff, 1);
  graphics.fillEllipse(7, 8, 5, 4);
  graphics.fillEllipse(11, 8, 5, 4);
  
  // 眼珠（绿色）
  graphics.fillStyle(0x00ff00, 1);
  graphics.fillCircle(7, 8, 2);
  graphics.fillCircle(11, 8, 2);
  
  // 眼睛高光
  graphics.fillStyle(0xffffff, 1);
  graphics.fillCircle(7.5, 7.5, 1);
  graphics.fillCircle(11.5, 7.5, 1);
  
  // 红色连衣裙（上半部分）
  graphics.fillStyle(0xff0000, 1);
  graphics.fillRect(6, 14, 8, 2);
  
  // 红白色靴子
  graphics.fillStyle(0xff0000, 1);
  graphics.fillEllipse(6, 16, 3, 2);
  graphics.fillEllipse(12, 16, 3, 2);
  
  // 靴子白色装饰
  graphics.fillStyle(0xffffff, 1);
  graphics.fillRect(5, 15, 3, 1);
  graphics.fillRect(11, 15, 3, 1);
  
  graphics.generateTexture('player3', 20, 20);
  graphics.destroy();
}

/**
 * 创建所有角色纹理
 * 在场景的 preload 或 create 阶段调用
 */
export function createAllCharacterTextures(scene: Phaser.Scene): void {
  createSonicTexture(scene);
  createShadowTexture(scene);
  createAmyTexture(scene);
}
