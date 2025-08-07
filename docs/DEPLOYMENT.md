# Deployment Guide

This guide covers deploying Tabby Grabby to various browser stores and distribution channels.

## Prerequisites

Before deployment, ensure:

1. **Code is tested**: `npm test` passes
2. **Code is linted**: `npm run lint` passes  
3. **Extension works**: Manual testing in target browsers
4. **Documentation is complete**: README and docs are up to date
5. **Version is incremented**: Update version in `manifest.json` and `package.json`

## Build Process

### 1. Run Tests
```bash
npm test
npm run lint
```

### 2. Create Packages
```bash
npm run package
```

This creates:
- `chrome-package.zip` - For Chrome, Chromium, and Vivaldi
- `firefox-package.zip` - For Firefox

## Chrome Web Store

### Setup
1. Create a [Chrome Web Store Developer account](https://chrome.google.com/webstore/devconsole/)
2. Pay the one-time $5 developer fee

### Publishing Steps

1. **Upload Package**
   - Go to Chrome Web Store Developer Dashboard
   - Click "New Item"
   - Upload `chrome-package.zip`

2. **Store Listing**
   - **Name**: Tabby Grabby
   - **Summary**: Professional tab and bookmark manager with import/export
   - **Description**: Use the detailed description from README
   - **Category**: Productivity
   - **Language**: English

3. **Screenshots**
   - Extension popup showing Export/Import buttons
   - Export process demonstration
   - Import process demonstration
   - Sample JSON file structure

4. **Privacy**
   - Privacy policy (if collecting data)
   - Permissions justification
   - Data usage disclosure

5. **Submit for Review**
   - Complete all required fields
   - Submit for review (typically 1-3 days)

### Chrome Store Optimization

- **Keywords**: tab manager, bookmark manager, export import, productivity
- **Icon**: Professional, recognizable icon (128x128px minimum)
- **Screenshots**: High-quality, demonstrating key features
- **Description**: Clear, benefit-focused copy

## Firefox Add-ons (AMO)

### Setup
1. Create a [Firefox Add-ons Developer account](https://addons.mozilla.org/developers/)
2. Account is free

### Publishing Steps

1. **Upload Package**
   - Go to Add-ons Developer Hub
   - Click "Submit New Add-on"
   - Upload `firefox-package.zip`

2. **Add-on Details**
   - **Name**: Tabby Grabby
   - **Summary**: Professional tab and bookmark manager
   - **Description**: Detailed feature description
   - **Categories**: Productivity, Bookmarks
   - **Tags**: tabs, bookmarks, export, import

3. **Version Information**
   - **Release Notes**: Detail new features/fixes
   - **License**: MIT License
   - **Source Code**: Link to repository

4. **Media**
   - **Icon**: 128x128px PNG
   - **Screenshots**: Feature demonstrations
   - **Developer Comments**: Any additional context

5. **Submit for Review**
   - Firefox review process is more thorough
   - May take 1-2 weeks for initial review
   - Updates are typically faster

### Firefox Specific Considerations

- **Manifest V2/V3**: Firefox supports both
- **webextension-polyfill**: May be needed for compatibility
- **Permission Warnings**: Firefox shows detailed permission explanations
- **Code Review**: Mozilla reviews source code

## Vivaldi

Vivaldi uses Chrome's extension system, so:
- Use the same package as Chrome (`chrome-package.zip`)
- No separate store submission needed
- Users can install from Chrome Web Store
- Can also distribute directly as unpacked extension

## Manual Distribution

### Creating Distribution Packages

1. **GitHub Releases**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
   - Upload packages to GitHub releases
   - Include installation instructions
   - Provide checksums for security

2. **Direct Download**
   - Host packages on your website
   - Provide clear installation instructions
   - Include browser compatibility information

### Installation Instructions for Users

#### Chrome/Chromium/Vivaldi
1. Download `chrome-package.zip`
2. Extract the files
3. Open `chrome://extensions/`
4. Enable "Developer mode"
5. Click "Load unpacked"
6. Select the extracted folder

#### Firefox
1. Download `firefox-package.zip`
2. Open `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select the `.zip` file or `manifest.json`

## Version Management

### Semantic Versioning
- **Major (X.0.0)**: Breaking changes
- **Minor (1.X.0)**: New features, backward compatible  
- **Patch (1.0.X)**: Bug fixes

### Update Process
1. Update version in `manifest.json`
2. Update version in `package.json`
3. Update changelog/release notes
4. Run tests and create packages
5. Upload to stores

### Auto-updates
- **Chrome**: Automatic through Web Store
- **Firefox**: Automatic through AMO
- **Manual**: Users must download new versions

## Store Optimization

### SEO and Discovery
- **Keywords**: Research popular extension keywords
- **Ratings**: Encourage user reviews
- **Updates**: Regular updates improve store ranking
- **Support**: Responsive user support

### Analytics
- **Chrome**: Built-in analytics in developer dashboard
- **Firefox**: Basic statistics available
- **Custom**: Implement privacy-friendly analytics if needed

### User Feedback
- **Reviews**: Monitor and respond to reviews
- **Issues**: GitHub issues for bug reports
- **Feature Requests**: Track and prioritize user requests

## Maintenance

### Regular Tasks
- **Monitor reviews**: Respond to user feedback
- **Update dependencies**: Keep packages current
- **Security updates**: Address any vulnerabilities
- **Browser compatibility**: Test with new browser versions
- **Performance monitoring**: Ensure extension performance

### Support Channels
- **GitHub Issues**: Technical problems and feature requests
- **Store Reviews**: User feedback and ratings
- **Email Support**: Direct user communication
- **Documentation**: Keep README and docs updated

## Legal Considerations

### Licenses
- **MIT License**: Open source, permissive
- **Third-party**: Ensure compatibility with dependencies
- **Store Terms**: Comply with store policies

### Privacy
- **Data Collection**: Document any data usage
- **Privacy Policy**: Required if collecting user data
- **GDPR Compliance**: For European users
- **Transparency**: Clear about extension behavior

### Intellectual Property
- **Trademarks**: Ensure name doesn't infringe
- **Copyright**: Respect third-party content
- **Patents**: Be aware of potential patent issues

---

This deployment guide should be updated as stores change their policies and procedures.