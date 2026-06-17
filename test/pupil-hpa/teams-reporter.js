class TeamsReporter {
  constructor() {
    this.stats = {
      total: 0,
      duration: 0,
    };

    this.notificationsDisabled = process.env.TEAMS_DISABLE_NOTIFICATIONS === 'true';
    this.notifyFailuresOnly = process.env.TEAMS_NOTIFY_FAILURES_ONLY === 'true';
    this.environment = process.env.TEAMS_ENVIRONMENT || 'unknown';
    this.webhookUrl = process.env.TEAMS_WEBHOOK_URL;
  }

  onBegin(_config, suite) {
    this.stats.total = suite.allTests().length;

    if (this.notificationsDisabled) {
      console.log('[TeamsReporter] Teams notifications disabled for this run.');
      return;
    }

    if (!this.webhookUrl) {
      console.warn('[TeamsReporter] TEAMS_WEBHOOK_URL not set. Teams notifications disabled.');
    }
  }

  async onEnd(result) {
    if (this.notificationsDisabled || !this.webhookUrl) {
      return;
    }

    this.stats.duration = result.duration;

    if (this.notifyFailuresOnly && result.status === 'passed') {
      console.log('[TeamsReporter] Tests passed. Skipping Teams notification (failures-only mode).');
      return;
    }

    const message = this.buildMessage(result);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        console.error(`[TeamsReporter] Failed to send Teams notification: ${response.status} ${response.statusText}`);
      } else {
        console.log('[TeamsReporter] Teams notification sent successfully.');
      }
    } catch (error) {
      console.error('[TeamsReporter] Error sending Teams notification:', error);
    }
  }

  buildMessage(result) {
    const isPassed = result.status === 'passed';
    const statusEmoji = isPassed ? '✅' : '❌';
    const statusText = isPassed ? 'PASSED' : 'FAILED';
    const themeColor = isPassed ? '00FF00' : 'FF0000';

    return {
      '@type': 'MessageCard',
      '@context': 'https://schema.org/extensions',
      themeColor,
      summary: `Playwright Test Run ${statusText}`,
      title: `Playwright Tests ${statusEmoji} ${statusText}`,
      sections: [
        {
          facts: [
            { name: 'Environment', value: this.environment },
            { name: 'Status', value: result.status },
            { name: 'Total Tests', value: `${this.stats.total}` },
            { name: 'Duration', value: `${Math.round(this.stats.duration / 1000)}s` },
          ],
          markdown: true,
        },
      ],
    };
  }
}

module.exports = TeamsReporter;