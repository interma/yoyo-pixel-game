# 通用游戏模块

这个目录包含可在多个游戏场景中复用的通用功能模块。

## 📦 模块列表

### 1. UIConfig.ts - UI配置系统 🆕

集中管理游戏UI的字体、颜色、边距等样式配置，确保整个游戏的视觉风格统一。

**主要配置：**

```typescript
// 字体配置
FONTS.PRIMARY     // 主字体（等宽+中文字体栈）
FONTS.SECONDARY   // 备用字体

// 文字边距
TEXT_PADDING.STANDARD  // 标准边距 (10, 10, 5, 5)
TEXT_PADDING.COMPACT   // 紧凑边距 (8, 8, 4, 4)
TEXT_PADDING.RELAXED   // 宽松边距 (12, 12, 6, 6)
TEXT_PADDING.NONE      // 无边距

// 文字描边
TEXT_STROKE.STANDARD   // 标准描边 (4px)
TEXT_STROKE.THICK      // 粗描边 (6px)
TEXT_STROKE.THIN       // 细描边 (2px)

// 颜色
COLORS.PRIMARY         // 主色调 (#ffffff)
COLORS.SUCCESS         // 成功 (#00ff00)
COLORS.ERROR           // 错误 (#ff0000)
COLORS.INFO            // 信息 (#00d4ff)

// 文字样式预设
TEXT_STYLES.TITLE_LARGE   // 大标题 (48px)
TEXT_STYLES.TITLE_MEDIUM  // 中标题 (36px)
TEXT_STYLES.TITLE_SMALL   // 小标题 (28px)
TEXT_STYLES.SUBTITLE      // 副标题 (24px)
TEXT_STYLES.BODY          // 正文 (20px)
TEXT_STYLES.SMALL         // 小字 (16px)
TEXT_STYLES.HUD           // HUD文本 (24px)
TEXT_STYLES.LINK          // 链接 (16px)
```

**使用示例：**

```typescript
import { TEXT_STYLES, COLORS } from '../common/UIConfig';

class MyScene extends Phaser.Scene {
  create() {
    // 使用预设样式
    this.add.text(400, 100, 'Game Title', TEXT_STYLES.TITLE_LARGE)
      .setOrigin(0.5);
    
    // 自定义颜色
    this.add.text(400, 200, 'Start Game', {
      ...TEXT_STYLES.BODY,
      color: COLORS.SUCCESS
    }).setOrigin(0.5);
    
    // HUD文本
    this.scoreText = this.add.text(16, 16, 'Score: 0', TEXT_STYLES.HUD);
  }
}
```

---

### 2. SoundSystem.ts - 音效系统

使用 Web Audio API 程序化生成复古风格音效和背景音乐。

**主要类：**

```typescript
class SoundManager {
  // 音效播放
  playJump(): void              // 跳跃音效
  playCoin(): void              // 收集金币音效
  playHit(): void               // 敌人碰撞音效
  playVictory(): void           // 游戏胜利音效
  playGameOver(): void          // 游戏失败音效
  playEnemyDefeat(): void       // 击败敌人音效
  playPowerUp(): void           // 护盾激活音效
  
  // 背景音乐
  playBackgroundMusicHappy(): void   // 欢快风格BGM（金币追逐）
  playBackgroundMusicTense(): void   // 紧张风格BGM（古堡逃亡）
  stopBackgroundMusic(): void        // 停止背景音乐
  
  // 音量控制
  setMasterVolume(volume: number): void  // 设置主音量 (0-1)
  setMusicVolume(volume: number): void   // 设置音乐音量 (0-1)
  setSfxVolume(volume: number): void     // 设置音效音量 (0-1)
  toggleMute(): void                     // 静音/取消静音
  
  // 资源管理
  destroy(): void                        // 清理资源
}

// 获取全局音效管理器单例
getSoundManager(): SoundManager
```

**使用示例：**

```typescript
import { getSoundManager } from '../common/SoundSystem';

class MyScene extends Phaser.Scene {
  create() {
    // 初始化音效管理器并播放背景音乐
    const soundManager = getSoundManager();
    soundManager.playBackgroundMusicHappy();
  }
  
  update() {
    // 在跳跃时播放音效
    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
      getSoundManager().playJump();
    }
  }
  
  collectCoin(player: any, coin: any) {
    coin.disableBody(true, true);
    this.score += 10;
    getSoundManager().playCoin();  // 收集金币音效
  }
  
  hitEnemy(player: any, enemy: any) {
    if (this.isInvincible) {
      enemy.disableBody(true, true);
      getSoundManager().playEnemyDefeat();
    } else {
      getSoundManager().playHit();
      this.loseLife();
    }
  }
  
  showVictory() {
    this.gameWon = true;
    getSoundManager().stopBackgroundMusic();
    getSoundManager().playVictory();
  }
}
```

**音量控制示例：**

