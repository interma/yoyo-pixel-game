/**
 * 无敌护盾系统模块
 * 处理无敌护盾的激活、视觉效果和逻辑
 */

import Phaser from 'phaser';

/**
 * 护盾效果样式
 */
export type ShieldEffectStyle = 'lightning' | 'pulse';

export const ShieldEffectStyles = {
  LIGHTNING: 'lightning' as ShieldEffectStyle,  // 闪电效果（适用于垂直游戏）
  PULSE: 'pulse' as ShieldEffectStyle,          // 脉冲效果（适用于横版游戏）
} as const;

/**
 * 无敌护盾配置
 */
export interface InvincibilityConfig {
  duration?: number;  // 持续时间（毫秒），默认15000
  effectStyle?: ShieldEffectStyle;  // 效果样式
  shieldColor?: number;  // 护盾颜色，默认0x00ffff
  shieldAlpha?: number;  // 护盾透明度，默认0.5
  rotationSpeed?: number;  // 旋转速度，默认0.02
}

/**
 * 护盾实例
 */
export interface ShieldInstance {
  shield: Phaser.GameObjects.Graphics;
  effects?: Phaser.GameObjects.Graphics[];
  cleanup: () => void;
}

/**
 * 创建六边形护盾图形
 */
function createHexagonShield(
  scene: Phaser.Scene,
  x: number,
  y: number,
  config: InvincibilityConfig
): Phaser.GameObjects.Graphics {
  const shield = scene.add.graphics();
  const color = config.shieldColor || 0x00ffff;
  const alpha = config.shieldAlpha || 0.5;
  
  shield.lineStyle(3, color, alpha);
  shield.beginPath();
  
  // 绘制六边形
  const radius = 25;
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const px = x + radius * Math.cos(angle);
    const py = y + radius * Math.sin(angle);
    if (i === 0) {
      shield.moveTo(px, py);
    } else {
      shield.lineTo(px, py);
    }
  }
  shield.closePath();
  shield.strokePath();
  
  shield.fillStyle(color, alpha * 0.3);
  shield.fillCircle(x, y, radius * 0.8);
  
  return shield;
}

/**
 * 创建闪电效果
 */
function createLightningEffects(
  scene: Phaser.Scene,
  x: number,
  y: number
): Phaser.GameObjects.Graphics[] {
  const effects: Phaser.GameObjects.Graphics[] = [];
  
  // 创建4个闪电效果
  for (let i = 0; i < 4; i++) {
    const lightning = scene.add.graphics();
    lightning.lineStyle(2, 0xffff00, 0.8);
    
    const angle = (Math.PI / 2) * i;
    const startX = x + 20 * Math.cos(angle);
    const startY = y + 20 * Math.sin(angle);
    const endX = x + 40 * Math.cos(angle);
    const endY = y + 40 * Math.sin(angle);
    
    lightning.beginPath();
    lightning.moveTo(startX, startY);
    
    // 闪电的锯齿效果
    const segments = 3;
    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      const midX = startX + (endX - startX) * t;
      const midY = startY + (endY - startY) * t;
      const offset = (j % 2 === 0 ? 1 : -1) * 5;
      const perpX = -(endY - startY) / 40 * offset;
      const perpY = (endX - startX) / 40 * offset;
      lightning.lineTo(midX + perpX, midY + perpY);
    }
    
    lightning.strokePath();
    effects.push(lightning);
  }
  
  return effects;
}

/**
 * 激活无敌护盾（带闪电效果）
 */
