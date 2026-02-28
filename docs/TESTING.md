# 🧪 游戏测试指南

本文档提供完整的测试策略，帮助确保游戏质量和避免bug回归。

## 📋 测试策略概览

### 测试金字塔
```
       /\    E2E测试（关键流程）
      /  \   
     /集成\ 场景切换、事件处理
    /______\  
   /单元测试\ 逻辑、状态、工具函数
  /__________\
```

## 🔧 测试工具推荐

### 单元测试 & 集成测试
**推荐：Vitest**（与Vite完美集成）

```bash
npm install -D vitest @vitest/ui
```

```json
// package.json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### E2E测试
**推荐：Playwright**（支持真实浏览器自动化）

```bash
npm install -D @playwright/test
npx playwright install
```

```json
// package.json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## 📝 手动测试清单

### ✅ 场景切换测试

#### 菜单 → 游戏
- [ ] 从菜单进入"金币追逐"
- [ ] 从菜单进入"古堡逃亡"
- [ ] 点击不同游戏卡片能正确切换
- [ ] GitHub链接能正确打开新标签页

#### 游戏 → 菜单
- [ ] 按 ESC 键返回菜单
- [ ] 点击右上角"菜单"按钮返回
- [ ] 返回后背景音乐停止
- [ ] 再次进入游戏状态正确重置

#### 场景重启
- [ ] Game Over 后按 R 重新开始
- [ ] Victory 后按 R 再玩一次
- [ ] 重启后所有状态重置（分数、生命、敌人）

### ✅ 玩家选择流程

#### 标题画面
- [ ] 标题正确显示
- [ ] "按 Enter/Space 开始"提示可见
- [ ] 按 Enter 继续
- [ ] 按 Space 继续
- [ ] 鼠标点击继续
- [ ] 移动端触摸继续

#### 玩家数量选择
- [ ] 界面正确显示"选择玩家数量"
- [ ] **单人**卡片点击**1次**即可进入角色选择
- [ ] **双人**卡片点击**1次**即可进入角色选择
- [ ] 悬停时卡片高亮
- [ ] 点击后不再响应其他输入

#### 角色选择
- [ ] 单人模式：选择1个角色后显示"开始游戏"按钮
- [ ] 双人模式：选择2个角色后显示"开始游戏"按钮
- [ ] 选择后卡片显示绿色和✓标记
- [ ] 可以取消已选择的角色
- [ ] 达到人数限制后其他角色变灰
- [ ] 点击"开始游戏"正确进入游戏

### ✅ 游戏内交互测试

#### 金币追逐
- [ ] 玩家1（方向键）正常移动
- [ ] 玩家2（WASD）正常移动（双人模式）
- [ ] 空格键跳跃
- [ ] F键飞行
- [ ] 收集金币增加分数（+10）
- [ ] 碰撞敌人减少生命
- [ ] 踩踏敌人增加分数（+20）
- [ ] 击败火龙增加分数（+50）
- [ ] 生命值归零显示Game Over
- [ ] 收集所有金币显示Victory
- [ ] **进入游戏后按任意键不会返回选择界面**

#### 古堡逃亡
- [ ] 玩家移动流畅
- [ ] 跳跃穿越深坑
- [ ] 掉入深坑扣除生命并重生
- [ ] 到达终点城堡显示Victory
- [ ] 距离计数正确显示

#### 秘籍系统
- [ ] 输入 `myy1` 激活无敌护盾
- [ ] 护盾持续15秒
- [ ] 护盾期间免疫敌人伤害
- [ ] 护盾有视觉效果（六边形+闪电/脉冲）
- [ ] 护盾结束后恢复正常

### ✅ 移动端测试

#### 触摸控制
- [ ] 虚拟摇杆正确显示（左下角）
- [ ] 跳跃按钮正确显示（右下角红色）
- [ ] 飞行按钮正确显示（右下角蓝绿色）
- [ ] 摇杆控制左右移动
- [ ] 跳跃按钮触发跳跃
- [ ] 飞行按钮触发飞行
- [ ] 多点触控工作正常（同时操作摇杆和按钮）

