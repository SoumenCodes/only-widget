const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1400, height: 800 },
    deviceScaleFactor: 2 // High resolution Retina/2x rendering for sharp text
  });

  const bannerPath = path.resolve(__dirname, 'banner.html');
  console.log('Loading banner from:', bannerPath);
  await page.goto('file:///' + bannerPath.replace(/\\/g, '/'), { waitUntil: 'networkidle' });

  // Wait a short moment to ensure fonts and styles are fully loaded
  await page.waitForTimeout(1000);

  const banner = await page.$('.banner-container');
  if (banner) {
    const outPath = path.resolve(__dirname, 'only-widget-linkedin-banner.png');
    await banner.screenshot({ path: outPath });
    console.log('Banner screenshot saved to:', outPath);
  } else {
    console.error('Could not find .banner-container element');
  }

  await browser.close();
})();
