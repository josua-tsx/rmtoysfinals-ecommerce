import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";
import handlebars from "handlebars";

// 1. Import these specific tools from the 'url' module
import { fileURLToPath } from 'url';

// 2. Reconstruct __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePDF = async (data) => {
    
    // 3. Now you can use __dirname safely
    // Make sure your folder name matches exactly (e.g., 'template' vs 'templates')
    const templatePath = path.resolve(__dirname, '../template', 'invoice.hbs');
    
    const templateHtml = fs.readFileSync(templatePath, 'utf8');

    const template = handlebars.compile(templateHtml);
    const html = template(data);

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: puppeteer.executablePath(),
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-gpu'
        ]
    });
    
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    });

    await browser.close();

    return pdfBuffer;
};