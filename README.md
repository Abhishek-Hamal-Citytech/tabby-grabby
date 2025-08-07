# Tabby Grabby - Professional Tab & Bookmark Manager

A professional-grade browser extension for tab and bookmark management with import/export capabilities. Compatible with Chrome, Firefox, and Vivaldi browsers.

## Features

### 🚀 Core Functionality
- **Export All**: Collect all currently open tabs and bookmarks into a structured JSON file
- **Import From**: Restore tabs and bookmarks from previously exported JSON files
- **Cross-Browser Compatibility**: Works on Chrome, Firefox, and Vivaldi
- **Folder Structure Preservation**: Maintains bookmark folder hierarchy during export/import
- **Data Validation**: Comprehensive validation for import/export data integrity

### 📋 Technical Highlights
- **Manifest V3 Compliance**: Modern extension architecture for Chrome compatibility
- **Modular Architecture**: Clean separation of concerns with dedicated modules
- **Comprehensive Testing**: Full unit and integration test coverage
- **Error Handling**: Graceful error handling and user feedback
- **Security**: Follows browser extension security best practices

## Installation

### Development Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd tabby-grabby
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run tests**:
   ```bash
   npm test
   ```

4. **Run linting**:
   ```bash
   npm run lint
   ```

### Browser Installation

#### Chrome/Chromium
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" and select the extension directory
4. The extension icon should appear in your browser toolbar

#### Firefox
1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox" → "Load Temporary Add-on"
3. Select the `manifest.json` file from the extension directory
4. The extension will be loaded temporarily

#### Vivaldi
1. Open Vivaldi and navigate to `vivaldi://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the extension directory

## Usage

### Export Tabs and Bookmarks
1. Click the Tabby Grabby extension icon
2. Click "Export All" button
3. Choose where to save the JSON file
4. The file will contain all your open tabs and bookmarks with folder structure preserved

### Import Tabs and Bookmarks
1. Click the Tabby Grabby extension icon
2. Click "Import From" button
3. Select a previously exported JSON file
4. Confirm the import preview
5. Your tabs and bookmarks will be restored

### JSON File Structure
```json
{
  "exportInfo": {
    "timestamp": "2023-12-07T10:30:00.000Z",
    "version": "1.0.0",
    "extensionName": "Tabby Grabby",
    "tabCount": 5,
    "bookmarkCount": 25
  },
  "openTabs": [
    {
      "url": "https://example.com",
      "title": "Example Site",
      "windowId": 1,
      "index": 0,
      "pinned": false,
      "active": true
    }
  ],
  "bookmarks": [
    {
      "type": "folder",
      "title": "Work",
      "path": "Work",
      "children": [
        {
          "type": "bookmark",
          "title": "Project Docs",
          "url": "https://docs.example.com",
          "path": "Work"
        }
      ]
    }
  ]
}
```

## Architecture

### Module Structure
```
src/
├── tabManager.js       # Tab collection and restoration
├── bookmarkManager.js  # Bookmark handling with folder structure
├── exportService.js    # Data export and file download
└── importService.js    # Data import and restoration

tests/
├── setup.js           # Test environment setup
├── tabManager.test.js # Tab manager unit tests
├── bookmarkManager.test.js # Bookmark manager unit tests
├── exportService.test.js # Export service unit tests
├── importService.test.js # Import service unit tests
└── integration.test.js # End-to-end integration tests
```

### Browser APIs Used
- **tabs**: Access and create browser tabs
- **bookmarks**: Read and create bookmarks with folder structure
- **downloads**: Download exported JSON files
- **storage**: Store extension preferences (if needed)
- **windows**: Access browser windows for tab collection

### Security & Permissions
The extension requests minimal permissions:
- `tabs`: Required to access open tabs for export/import
- `bookmarks`: Required to read/write bookmark data
- `downloads`: Required to save export files
- `storage`: For extension settings (currently unused but reserved)

## Development

### Project Structure
```
tabby-grabby/
├── manifest.json       # Extension manifest (Manifest V3)
├── popup.html         # Extension popup UI
├── popup.css          # UI styles
├── popup.js           # Main popup controller
├── background.js      # Service worker (Manifest V3)
├── src/               # Core modules
├── tests/             # Test suite
├── icons/             # Extension icons
├── docs/              # Documentation
├── package.json       # Node.js dependencies
└── README.md          # This file
```

### Testing
- **Unit Tests**: Test individual modules in isolation
- **Integration Tests**: Test complete export/import workflows
- **Mock Testing**: Uses Jest with Chrome API mocks
- **Coverage**: Comprehensive test coverage across all modules

### Code Quality
- **ESLint**: JavaScript linting and style enforcement
- **Jest**: Testing framework with browser API mocking
- **Modular Design**: Clean separation of concerns
- **Error Handling**: Comprehensive error handling and user feedback

## Deployment

### Chrome Web Store
1. Build the extension: `npm run build`
2. Create a zip package: `npm run package`
3. Upload to Chrome Web Store Developer Console
4. Fill out store listing information
5. Submit for review

### Firefox Add-ons (AMO)
1. Ensure Firefox compatibility (already implemented)
2. Create a zip package with all files
3. Upload to Firefox Add-on Developer Hub
4. Complete listing information
5. Submit for review

### Manual Distribution
1. Create zip packages for each browser
2. Distribute zip files to users
3. Users can load as unpacked extensions in developer mode

## Browser Compatibility

### Chrome/Chromium
- ✅ Manifest V3 compatible
- ✅ Full feature support
- ✅ Tested and working

### Firefox
- ✅ Manifest V2/V3 compatible with polyfills
- ✅ Full feature support
- ✅ Cross-browser APIs used

### Vivaldi
- ✅ Chrome extension compatibility
- ✅ Inherits Chrome extension support
- ✅ Full feature support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes with tests
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes: `git commit -m 'Add new feature'`
7. Push to the branch: `git push origin feature/new-feature`
8. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues, feature requests, or questions:
- Create an issue on GitHub
- Follow the issue template
- Provide detailed reproduction steps

---

**Tabby Grabby** - Making tab and bookmark management effortless across all browsers.
