/**
 * Unit Tests for BookmarkManager
 */
const BookmarkManager = require('../src/bookmarkManager.js');

describe('BookmarkManager', () => {
    let bookmarkManager;
    
    beforeEach(() => {
        bookmarkManager = new BookmarkManager();
    });
    
    describe('getAllBookmarks', () => {
        it('should collect bookmarks with folder structure', async () => {
            const mockBookmarkTree = [
                {
                    children: [
                        {
                            title: 'Bookmarks Bar',
                            children: [
                                { title: 'Google', url: 'https://google.com' },
                                {
                                    title: 'Work',
                                    children: [
                                        { title: 'GitHub', url: 'https://github.com' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ];
            
            chrome.bookmarks.getTree.mockResolvedValue(mockBookmarkTree);
            
            const bookmarks = await bookmarkManager.getAllBookmarks();
            
            // The processing logic creates a folder structure, so we expect the folder to contain its children
            expect(bookmarks).toHaveLength(1); // One folder (Bookmarks Bar)
            expect(bookmarks[0].type).toBe('folder');
            expect(bookmarks[0].title).toBe('Bookmarks Bar');
            expect(bookmarks[0].children).toHaveLength(2); // Google bookmark + Work folder
        });
        
        it('should handle empty bookmark tree', async () => {
            chrome.bookmarks.getTree.mockResolvedValue([{ children: [] }]);
            
            const bookmarks = await bookmarkManager.getAllBookmarks();
            
            expect(bookmarks).toHaveLength(0);
        });
        
        it('should handle errors gracefully', async () => {
            chrome.bookmarks.getTree.mockRejectedValue(new Error('Permission denied'));
            
            await expect(bookmarkManager.getAllBookmarks()).rejects.toThrow('Failed to collect bookmarks');
        });
    });
    
    describe('restoreBookmarks', () => {
        it('should create import folder and restore bookmarks', async () => {
            const bookmarks = [
                {
                    type: 'bookmark',
                    title: 'Google',
                    url: 'https://google.com',
                    path: ''
                },
                {
                    type: 'folder',
                    title: 'Work',
                    path: 'Work',
                    children: [
                        {
                            type: 'bookmark',
                            title: 'GitHub',
                            url: 'https://github.com',
                            path: 'Work'
                        }
                    ]
                }
            ];
            
            chrome.bookmarks.create
                .mockResolvedValueOnce({ id: 'import-folder' }) // Import folder
                .mockResolvedValueOnce({ id: 'work-folder' })   // Work folder
                .mockResolvedValueOnce({ id: 'google-bookmark' }); // Google bookmark
            
            await bookmarkManager.restoreBookmarks(bookmarks);
            
            expect(chrome.bookmarks.create).toHaveBeenCalledTimes(3);
            
            // Check import folder creation
            expect(chrome.bookmarks.create).toHaveBeenNthCalledWith(1, {
                parentId: '1',
                title: expect.stringContaining('Tabby Grabby Import')
            });
            
            // Check bookmark creation
            expect(chrome.bookmarks.create).toHaveBeenCalledWith({
                parentId: 'import-folder',
                title: 'Google',
                url: 'https://google.com'
            });
        });
        
        it('should handle empty bookmarks array', async () => {
            await bookmarkManager.restoreBookmarks([]);
            
            expect(chrome.bookmarks.create).not.toHaveBeenCalled();
        });
    });
    
    describe('getBookmarkCount', () => {
        it('should count bookmarks recursively', async () => {
            const mockBookmarkTree = [
                {
                    children: [
                        {
                            title: 'Root',
                            children: [
                                { title: 'Bookmark 1', url: 'https://example1.com' },
                                { title: 'Bookmark 2', url: 'https://example2.com' },
                                {
                                    title: 'Folder',
                                    children: [
                                        { title: 'Bookmark 3', url: 'https://example3.com' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ];
            
            chrome.bookmarks.getTree.mockResolvedValue(mockBookmarkTree);
            
            const count = await bookmarkManager.getBookmarkCount();
            
            expect(count).toBe(3);
        });
    });
});