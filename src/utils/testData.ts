import fs from 'fs';
import path from 'path';

/**
 * Utility to load test data based on brand, domain and environment
 */
export class TestData {
  private brand: string;
  private domain: string;
  private env: string;

  /**
   * Create TestData instance
   */
  constructor(brand?: string, domain?: string, env?: string) {
    this.brand = brand || process.env.BRAND || 'savagex';
    this.domain = domain || process.env.DOMAIN || 'us';
    this.env = env || process.env.ENV || 'qa';
  }

  /**
   * Load test data from file with fallback mechanism
   */
  getData<T>(dataType: string): T {
    // Search in order of specificity
    const files = [
      `${this.brand}_${this.domain}_${this.env}.json`,
      `${this.brand}_${this.domain}.json`,
      `${this.brand}.json`,
      'default.json'
    ];
    
    const basePath = path.join(__dirname, '..', '..', 'testData', dataType);
    
    // Try each file path
    for (const file of files) {
      const filePath = path.join(basePath, file);
      if (fs.existsSync(filePath)) {
        try {
          return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
        } catch (error) {
          console.warn(`Error reading ${filePath}:`, error);
        }
      }
    }
    
    throw new Error(`No test data found: ${dataType} (${this.brand}/${this.domain}/${this.env})`);
  }

  /**
   * Get user credentials
   */
  getUserCredentials(): { email: string; password: string } {
    try {
      return this.getData<{ email: string; password: string }>('credentials');
    } catch (error) {
      // Fallback to environment variables
      const email = process.env.TEST_USER_EMAIL;
      const password = process.env.TEST_USER_PASSWORD;
      
      if (!email || !password) {
        throw new Error('No user credentials found');
      }
      
      return { email, password };
    }
  }

  /**
   * Get expected text for validation
   */
  getExpectedText(): Record<string, string> {
    return this.getData<Record<string, string>>('expectedText');
  }
} 