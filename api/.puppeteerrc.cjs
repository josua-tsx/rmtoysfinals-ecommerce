/**
 * Puppeteer Configuration for Render Deployment
 * 
 * This config ensures Chrome is installed in a project-local directory
 * that persists across Render deployments.
 */
const path = require('path');

module.exports = {
  // Cache Chrome in the project directory so it survives Render deployments
  cacheDirectory: path.join(__dirname, '.cache', 'puppeteer'),
};
