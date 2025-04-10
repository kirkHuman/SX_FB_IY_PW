import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';

/**
 * Global setup for authentication
 */
async function globalSetup(config: FullConfig) {
  // Load environment variables
  dotenv.config();
  
  // Skip auth in CI unless enabled
  if (process.env.CI === 'true' && process.env.AUTH_ENABLED !== 'true') {
    console.log('Authentication skipped in CI (set AUTH_ENABLED=true to enable)');
    return;
  }
  
  // Get credentials
  const username = process.env.AUTH_USERNAME;
  const password = process.env.AUTH_PASSWORD;
  
  // Skip if credentials missing
  if (!username || !password) {
    console.log('Authentication credentials not provided, skipping login');
    return;
  }
  
  console.log('Setting up authenticated state...');
  
  // Launch browser
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Get the base URL
    const baseURL = config.projects[0].use.baseURL as string;
    
    // Perform login
    await page.goto(`${baseURL}/login`);
    await page.fill('input[name="email"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for login to complete
    await page.waitForSelector('[aria-label="Account"]', { timeout: 10000 });
    
    // Save auth state
    await page.context().storageState({ path: './auth-state.json' });
    console.log('Authentication successful (saved to auth-state.json)');
  } catch (error) {
    console.error('Authentication failed:', error);
  } finally {
    await browser.close();
  }
}

export default globalSetup; 