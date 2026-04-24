const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
  });

  await page.goto('http://localhost:8888/');
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log('Page title:', title);

  const logo = await page.textContent('h1');
  console.log('Logo text:', logo);

  const mqttStatus = await page.textContent('#statusText');
  console.log('MQTT status:', mqttStatus);

  await page.waitForTimeout(2000);

  console.log('Console errors:', errors.length > 0 ? errors.join('\n') : 'None');

  await browser.close();
  console.log('Test completed successfully!');
})();