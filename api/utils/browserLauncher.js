/**
 * Browser Launcher Utility
 * 
 * Handles launching Puppeteer in both local development (Windows/Mac)
 * and production environments (Render/Linux).
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Launches a browser instance that works in both local and cloud environments.
 * @returns {Promise<{browser: Browser, puppeteer: any}>}
 */
export const launchBrowser = async () => {
  if (isProduction) {
    // Production: Use puppeteer-core with @sparticuz/chromium (Linux only)
    const puppeteer = await import('puppeteer-core');
    const chromium = await import('@sparticuz/chromium');
    
    const executablePath = await chromium.default.executablePath();
    console.log('Production mode - Using Chromium:', executablePath);
    
    const browser = await puppeteer.default.launch({
      args: chromium.default.args,
      defaultViewport: chromium.default.defaultViewport,
      executablePath: executablePath,
      headless: chromium.default.headless,
    });
    
    return { browser, puppeteer: puppeteer.default };
  } else {
    // Development: Use regular puppeteer with bundled Chrome
    const puppeteer = await import('puppeteer');
    console.log('Development mode - Using bundled Puppeteer Chrome');
    
    const browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
    });
    
    return { browser, puppeteer: puppeteer.default };
  }
};

export default launchBrowser;
