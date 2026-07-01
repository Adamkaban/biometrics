import { launch } from 'cloakbrowser';

const browser = await launch({ headless: true, humanize: true });
const page = await browser.newPage();
await page.goto('https://example.com');
console.log('Title:', await page.title());
await browser.close();
