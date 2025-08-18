#!/usr/bin/env node

/**
 * Resume Auto-Updater for Release Please Integration
 * 
 * Automatically updates resume data based on configuration during release process.
 * Integrates with Release Please to keep resume data current and accurate.
 * 
 * Usage:
 *   node scripts/resume-auto-updater.js           # Apply all updates
 *   node scripts/resume-auto-updater.js --dry-run # Preview changes only
 *   node scripts/resume-auto-updater.js --config  # Show current config
 */

const fs = require('fs');
const path = require('path');

class ResumeAutoUpdater {
    constructor() {
        this.resumeDataPath = path.join(process.cwd(), 'src/resume-data.json');
        this.configPath = path.join(process.cwd(), 'config/resume-auto-update.json');
        this.isDryRun = process.argv.includes('--dry-run');
        this.showConfig = process.argv.includes('--config');
    }

    /**
     * Load current resume data
     */
    loadResumeData() {
        try {
            const data = fs.readFileSync(this.resumeDataPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('❌ Failed to load resume data:', error.message);
            process.exit(1);
        }
    }

    /**
     * Load auto-update configuration
     */
    loadConfig() {
        try {
            if (!fs.existsSync(this.configPath)) {
                return this.getDefaultConfig();
            }
            const data = fs.readFileSync(this.configPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.warn('⚠️ Failed to load config, using defaults:', error.message);
            return this.getDefaultConfig();
        }
    }

    /**
     * Default configuration for automatic updates
     */
    getDefaultConfig() {
        return {
            enabled: true,
            updateFields: {
                // Automatically update last updated timestamp
                lastUpdated: {
                    enabled: true,
                    field: "meta.lastUpdated",
                    value: "current_date",
                    format: "YYYY-MM-DD"
                },
                // Update availability status based on config
                availability: {
                    enabled: true,
                    field: "basics.availability",
                    value: "open_to_work", // or "not_available"
                    display: {
                        open_to_work: {
                            icon: "🟢",
                            text: "Open to Work",
                            types: ["Full-time", "Contract"]
                        },
                        not_available: {
                            icon: "🟡", 
                            text: "Currently Employed",
                            types: []
                        }
                    }
                },
                // Update current position end date to present
                currentPosition: {
                    enabled: true,
                    field: "work[0].endDate",
                    value: null, // null means "Present"
                    condition: "if_current_position"
                },
                // Update website URLs to production
                websiteUrls: {
                    enabled: true,
                    fields: [
                        "basics.url",
                        "projects[*].url"
                    ],
                    replacements: {
                        "deploy-preview-*": "https://rafilkmp3.github.io/resume-as-code/",
                        "resume-as-code.netlify.app": "https://rafilkmp3.github.io/resume-as-code/",
                        "localhost:*": "https://rafilkmp3.github.io/resume-as-code/"
                    }
                },
                // Update project highlights with latest achievements
                projectHighlights: {
                    enabled: true,
                    field: "projects[0].highlights", // Resume-as-Code project
                    append: [
                        "Released v{{version}} with enhanced industry-standard version management",
                        "Achieved {{commits_total}}+ commits of continuous improvement and feature development"
                    ],
                    maxHighlights: 6
                }
            },
            conditionalUpdates: {
                // Only update if it's been more than 30 days since last update
                timeBased: {
                    enabled: true,
                    minimumDaysBetweenUpdates: 30
                },
                // Only update for minor/major version releases
                versionBased: {
                    enabled: true,
                    triggerOnVersionTypes: ["major", "minor"]
                }
            }
        };
    }

    /**
     * Get current date in specified format
     */
    getCurrentDate(format = 'YYYY-MM-DD') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day);
    }

    /**
     * Get git information for template variables
     */
    async getGitInfo() {
        const { execSync } = require('child_process');
        
        try {
            const totalCommits = execSync('git rev-list --all --count', { encoding: 'utf8' }).trim();
            const version = process.env.RELEASE_VERSION || this.getPackageVersion();
            
            return {
                version,
                commits_total: totalCommits
            };
        } catch (error) {
            console.warn('⚠️ Could not get git info:', error.message);
            return {
                version: '4.2.0',
                commits_total: '100'
            };
        }
    }

