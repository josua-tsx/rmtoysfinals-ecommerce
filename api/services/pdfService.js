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
    // Launch Puppeteer and generate PDF
    console.log('Using Puppeteer executable path:', puppeteer.executablePath());

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            executablePath: puppeteer.executablePath(),
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
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
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        await browser.close();
        return pdfBuffer;
    } catch (error) {
        if (browser) await browser.close();
        console.error('PDF Generation ERROR:', error);
        throw error;
    }
};