```typescript
const soundManager = getSoundManager();

// 设置不同的音量级别
soundManager.setMasterVolume(0.5);   // 50% 总音量
soundManager.setMusicVolume(0.3);    // 30% 音乐音量
soundManager.setSfxVolume(0.7);      // 70% 音效音量

// 静音/取消静音
soundManager.toggleMute();
```

**音效特点：**
- ✅ **零依赖**：完全程序化生成，无需外部音频文件
- 🎵 **复古风格**：8位/16位游戏风格的音效
- 🔊 **独立音量**：背景音乐和音效独立控制
- 🎮 **自动平衡**：预设合理的音量默认值
- 🌐 **兼容性强**：基于 Web Audio API，现代浏览器全支持

---

### 2. TouchControls.ts - 移动端触摸控制

为移动设备提供虚拟摇杆和按钮控制。

**主要类和函数：**

```typescript
// 触摸控制器类
class TouchControls {
  createJoystick(config: VirtualJoystickConfig): void
  createButton(config: VirtualButtonConfig): void
  isButtonPressed(key: string): boolean
  getJoystickX(): number  // 返回 -1 到 1
  getJoystickY(): number  // 返回 -1 到 1
  setVisible(visible: boolean): void
  destroy(): void
}

// 快速创建标准控制（摇杆+跳跃+飞行按钮）
createStandardControls(scene: Phaser.Scene): TouchControls

// 检测是否为移动设备
isMobileDevice(): boolean
```

**使用示例：**

```typescript
import { createStandardControls } from '../common/TouchControls';

class MyScene extends Phaser.Scene {
  private touchControls!: TouchControls;
  
  create() {
    // 创建标准触摸控制（仅在移动设备上显示）
    this.touchControls = createStandardControls(this);
  }
  
  update() {
    // 读取摇杆输入
    const moveX = this.touchControls.getJoystickX();
    if (Math.abs(moveX) > 0.2) {
      this.player.setVelocityX(moveX * 200);
    }
    
    // 检查按钮状态
    if (this.touchControls.isButtonPressed('jump')) {
      this.player.setVelocityY(-450);
    }
    
    if (this.touchControls.isButtonPressed('fly')) {
      this.player.setVelocityY(-300);
    }
  }
}
```

**自定义控制：**

```typescript
// 创建自定义摇杆
const controls = new TouchControls(this);
controls.createJoystick({
  x: 100,
  y: 500,
  radius: 70,
  baseColor: 0x666666,
  stickColor: 0xffffff,
  alpha: 0.6
});

// 创建自定义按钮
controls.createButton({
  key: 'attack',
  x: 700,
  y: 500,
  radius: 40,
  label: '攻击',
  color: 0xff0000,
  alpha: 0.5
});
```

---

### 3. GameAssets.ts - 游戏资源创建

创建游戏中常用的纹理资源。

**主要函数：**

```typescript
// 创建所有敌人相关纹理（蘑菇怪、火龙、火球）
createEnemyTextures(scene: Phaser.Scene): void

// 单独创建各个敌人纹理
createMushroomEnemyTexture(scene: Phaser.Scene): void  // 蘑菇怪 'enemy'
createFireDragonTexture(scene: Phaser.Scene): void    // 火龙 'fireEnemy'
createFireballTexture(scene: Phaser.Scene): void      // 火球 'fireball'

// 创建金币纹理
createCoinTexture(scene: Phaser.Scene): void          // 金币 'coin'
```

**使用示例：**

```typescript
import { createEnemyTextures, createCoinTexture } from '../common/GameAssets';

class MyScene extends Phaser.Scene {
  preload() {
    // 在preload中创建纹理
    createEnemyTextures(this);
    createCoinTexture(this);
  }
  
  create() {
    // 之后就可以使用这些纹理
    const enemy = this.physics.add.sprite(100, 100, 'enemy');
    const fireEnemy = this.physics.add.sprite(200, 100, 'fireEnemy');
    const coin = this.physics.add.sprite(300, 100, 'coin');
  }
}
```

---

### 4. CheatSystem.ts - 秘籍系统

处理秘籍输入检测和相关功能。

**主要常量：**

```typescript
CHEAT_CODES = {
  INVINCIBILITY: 'myy1'  // 无敌护盾秘籍码
}
```

**主要函数：**

```typescript
// 设置秘籍监听器
setupCheatListener(
  scene: Phaser.Scene,
  onCheatDetected: (code: string) => void,
  config?: CheatSystemConfig
): {
  getInput: () => string;
  setInput: (value: string) => void;
  cleanup: () => void;
}

// 处理飞行控制（F键飞行）
handleFlyingControl(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config?: FlyingControlConfig
): void
```

**使用示例：**

