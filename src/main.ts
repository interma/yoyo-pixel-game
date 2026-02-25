import './style.css';
import Phaser from 'phaser';
import MenuScene from './scenes/MenuScene';
import CoinChaserScene from './scenes/CoinChaserScene';
import ScrollRunnerScene from './scenes/ScrollRunnerScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: 'game',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 800 },
      debug: false
    }
  },
  scene: [MenuScene, CoinChaserScene, ScrollRunnerScene],
  pixelArt: true, // 启用像素艺术模式，保持像素清晰
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

new Phaser.Game(config);

