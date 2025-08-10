/**
 * Dynamic QR Code Generator
 *
 * Generates QR codes on-demand using a lightweight library instead of
 * embedding 2.9KB base64 data in HTML. Much more efficient approach!
 */

// Use a lightweight QR code library CDN
const QR_CODE_CDN = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';

class QRCodeGenerator {
    constructor() {
        this.qrCodeLibrary = null;
        this.initPromise = this.initializeQRLibrary();
    }

    /**
     * Initialize QR code library from CDN
     */
    async initializeQRLibrary() {
        try {
            // Check if QRCode is already available globally
            if (typeof window !== 'undefined' && window.QRCode) {
                this.qrCodeLibrary = window.QRCode;
                return true;
            }

            // Load QR code library dynamically
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = QR_CODE_CDN;
                script.async = true;

                script.onload = () => {
                    this.qrCodeLibrary = window.QRCode;
                    resolve(true);
                };

                script.onerror = () => {
                    console.warn('Failed to load QR code library from CDN');
                    reject(false);
                };

                document.head.appendChild(script);
            });
        } catch (error) {
            console.warn('QR code library initialization failed:', error);
            return false;
        }
    }

    /**
     * Generate QR code on-demand
     * @param {string} url - URL to encode in QR code
     * @param {HTMLElement} targetElement - Canvas or image element to render QR code
     * @param {Object} options - QR code generation options
     */
    async generateQRCode(url, targetElement, options = {}) {
        try {
            // Ensure QR library is loaded
            await this.initPromise;

            if (!this.qrCodeLibrary) {
                throw new Error('QR code library not available');
            }

            // Default QR code options with professional styling
            const defaultOptions = {
                width: 200,
                height: 200,
                margin: 1,
                color: {
                    dark: '#2563eb',  // Professional blue
                    light: '#FFFFFF'
                },
                errorCorrectionLevel: 'M'
            };

            const qrOptions = { ...defaultOptions, ...options };

            // Generate QR code
            if (targetElement.tagName === 'CANVAS') {
                // Generate directly to canvas
                await this.qrCodeLibrary.toCanvas(targetElement, url, qrOptions);
            } else if (targetElement.tagName === 'IMG') {
                // Generate data URL and set as image src
                const dataURL = await this.qrCodeLibrary.toDataURL(url, qrOptions);
                targetElement.src = dataURL;
            } else {
                throw new Error('Target element must be canvas or img');
            }

            return true;
        } catch (error) {
            console.warn('QR code generation failed:', error);
            return this.generateFallbackQR(targetElement, url);
        }
    }

    /**
     * Generate fallback QR code using simple patterns or external service
     */
    generateFallbackQR(targetElement, url) {
        try {
            // Use qr-server.com as fallback (lightweight external service)
            const fallbackURL = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}&color=2563eb&bgcolor=ffffff&margin=10`;

            if (targetElement.tagName === 'IMG') {
                targetElement.src = fallbackURL;
                return true;
            } else if (targetElement.tagName === 'CANVAS') {
                // Load image and draw to canvas
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => {
                    const ctx = targetElement.getContext('2d');
                    targetElement.width = 200;
                    targetElement.height = 200;
                    ctx.drawImage(img, 0, 0);
                };
                img.src = fallbackURL;
                return true;
            }
        } catch (error) {
            console.error('Fallback QR generation failed:', error);
            this.generateErrorPlaceholder(targetElement);
            return false;
        }
    }

    /**
     * Generate error placeholder when all QR generation methods fail
     */
    generateErrorPlaceholder(targetElement) {
        if (targetElement.tagName === 'CANVAS') {
            const ctx = targetElement.getContext('2d');
            targetElement.width = 200;
            targetElement.height = 200;

            // Draw simple error placeholder
            ctx.fillStyle = '#f7f7f7';
            ctx.fillRect(0, 0, 200, 200);

            ctx.fillStyle = '#999999';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('QR ERROR', 100, 100);
        } else if (targetElement.tagName === 'IMG') {
            // Use SVG data URL as placeholder
            targetElement.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OTk5OSI+UVIgRVJST1I8L3RleHQ+PC9zdmc+';
        }
    }
}

// Create global instance
window.qrGenerator = new QRCodeGenerator();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCodeGenerator;
}
