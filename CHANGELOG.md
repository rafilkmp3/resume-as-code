# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0](https://github.com/rafilkmp3/resume-as-code/compare/v1.1.0...v1.2.0) (2025-08-04)


### Features

* add concurrency control to prevent resource waste ([917b5df](https://github.com/rafilkmp3/resume-as-code/commit/917b5df8aa9b1757f070ae45cbcfdeb42cc80555))
* Add empty .release-please-manifest.json ([f8169f8](https://github.com/rafilkmp3/resume-as-code/commit/f8169f8d268ae7a11881ab58e78f58be4ef2c345))
* Add non-intrusive dark mode toggle button ([39220ca](https://github.com/rafilkmp3/resume-as-code/commit/39220caf015cdbae3d7c4a474c407042c6eccc66))
* add playwright trace to CI ([f2b4e1b](https://github.com/rafilkmp3/resume-as-code/commit/f2b4e1b0a9c1c399cef36912ce58c473ef877447))
* Add release-please config file ([8dc5b45](https://github.com/rafilkmp3/resume-as-code/commit/8dc5b4552c5baceb9b52d620ff6ef5e7bc8d75d4))
* Add release-please-config.json ([b655d8c](https://github.com/rafilkmp3/resume-as-code/commit/b655d8caa944d9a3b4f32737e35eb01d229e9302))
* Add visual regression tests and configure LFS ([302fe63](https://github.com/rafilkmp3/resume-as-code/commit/302fe6351bf3c75ed2c14a5174af9e546dcb93aa))
* automate release notes from CHANGELOG ([ddbf133](https://github.com/rafilkmp3/resume-as-code/commit/ddbf13372161f8e58a22e12148099fdc85bb0f01))
* Comprehensive infrastructure refactoring with enterprise-grade testing ([1218cc8](https://github.com/rafilkmp3/resume-as-code/commit/1218cc8605bcf9a0eb150982e9d1ad021e851fd4))
* Comprehensive usability improvements and CI/CD pipeline ([86bb8bb](https://github.com/rafilkmp3/resume-as-code/commit/86bb8bbe8c232c8279b6641e15ce82879d1a362d))
* consolidate all CI/CD workflows into a single file ([d50eec4](https://github.com/rafilkmp3/resume-as-code/commit/d50eec46403072256a923e27f7f7326b33a3a12a))
* Enhance PDF generation with professional metadata and accessibility ([b01f969](https://github.com/rafilkmp3/resume-as-code/commit/b01f96969c9157dcae7882da200785058ba26c2a))
* fix CI/CD pipeline and implement proper release workflow ([43eb1e6](https://github.com/rafilkmp3/resume-as-code/commit/43eb1e6b5449120db0d3144129f4c8bf07800b8a))
* implement Docker-first CI/CD pipeline with comprehensive test strategy ([4e9f62e](https://github.com/rafilkmp3/resume-as-code/commit/4e9f62e455f7a5b6a9c372b0386bdab0973f1a2c))
* Implement two-step release workflow ([026258b](https://github.com/rafilkmp3/resume-as-code/commit/026258b06ae1bec92145b439017c924b8599bdd4))
* Optimize CI workflow and fix performance test ([6e9721a](https://github.com/rafilkmp3/resume-as-code/commit/6e9721a420085c1d18445f434cac16fd77da3d00))
* Remove release.yml, using Release Please GitHub App ([bb90bdf](https://github.com/rafilkmp3/resume-as-code/commit/bb90bdfcedc4a8da4c905fa2bc55fe9fd84fdbb4))


### Bug Fixes

* add job timeouts and fix Docker webkit2gtk build error ([4d7b00f](https://github.com/rafilkmp3/resume-as-code/commit/4d7b00f9de725f852e5a385ab9e28ef29595710b))
* add permissions to deploy-preview job ([4fff3f6](https://github.com/rafilkmp3/resume-as-code/commit/4fff3f6b9c0c738210f0830721d9c2e5ac02405d))
* add pull-requests write permission to deploy-preview job ([665709e](https://github.com/rafilkmp3/resume-as-code/commit/665709ea3f9ab641488cf10be9ce6db5e596855a))
* Configure release-please to create pull requests for new versions ([ae37215](https://github.com/rafilkmp3/resume-as-code/commit/ae37215b9abdfe00af05fdf788987525e3875aea))
* disable old CI workflow and enable Docker-based pipeline ([03b4d9d](https://github.com/rafilkmp3/resume-as-code/commit/03b4d9dbd0a162f01767b23894fff6f1ce2d0ed6))
* Grant write permissions for GitHub Actions workflows ([eadbf28](https://github.com/rafilkmp3/resume-as-code/commit/eadbf28e2714e488133a926c2e14b56a4712b1cb))
* move qrcode to production dependencies and remove duplicate ([bc167d4](https://github.com/rafilkmp3/resume-as-code/commit/bc167d4d09f5fd9b281ec7ee9867023975c43b45))
* remove concurrency block from main-ci.yml ([74f5f57](https://github.com/rafilkmp3/resume-as-code/commit/74f5f57bb3276a6458cd40c9d347f544e1dcd7a6))
* remove deprecated main-ci.yml workflow to prevent duplicate CI runs ([5694f25](https://github.com/rafilkmp3/resume-as-code/commit/5694f25825ed5b4b41ae62fd558c16a2c6bbd6b7))
* Remove floating control buttons for better mobile experience ([70a4297](https://github.com/rafilkmp3/resume-as-code/commit/70a42975a99fe2c9fc757897d460a42caf331413))
* remove headed flag and add http-server ([79169d1](https://github.com/rafilkmp3/resume-as-code/commit/79169d148e561eda4797f3fa5dfb0c6821efc8d4))
* remove release-please workflow and add release deployment workflow ([4820dc1](https://github.com/rafilkmp3/resume-as-code/commit/4820dc154a1ddf2463e2cc8eed1b7c619d0ed20d))
* resolve Docker build circular dependency ([c4f2130](https://github.com/rafilkmp3/resume-as-code/commit/c4f21303706aa5410f4c17b84b0b14d0e83ac83d))
* Revert release workflow to standard configuration ([192aaa3](https://github.com/rafilkmp3/resume-as-code/commit/192aaa3919fb4871b347f85fc3db2f7610f171d9))
* set cancel-in-progress to true for concurrency ([b2913f8](https://github.com/rafilkmp3/resume-as-code/commit/b2913f83d02d168cc6d6589379621e419a1877bf))
* Simplify release-please configuration ([4d81c22](https://github.com/rafilkmp3/resume-as-code/commit/4d81c22e794469dfc3727cfcae62b70afc9a08c3))
* temporarily disable deploy job to resolve workflow syntax issue ([022f39a](https://github.com/rafilkmp3/resume-as-code/commit/022f39a62632e56bcd3e9cec4308cc08a57f6381))
* temporarily disable release-please to prevent unnecessary CI triggers ([c7fafc8](https://github.com/rafilkmp3/resume-as-code/commit/c7fafc81446535f43dd6d33b205967f913afbc3d))
* trigger release please ([0733fef](https://github.com/rafilkmp3/resume-as-code/commit/0733fefda0ca37e9d75e97327b2b4a32f4f797a0))
* update CI job dependencies ([5fd7e8b](https://github.com/rafilkmp3/resume-as-code/commit/5fd7e8b47fcb16f1364abde9333de400b543a407))
* update release-please workflow to use correct action and parameters ([e39bfae](https://github.com/rafilkmp3/resume-as-code/commit/e39bfaeb3048340fd128dd3a4f47445d9fb7b046))


### Performance Improvements

* Disable all load animations for instant page rendering ([6d5fad8](https://github.com/rafilkmp3/resume-as-code/commit/6d5fad8d9c0ace69198a3d6f86ad113470907228))

## [Unreleased]

## [1.1.0] - 2025-01-08

### Changed
- Remove Guinness World Record button from header
- Change triangle bullets (▶) to standard bullet points (•) in experience highlights  
- Fix repetitive Personal Details section with clean icon-based formatting
- Remove duplicate flag emoji from nationality display

### Added
- Add SignOz to observability skills section with clickable link
- CHANGELOG.md file following Keep a Changelog format
- Semantic versioning scripts for easier release management

## [1.0.0] - 2024-12-XX

### Added
- Analytics and SEO improvements with Google Analytics integration
- Clickable homepage links for all skill technologies
- Comprehensive dark theme with OS preference detection
- ATS-friendly export functionality
- Print-optimized layout with professional formatting
- Parallax background effects and smooth animations
- Theme toggle with keyboard shortcut support (Ctrl+Shift+D)
- Mobile-responsive design
- PDF export capabilities

### Fixed
- Ultra-compact print layout for maximum content density
- Print layout issues with proper light theme forcing
- PDF export readability improvements
- Broken PDF button functionality

### Changed
- Enhanced README with comprehensive technical documentation
- Improved print functionality with professional styling
- Optimized layout for recruiter-standard PDF format

## [0.1.0] - Initial Release

### Added
- Basic resume generation system using Handlebars templating
- Node.js build system with Puppeteer PDF generation
- Responsive HTML/CSS design
- JSON-based resume data structure
- GitHub Pages deployment ready
- Make-based build automation
