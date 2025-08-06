/**
 * Popup Script - Main UI controller
 */
document.addEventListener('DOMContentLoaded', async () => {
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const fileInput = document.getElementById('fileInput');
    const status = document.getElementById('status');
    
    // Initialize services
    const exportService = new ExportService();
    const importService = new ImportService();
    
    /**
     * Show status message
     * @param {string} message Message to display
     * @param {string} type Type of message (success, error, info)
     */
    function showStatus(message, type = 'info') {
        status.textContent = message;
        status.className = `status ${type}`;
        status.classList.remove('hidden');
        
        // Auto-hide after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                status.classList.add('hidden');
            }, 5000);
        }
    }
    
    /**
     * Hide status message
     */
    function hideStatus() {
        status.classList.add('hidden');
    }
    
    /**
     * Disable/enable buttons during operations
     * @param {boolean} disabled Whether to disable buttons
     */
    function setButtonsDisabled(disabled) {
        exportBtn.disabled = disabled;
        importBtn.disabled = disabled;
    }
    
    // Export button click handler
    exportBtn.addEventListener('click', async () => {
        try {
            setButtonsDisabled(true);
            showStatus('Collecting tabs and bookmarks...', 'info');
            
            const result = await exportService.exportAll();
            
            showStatus(
                `Successfully exported ${result.tabCount} tabs and ${result.bookmarkCount} bookmarks to ${result.filename}`,
                'success'
            );
        } catch (error) {
            console.error('Export failed:', error);
            showStatus('Export failed: ' + error.message, 'error');
        } finally {
            setButtonsDisabled(false);
        }
    });
    
    // Import button click handler
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    // File input change handler
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            setButtonsDisabled(true);
            showStatus('Validating import file...', 'info');
            
            // Get preview information
            const preview = await importService.getImportPreview(file);
            
            if (!preview.valid) {
                throw new Error(preview.error);
            }
            
            // Show preview and confirm
            const confirmMessage = `This will import ${preview.tabCount} tabs and ${preview.bookmarkCount} bookmarks. Continue?`;
            
            if (confirm(confirmMessage)) {
                showStatus('Importing data...', 'info');
                
                const result = await importService.importFromFile(file);
                
                let message = `Successfully imported ${result.tabsImported} tabs and ${result.bookmarksImported} bookmarks`;
                
                if (result.errors && result.errors.length > 0) {
                    message += '. Some errors occurred: ' + result.errors.join(', ');
                    showStatus(message, 'error');
                } else {
                    showStatus(message, 'success');
                }
            } else {
                hideStatus();
            }
        } catch (error) {
            console.error('Import failed:', error);
            showStatus('Import failed: ' + error.message, 'error');
        } finally {
            setButtonsDisabled(false);
            fileInput.value = ''; // Reset file input
        }
    });
    
    // Initialize UI with current stats
    try {
        const stats = await exportService.getExportStats();
        if (stats.totalItems > 0) {
            showStatus(`Ready to export ${stats.tabCount} tabs and ${stats.bookmarkCount} bookmarks`, 'info');
        } else {
            showStatus('No tabs or bookmarks found to export', 'info');
        }
    } catch (error) {
        console.error('Error getting stats:', error);
        showStatus('Extension loaded successfully', 'info');
    }
});