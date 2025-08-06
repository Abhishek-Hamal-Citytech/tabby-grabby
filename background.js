/**
 * Background Script - Service Worker for Manifest V3
 */

// Extension installation and updates
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Tabby Grabby extension installed/updated:', details.reason);
    
    if (details.reason === 'install') {
        // Show welcome notification or open onboarding
        console.log('Welcome to Tabby Grabby!');
    }
});

// Handle browser action click (if needed for debugging)
chrome.action.onClicked.addListener((tab) => {
    console.log('Tabby Grabby action clicked on tab:', tab.url);
});

// Keep service worker alive and handle any background tasks
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();