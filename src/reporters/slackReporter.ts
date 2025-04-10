import { Reporter, FullResult, TestCase, TestResult, TestError } from '@playwright/test/reporter';
import { IncomingWebhook } from '@slack/webhook';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Slack Reporter for test results notification
 */
class SlackReporter implements Reporter {
  private webhook: IncomingWebhook | null = null;
  private totalTests = 0;
  private passedTests = 0;
  private failedTests = 0;
  private skippedTests = 0;
  private errors: Array<{ test: string; message: string }> = [];
  private startTime = 0;
  private testEnv: string;
  private testBrand: string;

  constructor() {
    // Initialize webhook
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (webhookUrl) {
      this.webhook = new IncomingWebhook(webhookUrl);
    }

    // Get test environment info
    this.testBrand = process.env.BRAND || 'savagex';
    this.testEnv = process.env.ENV || 'qa';
  }

  onBegin(config: any, suite: any) {
    this.startTime = Date.now();
    this.totalTests = suite.allTests().length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Update test counts
    if (result.status === 'passed') {
      this.passedTests++;
    } else if (result.status === 'failed') {
      this.failedTests++;
      if (result.error) {
        this.errors.push({ 
          test: test.title, 
          message: result.error.message?.split('\n')[0] || 'Unknown error' 
        });
      }
    } else if (result.status === 'skipped') {
      this.skippedTests++;
    }
  }

  async onEnd(result: FullResult) {
    // Only send notification for failures when webhook is configured
    if (this.webhook && this.failedTests > 0) {
      await this.sendSlackNotification();
    }
  }

  /**
   * Send notification to Slack
   */
  private async sendSlackNotification() {
    if (!this.webhook) return;

    // Calculate test duration
    const duration = Math.round((Date.now() - this.startTime) / 1000);
    const durationText = duration > 60 
      ? `${Math.floor(duration / 60)}m ${duration % 60}s` 
      : `${duration}s`;

    // Prepare error details (max 5)
    const errorSamples = this.errors.slice(0, 5);
    const moreErrors = this.errors.length > 5 
      ? `\n...and ${this.errors.length - 5} more failures.` 
      : '';
      
    const errorDetails = errorSamples.map(e => `• *${e.test}*: ${e.message}`).join('\n') + moreErrors;

    // Create Slack message
    const message = {
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `❌ Test Failures: ${this.testBrand.toUpperCase()} (${this.testEnv.toUpperCase()})`,
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Results*: ${this.passedTests} passed, ${this.failedTests} failed, ${this.skippedTests} skipped`
            },
            {
              type: 'mrkdwn',
              text: `*Duration*: ${durationText}`
            }
          ]
        }
      ]
    };

    // Add error details if there are any
    if (errorDetails) {
      message.blocks.push({
        type: 'divider'
      } as any);
      
      message.blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Error Details:*\n${errorDetails}`
        }
      } as any);
    }

    try {
      await this.webhook.send(message);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }
}

export default SlackReporter; 