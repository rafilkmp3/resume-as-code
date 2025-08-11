      document.addEventListener('DOMContentLoaded', function() {
        // Track theme toggle
        const themeToggle = document.querySelector('.dark-toggle');
        if (themeToggle) {
          themeToggle.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            gtag('event', 'theme_change', {
              event_category: 'UI Interaction',
              event_label: newTheme,
              custom_parameter_2: 'theme_toggle'
            });
          });
        }

        // Track skill tag clicks
        document.querySelectorAll('.skill-tag').forEach(function(tag) {
          tag.addEventListener('click', function() {
            const skillName = this.textContent.trim();
            gtag('event', 'skill_click', {
              event_category: 'Resume Interaction',
              event_label: skillName,
              custom_parameter_1: 'skills_section',
              custom_parameter_2: 'skill_tag_click'
            });
          });
        });

        // Track work experience expand/collapse
        document.querySelectorAll('.work-date').forEach(function(dateElement) {
          dateElement.addEventListener('click', function() {
            const companyName = this.closest('.work-item')?.querySelector('.work-title')?.textContent?.trim() || 'Unknown';
            gtag('event', 'work_experience_expand', {
              event_category: 'Resume Interaction',
              event_label: companyName,
              custom_parameter_1: 'experience_section',
              custom_parameter_2: 'date_expand'
            });
          });
        });

        // Track load more experience button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
          loadMoreBtn.addEventListener('click', function() {
            gtag('event', 'load_more_experience', {
              event_category: 'Resume Interaction',
              event_label: 'Load More Button',
              custom_parameter_1: 'experience_section',
              custom_parameter_2: 'load_more_click'
            });
          });
        }

        // Track external link clicks
        document.querySelectorAll('.link-item, .skill-tag[href], a[href^="http"]').forEach(function(link) {
          link.addEventListener('click', function() {
            const url = this.href;
            const linkText = this.textContent.trim();

            gtag('event', 'external_link_click', {
              event_category: 'Outbound Link',
              event_label: linkText,
              link_url: url,
              custom_parameter_2: 'external_link'
            });
          });
        });

        // Track contact link clicks
        document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]').forEach(function(link) {
          link.addEventListener('click', function() {
            const type = this.href.startsWith('tel:') ? 'phone' : 'email';

            gtag('event', 'contact_click', {
              event_category: 'Contact',
              event_label: type,
              contact_method: type,
              custom_parameter_2: 'contact_interaction'
            });
          });
        });

        // Track print attempts
        window.addEventListener('beforeprint', function() {
          gtag('event', 'resume_print', {
            event_category: 'User Action',
            event_label: 'Print Resume',
            custom_parameter_2: 'print_action'
          });
        });

        // Track scroll depth for engagement
        let maxScrollDepth = 0;
        let scrollTimer;

        window.addEventListener('scroll', function() {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function() {
            const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);

            if (scrollDepth > maxScrollDepth && scrollDepth >= 25 && scrollDepth % 25 === 0) {
              maxScrollDepth = scrollDepth;
              gtag('event', 'scroll_depth', {
                event_category: 'Engagement',
                event_label: scrollDepth + '%',
                scroll_depth: scrollDepth,
                custom_parameter_2: 'scroll_tracking'
              });
            }
          }, 300);
        });

        // Back to Top Button Functionality
        const backToTopBtn = document.getElementById('back-to-top-btn');

        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
          if (window.scrollY > 300) {
            backToTopBtn.classList.add('visible');
          } else {
            backToTopBtn.classList.remove('visible');
          }
        });

        // Smooth scroll to top
        backToTopBtn.addEventListener('click', function() {
          window.scrollTo({
            top: 0,
            behavior: 'smooth'
          });

          // Track back to top clicks
          if (typeof gtag !== 'undefined') {
            gtag('event', 'back_to_top_click', {
              event_category: 'Navigation',
              event_label: 'Back to Top Button',
              custom_parameter_2: 'navigation_aid'
            });
          }
        });

        // Keyboard accessibility for back to top
        backToTopBtn.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.click();
          }
        });
      });
