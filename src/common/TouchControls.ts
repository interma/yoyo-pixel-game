/**
 * 移动端触摸控制模块
 * 提供虚拟摇杆和按钮支持
 */

import Phaser from 'phaser';

/**
 * 虚拟按钮配置
 */
export interface VirtualButtonConfig {
  key: string;           // 按钮标识
  x: number;             // X位置（相对于屏幕）
  y: number;             // Y位置（相对于屏幕）
  radius?: number;       // 按钮半径
  label: string;         // 按钮文字
  color?: number;        // 按钮颜色
  alpha?: number;        // 透明度
}

/**
 * 虚拟摇杆配置
 */
export interface VirtualJoystickConfig {
  x: number;             // 摇杆中心X位置
  y: number;             // 摇杆中心Y位置
  radius?: number;       // 摇杆外圈半径
  baseColor?: number;    // 底座颜色
  stickColor?: number;   // 摇杆颜色
  alpha?: number;        // 透明度
}

/**
 * 触摸控制器类
 */
export class TouchControls {
  private scene: Phaser.Scene;
  private joystick: {
    base: Phaser.GameObjects.Graphics;
    stick: Phaser.GameObjects.Graphics;
    pointer: Phaser.Input.Pointer | null;
    config: VirtualJoystickConfig;
  } | null = null;
  
  private buttons: Map<string, {
    graphics: Phaser.GameObjects.Graphics;
    text: Phaser.GameObjects.Text;
    isPressed: boolean;
    pointer: Phaser.Input.Pointer | null;
    config: VirtualButtonConfig;
  }> = new Map();

  // 摇杆输入状态
  public joystickVector = { x: 0, y: 0 };
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * 创建虚拟摇杆
   */
  createJoystick(config: VirtualJoystickConfig): void {
    const radius = config.radius || 60;
    const baseColor = config.baseColor || 0x666666;
    const stickColor = config.stickColor || 0xffffff;
    const alpha = config.alpha || 0.5;

    // 创建底座
    const base = this.scene.add.graphics();
    base.fillStyle(baseColor, alpha);
    base.fillCircle(config.x, config.y, radius);
    base.lineStyle(3, 0xffffff, alpha);
    base.strokeCircle(config.x, config.y, radius);
    base.setScrollFactor(0);
    base.setDepth(1000);

    // 创建摇杆
    const stick = this.scene.add.graphics();
    stick.fillStyle(stickColor, alpha + 0.2);
    stick.fillCircle(config.x, config.y, radius * 0.4);
    stick.setScrollFactor(0);
    stick.setDepth(1001);

    this.joystick = {
      base,
      stick,
      pointer: null,
      config: { ...config, radius, baseColor, stickColor, alpha }
    };

    // 监听触摸事件
    this.scene.input.on('pointerdown', this.onJoystickDown, this);
    this.scene.input.on('pointermove', this.onJoystickMove, this);
    this.scene.input.on('pointerup', this.onJoystickUp, this);
  }

  /**
   * 创建虚拟按钮
   */
  createButton(config: VirtualButtonConfig): void {
    const radius = config.radius || 40;
    const color = config.color || 0xff0000;
    const alpha = config.alpha || 0.5;

    // 创建按钮图形
    const graphics = this.scene.add.graphics();
    graphics.fillStyle(color, alpha);
    graphics.fillCircle(config.x, config.y, radius);
    graphics.lineStyle(3, 0xffffff, alpha);
    graphics.strokeCircle(config.x, config.y, radius);
    graphics.setScrollFactor(0);
    graphics.setDepth(1000);
    graphics.setInteractive(
      new Phaser.Geom.Circle(config.x, config.y, radius),
      Phaser.Geom.Circle.Contains
    );

    // 创建按钮文字
    const text = this.scene.add.text(config.x, config.y, config.label, {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Courier New, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
      padding: { top: 10, bottom: 10, left: 5, right: 5 },
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0);
    text.setDepth(1001);

    const buttonData: {
      graphics: Phaser.GameObjects.Graphics;
      text: Phaser.GameObjects.Text;
      isPressed: boolean;
      pointer: Phaser.Input.Pointer | null;
      config: VirtualButtonConfig;
    } = {
      graphics,
      text,
      isPressed: false,
      pointer: null,
      config: { ...config, radius, color, alpha }
    };

    this.buttons.set(config.key, buttonData);

    // 按钮触摸事件
    graphics.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      buttonData.isPressed = true;
      buttonData.pointer = pointer;
      graphics.clear();
      graphics.fillStyle(color, alpha + 0.3);
      graphics.fillCircle(config.x, config.y, radius);
      graphics.lineStyle(3, 0xffffff, alpha + 0.3);
      graphics.strokeCircle(config.x, config.y, radius);
    });

    graphics.on('pointerup', () => {
      buttonData.isPressed = false;
      buttonData.pointer = null;
      graphics.clear();
      graphics.fillStyle(color, alpha);
      graphics.fillCircle(config.x, config.y, radius);
      graphics.lineStyle(3, 0xffffff, alpha);
      graphics.strokeCircle(config.x, config.y, radius);
    });

