/**
 * Bookmark Manager - Handles bookmark collection and restoration
 */
class BookmarkManager {
    /**
     * Collect all bookmarks with folder structure preserved
     * @returns {Promise<Array>} Array of bookmark folder objects
     */
    async getAllBookmarks() {
        try {
            const bookmarkTree = await chrome.bookmarks.getTree();
            const processedBookmarks = [];
            
            // Process each root node (usually "Bookmarks Bar" and "Other Bookmarks")
            for (const rootNode of bookmarkTree) {
                if (rootNode.children) {
                    this.processBookmarkNode(rootNode, processedBookmarks);
                }
            }
            
            return processedBookmarks;
        } catch (error) {
            console.error('Error collecting bookmarks:', error);
            throw new Error('Failed to collect bookmarks');
        }
    }
    
    /**
     * Recursively process bookmark nodes to preserve folder structure
     * @param {Object} node Current bookmark node
     * @param {Array} result Array to store processed bookmarks
     * @param {string} parentPath Path of parent folder
     */
    processBookmarkNode(node, result, parentPath = '') {
        if (!node.children) return;
        
        for (const child of node.children) {
            if (child.children) {
                // This is a folder
                const folderPath = parentPath ? `${parentPath}/${child.title}` : child.title;
                const folder = {
                    type: 'folder',
                    title: child.title,
                    path: folderPath,
                    children: []
                };
                
                // Recursively process folder contents
                this.processBookmarkNode(child, folder.children, folderPath);
                
                if (folder.children.length > 0) {
                    result.push(folder);
                }
            } else if (child.url) {
                // This is a bookmark
                result.push({
                    type: 'bookmark',
                    title: child.title,
                    url: child.url,
                    path: parentPath
                });
            }
        }
    }
    
    /**
     * Restore bookmarks from imported data
     * @param {Array} bookmarks Array of bookmark objects to restore
     * @returns {Promise<void>}
     */
    async restoreBookmarks(bookmarks) {
        if (!Array.isArray(bookmarks) || bookmarks.length === 0) {
            return;
        }
        
        try {
            // Create a root folder for imported bookmarks
            const importFolder = await chrome.bookmarks.create({
                parentId: '1', // Other Bookmarks folder
                title: `Tabby Grabby Import - ${new Date().toISOString().split('T')[0]}`
            });
            
            // Group bookmarks by folder
            const folderMap = new Map();
            folderMap.set('', importFolder.id); // Root level
            
            // Create folders first
            for (const item of bookmarks) {
                if (item.type === 'folder') {
                    await this.createFolderStructure(item, importFolder.id, folderMap);
                }
            }
            
            // Then create bookmarks
            for (const item of bookmarks) {
                if (item.type === 'bookmark') {
                    const parentId = folderMap.get(item.path || '') || importFolder.id;
                    await chrome.bookmarks.create({
                        parentId: parentId,
                        title: item.title,
                        url: item.url
                    });
                }
            }
        } catch (error) {
            console.error('Error restoring bookmarks:', error);
            throw new Error('Failed to restore bookmarks');
        }
    }
    
    /**
     * Recursively create folder structure
     * @param {Object} folder Folder object to create
     * @param {string} parentId Parent folder ID
     * @param {Map} folderMap Map of folder paths to IDs
     */
    async createFolderStructure(folder, parentId, folderMap) {
        const createdFolder = await chrome.bookmarks.create({
            parentId: parentId,
            title: folder.title
        });
        
        folderMap.set(folder.path, createdFolder.id);
        
        // Create subfolders
        for (const child of folder.children) {
            if (child.type === 'folder') {
                await this.createFolderStructure(child, createdFolder.id, folderMap);
            }
        }
    }
    
    /**
     * Get bookmark count for display purposes
     * @returns {Promise<number>} Number of bookmarks
     */
    async getBookmarkCount() {
        const bookmarks = await this.getAllBookmarks();
        let count = 0;
        
        const countBookmarks = (items) => {
            for (const item of items) {
                if (item.type === 'bookmark') {
                    count++;
                } else if (item.type === 'folder' && item.children) {
                    countBookmarks(item.children);
                }
            }
        };
        
        countBookmarks(bookmarks);
        return count;
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BookmarkManager;
}