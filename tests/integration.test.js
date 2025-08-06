/**
 * Integration Tests - End-to-end workflow testing
 */

// Import services for integration testing
const ExportService = require('../src/exportService.js');
const ImportService = require('../src/importService.js');

describe('Integration Tests', () => {
    describe('Export-Import Workflow', () => {
        it('should complete full export-import cycle', async () => {
            // Mock complete browser environment
            const mockTabs = [
                { url: 'https://example.com', title: 'Example', windowId: 1, index: 0, pinned: false, active: true },
                { url: 'https://google.com', title: 'Google', windowId: 1, index: 1, pinned: true, active: false }
            ];
            
            // Setup Chrome API mocks for export
            chrome.windows.getAll.mockResolvedValue([{
                id: 1,
                tabs: mockTabs.map(tab => ({ ...tab, title: tab.title }))
            }]);
            
            chrome.bookmarks.getTree.mockResolvedValue([{
                children: [{
                    title: 'Root',
                    children: [
                        { title: 'GitHub', url: 'https://github.com' },
                        {
                            title: 'Work',
                            children: [
                                { title: 'Docs', url: 'https://docs.com' }
                            ]
                        }
                    ]
                }]
            }]);
            
            chrome.downloads.download.mockResolvedValue(undefined);
            
            // Test export
            const exportService = new ExportService();
            
            // Mock the export to capture the data instead of downloading
            let exportedData;
            exportService.downloadJSON = jest.fn().mockImplementation((data) => {
                exportedData = data;
                return Promise.resolve();
            });
            
            const exportResult = await exportService.exportAll();
            
            expect(exportResult.success).toBe(true);
            expect(exportedData).toBeDefined();
            expect(exportedData.openTabs).toHaveLength(2);
            expect(exportedData.bookmarks).toHaveLength(1); // One root folder containing bookmarks
            
            // Test import with the exported data
            const importService = new ImportService();
            
            // Setup Chrome API mocks for import
            chrome.windows.create.mockResolvedValue({ id: 2 });
            chrome.tabs.create.mockResolvedValue({ id: 1 });
            chrome.bookmarks.create
                .mockResolvedValueOnce({ id: 'import-folder' })
                .mockResolvedValueOnce({ id: 'github-bookmark' })
                .mockResolvedValueOnce({ id: 'work-folder' })
                .mockResolvedValueOnce({ id: 'docs-bookmark' });
            
            // Create mock file
            const mockFile = new File(
                [JSON.stringify(exportedData)],
                'test-export.json',
                { type: 'application/json' }
            );
            
            // Mock file reading
            importService.readFileAsText = jest.fn().mockResolvedValue(JSON.stringify(exportedData));
            
            const importResult = await importService.importFromFile(mockFile);
            
            expect(importResult.success).toBe(true);
            expect(importResult.tabsImported).toBe(2);
            expect(importResult.bookmarksImported).toBe(2);
            expect(importResult.errors).toHaveLength(0);
            
            // Verify Chrome API calls
            expect(chrome.windows.create).toHaveBeenCalledWith({
                url: 'https://example.com',
                focused: true
            });
            
            expect(chrome.tabs.create).toHaveBeenCalledWith({
                windowId: 2,
                url: 'https://google.com',
                pinned: true,
                active: false
            });
        });
        
        it('should handle partial import failures gracefully', async () => {
            const importData = {
                openTabs: [{ url: 'https://example.com', title: 'Example' }],
                bookmarks: [{ type: 'bookmark', title: 'GitHub', url: 'https://github.com' }]
            };
            
            // Mock tab restoration failure
            chrome.windows.create.mockRejectedValue(new Error('Permission denied'));
            
            // Mock successful bookmark restoration
            chrome.bookmarks.create.mockResolvedValue({ id: 'bookmark-1' });
            
            const importService = new ImportService();
            importService.readFileAsText = jest.fn().mockResolvedValue(JSON.stringify(importData));
            
            const mockFile = new File(
                [JSON.stringify(importData)],
                'test.json',
                { type: 'application/json' }
            );
            
            const result = await importService.importFromFile(mockFile);
            
            expect(result.success).toBe(true);
            expect(result.tabsImported).toBe(0);
            expect(result.bookmarksImported).toBe(1);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain('Failed to import tabs');
        });
    });
    
    describe('Error Handling', () => {
        it('should handle permission errors gracefully', async () => {
            chrome.windows.getAll.mockRejectedValue(new Error('Extension does not have permission'));
            
            const exportService = new ExportService();
            
            await expect(exportService.exportAll()).rejects.toThrow('Failed to export data');
        });
        
        it('should validate data integrity throughout the process', async () => {
            const corruptedData = {
                openTabs: 'not an array',
                bookmarks: null
            };
            
            const importService = new ImportService();
            importService.readFileAsText = jest.fn().mockResolvedValue(JSON.stringify(corruptedData));
            
            const mockFile = new File(
                [JSON.stringify(corruptedData)],
                'corrupted.json',
                { type: 'application/json' }
            );
            
            await expect(importService.importFromFile(mockFile))
                .rejects.toThrow('Invalid import data format');
        });
    });
    
    describe('Performance Tests', () => {
        it('should handle large datasets efficiently', async () => {
            // Create large dataset
            const largeTabs = Array.from({ length: 100 }, (_, i) => ({
                url: `https://example${i}.com`,
                title: `Example ${i}`,
                windowId: 1,
                index: i,
                pinned: false,
                active: i === 0
            }));
            
            const largeBookmarks = Array.from({ length: 50 }, (_, i) => ({
                type: 'bookmark',
                title: `Bookmark ${i}`,
                url: `https://bookmark${i}.com`,
                path: ''
            }));
            
            chrome.windows.getAll.mockResolvedValue([{ id: 1, tabs: largeTabs }]);
            chrome.bookmarks.getTree.mockResolvedValue([{
                children: [{
                    title: 'Root',
                    children: largeBookmarks.map(b => ({ title: b.title, url: b.url }))
                }]
            }]);
            
            const exportService = new ExportService();
            
            const startTime = Date.now();
            
            // Mock download to avoid actual file operations
            exportService.downloadJSON = jest.fn().mockResolvedValue();
            
            const result = await exportService.exportAll();
            
            const endTime = Date.now();
            
            expect(result.success).toBe(true);
            expect(result.tabCount).toBe(100);
            expect(result.bookmarkCount).toBe(50);
            
            // Should complete within reasonable time (less than 1 second for mocked operations)
            expect(endTime - startTime).toBeLessThan(1000);
        });
    });
});