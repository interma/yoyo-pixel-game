# 通用游戏模块

这个目录包含可在多个游戏场景中复用的通用功能模块。

## 📦 模块列表

### 1. GameAssets.ts - 游戏资源创建

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

### 2. CheatSystem.ts - 秘籍系统

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

### 3. InvincibilityShield.ts - 无敌护盾系统

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