    /**
     * Get package version
     */
    getPackageVersion() {
        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            return packageJson.version;
        } catch (error) {
            return '4.2.0';
        }
    }

    /**
     * Apply template variables to string
     */
    applyTemplateVariables(text, variables) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return variables[key] || match;
        });
    }

    /**
     * Set nested object property using dot notation
     */
    setNestedProperty(obj, path, value) {
        const keys = path.split('.');
        let current = obj;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (key.includes('[') && key.includes(']')) {
                // Handle array notation like "work[0]" or "projects[*]"
                const [arrayKey, indexStr] = key.split(/[\[\]]/);
                const index = indexStr === '*' ? 0 : parseInt(indexStr, 10);
                
                if (!current[arrayKey]) current[arrayKey] = [];
                if (!current[arrayKey][index]) current[arrayKey][index] = {};
                current = current[arrayKey][index];
            } else {
                if (!current[key]) current[key] = {};
                current = current[key];
            }
        }
        
        const finalKey = keys[keys.length - 1];
        current[finalKey] = value;
    }

    /**
     * Get nested object property using dot notation
     */
    getNestedProperty(obj, path) {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (key.includes('[') && key.includes(']')) {
                const [arrayKey, indexStr] = key.split(/[\[\]]/);
                const index = indexStr === '*' ? 0 : parseInt(indexStr, 10);
                current = current[arrayKey]?.[index];
            } else {
                current = current[key];
            }
            if (current === undefined) return undefined;
        }
        
        return current;
    }

    /**
     * Check if conditions are met for update
     */
    shouldUpdate(config, resumeData) {
        if (!config.conditionalUpdates) return true;
        
        // Check time-based conditions
        if (config.conditionalUpdates.timeBased?.enabled) {
            const lastUpdated = this.getNestedProperty(resumeData, 'meta.lastUpdated');
            if (lastUpdated) {
                const daysSinceUpdate = (Date.now() - new Date(lastUpdated)) / (1000 * 60 * 60 * 24);
                if (daysSinceUpdate < config.conditionalUpdates.timeBased.minimumDaysBetweenUpdates) {
                    console.log(`⏸️ Skipping update: Only ${Math.floor(daysSinceUpdate)} days since last update`);
                    return false;
                }
            }
        }
        
        return true;
    }

    /**
     * Apply automatic updates to resume data
     */
    async applyUpdates() {
        console.log('🔄 Starting Resume Auto-Updater...\n');
        
        const config = this.loadConfig();
        const resumeData = this.loadResumeData();
        const gitInfo = await this.getGitInfo();
        
        if (!config.enabled) {
            console.log('❌ Auto-updater is disabled in configuration');
            return;
        }
        
        if (!this.shouldUpdate(config, resumeData)) {
            return;
        }
        
        console.log('📋 Configuration loaded:', Object.keys(config.updateFields).length, 'update rules');
        console.log('📊 Git info:', gitInfo);
        
        let changesApplied = 0;
        const updates = [];
        
        // Ensure meta object exists
        if (!resumeData.meta) {
            resumeData.meta = {};
        }
        
        // Process each update rule
        for (const [updateName, updateConfig] of Object.entries(config.updateFields)) {
            if (!updateConfig.enabled) continue;
            
            console.log(`\n🔧 Processing: ${updateName}`);
            
            try {
                switch (updateName) {
                    case 'lastUpdated':
                        const currentDate = this.getCurrentDate(updateConfig.format);
                        resumeData.meta.lastUpdated = currentDate;
                        updates.push(`Updated lastUpdated to ${currentDate}`);
                        changesApplied++;
                        break;
                        
                    case 'availability':
                        const availabilityValue = updateConfig.value;
                        const display = updateConfig.display[availabilityValue];
                        if (display) {
                            resumeData.meta.availability = {
                                status: availabilityValue,
                                icon: display.icon,
                                text: display.text,
                                types: display.types
                            };
                            updates.push(`Updated availability to "${display.text}"`);
                            changesApplied++;
                        }
                        break;
                        
                    case 'websiteUrls':
                        const prodUrl = 'https://rafilkmp3.github.io/resume-as-code/';
                        if (resumeData.basics.url !== prodUrl) {
                            resumeData.basics.url = prodUrl;
                            updates.push('Updated basics.url to production URL');
                            changesApplied++;
                        }
                        // Update Resume-as-Code project URL
                        if (resumeData.projects && resumeData.projects[0]?.name?.includes('Resume-as-Code')) {
                            resumeData.projects[0].url = 'https://github.com/rafilkmp3/resume-as-code';
                            updates.push('Updated Resume-as-Code project URL');
                            changesApplied++;
                        }
                        break;
                        
                    case 'projectHighlights':
                        if (resumeData.projects && resumeData.projects[0]) {
                            const project = resumeData.projects[0];
                            const newHighlights = updateConfig.append.map(highlight => 
                                this.applyTemplateVariables(highlight, gitInfo)
                            );
                            
                            // Add new highlights if they don't already exist
                            for (const newHighlight of newHighlights) {
                                if (!project.highlights.some(h => h.includes(newHighlight.split(' ')[1]))) {
                                    project.highlights.push(newHighlight);
                                    updates.push(`Added project highlight: ${newHighlight.substring(0, 50)}...`);
                                    changesApplied++;
                                }
                            }
                            
                            // Limit total highlights
                            if (project.highlights.length > updateConfig.maxHighlights) {
                                project.highlights = project.highlights.slice(0, updateConfig.maxHighlights);
                                updates.push(`Limited project highlights to ${updateConfig.maxHighlights}`);
                            }
                        }
                        break;
                }
            } catch (error) {
                console.error(`❌ Failed to apply update ${updateName}:`, error.message);
            }
        }
        
        // Show summary
        console.log('\n📊 Update Summary:');
        console.log(`✅ Changes applied: ${changesApplied}`);
        
        if (updates.length > 0) {
            console.log('\n📋 Applied Updates:');
            updates.forEach(update => console.log(`   • ${update}`));
        }
        
        // Save changes or show dry run
        if (this.isDryRun) {
            console.log('\n🔍 DRY RUN - No changes were saved to file');
            console.log('\nPreview of updated resume-data.json:');
            console.log(JSON.stringify(resumeData, null, 2));
        } else if (changesApplied > 0) {
            fs.writeFileSync(this.resumeDataPath, JSON.stringify(resumeData, null, 2) + '\n');
            console.log(`\n💾 Updated resume data saved to ${this.resumeDataPath}`);
        } else {
            console.log('\n✨ No updates needed - resume data is current');
        }
    }

    /**
     * Check if Release Please PR exists and update it
     */
    async updateReleasePleasePR() {
        const config = this.loadConfig();
        
        if (!config.releasePlease?.enabled || !config.releasePlease?.keepBranchUpdated) {
            console.log('📋 Release Please PR updates disabled in configuration');
            return;
        }

        console.log('🔄 Checking for Release Please PR to update...\n');
        
        try {
            const { execSync } = require('child_process');
            
            // Check if there's an open Release Please PR
            const prListOutput = execSync('gh pr list --author="github-actions[bot]" --label="autorelease: pending" --json number,title,headRefName', { 
                encoding: 'utf8' 
            });
            
            const openPRs = JSON.parse(prListOutput);
            const releasePR = openPRs.find(pr => 
                (pr.title.includes('chore(release)') || pr.title.includes('🚀 v')) &&
                pr.headRefName.includes('release-please')
            );
            
            if (!releasePR) {
                console.log('📋 No Release Please PR found - updates will apply on next release');
                return;
            }
            
            console.log(`📦 Found Release Please PR #${releasePR.number}: ${releasePR.title}`);
            console.log(`🌿 Branch: ${releasePR.headRefName}`);
            
            // Checkout the Release Please branch
            console.log(`\n🔄 Switching to Release Please branch: ${releasePR.headRefName}`);
            execSync(`git fetch origin ${releasePR.headRefName}`);
            execSync(`git checkout ${releasePR.headRefName}`);
            
            // Apply updates to the branch
            console.log('\n🤖 Running Resume Auto-Updater on Release Please branch...');
            const resumeData = this.loadResumeData();
            const gitInfo = await this.getGitInfo();
            
            let changesApplied = 0;
            const updates = [];
            
            // Apply same updates as main process
            if (!resumeData.meta) {
                resumeData.meta = {};
            }
            
            // Process updates (simplified version focusing on key fields)
            for (const [updateName, updateConfig] of Object.entries(config.updateFields)) {
                if (!updateConfig.enabled) continue;
                
                switch (updateName) {
                    case 'lastUpdated':
                        const currentDate = this.getCurrentDate(updateConfig.format);
                        if (resumeData.meta.lastUpdated !== currentDate) {
                            resumeData.meta.lastUpdated = currentDate;
                            updates.push(`Updated lastUpdated to ${currentDate}`);
                            changesApplied++;
                        }
                        break;
                        
                    case 'projectHighlights':
                        if (resumeData.projects && resumeData.projects[0]) {
                            const project = resumeData.projects[0];
                            const newHighlights = updateConfig.append.map(highlight => 
                                this.applyTemplateVariables(highlight, gitInfo)
                            );
                            
                            for (const newHighlight of newHighlights) {
                                if (!project.highlights.some(h => h.includes(newHighlight.split(' ')[1]))) {
                                    project.highlights.push(newHighlight);
                                    updates.push(`Added project highlight: ${newHighlight.substring(0, 50)}...`);
                                    changesApplied++;
                                }
                            }
                            
                            if (project.highlights.length > updateConfig.maxHighlights) {
                                project.highlights = project.highlights.slice(0, updateConfig.maxHighlights);
                                updates.push(`Limited project highlights to ${updateConfig.maxHighlights}`);
                            }
                        }
                        break;
                }
            }
            
            if (changesApplied > 0) {
                // Save updated resume data
                fs.writeFileSync(this.resumeDataPath, JSON.stringify(resumeData, null, 2) + '\n');
                
                console.log(`\n📊 Applied ${changesApplied} updates to Release Please PR branch`);
                updates.forEach(update => console.log(`   • ${update}`));
                
                // Commit and push changes to the Release Please branch
                console.log('\n📝 Committing updates to Release Please branch...');
                execSync('git add src/resume-data.json');
                
                const commitMessage = config.releasePlease.autoCommit.message || 
                    'chore: automatic resume data updates for release\n\n🤖 Generated by resume-auto-updater';
                
                execSync(`git commit -m "${commitMessage}"`);
                execSync(`git push origin ${releasePR.headRefName}`);
                
                console.log('✅ Release Please PR updated with latest resume data');
                console.log(`🔗 View PR: https://github.com/rafilkmp3/resume-as-code/pull/${releasePR.number}`);
            } else {
                console.log('✨ Release Please PR already has current resume data');
            }
            
            // Switch back to main branch
            console.log('\n🔄 Switching back to main branch');
            execSync('git checkout main');
            
        } catch (error) {
            console.error('⚠️ Failed to update Release Please PR:', error.message);
            
            // Ensure we're back on main branch
            try {
                const { execSync } = require('child_process');
                execSync('git checkout main');
            } catch (checkoutError) {
                console.error('❌ Failed to switch back to main branch:', checkoutError.message);
            }
        }
    }

    /**
     * Show current configuration
     */
    showConfiguration() {
        const config = this.loadConfig();
        console.log('📋 Resume Auto-Updater Configuration:');
        console.log(JSON.stringify(config, null, 2));
    }

    /**
     * Main execution
     */
    async run() {
        try {
            if (this.showConfig) {
                this.showConfiguration();
            } else {
                await this.applyUpdates();
            }
        } catch (error) {
            console.error('❌ Resume Auto-Updater failed:', error.message);
            process.exit(1);
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const updater = new ResumeAutoUpdater();
    updater.run();
}

module.exports = ResumeAutoUpdater;