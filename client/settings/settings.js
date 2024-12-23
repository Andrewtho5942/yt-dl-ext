
//const ISLOCAL = true;
//const SERVER_PORT = 5001;
// const serverURL = ISLOCAL ? `http://localhost:${SERVER_PORT}` : "https://3a51-156-146-107-197.ngrok-free.app";

let settings = [
  { key: "AHKPath", value: 'C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey.exe' },
  { key: "focusExplorerPath", value: 'C:\\Users\\andre\\focusExplorer.ahk' },
  { key: "darkMode", value: true },
  { key: "cloudMode", value: false },

  { key: "m3u8Notifs", value: true },
  { key: "mp4Notifs", value: false },
  { key: "m4aNotifs", value: false },
  { key: "failureNotifs", value: false },
  { key: "playlistNotifs", value: true },

  { key: "outputPath", value: 'C:\\Users\\andre\\Downloads\\Descargo' },
  { key: "removeSubtext", value: true },
  { key: "normalizeAudio", value: false },
  { key: "useShazam", value: false },
  { key: "generateSubs", value: false },
  { key: "useAria2c", value: false },
  { key: "maxDownloads", value: '10' },

  { key: "gdriveJSONKey", value: 'C:\\Users\\andre\\OneDrive\\Documents\\Webdev\\descargo\\server\\keys\\yt-dl-443015-d39da117fe4a.json' },
  { key: "gdriveFolderID", value: '17pMCBUQxJfEYgVvNwKQUcS8n4oRGIE9q' },
  { key: "cookiePath", value: "C:\\Users\\andre\\OneDrive\\Documents\\cookies.firefox-private.txt" },

  { key: "submitHotkey", value: 'Enter' },
  { key: "formatHotkey", value: 'p' },
  { key: "gdriveHotkey", value: 'g' },
  { key: "getMenuHotkey", value: 'n' },
  { key: "historyMenuHotkey", value: 'm' },
  { key: "openClearHotkey", value: 'o' },
  { key: "backHotkey", value: 'Backspace' },
  { key: "autofillHotkey", value: 'f' },
  { key: "settingsHotkey", value: 's' },
]

let storage = browser.storage.local;
let inputElements = [];



function setInputValues() {
  for (let i = 0; i < inputElements.length; i++) {
    let input = inputElements[i];
    if (input.classList.contains('switch-checkbox')) {
      input.checked = settings[i].value;

      if (settings[i].key === 'darkMode') {
        document.documentElement.setAttribute('data-theme', settings[i].value ? 'dark' : 'light')
      }
    } else if (input.classList.contains('text-input')) {
      //console.log('loading from storage:')
      //console.log(settings[i].value)
      input.value = settings[i].value;
    }
  }

  console.log('updated input value displays');
}

function setHotkeyLabels() {
  const hotkeyLabels = document.getElementsByClassName('hotkey-text');
  const firstHotkeySetting = settings.length - hotkeyLabels.length;

  //iterate over the hotkey settings
  for (let i = firstHotkeySetting; i < settings.length; i++) {
    //set the current hotkey setting to the label value
    hotkeyLabels[i - firstHotkeySetting].textContent = settings[i].value;
    //console.log('labeled hotkey ' + settings[i].key + ' as ' + settings[i].value);
  }
}

function updateFromStorage() {
  storage.get("settings", function (result) {
    if (result.settings && result.settings.length === settings.length) {
      settings = result.settings;
      console.log('Pulled settings from storage: ', settings);
    } else {
      console.log('settings has incorrect length! storing the default values...');
      storage.set({ ['settings']: settings });
    }

    setInputValues();
    setHotkeyLabels();
  });
}



