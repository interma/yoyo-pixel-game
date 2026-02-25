# 游戏角色模块

这个模块包含了游戏中可复用的角色配置和资源创建函数，可以在多个游戏场景中共享使用。

## 包含的角色

1. **Sonic（索尼克）** - 蓝色刺猬，速度快，可按F键飞行
2. **Shadow（夏特）** - 黑色刺猬，力量强，全能型
3. **Amy（艾米·罗斯）** - 粉红色刺猬，灵活，擅长跳跃

## 文件结构

```
src/characters/
├── index.ts              # 统一导出入口
├── CharacterConfig.ts    # 角色配置接口和数据
└── CharacterAssets.ts    # 角色纹理创建函数
```

## 使用方法

### 1. 基础导入

```typescript
import { CHARACTERS, createAllCharacterTextures } from '../characters';
import type { CharacterConfig } from '../characters';
```

### 2. 在场景中创建角色纹理

在 Phaser 场景的 `preload()` 或 `create()` 方法中调用：

```typescript
preload() {
  // 创建所有角色纹理（player, player2, player3）
  createAllCharacterTextures(this);
}
```

或者单独创建某个角色：

```typescript
import { createSonicTexture, createShadowTexture, createAmyTexture } from '../characters';

preload() {
  createSonicTexture(this);    // 创建 'player' 纹理
  createShadowTexture(this);   // 创建 'player2' 纹理
  createAmyTexture(this);      // 创建 'player3' 纹理
}
```

### 3. 使用角色配置

```typescript
import { CHARACTERS, getCharacterById } from '../characters';

// 获取所有角色
const allCharacters = CHARACTERS;

// 根据ID查找角色
const sonic = getCharacterById('sonic');
console.log(sonic.name);      // 'Sonic'
console.log(sonic.texture);   // 'player'
console.log(sonic.color);     // '#0080ff'

// 在UI中显示角色列表
CHARACTERS.forEach(character => {
  // 创建角色选择卡片
  // character.id, character.name, character.description 等
});
```

### 4. 创建精灵

```typescript
create() {
  // 首先确保纹理已创建
  createAllCharacterTextures(this);
  
  // 使用角色纹理创建精灵
  const sonic = this.physics.add.sprite(100, 500, 'player');
  const shadow = this.physics.add.sprite(200, 500, 'player2');
  const amy = this.physics.add.sprite(300, 500, 'player3');
}
```

### 5. 在角色选择界面中使用

```typescript
import { CHARACTERS } from '../characters';

showCharacterSelection() {
  CHARACTERS.forEach((character, index) => {
    // 创建角色卡片
    const sprite = this.add.sprite(x, y, character.texture);
    const nameText = this.add.text(x, y, character.name, {
      color: character.color
    });
    const descText = this.add.text(x, y, character.description);
  });
}
```

## 角色配置接口

```typescript
interface CharacterConfig {
  id: string;           // 唯一标识符
  name: string;         // 显示名称
  texture: string;      // Phaser纹理键名
  color: string;        // 主题颜色（十六进制）
  description: string;  // 角色描述
}
```

## 扩展新角色

### 1. 在 CharacterConfig.ts 中添加配置

```typescript
export const CHARACTERS: CharacterConfig[] = [
  // 现有角色...
  {
    id: 'tails',
    name: 'Tails',
    texture: 'player4',
    color: '#ffa500',
    description: '会飞的双尾狐狸'
  }
];
```

### 2. 在 CharacterAssets.ts 中创建纹理函数

```typescript
export function createTailsTexture(scene: Phaser.Scene): void {
  const graphics = scene.add.graphics();
  
  // 绘制角色外观...
  
  graphics.generateTexture('player4', 20, 20);
  graphics.destroy();
}

// 更新统一创建函数
export function createAllCharacterTextures(scene: Phaser.Scene): void {
  createSonicTexture(scene);
  createShadowTexture(scene);
  createAmyTexture(scene);
  createTailsTexture(scene);  // 新增
}
```

## 工具函数

```typescript
// 根据ID获取角色
getCharacterById(id: string): CharacterConfig | undefined

// 根据纹理名称获取角色
getCharacterByTexture(texture: string): CharacterConfig | undefined
```

## 在其他游戏中使用

这个模块设计为通用的，可以在项目的任何游戏场景中使用：

```typescript
// 在另一个游戏场景中
import { CHARACTERS, createAllCharacterTextures } from '../characters';

export default class AnotherGameScene extends Phaser.Scene {
  preload() {
    // 复用相同的角色
    createAllCharacterTextures(this);
  }
  
  create() {
    // 使用相同的纹理
    this.add.sprite(100, 100, 'player');  // Sonic
    this.add.sprite(200, 100, 'player2'); // Shadow
    this.add.sprite(300, 100, 'player3'); // Amy
  }
}
```

## 注意事项

1. **纹理尺寸**：所有角色纹理默认为 20x20 像素
2. **纹理键名**：
   - Sonic: `'player'`
   - Shadow: `'player2'`
   - Amy: `'player3'`
3. **颜色格式**：配置中的颜色使用十六进制字符串（如 '#0080ff'）
4. **场景依赖**：纹理创建函数需要在 Phaser 场景上下文中调用

## 相关文件

- `src/scenes/CoinChaserScene.ts` - 角色模块的使用示例
