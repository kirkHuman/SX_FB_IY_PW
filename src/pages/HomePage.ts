import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Home Page Object Model
 */
export class HomePage extends BasePage {
  // Page elements
  readonly headerLogo: Locator;
  readonly searchIcon: Locator;
  readonly accountIcon: Locator;
  readonly cartIcon: Locator;
  readonly navMenu: Locator;
  readonly newsletter: Locator;
  readonly cookieConsent: Locator;
  readonly heroSection: Locator;
  
  /**
   * Constructor
   */
  constructor(page: Page) {
    super(page);
    //console.log(`Initializing HomePage for brand: ${this.brand}, domain: ${this.domain}, env: ${this.env}`);
    
    // Initialize brand-specific selectors
    if (this.brand === 'savagex') {
      this.headerLogo = page.locator('.header-logo');
      this.searchIcon = page.locator('.search-icon');
      this.accountIcon = page.locator('.account-icon');
      this.cartIcon = page.locator('.mini-cart-icon');
      this.navMenu = page.locator('nav.main-navigation');
      this.newsletter = page.locator('.footer-newsletter');
      this.cookieConsent = page.locator('.cookie-consent-banner');
      this.heroSection = page.locator('.hero-section');
    } 
    else if (this.brand === 'fabletics') {
      this.headerLogo = page.locator('.brand-logo');
      this.searchIcon = page.locator('.search-trigger');
      this.accountIcon = page.locator('.account-menu-icon');
      this.cartIcon = page.locator('.shopping-bag');
      this.navMenu = page.locator('.site-nav');
      this.newsletter = page.locator('.signup-form');
      this.cookieConsent = page.locator('#cookie-banner');
      this.heroSection = page.locator('.hero-container');
    } 
    else if (this.brand === 'yitty') {
      this.headerLogo = page.locator('.site-logo');
      this.searchIcon = page.locator('.search-toggle');
      this.accountIcon = page.locator('.account-link');
      this.cartIcon = page.locator('.cart-icon');
      this.navMenu = page.locator('.main-menu');
      this.newsletter = page.locator('.newsletter-signup');
      this.cookieConsent = page.locator('.cookie-policy');
      this.heroSection = page.locator('.home-hero');
    } 
    else {
      // Default selectors
      this.headerLogo = page.locator('header .logo');
      this.searchIcon = page.locator('.search');
      this.accountIcon = page.locator('.account');
      this.cartIcon = page.locator('.cart');
      this.navMenu = page.locator('nav');
      this.newsletter = page.locator('.newsletter');
      this.cookieConsent = page.locator('.cookies');
      this.heroSection = page.locator('.hero');
    }
  }
  
  /**
   * Navigate to home page
   */
  async navigate(): Promise<void> {
    await this.goto('/');
    
    // After navigation, wait for critical elements to be visible
    await Promise.race([
      this.headerLogo.waitFor({ state: 'visible', timeout: 15000 }),
      this.page.waitForSelector('header, .header', { state: 'visible', timeout: 15000 })
    ]);
  }
  
  /**
   * Check if home page is loaded
   */
  async isLoaded(): Promise<boolean> {
    await this.waitForVisible(this.headerLogo);
    await this.waitForVisible(this.heroSection);
    return true;
  }
  
  /**
   * Accept cookie consent if present
   */
  async acceptCookies(): Promise<void> {
    const isVisible = await this.cookieConsent.isVisible();
    if (isVisible) {
      const acceptSelector = {
        'savagex': '.accept-cookies',
        'fabletics': '#accept-cookies-btn',
        'yitty': '.accept-cookies'
      }[this.brand] || 'button:has-text("Accept")';
      
      await this.click(acceptSelector);
    }
  }
  
  /**
   * Open search
   */
  async openSearch(): Promise<void> {
    await this.searchIcon.click();
    
    const searchInputSelector = {
      'savagex': 'input[name="q"]',
      'fabletics': '#search-input',
      'yitty': '.search-field'
    }[this.brand] || 'input[type="search"]';
    
    await this.waitForVisible(searchInputSelector);
  }
  
  /**
   * Navigate to account page
   */
  async openAccount(): Promise<void> {
    await this.accountIcon.click();
  }
  
  /**
   * Open shopping cart
   */
  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }
  
  /**
   * Get navigation menu items
   */
  async getMenuItems(): Promise<string[]> {
    const menuSelector = {
      'savagex': 'nav.main-navigation a',
      'fabletics': '.site-nav .nav-item',
      'yitty': '.main-menu .menu-item'
    }[this.brand] || 'nav a';
    
    const menuItems = this.page.locator(menuSelector);
    const count = await menuItems.count();
    const texts = [];
    
    for (let i = 0; i < count; i++) {
      texts.push(await menuItems.nth(i).innerText());
    }
    
    return texts;
  }
  
  /**
   * Subscribe to newsletter
   */
  async subscribeNewsletter(email: string): Promise<void> {
    // Scroll to footer
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await this.waitForVisible(this.newsletter);
    
    // Brand-specific selectors
    const selectors = {
      'savagex': {
        input: '.footer-newsletter input[type="email"]',
        button: '.footer-newsletter button[type="submit"]'
      },
      'fabletics': {
        input: '.signup-form input#email',
        button: '.signup-form button'
      },
      'yitty': {
        input: '.newsletter-signup input.email',
        button: '.newsletter-signup .submit-btn'
      }
    }[this.brand] || {
      input: '.newsletter input[type="email"]',
      button: '.newsletter button'
    };
    
    await this.fill(selectors.input, email);
    await this.click(selectors.button);
  }
} 