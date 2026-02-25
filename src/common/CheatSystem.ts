/**
 * 秘籍系统模块
 * 处理秘籍输入检测和相关功能
 */

import Phaser from 'phaser';

/**
 * 秘籍码配置
 */
export const CHEAT_CODES = {
  INVINCIBILITY: 'myy1',  // 无敌护盾
};

/**
 * 秘籍输入监听器配置
 */
export interface CheatSystemConfig {
  maxInputLength?: number;  // 最大输入缓冲长度，默认4
  onCheatActivated?: (code: string) => void;  // 秘籍激活回调
}

/**
 * 创建秘籍输入监听器
 * @param scene Phaser场景
 * @param onCheatDetected 检测到秘籍时的回调函数
 * @param config 配置选项
 * @returns 输入缓冲字符串的引用（通过返回对象的getter/setter访问）
 */
export function setupCheatListener(
  scene: Phaser.Scene,
  onCheatDetected: (code: string) => void,
  config: CheatSystemConfig = {}
): { 
  getInput: () => string;
  setInput: (value: string) => void;
  cleanup: () => void;
} {
  const maxLength = config.maxInputLength || 4;
  let cheatInput = '';
  
  const keydownHandler = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    
    // 只接受字母和数字
    if ((key >= 'a' && key <= 'z') || (key >= '0' && key <= '9')) {
      cheatInput += key;
      
      // 保持缓冲区在最大长度
      if (cheatInput.length > maxLength) {
        cheatInput = cheatInput.slice(-maxLength);
      }
      
      // 检查是否匹配任何秘籍码
      if (cheatInput === CHEAT_CODES.INVINCIBILITY) {
        onCheatDetected(CHEAT_CODES.INVINCIBILITY);
        if (config.onCheatActivated) {
          config.onCheatActivated(CHEAT_CODES.INVINCIBILITY);
        }
      }
    }
  };
  
  scene.input.keyboard!.on('keydown', keydownHandler);
  
  return {
    getInput: () => cheatInput,
    setInput: (value: string) => { cheatInput = value; },
    cleanup: () => {
      scene.input.keyboard!.off('keydown', keydownHandler);
    }
  };
}

/**
 * 飞行控制配置
 */
export interface FlyingControlConfig {
  key?: string;  // 飞行按键，默认'F'
  velocityY?: number;  // 向上速度，默认-300
}

/**
 * 处理角色飞行控制
 * @param scene Phaser场景
 * @param player 玩家精灵
 * @param config 配置选项
 */
export function handleFlyingControl(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config: FlyingControlConfig = {}
): void {
  const keyCode = config.key || 'F';
  const velocity = config.velocityY || -300;
  
  const fKey = scene.input.keyboard!.addKey(keyCode);
  
  scene.events.on('update', () => {
    if (fKey.isDown) {
      player.setVelocityY(velocity);
    }
  });
}