document.addEventListener('DOMContentLoaded', () => {
  inputElements = document.getElementsByTagName('input')
  console.log('input elements: ')
  console.log(inputElements)

  updateFromStorage();


  const hotkeyListeners = new Map();

  // add the listeners for each input 
  for (let i = 0; i < inputElements.length; i++) {

    let input = inputElements[i];
    let classes = input.classList;

    if (classes.contains('switch-checkbox')) {
      input.addEventListener('click', () => {
        //store the new setting change
        console.log('new value for settings field ' + settings[i].key + ': ' + input.checked);
        settings[i].value = input.checked;
        storage.set({ ['settings']: settings });

        if (settings[i].key === 'darkMode') {
          document.documentElement.setAttribute('data-theme', settings[i].value ? 'dark' : 'light')
        }
      });

    } else if (classes.contains('hotkey')) {


      const handleKeyDown = (e) => handleKeyPress(e, i);


      function handleKeyPress(event, i) {
        event.preventDefault();
        const key = event.key;
        console.log('remapping hotkey ' + settings[i].key + ' from ' + settings[i].value + ' to: ' + key);

        if (!settings.find(s => (s.value === key) && (s.key !== settings[i].key))) {
          //set the setting value and store it
          settings[i].value = key;
          storage.set({ ['settings']: settings });
          // show the change on screen
          setHotkeyLabels();
        } else {
          console.log('detected duplicate key bindings! Hotkey not changed.');



          //set the hotkey-text background to red for 0.5 secs...

          const hotkeyLabels = document.getElementsByClassName('hotkey-text');
          const firstHotkeySetting = settings.length - hotkeyLabels.length;
          const hotKeyLabel = hotkeyLabels[i - firstHotkeySetting];
          hotKeyLabel.style.backgroundColor = 'red';
          setTimeout(() => {
            hotKeyLabel.style.backgroundColor = '';
          }, 500);
        }

        console.log('removing the keydown listener...')
        inputElements[i].checked = false;

        const listener = hotkeyListeners.get(i);
        if (listener) {
          window.removeEventListener('keydown', listener);
          hotkeyListeners.delete(i);
        }
      };


      function resetHotkeys(i) {
        console.log('resetting hotkeys')

        Array.from(inputElements).forEach((input, index) => {
          if ((input.classList.contains('hotkey')) && (index !== i)) {
            input.checked = false;
            const listener = hotkeyListeners.get(index);
            if (listener) {
              console.log('removing keydown listener for hotkey ' + index + '...');
              window.removeEventListener('keydown', listener);
              hotkeyListeners.delete(index);
            }
          }
        })
      }

      //console.log('listening for key press to reassign ' + settings[i].key + '...')

      input.addEventListener('click', () => {
        if (input.checked) {
          //reset all other hotkeys 
          resetHotkeys(i);
          hotkeyListeners.set(i, handleKeyDown);
          window.addEventListener('keydown', handleKeyDown);
        } else {
          const listener = hotkeyListeners.get(i);
          if (listener) {
            window.removeEventListener('keydown', listener);
            hotkeyListeners.delete(i);
          }
        }
      });
    } else if (classes.contains('text-input')) {
      console.log('adding onchange listener...')
      input.addEventListener('input', (event) => {
        let newValue = event.target.value;

        if (settings[i].key === 'maxDownloads') {
          try {
            newValue = parseInt(newValue);

            if (!newValue) {
              console.log('no new value: ' + newValue)
              newValue = 1;
              input.value = '';
            } else {
              console.log('newvalue: ' + newValue)
              newValue = Math.min(Math.max(newValue, 1), 25); // range must be between 1 - 25
              settings[i].value = newValue;

              input.value = settings[i].value;
            }
          } catch (e) {
            console.log('new maxDownloads value (' + newValue + ') is not a number! Error: ' + e.message) //dont update if it cannot be parsed into a number           
          }
        } else {
          settings[i].value = newValue;
        }

        storage.set({ ['settings']: settings });
        console.log(`Saved new value for ` + settings[i].key + `: ${newValue}`);
      });
    }
  }

  // add submit listeners for playlist-input
  // const playlistForm = document.getElementById('playlist-form');
  // const playlistInput = document.getElementById('playlist-input');
  // const playlistBtn = document.getElementById('playlist-btn');

  // function handleStartPlaylist(event) {
  //   event.preventDefault();

  //   console.log('starting playlist download: ' + playlistInput.value);


  //   //get the current popupSettings from local storage
  //   storage.get("popupSettings", (result) => {
  //     let popupSettings = result.popupSettings;
  //     if (!popupSettings) {
  //       popupSettings = [false, true]
  //     }
  //     // playlist request to the server
  //     axios.post(`${serverURL}/playlist`, {
  //       playlistURL: playlistInput.value,
  //       format: result.popupSettings[0] ? 'mp4' : 'm4a',
  //       gdrive: result.popupSettings[1],
  //       outputPath: settings.find(s => s.key === 'outputPath').value,
  //       gdriveKeyPath: settings.find(s => s.key === 'gdriveJSONKey').value,
  //       gdriveFolderID: settings.find(s => s.key === 'gdriveFolderID').value,
  //       removeSubtext: settings.find(s => s.key === 'removeSubtext').value,
  //       normalizeAudio: settings.find(s => s.key === 'normalizeAudio').value,
  //       useShazam: settings.find(s => s.key === 'useShazam').value,
  //       cookiePath: settings.find(s => s.key === 'cookiePath').value,
  //     }).then((result) => {
  //       console.log('playlist download ended: ' + result.message);
  //     });

  //     // update the storage with the empty playlist value
  //     playlistInput.value = '';
  //     settings.find(s => s.key === 'playlistLink').value = '';
  //     storage.set({ ['settings']: settings });
  //   })
  // }

  // if (playlistForm) {
  //   playlistForm.addEventListener('submit', handleStartPlaylist)
  // }
  // if (playlistBtn) {
  //   playlistBtn.addEventListener('click', handleStartPlaylist)
  // }
});



