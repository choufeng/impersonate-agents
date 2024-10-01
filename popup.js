const state = {
  domain: '',
  port: '',
  agents: [],
  flags: [],
  autoPortConversion: false,
  currentAgent: '',
  setState: function (key, value) {
    this[key] = value;
  },
}

const domNode = {
  agentList: null,
  autoPortCheckbox: null,
  portLabel: null,
  flagList: null,
  setNode: function (key, value) {
    this[key] = value;
  },
  clearNode: function (key, value = '') {
    this[key].innerHTML = value;
  },
  clearNodesInnerHTML: function () {
    this.clearNode('agentList');
    this.clearNode('autoPortCheckbox', false);
    this.clearNode('portLabel');
    this.clearNode('flagList');
  },
}

const StorageKey = {
  domain: 'domain',
  port: 'port',
  agents: 'agents',
  autoPortConversion: 'autoPortConversion',
  flags: 'flags',
}

function setNodes() {
  domNode.setNode('agentList', document.getElementById('agentList'));
  domNode.setNode('autoPortCheckbox', document.getElementById('autoPortConversion'));
  domNode.setNode('portLabel', document.getElementById('portLabel'));
  domNode.setNode('flagList', document.getElementById('flagList'));
}

function setDomainState(value) {
  state.setState('domain', value || '');
}
function setPortState(value) {
  state.setState('port', value || '');
}
function setAgentsState(value) {
  state.setState('agents', value ? value.split('|') : []);
}
function setFlagsState(value) {
  state.setState('flags', value ? value.split('|') : []);
}
function setAutoPortConversionState(value) {
  state.setState('autoPortConversion', value || false);
}

async function getSettingsAndSetState() {
  const storageData = await chrome.storage.sync.get(Object.values(StorageKey));
  setDomainState(storageData[StorageKey.domain]);
  setPortState(storageData[StorageKey.port]);
  setAgentsState(storageData[StorageKey.agents]);
  setFlagsState(storageData[StorageKey.flags]);
  setAutoPortConversionState(storageData[StorageKey.autoPortConversion]);
}

function setAutoPortCheckbox() {
  domNode.autoPortCheckbox.checked = state.autoPortConversion;
  domNode.autoPortCheckbox.removeEventListener('change', handleAutoPortConversion);
  domNode.autoPortCheckbox.addEventListener('change', handleAutoPortConversion);
}


function handleAutoPortConversion() {
  chrome.storage.sync.set({ autoPortConversion: this.checked });
  state.setState('autoPortConversion', this.checked);
}

function setPortLabel() {
  domNode.portLabel.innerHTML = state.port;
}

async function handlerClickAgent(event) {
  state.setState('currentAgent', event.target.getAttribute('data-value'));
  domNode.clearNode('agentList');
  setAgentList();

  // redirect
  await redirect();
}

function setAgentList() {
  state.agents.forEach(agent => {
    const [name, value] = agent.split(':');
    const li = document.createElement('li');
    li.textContent = name;
    li.setAttribute('data-value', value);
    if (state.currentAgent === value) {
      li.classList.add('selected');
    }
    domNode.agentList.appendChild(li);
  });

  domNode.agentList.removeEventListener('click', handlerClickAgent);
  domNode.agentList.addEventListener('click', handlerClickAgent);
}

async function handleSwitchFlag(event) {
  const flagName = event.target.getAttribute('data-name');

  const flags = state.flags.map(flag => {
    const [name, value] = flag.split(':');
    if (name === flagName) {
      return `${name}:${value === 'true' ? 'false' : 'true'}`;
    }
    return flag;
  });
  const flagsJoined = flags.join('|');

  await chrome.storage.sync.set({ flags: flagsJoined });

  domNode.clearNode('flagList');
  setFlagList();
}

function setFlagList() {
  state.flags.forEach(flag => {
    const [name, value] = flag.split(':');
    const li = document.createElement('li');
    li.setAttribute('data-name', name);
    li.setAttribute('data-value', value);

    const flagContent = document.createElement('div');
    flagContent.classList.add('flag-content');
    flagContent.textContent = name;
    flagContent.setAttribute('data-name', name);
    flagContent.setAttribute('data-value', value);

    const flagValue = document.createElement('div');
    flagValue.classList.add('flag-value');
    if (value === 'true') {
      flagValue.classList.add('flag-true');
    }
    flagValue.textContent = value;
    flagValue.setAttribute('data-name', name);
    flagValue.setAttribute('data-value', value);

    li.appendChild(flagContent);
    li.appendChild(flagValue);

    domNode.flagList.appendChild(li);

    li.removeEventListener('click', handleSwitchFlag);
    li.addEventListener('click', handleSwitchFlag);
  });
}

