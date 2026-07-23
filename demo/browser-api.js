// Demo-only stub of the extension's browser-api.js. The verbatim Dock/* copies
// import `api`/`isMV3` from here and never notice they aren't running inside an
// extension. sync-demo.ps1 must never overwrite this file.
let messageHandler = null;

// demo.js registers a handler here to react to the dock's sendMessage calls
// (focusTab, closeTab, openTab, openAndNavigateToTab, updateTabOrder).
export function onDemoMessage(handler) {
    messageHandler = handler;
}

export const api = {
    runtime: {
        // Relative paths resolve against demo/index.html, so 'dock-styles.css'
        // and 'images/...' load from the demo folder — including when the site
        // is served under a sub-path (GitHub Pages).
        getURL: (path) => path,
        sendMessage: (message) => {
            messageHandler?.(message);
            return Promise.resolve();
        },
        getManifest: () => ({ manifest_version: 3 }),
    },
    storage: {
        local: {
            get: async () => ({}),
            set: async () => { },
        },
        onChanged: { addListener: () => { } },
    },
};

// <img> favicon path in DockItem (the canvas path only exists to dodge
// content-script CSP, which doesn't apply here).
export const isMV3 = true;
