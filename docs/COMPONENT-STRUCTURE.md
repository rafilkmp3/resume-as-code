# Component Structure Plan

## Current State
- Single large `templates/template.html` file (~4900 lines)
- All CSS and HTML in one monolithic file
- Difficult to maintain and modify

## Proposed Component Structure

### CSS Components (`components/css/`)
- `base.css` - Core variables, reset, typography
- `theme.css` - Light/dark theme definitions
- `layout.css` - Grid system, responsive layouts
- `header.css` - Header and profile section styles
- `contact.css` - Traditional contact section (legacy)
- `liquid-glass.css` - iOS 2026 liquid glass contact section ✅
- `experience.css` - Work experience and projects
- `skills.css` - Skills and education sections
- `buttons.css` - Button components and interactions
- `modal.css` - QR code modal and overlays
- `print.css` - Print-specific styles
- `responsive.css` - Media queries and breakpoints

### HTML Components (`components/html/`)
- `head.html` - Meta tags, analytics, dependencies
- `header.html` - Profile photo, name, location, CTA
- `contact-liquid.html` - Liquid glass contact section ✅
- `contact-legacy.html` - Traditional contact section
- `experience.html` - Work experience listing
- `projects.html` - Projects section
- `skills.html` - Skills and competencies
- `education.html` - Education and certifications
- `footer.html` - Footer and version info
- `modals.html` - QR code and other modals

### Build System Updates
- Handlebars partial support
- CSS concatenation and minification
- Component dependency management
- Hot reload for component changes

## Implementation Phases

### Phase 1: CSS Extraction ✅
- [x] Extract liquid glass CSS to separate file
- [ ] Update build system to include CSS components
- [ ] Extract remaining major CSS sections

### Phase 2: HTML Partials
- [ ] Convert components/body.html to use Handlebars partials
- [ ] Create individual component files
- [ ] Update template to use {{> partial}} syntax

### Phase 3: Build System Integration
- [ ] Modify scripts/build.js to process components
- [ ] Add CSS concatenation and optimization
- [ ] Implement component dependency resolution

### Phase 4: Developer Experience
- [ ] Add component hot reload
- [ ] Create component documentation
- [ ] Add component testing framework

## Benefits
- **Maintainability**: Easier to find and modify specific components
- **Reusability**: Components can be reused across different templates
- **Collaboration**: Multiple developers can work on different components
- **Testing**: Individual components can be tested in isolation
- **Performance**: Only load CSS for components being used
- **Organization**: Logical separation of concerns

## File Size Reduction
- Main template: ~4900 lines → ~500 lines (template structure only)
- Individual components: 50-300 lines each
- Improved readability and maintenance
