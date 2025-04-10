import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

/**
 * Extended fixtures for page objects
 */
type Pages = {
  homePage: HomePage;
};

/**
 * Extended test with page object fixtures
 */
export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  }
});

export { expect } from '@playwright/test'; 