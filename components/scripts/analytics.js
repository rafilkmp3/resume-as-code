        // QR Code sharing functionality
        document.addEventListener('DOMContentLoaded', function() {
            const shareQrBtn = document.getElementById('share-qr-btn');
            const qrModal = document.getElementById('qr-modal');
            const qrModalClose = document.getElementById('qr-modal-close');
            const qrCopyBtn = document.getElementById('qr-copy-btn');
            const qrDownloadBtn = document.getElementById('qr-download-btn');
            const qrCodeImage = document.getElementById('qr-code-image');
            // Function to open QR modal and generate QR code dynamically
            async function openQrModal() {
                qrModal.style.display = 'flex';
                qrModal.classList.add('show'); // Enable enhanced animations
                document.body.style.overflow = 'hidden';

                // Generate QR code dynamically when modal opens (much more efficient!)
                const resumeURL = '{{basics.url}}' || window.location.href;
                await generateQRCodeOnDemand(resumeURL);

                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'qr_code_open', {
                        event_category: 'Share',
                        event_label: 'Resume QR Code',
                        custom_parameter_1: 'download_menu',
                        custom_parameter_2: 'qr_share'
                    });
                }
            }

            // Dynamic QR code generation function
            async function generateQRCodeOnDemand(url) {
                const modalCanvas = document.getElementById('qr-code-image');
                const printCanvas = document.getElementById('print-qr-code');

                try {
                    // Load QR code library dynamically from CDN (only when needed!)
                    if (!window.QRCode) {
                        await loadQRCodeLibrary();
                    }

                    // Generate QR code for modal (larger)
                    if (modalCanvas && window.QRCode) {
                        await window.QRCode.toCanvas(modalCanvas, url, {
                            width: 200,
                            height: 200,
                            margin: 1,
                            color: {
                                dark: '#2563eb',  // Professional blue
                                light: '#FFFFFF'
                            }
                        });
                    }

                    // Generate QR code for print (smaller)
                    if (printCanvas && window.QRCode) {
                        await window.QRCode.toCanvas(printCanvas, url, {
                            width: 100,
                            height: 100,
                            margin: 1,
                            color: {
                                dark: '#2563eb',
                                light: '#FFFFFF'
                            }
                        });
                    }
                } catch (error) {
                    console.warn('Dynamic QR generation failed, using fallback:', error);
                    generateFallbackQR(modalCanvas, printCanvas, url);
                }
            }

            // Load QR code library from CDN only when needed
            function loadQRCodeLibrary() {
                return new Promise((resolve, reject) => {
                    if (window.QRCode) {
                        resolve();
                        return;
                    }

                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js';
                    script.async = true;

                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load QR library'));

                    document.head.appendChild(script);
                });
            }

            // Fallback QR generation using external service
            function generateFallbackQR(modalCanvas, printCanvas, url) {
                const modalSize = 200;
                const printSize = 100;

                // Use qr-server.com as fallback (lightweight external service)
                const modalURL = `https://api.qrserver.com/v1/create-qr-code/?size=${modalSize}x${modalSize}&data=${encodeURIComponent(url)}&color=2563eb&bgcolor=ffffff&margin=10`;
                const printURL = `https://api.qrserver.com/v1/create-qr-code/?size=${printSize}x${printSize}&data=${encodeURIComponent(url)}&color=2563eb&bgcolor=ffffff&margin=5`;

                // Load images and draw to canvas
                [
                    { canvas: modalCanvas, url: modalURL, size: modalSize },
                    { canvas: printCanvas, url: printURL, size: printSize }
                ].forEach(({ canvas, url, size }) => {
                    if (canvas) {
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = () => {
                            const ctx = canvas.getContext('2d');
                            canvas.width = size;
                            canvas.height = size;
                            ctx.drawImage(img, 0, 0);
                        };
                        img.src = url;
                    }
                });
            }

            // Event listener for QR modal opening
            shareQrBtn?.addEventListener('click', openQrModal);

            // Close QR modal with enhanced animations
            function closeQRModal() {
                qrModal.classList.remove('show'); // Trigger enhanced close animation
                document.body.style.overflow = 'auto';

                // Hide modal after animation completes
                setTimeout(() => {
                    qrModal.style.display = 'none';
                }, 400); // Match animation duration
            }

            qrModalClose?.addEventListener('click', closeQRModal);

            // Close modal when clicking outside
            qrModal?.addEventListener('click', function(e) {
                if (e.target === qrModal) {
                    closeQRModal();
                }
            });

            // Copy URL to clipboard
            qrCopyBtn?.addEventListener('click', async function() {
                try {
                    const url = '{{basics.url}}';
                    await navigator.clipboard.writeText(url);

                    // Visual feedback
                    const originalText = qrCopyBtn.textContent;
                    qrCopyBtn.textContent = 'Copied!';
                    qrCopyBtn.style.backgroundColor = 'var(--color-success)';

                    setTimeout(() => {
                        qrCopyBtn.textContent = originalText;
                        qrCopyBtn.style.backgroundColor = '';
                    }, 2000);

                    // Analytics tracking
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'qr_url_copy', {
                            event_category: 'Share',
                            event_label: 'Copy Resume URL',
                            custom_parameter_2: 'url_copy'
                        });
                    }
                } catch (err) {
                    console.error('Failed to copy URL:', err);
                    // Fallback for older browsers
                    const textArea = document.createElement('textarea');
                    textArea.value = '{{basics.url}}';
                    document.body.appendChild(textArea);
                    textArea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textArea);
                }
            });

            // Download QR code
            qrDownloadBtn?.addEventListener('click', function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);

                    // Create download link
                    const link = document.createElement('a');
                    link.download = 'resume-qr-code.png';
                    link.href = canvas.toDataURL();
                    link.click();

                    // Analytics tracking
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'qr_code_download', {
                            event_category: 'Share',
                            event_label: 'Download QR Code',
                            custom_parameter_2: 'qr_download'
                        });
                    }
                };

                img.src = qrCodeImage.src;
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && qrModal.classList.contains('show')) {
                    closeQRModal();
                }
            });
        });
