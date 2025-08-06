/**
 * Unit Tests for ImportService
 */
const ImportService = require('../src/importService.js');

// Mock the manager classes
jest.mock('../src/tabManager.js');
jest.mock('../src/bookmarkManager.js');

const TabManager = require('../src/tabManager.js');
const BookmarkManager = require('../src/bookmarkManager.js');

describe('ImportService', () => {
    let importService;
    let mockTabManager;
    let mockBookmarkManager;
    
    beforeEach(() => {
        // Create mock instances
        mockTabManager = {
            restoreTabs: jest.fn()
        };
        
        mockBookmarkManager = {
            restoreBookmarks: jest.fn()
        };
        
        // Mock constructors
        TabManager.mockImplementation(() => mockTabManager);
        BookmarkManager.mockImplementation(() => mockBookmarkManager);
        
        importService = new ImportService();
    });
    
    describe('importFromFile', () => {
        it('should import valid JSON file successfully', async () => {
            const validData = {
                openTabs: [{ url: 'https://example.com', title: 'Example' }],
                bookmarks: [{ type: 'bookmark', title: 'Google', url: 'https://google.com', path: '' }]
            };
            
            const mockFile = new File([JSON.stringify(validData)], 'test.json', { type: 'application/json' });
            
            // Mock FileReader
            const mockFileReader = {
                readAsText: jest.fn(),
                result: JSON.stringify(validData),
                onload: null,
                onerror: null
            };
            
            global.FileReader.mockImplementation(() => mockFileReader);
            
            // Simulate successful file read
            importService.readFileAsText = jest.fn().mockResolvedValue(JSON.stringify(validData));
            
            mockTabManager.restoreTabs.mockResolvedValue();
            mockBookmarkManager.restoreBookmarks.mockResolvedValue();
            
            const result = await importService.importFromFile(mockFile);
            
            expect(result.success).toBe(true);
            expect(result.tabsImported).toBe(1);
            expect(result.bookmarksImported).toBe(1);
            expect(mockTabManager.restoreTabs).toHaveBeenCalledWith(validData.openTabs);
            expect(mockBookmarkManager.restoreBookmarks).toHaveBeenCalledWith(validData.bookmarks);
        });
        
        it('should reject invalid file types', async () => {
            const mockFile = new File(['test'], 'test.txt', { type: 'text/plain' });
            
            await expect(importService.importFromFile(mockFile))
                .rejects.toThrow('Please select a valid JSON file');
        });
        
        it('should reject invalid JSON content', async () => {
            const mockFile = new File(['invalid json'], 'test.json', { type: 'application/json' });
            
            importService.readFileAsText = jest.fn().mockResolvedValue('invalid json');
            
            await expect(importService.importFromFile(mockFile))
                .rejects.toThrow('Invalid JSON format');
        });
        
        it('should reject invalid data structure', async () => {
            const invalidData = { invalidStructure: true };
            const mockFile = new File([JSON.stringify(invalidData)], 'test.json', { type: 'application/json' });
            
            importService.readFileAsText = jest.fn().mockResolvedValue(JSON.stringify(invalidData));
            
            await expect(importService.importFromFile(mockFile))
                .rejects.toThrow('Invalid import data format');
        });
    });
    
    describe('validateImportData', () => {
        it('should validate correct import data structure', () => {
            const validData = {
                openTabs: [{ url: 'https://example.com', title: 'Example' }],
                bookmarks: [{ type: 'bookmark', title: 'Google', url: 'https://google.com' }]
            };
            
            expect(importService.validateImportData(validData)).toBe(true);
        });
        
        it('should reject invalid data structures', () => {
            expect(importService.validateImportData(null)).toBe(false);
            expect(importService.validateImportData({})).toBe(false);
            expect(importService.validateImportData({
                openTabs: 'not an array',
                bookmarks: []
            })).toBe(false);
            expect(importService.validateImportData({
                openTabs: [{ url: 'missing title' }],
                bookmarks: []
            })).toBe(false);
        });
    });
    
    describe('processImport', () => {
        it('should process import and handle partial failures', async () => {
            const importData = {
                openTabs: [{ url: 'https://example.com', title: 'Example' }],
                bookmarks: [{ type: 'bookmark', title: 'Google', url: 'https://google.com' }]
            };
            
            mockTabManager.restoreTabs.mockRejectedValue(new Error('Tab import failed'));
            mockBookmarkManager.restoreBookmarks.mockResolvedValue();
            
            const result = await importService.processImport(importData);
            
            expect(result.tabsImported).toBe(0);
            expect(result.bookmarksImported).toBe(1);
            expect(result.errors).toContain('Failed to import tabs: Tab import failed');
        });
    });
    
    describe('countBookmarksInData', () => {
        it('should count bookmarks recursively', () => {
            const bookmarks = [
                { type: 'bookmark', title: 'Bookmark 1' },
                {
                    type: 'folder',
                    title: 'Folder',
                    children: [
                        { type: 'bookmark', title: 'Bookmark 2' },
                        { type: 'bookmark', title: 'Bookmark 3' }
                    ]
                }
            ];
            
            const count = importService.countBookmarksInData(bookmarks);
            
            expect(count).toBe(3);
        });
    });
    
    describe('getImportPreview', () => {
        it('should provide preview information for valid files', async () => {
            const validData = {
                openTabs: [{ url: 'https://example.com', title: 'Example' }],
                bookmarks: [{ type: 'bookmark', title: 'Google', url: 'https://google.com' }],
                exportInfo: { timestamp: '2023-01-01' }
            };
            
            const mockFile = new File([JSON.stringify(validData)], 'test.json', { type: 'application/json' });
            
            importService.readFileAsText = jest.fn().mockResolvedValue(JSON.stringify(validData));
            
            const preview = await importService.getImportPreview(mockFile);
            
            expect(preview.valid).toBe(true);
            expect(preview.tabCount).toBe(1);
            expect(preview.bookmarkCount).toBe(1);
            expect(preview.exportInfo).toEqual({ timestamp: '2023-01-01' });
        });
        
        it('should handle invalid files', async () => {
            const mockFile = new File(['invalid'], 'test.json', { type: 'application/json' });
            
            importService.readFileAsText = jest.fn().mockResolvedValue('invalid');
            
            const preview = await importService.getImportPreview(mockFile);
            
            expect(preview.valid).toBe(false);
            expect(preview.error).toBeDefined();
        });
    });
});