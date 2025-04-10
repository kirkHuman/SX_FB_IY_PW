import { Page, Locator, expect } from '@playwright/test';

/**
 * Base Page Object class with common functionality for all pages
 */
export class BasePage {
  readonly page: Page;
  readonly brand: string;
  readonly domain: string;
  readonly env: string;

  /**
   * Constructor for BasePage
   */
  constructor(page: Page) {
    this.page = page;
    this.brand = process.env.BRAND || 'savagex';
    this.domain = process.env.DOMAIN || 'us';
    this.env = process.env.ENV || 'qa';
    //console.log(`Initializing page object with brand:\n ${this.brand},\n domain: ${this.domain},\n  env: ${this.env}`);
  }

  /**
   * Navigate to a specific path
   */
  async goto(path: string, options?: { timeout?: number }): Promise<void> {
    await this.page.goto(path);
    //try {
      // Set a default timeout of 30 seconds, or use the provided timeout
    //   const timeout = options?.timeout || 30000;
    //   await this.page.waitForLoadState('networkidle', { timeout });
    // } catch (error: any) {
    //   console.warn(`Network did not reach idle state: ${error.message}`);
    //   // Continue execution even if networkidle wasn't reached
    //   // Optionally wait for domcontentloaded instead, which is more reliable
    //   await this.page.waitForLoadState('domcontentloaded');
    //}
  }

  /**
   * Wait for an element to be visible
   */
  async waitForVisible(selector: string | Locator, timeout?: number): Promise<void> {
    const locator = typeof selector === 'string' ? this.page.locator(selector) : selector;
    await expect(locator).toBeVisible({ timeout });
  }

  /**
   * Click on an element
   */
  async click(selector: string): Promise<void> {
    await this.page.click(selector);
  }

  /**
   * Fill a form field
   */
  async fill(selector: string, value: string): Promise<void> {
    await this.page.fill(selector, value);
  }

  /**
   * Get text from an element
   */
  async getText(selector: string): Promise<string> {
    return await this.page.locator(selector).innerText();
  }

  /**
   * Get brand-specific configuration
   */
  getBrandConfig(key: string): any {
    const config: Record<string, Record<string, Record<string, any>>> = {
      'savagex': {
        'us': {
          'signupUrl': '/signup',
          'language': 'en-US'
        },
        'de': {
          'signupUrl': '/anmelden',
          'language': 'de-DE'
        }
      },
      'fabletics': {
        'us': {
          'signupUrl': '/join',
          'language': 'en-US'
        }
      },
      'yitty': {
        'us': {
          'signupUrl': '/register',
          'language': 'en-US'
        }
      }
    };

    return config[this.brand]?.[this.domain]?.[key] || null;
  }