#### 设备适配
- [ ] iPhone（Safari）正常运行
- [ ] Android（Chrome）正常运行
- [ ] iPad横屏/竖屏都能正常显示
- [ ] 触摸控制自动检测并显示

### ✅ 音效测试

#### 背景音乐
- [ ] 金币追逐有欢快BGM
- [ ] 古堡逃亡有紧张BGM
- [ ] 返回菜单音乐停止
- [ ] Game Over音乐停止
- [ ] Victory音乐停止

#### 音效触发
- [ ] 跳跃有音效
- [ ] 收集金币有音效
- [ ] 碰撞敌人有音效
- [ ] 击败敌人有音效
- [ ] 激活护盾有音效
- [ ] Victory有胜利音效
- [ ] Game Over有失败音效

### ✅ UI/UX测试

#### 文字渲染
- [ ] 中文字符没有被切掉
- [ ] 英文字符清晰可读
- [ ] 标题没有溢出边界
- [ ] 长文本正确换行

#### 颜色和对比度
- [ ] 文字在背景上清晰可读
- [ ] 按钮状态变化明显（hover/active）
- [ ] 选中状态容易识别

#### 响应性
- [ ] 按键操作立即响应（<100ms）
- [ ] 界面切换流畅
- [ ] 没有明显的卡顿

## 🤖 自动化测试示例

### 单元测试示例

```typescript
// tests/unit/game-logic.test.ts
import { describe, it, expect } from 'vitest';

describe('Game Logic', () => {
  describe('Score Calculation', () => {
    it('should calculate coin score correctly', () => {
      const score = calculateCoinScore(5);
      expect(score).toBe(50); // 5 coins × 10 points
    });

    it('should calculate enemy defeat score', () => {
      const mushroomScore = calculateEnemyScore('mushroom');
      const dragonScore = calculateEnemyScore('dragon');
      expect(mushroomScore).toBe(20);
      expect(dragonScore).toBe(50);
    });
  });

  describe('Lives Management', () => {
    it('should reduce lives on hit', () => {
      let lives = 3;
      lives = handlePlayerHit(lives);
      expect(lives).toBe(2);
    });

    it('should trigger game over when lives reach 0', () => {
      let lives = 1;
      const gameOver = handlePlayerHit(lives) === 0;
      expect(gameOver).toBe(true);
    });
  });

  describe('State Reset', () => {
    it('should reset all game state on init', () => {
      const state = {
        score: 100,
        lives: 1,
        gameOver: true,
        isInvincible: true
      };
      
      const resetState = resetGameState(state);
      
      expect(resetState.score).toBe(0);
      expect(resetState.lives).toBe(3);
      expect(resetState.gameOver).toBe(false);
      expect(resetState.isInvincible).toBe(false);
    });
  });
});
```

### E2E测试示例

```typescript
// tests/e2e/critical-paths.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Critical User Paths', () => {
  test('Complete game flow - Single Player', async ({ page }) => {
    // 1. 启动游戏
    await page.goto('http://localhost:5173');
    
    // 2. 从菜单进入游戏
    await page.locator('text=金币追逐').click();
    
    // 3. 标题画面继续
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    
    // 4. 选择单人
    await expect(page.locator('text=选择玩家数量')).toBeVisible();
    await page.locator('text=单人').click();
    await page.waitForTimeout(150);
    
    // 5. 选择角色
    await expect(page.locator('text=选择角色')).toBeVisible();
    await page.locator('text=索尼克').click();
    
    // 6. 开始游戏
    await page.locator('text=开始游戏').click();
    
    // 7. 验证游戏已启动
    await expect(page.locator('text=Score:')).toBeVisible();
    await expect(page.locator('text=Lives:')).toBeVisible();
    
    // 8. 测试基本控制
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    
    // 9. 验证没有错误发生
    await expect(page.locator('text=选择玩家数量')).not.toBeVisible();
  });

  test('Return to menu preserves game functionality', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 第一次游戏流程
    await page.locator('text=金币追逐').click();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await page.locator('text=单人').click();
    await page.waitForTimeout(150);
    await page.locator('text=索尼克').click();
    await page.locator('text=开始游戏').click();
    
    // 返回菜单
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // 再次进入游戏
    await page.locator('text=金币追逐').click();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    
    // 验证选择界面正常显示
    await expect(page.locator('text=选择玩家数量')).toBeVisible();
    
    // 验证可以正常选择
    await page.locator('text=单人').click();
    await page.waitForTimeout(150);
    await expect(page.locator('text=选择角色')).toBeVisible();
  });
});
```