    graphics.on('pointerout', () => {
      if (buttonData.isPressed) {
        buttonData.isPressed = false;
        buttonData.pointer = null;
        graphics.clear();
        graphics.fillStyle(color, alpha);
        graphics.fillCircle(config.x, config.y, radius);
        graphics.lineStyle(3, 0xffffff, alpha);
        graphics.strokeCircle(config.x, config.y, radius);
      }
    });
  }

  /**
   * 摇杆按下事件
   */
  private onJoystickDown(pointer: Phaser.Input.Pointer): void {
    if (!this.joystick) return;

    const { x, y, radius } = this.joystick.config;
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, x!, y!);

    if (distance <= radius!) {
      this.joystick.pointer = pointer;
    }
  }

  /**
   * 摇杆移动事件
   */
  private onJoystickMove(pointer: Phaser.Input.Pointer): void {
    if (!this.joystick || this.joystick.pointer !== pointer) return;

    const { x, y, radius } = this.joystick.config;
    const distance = Phaser.Math.Distance.Between(pointer.x, pointer.y, x!, y!);
    const angle = Phaser.Math.Angle.Between(x!, y!, pointer.x, pointer.y);

    let stickX = pointer.x;
    let stickY = pointer.y;

    // 限制摇杆在圆圈内
    if (distance > radius! * 0.8) {
      stickX = x! + Math.cos(angle) * radius! * 0.8;
      stickY = y! + Math.sin(angle) * radius! * 0.8;
    }

    // 更新摇杆位置
    this.joystick.stick.clear();
    this.joystick.stick.fillStyle(this.joystick.config.stickColor!, this.joystick.config.alpha! + 0.2);
    this.joystick.stick.fillCircle(stickX, stickY, radius! * 0.4);

    // 计算输入向量（归一化）
    const deltaX = stickX - x!;
    const deltaY = stickY - y!;
    const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (magnitude > 0) {
      this.joystickVector.x = deltaX / (radius! * 0.8);
      this.joystickVector.y = deltaY / (radius! * 0.8);
    } else {
      this.joystickVector.x = 0;
      this.joystickVector.y = 0;
    }
  }

  /**
   * 摇杆释放事件
   */
  private onJoystickUp(pointer: Phaser.Input.Pointer): void {
    if (!this.joystick || this.joystick.pointer !== pointer) return;

    this.joystick.pointer = null;
    this.joystickVector.x = 0;
    this.joystickVector.y = 0;

    // 重置摇杆位置
    const { x, y, radius, stickColor, alpha } = this.joystick.config;
    this.joystick.stick.clear();
    this.joystick.stick.fillStyle(stickColor!, alpha! + 0.2);
    this.joystick.stick.fillCircle(x!, y!, radius! * 0.4);
  }

  /**
   * 检查按钮是否被按下
   */
  isButtonPressed(key: string): boolean {
    const button = this.buttons.get(key);
    return button ? button.isPressed : false;
  }

  /**
   * 获取摇杆X轴输入（-1到1）
   */
  getJoystickX(): number {
    return this.joystickVector.x;
  }

  /**
   * 获取摇杆Y轴输入（-1到1）
   */
  getJoystickY(): number {
    return this.joystickVector.y;
  }

  /**
   * 清理所有控件
   */
  destroy(): void {
    if (this.joystick) {
      this.joystick.base.destroy();
      this.joystick.stick.destroy();
      this.joystick = null;
    }

    this.buttons.forEach(button => {
      button.graphics.destroy();
      button.text.destroy();
    });
    this.buttons.clear();

    this.scene.input.off('pointerdown', this.onJoystickDown, this);
    this.scene.input.off('pointermove', this.onJoystickMove, this);
    this.scene.input.off('pointerup', this.onJoystickUp, this);
  }

  /**
   * 显示/隐藏控件
   */
  setVisible(visible: boolean): void {
    if (this.joystick) {
      this.joystick.base.setVisible(visible);
      this.joystick.stick.setVisible(visible);
    }

    this.buttons.forEach(button => {
      button.graphics.setVisible(visible);
      button.text.setVisible(visible);
    });
  }
}

/**
 * 检测是否为移动设备
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 创建标准的游戏触摸控制（摇杆+跳跃按钮）
 */
export function createStandardControls(scene: Phaser.Scene): TouchControls {
  const controls = new TouchControls(scene);
  
  // 只在移动设备上显示
  if (isMobileDevice()) {
    // 左侧摇杆
    controls.createJoystick({
      x: 100,
      y: 500,
      radius: 60
    });

    // 右侧跳跃按钮
    controls.createButton({
      key: 'jump',
      x: 700,
      y: 500,
      radius: 45,
      label: '跳',
      color: 0xff6b6b
    });

    // 飞行按钮
    controls.createButton({
      key: 'fly',
      x: 620,
      y: 520,
      radius: 35,
      label: 'F',
      color: 0x4ecdc4,
      alpha: 0.4
    });
  }

  return controls;
}
