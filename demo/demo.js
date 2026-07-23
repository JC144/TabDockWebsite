// Demo entry point: replaces the extension's main.js. Feeds the verbatim Dock
// code static tab data and reacts to its messages (via the browser-api.js stub)
// instead of a background service worker.
import Dock from './Dock/Dock.js';
import { onDemoMessage } from './browser-api.js';

const DEMO_TAB_DATA = [
    {
        domain: 'github.com',
        favicon: 'images/favicons/github.svg',
        tabs: [
            { id: 1, url: 'https://github.com/JC144/TabDockExtension', title: 'JC144/TabDockExtension: A dock for your browser tabs', windowId: 1 },
            { id: 2, url: 'https://github.com/JC144/TabDockExtension/pulls', title: 'Pull requests · JC144/TabDockExtension', windowId: 1 },
            { id: 3, url: 'https://github.com/JC144/TabDockExtension/issues', title: 'Issues · JC144/TabDockExtension', windowId: 1 },
        ],
    },
    {
        domain: 'youtube.com',
        favicon: 'images/favicons/youtube.svg',
        tabs: [
            { id: 4, url: 'https://youtube.com/watch?v=dock-history', title: 'The history of the macOS Dock - YouTube', windowId: 1 },
            { id: 5, url: 'https://youtube.com/watch?v=lofi-beats', title: 'lofi beats to organize tabs to - YouTube', windowId: 1 },
        ],
    },
    {
        domain: 'mail.google.com',
        favicon: 'images/favicons/mail.svg',
        tabs: [
            { id: 6, url: 'https://mail.google.com/mail/u/0/#inbox', title: 'Inbox (3) - Gmail', windowId: 1 },
            { id: 7, url: 'https://mail.google.com/mail/u/0/#drafts', title: 'Drafts - Gmail', windowId: 1 },
        ],
    },
    {
        domain: 'stackoverflow.com',
        favicon: 'images/favicons/stackoverflow.svg',
        tabs: [
            { id: 8, url: 'https://stackoverflow.com/questions/magnify', title: 'css - How to recreate the macOS Dock magnification effect?', windowId: 1 },
            { id: 9, url: 'https://stackoverflow.com/questions/shadow-dom', title: 'javascript - backdrop-filter inside a Shadow DOM', windowId: 1 },
        ],
    },
    {
        domain: 'en.wikipedia.org',
        favicon: 'images/favicons/wikipedia.svg',
        tabs: [
            { id: 10, url: 'https://en.wikipedia.org/wiki/Dock_(macOS)', title: 'Dock (macOS) - Wikipedia', windowId: 1 },
        ],
    },
    {
        domain: 'figma.com',
        favicon: 'images/favicons/figma.svg',
        tabs: [
            { id: 11, url: 'https://figma.com/file/tabdock-landing', title: 'Tab Dock - landing page - Figma', windowId: 1 },
        ],
    },
];

let dock = null;
let tabData = null;

function initDock() {
    // A trashed dock already removed its own DOM; a replaced one hasn't.
    if (dock) {
        dock.dom.trash?.remove();
        dock.dom.dock?.remove();
    }
    // Dock/DockItem mutate the arrays they're given (reorders, row diffs):
    // clone so resets always start from pristine data.
    tabData = structuredClone(DEMO_TAB_DATA);
    dock = new Dock('bottom');
    dock.update(tabData);
}

function jumpFavicon(domainData) {
    if (domainData) {
        dock.dockItems.get(domainData.domain)?.startFaviconAnimation();
    }
}

// In the extension these messages go to the background service worker, which
// acts on real tabs and echoes new tabData through storage. Here we apply the
// same effect to the static data — or just give visual feedback where opening
// a real tab makes no sense.
onDemoMessage((message) => {
    switch (message.action) {
        case 'closeTab':
            for (const domainData of tabData) {
                domainData.tabs = domainData.tabs.filter(t => t.id !== message.tabId);
            }
            tabData = tabData.filter(d => d.tabs.length > 0);
            dock.update(tabData);
            break;

        case 'focusTab':
            jumpFavicon(tabData.find(d => d.tabs.some(t => t.id === message.tabId)));
            break;

        case 'openTab':
        case 'openAndNavigateToTab':
            jumpFavicon(tabData.find(d => d.tabs[0]?.url === message.tabUri));
            break;

        case 'updateTabOrder': {
            // Mirror the background's reorder so later update() calls don't
            // snap the DOM back to the old order.
            const byDomain = new Map(tabData.map(d => [d.domain, d]));
            tabData = message.newOrder
                .map(({ domain, tabIds }) => {
                    const domainData = byDomain.get(domain);
                    if (!domainData) return null;
                    const byId = new Map(domainData.tabs.map(t => [t.id, t]));
                    domainData.tabs = tabIds.map(id => byId.get(id)).filter(Boolean);
                    return domainData;
                })
                .filter(Boolean);
            break;
        }
    }
});

document.getElementById('demo-reset').addEventListener('click', initDock);

initDock();
