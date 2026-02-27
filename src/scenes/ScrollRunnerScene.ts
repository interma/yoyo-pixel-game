import Phaser from 'phaser';
import { CHARACTERS } from '../characters';
import type { CharacterConfig } from '../characters';
import { createAllCharacterTextures } from '../characters';
import { createEnemyTextures } from '../common/GameAssets';
import { setupCheatListener, CHEAT_CODES } from '../common/CheatSystem';
import { TouchControls, createStandardControls } from '../common/TouchControls';
import { getSoundManager } from '../common/SoundSystem';
import { TEXT_STYLES } from '../common/UIConfig';

export default class ScrollRunnerScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private player2!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private fKey!: Phaser.Input.Keyboard.Key;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private enemies!: Phaser.Physics.Arcade.Group;
  private fireEnemies!: Phaser.Physics.Arcade.Group;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private lives: number = 3;
  private livesText!: Phaser.GameObjects.Text;
  private gameOver: boolean = false;
  private gameWon: boolean = false;
  private scrollSpeed: number = 200;
  private platformQueue: any[] = [];
  private lastPlatformX: number = 0;
  private distanceTraveled: number = 0;
  private isInvincible: boolean = false;
  private shieldGraphics: Phaser.GameObjects.Graphics[] = [];

  // 触摸控制（移动端）
  private touchControls!: TouchControls;

  // 角色选择相关
  private isInSelectionMode: boolean = true;
  private playerCount: number = 1;
  private selectedCharacters: string[] = [];
  private selectionUI: Phaser.GameObjects.Container[] = [];
  private characterOptions: CharacterConfig[] = CHARACTERS;

  constructor() {
    super({ key: 'ScrollRunnerScene' });
  }

  init() {
    // 重置所有状态变量，确保场景重启时状态正确
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.gameWon = false;
    this.scrollSpeed = 200;
    this.platformQueue = [];
    this.lastPlatformX = 0;
    this.distanceTraveled = 0;
    this.isInvincible = false;
    this.shieldGraphics = [];
    this.isInSelectionMode = true;
    this.playerCount = 1;
    this.selectedCharacters = [];
    this.selectionUI = [];
    this.player2 = null;
  }

  preload() {
    this.createPixelAssets();
    createAllCharacterTextures(this);
  }

  create() {
    // 创建背景
    this.createScrollingBackground();

    // 显示标题和选择界面
    this.showTitleScreen();
  }

  private startGame() {
    // 初始化音效管理器并播放紧张风格背景音乐
    const soundManager = getSoundManager();
    soundManager.playBackgroundMusicTense();

    // 初始化物理世界
    this.physics.world.setBounds(0, 0, 3200, 600);

    // 创建地面平台
    this.platforms = this.physics.add.staticGroup();
    this.createInitialPlatforms();

    // 创建玩家
    this.createSelectedPlayers();

    // 创建敌人
    this.createEnemies();
    this.createFireEnemies();

    // 创建终点城堡
    this.createEndCastle();

    // 设置碰撞
    this.setupCollisions();

    // 创建控制器
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    this.fKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // 创建触摸控制（移动端）
    this.touchControls = createStandardControls(this);

    // 监听秘籍输入（使用通用模块）
    setupCheatListener(this, (code) => {
      if (code === CHEAT_CODES.INVINCIBILITY && !this.isInvincible && !this.gameOver && !this.gameWon) {
        console.log('Invincibility Shield activated!');
        this.activateInvincibility();
      }
    });

    // 创建UI
    this.createUI();

    // 相机跟随
    this.cameras.main.setBounds(0, 0, 3200, 600);
    this.cameras.main.startFollow(this.player, true, 0.1, 0);

    // 开始自动滚动
    this.time.addEvent({
      delay: 100,
      callback: this.updateScroll,
      callbackScope: this,
      loop: true
    });

    // 监听返回菜单
    this.input.keyboard!.on('keydown-ESC', () => {
      getSoundManager().stopBackgroundMusic();
      this.scene.start('MenuScene');
    });
  }

  private restartGame() {
    // 清除所有游戏对象
    if (this.platforms) {
      this.platforms.clear(true, true);
    }
    if (this.enemies) {
      this.enemies.clear(true, true);
    }
    if (this.fireEnemies) {
      this.fireEnemies.clear(true, true);
    }
    if (this.fireballs) {
      this.fireballs.clear(true, true);
    }

    // 清除UI
    if (this.scoreText) this.scoreText.destroy();
    if (this.livesText) this.livesText.destroy();

    // 清除护盾
    this.shieldGraphics.forEach(shield => shield.destroy());
    this.shieldGraphics = [];

    // 清除所有graphics和text对象（游戏结束/胜利画面）
    this.children.list.forEach((child: any) => {
      if (child.type === 'Graphics' || child.type === 'Text') {
        if (child.scrollFactorX === 0 && child.scrollFactorY === 0) {
          child.destroy();
        }
      }
    });

    // 重置状态变量
    this.score = 0;
    this.lives = 3;
    this.gameOver = false;
    this.gameWon = false;
    this.scrollSpeed = 200;
    this.platformQueue = [];
    this.lastPlatformX = 0;
    this.distanceTraveled = 0;
    this.isInvincible = false;

    // 恢复物理引擎
    this.physics.resume();

    // 重新开始游戏
    this.startGame();
  }

  private createPixelAssets() {
    // 创建平台纹理（石头材质）
    const platformGraphics = this.add.graphics();
    platformGraphics.fillStyle(0x4a4a4a, 1);
    platformGraphics.fillRect(0, 0, 64, 16);
    platformGraphics.fillStyle(0x5a5a5a, 1);
    platformGraphics.fillRect(0, 0, 64, 4);
    platformGraphics.generateTexture('platform', 64, 16);
    platformGraphics.destroy();

    // 创建地面纹理（巨石材质）
    const groundGraphics = this.add.graphics();
    // 深灰色石头基底
    groundGraphics.fillStyle(0x4a4a4a, 1);
    groundGraphics.fillRect(0, 0, 200, 32);
    // 石头顶部（浅灰）
    groundGraphics.fillStyle(0x6a6a6a, 1);
    groundGraphics.fillRect(0, 0, 200, 8);
    // 石头裂纹和细节
    groundGraphics.fillStyle(0x3a3a3a, 1);
    for (let i = 0; i < 200; i += 25) {
      groundGraphics.fillRect(i + 10, 5, 2, 20);
      groundGraphics.fillRect(i, 15, 15, 2);
    }
    // 高光效果
    groundGraphics.fillStyle(0x7a7a7a, 0.5);
    for (let i = 0; i < 200; i += 40) {
      groundGraphics.fillRect(i, 2, 8, 3);
    }
    groundGraphics.generateTexture('ground_segment', 200, 32);
    groundGraphics.destroy();

    // 创建障碍物纹理（尖刺）
    const spikeGraphics = this.add.graphics();
    spikeGraphics.fillStyle(0x666666, 1);
    spikeGraphics.fillTriangle(0, 20, 10, 0, 20, 20);
    spikeGraphics.fillTriangle(20, 20, 30, 0, 40, 20);
    spikeGraphics.generateTexture('spike', 40, 20);
    spikeGraphics.destroy();

    // 使用通用模块创建敌人纹理
    createEnemyTextures(this);
  }

  private createScrollingBackground() {
    // 傍晚天空渐变（橙紫色）
    const bgGraphics = this.add.graphics();
    for (let i = 0; i < 600; i += 20) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor('#ff6b35'), // 橙色
        Phaser.Display.Color.ValueToColor('#2d1b3d'), // 深紫色
        600,
        i
      );
      const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      bgGraphics.fillStyle(hexColor, 1);
      bgGraphics.fillRect(0, i, 1200, 20);
    }
    bgGraphics.setScrollFactor(0);

    // 添加暗色云朵（傍晚效果）
    for (let i = 0; i < 8; i++) {
      const cloud = this.add.graphics();
      cloud.fillStyle(0x4a3050, 0.6);
      const x = i * 200 + Phaser.Math.Between(0, 150);
      const y = Phaser.Math.Between(40, 120);
      cloud.fillCircle(x, y, 12);
      cloud.fillCircle(x + 15, y, 16);
      cloud.fillCircle(x + 30, y, 12);
      cloud.setScrollFactor(0.2);
    }

    // 添加古堡剪影背景
    const castles = this.add.graphics();
    castles.fillStyle(0x1a1a2e, 0.8);
    for (let i = 0; i < 3; i++) {
      const x = i * 500;
      // 古堡主体
      castles.fillRect(x + 100, 450, 80, 120);
      castles.fillRect(x + 140, 480, 40, 90);
      // 塔楼
      castles.fillRect(x + 90, 420, 20, 150);
      castles.fillRect(x + 180, 430, 20, 140);
      // 尖顶
      castles.fillTriangle(x + 100, 420, x + 80, 380, x + 120, 380);
      castles.fillTriangle(x + 190, 430, x + 170, 390, x + 210, 390);
      // 窗户（发光）
      castles.fillStyle(0xffaa00, 0.6);
      castles.fillRect(x + 115, 480, 10, 12);
      castles.fillRect(x + 155, 480, 10, 12);
      castles.fillRect(x + 115, 510, 10, 12);
      castles.fillStyle(0x1a1a2e, 0.8);
    }
    castles.setScrollFactor(0.4);

    // 添加巨石剪影（中景）
    const rocks = this.add.graphics();
    rocks.fillStyle(0x2a2a3e, 1);
    for (let i = 0; i < 6; i++) {
      const x = i * 250 + Phaser.Math.Between(-30, 30);
      const height = Phaser.Math.Between(60, 120);
      rocks.beginPath();
      rocks.moveTo(x, 570);
      rocks.lineTo(x + 40, 570 - height);
      rocks.lineTo(x + 80, 570 - height + 20);
      rocks.lineTo(x + 100, 570);
      rocks.closePath();
      rocks.fillPath();
    }
    rocks.setScrollFactor(0.6);
  }

  private createInitialPlatforms() {
    // 创建初始的连续地面（适应更小的世界）
    this.lastPlatformX = 0;
    for (let i = 0; i < 5; i++) {
      this.addPlatform(i * 200, 568, 200, false);
    }

    // 开始生成有间隙的平台
    for (let i = 5; i < 8; i++) {
      const hasGap = Math.random() > 0.5; // 50%概率有间隙
      if (!hasGap) {
        this.addPlatform(i * 200, 568, 200, false);
      } else {
        // 有间隙时，跳过一段距离
        i++;
      }
    }
  }

  private addPlatform(x: number, y: number, width: number, deadly: boolean) {
    const platform = this.platforms.create(x + width / 2, y, 'ground_segment');
    platform.setDisplaySize(width, 32);
    platform.refreshBody();
    platform.deadly = deadly;
    this.platformQueue.push({ sprite: platform, x: x });
    this.lastPlatformX = x + width;
  }

  private updateScroll() {
    if (this.gameOver || this.isInSelectionMode || this.gameWon) return;

    this.distanceTraveled += this.scrollSpeed / 10;
    
    // 更新分数
    this.score = Math.floor(this.distanceTraveled / 10);
    this.scoreText.setText(`距离: ${this.score}m`);

    // 检查是否到达终点城堡
    if (this.player && this.player.x >= 3050) {
      this.showVictory();
      return;
    }
    if (this.player2 && this.player2.x >= 3050) {
      this.showVictory();
      return;
    }

    // 增加难度
    if (this.scrollSpeed < 400) {
      this.scrollSpeed += 0.1;
    }

    // 检查并移除屏幕外的平台
    this.platformQueue.forEach((platformData, index) => {
      if (platformData.sprite.x < this.cameras.main.scrollX - 100) {
        platformData.sprite.destroy();
        this.platformQueue.splice(index, 1);
      }
    });

    // 生成新平台
    const cameraRight = this.cameras.main.scrollX + 800;
    if (this.lastPlatformX < cameraRight + 400) {
      const hasGap = Math.random() > 0.5; // 50%概率有间隙
      if (!hasGap) {
        const width = Phaser.Math.Between(150, 250);
        this.addPlatform(this.lastPlatformX, 568, width, false);
      } else {
        // 创建间隙（深坑）- 减小宽度使其可跳跃
        const gapWidth = Phaser.Math.Between(50, 100);
        this.lastPlatformX += gapWidth;
        
        // 间隙后的平台
        const width = Phaser.Math.Between(150, 250);
        this.addPlatform(this.lastPlatformX, 568, width, false);
      }
    }

    // 检查玩家是否掉入深坑
    if (this.player && this.player.y > 650) {
      this.loseLife();
    }
    if (this.player2 && this.player2.y > 650) {
      this.loseLife();
    }
  }

  private createSelectedPlayers() {
    const char1 = this.characterOptions.find(c => c.id === this.selectedCharacters[0]);
    
    if (this.playerCount === 1) {
      // 单人模式
      this.player = this.physics.add.sprite(200, 400, char1!.texture);
      this.player.setBounce(0);
      this.player.setCollideWorldBounds(false);
      this.player.setScale(2);
      this.player2 = null;
    } else {
      // 双人模式
      const char2 = this.characterOptions.find(c => c.id === this.selectedCharacters[1]);
      if (!char1 || !char2) {
        console.error('角色未找到', this.selectedCharacters);
        return;
      }
      this.player = this.physics.add.sprite(200, 400, char1.texture);
      this.player.setBounce(0);
      this.player.setCollideWorldBounds(false);
      this.player.setScale(2);

      this.player2 = this.physics.add.sprite(250, 400, char2.texture);
      this.player2.setBounce(0);
      this.player2.setCollideWorldBounds(false);
      this.player2.setScale(2);
    }
  }

  private setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    if (this.player2) {
      this.physics.add.collider(this.player2, this.platforms);
    }

    // 敌人与平台碰撞
    this.physics.add.collider(this.enemies, this.platforms);

    // 火球与平台碰撞（直接销毁）
    this.physics.add.collider(this.fireballs, this.platforms, (fireball: any) => {
      fireball.destroy();
    });

    // 玩家1与敌人碰撞
    this.physics.add.collider(
      this.player,
      this.enemies,
      this.hitEnemy as any,
      undefined,
      this
    );

    // 玩家1与火龙碰撞
    this.physics.add.overlap(
      this.player,
      this.fireEnemies,
      this.hitFireEnemy as any,
      undefined,
      this
    );

    // 玩家1与火球碰撞
    this.physics.add.overlap(
      this.player,
      this.fireballs,
      this.hitByFireball as any,
      undefined,
      this
    );

    // 玩家2的碰撞
    if (this.player2) {
      this.physics.add.collider(
        this.player2,
        this.enemies,
        this.hitEnemy as any,
        undefined,
        this
      );

      this.physics.add.overlap(
        this.player2,
        this.fireEnemies,
        this.hitFireEnemy as any,
        undefined,
        this
      );

      this.physics.add.overlap(
        this.player2,
        this.fireballs,
        this.hitByFireball as any,
        undefined,
        this
      );
    }
  }

  update() {
    if (this.gameOver || this.isInSelectionMode || this.gameWon) return;

    // 更新光盾位置
    if (this.isInvincible && this.shieldGraphics.length > 0) {
      const activePlayers: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
      if (this.player) activePlayers.push(this.player);
      if (this.player2) activePlayers.push(this.player2);

      activePlayers.forEach((player, index) => {
        if (this.shieldGraphics[index]) {
          this.shieldGraphics[index].setPosition(player.x, player.y);
        }
      });
    }

    // 玩家1控制（方向键 + 触摸摇杆）
    if (this.player && this.player.body) {
      // 玩家自动向前移动（相对于世界）
      const minX = this.cameras.main.scrollX + 50;
      if (this.player.x < minX) {
        this.player.x = minX;
      }

      // 左右移动 - 键盘 + 触摸摇杆
      let moveX = 0;
      if (this.cursors.left.isDown) {
        moveX = -1;
      } else if (this.cursors.right.isDown) {
        moveX = 1;
      }
      
      // 触摸摇杆输入（优先级更高）
      const joystickX = this.touchControls.getJoystickX();
      if (Math.abs(joystickX) > 0.2) {
        moveX = joystickX;
      }
      
      if (moveX !== 0) {
        this.player.setVelocityX(moveX * 150);
      } else {
        this.player.setVelocityX(0);
      }

      // 跳跃 - 键盘 + 触摸按钮
      const touchJump = this.touchControls.isButtonPressed('jump');
      if ((this.cursors.up.isDown || touchJump) && this.player.body.touching.down) {
        this.player.setVelocityY(-450);
        getSoundManager().playJump();
      }

      // 飞行（长按F键 + 触摸飞行按钮）
      const touchFly = this.touchControls.isButtonPressed('fly');
      if (this.fKey.isDown || touchFly) {
        this.player.setVelocityY(-300);
      }
    }

    // 玩家2控制（WASD）
    if (this.player2 && this.player2.body) {
      const minX = this.cameras.main.scrollX + 50;
      if (this.player2.x < minX) {
        this.player2.x = minX;
      }

      if (this.wasdKeys.left.isDown) {
        this.player2.setVelocityX(-150);
      } else if (this.wasdKeys.right.isDown) {
        this.player2.setVelocityX(150);
      } else {
        this.player2.setVelocityX(0);
      }

      if (this.wasdKeys.up.isDown && this.player2.body.touching.down) {
        this.player2.setVelocityY(-450);
      }

      // 飞行（长按F键）
      if (this.fKey.isDown) {
        this.player2.setVelocityY(-300);
      }
    }

    // 敌人移动
    this.enemies.children.entries.forEach((enemy: any) => {
      if (enemy.body.velocity.x === 0) {
        enemy.body.velocity.x = enemy.direction * 50;
      }

      // 到达边界反向
      if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) {
        enemy.direction *= -1;
        enemy.body.velocity.x = enemy.direction * 50;
        enemy.flipX = !enemy.flipX;
      }
    });

    // 喷火敌人悬浮效果
    this.fireEnemies.children.entries.forEach((enemy: any) => {
      // 上下浮动
      if (!enemy.floatDirection) {
        enemy.floatDirection = 1;
        enemy.originalY = enemy.y;
      }
      
      if (enemy.y >= enemy.originalY + 20) {
        enemy.floatDirection = -1;
      } else if (enemy.y <= enemy.originalY - 20) {
        enemy.floatDirection = 1;
      }
      
      enemy.setVelocityY(enemy.floatDirection * 30);
    });

    // 清理屏幕外的火球
    this.fireballs.children.entries.forEach((fireball: any) => {
      if (fireball.x < -200 || fireball.x > 3400 || fireball.y < -200 || fireball.y > 800) {
        fireball.destroy();
      }
    });
  }

  private loseLife() {
    if (this.gameOver || this.isInvincible) return;

    this.lives -= 1;
    this.updateLivesText();

    if (this.lives <= 0) {
      this.endGame();
    } else {
      // 重置玩家位置
      if (this.player) {
        this.player.setPosition(this.cameras.main.scrollX + 200, 400);
        this.player.setVelocity(0, 0);
      }
      if (this.player2) {
        this.player2.setPosition(this.cameras.main.scrollX + 250, 400);
        this.player2.setVelocity(0, 0);
      }
    }
  }

  private updateLivesText() {
    const hearts = '❤️'.repeat(this.lives);
    this.livesText.setText(`生命: ${hearts}`);
  }

  private endGame() {
    this.gameOver = true;
    this.physics.pause();
    getSoundManager().stopBackgroundMusic();
    getSoundManager().playGameOver();

    // 游戏结束画面
    const gameOverBg = this.add.graphics();
    gameOverBg.fillStyle(0x000000, 0.7);
    gameOverBg.fillRect(0, 0, 800, 600);
    gameOverBg.setScrollFactor(0);

    void this.add.text(400, 200, '游戏结束', {
      ...TEXT_STYLES.TITLE_LARGE,
      fontSize: '64px',
      color: '#ff0000',
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0);

    void this.add.text(400, 280, `最终距离: ${this.score}m`, {
      ...TEXT_STYLES.TITLE_MEDIUM
    }).setOrigin(0.5).setScrollFactor(0);

    void this.add.text(400, 360, '按 R 重新开始', {
      ...TEXT_STYLES.SUBTITLE,
      color: '#00ff00'
    }).setOrigin(0.5).setScrollFactor(0);

    void this.add.text(400, 400, '按 ESC 返回菜单', {
      ...TEXT_STYLES.SUBTITLE
    }).setOrigin(0.5).setScrollFactor(0);

    // 重新开始
    this.input.keyboard!.once('keydown-R', () => {
      this.restartGame();
    });
  }

  private showVictory() {
    this.gameWon = true;
    this.physics.pause();
    getSoundManager().stopBackgroundMusic();
    getSoundManager().playVictory();

    // 胜利画面
    const victoryBg = this.add.graphics();
    victoryBg.fillStyle(0x000000, 0.7);
    victoryBg.fillRect(0, 0, 800, 600);
    victoryBg.setScrollFactor(0);

    // 胜利文字
    void this.add.text(400, 150, '🏰 胜利！', {
      ...TEXT_STYLES.TITLE_LARGE,
      fontSize: '72px',
      color: '#ffd700',
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0);

    void this.add.text(400, 250, '成功到达古堡！', {
      ...TEXT_STYLES.TITLE_MEDIUM,
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0);

    void this.add.text(400, 320, `最终距离: ${this.score}m`, {
      ...TEXT_STYLES.TITLE_SMALL,
      color: '#00ff00'
    }).setOrigin(0.5).setScrollFactor(0);

    void this.add.text(400, 400, '按 R 再玩一次', {
      ...TEXT_STYLES.SUBTITLE,
      color: '#00ff00'
    }).setOrigin(0.5).setScrollFactor(0);

    void this.add.text(400, 440, '按 ESC 返回菜单', {
      ...TEXT_STYLES.SUBTITLE
    }).setOrigin(0.5).setScrollFactor(0);

    // 闪烁效果
    const victoryText = this.add.text(400, 500, '★ 完美通关 ★', {
      ...TEXT_STYLES.TITLE_MEDIUM,
      color: '#ff6b35',
      fontStyle: 'bold'
    }).setOrigin(0.5).setScrollFactor(0);

    this.tweens.add({
      targets: victoryText,
      alpha: 0.3,
      duration: 800,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });

    // 重新开始
    this.input.keyboard!.once('keydown-R', () => {
      this.restartGame();
    });
  }

  private createUI() {
    this.scoreText = this.add.text(16, 16, '距离: 0m', {
      ...TEXT_STYLES.HUD
    }).setScrollFactor(0).setDepth(100);

    this.livesText = this.add.text(16, 50, 'Lives: ❤️❤️❤️', {
      ...TEXT_STYLES.HUD
    }).setScrollFactor(0).setDepth(100);
    this.updateLivesText();

    // 控制提示
    let controlsText = '';
    const char1 = this.characterOptions.find(c => c.id === this.selectedCharacters[0]);
    const char2 = this.playerCount === 2 ? this.characterOptions.find(c => c.id === this.selectedCharacters[1]) : null;
    
    if (this.playerCount === 1) {
      controlsText = `${char1?.name}: 方向键左右移动/↑跳跃`;
    } else {
      controlsText = `P1(${char1?.name}): 方向键 | P2(${char2?.name}): WASD`;
    }

    this.add.text(400, 16, controlsText, {
      ...TEXT_STYLES.SMALL,
      strokeThickness: 3
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // 返回菜单按钮
    const backButton = this.add.text(780, 16, '⬅ 菜单', {
      ...TEXT_STYLES.BODY,
      backgroundColor: '#ff6b6b',
      padding: { x: 12, y: 6 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setInteractive();

    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#ff5252' });
    });

    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#ff6b6b' });
    });

    backButton.on('pointerdown', () => {
      getSoundManager().stopBackgroundMusic();
      this.scene.start('MenuScene');
    });
  }

  // 标题画面和角色选择（复用CoinChaserScene的逻辑）
  private showTitleScreen() {
    const titleText = this.add.text(400, 150, '🏰 古堡逃亡', {
      ...TEXT_STYLES.TITLE_LARGE,
      fontSize: '72px',
      color: '#ff6b35',
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    const subtitleText = this.add.text(400, 230, 'Castle Escape', {
      ...TEXT_STYLES.TITLE_MEDIUM,
      color: '#c99fff'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    const continueText = this.add.text(400, 400, '按任意键开始', {
      ...TEXT_STYLES.TITLE_SMALL,
      color: '#00ff00'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.selectionUI.push(titleText as any, subtitleText as any, continueText as any);

    // 定义继续游戏的处理函数
    const handleContinue = () => {
      this.clearSelectionUI();
      // 延迟显示选择界面，确保当前点击事件完全结束
      this.time.delayedCall(50, () => {
        this.showPlayerCountSelection();
      });
    };

    // 监听任意键
    this.input.keyboard!.once('keydown', handleContinue);
    
    // 监听鼠标点击和触摸事件
    this.input.once('pointerdown', handleContinue);
  }

  private showPlayerCountSelection() {
    const titleText = this.add.text(400, 120, '选择玩家数量', {
      ...TEXT_STYLES.TITLE_LARGE,
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.selectionUI.push(titleText as any);

    const options = [
      { count: 1, label: '单人', icon: '👤', y: 260 },
      { count: 2, label: '双人', icon: '👥', y: 400 }
    ];

    options.forEach(option => {
      const card = this.add.container(400, option.y).setDepth(200).setScrollFactor(0);

      const bg = this.add.graphics();
      bg.fillStyle(0x2c3e50, 1);
      bg.fillRoundedRect(-150, -50, 300, 100, 15);
      bg.lineStyle(3, 0xff6b35, 1);
      bg.strokeRoundedRect(-150, -50, 300, 100, 15);

      const icon = this.add.text(-100, 0, option.icon, {
        fontSize: '48px'
      }).setOrigin(0.5);

      const label = this.add.text(20, 0, option.label, {
        ...TEXT_STYLES.TITLE_MEDIUM
      }).setOrigin(0, 0.5);

      card.add([bg, icon, label]);
      card.setInteractive(new Phaser.Geom.Rectangle(-150, -50, 300, 100), Phaser.Geom.Rectangle.Contains);

      card.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x4a3050, 1);
        bg.fillRoundedRect(-150, -50, 300, 100, 15);
        bg.lineStyle(3, 0xff6b35, 1);
        bg.strokeRoundedRect(-150, -50, 300, 100, 15);
        this.game.canvas.style.cursor = 'pointer';
      });

      card.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x2c3e50, 1);
        bg.fillRoundedRect(-150, -50, 300, 100, 15);
        bg.lineStyle(3, 0xff6b35, 1);
        bg.strokeRoundedRect(-150, -50, 300, 100, 15);
        this.game.canvas.style.cursor = 'default';
      });

      card.on('pointerdown', () => {
        this.playerCount = option.count;
        this.clearSelectionUI();
        this.showCharacterSelection();
      });

      this.selectionUI.push(card as any);
    });
  }

  private showCharacterSelection() {
    this.selectedCharacters = [];

    const updateUI = () => {
      this.clearSelectionUI();

      const titleText = this.add.text(400, 80, `选择角色 (${this.selectedCharacters.length}/${this.playerCount})`, {
        ...TEXT_STYLES.TITLE_LARGE,
        fontSize: '42px',
        strokeThickness: 6
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

      this.selectionUI.push(titleText as any);

      const startX = 400 - (this.characterOptions.length - 1) * 130;
      this.characterOptions.forEach((char, index) => {
        const x = startX + index * 260;
        const y = 300;
        const isSelected = this.selectedCharacters.includes(char.id);
        const isDisabled = !isSelected && this.selectedCharacters.length >= this.playerCount;

        const card = this.add.container(x, y).setDepth(200).setScrollFactor(0);

        const bg = this.add.graphics();
        if (isSelected) {
          bg.fillStyle(0x27ae60, 1);
          bg.lineStyle(4, 0x2ecc71, 1);
        } else if (isDisabled) {
          bg.fillStyle(0x555555, 0.5);
          bg.lineStyle(3, 0x777777, 1);
        } else {
          bg.fillStyle(0x2c3e50, 1);
          bg.lineStyle(3, 0xff6b35, 1);
        }
        bg.fillRoundedRect(-90, -140, 180, 280, 15);
        bg.strokeRoundedRect(-90, -140, 180, 280, 15);

        const sprite = this.add.sprite(0, -60, char.texture).setScale(4);
        if (isDisabled) sprite.setAlpha(0.3);

        const name = this.add.text(0, 20, char.name, {
          ...TEXT_STYLES.TITLE_SMALL,
          color: isDisabled ? '#888888' : char.color,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        const desc = this.add.text(0, 80, char.description, {
          ...TEXT_STYLES.SMALL,
          fontSize: '14px',
          color: isDisabled ? '#666666' : '#ffffff',
          align: 'center',
          wordWrap: { width: 160 }
        }).setOrigin(0.5);

        let checkMark: Phaser.GameObjects.Text | null = null;
        if (isSelected) {
          checkMark = this.add.text(0, -120, '✓', {
            fontSize: '36px',
            color: '#ffffff'
          }).setOrigin(0.5);
        }

        card.add([bg, sprite, name, desc]);
        if (checkMark) card.add(checkMark);

        if (!isDisabled) {
          card.setInteractive(new Phaser.Geom.Rectangle(-90, -140, 180, 280), Phaser.Geom.Rectangle.Contains);

          card.on('pointerover', () => {
            if (!isSelected) {
              bg.clear();
              bg.fillStyle(0xff6b35, 1);
              bg.lineStyle(3, 0xff8c52, 1);
              bg.fillRoundedRect(-90, -140, 180, 280, 15);
              bg.strokeRoundedRect(-90, -140, 180, 280, 15);
            }
            this.game.canvas.style.cursor = 'pointer';
          });

          card.on('pointerout', () => {
            if (!isSelected) {
              bg.clear();
              bg.fillStyle(0x2c3e50, 1);
              bg.lineStyle(3, 0xff6b35, 1);
              bg.fillRoundedRect(-90, -140, 180, 280, 15);
              bg.strokeRoundedRect(-90, -140, 180, 280, 15);
            }
            this.game.canvas.style.cursor = 'default';
          });

          card.on('pointerdown', () => {
            if (isSelected) {
              const idx = this.selectedCharacters.indexOf(char.id);
              if (idx > -1) this.selectedCharacters.splice(idx, 1);
            } else {
              this.selectedCharacters.push(char.id);
            }
            updateUI();
          });
        }

        this.selectionUI.push(card as any);
      });

      if (this.selectedCharacters.length === this.playerCount) {
        const startButton = this.add.container(400, 500).setDepth(200).setScrollFactor(0);

        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x27ae60, 1);
        buttonBg.fillRoundedRect(-100, -30, 200, 60, 10);
        buttonBg.lineStyle(3, 0x2ecc71, 1);
        buttonBg.strokeRoundedRect(-100, -30, 200, 60, 10);

        const buttonText = this.add.text(0, 0, '开始游戏', {
          ...TEXT_STYLES.TITLE_SMALL,
          fontStyle: 'bold'
        }).setOrigin(0.5);

        startButton.add([buttonBg, buttonText]);
        startButton.setInteractive(new Phaser.Geom.Rectangle(-100, -30, 200, 60), Phaser.Geom.Rectangle.Contains);

        startButton.on('pointerover', () => {
          buttonBg.clear();
          buttonBg.fillStyle(0x2ecc71, 1);
          buttonBg.fillRoundedRect(-100, -30, 200, 60, 10);
          buttonBg.lineStyle(3, 0x27ae60, 1);
          buttonBg.strokeRoundedRect(-100, -30, 200, 60, 10);
          this.game.canvas.style.cursor = 'pointer';
        });

        startButton.on('pointerout', () => {
          buttonBg.clear();
          buttonBg.fillStyle(0x27ae60, 1);
          buttonBg.fillRoundedRect(-100, -30, 200, 60, 10);
          buttonBg.lineStyle(3, 0x2ecc71, 1);
          buttonBg.strokeRoundedRect(-100, -30, 200, 60, 10);
          this.game.canvas.style.cursor = 'default';
        });

        startButton.on('pointerdown', () => {
          this.clearSelectionUI();
          this.isInSelectionMode = false;
          this.startGame();
        });

        this.selectionUI.push(startButton as any);
      }
    };

    updateUI();
  }

  private createEnemies() {
    this.enemies = this.physics.add.group();

    // 在不同位置创建蘑菇怪敌人（分布在3200宽度的世界中）
    const enemyPositions = [
      { x: 600, y: 500, minX: 500, maxX: 700 },
      { x: 1000, y: 450, minX: 900, maxX: 1100 },
      { x: 1400, y: 500, minX: 1300, maxX: 1500 },
      { x: 1800, y: 480, minX: 1700, maxX: 1900 },
      { x: 2200, y: 500, minX: 2100, maxX: 2300 },
      { x: 2600, y: 470, minX: 2500, maxX: 2700 },
      { x: 3000, y: 500, minX: 2900, maxX: 3100 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.minX = pos.minX;
      enemy.maxX = pos.maxX;
      enemy.direction = 1;
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
      enemy.setScale(2);
    });
  }

  private createFireEnemies() {
    this.fireEnemies = this.physics.add.group();
    this.fireballs = this.physics.add.group();

    // 在不同位置创建火龙敌人（悬浮在空中）
    const fireEnemyPositions = [
      { x: 800, y: 300 },
      { x: 1200, y: 250 },
      { x: 1600, y: 280 },
      { x: 2000, y: 320 },
      { x: 2400, y: 270 },
      { x: 2800, y: 300 }
    ];

    fireEnemyPositions.forEach(pos => {
      const fireEnemy = this.fireEnemies.create(pos.x, pos.y, 'fireEnemy');
      fireEnemy.setCollideWorldBounds(true);
      fireEnemy.setBounce(1);
      fireEnemy.setGravityY(-800); // 抵消重力，悬浮在空中
      fireEnemy.setScale(2);
    });

    // 定期喷火
    this.time.addEvent({
      delay: 2000,
      callback: this.shootFireballs,
      callbackScope: this,
      loop: true
    });
  }

  private createEndCastle() {
    // 在世界尽头 (3200) 创建终点城堡
    const castleX = 3100;
    const castleY = 400;

    // 创建一个大型城堡图形
    const castle = this.add.graphics();
    
    // 城堡主体
    castle.fillStyle(0x4a4a4a, 1);
    castle.fillRect(castleX, castleY, 120, 160);
    
    // 城堡塔楼（左）
    castle.fillStyle(0x5a5a5a, 1);
    castle.fillRect(castleX - 20, castleY - 30, 40, 190);
    castle.fillTriangle(
      castleX - 20, castleY - 30,
      castleX, castleY - 60,
      castleX + 20, castleY - 30
    );
    
    // 城堡塔楼（右）
    castle.fillRect(castleX + 100, castleY - 30, 40, 190);
    castle.fillTriangle(
      castleX + 100, castleY - 30,
      castleX + 120, castleY - 60,
      castleX + 140, castleY - 30
    );
    
    // 主塔尖
    castle.fillStyle(0x6a6a6a, 1);
    castle.fillTriangle(
      castleX + 20, castleY,
      castleX + 60, castleY - 80,
      castleX + 100, castleY
    );
    
    // 城门
    castle.fillStyle(0x2a2a2a, 1);
    castle.fillRect(castleX + 40, castleY + 100, 40, 60);
    
    // 窗户（发光效果）
    castle.fillStyle(0xffaa00, 0.8);
    castle.fillRect(castleX + 30, castleY + 40, 15, 20);
    castle.fillRect(castleX + 75, castleY + 40, 15, 20);
    castle.fillRect(castleX + 52, castleY + 20, 16, 22);
    
    // 旗帜
    castle.fillStyle(0xff6b35, 1);
    castle.fillTriangle(
      castleX + 60, castleY - 80,
      castleX + 60, castleY - 60,
      castleX + 80, castleY - 70
    );
    
    // 城堡地基（平台）
    const castlePlatform = this.platforms.create(castleX + 60, 568, 'ground_segment');
    castlePlatform.setDisplaySize(200, 32);
    castlePlatform.refreshBody();
  }

  private shootFireballs() {
    if (this.gameOver || this.gameWon) return;

    this.fireEnemies.children.entries.forEach((enemy: any) => {
      if (enemy.active) {
        // 向玩家1发射火球
        if (this.player) {
          const angleTo1 = Phaser.Math.Angle.Between(
            enemy.x,
            enemy.y,
            this.player.x,
            this.player.y
          );
          
          const fireball1 = this.fireballs.create(enemy.x, enemy.y, 'fireball');
          fireball1.setVelocity(
            Math.cos(angleTo1) * 150,
            Math.sin(angleTo1) * 150
          );
          fireball1.setScale(1.5);
        }

        // 如果玩家2存在且距离较近，也向玩家2发射
        if (this.player2) {
          const distanceTo2 = Phaser.Math.Distance.Between(
            enemy.x,
            enemy.y,
            this.player2.x,
            this.player2.y
          );
          
          if (distanceTo2 < 400) {
            const angleTo2 = Phaser.Math.Angle.Between(
              enemy.x,
              enemy.y,
              this.player2.x,
              this.player2.y
            );
            
            const fireball2 = this.fireballs.create(enemy.x, enemy.y, 'fireball');
            fireball2.setVelocity(
              Math.cos(angleTo2) * 150,
              Math.sin(angleTo2) * 150
            );
            fireball2.setScale(1.5);
          }
        }
      }
    });
  }

  private hitEnemy(
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    enemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  ) {
    // 如果无敌，直接消灭敌人
    if (this.isInvincible) {
      enemy.disableBody(true, true);
      this.score += 20;
      this.scoreText.setText('分数: ' + this.score);
      getSoundManager().playEnemyDefeat();
      return;
    }

    // 检查玩家是否从上方跳到敌人上
    if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
      // 踩到敌人，消灭敌人
      enemy.disableBody(true, true);
      player.setVelocityY(-300);
      this.score += 20;
      this.scoreText.setText('分数: ' + this.score);
      getSoundManager().playEnemyDefeat();
    } else {
      // 被敌人撞到
      getSoundManager().playHit();
      this.loseLife();
    }
  }

  private hitByFireball(
    _player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    fireball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  ) {
    fireball.destroy();
    if (!this.isInvincible) {
      this.loseLife();
    }
  }

  private hitFireEnemy(
    player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    fireEnemy: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  ) {
    // 如果无敌，直接消灭敌人
    if (this.isInvincible) {
      fireEnemy.disableBody(true, true);
      this.score += 50;
      this.scoreText.setText('分数: ' + this.score);
      return;
    }

    // 检查玩家是否从上方跳到敌人上
    if (player.body.velocity.y > 0 && player.y < fireEnemy.y - 5) {
      // 踩到喷火敌人，消灭敌人
      fireEnemy.disableBody(true, true);
      player.setVelocityY(-300);
      this.score += 50;
      this.scoreText.setText('分数: ' + this.score);
    } else {
      // 被喷火敌人撞到
      this.loseLife();
    }
  }

  private clearSelectionUI() {
    this.selectionUI.forEach(ui => ui.destroy());
    this.selectionUI = [];
  }

  private activateInvincibility() {
    this.isInvincible = true;
    getSoundManager().playPowerUp();

    // 为存在的玩家创建光盾
    const players: Array<{player: any, color: number}> = [];
    
    if (this.player) {
      const charData = this.characterOptions.find(c => c.id === this.selectedCharacters[0])!;
      players.push({ 
        player: this.player, 
        color: parseInt(charData.color.replace('#', '0x'))
      });
    }
    
    if (this.player2) {
      const charData = this.characterOptions.find(c => c.id === this.selectedCharacters[1])!;
      players.push({ 
        player: this.player2, 
        color: parseInt(charData.color.replace('#', '0x'))
      });
    }
    
    players.forEach(({player, color}) => {
      // 创建光盾效果
      const shield = this.add.graphics();
      shield.lineStyle(4, color, 0.6);
      shield.fillStyle(color, 0.15);
      
      // 绘制六边形光盾
      const radius = 35;
      const sides = 6;
      const angle = (Math.PI * 2) / sides;
      
      shield.beginPath();
      for (let i = 0; i < sides; i++) {
        const x = Math.cos(angle * i) * radius;
        const y = Math.sin(angle * i) * radius;
        if (i === 0) {
          shield.moveTo(x, y);
        } else {
          shield.lineTo(x, y);
        }
      }
      shield.closePath();
      shield.strokePath();
      shield.fillPath();
      
      shield.setPosition(player.x, player.y);
      shield.setDepth(player.depth - 1);
      
      this.shieldGraphics.push(shield);
      
      // 旋转动画
      this.tweens.add({
        targets: shield,
        angle: 360,
        duration: 3000,
        repeat: -1,
        ease: 'Linear'
      });
      
      // 闪烁动画
      this.tweens.add({
        targets: shield,
        alpha: 0.4,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    });

    // 显示提示
    const invincibilityText = this.add.text(400, 150, '✨ 无敌护盾启动! ✨', {
      ...TEXT_STYLES.TITLE_MEDIUM,
      color: '#ffd700',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

    this.tweens.add({
      targets: invincibilityText,
      alpha: 0,
      y: 100,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => {
        invincibilityText.destroy();
      }
    });

    // 15秒后移除无敌状态
    this.time.delayedCall(15000, () => {
      this.isInvincible = false;
      
      // 清理所有光盾
      this.shieldGraphics.forEach(shield => {
        if (shield) shield.destroy();
      });
      this.shieldGraphics = [];
      
      // 显示结束提示
      const endText = this.add.text(400, 150, '护盾结束', {
        ...TEXT_STYLES.SUBTITLE,
        color: '#ff6b6b'
      }).setOrigin(0.5).setScrollFactor(0).setDepth(1000);

      this.tweens.add({
        targets: endText,
        alpha: 0,
        y: 100,
        duration: 1500,
        ease: 'Power2',
        onComplete: () => {
          endText.destroy();
        }
      });
    });
  }
}
