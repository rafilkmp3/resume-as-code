import QRCode from 'qrcode';

/**
 * Generate a secure, self-hosted QR code data URL
 * This replaces external API calls with safe, local generation
 */
export async function generateQRCodeDataURL(
  text: string, 
  options: {
    width?: number;
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<string> {
  try {
    const qrOptions = {
      width: options.width || 150,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF'
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const
    };

    return await QRCode.toDataURL(text, qrOptions);
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    
    // Fallback: return a minimal SVG placeholder
    const size = options.width || 150;
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <rect width="${size}" height="${size}" fill="#f0f0f0" stroke="#ccc"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="12" fill="#666">
          QR Code Error
        </text>
      </svg>
    `)}`;
  }
}

/**
 * Generate QR code for different use cases with predefined sizes
 */
export const QRCodePresets = {
  /**
   * Large QR code for screen viewing (150x150px)
   */
  screen: (url: string) => generateQRCodeDataURL(url, {
    width: 150,
    margin: 2,
    errorCorrectionLevel: 'M'
  }),

  /**
   * Medium QR code for print documents (120x120px)
   */
  print: (url: string) => generateQRCodeDataURL(url, {
    width: 120,
    margin: 1,
    errorCorrectionLevel: 'H' // Higher error correction for print
  }),

  /**
   * Small QR code for ATS documents (100x100px)
   */
  ats: (url: string) => generateQRCodeDataURL(url, {
    width: 100,
    margin: 1,
    errorCorrectionLevel: 'L', // Lower correction for smaller size
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
};