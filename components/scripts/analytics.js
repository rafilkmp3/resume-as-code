        // QR Code sharing functionality - Simplified (no runtime generation needed)
        document.addEventListener('DOMContentLoaded', function() {
            const shareQrBtn = document.getElementById('share-qr-btn');
            const qrModal = document.getElementById('qr-modal');
            const qrModalClose = document.getElementById('qr-modal-close');
            const qrCopyBtn = document.getElementById('qr-copy-btn');
            const qrDownloadBtn = document.getElementById('qr-download-btn');
            const qrCodeImage = document.getElementById('qr-code-image');
            
            // Function to open QR modal - No generation needed, using pre-built images!
            async function openQrModal() {
                qrModal.style.display = 'flex';
                qrModal.classList.add('show'); // Enable enhanced animations
                document.body.style.overflow = 'hidden';

                // QR codes are now pre-generated at build time - much faster!
                // No CDN dependencies or runtime generation needed

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
                    const url = '{{qrCodeUrl}}';
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
                    textArea.value = '{{qrCodeUrl}}';
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
