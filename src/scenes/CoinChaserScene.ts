import Phaser from 'phaser';

export default class CoinChaserScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private player2!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private player3!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private numpadKeys!: any;
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
  private player3Coins: number = 0;
  private gameOver: boolean = false;
  private gameWon: boolean = false;
  private cheatCodeInput: string = '';
  private isInvincible: boolean = false;
  private shieldGraphics: Phaser.GameObjects.Graphics[] = [];
  private lightningGraphics: Phaser.GameObjects.Graphics[] = [];
  private lightningTimers: Phaser.Time.TimerEvent[] = [];

  constructor() {
    super({ key: 'CoinChaserScene' });
  }

  preload() {
    // 由于我们没有外部图片资源，使用代码生成像素风格的图形
    this.createPixelAssets();
  }

  create() {
    // 创建索尼克风格渐变背景
    this.createSonicBackground();

    // 扩大世界边界，允许更高的跳跃空间
    this.physics.world.setBounds(0, 0, 800, 1200);

    // 创建平台
    this.createPlatforms();

    // 创建玩家
    this.createPlayer();

    // 创建玩家2
    this.createPlayer2();

    // 创建玩家3（樱桃小丸子）
    this.createPlayer3();

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

    // 创建小键盘控制器（4568）
    this.numpadKeys = this.input.keyboard!.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FOUR,
      down: Phaser.Input.Keyboard.KeyCodes.NUMPAD_FIVE,
      right: Phaser.Input.Keyboard.KeyCodes.NUMPAD_SIX,
      up: Phaser.Input.Keyboard.KeyCodes.NUMPAD_EIGHT
    });

    // 创建F键用于飞行
    this.fKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);

    // 创建UI
    this.createUI();

    // 添加跳跃音效替代（视觉反馈）
    this.input.keyboard!.on('keydown-SPACE', () => {
      if (this.player.body.touching.down && !this.gameOver) {
        this.player.setVelocityY(-500);
      }
    });

    // 玩家2跳跃（Shift键）
    this.input.keyboard!.on('keydown-SHIFT', () => {
      if (this.player2.body.touching.down && !this.gameOver) {
        this.player2.setVelocityY(-500);
      }
    });

    // 监听秘籍输入和玩家3跳跃
    this.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      // 玩家3跳跃（小键盘0或+）
      if ((event.key === '0' && event.location === 3) || event.code === 'NumpadAdd') {
        if (this.player3.body.touching.down && !this.gameOver) {
          this.player3.setVelocityY(-500);
        }
      }
      
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
  }

  update() {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 更新光盾位置
    if (this.isInvincible && this.shieldGraphics.length > 0) {
      const players = [this.player, this.player2, this.player3];
      this.shieldGraphics.forEach((shield, index) => {
        if (shield && players[index]) {
          shield.setPosition(players[index].x, players[index].y);
        }
      });
      this.lightningGraphics.forEach((lightning, index) => {
        if (lightning && players[index]) {
          lightning.setPosition(players[index].x, players[index].y);
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
        const p1Body = this.player.body as Phaser.Physics.Arcade.Body;
        if (p1Body.touching.down && 
            this.player.y <= platformTop + 5 && 
            this.player.x >= platformLeft - 10 && 
            this.player.x <= platformRight + 10) {
          this.player.x += deltaX;
        }
        
        // 移动玩家2
        const p2Body = this.player2.body as Phaser.Physics.Arcade.Body;
        if (p2Body.touching.down && 
            this.player2.y <= platformTop + 5 && 
            this.player2.x >= platformLeft - 10 && 
            this.player2.x <= platformRight + 10) {
          this.player2.x += deltaX;
        }
        
        // 移动玩家3
        const p3Body = this.player3.body as Phaser.Physics.Arcade.Body;
        if (p3Body.touching.down && 
            this.player3.y <= platformTop + 5 && 
            this.player3.x >= platformLeft - 10 && 
            this.player3.x <= platformRight + 10) {
          this.player3.x += deltaX;
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

    // 玩家1飞行（长按F键）
    if (this.fKey.isDown) {
      this.player.setVelocityY(-300);
    }

    // 玩家2移动（WASD）
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

    // 玩家3移动（小键盘）
    if (this.numpadKeys.left.isDown) {
      this.player3.setVelocityX(-200);
      this.player3.flipX = true;
    } else if (this.numpadKeys.right.isDown) {
      this.player3.setVelocityX(200);
      this.player3.flipX = false;
    } else {
      this.player3.setVelocityX(0);
    }

    // 玩家3跳跃
    if (this.numpadKeys.up.isDown && this.player3.body.touching.down) {
      this.player3.setVelocityY(-500);
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
    if (this.player.y > 1200 || this.player2.y > 1200 || this.player3.y > 1200) {
      this.loseLife();
    }

    // 相机跟随三个玩家的中心点
    const centerX = (this.player.x + this.player2.x + this.player3.x) / 3;
    const centerY = (this.player.y + this.player2.y + this.player3.y) / 3;
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

  private createPixelAssets() {
    // 创建玩家纹理（索尼克风格 - 20x20像素）
    const playerGraphics = this.add.graphics();
    
    // 蓝色身体（圆形）
    playerGraphics.fillStyle(0x0080ff, 1);
    playerGraphics.fillCircle(10, 10, 7);
    
    // 刺猬的尖刺（背后的3个尖刺）
    playerGraphics.fillStyle(0x0060dd, 1);
    playerGraphics.fillTriangle(14, 8, 18, 6, 16, 10);
    playerGraphics.fillTriangle(14, 10, 18, 12, 16, 10);
    playerGraphics.fillTriangle(13, 12, 16, 15, 14, 12);
    
    // 肚子（浅色）
    playerGraphics.fillStyle(0xffe4b5, 1);
    playerGraphics.fillCircle(9, 11, 4);
    
    // 大眼睛（白色底）
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillEllipse(7, 8, 5, 4);
    playerGraphics.fillEllipse(11, 8, 5, 4);
    
    // 眼珠（黑色）
    playerGraphics.fillStyle(0x000000, 1);
    playerGraphics.fillCircle(7, 8, 2);
    playerGraphics.fillCircle(11, 8, 2);
    
    // 眼睛高光
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillCircle(7.5, 7.5, 1);
    playerGraphics.fillCircle(11.5, 7.5, 1);
    
    // 红色鞋子
    playerGraphics.fillStyle(0xff0000, 1);
    playerGraphics.fillEllipse(6, 16, 3, 2);
    playerGraphics.fillEllipse(12, 16, 3, 2);
    
    // 鞋子白色装饰
    playerGraphics.fillStyle(0xffffff, 1);
    playerGraphics.fillRect(5, 15, 3, 1);
    playerGraphics.fillRect(11, 15, 3, 1);
    
    playerGraphics.generateTexture('player', 20, 20);
    playerGraphics.destroy();

    // 创建玩家2纹理（Shadow风格 - 20x20像素）
    const player2Graphics = this.add.graphics();
    
    // 黑色身体（圆形）
    player2Graphics.fillStyle(0x1a1a1a, 1);
    player2Graphics.fillCircle(10, 10, 7);
    
    // 刺猬的尖刺（红色条纹）
    player2Graphics.fillStyle(0xff0000, 1);
    player2Graphics.fillTriangle(14, 8, 18, 6, 16, 10);
    player2Graphics.fillTriangle(14, 10, 18, 12, 16, 10);
    player2Graphics.fillTriangle(13, 12, 16, 15, 14, 12);
    
    // 胸部（白色/灰色）
    player2Graphics.fillStyle(0xd0d0d0, 1);
    player2Graphics.fillCircle(9, 11, 4);
    
    // 红色条纹（手臂）
    player2Graphics.fillStyle(0xff0000, 1);
    player2Graphics.fillRect(4, 10, 2, 4);
    player2Graphics.fillRect(14, 10, 2, 4);
    
    // 大眼睛（红色）
    player2Graphics.fillStyle(0xffffff, 1);
    player2Graphics.fillEllipse(7, 8, 5, 4);
    player2Graphics.fillEllipse(11, 8, 5, 4);
    
    // 眼珠（红色）
    player2Graphics.fillStyle(0xff0000, 1);
    player2Graphics.fillCircle(7, 8, 2);
    player2Graphics.fillCircle(11, 8, 2);
    
    // 眼睛高光
    player2Graphics.fillStyle(0xffffff, 1);
    player2Graphics.fillCircle(7.5, 7.5, 1);
    player2Graphics.fillCircle(11.5, 7.5, 1);
    
    // 黑红色鞋子
    player2Graphics.fillStyle(0x1a1a1a, 1);
    player2Graphics.fillEllipse(6, 16, 3, 2);
    player2Graphics.fillEllipse(12, 16, 3, 2);
    
    // 鞋子红色装饰
    player2Graphics.fillStyle(0xff0000, 1);
    player2Graphics.fillRect(5, 15, 3, 1);
    player2Graphics.fillRect(11, 15, 3, 1);
    
    player2Graphics.generateTexture('player2', 20, 20);
    player2Graphics.destroy();

    // 创建玩家3纹理（艾米·罗斯风格 - 20x20像素）
    const player3Graphics = this.add.graphics();
    
    // 粉红色身体（圆形）
    player3Graphics.fillStyle(0xff69b4, 1);
    player3Graphics.fillCircle(10, 10, 7);
    
    // 刺猬的尖刺（粉红色，背后的3个尖刺）
    player3Graphics.fillStyle(0xff1493, 1);
    player3Graphics.fillTriangle(14, 8, 18, 6, 16, 10);
    player3Graphics.fillTriangle(14, 10, 18, 12, 16, 10);
    player3Graphics.fillTriangle(13, 12, 16, 15, 14, 12);
    
    // 额前刺猬毛（特色）
    player3Graphics.fillStyle(0xff1493, 1);
    player3Graphics.fillTriangle(6, 4, 4, 2, 7, 5);
    
    // 肚子（浅粉色）
    player3Graphics.fillStyle(0xffb6c1, 1);
    player3Graphics.fillCircle(9, 11, 4);
    
    // 大眼睛（白色底）
    player3Graphics.fillStyle(0xffffff, 1);
    player3Graphics.fillEllipse(7, 8, 5, 4);
    player3Graphics.fillEllipse(11, 8, 5, 4);
    
    // 眼珠（绿色）
    player3Graphics.fillStyle(0x00ff00, 1);
    player3Graphics.fillCircle(7, 8, 2);
    player3Graphics.fillCircle(11, 8, 2);
    
    // 眼睛高光
    player3Graphics.fillStyle(0xffffff, 1);
    player3Graphics.fillCircle(7.5, 7.5, 1);
    player3Graphics.fillCircle(11.5, 7.5, 1);
    
    // 红色连衣裙（上半部分）
    player3Graphics.fillStyle(0xff0000, 1);
    player3Graphics.fillRect(6, 14, 8, 2);
    
    // 红白色靴子
    player3Graphics.fillStyle(0xff0000, 1);
    player3Graphics.fillEllipse(6, 16, 3, 2);
    player3Graphics.fillEllipse(12, 16, 3, 2);
    
    // 靴子白色装饰
    player3Graphics.fillStyle(0xffffff, 1);
    player3Graphics.fillRect(5, 15, 3, 1);
    player3Graphics.fillRect(11, 15, 3, 1);
    
    player3Graphics.generateTexture('player3', 20, 20);
    player3Graphics.destroy();

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

  private createPlayer() {
    this.player = this.physics.add.sprite(100, 500, 'player');
    this.player.setBounce(0.1);
    this.player.setCollideWorldBounds(true);
    this.player.setScale(2); // 放大玩家

    // 设置相机边界
    this.cameras.main.setBounds(0, 0, 800, 1200);
    
    // 设置相机初始位置，让地面显示在屏幕底部
    this.cameras.main.scrollY = 0;
  }

  private createPlayer2() {
    this.player2 = this.physics.add.sprite(150, 500, 'player2');
    this.player2.setBounce(0.1);
    this.player2.setCollideWorldBounds(true);
    this.player2.setScale(2); // 放大玩家
  }

  private createPlayer3() {
    this.player3 = this.physics.add.sprite(200, 500, 'player3');
    this.player3.setBounce(0.1);
    this.player3.setCollideWorldBounds(true);
    this.player3.setScale(2); // 放大玩家
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
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player2, this.platforms);
    this.physics.add.collider(this.player3, this.platforms);

    // 玩家与移动平台碰撞
    this.physics.add.collider(this.player, this.movingPlatforms);
    this.physics.add.collider(this.player2, this.movingPlatforms);
    this.physics.add.collider(this.player3, this.movingPlatforms);

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
    this.physics.add.overlap(
      this.player,
      this.fireballs,
      this.hitByFireball as any,
      undefined,
      this
    );

    // 玩家2与火球碰撞
    this.physics.add.overlap(
      this.player2,
      this.fireballs,
      this.hitByFireball as any,
      undefined,
      this
    );

    // 玩家3与火球碰撞
    this.physics.add.overlap(
      this.player3,
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

    // 玩家2与喷火敌人碰撞
    this.physics.add.overlap(
      this.player2,
      this.fireEnemies,
      this.hitFireEnemy as any,
      undefined,
      this
    );

    // 玩家3与喷火敌人碰撞
    this.physics.add.overlap(
      this.player3,
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

    // 玩家2收集金币
    this.physics.add.overlap(
      this.player2,
      this.coins,
      this.collectCoinPlayer2 as any,
      undefined,
      this
    );

    // 玩家3收集金币
    this.physics.add.overlap(
      this.player3,
      this.coins,
      this.collectCoinPlayer3 as any,
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

    // 玩家2与敌人碰撞
    this.physics.add.collider(
      this.player2,
      this.enemies,
      this.hitEnemy as any,
      undefined,
      this
    );

    // 玩家3与敌人碰撞
    this.physics.add.collider(
      this.player3,
      this.enemies,
      this.hitEnemy as any,
      undefined,
      this
    );
  }

  private createUI() {
    // 分数文字
    this.scoreText = this.add.text(16, 16, 'Score: 0', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 生命值文字
    this.livesText = this.add.text(16, 50, 'Lives: ❤️❤️❤️', {
      fontSize: '24px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 4
    });

    // 提示文字
    this.add.text(400, 16, 'P1: Arrows/Space | P2: WASD/Shift | P3: Numpad 4568', {
      fontSize: '16px',
      color: '#ffffff',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5, 0);
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

  private collectCoinPlayer3(
    _player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody,
    coin: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody
  ) {
    coin.disableBody(true, true);
    this.player3Coins++;
    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);

    // 检查是否所有金币都收集完了
    if (this.coins.countActive(true) === 0) {
      this.showVictory();
    }
  }

  private activateInvincibility() {
    this.isInvincible = true;

    // 为三个玩家创建光盾
    const players = [this.player, this.player2, this.player3];
    const shieldColors = [0x0080ff, 0xff0000, 0xff00ff]; // 蓝色、红色、粉色
    const lightningColors = [0x0080ff, 0xff0000, 0xff00ff]; // 蓝色、红色、粉色
    
    players.forEach((player, index) => {
      // 创建光盾效果
      const shield = this.add.graphics();
      shield.lineStyle(4, shieldColors[index], 0.6);
      shield.fillStyle(shieldColors[index], 0.15);
      
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
          lightning.lineStyle(5, lightningColors[index], 0.8);
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

    // 创建排行榜
    const rankings = [
      { name: 'Sonic', coins: this.player1Coins, color: '#0080ff' },
      { name: 'Shadow', coins: this.player2Coins, color: '#ff0000' },
      { name: 'Amy', coins: this.player3Coins, color: '#ff00ff' }
    ].sort((a, b) => b.coins - a.coins);

    // 显示排行榜标题
    this.add.text(400, 340, 'Coin Rankings:', {
      fontSize: '28px',
      color: '#ffff00',
      fontFamily: 'Arial',
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    // 显示排行
    const medals = ['🥇', '🥈', '🥉'];
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
      this.player3Coins = 0;
      this.isInvincible = false;
      this.cheatCodeInput = '';
      this.movingPlatformData = [];
      this.shieldGraphics = [];
      this.lightningGraphics = [];
      this.lightningTimers = [];
      
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
      this.player.setTint(0xff0000);
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
        this.player3Coins = 0;
        this.isInvincible = false;
        this.cheatCodeInput = '';
        this.movingPlatformData = [];
        this.shieldGraphics = [];
        this.lightningGraphics = [];
        this.lightningTimers = [];
        
        // 然后重启场景
        this.scene.restart();
      });
    } else {
      // 重置玩家位置
      this.player.setPosition(100, 500);
      this.player.setVelocity(0, 0);
      this.player2.setPosition(150, 500);
      this.player2.setVelocity(0, 0);
      this.player3.setPosition(200, 500);
      this.player3.setVelocity(0, 0);
      
      // 闪烁效果表示受伤
      this.player.setAlpha(0.5);
      this.player2.setAlpha(0.5);
      this.player3.setAlpha(0.5);
      this.time.delayedCall(1000, () => {
        this.player.setAlpha(1);
        this.player2.setAlpha(1);
        this.player3.setAlpha(1);
      });
    }
  }

  private shootFireballs() {
    if (this.gameOver) return;

    this.fireEnemies.children.entries.forEach((enemy: any) => {
      if (enemy.active) {
        // 向玩家1发射火球
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

        // 如果玩家2距离较远，也向玩家2发射
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
}
