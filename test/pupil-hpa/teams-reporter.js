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

    return {
      type: 'AdaptiveCard',
      $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
      version: '1.4',
      body: [
        {
          type: 'TextBlock',
          text: `Playwright Tests ${statusEmoji} ${statusText}`,
          weight: 'bolder',
          size: 'large',
          color: isPassed ? 'good' : 'attention',
        },
        {
          type: 'Container',
          style: 'emphasis',
          items: [
            {
              type: 'ColumnSet',
              columns: [
                {
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: 'Environment',
                      weight: 'bolder',
                      size: 'small',
                    },
                    {
                      type: 'TextBlock',
                      text: this.environment,
                      spacing: 'none',
                    },
                  ],
                },
                {
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: 'Status',
                      weight: 'bolder',
                      size: 'small',
                    },
                    {
                      type: 'TextBlock',
                      text: result.status,
                      spacing: 'none',
                    },
                  ],
                },
              ],
            },
            {
              type: 'ColumnSet',
              columns: [
                {
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: 'Total Tests',
                      weight: 'bolder',
                      size: 'small',
                    },
                    {
                      type: 'TextBlock',
                      text: `${this.stats.total}`,
                      spacing: 'none',
                    },
                  ],
                },
                {
                  width: 'stretch',
                  items: [
                    {
                      type: 'TextBlock',
                      text: 'Duration',
                      weight: 'bolder',
                      size: 'small',
                    },
                    {
                      type: 'TextBlock',
                      text: `${Math.round(this.stats.duration / 1000)}s`,
                      spacing: 'none',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    };
  }
}

module.exports = TeamsReporter;