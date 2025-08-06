/**
 * Import Service - Handles data import and restoration
 */

// Import dependencies for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    const TabManager = require('./tabManager.js');
    const BookmarkManager = require('./bookmarkManager.js');
    global.TabManager = TabManager;
    global.BookmarkManager = BookmarkManager;
}

class ImportService {
    constructor() {
        const TabManagerClass = typeof TabManager !== 'undefined' ? TabManager : global.TabManager;
        const BookmarkManagerClass = typeof BookmarkManager !== 'undefined' ? BookmarkManager : global.BookmarkManager;
        
        this.tabManager = new TabManagerClass();
        this.bookmarkManager = new BookmarkManagerClass();
    }
    
    /**
     * Import data from JSON file
     * @param {File} file The JSON file to import
     * @returns {Promise<Object>} Import result
     */
    async importFromFile(file) {
        try {
            // Validate file type
            if (!file || file.type !== 'application/json') {
                throw new Error('Please select a valid JSON file');
            }
            
            // Read file content
            const fileContent = await this.readFileAsText(file);
            
            // Parse JSON
            let importData;
            try {
                importData = JSON.parse(fileContent);
            } catch (parseError) {
                throw new Error('Invalid JSON format');
            }
            
            // Validate data structure
            if (!this.validateImportData(importData)) {
                throw new Error('Invalid import data format');
            }
            
            // Import tabs and bookmarks
            const results = await this.processImport(importData);
            
            return {
                success: true,
                ...results
            };
        } catch (error) {
            console.error('Import error:', error);
            throw new Error('Failed to import data: ' + error.message);
        }
    }
    
    /**
     * Read file content as text
     * @param {File} file File to read
     * @returns {Promise<string>} File content
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }
    
    /**
     * Validate import data structure
     * @param {Object} data Data to validate
     * @returns {boolean} True if valid
     */
    validateImportData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        
        // Check for required properties
        if (!('openTabs' in data) || !('bookmarks' in data)) {
            return false;
        }
        
        // Validate arrays
        if (!Array.isArray(data.openTabs) || !Array.isArray(data.bookmarks)) {
            return false;
        }
        
        // Validate tab structure
        for (const tab of data.openTabs) {
            if (!tab.url || !tab.title) {
                return false;
            }
        }
        
        // Validate bookmark structure
        for (const bookmark of data.bookmarks) {
            if (bookmark.type === 'bookmark' && (!bookmark.url || !bookmark.title)) {
                return false;
            }
            if (bookmark.type === 'folder' && !bookmark.title) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Process the import operation
     * @param {Object} importData Data to import
     * @returns {Promise<Object>} Import results
     */
    async processImport(importData) {
        const results = {
            tabsImported: 0,
            bookmarksImported: 0,
            errors: []
        };
        
        try {
            // Import tabs
            if (importData.openTabs && importData.openTabs.length > 0) {
                await this.tabManager.restoreTabs(importData.openTabs);
                results.tabsImported = importData.openTabs.length;
            }
        } catch (error) {
            results.errors.push('Failed to import tabs: ' + error.message);
        }
        
        try {
            // Import bookmarks
            if (importData.bookmarks && importData.bookmarks.length > 0) {
                await this.bookmarkManager.restoreBookmarks(importData.bookmarks);
                results.bookmarksImported = await this.countBookmarksInData(importData.bookmarks);
            }
        } catch (error) {
            results.errors.push('Failed to import bookmarks: ' + error.message);
        }
        
        return results;
    }
    
    /**
     * Count total bookmarks in import data
     * @param {Array} bookmarks Bookmark data
     * @returns {number} Total bookmark count
     */
    countBookmarksInData(bookmarks) {
        let count = 0;
        
        const countRecursive = (items) => {
            for (const item of items) {
                if (item.type === 'bookmark') {
                    count++;
                } else if (item.type === 'folder' && item.children) {
                    countRecursive(item.children);
                }
            }
        };
        
        countRecursive(bookmarks);
        return count;
    }
    
    /**
     * Get import preview information
     * @param {File} file File to preview
     * @returns {Promise<Object>} Preview information
     */
    async getImportPreview(file) {
        try {
            const fileContent = await this.readFileAsText(file);
            const importData = JSON.parse(fileContent);
            
            if (!this.validateImportData(importData)) {
                throw new Error('Invalid import data format');
            }
            
            return {
                valid: true,
                tabCount: importData.openTabs ? importData.openTabs.length : 0,
                bookmarkCount: importData.bookmarks ? this.countBookmarksInData(importData.bookmarks) : 0,
                exportInfo: importData.exportInfo || null
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImportService;
}