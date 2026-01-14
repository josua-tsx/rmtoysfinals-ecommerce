import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Handlebars from 'handlebars';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates a PDF report from a Handlebars template.
 * @param {string} templateName - Name of the template file (e.g., 'report_sales.html').
 * @param {Object} data - Data to inject into the template.
 * @returns {Promise<Buffer>} - PDF file as a buffer.
 */
export const generateReportPdf = async (templateName, data) => {
  // Read and compile the HTML template
  const templatePath = path.join(__dirname, '../template', templateName);
  const templateHtml = fs.readFileSync(templatePath, 'utf-8');
  const template = Handlebars.compile(templateHtml);

  // Render HTML with data
  const html = template(data);

  // Launch Puppeteer and generate PDF
  const exePath = puppeteer.executablePath();
  console.log('Using Puppeteer executable path:', exePath);
  
  // Diagnostic: Check if path exists
  if (!fs.existsSync(exePath)) {
    console.error('CRITICAL: Chrome executable NOT FOUND at', exePath);
    try {
      const cacheBase = path.join('/opt/render/.cache/puppeteer', 'chrome');
      if (fs.existsSync(cacheBase)) {
        console.log('Contents of Chrome cache folder:', fs.readdirSync(cacheBase));
        // Check deeper
        const linuxFolder = fs.readdirSync(cacheBase)[0];
        if (linuxFolder) {
           const subFolder = path.join(cacheBase, linuxFolder);
           console.log(`Contents of ${subFolder}:`, fs.readdirSync(subFolder));
        }
      } else {
        console.log('Chrome cache folder does not exist at /opt/render/.cache/puppeteer/chrome');
      }
    } catch (diagError) {
      console.error('Diagnostic failed:', diagError);
    }
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: exePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ],
    });
  } catch (launchError) {
    console.error('Puppeteer Launch ERROR:', launchError);
    throw new Error(`Failed to launch browser: ${launchError.message}`);
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    if (browser) await browser.close();
    console.error('PDF Generation ERROR:', error);
    throw error;
  }
};

// Register Handlebars helpers for formatting
Handlebars.registerHelper('formatCurrency', function (value) {
  return (value || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
});

Handlebars.registerHelper('formatDate', function (date) {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
});

Handlebars.registerHelper('formatDateShort', function (date) {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
});
