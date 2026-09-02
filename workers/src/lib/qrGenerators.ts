// QR code generator that works in Cloudflare Workers
// Using a simple implementation for demo purposes

export interface QRCodeOptions {
  width?: number
  margin?: number
  color?: {
    dark?: string
    light?: string
  }
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H'
}

// Generate QR code as SVG
export async function generateQRCode(
  text: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    width = 200,
    margin = 20,
    color = { dark: '#000000', light: '#ffffff' }
  } = options

  // Create a simple QR code pattern
  // This is a simplified version - in production you'd use a proper QR library
  const pattern = generateQRPattern(text)

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${width}" viewBox="0 0 ${width} ${width}">
  <rect width="${width}" height="${width}" fill="${color.light}"/>
`

  const cellSize = Math.floor((width - margin * 2) / pattern.length)

  // Draw the pattern
  for (let y = 0; y < pattern.length; y++) {
    for (let x = 0; x < pattern[y].length; x++) {
      if (pattern[y][x]) {
        const posX = margin + x * cellSize
        const posY = margin + y * cellSize
        svg += `<rect x="${posX}" y="${posY}" width="${cellSize}" height="${cellSize}" fill="${color.dark}"/>`
      }
    }
  }

  svg += '</svg>'
  return svg
}

// Simple QR pattern generator based on text hash
function generateQRPattern(text: string): number[][] {
  // Create a simple pattern based on text hash
  const hash = simpleHash(text)
  const size = 25
  const pattern: number[][] = []

  for (let y = 0; y < size; y++) {
    pattern[y] = []
    for (let x = 0; x < size; x++) {
      // Simple deterministic pattern
      const value = (hash + x * 7 + y * 11) % 3
      pattern[y][x] = value === 0 ? 1 : 0
    }
  }

  // Add finder patterns (corners)
  addFinderPattern(pattern, 0, 0)
  addFinderPattern(pattern, 0, size - 7)
  addFinderPattern(pattern, size - 7, 0)

  return pattern
}

function addFinderPattern(pattern: number[][][], x: number, y: number) {
  const finder = [
    [1,1,1,1,1,1,1],
    [1,0,0,0,0,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,1,1,1,0,1],
    [1,0,0,0,0,0,1],
    [1,1,1,1,1,1,1]
  ]

  for (let fy = 0; fy < 7; fy++) {
    for (let fx = 0; fx < 7; fx++) {
      if (y + fy < pattern.length && x + fx < pattern[0].length) {
        pattern[y + fy][x + fx] = finder[fy][fx]
      }
    }
  }
}

function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash)
}

// Create animated QR code
export async function createAnimatedQRCode(
  text: string,
  options: {
    size?: number
    margin?: number
    color?: {
      dark?: string
      light?: string
    }
    frames?: number
  } = {}
): Promise<string> {
  const { frames = 10 } = options

  const framesData = []

  for (let i = 0; i < frames; i++) {
    const modifiedText = text + `?frame=${i}&time=${Date.now()}`
    const svg = await generateQRCode(modifiedText, options)
    framesData.push(svg)
  }

  // Return the first frame for demo
  // In production, you'd create an animated GIF or use CSS animations
  return framesData[0]
}

// Create QR with logo
export async function createQRWithLogo(
  text: string,
  logoUrl?: string,
  options: {
    size?: number
    margin?: number
  } = {}
): Promise<string> {
  const svg = await generateQRCode(text, options)

  if (!logoUrl) {
    return svg
  }

  // Parse SVG and add logo
  const parser = new DOMParser()
  const doc = parser.parseFromString(svg, 'image/svg+xml')
  const svgElement = doc.querySelector('svg')

  if (!svgElement) return svg

  // Add logo background
  const rect = doc.createElementNS('http://www.w3.org/2000/svg', 'rect')
  const size = options.size || 200
  const logoSize = 60
  rect.setAttribute('x', String((size - logoSize) / 2 - 5))
  rect.setAttribute('y', String((size - logoSize) / 2 - 5))
  rect.setAttribute('width', String(logoSize + 10))
  rect.setAttribute('height', String(logoSize + 10))
  rect.setAttribute('fill', 'white')
  rect.setAttribute('rx', '10')

  // Add logo
  const image = doc.createElementNS('http://www.w3.org/2000/svg', 'image')
  image.setAttribute('href', logoUrl)
  image.setAttribute('x', String((size - logoSize) / 2))
  image.setAttribute('y', String((size - logoSize) / 2))
  image.setAttribute('width', String(logoSize))
  image.setAttribute('height', String(logoSize))

  svgElement.insertBefore(rect, svgElement.firstChild)
  svgElement.insertBefore(image, svgElement.firstChild)

  return new XMLSerializer().serializeToString(svgElement)
}