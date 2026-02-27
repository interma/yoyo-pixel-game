/**
 * 音效系统模块
 * 使用 Web Audio API 程序化生成复古风格的音效
 */

/**
 * 音效管理器
 */
export class SoundManager {
  private audioContext: AudioContext;
  private masterGain: GainNode;
  private musicGain: GainNode;
  private sfxGain: GainNode;
  private musicInterval: number | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 主音量控制
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.3;
    this.masterGain.connect(this.audioContext.destination);

    // 音乐音量
    this.musicGain = this.audioContext.createGain();
    this.musicGain.gain.value = 0.15;
    this.musicGain.connect(this.masterGain);

    // 音效音量
    this.sfxGain = this.audioContext.createGain();
    this.sfxGain.gain.value = 0.2;
    this.sfxGain.connect(this.masterGain);
  }

  /**
   * 播放跳跃音效
   */
  playJump(): void {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 播放收集金币音效
   */
  playCoin(): void {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.type = 'square';
    osc.start(now);
    osc.stop(now + 0.1);
  }

  /**
   * 播放敌人碰撞音效
   */
  playHit(): void {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.2);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.type = 'sawtooth';
    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * 播放游戏胜利音效
   */
  playVictory(): void {
    const now = this.audioContext.currentTime;
    const notes = [523, 587, 659, 784]; // C, D, E, G

    notes.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      const startTime = now + index * 0.15;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);

      osc.type = 'sine';
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  /**
   * 播放游戏失败音效
   */
  playGameOver(): void {
    const now = this.audioContext.currentTime;
    const notes = [392, 349, 330, 294]; // G, F, E, D (下降)

    notes.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      const startTime = now + index * 0.2;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);

      osc.type = 'triangle';
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  /**
   * 播放敌人消灭音效
   */
  playEnemyDefeat(): void {
    const now = this.audioContext.currentTime;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.15);
    
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    osc.type = 'square';
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * 播放无敌护盾激活音效
   */
  playPowerUp(): void {
    const now = this.audioContext.currentTime;
    const notes = [440, 554, 659, 880]; // A, C#, E, A (琶音上升)

    notes.forEach((freq, index) => {
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.sfxGain);

      const startTime = now + index * 0.08;
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.2);

      osc.type = 'sine';
      osc.start(startTime);
      osc.stop(startTime + 0.2);
    });
  }

  /**
   * 播放背景音乐 - 欢快风格（金币追逐）
   */
  playBackgroundMusicHappy(): void {
    this.stopBackgroundMusic();

    const melody = [
      { note: 523, duration: 0.3 }, // C
      { note: 587, duration: 0.3 }, // D
      { note: 659, duration: 0.3 }, // E
      { note: 523, duration: 0.3 }, // C
      { note: 659, duration: 0.3 }, // E
      { note: 523, duration: 0.3 }, // C
      { note: 784, duration: 0.6 }, // G
      { note: 659, duration: 0.6 }, // E
    ];

    let currentIndex = 0;
    const playNote = () => {
      if (currentIndex >= melody.length) {
        currentIndex = 0;
      }

      const { note, duration } = melody[currentIndex];
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.type = 'square';
      osc.start(now);
      osc.stop(now + duration);

      currentIndex++;
    };

    // 每个音符间隔播放
    this.musicInterval = window.setInterval(playNote, 300);
  }

  /**
   * 播放背景音乐 - 紧张风格（古堡逃亡）
   */
  playBackgroundMusicTense(): void {
    this.stopBackgroundMusic();

    const melody = [
      { note: 440, duration: 0.2 }, // A
      { note: 440, duration: 0.2 }, // A
      { note: 493, duration: 0.2 }, // B
      { note: 440, duration: 0.2 }, // A
      { note: 392, duration: 0.2 }, // G
      { note: 349, duration: 0.2 }, // F
      { note: 330, duration: 0.4 }, // E
      { note: 330, duration: 0.4 }, // E
    ];

    let currentIndex = 0;
    const playNote = () => {
      if (currentIndex >= melody.length) {
        currentIndex = 0;
      }

      const { note, duration } = melody[currentIndex];
      const now = this.audioContext.currentTime;
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.frequency.setValueAtTime(note, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.type = 'triangle';
      osc.start(now);
      osc.stop(now + duration);

      currentIndex++;
    };

    // 更快的节奏
    this.musicInterval = window.setInterval(playNote, 220);
  }

  /**
   * 停止背景音乐
   */
  stopBackgroundMusic(): void {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  /**
   * 设置主音量
   */
  setMasterVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * 设置音乐音量
   */
  setMusicVolume(volume: number): void {
    this.musicGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * 设置音效音量
   */
  setSfxVolume(volume: number): void {
    this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * 静音/取消静音
   */
  toggleMute(): void {
    if (this.masterGain.gain.value > 0) {
      this.masterGain.gain.value = 0;
    } else {
      this.masterGain.gain.value = 0.3;
    }
  }

  /**
   * 清理资源
   */
  destroy(): void {
    this.stopBackgroundMusic();
    this.audioContext.close();
  }
}

/**
 * 创建全局音效管理器实例
 */
let globalSoundManager: SoundManager | null = null;

export function getSoundManager(): SoundManager {
  if (!globalSoundManager) {
    globalSoundManager = new SoundManager();
  }
  return globalSoundManager;
}
