        // Dark Mode Toggle Functionality
        const themeToggle = document.getElementById('darkToggle');
        const body = document.body;

        // Function to detect OS theme preference
        function getSystemTheme() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        // Function to apply theme - SVG icons are handled by CSS, no need to set text content
        function applyTheme(theme) {
            if (theme === 'dark') {
                body.setAttribute('data-theme', 'dark');
            } else {
                body.removeAttribute('data-theme');
            }
        }

        // Initialize theme immediately
        function initializeTheme() {
            const savedTheme = localStorage.getItem('theme');
            const systemTheme = getSystemTheme();
            const initialTheme = savedTheme || systemTheme;
            console.log('Initializing theme:', { initialTheme, savedTheme, systemTheme });
            applyTheme(initialTheme);
        }

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeTheme);
        } else {
            initializeTheme();
        }

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            // Only auto-switch if user hasn't manually set a preference
            if (!localStorage.getItem('theme')) {
                console.log('System theme changed to:', e.matches ? 'dark' : 'light');
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });

        themeToggle.addEventListener('click', () => {
            const isDark = body.getAttribute('data-theme') === 'dark';
            const newTheme = isDark ? 'light' : 'dark';

            localStorage.setItem('theme', newTheme);
            applyTheme(newTheme);
        });

        // Double-click to reset to auto (system preference)
        themeToggle.addEventListener('dblclick', () => {
            localStorage.removeItem('theme');
            applyTheme(getSystemTheme());
        });

        // Theme Manager for Print Integration
        window.ThemeManager = {
            getCurrentTheme: function() {
                return body.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
            },

            setTheme: function(theme) {
                applyTheme(theme);
            },

            switchToLightForPrint: function() {
                const currentTheme = this.getCurrentTheme();
                if (currentTheme === 'dark') {
                    // Switch to light theme for print
                    this.setTheme('light');
                    return 'dark'; // Return original theme for restoration
                }
                return null; // No change needed
            },

            restoreThemeAfterPrint: function(originalTheme) {
                if (originalTheme) {
                    this.setTheme(originalTheme);
                }
            }
        };

        // Enhanced print functionality with automatic light mode switching
        function printResume() {
            const originalTheme = window.ThemeManager.switchToLightForPrint();

            // Small delay to ensure theme change is rendered
            setTimeout(() => {
                window.print();

                // Restore theme after print dialog closes (when focus returns)
                const restoreTheme = () => {
                    window.ThemeManager.restoreThemeAfterPrint(originalTheme);
                    window.removeEventListener('focus', restoreTheme);
                };

                // Wait for print dialog to close
                window.addEventListener('focus', restoreTheme);

                // Fallback: restore after a reasonable timeout
                setTimeout(() => {
                    window.ThemeManager.restoreThemeAfterPrint(originalTheme);
                }, 3000);
            }, 100);
        }

        // Override default print if needed
        if (typeof window.originalPrint === 'undefined') {
            window.originalPrint = window.print;
            window.print = printResume;
        }

        // Enhanced PDF Download with Mobile Sharing for all versions
        function enhancePDFDownload() {
            const pdfLinks = document.querySelectorAll('.pdf-link');
            if (!pdfLinks.length) return;

            pdfLinks.forEach(link => {
                // Check if device supports native sharing
                if (navigator.share && window.innerWidth <= 768) {
                    link.addEventListener('click', async (e) => {
                        e.preventDefault();

                        try {
                            const pdfUrl = `${window.location.origin}${window.location.pathname.replace('/index.html', '')}${link.getAttribute('href')}`;
                            const pdfType = link.textContent;

                            await navigator.share({
                                title: `Rafael Sathler - Resume (${pdfType})`,
                                text: `Check out Rafael's ${pdfType.toLowerCase()}-optimized resume`,
                                url: pdfUrl
                            });
                        } catch (error) {
                            // If sharing fails, fall back to regular download
                            console.log('Share failed, falling back to download');
                            window.open(link.getAttribute('href'), '_blank');
                        }
                    });

                    // Add visual feedback for mobile
                    link.addEventListener('touchstart', () => {
                        link.style.transform = 'scale(0.95)';
                    });

                    link.addEventListener('touchend', () => {
                        link.style.transform = 'scale(1)';
                    });
                }
            });
        }

        // Initialize PDF download enhancement
        enhancePDFDownload();


        // ATS-Friendly Version Generator
        function generateATS() {
            // Create ATS-friendly content
            const resumeData = JSON.parse(document.getElementById('resume-data').textContent);
            const atsContent = generateATSContent(resumeData);

            // Create and download as text file
            const blob = new Blob([atsContent], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Rafael_Sathler_Resume_ATS.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Show success message
            showATSMessage();
        }

        function generateATSContent(data) {
            let content = '';

            // Basics
            content += `${data.basics.name.toUpperCase()}\n`;
            content += `${data.basics.label}\n\n`;

            // Contact
            content += 'CONTACT INFORMATION\n';
            content += `Location: ${data.basics.location.city}, ${data.basics.location.region}\n`;
            content += `Phone: ${data.basics.phone}\n`;
            content += `Email: ${data.basics.email}\n`;
            data.basics.profiles.forEach(profile => {
                if (profile.network !== 'Guinness World Record') {
                    content += `${profile.network}: ${profile.url}\n`;
                }
            });
            content += '\n';

            // Summary
            content += 'PROFESSIONAL SUMMARY\n';
            content += `${data.basics.summary}\n\n`;

            // Skills
            content += 'CORE COMPETENCIES\n';
            data.skills.forEach(skill => {
                content += `• ${skill.name.replace(/☁️|🐳|🔄|📊|💻|📈|🔒|🤝/g, '').trim()}: ${skill.keywords.join(', ')}\n`;
            });
            content += '\n';

            // Experience
            content += 'PROFESSIONAL EXPERIENCE\n\n';
            data.work.forEach(job => {
                content += `${job.position.toUpperCase()} | ${job.name} | ${(job.url ? job.url + ' | ' : '')}${job.startDate} - ${job.endDate || 'Present'}\n`;
                job.highlights.forEach(highlight => {
                    content += `• ${highlight}\n`;
                });
                content += '\n';
            });

            // Projects
            if(data.projects && data.projects.length > 0) {
                content += 'KEY PROJECTS\n\n';
                data.projects.forEach(project => {
                    content += `${project.name} | ${project.url}\n`;
                    content += `${project.description}\n`;
                    project.highlights.forEach(highlight => {
                        content += `• ${highlight}\n`;
                    });
                    if(project.keywords && project.keywords.length > 0){
                        content += `Technologies: ${project.keywords.join(', ')}\n`;
                    }
                    content += '\n';
                });
            }

            // Education
            content += 'EDUCATION\n';
            data.education.forEach(edu => {
                content += `${edu.studyType} in ${edu.area}\n`;
                content += `${edu.institution} | ${edu.startDate} - ${edu.endDate}\n\n`;
            });

            // Certifications
            if(data.certificates && data.certificates.length > 0){
                content += 'CERTIFICATIONS\n';
                data.certificates.forEach(cert => {
                    content += `• ${cert.name} | ${cert.date} | ${cert.issuer}\n`;
                });
                content += '\n';
            }

            // Personal
            content += 'NATIONALITY & LANGUAGES\n';
            content += `Nationality: ${data.basics.nationality}\n`;
            if(data.basics.languages && data.basics.languages.length > 0){
                content += `Languages: ${data.basics.languages.join(', ')}\n`;
            }

            return content;
        }

        function showATSMessage() {
            // Create temporary message overlay
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                color: white;
                font-family: inherit;
            `;

            const message = document.createElement('div');
            message.style.cssText = `
                background: var(--bg-secondary);
                color: var(--text-primary);
                padding: 2rem;
                border-radius: 12px;
                text-align: center;
                max-width: 500px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            `;

            message.innerHTML = `
                <h2 style="margin-bottom: 1rem; color: var(--gradient-start);">✅ ATS Version Generated!</h2>
                <p style="margin-bottom: 1rem; line-height: 1.6;">Your ATS-friendly resume has been downloaded as <strong>Rafael_Sathler_Resume_ATS.txt</strong></p>
                <p style="margin-bottom: 1.5rem; font-size: 0.9em; opacity: 0.8;">This plain text version removes emojis and formatting for better compatibility with Applicant Tracking Systems.</p>
                <button onclick="document.body.removeChild(arguments[0].target.closest('.overlay'))" aria-label="Close modal dialog"
                        style="background: var(--gradient-start); color: white; border: none; padding: 0.8rem 1.5rem; border-radius: 6px; cursor: pointer; font-size: 1rem;">
                    Close
                </button>
            `;

            overlay.className = 'overlay';
            overlay.appendChild(message);
            document.body.appendChild(overlay);

            // Auto-close after 5 seconds
            setTimeout(() => {
                if (document.body.contains(overlay)) {
                    document.body.removeChild(overlay);
                }
            }, 5000);
        }

        // Simple Download Button - Direct PDF download (no complex menu needed)
        // The download button is now a direct link to the PDF file
        // No JavaScript needed - browser handles the download naturally

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + Shift + D for dark mode toggle (avoid conflict with browser bookmarks)
            if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                themeToggle.click();
            }
            // Ctrl/Cmd + P for print
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                window.print();
            }
            // Ctrl/Cmd + S for share QR code
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                const shareBtn = document.getElementById('share-qr-btn');
                if (shareBtn) {
                    shareBtn.click();
                }
            }
        });

        // Smooth animations for theme transitions
        document.documentElement.style.setProperty('--transition', 'all 0.3s ease');

        // Parallax Effect
        function initParallax() {
            const parallaxBg = document.getElementById('parallaxBg');

            function updateParallax() {
                const scrolled = window.pageYOffset;
                const rate = scrolled * -0.5;

                // Move background slower than scroll
                if (parallaxBg) {
                    parallaxBg.style.transform = `translate3d(0, ${rate}px, 0)`;
                }
            }

            // Throttled scroll listener for performance
            let ticking = false;
            function requestTick() {
                if (!ticking) {
                    requestAnimationFrame(updateParallax);
                    ticking = true;
                }
            }

            window.addEventListener('scroll', () => {
                requestTick();
                ticking = false;
            });

            // Initial call
            updateParallax();
        }

        // Initialize parallax after DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initParallax);
        } else {
            initParallax();
        }

        // Fix auto-scroll bug - ensure page stays at top
        window.addEventListener('load', () => {
            // Force scroll to top after everything loads
            window.scrollTo(0, 0);
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });

        // Immediately show all sections for instant loading
        const sections = document.querySelectorAll('.fade-in-section');
        sections.forEach(section => {
            section.classList.add('is-visible');
            section.style.opacity = '1';
            section.style.transform = 'none';
        });

        // Add a small delay to prevent initial scroll jumping
        setTimeout(() => {
            sections.forEach(section => {
                observer.observe(section);
            });
        }, 100);

        // Enhanced work date with duration calculation
        function calculateDuration(startDate, endDate) {
            const start = new Date(startDate + '-01');
            const end = endDate === 'Present' ? new Date() : new Date(endDate + '-01');

            const diffTime = Math.abs(end - start);
            const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));

            if (diffMonths < 12) {
                return diffMonths === 1 ? '1 month' : `${diffMonths} months`;
            } else {
                const years = Math.floor(diffMonths / 12);
                const remainingMonths = diffMonths % 12;

                let result = years === 1 ? '1 year' : `${years} years`;
                if (remainingMonths > 0) {
                    result += remainingMonths === 1 ? ', 1 month' : `, ${remainingMonths} months`;
                }
                return result;
            }
        }

        // Enhanced interactive duration system
        function initializeDateComponents() {
            const workDates = document.querySelectorAll('.work-date');

            workDates.forEach(dateElement => {
                const startDate = dateElement.dataset.start;
                const endDate = dateElement.dataset.end;
                const dateContainer = dateElement.querySelector('.date-container');
                const durationBadge = dateElement.querySelector('.duration-badge');
                const durationTotal = dateElement.querySelector('.duration-total');
                const durationYears = dateElement.querySelector('.duration-years');

                if (startDate && endDate) {
                    // Calculate duration
                    const duration = calculateDuration(startDate, endDate);
                    const start = new Date(startDate + '-01');
                    const end = endDate === 'Present' ? new Date() : new Date(endDate + '-01');
                    const diffTime = Math.abs(end - start);
                    const totalMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
                    const years = Math.floor(totalMonths / 12);
                    const months = totalMonths % 12;

                    // Set duration badge text
                    if (durationBadge) {
                        durationBadge.textContent = duration;
                    }

                    // Set detailed breakdown
                    if (durationTotal) {
                        durationTotal.textContent = duration;
                    }
                    if (durationYears) {
                        if (years > 0) {
                            durationYears.textContent = years === 1 ? '1 yr' : `${years} yrs`;
                        } else {
                            durationYears.textContent = 'Recent';
                        }
                    }

                    // Add click/touch interaction
                    if (dateContainer) {
                        // Toggle expansion on click/touch
                        dateContainer.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            dateElement.classList.toggle('expanded');

                            // Update ARIA attributes
                            const isExpanded = dateElement.classList.contains('expanded');
                            dateContainer.setAttribute('aria-expanded', isExpanded);
                            const details = dateElement.querySelector('.duration-details');
                            if (details) {
                                details.setAttribute('aria-hidden', !isExpanded);
                            }
                        });

                        // Keyboard support
                        dateContainer.addEventListener('keydown', (e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                dateContainer.click();
                            }
                        });

                        // Close on outside click
                        document.addEventListener('click', (e) => {
                            if (!dateElement.contains(e.target)) {
                                dateElement.classList.remove('expanded');
                                dateContainer.setAttribute('aria-expanded', 'false');
                                const details = dateElement.querySelector('.duration-details');
                                if (details) {
                                    details.setAttribute('aria-hidden', 'true');
                                }
                            }
                        });

                        // Initial ARIA setup
                        dateContainer.setAttribute('aria-expanded', 'false');
                        const details = dateElement.querySelector('.duration-details');
                        if (details) {
                            details.setAttribute('aria-hidden', 'true');
                        }
                    }
                }
            });
        }

        // Simplified date display - no complex duration calculations needed

        // Enhanced Experience Pagination System
        function initializeExperiencePagination() {
            const workItems = document.querySelectorAll('.work-item:not(.project-item)'); // Exclude project items
            const loadMoreBtn = document.getElementById('load-more-btn');
            const loadMoreContainer = document.getElementById('load-more-container');
            const shownCountElement = document.getElementById('shown-count');
            const totalCountElement = document.getElementById('total-count');
            const remainingCountElement = document.getElementById('remaining-count');

            // Failsafe: Ensure all work items are visible if pagination fails
            if (!workItems || workItems.length === 0) {
                console.warn('No work items found for experience pagination');
                return;
            }

            // Proper pagination setup - show initial items, hide the rest
            {
                const INITIAL_SHOW = 3;
            let currentlyShown = INITIAL_SHOW;
            const totalItems = workItems.length;

            // Properly set initial visibility: show first 3, hide the rest
            workItems.forEach((item, index) => {
                if (index < INITIAL_SHOW) {
                    item.style.display = 'block';
                    item.style.visibility = 'visible';
                    item.classList.remove('hidden');
                } else {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }
            });

            if (totalItems <= INITIAL_SHOW) {
                // If we have 3 or fewer items, show all and hide the load more button
                workItems.forEach(item => {
                    item.style.display = 'block';
                    item.style.visibility = 'visible';
                    item.classList.remove('hidden');
                });
                if (loadMoreContainer) loadMoreContainer.style.display = 'none';
                return;
            }

            // Initially hide items beyond the first 3
            workItems.forEach((item, index) => {
                if (index >= INITIAL_SHOW) {
                    item.style.display = 'none';
                    item.classList.add('hidden');
                }
            });

            // Show load more container if we have hidden items
            if (loadMoreContainer && totalItems > INITIAL_SHOW) {
                loadMoreContainer.style.display = 'block';
                loadMoreContainer.classList.remove('hidden');
            }

            // Update counters
            function updateCounters() {
                const remaining = totalItems - currentlyShown;
                if (shownCountElement) shownCountElement.textContent = Math.min(currentlyShown, totalItems);
                if (totalCountElement) totalCountElement.textContent = totalItems;
                if (remainingCountElement) remainingCountElement.textContent = Math.max(remaining, 0);

                // Hide load more button if all items are shown
                if (remaining <= 0 && loadMoreContainer) {
                    loadMoreContainer.classList.add('hidden');
                }
            }

            updateCounters();

            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', () => {
                    // Show next batch of items (show all remaining)
                    workItems.forEach((item, index) => {
                        if (index >= currentlyShown) {
                            item.style.display = 'block';
                            item.classList.remove('hidden');
                            item.classList.add('fade-in');

                            // Stagger the animation
                            setTimeout(() => {
                                item.classList.remove('fade-in');
                            }, (index - currentlyShown) * 100);
                        }
                    });

                    currentlyShown = totalItems;
                    updateCounters();

                    // Smooth scroll to show the newly revealed items
                    setTimeout(() => {
                        const firstNewItem = workItems[INITIAL_SHOW];
                        if (firstNewItem) {
                            firstNewItem.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start'
                            });
                        }
                    }, 300);
                });
            }
            }
        }

        // Make functions globally accessible
        window.initializeExperiencePagination = initializeExperiencePagination;

        // Initialize pagination after DOM loads
        document.addEventListener('DOMContentLoaded', function() {
            initializeExperiencePagination();
        });

        // Dynamic Projects Pagination System
        function initializeProjectsPagination() {
            const projectItems = document.querySelectorAll('.project-item');
            const loadMoreBtn = document.getElementById('load-more-projects-btn');
            const loadMoreContainer = document.getElementById('load-more-projects-container');
            const remainingCountElement = document.getElementById('projects-remaining-count');

            // Failsafe: Ensure all projects are visible if pagination fails
            if (!projectItems || projectItems.length === 0) {
                console.warn('No project items found for pagination');
                return;
            }

            // Proper pagination setup - only show initial items
            {
                // Dynamic initial show count based on screen size
            function getInitialShowCount() {
                if (window.innerWidth >= 1200) return 2; // Desktop: show 2 projects initially
                if (window.innerWidth >= 768) return 2;  // Tablet: show 2 projects
                return 1; // Mobile: show 1 project
            }

            let currentlyShown = getInitialShowCount();
            const totalItems = projectItems.length;

            // Ensure initial items are always visible
            projectItems.forEach((item, index) => {
                if (index < currentlyShown) {
                    item.style.display = 'block';
                    item.style.visibility = 'visible';
                }
            });

            // If we don't have enough items to paginate, hide the load more button and show all items
            if (totalItems <= currentlyShown) {
                projectItems.forEach(item => {
                    item.style.display = 'block';
                    item.style.visibility = 'visible';
                });
                if (loadMoreContainer) loadMoreContainer.style.display = 'none';
                return;
            }

            // Initially hide items beyond the initial show count
            projectItems.forEach((item, index) => {
                if (index >= currentlyShown) {
                    item.style.display = 'none';
                }
            });

            // Show load more container if we have hidden items
            if (loadMoreContainer && totalItems > currentlyShown) {
                loadMoreContainer.style.display = 'block';
                loadMoreContainer.classList.remove('hidden');
            }

            // Update button text
            function updateLoadMoreButton() {
                const remaining = totalItems - currentlyShown;
                if (remainingCountElement) remainingCountElement.textContent = Math.max(remaining, 0);

                // Hide load more button if all items are shown
                if (remaining <= 0 && loadMoreContainer) {
                    loadMoreContainer.classList.add('hidden');
                }
            }

            updateLoadMoreButton();

            // Load more button click handler
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', function() {
                    const loadCount = window.innerWidth >= 1200 ? 2 : 1; // Load 2 on desktop, 1 on mobile/tablet
                    let itemsShown = 0;

                    // Show next batch of items
                    projectItems.forEach((item, index) => {
                        if (index >= currentlyShown && index < currentlyShown + loadCount && itemsShown < loadCount) {
                            item.style.display = 'block';
                            // Add fade-in animation
                            item.style.opacity = '0';
                            item.style.transform = 'translateY(20px)';

                            setTimeout(() => {
                                item.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                                item.style.opacity = '1';
                                item.style.transform = 'translateY(0)';
                            }, 100);

                            itemsShown++;
                        }
                    });

                    currentlyShown += itemsShown;
                    updateLoadMoreButton();

                    // Analytics tracking with app version
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'load_more_projects', {
                            event_category: 'Resume Interaction',
                            event_label: 'Projects Load More',
                            custom_parameter_1: 'projects_section',
                            custom_parameter_2: 'load_more_click',
                            custom_parameter_3: appVersion,
                            custom_parameter_4: environment,
                            items_loaded: itemsShown,
                            total_items: totalItems
                        });
                    }
                });
            }

            // Handle window resize to adjust pagination
            let resizeTimeout;
            window.addEventListener('resize', function() {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(function() {
                    const newInitialCount = getInitialShowCount();

                    // If the new initial count would show more items than currently shown,
                    // and we have items hidden, show more items
                    if (newInitialCount > currentlyShown && currentlyShown < totalItems) {
                        const itemsToShow = Math.min(newInitialCount, totalItems);

                        projectItems.forEach((item, index) => {
                            if (index < itemsToShow) {
                                item.style.display = 'block';
                            }
                        });

                        currentlyShown = itemsToShow;
                        updateLoadMoreButton();

                        // Show/hide load more button based on remaining items
                        if (loadMoreContainer) {
                            loadMoreContainer.style.display = currentlyShown < totalItems ? 'flex' : 'none';
                        }
                    }
                }, 250);
            });

            }
        }

        // Make function globally accessible
        window.initializeProjectsPagination = initializeProjectsPagination;

        document.addEventListener('DOMContentLoaded', function() {
            initializeProjectsPagination();
        });

        // Education Pagination System
        function initializeEducationPagination() {
            const educationItems = document.querySelectorAll('.education-item');
            const loadMoreBtn = document.getElementById('load-more-education-btn');
            const loadMoreContainer = document.getElementById('load-more-education-container');
            const visibleCountSpan = document.getElementById('education-visible-count');

            if (!educationItems || educationItems.length === 0) {
                console.warn('No education items found for pagination');
                return;
            }

            // Desktop: 1, Tablet: 1, Mobile: 1 (education is typically short)
            const itemsToShow = {
                desktop: 1,
                tablet: 1,
                mobile: 1
            };

            let currentlyShown = itemsToShow.desktop;

            function getItemsToShow() {
                const width = window.innerWidth;
                if (width <= 768) return itemsToShow.mobile;
                if (width <= 1024) return itemsToShow.tablet;
                return itemsToShow.desktop;
            }

            function updatePagination() {
                currentlyShown = Math.min(getItemsToShow(), educationItems.length);

                // Failsafe: Ensure all education items are visible if pagination fails
                if (!educationItems || educationItems.length === 0) {
                    console.warn('No education items found for pagination');
                    return;
                }

                // Show initial items
                educationItems.forEach((item, index) => {
                    if (index < currentlyShown) {
                        item.style.display = 'block';
                        item.style.visibility = 'visible';
                        item.classList.remove('hidden');
                    } else {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }
                });

                // Update counter
                if (visibleCountSpan) {
                    visibleCountSpan.textContent = currentlyShown;
                }

                // Show/hide load more button
                if (loadMoreContainer && loadMoreBtn) {
                    if (currentlyShown < educationItems.length) {
                        loadMoreContainer.style.display = 'block';
                        loadMoreContainer.classList.remove('hidden');
                    } else {
                        loadMoreContainer.style.display = 'none';
                        loadMoreContainer.classList.add('hidden');
                    }
                }
            }

            // Load more functionality
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', function(e) {
                    e.preventDefault();

                    const itemsPerLoad = getItemsToShow();
                    const newShown = Math.min(currentlyShown + itemsPerLoad, educationItems.length);

                    // Show additional items with animation
                    for (let i = currentlyShown; i < newShown; i++) {
                        if (educationItems[i]) {
                            educationItems[i].style.display = 'block';
                            educationItems[i].style.visibility = 'visible';
                            educationItems[i].classList.remove('hidden');
                            educationItems[i].classList.add('fade-in');
                        }
                    }

                    currentlyShown = newShown;

                    // Update counter
                    if (visibleCountSpan) {
                        visibleCountSpan.textContent = currentlyShown;
                    }

                    // Hide load more if all shown
                    if (currentlyShown >= educationItems.length && loadMoreContainer) {
                        loadMoreContainer.style.display = 'none';
                        loadMoreContainer.classList.add('hidden');
                    }

                    // Analytics tracking
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'load_more_education', {
                            'event_category': 'engagement',
                            'event_label': 'education_pagination',
                            'value': currentlyShown
                        });
                    }
                });
            }

            // Initial setup
            if (educationItems.length > 0) {
                updatePagination();

                // Handle responsive changes
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(updatePagination, 300);
                });
            } else {
                // Fallback: hide controls if no education items
                if (loadMoreContainer) {
                    loadMoreContainer.style.display = 'none';
                }
                if (visibleCountSpan) {
                    visibleCountSpan.textContent = '0';
                }
            }

        }

        // Make function globally accessible
        window.initializeEducationPagination = initializeEducationPagination;

        document.addEventListener('DOMContentLoaded', function() {
            initializeEducationPagination();
        });

        // Skills Pagination System
        function initializeSkillsPagination() {
            const skillItems = document.querySelectorAll('.skill-category-item');
            const loadMoreBtn = document.getElementById('load-more-skills-btn');
            const loadMoreContainer = document.getElementById('load-more-skills-container');
            const visibleCountSpan = document.getElementById('skills-visible-count');

            // Desktop: Show all, Tablet: 6, Mobile: 3 (better utilization of vertical space)
            const itemsToShow = {
                desktop: 999, // Show all skills on desktop - no need to paginate
                tablet: 6,    // More skills on tablet
                mobile: 3     // Slightly more on mobile
            };

            let currentlyShown = itemsToShow.desktop;

            function getItemsToShow() {
                const width = window.innerWidth;
                if (width <= 768) return itemsToShow.mobile;
                if (width <= 1024) return itemsToShow.tablet;
                return itemsToShow.desktop;
            }

            function updatePagination() {
                currentlyShown = Math.min(getItemsToShow(), skillItems.length);

                // Failsafe: Ensure all skill items are visible if pagination fails
                if (!skillItems || skillItems.length === 0) {
                    console.warn('No skill items found for pagination');
                    return;
                }

                // Show initial items
                skillItems.forEach((item, index) => {
                    if (index < currentlyShown) {
                        item.style.display = 'block';
                        item.style.visibility = 'visible';
                        item.classList.remove('hidden');
                    } else {
                        item.style.display = 'none';
                        item.classList.add('hidden');
                    }
                });

                // Update counter and hide/show it based on pagination need
                const skillsCounter = document.getElementById('skills-counter');
                if (visibleCountSpan) {
                    visibleCountSpan.textContent = currentlyShown;
                }

                // Hide counter when all skills are visible (no pagination needed)
                if (skillsCounter) {
                    if (currentlyShown >= skillItems.length) {
                        skillsCounter.style.display = 'none';
                    } else {
                        skillsCounter.style.display = 'block';
                    }
                }

                // Show/hide load more button
                if (loadMoreContainer && loadMoreBtn) {
                    if (currentlyShown < skillItems.length) {
                        loadMoreContainer.style.display = 'block';
                        loadMoreContainer.classList.remove('hidden');
                    } else {
                        loadMoreContainer.style.display = 'none';
                        loadMoreContainer.classList.add('hidden');
                    }
                }
            }

            // Load more functionality
            if (loadMoreBtn) {
                loadMoreBtn.addEventListener('click', function(e) {
                    e.preventDefault();

                    const itemsPerLoad = getItemsToShow();
                    const newShown = Math.min(currentlyShown + itemsPerLoad, skillItems.length);

                    // Show additional items with animation
                    for (let i = currentlyShown; i < newShown; i++) {
                        if (skillItems[i]) {
                            skillItems[i].style.display = 'block';
                            skillItems[i].style.visibility = 'visible';
                            skillItems[i].classList.remove('hidden');
                            skillItems[i].classList.add('fade-in');
                        }
                    }

                    currentlyShown = newShown;

                    // Update counter and hide/show based on pagination need
                    const skillsCounter = document.getElementById('skills-counter');
                    if (visibleCountSpan) {
                        visibleCountSpan.textContent = currentlyShown;
                    }

                    // Hide counter when all skills are visible
                    if (skillsCounter) {
                        if (currentlyShown >= skillItems.length) {
                            skillsCounter.style.display = 'none';
                        } else {
                            skillsCounter.style.display = 'block';
                        }
                    }

                    // Hide load more if all shown
                    if (currentlyShown >= skillItems.length && loadMoreContainer) {
                        loadMoreContainer.style.display = 'none';
                        loadMoreContainer.classList.add('hidden');
                    }

                    // Analytics tracking
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'load_more_skills', {
                            'event_category': 'engagement',
                            'event_label': 'skills_pagination',
                            'value': currentlyShown
                        });
                    }
                });
            }

            // Initial setup
            if (skillItems.length > 0) {
                updatePagination();

                // Handle responsive changes
                let resizeTimeout;
                window.addEventListener('resize', () => {
                    clearTimeout(resizeTimeout);
                    resizeTimeout = setTimeout(updatePagination, 300);
                });
            } else {
                // Fallback: hide controls if no skill items
                if (loadMoreContainer) {
                    loadMoreContainer.style.display = 'none';
                }
                if (visibleCountSpan) {
                    visibleCountSpan.textContent = '0';
                }
            }
        }

        // Make function globally accessible
        window.initializeSkillsPagination = initializeSkillsPagination;

        document.addEventListener('DOMContentLoaded', initializeSkillsPagination);