### 回归测试清单

```typescript
// tests/e2e/regression.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Bug Regression Tests', () => {
  test('BUG-001: Game keys should not trigger selection screen', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 完整进入游戏
    await page.locator('text=金币追逐').click();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await page.locator('text=单人').click();
    await page.waitForTimeout(150);
    await page.locator('text=索尼克').click();
    await page.locator('text=开始游戏').click();
    
    // 按多个游戏键
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('F');
    
    // 验证未返回选择界面
    await expect(page.locator('text=选择玩家数量')).not.toBeVisible();
    await expect(page.locator('text=Score:')).toBeVisible();
  });
  
  test('BUG-002: Player count selection should work on first click', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    await page.locator('text=金币追逐').click();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    
    // 点击一次应该就能进入
    await page.locator('text=单人').click();
    await page.waitForTimeout(150);
    
    // 验证已进入角色选择（不需要第二次点击）
    await expect(page.locator('text=选择角色')).toBeVisible();
  });

  test('BUG-003: Return to menu should reset game state', async ({ page }) => {
    await page.goto('http://localhost:5173');
    
    // 进入游戏
    await page.locator('text=金币追逐').click();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    await page.locator('text=单人').click();
    await page.waitForTimeout(150);
    await page.locator('text=索尼克').click();
    await page.locator('text=开始游戏').click();
    
    // 返回菜单
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // 再次进入
    await page.locator('text=古堡逃亡').click(); // 换一个游戏
    await page.keyboard.press('Enter');
    await page.waitForTimeout(150);
    
    // 应该显示正常的选择界面，而不是黑屏
    await expect(page.locator('text=选择玩家数量')).toBeVisible();
  });
});
```

## 📊 测试覆盖率目标

| 测试类型 | 目标覆盖率 | 优先级 |
|---------|-----------|-------|
| 单元测试 | 80%+ | 高 |
| 集成测试 | 60%+ | 中 |
| E2E测试 | 关键路径100% | 高 |
| 手动测试 | 每次发布前执行 | 高 |

## 🔄 CI/CD 集成

### GitHub Actions 示例

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test
      - run: npm run test:coverage

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npx playwright install --with-deps
      - run: npm run dev &
      - run: npx wait-on http://localhost:5173
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## 🎯 最佳实践

### ✅ DO
- ✅ 为每个已修复的bug编写回归测试
- ✅ 测试关键用户路径（菜单→游戏→返回）
- ✅ 在多个浏览器/设备上测试
- ✅ 使用有意义的测试描述
- ✅ 保持测试独立（不依赖执行顺序）
- ✅ 在CI中运行所有测试

### ❌ DON'T
- ❌ 不要只依赖手动测试
- ❌ 不要跳过边界情况测试
- ❌ 不要让测试太慢（E2E保持<5分钟）
- ❌ 不要忽略间歇性失败
- ❌ 不要在测试中使用硬编码延迟（除非必要）

## 🚀 快速开始

### 设置测试环境

```bash
# 安装测试依赖
npm install -D vitest @vitest/ui @playwright/test

# 运行单元测试
npm run test

# 运行E2E测试（需要先启动dev server）
npm run dev
npm run test:e2e
```

### 执行手动测试

1. 打印本文档的"手动测试清单"部分
2. 启动开发服务器：`npm run dev`
3. 按清单逐项测试
4. 记录发现的问题
5. 修复后重新测试

## 📚 相关资源

- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
- [Phaser 测试最佳实践](https://phaser.io/tutorials/test-driven-game-development)
- [游戏测试策略指南](https://www.gamasutra.com/view/news/318028/A_guide_to_game_testing.php)

---

**保持高质量的游戏体验！** 🎮✨
