const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const fs = require('fs');
const path = require('path');

class AnalyticsService {
  constructor() {
    this.propertyId = 'properties/434237022'; // Your GA4 property ID for G-1L4XD6LG6Z
    this.analyticsDataClient = null;
    
    // Initialize client if credentials are available
    this.initializeClient();
  }

  initializeClient() {
    try {
      // Try to initialize the client with service account credentials
      // This would require setting up a service account and downloading the JSON key
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials/ga-service-account.json';
      
      if (fs.existsSync(credentialsPath)) {
        this.analyticsDataClient = new BetaAnalyticsDataClient({
          keyFilename: credentialsPath
        });
        console.log('✅ Google Analytics Data API client initialized');
      } else {
        console.log('⚠️  Google Analytics service account credentials not found. Some analytics features will be limited.');
        console.log('   To enable full analytics features, set up a service account and set GOOGLE_APPLICATION_CREDENTIALS environment variable.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Google Analytics client:', error.message);
    }
  }

  // Generate enhanced GTM/GA4 tracking code with custom events
  generateTrackingScript(gaId = 'G-1L4XD6LG6Z') {
    return `
    <!-- Enhanced Google Analytics 4 with Event Tracking -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${gaId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      
      // Enhanced GA4 configuration
      gtag('config', '${gaId}', {
        // Enhanced measurement settings
        send_page_view: true,
        anonymize_ip: true,
        allow_google_signals: true,
        
        // Custom parameters
        custom_map: {
          'custom_parameter_1': 'resume_section',
          'custom_parameter_2': 'user_action'
        }
      });
      
      // Enhanced event tracking for resume interactions
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
            const value = this.href.replace(/^(tel:|mailto:)/, '');
            
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
        
        // Track time on page
        let timeOnPageInterval;
        let timeOnPage = 0;
        
        timeOnPageInterval = setInterval(function() {
          timeOnPage += 30;
          if (timeOnPage % 60 === 0) { // Every minute
            gtag('event', 'time_on_page', {
              event_category: 'Engagement',
              event_label: Math.floor(timeOnPage / 60) + ' minutes',
              time_on_page: timeOnPage,
              custom_parameter_2: 'time_tracking'
            });
          }
        }, 30000); // Check every 30 seconds
        
        // Clean up on page unload
        window.addEventListener('beforeunload', function() {
          clearInterval(timeOnPageInterval);
        });
      });
    </script>`;
  }

  // Get basic analytics data (requires service account setup)
  async getPageViews(startDate = '7daysAgo', endDate = 'today') {
    if (!this.analyticsDataClient) {
      console.log('Analytics client not initialized. Cannot fetch data.');
      return null;
    }

    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate,
          },
        ],
        dimensions: [
          {
            name: 'date',
          },
        ],
        metrics: [
          {
            name: 'screenPageViews',
          },
          {
            name: 'sessions',
          },
          {
            name: 'engagementRate',
          },
        ],
      });

      return {
        success: true,
        data: response.rows?.map(row => ({
          date: row.dimensionValues[0].value,
          pageViews: row.metricValues[0].value,
          sessions: row.metricValues[1].value,
          engagementRate: row.metricValues[2].value,
        })) || []
      };
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get top events
  async getTopEvents(startDate = '7daysAgo', endDate = 'today') {
    if (!this.analyticsDataClient) {
      return null;
    }

    try {
      const [response] = await this.analyticsDataClient.runReport({
        property: this.propertyId,
        dateRanges: [
          {
            startDate: startDate,
            endDate: endDate,
          },
        ],
        dimensions: [
          {
            name: 'eventName',
          },
        ],
        metrics: [
          {
            name: 'eventCount',
          },
        ],
        orderBys: [
          {
            metric: {
              metricName: 'eventCount',
            },
            desc: true,
          },
        ],
      });

      return {
        success: true,
        data: response.rows?.map(row => ({
          eventName: row.dimensionValues[0].value,
          count: row.metricValues[0].value,
        })) || []
      };
    } catch (error) {
      console.error('Error fetching events data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate analytics report
  async generateReport() {
    console.log('📊 Generating Google Analytics Report...');
    
    const pageViews = await this.getPageViews();
    const events = await this.getTopEvents();
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        analyticsEnabled: true,
        trackingId: 'G-1L4XD6LG6Z',
        dataApiEnabled: !!this.analyticsDataClient
      },
      data: {
        pageViews: pageViews?.data || [],
        topEvents: events?.data || []
      }
    };
    
    // Save report
    const reportPath = './analytics-report.json';
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 Analytics report saved to ${reportPath}`);
    
    return report;
  }
}

module.exports = AnalyticsService;

// CLI usage
if (require.main === module) {
  const analytics = new AnalyticsService();
  
  const command = process.argv[2];
  
  switch (command) {
    case 'report':
      analytics.generateReport();
      break;
    case 'test':
      console.log('Testing analytics integration...');
      console.log('Tracking ID: G-1L4XD6LG6Z');
      console.log('Enhanced tracking script generated');
      break;
    default:
      console.log('Available commands:');
      console.log('  report - Generate analytics report');
      console.log('  test   - Test analytics integration');
  }
}