async function startEngine(currentAgent, newURL) {
  function setRedirectMessage() {
    // create a element to body, and set width = 400px, height=300px, background-color=black, with words "Loading..." in the center of the screen
    const coverNode = document.createElement('div');
    coverNode.style.width = '100vw';
    coverNode.style.height = '80px';
    coverNode.style.backgroundColor = 'black';
    coverNode.style.color = 'white';
    coverNode.style.position = 'absolute';
    coverNode.style.display = 'flex';
    coverNode.style.justifyContent = 'center';
    coverNode.style.alignItems = 'center';
    coverNode.style.bottom = '0';
    coverNode.style.left = '0';
    coverNode.style.zIndex = '9999';
    coverNode.innerHTML = 'Redirecting, please with a seconds.';
    document.body.appendChild(coverNode);
  }

  function postRequest(url, data) {
    return fetch(url, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
      method: "POST",
      credentials: "same-origin"
    });
  }

  function impersonateUser(userId) {
    postRequest("/impersonate/", { impersonation_tool: "a3g", targetUserId: userId })
      .then(() => {
        window.location.href = newURL;
      });
  }

  setRedirectMessage();
  let impersonationBanner = document.querySelector("header.uc-impersonationBanner");

  if (impersonationBanner) {
    postRequest("/unimpersonate/", { impersonation_tool: "impersonation_banner" })
      .then(() => impersonateUser(currentAgent));
  } else {
    impersonateUser(currentAgent);
  }
}

async function redirect() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentURL = new URL(tabs[0].url);
  let newURL = `${currentURL.protocol}//${currentURL.hostname}`;
  if (state.autoPortConversion && state.port && currentURL.port) {
    newURL = `${newURL}:${state.port}`;
  } else if (currentURL.port) {
    newURL = `${newURL}:${currentURL.port}`;
  }
  // pamameters, contact all flags like ?opty_flag1=true&opty_flag2=false
  const flags = state.flags.map(flag => {
    const [name, value] = flag.split(':');
    return `opty_${name}=${value}`;
  }).join('&');
  newURL = `${newURL}/app/lab/overview${flags ? `?${flags}` : ''}`;

  await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    world: chrome.scripting.ExecutionWorld.MAIN,
    func: startEngine,
    args: [state.currentAgent, newURL],
  });
}

function watchStorage() {
  console.log('watch storage');
  chrome.storage.onChanged.addListener((changes, area) => {
    console.log('storage changes', changes, area);
    if (area === 'sync') {
      Object.keys(changes).forEach(key => {
        console.log('show key', key, changes[key])
        switch (key) {
          case 'domain':
            setDomainState(changes[key].newValue);
            break;
          case 'port':
            setPortState(changes[key].newValue);
            break;
          case 'agents':
            setAgentsState(changes[key].newValue);
            break;
          case 'flags':
            setFlagsState(changes[key].newValue);
            break;
          case 'autoPortConversion':
            setAutoPortConversionState(changes[key].newValue);
            break;
          default:
            break;
        }
      });
    }
  });
}

async function checkDomainPermission() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  console.log('show tab', tab.url, state.domain, !tab.url.includes(state.domain));
  if (!tab.url.includes(state.domain)) {
    const coverPage = document.getElementById('coverArea');
    coverPage.style.display = 'flex';
  }
}

async function main() {

  // setNodes();
  setNodes();

  // clearNodesInnerHTML();
  domNode.clearNodesInnerHTML();

  // getSettings();
  await getSettingsAndSetState();

  await checkDomainPermission();

  // set Nodes innerHTML
  setAutoPortCheckbox();
  setPortLabel();
  setAgentList();
  setFlagList();
}

