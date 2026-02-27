/**
 * UI Configuration
 * 
 * 集中管理游戏UI的通用配置，包括字体、颜色、边距等
 */

/**
 * 字体配置
 */
export const FONTS = {
  // 主字体：Verdana（清晰易读）+ 中文字体栈
  PRIMARY: 'Verdana, "Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
  // 备用字体（如需要）
  SECONDARY: '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", sans-serif',
};

/**
 * 文字边距配置
 * 用于防止中文字符顶部被裁剪
 */
export const TEXT_PADDING = {
  // 标准边距：适用于大多数文本
  STANDARD: {
    top: 10,
    bottom: 10,
    left: 5,
    right: 5,
  },
  // 紧凑边距：适用于空间有限的UI元素
  COMPACT: {
    top: 8,
    bottom: 8,
    left: 4,
    right: 4,
  },
  // 宽松边距：适用于标题等重要文本
  RELAXED: {
    top: 12,
    bottom: 12,
    left: 6,
    right: 6,
  },
  // 无边距：适用于特殊情况
  NONE: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
};

/**
 * 文字描边配置
 */
export const TEXT_STROKE = {
  // 标准描边：适用于大多数文本
  STANDARD: {
    stroke: '#000000',
    strokeThickness: 4,
  },
  // 粗描边：适用于标题
  THICK: {
    stroke: '#000000',
    strokeThickness: 6,
  },
  // 细描边：适用于小字
  THIN: {
    stroke: '#000000',
    strokeThickness: 2,
  },
  // 无描边
  NONE: {
    stroke: '',
    strokeThickness: 0,
  },
};

/**
 * 常用颜色配置
 */
export const COLORS = {
  // 主色调
  PRIMARY: '#ffffff',
  SECONDARY: '#ffff00',
  // 状态颜色
  SUCCESS: '#00ff00',
  ERROR: '#ff0000',
  WARNING: '#ffaa00',
  INFO: '#00d4ff',
  // 交互颜色
  HOVER: '#00ffff',
  DISABLED: '#666666',
};

/**
 * 文字样式预设
 * 将常用的样式组合封装为预设
 */
export const TEXT_STYLES = {
  // 大标题
  TITLE_LARGE: {
    fontSize: '48px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.PRIMARY,
    ...TEXT_STROKE.THICK,
    padding: TEXT_PADDING.RELAXED,
  },
  // 中标题
  TITLE_MEDIUM: {
    fontSize: '36px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.PRIMARY,
    ...TEXT_STROKE.STANDARD,
    padding: TEXT_PADDING.STANDARD,
  },
  // 小标题
  TITLE_SMALL: {
    fontSize: '28px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.PRIMARY,
    ...TEXT_STROKE.STANDARD,
    padding: TEXT_PADDING.STANDARD,
  },
  // 副标题
  SUBTITLE: {
    fontSize: '24px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.SECONDARY,
    ...TEXT_STROKE.STANDARD,
    padding: TEXT_PADDING.STANDARD,
  },
  // 正文
  BODY: {
    fontSize: '20px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.PRIMARY,
    ...TEXT_STROKE.THIN,
    padding: TEXT_PADDING.STANDARD,
  },
  // 小字
  SMALL: {
    fontSize: '16px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.PRIMARY,
    ...TEXT_STROKE.THIN,
    padding: TEXT_PADDING.COMPACT,
  },
  // HUD文本（分数、生命等）
  HUD: {
    fontSize: '24px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.PRIMARY,
    ...TEXT_STROKE.STANDARD,
    padding: TEXT_PADDING.STANDARD,
  },
  // 按钮文本
  BUTTON: {
    fontSize: '20px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.PRIMARY,
    ...TEXT_STROKE.STANDARD,
    padding: TEXT_PADDING.COMPACT,
  },
  // 链接文本
  LINK: {
    fontSize: '16px',
    fontFamily: FONTS.PRIMARY,
    color: COLORS.INFO,
    ...TEXT_STROKE.THIN,
    padding: TEXT_PADDING.STANDARD,
  },
};

/**
 * 辅助函数：创建自定义文本样式
 * @param baseStyle 基础样式（从TEXT_STYLES中选择）
 * @param overrides 覆盖的属性
 * @returns 合并后的样式对象
 */
export function createTextStyle(
  baseStyle: typeof TEXT_STYLES[keyof typeof TEXT_STYLES],
  overrides: Partial<Phaser.Types.GameObjects.Text.TextStyle> = {}
): Phaser.Types.GameObjects.Text.TextStyle {
  return { ...baseStyle, ...overrides };
}

/**
 * 辅助函数：为已存在的文本对象应用样式
 * @param text Phaser文本对象
 * @param style 样式对象
 */
export function applyTextStyle(
  text: Phaser.GameObjects.Text,
  style: Partial<Phaser.Types.GameObjects.Text.TextStyle>
): void {
  text.setStyle(style);
}
