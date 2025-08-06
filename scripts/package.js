/**
 * Package Script - Creates deployment packages for different browsers
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Files to include in the package
const extensionFiles = [
    'manifest.json',
    'popup.html',
    'popup.css',
    'popup.js',
    'background.js',
    'src/',
    'icons/',
    'README.md'
];

// Create directories if they don't exist
function ensureDir(dir) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

// Copy files for packaging
function copyFiles(sourceDir, targetDir, files) {
    ensureDir(targetDir);
    
    files.forEach(file => {
        const sourcePath = path.join(sourceDir, file);
        const targetPath = path.join(targetDir, file);
        
        if (fs.existsSync(sourcePath)) {
            const stat = fs.statSync(sourcePath);
            
            if (stat.isDirectory()) {
                // Copy directory recursively
                execSync(`cp -r "${sourcePath}" "${targetPath}"`);
            } else {
                // Copy file
                fs.copyFileSync(sourcePath, targetPath);
            }
        }
    });
}

// Create Chrome package
function createChromePackage() {
    console.log('Creating Chrome package...');
    
    const packageDir = 'packages/chrome';
    ensureDir(packageDir);
    
    // Copy extension files
    copyFiles('.', packageDir, extensionFiles);
    
    // Create zip file
    process.chdir('packages');
    execSync('zip -r ../chrome-package.zip chrome/');
    process.chdir('..');
    
    console.log('✅ Chrome package created: chrome-package.zip');
}

// Create Firefox package with manifest adjustments
function createFirefoxPackage() {
    console.log('Creating Firefox package...');
    
    const packageDir = 'packages/firefox';
    ensureDir(packageDir);
    
    // Copy extension files
    copyFiles('.', packageDir, extensionFiles);
    
    // Read and modify manifest for Firefox compatibility
    const manifestPath = path.join(packageDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Add Firefox-specific properties
    manifest.browser_specific_settings = {
        gecko: {
            id: 'tabby-grabby@example.com',
            strict_min_version: '57.0'
        }
    };
    
    // Write modified manifest
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    
    // Create zip file
    process.chdir('packages');
    execSync('zip -r ../firefox-package.zip firefox/');
    process.chdir('..');
    
    console.log('✅ Firefox package created: firefox-package.zip');
}

// Main packaging function
function main() {
    console.log('📦 Creating browser extension packages...\n');
    
    // Clean up previous packages
    if (fs.existsSync('packages')) {
        execSync('rm -rf packages');
    }
    if (fs.existsSync('chrome-package.zip')) {
        execSync('rm chrome-package.zip');
    }
    if (fs.existsSync('firefox-package.zip')) {
        execSync('rm firefox-package.zip');
    }
    
    try {
        createChromePackage();
        createFirefoxPackage();
        
        console.log('\n🎉 Packaging complete!');
        console.log('📋 Generated packages:');
        console.log('   - chrome-package.zip (Chrome/Chromium/Vivaldi)');
        console.log('   - firefox-package.zip (Firefox)');
        console.log('\n📝 Next steps:');
        console.log('   1. Test packages in respective browsers');
        console.log('   2. Upload to browser stores for publication');
        
    } catch (error) {
        console.error('❌ Packaging failed:', error.message);
        process.exit(1);
    }
}

// Run packaging
main();