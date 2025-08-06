/**
 * Unit Tests for TabManager
 */
const TabManager = require('../src/tabManager.js');

describe('TabManager', () => {
    let tabManager;
    
    beforeEach(() => {
        tabManager = new TabManager();
    });
    
    describe('getAllTabs', () => {
        it('should collect all tabs from all windows', async () => {
            // Mock windows with tabs
            const mockWindows = [
                {
                    id: 1,
                    tabs: [
                        { url: 'https://example.com', title: 'Example', index: 0, pinned: false, active: true },
                        { url: 'https://google.com', title: 'Google', index: 1, pinned: true, active: false }
                    ]
                },
                {
                    id: 2,
                    tabs: [
                        { url: 'https://github.com', title: 'GitHub', index: 0, pinned: false, active: true }
                    ]
                }
            ];
            
            chrome.windows.getAll.mockResolvedValue(mockWindows);
            
            const tabs = await tabManager.getAllTabs();
            
            expect(tabs).toHaveLength(3);
            expect(tabs[0]).toEqual({
                url: 'https://example.com',
                title: 'Example',
                windowId: 1,
                index: 0,
                pinned: false,
                active: true
            });
        });
        
        it('should filter out invalid URLs', async () => {
            const mockWindows = [
                {
                    id: 1,
                    tabs: [
                        { url: 'https://example.com', title: 'Example', index: 0, pinned: false, active: true },
                        { url: 'chrome://settings', title: 'Settings', index: 1, pinned: false, active: false },
                        { url: 'chrome-extension://123/popup.html', title: 'Extension', index: 2, pinned: false, active: false }
                    ]
                }
            ];
            
            chrome.windows.getAll.mockResolvedValue(mockWindows);
            
            const tabs = await tabManager.getAllTabs();
            
            expect(tabs).toHaveLength(1);
            expect(tabs[0].url).toBe('https://example.com');
        });
        
        it('should handle errors gracefully', async () => {
            chrome.windows.getAll.mockRejectedValue(new Error('Permission denied'));
            
            await expect(tabManager.getAllTabs()).rejects.toThrow('Failed to collect tabs');
        });
    });
    
    describe('restoreTabs', () => {
        it('should create new window and tabs', async () => {
            const tabs = [
                { url: 'https://example.com', title: 'Example', pinned: false },
                { url: 'https://google.com', title: 'Google', pinned: true }
            ];
            
            chrome.windows.create.mockResolvedValue({ id: 1 });
            chrome.tabs.create.mockResolvedValue({ id: 2 });
            
            await tabManager.restoreTabs(tabs);
            
            expect(chrome.windows.create).toHaveBeenCalledWith({
                url: 'https://example.com',
                focused: true
            });
            
            expect(chrome.tabs.create).toHaveBeenCalledWith({
                windowId: 1,
                url: 'https://google.com',
                pinned: true,
                active: false
            });
        });
        
        it('should handle empty tabs array', async () => {
            await tabManager.restoreTabs([]);
            
            expect(chrome.windows.create).not.toHaveBeenCalled();
        });
        
        it('should skip invalid URLs during restoration', async () => {
            const tabs = [
                { url: 'https://example.com', title: 'Example', pinned: false },
                { url: 'chrome://settings', title: 'Settings', pinned: false }
            ];
            
            chrome.windows.create.mockResolvedValue({ id: 1 });
            
            await tabManager.restoreTabs(tabs);
            
            expect(chrome.windows.create).toHaveBeenCalledTimes(1);
            expect(chrome.tabs.create).not.toHaveBeenCalled(); // Second tab should be skipped
        });
    });
    
    describe('isValidUrl', () => {
        it('should return true for valid HTTP/HTTPS URLs', () => {
            expect(tabManager.isValidUrl('https://example.com')).toBe(true);
            expect(tabManager.isValidUrl('http://example.com')).toBe(true);
        });
        
        it('should return false for invalid URLs', () => {
            expect(tabManager.isValidUrl('chrome://settings')).toBe(false);
            expect(tabManager.isValidUrl('chrome-extension://123/popup.html')).toBe(false);
            expect(tabManager.isValidUrl('about:blank')).toBe(false);
            expect(tabManager.isValidUrl('')).toBe(false);
            expect(tabManager.isValidUrl(null)).toBe(false);
        });
    });
    
    describe('getTabCount', () => {
        it('should return correct tab count', async () => {
            const mockWindows = [
                {
                    id: 1,
                    tabs: [
                        { url: 'https://example.com', title: 'Example', index: 0, pinned: false, active: true },
                        { url: 'https://google.com', title: 'Google', index: 1, pinned: false, active: false }
                    ]
                }
            ];
            
            chrome.windows.getAll.mockResolvedValue(mockWindows);
            
            const count = await tabManager.getTabCount();
            
            expect(count).toBe(2);
        });
    });
});