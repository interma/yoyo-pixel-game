/**
 * 角色配置接口
 */
export interface CharacterConfig {
  id: string;
  name: string;
  texture: string;
  color: string;
  description: string;
}

/**
 * 游戏中可用的角色列表
 */
export const CHARACTERS: CharacterConfig[] = [
  {
    id: 'sonic',
    name: 'Sonic',
    texture: 'player',
    color: '#0080ff',
    description: '速度快，可按F飞行'
  },
  {
    id: 'shadow',
    name: 'Shadow',
    texture: 'player2',
    color: '#ff0000',
    description: '力量强，全能型'
  },
  {
    id: 'amy',
    name: 'Amy',
    texture: 'player3',
    color: '#ff00ff',
    description: '灵活，擅长跳跃'
  }
];

/**
 * 根据ID查找角色配置
 */
export function getCharacterById(id: string): CharacterConfig | undefined {
  return CHARACTERS.find(char => char.id === id);
}

/**
 * 根据纹理名称查找角色配置
 */
export function getCharacterByTexture(texture: string): CharacterConfig | undefined {
  return CHARACTERS.find(char => char.texture === texture);
}
