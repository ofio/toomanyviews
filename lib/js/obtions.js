var verbose = false;

function log () {
  if (!verbose) { return; }

  var args = Array.from(arguments);
  args.unshift('background: #111; color: cyan; text-shadow: 0 -1px #000; padding: 4px 0; line-height: 0');
  args.unshift(`%c Extension`);

  console.log.apply(console, args);
}

function fixSettings (settings) {
  if (settings === undefined) { return defaultSettings; }

  var res = {};

  Object.keys(defaultSettings).forEach(f => {
    res[f] = settings[f] !== undefined ? settings[f] : defaultSettings[f];
  });

  return res;
}

// `chrome.storage` can store objects directly.

function loadSettings () {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get('settings', obj => {
      resolve(fixSettings(obj.settings ));
    });
  });
}

function saveSettings (settings) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set({settings: settings}, obj => {
      resolve(obj);
    });
  });
}