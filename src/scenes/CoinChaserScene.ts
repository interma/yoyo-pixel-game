import Phaser from 'phaser';
import { CHARACTERS } from '../characters';
import type { CharacterConfig } from '../characters';
import { createAllCharacterTextures } from '../characters';

export default class CoinChaserScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private player2!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private fKey!: Phaser.Input.Keyboard.Key;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private movingPlatforms!: Phaser.Physics.Arcade.Group;
  private movingPlatformData: Array<{platform: any, minX: number, maxX: number, speed: number, lastX: number}> = [];
  private coins!: Phaser.Physics.Arcade.Group;
  private enemies!: Phaser.Physics.Arcade.Group;
  private fireEnemies!: Phaser.Physics.Arcade.Group;
  private fireballs!: Phaser.Physics.Arcade.Group;
  private score: number = 0;
  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private lives: number = 3;
  private player1Coins: number = 0;
  private player2Coins: number = 0;
  private gameOver: boolean = false;
  private gameWon: boolean = false;
  private cheatCodeInput: string = '';
  private isInvincible: boolean = false;
  private shieldGraphics: Phaser.GameObjects.Graphics[] = [];
  private lightningGraphics: Phaser.GameObjects.Graphics[] = [];
  private lightningTimers: Phaser.Time.TimerEvent[] = [];
  
  // 角色选择相关
  private isInSelectionMode: boolean = true;
  private playerCount: number = 2;
  private selectedCharacters: string[] = [];
  private selectionUI: Phaser.GameObjects.Container[] = [];
  private characterOptions: CharacterConfig[] = CHARACTERS;

  constructor() {
    super({ key: 'CoinChaserScene' });
  }

  preload() {
    // 由于我们没有外部图片资源，使用代码生成像素风格的图形
    this.createPixelAssets();
    // 创建所有角色纹理
    createAllCharacterTextures(this);
  }

  create() {
    // 创建索尼克风格渐变背景
    this.createSonicBackground();

    // 扩大世界边界，允许更高的跳跃空间
    this.physics.world.setBounds(0, 0, 800, 1200);

    // 显示标题画面
    this.showTitleScreen();
  }

  private startGame() {
    // 创建平台
    this.createPlatforms();

    // 根据选择创建玩家
    this.createSelectedPlayers();

    // 创建金币
    this.createCoins();

    // 创建敌人
    this.createEnemies();

    // 创建喷火敌人
    this.createFireEnemies();

    // 设置碰撞
    this.setupCollisions();

    // 创建控制器
    this.cursors = this.input.keyboard!.createCursorKeys();
    
    // 创建WASD控制器
    this.wasdKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 创建F键用于飞行
    this.fKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // 创建UI
    this.createUI();

    // 设置键盘事件
    this.setupKeyboardEvents();

    // 标记游戏已开始
    this.isInSelectionMode = false;
  }

  private setupKeyboardEvents() {
    // 添加跳跃音效替代（视觉反馈）
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.player && this.player.body.touching.down && !this.gameOver) {
        this.player.setVelocityY(-500);
      }
    });

    // 玩家2跳跃（Shift键）
    this.input.keyboard!.on('keydown-SHIFT', () => {
      if (this.player2 && this.player2.body.touching.down && !this.gameOver) {
        this.player2.setVelocityY(-500);
      }
    });

    // 监听秘籍输入
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      // 只记录数字键
      if (event.key >= '0' && event.key <= '9') {
        this.cheatCodeInput += event.key;
        // 只保留最后6位
        if (this.cheatCodeInput.length > 6) {
          this.cheatCodeInput = this.cheatCodeInput.slice(-6);
        }
        // 检查是否匹配秘籍
        if (this.cheatCodeInput === '131119' && !this.gameWon) {
          console.log('Cheat code activated!');
          this.showVictory();
          this.cheatCodeInput = ''; // 重置输入
        }
        // 无敌秘籍
        if (this.cheatCodeInput === '131120' && !this.isInvincible) {
          console.log('Invincibility activated!');
          this.activateInvincibility();
          this.cheatCodeInput = ''; // 重置输入
        }
      }
    });

    // ESC键返回菜单
    this.input.keyboard!.on('keydown-ESC', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  update() {
    // 选择模式下不执行游戏逻辑
    if (this.isInSelectionMode) {
      return;
    }

    if (this.gameOver || this.gameWon) {
      return;
    }

    // 更新光盾位置
    if (this.isInvincible && this.shieldGraphics.length > 0) {
      const activePlayers: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
      if (this.player) activePlayers.push(this.player);
      if (this.player2) activePlayers.push(this.player2);
      
      this.shieldGraphics.forEach((shield, index) => {
        if (shield && activePlayers[index]) {
          shield.setPosition(activePlayers[index].x, activePlayers[index].y);
        }
      });
      this.lightningGraphics.forEach((lightning, index) => {
        if (lightning && activePlayers[index]) {
          lightning.setPosition(activePlayers[index].x, activePlayers[index].y);
        }
      });
    }

    // 更新移动平台位置
    this.movingPlatformData.forEach(data => {
      const platform = data.platform;
      const body = platform.body as Phaser.Physics.Arcade.Body;
      
      // 如果平台到达边界，反转速度
      if (platform.x <= data.minX) {
        body.setVelocityX(data.speed);
      } else if (platform.x >= data.maxX) {
        body.setVelocityX(-data.speed);
      }
      
      // 如果速度为0（初始状态），设置初始速度
      if (body.velocity.x === 0) {
        body.setVelocityX(data.speed);
      }
      
      // 计算平台位移
      const deltaX = platform.x - data.lastX;
      data.lastX = platform.x;
      
      // 检测并移动平台上的物体
      if (Math.abs(deltaX) > 0.01) {
        const platformTop = platform.y - platform.displayHeight / 2;
        const platformLeft = platform.x - platform.displayWidth / 2;
        const platformRight = platform.x + platform.displayWidth / 2;
        
        // 移动玩家1
        if (this.player) {
          const p1Body = this.player.body as Phaser.Physics.Arcade.Body;
          if (p1Body.touching.down && 
              this.player.y <= platformTop + 5 && 
              this.player.x >= platformLeft - 10 && 
              this.player.x <= platformRight + 10) {
            this.player.x += deltaX;
          }
        }
        
        // 移动玩家2
        if (this.player2) {
          const p2Body = this.player2.body as Phaser.Physics.Arcade.Body;
          if (p2Body.touching.down && 
              this.player2.y <= platformTop + 5 && 
              this.player2.x >= platformLeft - 10 && 
              this.player2.x <= platformRight + 10) {
            this.player2.x += deltaX;
          }
        }
        
        // 移动金币
        this.coins.getChildren().forEach((coin: any) => {
          const coinBody = coin.body as Phaser.Physics.Arcade.Body;
          if (coinBody.touching.down && 
              coin.y <= platformTop + 5 && 
              coin.x >= platformLeft - 10 && 
              coin.x <= platformRight + 10) {
            coin.x += deltaX;
          }
        });
      }
    });

    // 玩家1移动（方向键）
    if (this.player) {
      if (this.cursors.left.isDown) {
        this.player.setVelocityX(-200);
        this.player.flipX = true;
      } else if (this.cursors.right.isDown) {
        this.player.setVelocityX(200);
        this.player.flipX = false;
      } else {
        this.player.setVelocityX(0);
      }

      // 玩家1跳跃
      if (this.cursors.up.isDown && this.player.body.touching.down) {
        this.player.setVelocityY(-500);
      }

      // 玩家1飞行（只有Sonic才能飞）
      if (this.selectedCharacters[0] === 'sonic' && this.fKey.isDown) {
        this.player.setVelocityY(-300);
      }
    }

    // 玩家2移动（WASD）
    if (this.player2) {
      if (this.wasdKeys.left.isDown) {
        this.player2.setVelocityX(-200);
        this.player2.flipX = true;
      } else if (this.wasdKeys.right.isDown) {
        this.player2.setVelocityX(200);
        this.player2.flipX = false;
      } else {
        this.player2.setVelocityX(0);
      }

      // 玩家2跳跃
      if (this.wasdKeys.up.isDown && this.player2.body.touching.down) {
        this.player2.setVelocityY(-500);
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
      if (fireball.x < 0 || fireball.x > 800 || fireball.y < -200 || fireball.y > 1200) {
        fireball.destroy();
      }
    });

    // 检查玩家是否掉出屏幕（扩大到世界底部）
    if (this.player && this.player.y > 1200) {
      this.loseLife();
    } else if (this.player2 && this.player2.y > 1200) {
      this.loseLife();
    }

    // 相机跟随玩家
    let centerX = 0;
    let centerY = 0;
    let playerCountForCamera = 0;

    if (this.player) {
      centerX += this.player.x;
      centerY += this.player.y;
      playerCountForCamera++;
    }

    if (this.player2) {
      centerX += this.player2.x;
      centerY += this.player2.y;
      playerCountForCamera++;
    }

    if (playerCountForCamera > 0) {
      centerX /= playerCountForCamera;
      centerY /= playerCountForCamera;
      
      this.cameras.main.scrollX = Phaser.Math.Linear(
        this.cameras.main.scrollX,
        centerX - 400,
        0.05
      );
      
      // 垂直方向只在玩家向上移动时才跟随，让玩家保持在屏幕下方
      const targetScrollY = Math.max(0, centerY - 450);
      this.cameras.main.scrollY = Phaser.Math.Linear(
        this.cameras.main.scrollY,
        targetScrollY,
        0.05
      );
    }
  }

  private createPixelAssets() {
    // 角色纹理已由 createAllCharacterTextures 创建

    // 创建平台纹理（索尼克风格 - 棕色平台）
    const platformGraphics = this.add.graphics();
    // 棕色基底
    platformGraphics.fillStyle(0x8b4513, 1);
    platformGraphics.fillRect(0, 0, 64, 16);
    // 顶部绿色草地
    platformGraphics.fillStyle(0x228b22, 1);
    platformGraphics.fillRect(0, 0, 64, 4);
    // 草地细节
    platformGraphics.fillStyle(0x32cd32, 1);
    for (let i = 0; i < 64; i += 6) {
      platformGraphics.fillRect(i, 0, 2, 3);
      platformGraphics.fillRect(i + 3, 1, 2, 2);
    }
    // 添加阴影
    platformGraphics.fillStyle(0x654321, 1);
    platformGraphics.fillRect(0, 14, 64, 2);
    platformGraphics.generateTexture('platform', 64, 16);
    platformGraphics.destroy();

    // 创建金币纹理
    const coinGraphics = this.add.graphics();
    coinGraphics.fillStyle(0xffff00, 1);
    coinGraphics.fillCircle(8, 8, 8);
    coinGraphics.fillStyle(0xffa500, 1);
    coinGraphics.fillCircle(8, 8, 4);
    coinGraphics.generateTexture('coin', 16, 16);
    coinGraphics.destroy();

    // 创建敌人纹理（蘑菇怪）
    const enemyGraphics = this.add.graphics();
    // 蘑菇帽
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(12, 8, 10);
    enemyGraphics.fillStyle(0xffffff, 1);
    enemyGraphics.fillCircle(8, 6, 3);
    enemyGraphics.fillCircle(16, 6, 3);
    // 蘑菇身体
    enemyGraphics.fillStyle(0xffe4b5, 1);
    enemyGraphics.fillRect(8, 12, 8, 8);
    // 眼睛
    enemyGraphics.fillStyle(0x000000, 1);
    enemyGraphics.fillRect(9, 14, 2, 2);
    enemyGraphics.fillRect(13, 14, 2, 2);
    enemyGraphics.generateTexture('enemy', 24, 24);
    enemyGraphics.destroy();

    // 创建喷火敌人纹理（火龙/飞龙）
    const fireEnemyGraphics = this.add.graphics();
    // 龙头（橙红色）
    fireEnemyGraphics.fillStyle(0xff4500, 1);
    fireEnemyGraphics.fillEllipse(12, 10, 14, 12);
    // 龙角
    fireEnemyGraphics.fillStyle(0x8b0000, 1);
    fireEnemyGraphics.fillTriangle(6, 8, 4, 4, 8, 6);
    fireEnemyGraphics.fillTriangle(18, 8, 20, 4, 16, 6);
    // 眼睛（黄色发光）
    fireEnemyGraphics.fillStyle(0xffff00, 1);
    fireEnemyGraphics.fillCircle(8, 9, 3);
    fireEnemyGraphics.fillCircle(16, 9, 3);
    fireEnemyGraphics.fillStyle(0xff0000, 1);
    fireEnemyGraphics.fillCircle(8, 9, 1);
    fireEnemyGraphics.fillCircle(16, 9, 1);
    // 鼻孔（喷火口）
    fireEnemyGraphics.fillStyle(0x000000, 1);
    fireEnemyGraphics.fillCircle(9, 13, 2);
    fireEnemyGraphics.fillCircle(15, 13, 2);
    // 翅膀
    fireEnemyGraphics.fillStyle(0xdc143c, 1);
    fireEnemyGraphics.fillTriangle(2, 10, 0, 6, 4, 12);
    fireEnemyGraphics.fillTriangle(22, 10, 24, 6, 20, 12);
    fireEnemyGraphics.generateTexture('fireEnemy', 24, 20);
    fireEnemyGraphics.destroy();

    // 创建火球纹理
    const fireballGraphics = this.add.graphics();
    // 火球核心
    fireballGraphics.fillStyle(0xffff00, 1);
    fireballGraphics.fillCircle(6, 6, 4);
    fireballGraphics.fillStyle(0xff4500, 1);
    fireballGraphics.fillCircle(6, 6, 5);
    fireballGraphics.fillStyle(0xff0000, 1);
    fireballGraphics.fillCircle(6, 6, 3);
    fireballGraphics.generateTexture('fireball', 12, 12);
    fireballGraphics.destroy();

    // 创建地面纹理（索尼克棋盘格风格）
    const groundGraphics = this.add.graphics();
    // 绿色和棕色相间的棋盘格
    const squareSize = 32;
    for (let x = 0; x < 800; x += squareSize) {
      for (let y = 0; y < 32; y += squareSize) {
        const isGreen = ((x / squareSize) + (y / squareSize)) % 2 === 0;
        groundGraphics.fillStyle(isGreen ? 0x228b22 : 0x8b4513, 1);
        groundGraphics.fillRect(x, y, squareSize, Math.min(squareSize, 32 - y));
      }
    }
    // 添加高光效果
    groundGraphics.fillStyle(0xffffff, 0.2);
    for (let x = 0; x < 800; x += squareSize * 2) {
      groundGraphics.fillRect(x, 0, squareSize, 32);
    }
    groundGraphics.generateTexture('ground', 800, 32);
    groundGraphics.destroy();
  }

  private createSonicBackground() {
    // 清除之前的背景颜色
    this.cameras.main.setBackgroundColor('#87ceeb');

    // 创建渐变背景（从浅蓝到深蓝）
    const bgGraphics = this.add.graphics();
    
    // 天空渐变
    for (let i = 0; i < 1200; i += 20) {
      const color = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor('#87ceeb'),
        Phaser.Display.Color.ValueToColor('#4a90e2'),
        1200,
        i
      );
      const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
      bgGraphics.fillStyle(hexColor, 1);
      bgGraphics.fillRect(0, i, 800, 20);
    }
    bgGraphics.setDepth(-100);
    bgGraphics.setScrollFactor(0);

    // 添加云朵
    const clouds = [
      { x: 100, y: 80 },
      { x: 300, y: 120 },
      { x: 600, y: 60 },
      { x: 450, y: 150 },
      { x: 700, y: 100 }
    ];

    clouds.forEach(cloud => {
      const cloudGraphics = this.add.graphics();
      cloudGraphics.fillStyle(0xffffff, 0.8);
      // 绘制像素风格的云朵
      cloudGraphics.fillCircle(cloud.x, cloud.y, 12);
      cloudGraphics.fillCircle(cloud.x + 15, cloud.y, 15);
      cloudGraphics.fillCircle(cloud.x + 30, cloud.y, 12);
      cloudGraphics.fillCircle(cloud.x + 15, cloud.y - 8, 10);
      cloudGraphics.setDepth(-90);
      cloudGraphics.setScrollFactor(0.3); // 视差效果
    });

    // 添加绿色山丘背景
    const hillGraphics = this.add.graphics();
    hillGraphics.fillStyle(0x32cd32, 1);
    
    // 绘制多个山丘
    const hills = [
      { x: 0, y: 400, width: 200, height: 150 },
      { x: 150, y: 420, width: 250, height: 130 },
      { x: 350, y: 390, width: 200, height: 160 },
      { x: 500, y: 410, width: 300, height: 140 }
    ];

    hills.forEach(hill => {
      hillGraphics.beginPath();
      hillGraphics.moveTo(hill.x, 600);
      hillGraphics.lineTo(hill.x, hill.y + hill.height);
      hillGraphics.arc(
        hill.x + hill.width / 2,
        hill.y + hill.height,
        hill.width / 2,
        Math.PI,
        0,
        false
      );
      hillGraphics.lineTo(hill.x + hill.width, 600);
      hillGraphics.closePath();
      hillGraphics.fillPath();
    });

    // 山丘高光
    hillGraphics.fillStyle(0x90ee90, 0.5);
    hills.forEach(hill => {
      hillGraphics.fillCircle(
        hill.x + hill.width / 3,
        hill.y + hill.height / 2,
        30
      );
    });

    hillGraphics.setDepth(-80);
    hillGraphics.setScrollFactor(0.5); // 视差效果
  }

  private createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.movingPlatforms = this.physics.add.group({
      allowGravity: false,
      immovable: true
    });

    // 地面
    this.platforms.create(400, 584, 'ground').setScale(1).refreshBody();

    // 第一层平台（较低）
    this.platforms.create(600, 480, 'platform');
    this.platforms.create(200, 450, 'platform');
    this.platforms.create(500, 420, 'platform');

    // 第二层平台（1个静态，2个移动）
    this.platforms.create(100, 360, 'platform');
    // 创建移动平台
    const movingPlatform1 = this.movingPlatforms.create(400, 340, 'platform');
    movingPlatform1.body.setImmovable(true);
    this.movingPlatformData.push({
      platform: movingPlatform1,
      minX: 300,
      maxX: 500,
      speed: 60,
      lastX: 400
    });
    
    const movingPlatform2 = this.movingPlatforms.create(700, 320, 'platform');
    movingPlatform2.body.setImmovable(true);
    this.movingPlatformData.push({
      platform: movingPlatform2,
      minX: 600,
      maxX: 750,
      speed: 50,
      lastX: 700
    });

    // 第三层平台
    this.platforms.create(250, 260, 'platform');
    this.platforms.create(550, 240, 'platform');
    this.platforms.create(150, 220, 'platform');

    // 第四层平台（1个静态，2个移动）
    this.platforms.create(650, 160, 'platform');
    // 创建移动平台
    const movingPlatform3 = this.movingPlatforms.create(350, 140, 'platform');
    movingPlatform3.body.setImmovable(true);
    this.movingPlatformData.push({
      platform: movingPlatform3,
      minX: 250,
      maxX: 450,
      speed: 55,
      lastX: 350
    });
    
    const movingPlatform4 = this.movingPlatforms.create(100, 120, 'platform');
    movingPlatform4.body.setImmovable(true);
    this.movingPlatformData.push({
      platform: movingPlatform4,
      minX: 50,
      maxX: 200,
      speed: 65,
      lastX: 100
    });

    // 第五层平台（更高的空中平台）
    this.platforms.create(500, 60, 'platform');
    this.platforms.create(200, 40, 'platform');
    this.platforms.create(700, 20, 'platform');

    // 顶部平台（最高层）
    this.platforms.create(400, -60, 'platform');
    this.platforms.create(100, -120, 'platform');
    this.platforms.create(650, -140, 'platform');
  }

  private createCoins() {
    this.coins = this.physics.add.group();

    // 在不同高度的平台附近放置金币，而不是从顶部掉落
    const coinPositions = [
      // 第一层（较低）
      { x: 200, y: 400 },
      { x: 500, y: 380 },
      { x: 600, y: 420 },
      // 第二层
      { x: 100, y: 310 },
      { x: 400, y: 290 },
      { x: 700, y: 270 },
      // 第三层
      { x: 250, y: 210 },
      { x: 550, y: 190 },
      { x: 150, y: 170 },
      // 第四层
      { x: 650, y: 110 },
      { x: 350, y: 90 },
      { x: 100, y: 70 }
    ];

    coinPositions.forEach(pos => {
      const coin = this.coins.create(pos.x, pos.y, 'coin');
      coin.setBounceY(0.3);
      coin.setScale(1.5);
    });
  }

  private createFireEnemies() {
    this.fireEnemies = this.physics.add.group();
    this.fireballs = this.physics.add.group();

    // 创建3个喷火敌人
    const fireEnemy1 = this.fireEnemies.create(300, 200, 'fireEnemy');
    fireEnemy1.setCollideWorldBounds(true);
    fireEnemy1.setBounce(1);
    fireEnemy1.setGravityY(-800); // 抵消重力，悬浮在空中

    // 定期喷火
    this.time.addEvent({
      delay: 2000,
      callback: this.shootFireballs,
      callbackScope: this,
      loop: true
    });
  }

  private createEnemies() {
    this.enemies = this.physics.add.group();

    // 创建3个敌人
    const enemy1 = this.enemies.create(300, 500, 'enemy');
    enemy1.minX = 200;
    enemy1.maxX = 400;
    enemy1.direction = 1;
    enemy1.setBounce(1);
    enemy1.setCollideWorldBounds(true);

    const enemy2 = this.enemies.create(500, 420, 'enemy');
    enemy2.minX = 550;
    enemy2.maxX = 700;
    enemy2.direction = -1;
    enemy2.setBounce(1);
    enemy2.setCollideWorldBounds(true);

    const enemy3 = this.enemies.create(700, 270, 'enemy');
    enemy3.minX = 700;
    enemy3.maxX = 800;
    enemy3.direction = 1;
    enemy3.setBounce(1);
    enemy3.setCollideWorldBounds(true);
  }

  private setupCollisions() {
    // 玩家与平台碰撞
    if (this.player) {
      this.physics.add.collider(this.player, this.platforms);
      this.physics.add.collider(this.player, this.movingPlatforms);
    }
    
    if (this.player2) {
      this.physics.add.collider(this.player2, this.platforms);
      this.physics.add.collider(this.player2, this.movingPlatforms);
    }

    // 金币与平台碰撞
    this.physics.add.collider(this.coins, this.platforms);
    this.physics.add.collider(this.coins, this.movingPlatforms);

    // 敌人与平台碰撞
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.enemies, this.movingPlatforms);

    // 火球与平台碰撞（直接销毁）
    this.physics.add.collider(this.fireballs, this.platforms, (fireball: any) => {
      fireball.destroy();
    });

    // 火球与移动平台碰撞（直接销毁）
    this.physics.add.collider(this.fireballs, this.movingPlatforms, (fireball: any) => {
      fireball.destroy();
    });

    // 玩家1与火球碰撞
    if (this.player) {
      this.physics.add.overlap(
        this.player,
        this.fireballs,
        this.hitByFireball as any,
        undefined,
        this
      );

      // 玩家1与喷火敌人碰撞
      this.physics.add.overlap(
        this.player,
        this.fireEnemies,
        this.hitFireEnemy as any,
        undefined,
        this
      );

      // 玩家1收集金币
      this.physics.add.overlap(
        this.player,
        this.coins,
        this.collectCoinPlayer1 as any,
        undefined,
        this
      );

      // 玩家1与敌人碰撞
      this.physics.add.collider(
        this.player,
        this.enemies,
        this.hitEnemy as any,
        undefined,
        this
      );
    }

    // 玩家2与火球碰撞
    if (this.player2) {
      this.physics.add.overlap(
        this.player2,
        this.fireballs,
        this.hitByFireball as any,
        undefined,
        this
      );

      // 玩家2与喷火敌人碰撞
      this.physics.add.overlap(
        this.player2,
        this.fireEnemies,
        this.hitFireEnemy as any,
        undefined,
        this
      );

      // 玩家2收集金币
      this.physics.add.overlap(
        this.player2,
        this.coins,
        this.collectCoinPlayer2 as any,
        undefined,
        this
      );

      // 玩家2与敌人碰撞
      this.physics.add.collider(
        this.player2,
        this.enemies,
        this.hitEnemy as any,
        undefined,
        this
      );
    }
  }

  private createUI() {
    // 分数文字
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);

    // 生命值文字
    this.livesText = this.add.text(16, 50, 'Lives: ❤️❤️❤️', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setScrollFactor(0).setDepth(100);

    // 提示文字 - 根据实际玩家数量显示
    let controlsText = '';
    const char1 = this.characterOptions.find(c => c.id === this.selectedCharacters[0]);
    const char2 = this.playerCount === 2 ? this.characterOptions.find(c => c.id === this.selectedCharacters[1]) : null;
    
    if (this.playerCount === 1) {
      controlsText = `${char1?.name}: 方向键移动/跳跃`;
      if (this.selectedCharacters[0] === 'sonic') {
        controlsText += ' | F键飞行';
      }
    } else {
      controlsText = `P1(${char1?.name}): 方向键 | P2(${char2?.name}): WASD`;
    }

    this.add.text(400, 16, controlsText, {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100);

    // 返回菜单按钮
    const backButton = this.add.text(780, 16, '⬅ 菜单', {
      fontSize: '20px',
      color: '#ffffff',
      fontFamily: 'Arial',
      backgroundColor: '#ff6b6b',
      padding: { x: 12, y: 6 }
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setInteractive();

    backButton.on('pointerover', () => {
      backButton.setStyle({ backgroundColor: '#ff5252' });
      this.game.canvas.style.cursor = 'pointer';
    });

    backButton.on('pointerout', () => {
      backButton.setStyle({ backgroundColor: '#ff6b6b' });
      this.game.canvas.style.cursor = 'default';
    });

    backButton.on('pointerdown', () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once('camerafadeoutcomplete', () => {
        this.scene.start('MenuScene');
      });
    });
  }

  private collectCoinPlayer1(
    _player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    coin: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  ) {
    coin.disableBody(true, true);
    this.player1Coins++;
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否所有金币都收集完了
    if (this.coins.countActive(true) === 0) {
      this.showVictory();
    }
  }

  private collectCoinPlayer2(
    _player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    coin: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  ) {
    coin.disableBody(true, true);
    this.player2Coins++;
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否所有金币都收集完了
    if (this.coins.countActive(true) === 0) {
      this.showVictory();
    }
  }

  private activateInvincibility() {
    this.isInvincible = true;

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
      for (let i = 0; i <= sides; i++) {
        const x = radius * Math.cos(i * angle - Math.PI / 2);
        const y = radius * Math.sin(i * angle - Math.PI / 2);
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
      shield.setDepth(10);
      this.shieldGraphics.push(shield);

      // 添加旋转动画
      this.tweens.add({
        targets: shield,
        angle: 360,
        duration: 3000,
        repeat: 3,
        ease: 'Linear'
      });

      // 添加脉冲效果
      this.tweens.add({
        targets: shield,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });

      // 创建雷电效果
      const lightning = this.add.graphics();
      lightning.setPosition(player.x, player.y);
      lightning.setDepth(11);
      this.lightningGraphics.push(lightning);

      // 雷电动画 - 每隔短时间重绘随机雷电
      const drawLightning = () => {
        lightning.clear();
        
        // 绘制6条雷电（每个顶点一条）
        for (let i = 0; i < 6; i++) {
          const startAngle = (i * Math.PI * 2) / 6 - Math.PI / 2;
          const startX = radius * Math.cos(startAngle) * 0.9;
          const startY = radius * Math.sin(startAngle) * 0.9;
          
          // 生成雷电路径点
          const points: {x: number, y: number}[] = [{x: startX, y: startY}];
          let currentX = startX;
          let currentY = startY;
          const segments = 3 + Math.floor(Math.random() * 2); // 3-4段（减少段数）
          
          for (let j = 0; j < segments; j++) {
            const targetAngle = startAngle + (Math.random() - 0.5) * 0.5;
            const distance = (radius * 1.0) / segments; // 从1.5改为1.0，整体变小
            currentX += distance * Math.cos(targetAngle) + (Math.random() - 0.5) * 5; // 从8改为5
            currentY += distance * Math.sin(targetAngle) + (Math.random() - 0.5) * 5;
            points.push({x: currentX, y: currentY});
          }
          
          // 先绘制角色颜色外层（较宽）
          lightning.lineStyle(5, color, 0.8);
          lightning.beginPath();
          lightning.moveTo(points[0].x, points[0].y);
          for (let k = 1; k < points.length; k++) {
            lightning.lineTo(points[k].x, points[k].y);
          }
          lightning.strokePath();
          
          // 再绘制白色中心（较细）
          lightning.lineStyle(2, 0xffffff, 0.9);
          lightning.beginPath();
          lightning.moveTo(points[0].x, points[0].y);
          for (let k = 1; k < points.length; k++) {
            lightning.lineTo(points[k].x, points[k].y);
          }
          lightning.strokePath();
        }
      };

      // 初始绘制
      drawLightning();

      // 定时重绘雷电（闪烁效果）
      const lightningTimer = this.time.addEvent({
        delay: 80,
        callback: drawLightning,
        loop: true
      });

      // 保存定时器以便后续清理
      if (!this.lightningTimers) {
        this.lightningTimers = [];
      }
      this.lightningTimers.push(lightningTimer);
    });

    // 提示文本
    const invincibleText = this.add.text(400, 100, 'INVINCIBLE!', {
      fontSize: '32px',
      color: '#00ffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

    // 文本闪烁效果
    this.tweens.add({
      targets: invincibleText,
      alpha: 0,
      duration: 300,
      yoyo: true,
      repeat: 10
    });

    // 10秒后移除无敌状态
    this.time.delayedCall(10000, () => {
      this.isInvincible = false;
      
      // 清理所有光盾
      this.shieldGraphics.forEach(shield => {
        if (shield) shield.destroy();
      });
      this.shieldGraphics = [];
      
      // 清理所有雷电
      this.lightningGraphics.forEach(lightning => {
        if (lightning) lightning.destroy();
      });
      this.lightningGraphics = [];
      
      // 清理雷电定时器
      if (this.lightningTimers) {
        this.lightningTimers.forEach(timer => timer.remove());
        this.lightningTimers = [];
      }
      
      invincibleText.destroy();
      
      // 显示结束提示
      const endText = this.add.text(400, 100, 'Invincibility ended', {
        fontSize: '24px',
        color: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

      this.time.delayedCall(2000, () => {
        endText.destroy();
      });
    });
  }

  private showVictory() {
    this.gameWon = true;
    this.physics.pause();

    // 背景覆盖层
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, 800, 600);
    overlay.setScrollFactor(0);
    overlay.setDepth(100);

    // 胜利文字
    const victoryText = this.add.text(400, 200, '🏆 Victory! 🏆', {
      fontSize: '72px',
      color: '#ffd700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // 闪烁效果
    this.tweens.add({
      targets: victoryText,
      scale: 1.2,
      duration: 500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // 最终分数
    this.add.text(400, 280, 'Final Score: ' + this.score, {
      fontSize: '36px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // 创建排行榜 - 只显示实际参与的玩家
    const rankings: Array<{ name: string; coins: number; color: string; }> = [];
    
    this.selectedCharacters.forEach((charId, index) => {
      const charData = this.characterOptions.find(c => c.id === charId);
      if (charData) {
        rankings.push({
          name: charData.name,
          coins: index === 0 ? this.player1Coins : this.player2Coins,
          color: charData.color
        });
      }
    });
    
    rankings.sort((a, b) => b.coins - a.coins);

    // 只在双人游戏时显示排行榜
    if (this.playerCount === 2) {
      // 显示排行榜标题
      this.add.text(400, 340, 'Coin Rankings:', {
        fontSize: '28px',
        color: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

      // 显示排行
      const medals = ['🥇', '🥈'];
      rankings.forEach((rank, index) => {
        const yPos = 385 + index * 35;
        const medal = medals[index] || '';
        this.add.text(400, yPos, `${medal} ${rank.name}: ${rank.coins} coins`, {
          fontSize: '24px',
          color: rank.color,
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeThickness: 3
        }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
      });
    } else {
      // 单人游戏只显示金币数
      this.add.text(400, 360, `${rankings[0].name}收集了 ${rankings[0].coins} 个金币！`, {
        fontSize: '28px',
        color: rankings[0].color,
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 3
      }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    }

    // 重启提示
    const restartText = this.add.text(400, 510, 'Press R to Play Again', {
      fontSize: '24px',
      color: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // 闪烁效果
    this.tweens.add({
      targets: restartText,
      alpha: 0,
      duration: 500,
      ease: 'Linear',
      yoyo: true,
      repeat: -1
    });

    // 添加重启按键
    this.input.keyboard!.once('keydown-R', () => {
      // 先重置所有状态变量
      this.score = 0;
      this.lives = 3;
      this.gameOver = false;
      this.gameWon = false;
      this.player1Coins = 0;
      this.player2Coins = 0;
      this.isInvincible = false;
      this.cheatCodeInput = '';
      this.movingPlatformData = [];
      this.shieldGraphics = [];
      this.lightningGraphics = [];
      this.lightningTimers = [];
      this.isInSelectionMode = true;
      this.selectedCharacters = [];
      this.selectionUI = [];
      
      // 然后重启场景
      this.scene.restart();
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
      this.scoreText.setText('Score: ' + this.score);
      return;
    }

    // 检查玩家是否从上方跳到敌人上
    if (player.body.velocity.y > 0 && player.y < enemy.y - 10) {
      // 踩到敌人，消灭敌人
      enemy.disableBody(true, true);
      player.setVelocityY(-300);
      this.score += 20;
      this.scoreText.setText('Score: ' + this.score);
    } else {
      // 被敌人撞到
      this.loseLife();
    }
  }

  private loseLife() {
    // 如果无敌，不扣命
    if (this.isInvincible) {
      return;
    }

    this.lives -= 1;
    
    const hearts = '❤️'.repeat(this.lives);
    this.livesText.setText('Lives: ' + hearts);

    if (this.lives <= 0) {
      this.physics.pause();
      if (this.player) {
        this.player.setTint(0xff0000);
      }
      this.gameOver = true;

      // 显示游戏结束文字
      this.add.text(400, 300, 'Game Over!', {
        fontSize: '64px',
        color: '#ff0000',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 8
      }).setOrigin(0.5);

      this.add.text(400, 370, 'Final Score: ' + this.score, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      const restartText = this.add.text(400, 420, 'Press R to Restart', {
        fontSize: '24px',
        color: '#ffff00',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 4
      }).setOrigin(0.5);

      // 闪烁效果
      this.tweens.add({
        targets: restartText,
        alpha: 0,
        duration: 500,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
      });

      // 添加重启按键
      this.input.keyboard!.once('keydown-R', () => {
        // 先重置所有状态变量
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameWon = false;
        this.player1Coins = 0;
        this.player2Coins = 0;
        this.isInvincible = false;
        this.cheatCodeInput = '';
        this.movingPlatformData = [];
        this.shieldGraphics = [];
        this.lightningGraphics = [];
        this.lightningTimers = [];
        this.isInSelectionMode = true;
        this.selectedCharacters = [];
        this.selectionUI = [];
        
        // 然后重启场景
        this.scene.restart();
      });
    } else {
      // 重置玩家位置
      if (this.player) {
        this.player.setPosition(100, 500);
        this.player.setVelocity(0, 0);
        this.player.setAlpha(0.5);
      }
      
      if (this.player2) {
        this.player2.setPosition(200, 500);
        this.player2.setVelocity(0, 0);
        this.player2.setAlpha(0.5);
      }
      
      // 闪烁效果表示受伤
      this.time.delayedCall(1000, () => {
        if (this.player) this.player.setAlpha(1);
        if (this.player2) this.player2.setAlpha(1);
      });
    }
  }

  private shootFireballs() {
    if (this.gameOver) return;

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

  private hitByFireball(
    _player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    fireball: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  ) {
    fireball.destroy();
    // 如果无敌，不扣命
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
      this.scoreText.setText('Score: ' + this.score);
      return;
    }

    // 检查玩家是否从上方跳到敌人上
    if (player.body.velocity.y > 0 && player.y < fireEnemy.y - 5) {
      // 踩到喷火敌人，消灭敌人
      fireEnemy.disableBody(true, true);
      player.setVelocityY(-300);
      this.score += 50; // 喷火敌人分数更高
      this.scoreText.setText('Score: ' + this.score);
    } else {
      // 被喷火敌人撞到
      this.loseLife();
    }
  }

  private showTitleScreen() {
    // 标题
    const titleText = this.add.text(400, 150, '🪙 金币追逐', {
      fontSize: '72px',
      color: '#ffd700',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    const subtitleText = this.add.text(400, 230, 'Coin Chaser', {
      fontSize: '32px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    const continueText = this.add.text(400, 400, '按任意键开始', {
      fontSize: '28px',
      color: '#00ff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    // 闪烁效果
    this.tweens.add({
      targets: continueText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 缩放效果
    this.tweens.add({
      targets: titleText,
      scale: 1.1,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.selectionUI.push(titleText as any, subtitleText as any, continueText as any);

    // 监听任意键
    this.input.keyboard!.once('keydown', () => {
      this.clearSelectionUI();
      this.showPlayerCountSelection();
    });
  }

  private showPlayerCountSelection() {
    // 标题
    const titleText = this.add.text(400, 120, '选择玩家数量', {
      fontSize: '48px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.selectionUI.push(titleText as any);

    // 创建选择卡片
    const options = [
      { count: 1, label: '单人游戏', icon: '👤', y: 260 },
      { count: 2, label: '双人游戏', icon: '👥', y: 400 }
    ];

    options.forEach(option => {
      const card = this.add.container(400, option.y).setDepth(200).setScrollFactor(0);

      // 背景
      const bg = this.add.graphics();
      bg.fillStyle(0x2c3e50, 1);
      bg.fillRoundedRect(-150, -50, 300, 100, 15);
      bg.lineStyle(3, 0x3498db, 1);
      bg.strokeRoundedRect(-150, -50, 300, 100, 15);

      // 图标
      const icon = this.add.text(-100, 0, option.icon, {
        fontSize: '48px'
      }).setOrigin(0.5);

      // 文字
      const label = this.add.text(20, 0, option.label, {
        fontSize: '32px',
        color: '#ffffff',
        fontFamily: 'Arial'
      }).setOrigin(0, 0.5);

      card.add([bg, icon, label]);
      card.setInteractive(new Phaser.Geom.Rectangle(-150, -50, 300, 100), Phaser.Geom.Rectangle.Contains);

      // 鼠标悬停效果
      card.on('pointerover', () => {
        bg.clear();
        bg.fillStyle(0x3498db, 1);
        bg.fillRoundedRect(-150, -50, 300, 100, 15);
        bg.lineStyle(3, 0x00d4ff, 1);
        bg.strokeRoundedRect(-150, -50, 300, 100, 15);
        this.tweens.add({
          targets: card,
          scale: 1.05,
          duration: 200,
          ease: 'Back.easeOut'
        });
        this.game.canvas.style.cursor = 'pointer';
      });

      card.on('pointerout', () => {
        bg.clear();
        bg.fillStyle(0x2c3e50, 1);
        bg.fillRoundedRect(-150, -50, 300, 100, 15);
        bg.lineStyle(3, 0x3498db, 1);
        bg.strokeRoundedRect(-150, -50, 300, 100, 15);
        this.tweens.add({
          targets: card,
          scale: 1,
          duration: 200,
          ease: 'Back.easeIn'
        });
        this.game.canvas.style.cursor = 'default';
      });

      card.on('pointerdown', () => {
        this.playerCount = option.count;
        this.clearSelectionUI();
        this.showCharacterSelection();
      });

      this.selectionUI.push(card as any);
    });

    // 提示文字
    const hintText = this.add.text(400, 540, '点击选择', {
      fontSize: '20px',
      color: '#aaaaaa',
      fontFamily: 'Arial'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.selectionUI.push(hintText as any);
  }

  private showCharacterSelection() {
    this.selectedCharacters = [];

    const updateUI = () => {
      this.clearSelectionUI();

      // 标题
      const titleText = this.add.text(400, 80, `选择角色 (${this.selectedCharacters.length}/${this.playerCount})`, {
        fontSize: '42px',
        color: '#ffffff',
        fontFamily: 'Arial',
        stroke: '#000000',
        strokeThickness: 6
      }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

      this.selectionUI.push(titleText as any);

      // 显示角色卡片
      const startX = 400 - (this.characterOptions.length - 1) * 130;
      this.characterOptions.forEach((char, index) => {
        const x = startX + index * 260;
        const y = 300;
        const isSelected = this.selectedCharacters.includes(char.id);
        const isDisabled = !isSelected && this.selectedCharacters.length >= this.playerCount;

        const card = this.add.container(x, y).setDepth(200).setScrollFactor(0);

        // 背景
        const bg = this.add.graphics();
        if (isSelected) {
          bg.fillStyle(0x27ae60, 1);
          bg.lineStyle(4, 0x2ecc71, 1);
        } else if (isDisabled) {
          bg.fillStyle(0x555555, 0.5);
          bg.lineStyle(3, 0x777777, 1);
        } else {
          bg.fillStyle(0x2c3e50, 1);
          bg.lineStyle(3, 0x3498db, 1);
        }
        bg.fillRoundedRect(-90, -140, 180, 280, 15);
        bg.strokeRoundedRect(-90, -140, 180, 280, 15);

        // 角色预览
        const sprite = this.add.sprite(0, -60, char.texture).setScale(4);
        if (isDisabled) {
          sprite.setAlpha(0.3);
        }

        // 角色名
        const name = this.add.text(0, 20, char.name, {
          fontSize: '28px',
          color: isDisabled ? '#888888' : char.color,
          fontFamily: 'Arial',
          fontStyle: 'bold'
        }).setOrigin(0.5);

        // 描述
        const desc = this.add.text(0, 80, char.description, {
          fontSize: '14px',
          color: isDisabled ? '#666666' : '#ffffff',
          fontFamily: 'Arial',
          align: 'center',
          wordWrap: { width: 160 }
        }).setOrigin(0.5);

        // 选中标记
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
              bg.fillStyle(0x3498db, 1);
              bg.lineStyle(3, 0x00d4ff, 1);
              bg.fillRoundedRect(-90, -140, 180, 280, 15);
              bg.strokeRoundedRect(-90, -140, 180, 280, 15);
            }
            this.tweens.add({
              targets: card,
              scale: 1.05,
              duration: 200,
              ease: 'Back.easeOut'
            });
            this.game.canvas.style.cursor = 'pointer';
          });

          card.on('pointerout', () => {
            if (!isSelected) {
              bg.clear();
              bg.fillStyle(0x2c3e50, 1);
              bg.lineStyle(3, 0x3498db, 1);
              bg.fillRoundedRect(-90, -140, 180, 280, 15);
              bg.strokeRoundedRect(-90, -140, 180, 280, 15);
            }
            this.tweens.add({
              targets: card,
              scale: 1,
              duration: 200,
              ease: 'Back.easeIn'
            });
            this.game.canvas.style.cursor = 'default';
          });

          card.on('pointerdown', () => {
            if (isSelected) {
              // 取消选择
              const idx = this.selectedCharacters.indexOf(char.id);
              if (idx > -1) {
                this.selectedCharacters.splice(idx, 1);
              }
            } else {
              // 选择
              this.selectedCharacters.push(char.id);
            }
            updateUI();
          });
        }

        this.selectionUI.push(card as any);
      });

      // 开始按钮
      if (this.selectedCharacters.length === this.playerCount) {
        const startButton = this.add.container(400, 500).setDepth(200).setScrollFactor(0);

        const buttonBg = this.add.graphics();
        buttonBg.fillStyle(0x27ae60, 1);
        buttonBg.fillRoundedRect(-100, -30, 200, 60, 10);
        buttonBg.lineStyle(3, 0x2ecc71, 1);
        buttonBg.strokeRoundedRect(-100, -30, 200, 60, 10);

        const buttonText = this.add.text(0, 0, '开始游戏', {
          fontSize: '28px',
          color: '#ffffff',
          fontFamily: 'Arial',
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
          this.tweens.add({
            targets: startButton,
            scale: 1.1,
            duration: 200,
            ease: 'Back.easeOut'
          });
          this.game.canvas.style.cursor = 'pointer';
        });

        startButton.on('pointerout', () => {
          buttonBg.clear();
          buttonBg.fillStyle(0x27ae60, 1);
          buttonBg.fillRoundedRect(-100, -30, 200, 60, 10);
          buttonBg.lineStyle(3, 0x2ecc71, 1);
          buttonBg.strokeRoundedRect(-100, -30, 200, 60, 10);
          this.tweens.add({
            targets: startButton,
            scale: 1,
            duration: 200,
            ease: 'Back.easeIn'
          });
          this.game.canvas.style.cursor = 'default';
        });

        startButton.on('pointerdown', () => {
          this.clearSelectionUI();
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.cameras.main.fadeIn(500, 0, 0, 0);
            this.startGame();
          });
        });

        this.selectionUI.push(startButton as any);
      }
    };

    updateUI();
  }

  private clearSelectionUI() {
    this.selectionUI.forEach(item => {
      if (item && item.destroy) {
        item.destroy();
      }
    });
    this.selectionUI = [];
  }

  private createSelectedPlayers() {
    // 根据选择的角色创建玩家
    const char1 = this.selectedCharacters[0];
    const char2 = this.selectedCharacters[1];

    // 创建玩家1
    const char1Data = this.characterOptions.find(c => c.id === char1)!;
    this.player = this.physics.add.sprite(100, 500, char1Data.texture);
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2);
    
    // 设置相机边界和初始位置
    this.cameras.main.setBounds(0, 0, 800, 1200);
    this.cameras.main.scrollY = 0;

    // 如果是双人游戏，创建玩家2
    if (this.playerCount === 2 && char2) {
      const char2Data = this.characterOptions.find(c => c.id === char2)!;
      this.player2 = this.physics.add.sprite(200, 500, char2Data.texture);
      this.player2.setBounce(0.1);
      this.player2.setCollideWorldBounds(true);
      this.player2.setScale(2);
    }
  }
}
