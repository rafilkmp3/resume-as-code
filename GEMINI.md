# Project Overview

This repository contains a "Resume as Code" project. It generates a professional resume in both HTML and PDF formats from a central `resume-data.json` file and a `template.html` (Handlebars). The project serves as a portfolio piece showcasing enterprise-grade platform engineering practices.

**Key Technologies:**

- **Backend:** Node.js
- **Templating:** Handlebars.js
- **PDF Generation:** Puppeteer
- **Unit Testing:** Jest
- **E2E & Visual Testing:** Playwright
- **Containerization:** Docker (multi-arch support for AMD64/ARM64)
- **CI/CD:** GitHub Actions
- **Build Automation:** Make

The architecture is designed for consistency and automation, with a strong emphasis on quality assurance through a comprehensive, multi-layered testing suite.

# Building and Running

The project uses a `Makefile` to simplify common tasks.

- **Install dependencies:**

  ```bash
  make install
  ```

- **Start the development server (with hot reload):**

  ```bash
  make dev
  ```

  The resume will be available at `http://localhost:3000`.

- **Build the resume (HTML and PDF):**

  ```bash
  make build
  ```

  The output will be in the `dist/` directory.

- **Run the full test suite:**

  ```bash
  make test
  ```

- **Run tests in a Docker container:**

  ```bash
  make docker-dev
  ```

# Development Conventions

- **Trunk-Based Development:** All work is done directly on the `main` branch.
- **Conventional Commits:** The project uses the [Conventional Commits](https://www.conventionalcommits.org/) specification. This is tied to the release process.
  - `feat:` triggers a MINOR version bump.
  - `fix:` triggers a PATCH version bump.
  - `BREAKING CHANGE:` in the footer triggers a MAJOR version bump.
- **Automated Releases:** A `release-please` bot automatically creates release PRs based on the commit history. Merging this PR tags a new release and triggers the deployment workflow.
- **Comprehensive Testing:** The project has a multi-layered testing strategy:
  - **Unit Tests (Jest):** For utility functions and build logic.
  - **E2E Tests (Playwright):** For user interaction and functionality.
  - **Visual Regression Tests (Playwright):** To catch unintended UI changes.
  - **Accessibility Tests (Playwright):** To ensure WCAG 2.1 AA compliance.
  - **Performance Tests (Playwright):** To monitor Core Web Vitals.
- **CI/CD:** GitHub Actions are used to automate testing and deployment. The pipeline is optimized with path-based triggers and multi-stage Docker builds to improve efficiency.
