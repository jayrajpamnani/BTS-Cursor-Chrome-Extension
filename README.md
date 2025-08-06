# BTS Cursor - Chrome Extension

A beautiful Chrome extension that customizes your browser cursor with official BTS logos. Features smart background detection that automatically switches between black and white BTS logos based on the website's background color.

## ✨ Features

- **Smart Auto Mode**: Automatically switches between black and white BTS logos based on background color
- **Manual Selection**: Choose between white or black BTS logos manually
- **Universal Compatibility**: Works on all websites
- **Persistent Cursor**: Maintains custom cursor across all pages and interactions
- **Official BTS Branding**: Uses authentic BTS logos and design

## 🎯 How It Works

The extension injects custom CSS to replace the default browser cursor with BTS logo cursors. The smart auto mode detects the background color at your cursor position and automatically chooses the most visible logo:

- **Light backgrounds** → Black BTS logo
- **Dark backgrounds** → White BTS logo

## 🛠️ Installation

### From Chrome Web Store (Recommended)
1. Visit the Chrome Web Store
2. Search for "BTS Cursor"
3. Click "Add to Chrome"
4. Confirm the installation

### Manual Installation (Developer Mode)
1. Download the extension files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (top right)
4. Click "Load unpacked" and select the extension folder
5. The extension is now installed!

## 🎮 Usage

1. **Click the BTS icon** in your Chrome toolbar
2. **Toggle the switch** to enable/disable the custom cursor
3. **Choose your cursor style**:
   - **Auto (Smart Switch)**: Automatically adapts to background colors
   - **BTS Logo (White)**: Always uses white logo
   - **BTS Logo (Black)**: Always uses black logo
4. **Click "Apply Cursor"** to activate your choice
5. **Enjoy your BTS cursor** across all websites!

## 🔧 Technical Details

- **Manifest Version**: 3
- **Permissions**: 
  - `storage`: Saves your cursor preferences
  - `activeTab`: Applies cursor to current tab
  - `tabs`: Updates cursor across all tabs
- **Content Scripts**: Injects custom CSS for cursor replacement
- **Background Script**: Manages cursor updates across tabs

## 🎨 Cursor Options

### Auto Mode (Default)
- **Smart Detection**: Analyzes background color at cursor position
- **Automatic Switching**: Seamlessly switches between black and white logos
- **Optimal Visibility**: Always ensures the best contrast

### Manual Modes
- **White Logo**: Perfect for dark websites and themes
- **Black Logo**: Ideal for light websites and themes

## 🌟 Features in Detail

### Persistent Cursor
- Works on all websites including social media, news sites, and web apps
- Maintains custom cursor during scrolling, clicking, and hovering
- Overrides website-specific cursor styles

### Smart Background Detection
- Real-time color analysis at cursor position
- Handles transparent backgrounds by checking parent elements
- Uses luminance calculation for accurate light/dark detection

### Cross-Tab Synchronization
- Settings apply to all open tabs automatically
- New tabs inherit your cursor preferences
- Consistent experience across your browsing session

## 🐛 Troubleshooting

### Cursor Not Appearing
1. Make sure the extension is enabled
2. Check that "Enable Custom Cursor" is toggled on
3. Try refreshing the webpage
4. Check browser console for any error messages

### Cursor Reverts to Default
1. The extension automatically re-applies the cursor every 2 seconds
2. If issues persist, try disabling and re-enabling the extension
3. Check if the website has aggressive CSS that might be interfering

### Auto Mode Not Working
1. Ensure you've selected "Auto (Smart Switch)" from the dropdown
2. Move your cursor over different colored areas to see the switching
3. Check the browser console for background detection logs

## 📱 Compatibility

- **Chrome**: Full support (recommended)
- **Edge**: Full support (Chromium-based)
- **Opera**: Full support (Chromium-based)
- **Other Chromium browsers**: Should work with minor variations

## 🔒 Privacy & Security

- **No Data Collection**: The extension doesn't collect or transmit any personal data
- **Local Storage Only**: All settings are stored locally in your browser
- **No Tracking**: No analytics or tracking scripts
- **Open Source**: Transparent code that you can review

## 🎵 About BTS

BTS (방탄소년단) is a South Korean boy band that has become a global phenomenon. This extension celebrates their music and artistry by bringing their iconic branding to your browsing experience.

## 📄 License

This extension is created for educational and personal use. BTS logos and branding are property of their respective owners.

## 🤝 Support

If you encounter any issues or have suggestions:
1. Check the troubleshooting section above
2. Review the browser console for error messages
3. Ensure you're using a supported browser version

## 🚀 Future Updates

Planned features:
- Additional BTS-themed cursor designs
- Custom cursor size options
- Keyboard shortcuts for quick switching
- More granular background detection

---

**Made with 💜 for ARMY worldwide**
