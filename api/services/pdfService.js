import { launchBrowser } from "../utils/browserLauncher.js";

export const generatePDF = async (html) => {
    let browser;
    try {
        const result = await launchBrowser();
        browser = result.browser;

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