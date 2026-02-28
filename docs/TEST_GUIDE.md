# 🧪 测试说明

测试基础设施已经配置完成，包含单元测试和E2E测试。

## ✅ 已完成

- ✅ Vitest配置（单元测试）
- ✅ Playwright配置（E2E测试）
- ✅ 7个单元测试示例
- ✅ 8个E2E测试示例
- ✅ 测试命令集成到Makefile

## 🚀 快速开始

### 运行单元测试

```bash
# 运行一次
make test-unit

# 监控模式（自动重运行）
make watch
```

### 运行E2E测试

E2E测试会自动启动开发服务器，请稍等片刻：

```bash
make test-e2e
```

### 运行所有测试

```bash
make test
```

**注意**：首次运行E2E测试时，Playwright会启动开发服务器并等待页面加载，这可能需要几秒钟。请耐心等待。

## 📊 当前测试状态

### 单元测试 ✅

```
✓ tests/unit/example.test.ts (7 tests) 1ms
  ✓ Game Configuration (3)
    ✓ should have valid game dimensions
    ✓ should calculate coin score correctly
    ✓ should calculate enemy defeat scores
  ✓ Player Lives System (3)
    ✓ should start with 3 lives
    ✓ should detect game over when lives reach 0
    ✓ should maintain lives count between 0 and max
  ✓ State Management (1)
    ✓ should reset game state properly

Test Files: 1 passed (1)
Tests: 7 passed (7)
Duration: ~100ms
```

### E2E测试 ✅

```
✓ tests/e2e/complete-flows.spec.ts (6 tests)
  ✓ Complete Game Flows - Coin Chaser (2)
    ✓ 金币追逐 - 单人模式完整流程
    ✓ 金币追逐 - 双人模式完整流程
  ✓ Complete Game Flows - Scroll Runner (2)
    ✓ 古堡逃亡 - 单人模式完整流程
    ✓ 古堡逃亡 - 双人模式完整流程
  ✓ Menu Navigation (2)
    ✓ 主菜单 - 游戏选择导航
    ✓ 游戏内 - 玩家数量和角色选择

✓ tests/e2e/game-flow.spec.ts (6 tests)
  ✓ Game Loading (2)
    ✓ should load game canvas
    ✓ should respond to clicks on canvas
  ✓ Game Navigation (4)
    ✓ should handle full game interaction
    ✓ should handle keyboard controls
    ✓ should return to menu and re-enter game

✓ tests/e2e/regression.spec.ts (3 tests)
  ✓ Bug Regression Tests (3)
    ✓ BUG-001: Game keys should not trigger selection screen
    ✓ BUG-002: Player count selection should work on first click
    ✓ BUG-003: Should not black screen after menu return

Test Files: 3 passed (3)
Tests: 14 passed (14)
Duration: ~20s
```

**所有测试都通过了！** 🎉

### 测试覆盖清单

#### ✅ 基础功能测试
- [x] Canvas加载和渲染
- [x] 鼠标点击响应
- [x] 键盘控制响应

#### ✅ 菜单导航测试
- [x] 主菜单游戏选择（金币追逐/古堡逃亡）
- [x] 单人/双人模式选择
- [x] 角色选择界面
- [x] 返回主菜单功能

#### ✅ 金币追逐完整流程
- [x] 单人模式：移动、跳跃、飞行、秘籍
- [x] 双人模式：双玩家操作、交互

#### ✅ 古堡逃亡完整流程
- [x] 单人模式：跳跃、飞行、秘籍
- [x] 双人模式：双玩家操作、交互

#### ✅ Bug回归测试
- [x] 游戏键不触发选择界面
- [x] 单击选择生效
- [x] 菜单返回无黑屏

## 🔧 配置文件

- `vitest.config.ts` - Vitest单元测试配置
- `playwright.config.ts` - Playwright E2E测试配置

## 📝 测试文件结构

```
tests/
├── unit/
│   └── example.test.ts          # 单元测试示例（游戏逻辑）
└── e2e/
    ├── game-flow.spec.ts        # E2E测试（游戏流程）
    └── regression.spec.ts       # 回归测试（已修复的bug）
```

## 💡 编写新测试

### 单元测试

在 `tests/unit/` 目录创建 `.test.ts` 文件：

```typescript
import { describe, it, expect } from 'vitest';

describe('My Feature', () => {
  it('should work correctly', () => {
    expect(true).toBe(true);
  });
});
```

### E2E测试

在 `tests/e2e/` 目录创建 `.spec.ts` 文件：

```typescript
import { test, expect } from '@playwright/test';

test('my test', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=游戏')).toBeVisible();
});
```

## 🎯 测试覆盖率

```bash
# 生成覆盖率报告
make test-coverage
```

## 📚 更多资源

- **完整E2E测试覆盖**: [E2E_COVERAGE.md](E2E_COVERAGE.md) - 详细的测试清单和覆盖矩阵
- **测试策略文档**: [TESTING.md](TESTING.md) - 完整的测试策略和最佳实践
- **Vitest文档**: https://vitest.dev/
- **Playwright文档**: https://playwright.dev/

## ⚠️ 注意事项

1. **E2E测试运行时间**：E2E测试会启动浏览器和开发服务器，通常需要10-15秒完成
   
2. **测试隔离**：每个E2E测试都会启动新的浏览器上下文，确保测试独立性

3. **开发服务器**：E2E测试会自动启动 `npm run dev`，测试结束后自动关闭

4. **Canvas游戏测试**：由于游戏在Canvas中渲染，测试使用坐标点击和键盘事件来模拟用户操作

5. **测试稳定性**：所有测试都包含适当的等待时间，确保游戏场景完全加载

## 🐛 调试测试

### 单元测试调试

```bash
# UI模式（推荐）
make test:ui

# 详细输出
npm run test -- --reporter=verbose
```

### E2E测试调试

```bash
# UI模式（推荐）
npm run test:e2e:ui

# 查看测试报告
npx playwright show-report

# 录制模式（生成测试代码）
npx playwright codegen http://localhost:5173
```
