import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import { SXF_CONFIG } from './src/config/sxf.config';
import { FB_CONFIG } from './src/config/fb.conf';
import { YITTY_CONFIG } from './src/config/yitty.config';

// Load environment variables
dotenv.config();

// Environment configuration
const ENV = process.env.ENV || 'production';
const BRAND = process.env.BRAND || 'savagex';
const DOMAIN = process.env.DOMAIN || 'us';
const HEADLESS = process.env.HEADED !== 'true';
const DEBUG = process.env.DEBUG === 'false';
const BROWSERSTACK = process.env.BROWSERSTACK === 'false';

// BrowserStack credentials
const BS_USERNAME = process.env.BROWSERSTACK_USERNAME;
const BS_ACCESS_KEY = process.env.BROWSERSTACK_ACCESS_KEY;

// Brand configuration mapping
const BRAND_CONFIGS = {
  savagex: SXF_CONFIG,
  fabletics: FB_CONFIG,
  yitty: YITTY_CONFIG
} as const;

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  fullyParallel: !DEBUG,
  workers: DEBUG ? 1 : 2,
  reporter: [
    ['html'],
    ['list'],
    ['allure-playwright', { 
      resultsDir: 'allure-results',
      detail: true,
      suiteTitle: true,
      reportDir: 'allure-report',
      environmentInfo: {
        os_platform: process.platform,
        os_release: process.release,
        os_version: process.version,
        node_version: process.version,
        brand: BRAND,
        domain: DOMAIN,
        env: ENV,
      }
    }],
    ['./src/reporters/slackReporter.ts']
  ],
  use: {
    baseURL: getBaseUrl(),
    headless: HEADLESS,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // BrowserStack projects
    ...(BROWSERSTACK ? [
      {
        name: 'browserstack',
        use: {
          connectOptions: {
            wsEndpoint: `wss://cdp.browserstack.com/playwright?caps={"browser":"chrome","os":"Windows","browserstack.username":"${BS_USERNAME}","browserstack.accessKey":"${BS_ACCESS_KEY}"}`
          }
        }
      }
    ] : [])
  ],
  // Global setup for authentication
  globalSetup: path.join(__dirname, 'src/config/globalSetup.ts'),
  outputDir: 'test-results/'
});

/**
 * Get base URL based on current environment, brand, and domain
 */
function getBaseUrl(): string {
  const brandConfig = BRAND_CONFIGS[BRAND as keyof typeof BRAND_CONFIGS];
  
  if (!brandConfig) {
    throw new Error(`Unsupported brand: ${BRAND}`);
  }
  
  if (!brandConfig.domains[DOMAIN as keyof typeof brandConfig.domains]) {
    throw new Error(`Unsupported domain '${DOMAIN}' for brand '${BRAND}'`);
  }
  
  const tld = brandConfig.domains[DOMAIN as keyof typeof brandConfig.domains];
  const subdomain = brandConfig.environments[ENV as keyof typeof brandConfig.environments];
  
  console.log(`SUBDOMAIN: ${subdomain}`);
  console.log(`BRAND: ${BRAND}`);
  console.log(`TLD: ${tld}`);
  console.log(`ENV: ${ENV}`);
  console.log(`BASE URL: https://${subdomain}${BRAND}.${tld}`);
  
  return `https://${subdomain}${BRAND}.${tld}`;
} 