/**
 * Test Setup - Mock Chrome APIs and globals
 */

// Mock Chrome APIs
global.chrome = {
    tabs: {
        query: jest.fn(),
        create: jest.fn(),
        get: jest.fn()
    },
    windows: {
        getAll: jest.fn(),
        create: jest.fn()
    },
    bookmarks: {
        getTree: jest.fn(),
        create: jest.fn()
    },
    downloads: {
        download: jest.fn()
    },
    runtime: {
        onInstalled: {
            addListener: jest.fn()
        },
        onStartup: {
            addListener: jest.fn()
        },
        getPlatformInfo: jest.fn()
    },
    action: {
        onClicked: {
            addListener: jest.fn()
        }
    }
};

// Mock URL and Blob for file operations
global.URL = {
    createObjectURL: jest.fn(() => 'blob:mock-url'),
    revokeObjectURL: jest.fn()
};

global.Blob = jest.fn().mockImplementation((content, options) => ({
    size: content[0].length,
    type: options.type
}));

// Mock FileReader
global.FileReader = jest.fn().mockImplementation(() => ({
    readAsText: jest.fn(),
    onload: null,
    onerror: null,
    result: null
}));

// Mock File
global.File = jest.fn().mockImplementation((content, name, options) => ({
    name: name,
    size: content.length,
    type: options.type
}));

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});