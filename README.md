# Multi-Brand Playwright Test Framework

A simplified end-to-end test automation framework using Playwright with TypeScript and the Page Object Model pattern. This framework supports testing across multiple brands, domains, and environments.

## Features

- **Page Object Model**: Clean separation of test code and page interactions
- **Multi-Brand Support**: `savagex`, `fabletics`, `yitty`
- **Multi-Domain/Environment**: Test across domains (US, EU, etc.) and environments (QA, Preview, Production)
- **BrowserStack Integration**: Cross-browser testing capability
- **GitHub Actions**: Automated CI/CD pipeline
- **Slack Notifications**: Failure reporting via Slack

## Project Structure

```
├── src/
│   ├── config/       # Configuration and setup
│   ├── fixtures/     # Test fixtures
│   ├── pages/        # Page Objects
│   ├── reporters/    # Custom reporters
│   ├── tests/        # Test files
│   └── utils/        # Utility functions
├── testData/         # Test data by brand/domain
├── .env.example      # Environment variables template
├── playwright.config.ts
```

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Install Playwright browsers:
   ```
   npx playwright install
   ```
4. Set up environment:
   ```
   cp .env.example .env
   ```

### Running Tests

Basic test runs:
```bash
# Run all tests
npm test

# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed

# Run in debug mode
npm run test:debug
```

Target specific brands:
```bash
# Test specific brand
npm run test:savagex
npm run test:fabletics
npm run test:yitty

# Test specific environment
npm run test:qa
npm run test:preview
npm run test:prod
```

Use BrowserStack:
```bash
npm run test:browserstack
```

View test reports:
```bash
npm run report
```

## Configuration

The framework is configured through environment variables in the `.env` file:

- `ENV`: Test environment (qa, preview, production)
- `BRAND`: Target brand (savagex, fabletics, yitty)
- `DOMAIN`: Target domain (us, eu, fr, etc.)
- `HEADED`: Run in headed mode (true/false)
- `DEBUG`: Enable debug mode (true/false)
- `BROWSERSTACK`: Enable BrowserStack (true/false)

## Adding New Components

### Adding a New Brand

1. Update the domain configuration in `playwright.config.ts`:
   ```typescript
   const domains = {
     // existing brands...
     'newbrand': {
       'us': 'com',
       // other domains...
     }
   };
   ```

2. Add brand-specific selectors in the page objects:
   ```typescript
   if (this.brand === 'newbrand') {
     this.headerLogo = page.locator('.newbrand-logo');
     // other selectors...
   }
   ```

3. Add test data in the `testData/` directory

### Adding a New Page Object

1. Create a new page class extending BasePage:
   ```typescript
   // src/pages/NewPage.ts
   export class NewPage extends BasePage {
     // locators and methods
   }
   ```

2. Add the page to fixtures:
   ```typescript
   // src/fixtures/fixtures.ts
   type Pages = {
     // existing pages...
     newPage: NewPage;
   };

   export const test = base.extend<Pages>({
     // existing fixtures...
     newPage: async ({ page }, use) => {
       await use(new NewPage(page));
     }
   });
   ```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests to ensure they pass
4. Submit a pull request 