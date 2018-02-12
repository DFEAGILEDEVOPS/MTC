import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

document.write(`<script async src="public/google-analytics/analytics.js"></script>`);
document.write(`<script type="text/javascript">
window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
ga('create', ${JSON.stringify(environment.googleAnalyticsTrackingCode)}, 'auto');
</script>`);

platformBrowserDynamic().bootstrapModule(AppModule);