export function activateInvincibilityWithLightning(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config: InvincibilityConfig = {}
): ShieldInstance {
  const duration = config.duration || 15000;
  const rotationSpeed = config.rotationSpeed || 0.02;
  
  // 创建护盾
  const shield = createHexagonShield(scene, 0, 0, config);
  
  // 创建闪电效果
  const effects = createLightningEffects(scene, 0, 0);
  
  let rotation = 0;
  
  // 更新循环
  const updateHandler = () => {
    rotation += rotationSpeed;
    
    shield.clear();
    shield.lineStyle(3, config.shieldColor || 0x00ffff, config.shieldAlpha || 0.5);
    shield.beginPath();
    
    const radius = 25;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + rotation;
      const px = player.x + radius * Math.cos(angle);
      const py = player.y + radius * Math.sin(angle);
      if (i === 0) {
        shield.moveTo(px, py);
      } else {
        shield.lineTo(px, py);
      }
    }
    shield.closePath();
    shield.strokePath();
    
    shield.fillStyle(config.shieldColor || 0x00ffff, (config.shieldAlpha || 0.5) * 0.3);
    shield.fillCircle(player.x, player.y, radius * 0.8);
    
    // 更新闪电位置
    effects.forEach((lightning, index) => {
      lightning.clear();
      lightning.lineStyle(2, 0xffff00, 0.8);
      
      const angle = (Math.PI / 2) * index + rotation * 2;
      const startX = player.x + 20 * Math.cos(angle);
      const startY = player.y + 20 * Math.sin(angle);
      const endX = player.x + 40 * Math.cos(angle);
      const endY = player.y + 40 * Math.sin(angle);
      
      lightning.beginPath();
      lightning.moveTo(startX, startY);
      
      const segments = 3;
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const midX = startX + (endX - startX) * t;
        const midY = startY + (endY - startY) * t;
        const offset = (j % 2 === 0 ? 1 : -1) * 5;
        const perpX = -(endY - startY) / 40 * offset;
        const perpY = (endX - startX) / 40 * offset;
        lightning.lineTo(midX + perpX, midY + perpY);
      }
      
      lightning.strokePath();
    });
  };
  
  scene.events.on('update', updateHandler);
  
  // 清理函数
  const cleanup = () => {
    scene.events.off('update', updateHandler);
    shield.destroy();
    effects.forEach(e => e.destroy());
  };
  
  // 设置定时器
  scene.time.delayedCall(duration, cleanup);
  
  return {
    shield,
    effects,
    cleanup
  };
}

/**
 * 激活无敌护盾（带脉冲效果）
 */
export function activateInvincibilityWithPulse(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config: InvincibilityConfig = {}
): ShieldInstance {
  const duration = config.duration || 15000;
  const rotationSpeed = config.rotationSpeed || 0.02;
  
  // 创建护盾
  const shield = createHexagonShield(scene, player.x, player.y, config);
  
  let rotation = 0;
  
  // 添加脉冲动画
  scene.tweens.add({
    targets: shield,
    alpha: 0.3,
    duration: 500,
    yoyo: true,
    repeat: -1,
    ease: 'Sine.easeInOut'
  });
  
  // 更新循环
  const updateHandler = () => {
    rotation += rotationSpeed;
    
    shield.clear();
    shield.lineStyle(3, config.shieldColor || 0x00ffff, config.shieldAlpha || 0.5);
    shield.beginPath();
    
    const radius = 25;
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i + rotation;
      const px = player.x + radius * Math.cos(angle);
      const py = player.y + radius * Math.sin(angle);
      if (i === 0) {
        shield.moveTo(px, py);
      } else {
        shield.lineTo(px, py);
      }
    }
    shield.closePath();
    shield.strokePath();
    
    shield.fillStyle(config.shieldColor || 0x00ffff, (config.shieldAlpha || 0.5) * 0.3);
    shield.fillCircle(player.x, player.y, radius * 0.8);
  };
  
  scene.events.on('update', updateHandler);
  
  // 清理函数
  const cleanup = () => {
    scene.events.off('update', updateHandler);
    scene.tweens.killTweensOf(shield);
    shield.destroy();
  };
  
  // 设置定时器
  scene.time.delayedCall(duration, cleanup);
  
  return {
    shield,
    cleanup
  };
}

/**
 * 通用的激活无敌护盾函数
 */
export function activateInvincibility(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config: InvincibilityConfig = {}
): ShieldInstance {
  const style = config.effectStyle || ShieldEffectStyles.LIGHTNING;
  
  if (style === ShieldEffectStyles.LIGHTNING) {
    return activateInvincibilityWithLightning(scene, player, config);
  } else {
    return activateInvincibilityWithPulse(scene, player, config);
  }
}
