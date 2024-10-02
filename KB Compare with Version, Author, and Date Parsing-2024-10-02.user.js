// ==UserScript==
// @name         KB Compare with Version, Author, and Date Parsing
// @namespace    http://tampermonkey.net/
// @version      2024-10-02
// @description  Compare different versions of KB articles, now with correct version, author, and date parsing
// @author
// @include      https://servicenow.ent.southcom.mil/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // Load jsdiff from jsDelivr CDN
    const jsdiffScript = document.createElement('script');
    jsdiffScript.src = 'https://cdn.jsdelivr.net/npm/diff@5.1.0/dist/diff.min.js';
    document.head.appendChild(jsdiffScript);

    jsdiffScript.onload = () => {
        console.log('jsdiff library loaded.');

        // Cache DOM elements to avoid multiple lookups
        const currentContentElement = document.querySelector('#article');
        const versionLinks = document.querySelectorAll('#versions-list a[href*="sys_kb_id"]');
        const navbarRight = document.querySelector('.snc-kb-navbar-right .header-bar-btn-group');

        if (!currentContentElement || !versionLinks.length || !navbarRight) {
            console.error("Required elements not found. Exiting script.");
            return;
        }

        // Function to normalize whitespace but preserve line breaks
        const normalizeWhitespace = (text) => text.replace(/[ ]+/g, ' ').replace(/\s+\n/g, '\n').trim();

        // Function to toggle visibility of unchanged lines
        const toggleSectionVisibility = (button, section) => {
            const isHidden = section.style.display === 'none';
            section.style.display = isHidden ? 'block' : 'none';
            button.textContent = isHidden ? 'Collapse Unchanged' : 'Expand Unchanged';
        };

        // Function to parse version details (version number, author, and date)
        const formatVersionDetails = (link) => {
            const versionContainer = link.closest('p');
            if (!versionContainer) return "Unknown Version - Unknown Author on Unknown Date";

            const versionNumber = (versionContainer.querySelector('a')?.innerText.match(/\d+\.\d+/) || ["Unknown Version"])[0];
            const versionInfo = versionContainer.innerText;
            const author = (versionInfo.match(/by (.*)$/)?.[1]?.trim()) || "Unknown Author";
            const date = (versionInfo.match(/(Updated on|Authored on) (\d{4}-\d{2}-\d{2})/)?.[2]) || "Unknown Date";

            return `${versionNumber} - ${author} on ${date}`;
        };

        // Function to create the version dropdown
        const createVersionDropdown = (versionLinks) => {
            const dropdown = document.createElement('select');
            dropdown.className = "form-control";
            dropdown.style.marginLeft = '10px';
            dropdown.style.width = "auto";

            versionLinks.forEach((link) => {
                const option = document.createElement('option');
                option.value = link.href;
                option.text = formatVersionDetails(link);
                dropdown.appendChild(option);
            });

            return dropdown;
        };

        // Function to create the load diff button
        const createLoadDiffButton = (loadDiffFn) => {
            const button = document.createElement('button');
            button.textContent = "Compare Versions";
            button.className = "btn navbar-btn btn-primary";
            button.style.marginLeft = '10px';
            button.addEventListener('click', loadDiffFn);
            return button;
        };

        // Function to load and display the diff
        const loadDiff = (oldVersionUrl) => {
            if (typeof Diff === 'undefined') {
                console.error("Diff library not loaded. Unable to compare versions.");
                return;
            }

            // Remove any existing comparison blocks before creating a new one
            const existingDiffContainer = document.querySelector('.diff-container');
            if (existingDiffContainer) existingDiffContainer.remove();

            fetch(oldVersionUrl)
                .then(response => response.text())
                .then(pageContent => {
                    const doc = new DOMParser().parseFromString(pageContent, 'text/html');
                    const oldContentElement = doc.querySelector('#article');
                    if (!oldContentElement) {
                        console.error("Old content not found.");
                        return;
                    }

                    let currentHTML = normalizeWhitespace(currentContentElement.innerText || "");
                    let oldHTML = normalizeWhitespace(oldContentElement.innerText || "");

                    const diff = Diff.diffLines(oldHTML, currentHTML, { ignoreWhitespace: true });
                    let unchangedBlock = '';
                    let hasUnchangedSection = false;
                    const diffHtml = diff.map((part, index) => {
                        const lineNum = index + 1;
                        const prefix = part.added ? '+' : part.removed ? '-' : ' ';
                        const color = part.added ? '#d4f4be' : part.removed ? '#f9c0c0' : '#fff';
                        const borderColor = part.added ? '#a4e3a5' : part.removed ? '#e3a4a4' : '#ddd';
                        const textDecoration = part.removed ? 'line-through' : 'none';

                        if (!part.added && !part.removed) {
                            unchangedBlock += `
                                <div style="background-color: ${color}; border-left: 4px solid ${borderColor}; padding: 8px; font-family: Arial, sans-serif;">
                                    <span style="width: 40px; text-align: right; padding-right: 10px; color: #888;">${lineNum}</span>
                                    <span style="white-space: pre-wrap; word-wrap: break-word;">${prefix} ${part.value}</span>
                                </div>`;
                            hasUnchangedSection = true;
                            return '';
                        } else {
                            const result = hasUnchangedSection ? `
                                <button class="collapse-btn" style="margin-bottom: 10px; padding: 5px 10px; background-color: #eee; border: 1px solid #ccc; cursor: pointer;">Expand Unchanged</button>
                                <div class="unchanged-section" style="display: none;">${unchangedBlock}</div>` : '';
                            unchangedBlock = ''; hasUnchangedSection = false;

                            return result + `
                                <div style="background-color: ${color}; border-left: 4px solid ${borderColor}; padding: 8px; font-family: Arial, sans-serif;">
                                    <span style="width: 40px; text-align: right; padding-right: 10px; color: #888;">${lineNum}</span>
                                    <span style="text-decoration: ${textDecoration}; white-space: pre-wrap; word-wrap: break-word;">${prefix} ${part.value}</span>
                                </div>`;
                        }
                    }).join('');

                    const diffContainer = document.createElement('div');
                    diffContainer.className = 'diff-container';
                    diffContainer.style.border = '1px solid #ccc';
                    diffContainer.style.borderRadius = '4px';
                    diffContainer.style.padding = '10px';
                    diffContainer.style.backgroundColor = '#f5f5f5';
                    diffContainer.innerHTML = `<h3 style="font-family: Arial, sans-serif; color: #333;">Version Comparison:</h3> <div>${diffHtml}</div>`;

                    currentContentElement.parentNode.insertBefore(diffContainer, currentContentElement);

                    diffContainer.querySelectorAll('.collapse-btn').forEach(button => {
                        const unchangedSection = button.nextElementSibling;
                        button.addEventListener('click', () => toggleSectionVisibility(button, unchangedSection));
                    });
                })
                .catch(error => console.error("Error fetching old version content:", error));
        };

        // Create the dropdown and button, then add them to the navbar
        const comparisonContainer = document.createElement('div');
        comparisonContainer.style.display = "inline-flex";
        comparisonContainer.style.alignItems = "center";

        const versionDropdown = createVersionDropdown(versionLinks);
        const loadDiffButton = createLoadDiffButton(() => loadDiff(versionDropdown.value));

        comparisonContainer.appendChild(versionDropdown);
        comparisonContainer.appendChild(loadDiffButton);
        navbarRight.appendChild(comparisonContainer);
    };

})();