```typescript
import { setupCheatListener, CHEAT_CODES } from '../common/CheatSystem';

class MyScene extends Phaser.Scene {
  private isInvincible = false;
  
  create() {
    // 监听秘籍输入
    setupCheatListener(this, (code) => {
      if (code === CHEAT_CODES.INVINCIBILITY && !this.isInvincible) {
        console.log('Invincibility activated!');
        this.activateInvincibility();
      }
    });
  }
}
```

**配置选项：**

```typescript
interface CheatSystemConfig {
  maxInputLength?: number;              // 输入缓冲长度，默认4
  onCheatActivated?: (code: string) => void;  // 激活回调
}

interface FlyingControlConfig {
  key?: string;         // 飞行按键，默认'F'
  velocityY?: number;   // 向上速度，默认-300
}
```

---

### 5. InvincibilityShield.ts - 无敌护盾系统

处理无敌护盾的视觉效果和逻辑。

**护盾样式：**

```typescript
ShieldEffectStyles = {
  LIGHTNING: 'lightning',  // 闪电效果（适用于垂直游戏）
  PULSE: 'pulse'          // 脉冲效果（适用于横版游戏）
}
```

**主要函数：**

```typescript
// 通用激活无敌护盾函数
activateInvincibility(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config?: InvincibilityConfig
): ShieldInstance

// 带闪电效果的无敌护盾
activateInvincibilityWithLightning(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config?: InvincibilityConfig
): ShieldInstance

// 带脉冲效果的无敌护盾
activateInvincibilityWithPulse(
  scene: Phaser.Scene,
  player: Phaser.Physics.Arcade.Sprite,
  config?: InvincibilityConfig
): ShieldInstance
```

**使用示例：**

```typescript
import { activateInvincibility, ShieldEffectStyles } from '../common/InvincibilityShield';

class MyScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private shieldInstance?: ShieldInstance;
  
  activateInvincibility() {
    // 使用默认配置（闪电效果，15秒）
    this.shieldInstance = activateInvincibility(this, this.player);
    
    // 或使用自定义配置
    this.shieldInstance = activateInvincibility(this, this.player, {
      duration: 10000,                        // 10秒持续时间
      effectStyle: ShieldEffectStyles.PULSE,  // 脉冲效果
      shieldColor: 0xff00ff,                  // 紫色护盾
      shieldAlpha: 0.7,                       // 70%透明度
      rotationSpeed: 0.03                     // 旋转速度
    });
  }
  
  // 手动清理护盾
  removeShield() {
    if (this.shieldInstance) {
      this.shieldInstance.cleanup();
      this.shieldInstance = undefined;
    }
  }
}
```

**配置选项：**

```typescript
interface InvincibilityConfig {
  duration?: number;          // 持续时间（毫秒），默认15000
  effectStyle?: ShieldEffectStyle;  // 效果样式，默认'lightning'
  shieldColor?: number;       // 护盾颜色，默认0x00ffff
  shieldAlpha?: number;       // 护盾透明度，默认0.5
  rotationSpeed?: number;     // 旋转速度，默认0.02
}
```

**返回值：**

```typescript
interface ShieldInstance {
  shield: Phaser.GameObjects.Graphics;
  effects?: Phaser.GameObjects.Graphics[];
  cleanup: () => void;  // 清理函数，移除所有视觉效果
}
```

---

## 🎯 使用场景

### CoinChaserScene（金币追逐）
- ✅ 使用 `createEnemyTextures()` 创建敌人
- ✅ 使用 `createCoinTexture()` 创建金币
- ✅ 使用 `setupCheatListener()` 监听秘籍
- ⚠️ 自定义多玩家护盾实现（保留原代码）

### ScrollRunnerScene（古堡逃亡）
- ✅ 使用 `createEnemyTextures()` 创建敌人
- ✅ 使用 `setupCheatListener()` 监听秘籍
- ⚠️ 自定义多玩家护盾实现（保留原代码）

---

## 📝 注意事项

1. **纹理创建时机**：所有 `create*Texture()` 函数应在 `preload()` 或 `create()` 阶段调用。

2. **秘籍监听器**：`setupCheatListener()` 会自动处理键盘输入，无需手动管理输入缓冲。

3. **护盾清理**：`activateInvincibility()` 返回的 `ShieldInstance` 包含 `cleanup()` 方法，可在需要时手动清理。通常护盾会在持续时间结束后自动清理。

4. **多玩家支持**：当前护盾系统设计为单玩家。如需支持多玩家，请参考 CoinChaserScene 和 ScrollRunnerScene 中的自定义实现。

5. **扩展性**：所有模块都导出独立函数，可根据需要单独导入使用。

---

## 🚀 未来扩展

可以考虑添加的功能：
- [ ] 更多敌人类型（飞行怪物、地面陷阱等）
- [ ] 更多秘籍码（速度提升、跳跃增强等）
- [ ] 道具系统（生命恢复、得分加倍等）
- [ ] 多玩家护盾支持
- [ ] 音效管理模块
- [ ] 粒子效果系统
