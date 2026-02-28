# 🎮 呦呦的像素冒险
![游戏风格](https://img.shields.io/badge/风格-像素艺术-blue)
![引擎](https://img.shields.io/badge/引擎-Phaser%203-green)
![语言](https://img.shields.io/badge/语言-TypeScript-blue)
![游戏数量](https://img.shields.io/badge/游戏-2个-orange)
![模块化](https://img.shields.io/badge/架构-模块化-brightgreen)

<img src="public/screen.png" alt="游戏截图" width="600">

## 👾 介绍

我和儿子完全使用Copilot开发的一个像素游戏合集。技术栈基于Phaser3和TypeScript，灵感来自经典的80年代FC像素游戏。

最新版本已经部署到了Vercel上，[点击这里](https://yoyo-pixel.vercel.app/)访问。

## ✨ 项目亮点

- 🎮 **双游戏模式**：垂直滚动收集 + 横向卷轴跳跃
- 👥 **双人协作**：支持1-2人同时游玩，3个可选角色
- 📱 **移动端支持**：自动适配手机/平板，虚拟摇杆和按钮控制
- 🔊 **音效系统**：程序化生成的复古风格音效，背景音乐和动作音效
- 🎨 **纯代码生成**：所有像素图形由程序生成，零图片依赖
- 🏗️ **模块化架构**：可复用的角色、敌人、秘籍系统
- 🛡️ **秘籍系统**：输入 `myy1` 激活护盾，F键飞行
- 🔧 **易于扩展**：完善的模块文档，快速添加新游戏

## 🕹️ 游戏列表

### 1️⃣ 金币追逐 (Coin Chaser)
经典垂直滚动平台跳跃收集游戏，支持双人协作。
- 🎯 玩法：收集所有金币获得胜利
- 🎮 模式：1-2人
- 🌈 风格：索尼克风格，蓝天草地
- 📏 尺寸：800×1200（垂直滚动）

### 2️⃣ 古堡逃亡 (Castle Escape)
横向卷轴冒险游戏，跳跃穿越危险的古堡废墟。
- 🎯 玩法：跨越深坑到达终点城堡
- 🎮 模式：1-2人
- 🌅 风格：傍晚古堡巨石风格
- 📏 尺寸：3200×600（横向滚动）

## 🌟 游戏特色

### 🎯 游戏选择菜单
- **现代化界面**：精美的游戏选择卡片
- **便捷导航**：点击卡片或按 ESC 键在游戏间切换
- **可扩展**：便于添加更多游戏

### 🎨 经典复古风格
- **8位像素艺术**图形，完全由程序生成
- **FC时代**风格设计，怀旧的蓝天背景
- **流畅滚动**的镜头系统，经典平台跳跃手感

### 👥 双人模式
支持1-2人游戏，可在菜单中选择角色：
- **索尼克（Sonic）**: 蓝色刺猬，红色鞋子 🔵
- **夏特（Shadow）**: 黑色刺猬，红色条纹 ⚫
- **艾米（Amy）**: 粉色刺猬，可爱风格 🩷

**控制方式：**
- **玩家1**: 方向键移动 + 空格/↑跳跃 + F键飞行
- **玩家2**: WASD移动 + Shift/W跳跃 + F键飞行
- **📱 移动端**: 虚拟摇杆移动 + 跳跃按钮 + F按钮飞行（自动显示）

### 🎯 游戏元素
- ✨ **收集金币**: 收集所有金币即可胜利
- 🍄 **地面敌人**: 蘑菇状敌人在平台上巡逻
- 🔥 **飞行敌人**: 会喷火的飞龙敌人，发射追踪火球
- 🏆 **计分系统**: 
  - 金币：+10分
  - 踩踏敌人：+20分
  - 击败火龙：+50分
- ❤️ **生命系统**: 初始3条生命
- 🎮 **多人协作**: 镜头跟随两个玩家的中心点
- ⚡ **移动平台**: 第二层和第四层各有2个会左右移动的平台
- 🛡️ **无敌光盾**: 带有彩色雷电特效的防护罩

### 🌍 世界设计
- **多层平台**设计，高度各异
- **垂直滚动**高度达1200像素
- **物理引擎**驱动的移动、重力和碰撞检测
- **动态难度**: 随着游戏进行出现更多敌人

### 🎮 秘籍系统
在游戏过程中输入秘籍码激活特殊能力：
- **myy1**: 激活15秒无敌护盾
  - 🛡️ 六边形彩色护盾保护角色
  - ⚡ 闪电特效环绕（金币追逐）或脉冲动画（古堡逃亡）
  - 💫 免疫所有敌人和陷阱伤害
- **F键**: 长按实现飞行（所有角色可用）
  - 🚀 持续向上飞行
  - 💨 可在空中自由移动

### 🔊 音效系统
游戏内置完整的**程序化音效系统**，使用 Web Audio API 生成复古风格音效：
- **背景音乐 (BGM)**:
  - 🎹 金币追逐：欢快的8位风格旋律
  - 🎵 古堡逃亡：紧张的冒险主题音乐
- **动作音效 (SFX)**:
  - 🦘 跳跃音效：经典的跳跃声
  - 🪙 金币收集：清脆的收集音
  - 💥 敌人碰撞：撞击音效
  - ⚔️ 击败敌人：胜利音效
  - 🛡️ 护盾激活：能量充能音效
  - 🏆 游戏胜利：胜利曲调
  - 💀 游戏失败：失败音效
- **音量控制**:
  - 背景音乐和音效独立音量控制
  - 自动音量平衡，确保最佳游戏体验
- **零依赖**：完全由程序生成，无需外部音频文件

### 🏗️ 模块化架构
项目采用**高度模块化**设计，便于扩展和维护：
- 📦 **角色模块** (`src/characters/`)：统一的角色纹理和配置系统
- 🎨 **资源模块** (`src/common/GameAssets.ts`)：可复用的敌人、金币纹理
- 🎮 **秘籍模块** (`src/common/CheatSystem.ts`)：统一的秘籍输入检测
- 🛡️ **护盾模块** (`src/common/InvincibilityShield.ts`)：可配置的护盾效果系统- 📱 **触控模块** (`src/common/TouchControls.ts`)：移动端虚拟摇杆和按钮系统
- 🎵 **音效模块** (`src/common/SoundSystem.ts`)：程序化音效生成和管理系统- 🔄 **代码复用率**：约150行重复代码已提取为通用模块
- 📚 完整的模块使用文档：[查看文档](src/common/README.md)

## 🚀 开始使用

### 环境要求
- Node.js (v16 或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
```bash
git clone <repository-url>
cd pixel-platformer
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

4. 打开浏览器访问本地服务器地址（通常是 `http://localhost:5173`）

### 生产环境构建

```bash
npm run build
```

构建后的文件将在 `dist` 目录中。

### �️ 使用 Makefile（推荐）

项目提供了 Makefile 来简化常用命令：

```bash
# 查看所有可用命令
make help

# 常用命令
make install        # 安装依赖
make dev           # 启动开发服务器
make build         # 构建生产版本
make test          # 运行所有测试
make clean         # 清理构建文件

# 首次设置（安装依赖 + 测试工具）
make setup

# 提交前检查（lint + test + build）
make check
```

**完整命令列表**：
- **开发**: `make dev`, `make build`, `make preview`
- **测试**: `make test`, `make test-unit`, `make test-e2e`, `make test-ui`
- **工具**: `make lint`, `make format`, `make clean`
- **其他**: `make stats`（查看项目统计）, `make watch`（监控测试）

### �📱 移动端测试

**方法1：使用浏览器开发者工具**
1. 打开 Chrome DevTools (F12)
2. 启用设备模拟 (Ctrl+Shift+M)
3. 选择移动设备（如 iPhone）
4. 刷新页面，触摸控制将自动显示

**方法2：在真实设备上测试**
1. 确保手机和电脑在同一网络
2. 运行 `npm run dev`
3. 用手机浏览器访问显示的网络地址（如 `http://192.168.x.x:5173`）

**方法3：Vercel 部署**
- 部署到 Vercel 后，直接用手机访问你的应用 URL
- 触摸控制会自动在移动设备上启用

更多移动端信息请查看 [MOBILE.md](docs/MOBILE.md)

## 🎮 玩法说明

### 操作方式

#### 玩家1
- **←/→ 方向键**: 左右移动
- **↑ 方向键或空格**: 跳跃
- **F 键**: 飞行（长按）

#### 玩家2
- **A/D**: 左右移动
- **W 或 Shift**: 跳跃
- **F 键**: 飞行（长按）

#### 秘籍输入
- 直接在游戏中输入字母和数字
- 输入 **myy1** 激活无敌护盾

#### 📱 移动端控制
- **虚拟摇杆**（左下角）：左右移动
- **跳跃按钮**（右下角红色）：跳跃
- **飞行按钮**（右下角蓝绿色）：飞行
- 自动检测移动设备并显示触摸控制
- 支持多点触控（可同时操作摇杆和按钮）

#### 通用操作
- **ESC**: 返回游戏菜单
- **R**: 重新开始游戏（失败/胜利后）

### 游戏目标

#### 金币追逐 (Coin Chaser)
- 🪙 收集所有金币获得胜利
- 🍄 避开或踩踏敌人
- 🎈 不要掉下平台
- ❤️ 用3条生命坚持到最后
- 🏆 争取最高分数！

#### 古堡逃亡 (Castle Escape)
- 🏃 跨越所有深坑和平台
- 🏰 到达终点城堡获得胜利
- 🔥 躲避火龙和蘑菇怪
- 💀 小心掉入深坑
- ❤️ 保持3条生命完成挑战

### 游戏技巧
- 💡 可以从上方跳到敌人头上来踩踏它们
- 💡 火龙会发射追踪火球 - 保持移动！
- 💡 踩踏火龙可以获得更多分数
- 💡 移动平台上的角色和金币会随平台一起移动
- 💡 输入秘籍可以激活特殊效果
- 💡 游戏结束或胜利后按 **R** 键重新开始
- 💡 按 **ESC** 键或点击右上角按钮返回游戏菜单

## 🛠️ 技术栈

- **游戏引擎**: [Phaser 3](https://phaser.io/) (v3.90.0)
- **开发语言**: TypeScript
- **构建工具**: Vite
- **图形渲染**: 程序化生成的像素艺术（无需外部素材）
- **物理引擎**: Phaser Arcade Physics
- **代码架构**: 模块化设计，高度可复用
- **移动端支持**: 自适应触摸控制，虚拟摇杆和按钮

## 📁 项目结构

```
pixel-platformer/
├── public/              # 静态资源
├── src/
│   ├── scenes/          # 游戏场景
│   │   ├── MenuScene.ts           # 游戏选择菜单
│   │   ├── CoinChaserScene.ts     # 金币追逐游戏
│   │   └── ScrollRunnerScene.ts   # 古堡逃亡游戏
│   ├── characters/      # 角色模块（可复用）
│   │   ├── CharacterAssets.ts     # 角色纹理生成
│   │   ├── CharacterConfig.ts     # 角色配置数据
│   │   └── index.ts               # 导出入口
│   ├── common/          # 通用游戏模块（可复用）
│   │   ├── GameAssets.ts          # 敌人/金币纹理
│   │   ├── CheatSystem.ts         # 秘籍输入系统
│   │   ├── InvincibilityShield.ts # 无敌护盾效果
│   │   ├── TouchControls.ts       # 移动端触摸控制
│   │   └── README.md              # 模块使用文档
│   ├── main.ts          # 游戏初始化
│   └── style.css        # 样式文件
├── index.html           # 入口HTML
├── package.json         # 依赖配置
└── tsconfig.json        # TypeScript配置
```

## 🎨 游戏资源

所有视觉资源均使用 Phaser 的 Graphics API **程序化生成**：
- 🦔 玩家精灵（索尼克、夏特、艾米）- 20×20像素
- 🟩 平台纹理（草地/巨石风格）
- 🍄 蘑菇怪敌人 - 24×24像素，红帽白点
- 🐉 火龙敌人 - 24×20像素，喷火飞行
- 🔥 火球特效 - 12×12像素，追踪攻击
- 🪙 金币动画 - 16×16像素
- 🛡️ 六边形无敌护盾 + 闪电/脉冲特效
- 🏰 城堡建筑 - 灰色砖块风格

✨ **零依赖**：无需任何外部图片文件！

## 🔧 开发指南

### 使用通用模块

项目采用**模块化设计**，通用功能已抽取为可复用模块：

#### 角色系统 (`src/characters/`)
```typescript
import { createAllCharacterTextures, CHARACTERS } from '../characters';

// 在场景中创建所有角色纹理
createAllCharacterTextures(this);
```

#### 游戏资源 (`src/common/GameAssets.ts`)
```typescript
import { createEnemyTextures, createCoinTexture } from '../common/GameAssets';

// 创建敌人和金币纹理
createEnemyTextures(this);  // 蘑菇怪、火龙、火球
createCoinTexture(this);     // 金币
```

#### 秘籍系统 (`src/common/CheatSystem.ts`)
```typescript
import { setupCheatListener, CHEAT_CODES } from '../common/CheatSystem';

setupCheatListener(this, (code) => {
  if (code === CHEAT_CODES.INVINCIBILITY) {
    this.activateInvincibility();
  }
});
```

#### 无敌护盾 (`src/common/InvincibilityShield.ts`)
```typescript
import { activateInvincibility, ShieldEffectStyles } from '../common/InvincibilityShield';

activateInvincibility(this, this.player, {
  duration: 15000,
  effectStyle: ShieldEffectStyles.LIGHTNING
});
```

详细文档请查看 [`src/common/README.md`](src/common/README.md)

### 添加新游戏

1. **创建场景类** (`src/scenes/YourScene.ts`)
```typescript
import Phaser from 'phaser';
import { createAllCharacterTextures } from '../characters';
import { createEnemyTextures } from '../common/GameAssets';
import { setupCheatListener, CHEAT_CODES } from '../common/CheatSystem';

export default class YourScene extends Phaser.Scene {
  preload() {
    createAllCharacterTextures(this);
    createEnemyTextures(this);
  }
  
  create() {
    setupCheatListener(this, (code) => {
      // 处理秘籍
    });
  }
}
```

2. **注册场景** (`src/main.ts`)
```typescript
import YourScene from './scenes/YourScene';

scene: [MenuScene, CoinChaserScene, ScrollRunnerScene, YourScene]
```

3. **添加到菜单** (`src/scenes/MenuScene.ts`)
```typescript
const games = [
  // ...
  {
    name: '你的游戏',
    nameEn: 'Your Game',
    description: '游戏描述',
    scene: 'YourScene',
    color: 0xff6b6b,
    icon: '🎮'
  }
];
```

### 自定义修改

- **角色外观**: 修改 `src/characters/CharacterAssets.ts` 中的颜色和形状
- **敌人设计**: 修改 `src/common/GameAssets.ts` 中的纹理生成
- **护盾效果**: 调整 `src/common/InvincibilityShield.ts` 中的动画参数
- **秘籍码**: 在 `src/common/CheatSystem.ts` 的 `CHEAT_CODES` 中添加新秘籍
- **物理参数**: 修改 `src/main.ts` 中的 Phaser 配置

## 🧪 测试

测试基础设施已经配置完成！包含单元测试（Vitest）和E2E测试（Playwright）。

### 快速运行

```bash
# 运行单元测试（7个测试）
make test-unit

# 运行E2E测试（8个测试）
make test-e2e

# 运行所有测试
make test

# 监控模式（自动重测）
make watch
```

### 测试文档

- **[TEST_GUIDE.md](docs/TEST_GUIDE.md)** - 快速测试指南（推荐从这里开始）
- **[TESTING.md](docs/TESTING.md)** - 完整测试策略和最佳实践

### 当前测试状态

**✅ 单元测试**: 7个测试全部通过（游戏配置、生命值系统、状态管理）  
**✅ E2E测试**: 14个测试全部通过
- 完整游戏流程：金币追逐单/双人 + 古堡逃亡单/双人
- 菜单导航：游戏选择、玩家数量选择、角色选择
- Bug回归：3个已修复bug的回归测试

所有测试运行时间：~21秒

### 详细文档

- **[TEST_GUIDE.md](docs/TEST_GUIDE.md)** - 快速测试指南（推荐从这里开始）
- **[E2E_COVERAGE.md](docs/E2E_COVERAGE.md)** - E2E测试完整覆盖报告
- **[TESTING.md](docs/TESTING.md)** - 完整测试策略和最佳实践

查看 **[TESTING.md](docs/TESTING.md)** 获取：
- ✅ 完整的手动测试清单
- 🤖 自动化测试示例代码
- 🐛 Bug回归测试策略
- 📊 测试覆盖率目标
- 🔄 CI/CD集成指南

**关键测试用例**：
- 场景切换不会导致状态混乱
- 玩家选择流程一次点击生效
- 游戏按键不会触发选择界面
- 返回菜单后重新进入游戏正常工作

## 📝 许可证

本项目仅供教育和学习目的。

## 🎯 未来计划

### 游戏内容
- [ ] 添加更多游戏场景
- [ ] 实现更多道具（加速、双倍跳跃等）
- [ ] 创建多个关卡/难度
- [ ] 添加 Boss 战
- [ ] 更多敌人类型和行为模式

### 功能优化
- [ ] 添加音效和背景音乐
- [ ] 实现本地最高分存储
- [ ] 添加暂停菜单
- [ ] 支持触屏/手柄操作
- [ ] 创建关卡编辑器

### 代码质量
- [x] 模块化角色系统
- [x] 抽取通用游戏资源
- [x] 统一秘籍系统
- [x] 完善测试指南和策略文档
- [ ] 添加自动化测试（单元测试 + E2E测试）
- [ ] 完善 TypeScript 类型定义
- [ ] CI/CD 集成

## 🤝 参与贡献

欢迎 Fork 本项目并添加你自己的功能！