document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById('settingsLink').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
  });

  document.getElementById('redirectBtn').addEventListener('click', redirect);

  await main();

  // Watch Storage
  watchStorage();

  function getSettings() {
    // const list = document.getElementById('agentList');
    // const autoPortCheckbox = document.getElementById('autoPortConversion');
    // const portLabel = document.getElementById('portLabel');
    // const flagList = document.getElementById('flagList');

    // clear list, autoPortCheckbox, autoPortCheckbox, flagList
    list.innerHTML = '';
    autoPortCheckbox.checked = false;
    portLabel.innerHTML = '';
    flagList.innerHTML = '';

    chrome.storage.sync.get(['domain', 'port', 'agents', 'autoPortConversion', 'flags'], function (result) {
      state.setState('domain', result.domain || '')
      state.setState('port', result.port || '')
      state.setState('agents', result.agents ? result.agents.split('|') : [])
      state.setState('flags', result.flags ? result.flags.split('|') : [])
      state.setState('autoPortConversion', result.autoPortConversion || false);

      autoPortCheckbox.checked = state.autoPortConversion;

      autoPortCheckbox.removeEventListener('change', handleAutoPortConversion);
      autoPortCheckbox.addEventListener('change', handleAutoPortConversion);

      portLabel.innerHTML = state.port;

      state.agents.forEach(agent => {
        const [name, value] = agent.split(':');
        const li = document.createElement('li');
        li.textContent = name;
        li.setAttribute('data-value', value);
        list.appendChild(li);
      });

      state.flags.forEach(flag => {
        const [name, value] = flag.split(':');
        const li = document.createElement('li');
        li.setAttribute('data-name', name);
        li.setAttribute('data-value', value);

        const flagContent = document.createElement('div');
        flagContent.classList.add('flag-content');
        flagContent.textContent = name;
        flagContent.setAttribute('data-name', name);
        flagContent.setAttribute('data-value', value);

        const flagValue = document.createElement('div');
        flagValue.classList.add('flag-value');
        if (value === 'true') {
          flagValue.classList.add('flag-true');
        }
        flagValue.textContent = value;
        flagValue.setAttribute('data-name', name);
        flagValue.setAttribute('data-value', value);

        li.appendChild(flagContent);
        li.appendChild(flagValue);

        flagList.appendChild(li);
      });

      flagList.removeEventListener('click', flagListClickHandler);
      flagList.addEventListener('click', flagListClickHandler);

      list.removeEventListener('click', handlerClickAgent);
      list.addEventListener('click', handlerClickAgent);
    });
  };

  function jumpUrl() {
    function impersonateAgent(tab) {
      console.log('impersonateAgent function called');
      console.log('show sss', state, tab);

      if (window.location.hostname.endsWith(state.domain)) {
        let impersonationBanner = document.querySelector("header.uc-impersonationBanner");

        function postRequest(url, data) {
          return fetch(url, {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(data),
            method: "POST",
            credentials: "same-origin"
          });
        }

        function impersonateUser(userId) {
          postRequest("/impersonate/", { impersonation_tool: "a3g", targetUserId: userId })
            .then(() => {
              console.log('impersonate begin');
              const currentPort = window.location.port;
              let baseUrl = window.location.origin;
              if (state.autoPortConversion && state.port && currentPort) {
                baseUrl = `${window.location.protocol}//${window.location.hostname}:${state.port}`;
              } else if (currentPort) {
                baseUrl = `${window.location.protocol}//${window.location.hostname}:${currentPort}`;
              }
              console.log('url', baseUrl);
              // comb flags
              let flagString = '';
              window.location.href = `${baseUrl}/app/lab/overview`
            });
        }

        if (impersonationBanner) {
          postRequest("/unimpersonate/", { impersonation_tool: "impersonation_banner" })
            .then(() => impersonateUser(state.currentAgent));
        } else {
          impersonateUser(state.currentAgent);
        }
      } else {
        try {
          alert(`You can only impersonate agents on ${state.domain}, and make sure you have the permission.`);
        } catch (error) {
          console.error("Error in alert:", error);
        }
      }
    }
    const logFunction = (tab) => {
      console.log('show logFunction', tab);
      // const script = document.createElement('script');
      // script.textContent = 'console.log("show xxxx");';
      // document.documentElement.appendChild(script);
      // script.remove();
    }
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      console.log('show jumpUrl', state, tab)
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: logFunction,
        world: chrome.scripting.ExecutionWorld.MAIN,
        args: [tab],
      }).then(() => {
        console.log('Script executed');
      }).catch(err => {
        console.error('Error', err);
      });
    })
  }

  function handlerClickAgent(event) {
    state.setState('currentAgent', event.target.getAttribute('data-value'));
    jumpUrl();
  }

  function flagListClickHandler(event) {
    const node = event.target;
    const selectedName = node.getAttribute('data-name');
    settingFlagValue(selectedName);
  }

  function handleAutoPortConversion() {
    chrome.storage.sync.set({ autoPortConversion: this.checked });
  }

  function settingFlagValue(name) {
    chrome.storage.sync.get(['flags'], function (result) {
      const flags = result.flags ? result.flags.split('|') : [];
      const newFlags = flags.map(flag => {
        const [flagName, flagValue] = flag.split(':');
        if (flagName === name) {
          return `${flagName}:${flagValue === 'true' ? 'false' : 'true'}`;
        }
        return flag;
      });

      const flagsJoined = newFlags.join('|');
      chrome.storage.sync.set({ flags: flagsJoined }, function () {
        console.log('Flag settings saved');
      });

      // getSettings();
    });
  };

  // getSettings();
});