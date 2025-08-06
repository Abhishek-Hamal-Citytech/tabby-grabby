/**
 * Unit Tests for ExportService
 */
const ExportService = require('../src/exportService.js');

// Mock the manager classes
jest.mock('../src/tabManager.js');
jest.mock('../src/bookmarkManager.js');

const TabManager = require('../src/tabManager.js');
const BookmarkManager = require('../src/bookmarkManager.js');

describe('ExportService', () => {
    let exportService;
    let mockTabManager;
    let mockBookmarkManager;
    
    beforeEach(() => {
        // Create mock instances
        mockTabManager = {
            getAllTabs: jest.fn(),
            getTabCount: jest.fn()
        };
        
        mockBookmarkManager = {
            getAllBookmarks: jest.fn(),
            getBookmarkCount: jest.fn()
        };
        
        // Mock constructors
        TabManager.mockImplementation(() => mockTabManager);
        BookmarkManager.mockImplementation(() => mockBookmarkManager);
        
        exportService = new ExportService();
    });
    
    describe('exportAll', () => {
        it('should export tabs and bookmarks successfully', async () => {
            const mockTabs = [
                { url: 'https://example.com', title: 'Example' }
            ];
            
            const mockBookmarks = [
                { type: 'bookmark', title: 'Google', url: 'https://google.com', path: '' }
            ];
            
            mockTabManager.getAllTabs.mockResolvedValue(mockTabs);
            mockBookmarkManager.getAllBookmarks.mockResolvedValue(mockBookmarks);
            mockBookmarkManager.getBookmarkCount.mockResolvedValue(1);
            
            chrome.downloads.download.mockResolvedValue(undefined);
            
            const result = await exportService.exportAll();
            
            expect(result.success).toBe(true);
            expect(result.tabCount).toBe(1);
            expect(result.bookmarkCount).toBe(1);
            expect(result.filename).toMatch(/tabby-grabby-export-.*\.json/);
            expect(chrome.downloads.download).toHaveBeenCalled();
        });
        
        it('should handle export errors', async () => {
            mockTabManager.getAllTabs.mockRejectedValue(new Error('Permission denied'));
            
            await expect(exportService.exportAll()).rejects.toThrow('Failed to export data');
        });
    });
    
    describe('downloadJSON', () => {
        it('should create blob and trigger download', async () => {
            const testData = { test: 'data' };
            const filename = 'test.json';
            
            chrome.downloads.download.mockResolvedValue(undefined);
            
            await exportService.downloadJSON(testData, filename);
            
            expect(global.Blob).toHaveBeenCalledWith(
                [JSON.stringify(testData, null, 2)],
                { type: 'application/json' }
            );
            
            expect(chrome.downloads.download).toHaveBeenCalledWith({
                url: 'blob:mock-url',
                filename: filename,
                saveAs: true
            });
        });
        
        it('should handle download errors', async () => {
            chrome.downloads.download.mockRejectedValue(new Error('Download failed'));
            
            await expect(exportService.downloadJSON({}, 'test.json'))
                .rejects.toThrow('Failed to download file');
        });
    });
    
    describe('validateExportData', () => {
        it('should validate correct export data structure', () => {
            const validData = {
                exportInfo: { timestamp: '2023-01-01' },
                openTabs: [],
                bookmarks: []
            };
            
            expect(exportService.validateExportData(validData)).toBe(true);
        });
        
        it('should reject invalid data structures', () => {
            expect(exportService.validateExportData(null)).toBe(false);
            expect(exportService.validateExportData({})).toBe(false);
            expect(exportService.validateExportData({
                exportInfo: {},
                openTabs: 'not an array',
                bookmarks: []
            })).toBe(false);
        });
    });
    
    describe('getExportStats', () => {
        it('should return statistics about exportable data', async () => {
            mockTabManager.getTabCount.mockResolvedValue(5);
            mockBookmarkManager.getBookmarkCount.mockResolvedValue(10);
            
            const stats = await exportService.getExportStats();
            
            expect(stats).toEqual({
                tabCount: 5,
                bookmarkCount: 10,
                totalItems: 15
            });
        });
        
        it('should handle errors gracefully', async () => {
            mockTabManager.getTabCount.mockRejectedValue(new Error('Error'));
            
            const stats = await exportService.getExportStats();
            
            expect(stats).toEqual({
                tabCount: 0,
                bookmarkCount: 0,
                totalItems: 0
            });
        });
    });
});