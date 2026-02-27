import Phaser from 'phaser';
import { TEXT_STYLES } from '../common/UIConfig';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    // 渐变背景
    const graphics = this.add.graphics();
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    graphics.fillRect(0, 0, width, height);

    // 标题
    this.add.text(width / 2, 80, '👾 YoYo的像素冒险', {
      ...TEXT_STYLES.TITLE_LARGE,
      fontSize: '56px',
      color: '#00d4ff'
    }).setOrigin(0.5);

    this.add.text(width / 2, 140, 'Game Collection', {
      ...TEXT_STYLES.BODY
    }).setOrigin(0.5).setAlpha(0.7);

    // 游戏列表
    const games = [
      {
        name: '金币追逐',
        nameEn: 'Coin Chaser',
        description: '经典横板跳跃收集游戏',
        scene: 'CoinChaserScene',
        color: 0xffd700,
        icon: '💰'
      },
      {
        name: '古堡逃亡',
        nameEn: 'Castle Escape',
        description: '傍晚古堡中跳跃躲避深坑',
        scene: 'ScrollRunnerScene',
        color: 0xff6b35,
        icon: '🏰'
      }
    ];

    const startY = 220;
    const cardHeight = 120;
    const cardSpacing = 20;

    games.forEach((game, index) => {
      const y = startY + index * (cardHeight + cardSpacing);
      this.createGameCard(game, width / 2, y, cardHeight);
    });

    // 底部提示
    this.add.text(width / 2, height - 60, '点击卡片开始游戏 · Click to Start', {
      ...TEXT_STYLES.SMALL,
      color: '#888888'
    }).setOrigin(0.5);

    // GitHub 链接
    const githubLink = this.add.text(width / 2, height - 30, 'github.com/interma/pixel-yoyo-game', {
      ...TEXT_STYLES.LINK,
      fontSize: '14px',
      color: '#00d4ff'
    }).setOrigin(0.5);

    // 设置为可交互并添加点击效果
    githubLink.setInteractive({ useHandCursor: true });
    
    githubLink.on('pointerover', () => {
      githubLink.setStyle({ color: '#00ffff' });
    });
    
    githubLink.on('pointerout', () => {
      githubLink.setStyle({ color: '#00d4ff' });
    });
    
    githubLink.on('pointerdown', () => {
      window.open('https://github.com/interma/pixel-yoyo-game', '_blank');
    });
  }

  createGameCard(game: any, x: number, y: number, height: number) {
    const cardWidth = 600;
    const container = this.add.container(x, y);

    // 卡片背景
    const card = this.add.graphics();
    card.fillStyle(0x2d2d44, 1);
    card.fillRoundedRect(-cardWidth / 2, -height / 2, cardWidth, height, 16);
    
    // 边框
    card.lineStyle(3, game.color, 0.6);
    card.strokeRoundedRect(-cardWidth / 2, -height / 2, cardWidth, height, 16);

    // 图标背景
    const iconBg = this.add.graphics();
    iconBg.fillStyle(game.color, 0.2);
    iconBg.fillCircle(-cardWidth / 2 + 60, 0, 35);

    // 图标
    const icon = this.add.text(-cardWidth / 2 + 60, 0, game.icon, {
      fontSize: '48px'
    }).setOrigin(0.5);

    // 游戏名称
    const title = this.add.text(-cardWidth / 2 + 120, -15, game.name, {
      ...TEXT_STYLES.TITLE_MEDIUM,
      fontSize: '32px',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);

    const titleEn = this.add.text(-cardWidth / 2 + 120, 15, game.nameEn, {
      ...TEXT_STYLES.SMALL,
      color: '#aaaaaa'
    }).setOrigin(0, 0.5);

    // 描述
    const desc = this.add.text(-cardWidth / 2 + 120, 40, game.description, {
      ...TEXT_STYLES.SMALL,
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0, 0.5);

    // 播放按钮
    const playBtn = this.add.text(cardWidth / 2 - 80, 0, '开始 ▶', {
      ...TEXT_STYLES.HUD,
      backgroundColor: '#00d4ff',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5);

    container.add([card, iconBg, icon, title, titleEn, desc, playBtn]);

    // 设置交互
    card.setInteractive(
      new Phaser.Geom.Rectangle(-cardWidth / 2, -height / 2, cardWidth, height),
      Phaser.Geom.Rectangle.Contains
    );

    // 鼠标悬停效果
    card.on('pointerover', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1.02,
        scaleY: 1.02,
        duration: 200,
        ease: 'Power2'
      });
      card.clear();
      card.fillStyle(0x3d3d54, 1);
      card.fillRoundedRect(-cardWidth / 2, -height / 2, cardWidth, height, 16);
      card.lineStyle(3, game.color, 1);
      card.strokeRoundedRect(-cardWidth / 2, -height / 2, cardWidth, height, 16);
    });

    card.on('pointerout', () => {
      this.tweens.add({
        targets: container,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
      card.clear();
      card.fillStyle(0x2d2d44, 1);
      card.fillRoundedRect(-cardWidth / 2, -height / 2, cardWidth, height, 16);
      card.lineStyle(3, game.color, 0.6);
      card.strokeRoundedRect(-cardWidth / 2, -height / 2, cardWidth, height, 16);
    });

    // 点击启动游戏
    card.on('pointerdown', () => {
      // 缩放动画
      this.tweens.add({
        targets: container,
        scaleX: 0.95,
        scaleY: 0.95,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // 淡出效果
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start(game.scene);
          });
        }
      });
    });

    // 添加闪烁动画
    this.tweens.add({
      targets: playBtn,
      alpha: 0.7,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