  /**
   * Search for a term using the site search
   */
  async search(searchTerm: string): Promise<void> {
    // Search button
    const searchToggle = this.page.locator('button.SearchToggle__Wrapper-sc-hbpas2-0');
    // Search input field
    const searchInput = this.page.locator('input[data-cnstrc-search-input="true"]');
    
    // First click the search button to open the search field if needed
    await searchToggle.click();
    
    // Wait for the input to be visible and interactable
    await this.waitForVisible(searchInput);
    
    // Clear any existing text and enter the search term
    await searchInput.clear();
    await searchInput.fill(searchTerm);
    
    // Press Enter to submit the search
    await searchInput.press('Enter');
    
    // Wait for the search results to load
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error: any) {
      console.warn(`Search results network activity did not reach idle state: ${error.message}`);
      // Continue execution even if networkidle wasn't reached
      await this.page.waitForLoadState('networkidle');
    }
  }

  /**
   * Navigate to a main menu category
   * @param category - The category to navigate to (e.g., 'best-sellers', 'new', 'bras', etc.)
   */
  async navigateToCategory(category: string): Promise<void> {
    // Create a selector using the data-autotag attribute with the category
    const selector = `a[data-autotag="${category}-main"]`;
    
    await this.page.locator(selector).click();
    
    // Wait for navigation to complete
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error: any) {
      console.warn(`Category navigation network activity did not reach idle state: ${error.message}`);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }
  
  /**
   * Hover over a main menu category to reveal its submenu
   * @param category - The category to hover over (e.g., 'new', 'bras', 'lingerie', etc.)
   */
  async hoverOverCategory(category: string): Promise<void> {
    const selector = `a[data-autotag="${category}-main"]`;
    
    // Hover over the category to reveal the submenu
    await this.page.locator(selector).hover();
    
    // Wait for submenu to appear
    await this.page.waitForTimeout(500); // Short wait for animation
  }
  
  /**
   * Navigate to a submenu item after hovering over a main category
   * @param category - The main category (e.g., 'bras', 'lingerie')
   * @param subcategory - The data-autotag value for the subcategory
   */
  async navigateToSubcategory(category: string, subcategory: string): Promise<void> {
    // First hover over the main category
    await this.hoverOverCategory(category);
    
    // Then click on the subcategory link
    const subcategorySelector = `a[data-autotag="${subcategory}"]`;
    await this.page.locator(subcategorySelector).click();
    
    // Wait for navigation to complete
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error: any) {
      console.warn(`Subcategory navigation network activity did not reach idle state: ${error.message}`);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Click a footer link by text
   * @param linkText - The text of the footer link to click
   */
  async clickFooterLink(linkText: string): Promise<void> {
    const footerLinkSelector = `.Footer__Wrapper-sc-8smyk0-0 a:text("${linkText}")`;
    await this.page.locator(footerLinkSelector).click();
    
    // Wait for navigation to complete
    try {
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } catch (error: any) {
      console.warn(`Footer link navigation network activity did not reach idle state: ${error.message}`);
      await this.page.waitForLoadState('domcontentloaded');
    }
  }

  /**
   * Click a social media icon in the footer
   * @param platform - The social media platform (instagram, twitter, facebook, pinterest, youtube, tiktok)
   */
  async clickSocialMediaLink(platform: string): Promise<void> {
    const platformMap: Record<string, string> = {
      'instagram': 'instagram.com',
      'twitter': 'twitter.com',
      'facebook': 'facebook.com',
      'pinterest': 'pinterest.com',
      'youtube': 'youtube.com',
      'tiktok': 'tiktok.com'
    };
    
    const href = platformMap[platform.toLowerCase()];
    const socialLinkSelector = `.Footer__IconWrapper-sc-8smyk0-10 a[href*="${href}"]`;
    
    // Check if the link exists
    const linkExists = await this.page.locator(socialLinkSelector).count() > 0;
    if (!linkExists) {
      throw new Error(`Social media link for ${platform} was not found`);
    }
    
    // Get the href attribute to verify it later
    const linkHref = await this.page.locator(socialLinkSelector).getAttribute('href');
    
    // Since social media links open in a new tab, we'll just check if they exist
    // or we could change the target attribute for testing purposes
    expect(linkHref).toContain(href);
  }

  /**
   * Toggle the "Visit Our Other Sites" dropdown in the footer
   */
  async toggleVisitOtherSites(): Promise<void> {
    const otherSitesButtonSelector = '.Footer__Wrapper-sc-8smyk0-0 button:text("Visit Our Other Sites")';
    await this.page.locator(otherSitesButtonSelector).click();
    
    // Wait for the dropdown to appear/disappear
    await this.page.waitForTimeout(500);
  }

  /**
   * Click the accessibility options button in the footer
   */
  async clickAccessibilityOptions(): Promise<void> {
    const accessibilityButtonSelector = '.Footer__Wrapper-sc-8smyk0-0 button:text("Enable Accessibility Options")';
    await this.page.locator(accessibilityButtonSelector).click();
    
    // Wait for the accessibility dialog to appear
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify that the footer is present and contains expected elements
   */
  async verifyFooterExists(): Promise<void> {
    // Check that the main footer element exists
    await this.waitForVisible('footer.Footer__Wrapper-sc-8smyk0-0');
    
    // Check that key elements exist
    await this.waitForVisible('.Footer__BottomOptionsWrapper-sc-8smyk0-4'); // Bottom links container
    await this.waitForVisible('.Footer__IconWrapper-sc-8smyk0-10'); // Social links container
    await this.waitForVisible('.Footer__TermsWrapper-sc-8smyk0-14'); // Terms container
  }
} 