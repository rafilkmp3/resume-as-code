#!/usr/bin/env node

/**
 * Template Assembly Script
 * Assembles modular components back into template.html
 *
 * This replaces the monolithic 6,115-line template.html with a component-based architecture
 */

const fs = require('fs');
const path = require('path');

console.log('🧩 Assembling template.html from components...');

try {
    // Read all component files
    const headComponent = fs.readFileSync('components/head.html', 'utf8');
    const cssComponent = fs.readFileSync('components/styles/main.css', 'utf8');
    const bodyComponent = fs.readFileSync('components/body.html', 'utf8');
    const mainJS = fs.readFileSync('components/scripts/main.js', 'utf8');
    const themeJS = fs.readFileSync('components/scripts/theme-toggle.js', 'utf8');
    const analyticsJS = fs.readFileSync('components/scripts/analytics.js', 'utf8');

    // Assemble the complete template
    const assembledTemplate = `${headComponent}
    <style>
${cssComponent}
    </style>
${bodyComponent.replace('</head>', '').replace('<body>', '').replace('</body>', '').replace('</html>', '')}

    <script>
${mainJS}
    </script>

    <script>
${themeJS}
    </script>

    <script>
${analyticsJS}
    </script>

</body>
</html>`;

    // Write the assembled template
    fs.writeFileSync('template.html.new', assembledTemplate);

    console.log('✅ Template assembled successfully!');
    console.log('📊 Component Statistics:');
    console.log(`   Head: ${headComponent.split('\n').length} lines`);
    console.log(`   CSS: ${cssComponent.split('\n').length} lines`);
    console.log(`   Body: ${bodyComponent.split('\n').length} lines`);
    console.log(`   Main JS: ${mainJS.split('\n').length} lines`);
    console.log(`   Theme JS: ${themeJS.split('\n').length} lines`);
    console.log(`   Analytics JS: ${analyticsJS.split('\n').length} lines`);
    console.log(`   Total: ${assembledTemplate.split('\n').length} lines`);

    console.log('🔄 To activate: mv template.html.new template.html');

} catch (error) {
    console.error('❌ Template assembly failed:', error.message);
    process.exit(1);
}
