/**
 * Tab Manager - Handles tab collection and restoration
 */
class TabManager {
    /**
     * Collect all open tabs across all browser windows
     * @returns {Promise<Array>} Array of tab objects
     */
    async getAllTabs() {
        try {
            const windows = await chrome.windows.getAll({ populate: true });
            const allTabs = [];
            
            for (const window of windows) {
                for (const tab of window.tabs) {
                    // Skip chrome:// and other restricted URLs
                    if (this.isValidUrl(tab.url)) {
                        allTabs.push({
                            url: tab.url,
                            title: tab.title,
                            windowId: window.id,
                            index: tab.index,
                            pinned: tab.pinned,
                            active: tab.active
                        });
                    }
                }
            }
            
            return allTabs;
        } catch (error) {
            console.error('Error collecting tabs:', error);
            throw new Error('Failed to collect tabs');
        }
    }
    
    /**
     * Create new tabs from imported data
     * @param {Array} tabs Array of tab objects to restore
     * @returns {Promise<void>}
     */
    async restoreTabs(tabs) {
        if (!Array.isArray(tabs) || tabs.length === 0) {
            return;
        }
        
        try {
            // Create a new window for restored tabs
            const window = await chrome.windows.create({
                url: tabs[0].url,
                focused: true
            });
            
            // Create remaining tabs in the new window
            for (let i = 1; i < tabs.length; i++) {
                const tab = tabs[i];
                if (this.isValidUrl(tab.url)) {
                    await chrome.tabs.create({
                        windowId: window.id,
                        url: tab.url,
                        pinned: tab.pinned || false,
                        active: false
                    });
                }
            }
        } catch (error) {
            console.error('Error restoring tabs:', error);
            throw new Error('Failed to restore tabs');
        }
    }
    
    /**
     * Check if URL is valid for restoration
     * @param {string} url The URL to validate
     * @returns {boolean} True if URL is valid
     */
    isValidUrl(url) {
        if (!url) return false;
        
        // Skip internal chrome pages and extensions
        const invalidPrefixes = [
            'chrome://',
            'chrome-extension://',
            'edge://',
            'about:',
            'moz-extension://'
        ];
        
        return !invalidPrefixes.some(prefix => url.startsWith(prefix));
    }
    
    /**
     * Get tab count for display purposes
     * @returns {Promise<number>} Number of valid tabs
     */
    async getTabCount() {
        const tabs = await this.getAllTabs();
        return tabs.length;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TabManager;
}