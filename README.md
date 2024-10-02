# KB Compare - ServiceNow Version Comparison Script

A Tampermonkey script for ServiceNow that allows you to compare different versions of Knowledge Base (KB) articles in a GitHub-style unified diff format. This script helps knowledge analysts easily visualize the differences between article versions, with collapsible sections for unchanged content and proper version, author, and date extraction.

## Features
- **Version Comparison**: Compare any two versions of a KB article, showing differences using a line-by-line unified diff.
- **Author and Date Information**: Each version in the dropdown is displayed with the correct version number, author, and date.
- **Collapsible Unchanged Lines**: Unchanged sections of the article can be collapsed and expanded for a cleaner comparison view.
- **GitHub-Style Diff**: Changes are shown in a unified format with green for additions and red for removals, similar to GitHub's diff display.

## Screenshot

TODO

## Installation

1. **Install Tampermonkey**:
   - [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
   - [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)

2. **Add the Script**:
   - Click the Tampermonkey icon in your browser.
   - Choose `Create a new script...`.
   - Copy and paste the contents of the `kb_compare.js` file (from this repository) into the editor.
   - Click `File -> Save`.

3. **Use the Script**:
   - Navigate to a KB article page on your ServiceNow instance.
   - Select versions from the dropdown and click `Compare Versions` to see the differences.

## Usage

- When viewing a Knowledge Base article in ServiceNow, the script will add a dropdown and "Compare Versions" button to the UI (next to the "Subscribed" button).
- **Step 1**: Select the version you'd like to compare from the dropdown.
- **Step 2**: Click the "Compare Versions" button.
- **Step 3**: The version comparison will be displayed above the article in a unified diff format, showing lines added (green) and removed (red). Unchanged sections can be expanded or collapsed.

## Configuration

This script is designed to work on ServiceNow instances. You can customize the script for other URLs by modifying the `@include` parameter in the script header:

```javascript
// @include      https://your-servicenow-instance/*
// Modify the URL to match your ServiceNow instance.
