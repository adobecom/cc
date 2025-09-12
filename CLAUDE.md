# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CC x Milo - A Franklin-based project for Adobe Creative Cloud pages on www.adobe.com, built on Adobe's Milo library and Edge Delivery Services (formerly Project Helix).

## Commands

### Development
```bash
# Start local development server
aem up

# Install dependencies
npm install
```

### Testing
```bash
# Run all unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run specific test file
npm run wtr test/path/to/test.js

# Run E2E tests with Nala framework
npm run nala

# Run accessibility tests
npm run a11y

# Run specific E2E test
npm run nala path/to/test.spec.js
```

### Linting
```bash
# Run all linters
npm run lint

# Run JavaScript linter
npm run lint:js

# Run CSS linter
npm run lint:css
```

## Architecture

### Directory Structure
- `/creativecloud/` - Main source code directory
  - `/blocks/` - Franklin block components (each with .js and .css files)
  - `/features/` - Complex interactive features
  - `/scripts/` - Core utilities and configurations
  - `/icons/` - SVG icons for the project
- `/test/` - Unit tests using Web Test Runner
- `/nala/` - E2E tests using Playwright-based Nala framework
- `/libs/` - External dependencies

### Key Concepts

1. **Franklin Blocks**: Components in `/creativecloud/blocks/` follow Franklin's block pattern. Each block has:
   - A JavaScript file for functionality
   - A CSS file for styling
   - Automatic loading based on DOM structure

2. **Milo Integration**: This project heavily relies on Adobe's Milo library. The library source is dynamically determined:
   - Local development: Uses localhost Milo
   - Production: Uses specific Milo branch/tag
   - Configured in `/creativecloud/scripts/scripts.js`

3. **Feature Loading**: Complex features in `/creativecloud/features/` are loaded on-demand based on page requirements.

4. **Content Management**: 
   - Content stored in SharePoint (see `fstab.yaml`)
   - Helix Query for data fetching (see `helix-query.yaml`)
   - Multi-locale support with extensive configurations

5. **Testing Strategy**:
   - Unit tests use Web Test Runner with Mocha/Chai
   - E2E tests use custom Nala framework (Playwright-based)
   - Test utilities in `/test/utils/`

### Important Patterns

- **Dynamic Library Loading**: Check `setLibs()` function in scripts.js for Milo source determination
- **Block Decoration**: Blocks are automatically decorated based on class names in the DOM
- **Responsive Design**: Mobile-first approach with defined breakpoints
- **Performance**: LCP image optimization and lazy loading implemented
- **Analytics**: Adobe Analytics integration throughout components

### Development Tips

- Always check if a component already exists in Milo before creating new ones
- Follow the existing block pattern when creating new blocks
- Use the established test patterns in `/test/blocks/` for unit tests
- Run linters before committing changes
- Check locale configurations when working with internationalization