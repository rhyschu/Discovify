import { ElMessage } from 'element-plus'

export function hexToRgb(str: string): number[] | void {
  const reg: RegExp = /^#?[0-9A-Fa-f]{6}$/
  if (!reg.test(str)) {
    ElMessage.warning('Invalid hex')
    return
  }
  str = str.replace('#', '')
  const hexs: string[] = str.match(/../g) ?? []
  const rgb: number[] = hexs.map((h) => parseInt(h, 16))
  return rgb
}

export function rgbToHex(r: number, g: number, b: number): string | void {
  const reg: RegExp = /^\d{1,3}$/
  if (!reg.test(String(r)) || !reg.test(String(g)) || !reg.test(String(b))) {
    ElMessage.warning('Invalid RGB color value')
    return
  }
  const hexs: string[] = [r, g, b].map((n) => n.toString(16).padStart(2, '0'))
  return `#${hexs.join('')}`
}

export function getDarkColor(color: string, level: number): string | void {
  const reg: RegExp = /^#?[0-9A-Fa-f]{6}$/
  if (!reg.test(color)) {
    ElMessage.warning('Invalid hex color value')
    return
  }
  let rgb = hexToRgb(color)
  if (!rgb) return
  rgb = rgb.map((c) => Math.floor(c * (1 - level)))
  return rgbToHex(rgb[0], rgb[1], rgb[2])
}

export function getLightColor(color: string, level: number): string | void {
  const reg: RegExp = /^#?[0-9A-Fa-f]{6}$/
  if (!reg.test(color)) {
    ElMessage.warning('Invalid hex color value')
    return
  }
  let rgb = hexToRgb(color)
  if (!rgb) return
  rgb = rgb.map((c) => Math.floor((255 - c) * level + c))
  return rgbToHex(rgb[0], rgb[1], rgb[2])
}

export function rgbaToHex(rgba: string): string {
  const regex = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/
  const match = rgba.match(regex)
  if (!match) {
    throw new Error('Invalid RGBA string')
  }
  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)
  const hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  return `#${hex}`
}
