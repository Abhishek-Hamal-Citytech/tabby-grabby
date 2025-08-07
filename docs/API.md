# Tabby Grabby - API Reference

## Core Modules

### TabManager

Handles tab collection and restoration operations.

#### Methods

##### `getAllTabs(): Promise<Array>`
Collects all open tabs across all browser windows.

**Returns:**
- `Promise<Array>` - Array of tab objects

**Tab Object Structure:**
```javascript
{
  url: "https://example.com",
  title: "Example Site",
  windowId: 1,
  index: 0,
  pinned: false,
  active: true
}
```

##### `restoreTabs(tabs: Array): Promise<void>`
Creates new tabs from imported data.

**Parameters:**
- `tabs` - Array of tab objects to restore

##### `isValidUrl(url: string): boolean`
Checks if URL is valid for restoration.

**Parameters:**
- `url` - The URL to validate

**Returns:**
- `boolean` - True if URL is valid

##### `getTabCount(): Promise<number>`
Gets count of valid tabs for display purposes.

**Returns:**
- `Promise<number>` - Number of valid tabs

---

### BookmarkManager

Handles bookmark collection and restoration with folder structure preservation.

#### Methods

##### `getAllBookmarks(): Promise<Array>`
Collects all bookmarks with folder structure preserved.

**Returns:**
- `Promise<Array>` - Array of bookmark folder objects

**Bookmark Structure:**
```javascript
// Bookmark
{
  type: "bookmark",
  title: "Example Site",
  url: "https://example.com",
  path: "Work/Projects"
}

// Folder
{
  type: "folder",
  title: "Work",
  path: "Work",
  children: [
    // Nested bookmarks and folders
  ]
}
```

##### `restoreBookmarks(bookmarks: Array): Promise<void>`
Restores bookmarks from imported data.

**Parameters:**
- `bookmarks` - Array of bookmark objects to restore

##### `getBookmarkCount(): Promise<number>`
Gets bookmark count for display purposes.

**Returns:**
- `Promise<number>` - Number of bookmarks

---

### ExportService

Handles data export and file download operations.

#### Methods

##### `exportAll(): Promise<Object>`
Exports all tabs and bookmarks to JSON file.

**Returns:**
- `Promise<Object>` - Export result object

**Export Result:**
```javascript
{
  success: true,
  filename: "tabby-grabby-export-2023-12-07T10-30-00.json",
  tabCount: 5,
  bookmarkCount: 25
}
```

##### `downloadJSON(data: Object, filename: string): Promise<void>`
Downloads JSON data as file.

**Parameters:**
- `data` - Data to export
- `filename` - Name of the file

##### `validateExportData(data: Object): boolean`
Validates export data structure.

**Parameters:**
- `data` - Data to validate

**Returns:**
- `boolean` - True if valid

##### `getExportStats(): Promise<Object>`
Gets export statistics.

**Returns:**
- `Promise<Object>` - Statistics about exportable data

---

### ImportService

Handles data import and restoration operations.

#### Methods

##### `importFromFile(file: File): Promise<Object>`
Imports data from JSON file.

**Parameters:**
- `file` - The JSON file to import

**Returns:**
- `Promise<Object>` - Import result

**Import Result:**
```javascript
{
  success: true,
  tabsImported: 5,
  bookmarksImported: 25,
  errors: [] // Array of error messages if any
}
```

##### `validateImportData(data: Object): boolean`
Validates import data structure.

**Parameters:**
- `data` - Data to validate

**Returns:**
- `boolean` - True if valid

##### `getImportPreview(file: File): Promise<Object>`
Gets import preview information.

**Parameters:**
- `file` - File to preview

**Returns:**
- `Promise<Object>` - Preview information

---

## Data Structures

### Export Data Format

```javascript
{
  exportInfo: {
    timestamp: "2023-12-07T10:30:00.000Z",
    version: "1.0.0",
    extensionName: "Tabby Grabby",
    tabCount: 5,
    bookmarkCount: 25
  },
  openTabs: [
    {
      url: "https://example.com",
      title: "Example Site",
      windowId: 1,
      index: 0,
      pinned: false,
      active: true
    }
  ],
  bookmarks: [
    {
      type: "folder",
      title: "Work",
      path: "Work",
      children: [
        {
          type: "bookmark",
          title: "Project Docs",
          url: "https://docs.example.com",
          path: "Work"
        }
      ]
    }
  ]
}
```

### Browser API Usage

#### Chrome Extensions API

The extension uses the following Chrome APIs:

- `chrome.tabs.*` - Tab management
- `chrome.windows.*` - Window access
- `chrome.bookmarks.*` - Bookmark operations
- `chrome.downloads.*` - File downloads
- `chrome.storage.*` - Extension storage (reserved)

#### Permissions Required

```json
{
  "permissions": [
    "tabs",
    "bookmarks", 
    "downloads",
    "storage"
  ]
}
```

### Error Handling

All modules implement comprehensive error handling:

- **Permission Errors**: When browser denies API access
- **Invalid Data**: When import data is malformed
- **Network Errors**: When downloads fail
- **Validation Errors**: When data doesn't meet requirements

Error messages are user-friendly and provide actionable feedback.

### Security Considerations

- **URL Filtering**: Chrome internal URLs are filtered out
- **Data Validation**: All import data is thoroughly validated
- **Minimal Permissions**: Only necessary permissions are requested
- **XSS Prevention**: Content Security Policy enforced
- **Data Sanitization**: All user input is sanitized