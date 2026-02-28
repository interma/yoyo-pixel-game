# 🎮 移动端支持指南

## 功能说明

本游戏现已支持移动设备！当从手机或平板访问时，会自动显示虚拟控制按钮。

## 自动检测

- ✅ 自动检测移动设备（iOS、Android、平板等）
- ✅ 仅在移动设备上显示触摸控制
- ✅ 桌面浏览器保持键盘控制

## 控制方式

### 虚拟摇杆（屏幕左下角）
- 🕹️ 蓝色圆形摇杆
- 左右拖动控制角色移动
- 归一化输入（-1 到 1），提供精确控制

### 跳跃按钮（屏幕右下角）
- 🔴 红色圆形按钮，标记为"跳"
- 点击即可跳跃
- 支持在地面时才能跳跃的逻辑

### 飞行按钮（屏幕右下角，靠左）
- 🔵 青蓝色圆形按钮，标记为"F"
- 长按实现飞行效果
- 半透明设计，不阻挡视线

## 技术实现

### 虚拟摇杆
- **位置**: (100, 500) 相对于屏幕
- **半径**: 60像素
- **颜色**: 灰色底座 + 白色操纵杆
- **透明度**: 50%

### 按钮配置
```typescript
// 跳跃按钮
{
  位置: (700, 500)
  半径: 45像素
  颜色: 0xff6b6b (红色)
  标签: '跳'
}

// 飞行按钮
{
  位置: (620, 520)
  半径: 35像素
  颜色: 0x4ecdc4 (青蓝色)
  标签: 'F'
  透明度: 40%
}
```

## 测试方法

### 桌面浏览器测试（开发者模式）
1. 打开 Chrome DevTools (F12)
2. 点击设备工具栏图标（Ctrl+Shift+M）
3. 选择移动设备模拟（如 iPhone、iPad）
4. 刷新页面
5. 触摸控制将自动显示

### 真实设备测试
1. 在本地运行 `npm run dev`
2. 使用同一网络的手机访问显示的地址
3. 或部署到 Vercel 并用手机访问

### Vercel 部署测试
```bash
# 已部署到 Vercel
# 直接用手机浏览器访问你的 Vercel URL
# 例如: https://your-app.vercel.app
```

## 代码集成

### 在场景中启用触摸控制

```typescript
import { createStandardControls } from '../common/TouchControls';

class YourScene extends Phaser.Scene {
  private touchControls!: TouchControls;

  create() {
    // 创建标准控制（自动检测移动设备）
    this.touchControls = createStandardControls(this);
  }

  update() {
    // 读取摇杆输入（-1 到 1）
    const joystickX = this.touchControls.getJoystickX();
    
    // 结合键盘输入
    let moveX = 0;
    if (this.cursors.left.isDown) {
      moveX = -1;
    } else if (this.cursors.right.isDown) {
      moveX = 1;
    }
    
    // 触摸输入优先
    if (Math.abs(joystickX) > 0.2) {
      moveX = joystickX;
    }
    
    // 应用移动
    if (moveX !== 0) {
      this.player.setVelocityX(moveX * 200);
    }

    // 检查按钮
    const touchJump = this.touchControls.isButtonPressed('jump');
    const touchFly = this.touchControls.isButtonPressed('fly');
    
    if (touchJump && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
    }
    
    if (touchFly) {
      this.player.setVelocityY(-300);
    }
  }
}
```

## 自定义控制

如果需要自定义控制布局：

```typescript
import { TouchControls } from '../common/TouchControls';

const controls = new TouchControls(this);

// 自定义摇杆
controls.createJoystick({
  x: 120,           // X 位置
  y: 480,           // Y 位置
  radius: 70,       // 半径
  baseColor: 0x333333,
  stickColor: 0xffffff,
  alpha: 0.6
});

// 自定义按钮
controls.createButton({
  key: 'custom',
  x: 650,
  y: 480,
  radius: 50,
  label: '攻击',
  color: 0xff0000,
  alpha: 0.7
});
```

## 特性

✅ **多点触控支持**：可同时操作摇杆和按钮  
✅ **自动隐藏**：桌面设备不显示触摸控制  
✅ **半透明设计**：不遮挡游戏画面  
✅ **响应灵敏**：实时输入，无延迟  
✅ **归一化输入**：摇杆值范围 -1 到 1  
✅ **可配置**：颜色、大小、位置等均可自定义  

## 注意事项

1. **死区设置**：建议对摇杆输入设置 0.2 的死区，避免轻微触碰造成误操作
   ```typescript
   if (Math.abs(joystickX) > 0.2) {
     // 应用移动
   }
   ```

2. **缩放适配**：游戏使用 `Phaser.Scale.FIT` 模式，自动适配不同屏幕尺寸

3. **性能优化**：触摸控制图形使用固定位置（`setScrollFactor(0)`），不会随相机滚动

4. **浏览器兼容**：支持所有现代移动浏览器（Safari、Chrome、Firefox Mobile）

## 问题排查

### 控制按钮不显示
- 检查是否使用移动设备或启用了设备模拟
- 确认 `isMobileDevice()` 函数正常工作
- 查看浏览器控制台是否有错误

### 摇杆不响应
- 确认触摸区域未被其他元素覆盖
- 检查 z-index (depth) 设置
- 验证触摸事件监听是否正常

### 按钮无法点击
- 确认按钮的交互区域（`setInteractive`）设置正确
- 检查按钮是否被其他图形遮挡
- 验证事件监听器是否正确绑定

## 更多信息

详细 API 文档请查看：[src/common/README.md](src/common/README.md)
