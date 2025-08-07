/**
 * Export Service - Handles data export and file download
 */

// Import dependencies for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    const TabManager = require('./tabManager.js');
    const BookmarkManager = require('./bookmarkManager.js');
    global.TabManager = TabManager;
    global.BookmarkManager = BookmarkManager;
}

class ExportService {
    constructor() {
        const TabManagerClass = typeof TabManager !== 'undefined' ? TabManager : global.TabManager;
        const BookmarkManagerClass = typeof BookmarkManager !== 'undefined' ? BookmarkManager : global.BookmarkManager;
        
        this.tabManager = new TabManagerClass();
        this.bookmarkManager = new BookmarkManagerClass();
    }
    
    /**
     * Export all tabs and bookmarks to JSON file
     * @returns {Promise<void>}
     */
    async exportAll() {
        try {
            // Collect all data
            const [tabs, bookmarks] = await Promise.all([
                this.tabManager.getAllTabs(),
                this.bookmarkManager.getAllBookmarks()
            ]);
            
            // Create export data structure
            const exportData = {
                exportInfo: {
                    timestamp: new Date().toISOString(),
                    version: '1.0.0',
                    extensionName: 'Tabby Grabby',
                    tabCount: tabs.length,
                    bookmarkCount: await this.bookmarkManager.getBookmarkCount()
                },
                openTabs: tabs,
                bookmarks: bookmarks
            };
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
            const filename = `tabby-grabby-export-${timestamp}.json`;
            
            // Download the file
            await this.downloadJSON(exportData, filename);
            
            return {
                success: true,
                filename: filename,
                tabCount: tabs.length,
                bookmarkCount: await this.bookmarkManager.getBookmarkCount()
            };
        } catch (error) {
            console.error('Export error:', error);
            throw new Error('Failed to export data: ' + error.message);
        }
    }
    
    /**
     * Download JSON data as file
     * @param {Object} data Data to export
     * @param {string} filename Name of the file
     * @returns {Promise<void>}
     */
    async downloadJSON(data, filename) {
        try {
            // Convert data to JSON string with pretty formatting
            const jsonString = JSON.stringify(data, null, 2);
            
            // Create blob
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            // Use Chrome downloads API
            await chrome.downloads.download({
                url: url,
                filename: filename,
                saveAs: true
            });
            
            // Clean up object URL after a delay
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('Download error:', error);
            throw new Error('Failed to download file');
        }
    }
    
    /**
     * Validate export data structure
     * @param {Object} data Data to validate
     * @returns {boolean} True if valid
     */
    validateExportData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Check required properties
        const requiredProps = ['exportInfo', 'openTabs', 'bookmarks'];
        for (const prop of requiredProps) {
            if (!(prop in data)) {
                return false;
            }
        }
        
        // Validate arrays
        if (!Array.isArray(data.openTabs) || !Array.isArray(data.bookmarks)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Get export statistics
     * @returns {Promise<Object>} Statistics about exportable data
     */
    async getExportStats() {
        try {
            const [tabCount, bookmarkCount] = await Promise.all([
                this.tabManager.getTabCount(),
                this.bookmarkManager.getBookmarkCount()
            ]);
            
            return {
                tabCount,
                bookmarkCount,
                totalItems: tabCount + bookmarkCount
            };
        } catch (error) {
            console.error('Error getting export stats:', error);
            return { tabCount: 0, bookmarkCount: 0, totalItems: 0 };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ExportService;
}