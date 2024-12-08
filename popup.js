const state = {
  domain: '',
  port: '',
  path: '',
  agents: [],
  flags: [],
  params: [], 
  autoPortConversion: false,
  currentAgent: '',
  setState: function (key, value) {
    this[key] = value;
  },
}

const domNode = {
  agentSelect: null,
  autoPortCheckbox: null,
  portLabel: null,
  flagList: null,
  paramList: null,
  setNode: function (key, value) {
    this[key] = value;
  },
  clearNode: function (key, value = '') {
    this[key].innerHTML = value;
  },
  clearNodesInnerHTML: function () {
    this.clearNode('agentSelect');
    this.clearNode('autoPortCheckbox', false);
    this.clearNode('portLabel');
    this.clearNode('flagList');
    this.clearNode('paramList');
  },
}

const StorageKey = {
  domain: 'domain',
  port: 'port',
  path: 'path',
  agents: 'agents',
  autoPortConversion: 'autoPortConversion',
  flags: 'flags',
  params: 'params', 
}

function setNodes() {
  domNode.setNode('agentSelect', document.getElementById('agentSelect'));
  domNode.setNode('autoPortCheckbox', document.getElementById('autoPortConversion'));
  domNode.setNode('portLabel', document.getElementById('portLabel'));
  domNode.setNode('flagList', document.getElementById('flagList'));
  domNode.setNode('paramList', document.getElementById('paramList'));
}

function setDomainState(value) {
  state.setState('domain', value || '');
}
function setPortState(value) {
  state.setState('port', value || '');
}
function setPathState(value) {
  state.setState('path', value || '');
}
function setAgentsState(value) {
  state.setState('agents', value ? value.split('|') : []);
}
function setFlagsState(value) {
  state.setState('flags', value ? value.split('|') : []);
}
function setParamsState(value) {
  state.setState('params', value ? value.split('|') : []);
}
function setAutoPortConversionState(value) {
  state.setState('autoPortConversion', value || false);
}

async function getSettingsAndSetState() {
  const storageData = await chrome.storage.sync.get(Object.values(StorageKey));
  setDomainState(storageData[StorageKey.domain]);
  setPortState(storageData[StorageKey.port]);
  setPathState(storageData[StorageKey.path]);
  setAgentsState(storageData[StorageKey.agents]);
  setFlagsState(storageData[StorageKey.flags]);
  setParamsState(storageData[StorageKey.params]); 
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
  domNode.clearNode('agentSelect');
  setAgentSelect();

  // impersonate agent
  await impersonateAgent();
}

function setAgentSelect() {
  // 添加默认选项
  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = 'Select an agent';
  domNode.agentSelect.appendChild(defaultOption);

  // 添加所有agent选项
  state.agents.forEach(agent => {
    const [name, value] = agent.split(':');
    const option = document.createElement('option');
    option.value = value;
    option.textContent = name;
    if (value === state.currentAgent) {
      option.selected = true;
    }
    domNode.agentSelect.appendChild(option);
  });

  // 添加change事件监听器
  domNode.agentSelect.addEventListener('change', async function(event) {
    state.setState('currentAgent', event.target.value);
    if (event.target.value) {
      await impersonateAgent();
    }
  });
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

function setParamList() {
  state.params.forEach(param => {
    const [name, value] = param.split(':');
    const li = document.createElement('li');
    
    const nameSpan = document.createElement('span');
    nameSpan.classList.add('param-name');
    nameSpan.textContent = name;
    
    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.classList.add('param-value-input');
    valueInput.value = value;
    valueInput.setAttribute('data-name', name);
    
    // 当值改变时更新存储
    valueInput.addEventListener('change', async function(event) {
      const newValue = event.target.value;
      const paramName = event.target.getAttribute('data-name');
      
      const updatedParams = state.params.map(p => {
        const [name, value] = p.split(':');
        if (name === paramName) {
          return `${name}:${newValue}`;
        }
        return p;
      });
      
      await chrome.storage.sync.set({ 
        'params': updatedParams.join('|') 
      });
    });
    
    li.appendChild(nameSpan);
    li.appendChild(valueInput);
    
    domNode.paramList.appendChild(li);
  });
}

async function startEngine(newURL, currentAgent) {
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

  if (currentAgent) {
    if (impersonationBanner) {
      postRequest("/unimpersonate/", { impersonation_tool: "impersonation_banner" })
        .then(() => impersonateUser(currentAgent));
    } else {
      impersonateUser(currentAgent);
    }
  } else {
    window.location.href = newURL;
  }
}

async function redirect() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  let url = new URL(tabs[0].url);
  
  // 处理opty_前缀的flags
  const flags = state.flags.map(flag => {
    const [name, value] = flag.split(':');
    return `opty_${name}=${value}`;
  });

  // 处理普通参数
  const params = state.params.map(param => {
    const [name, value] = param.split(':');
    return `${name}=${value}`;
  });

  // 合并所有参数
  const allParams = [...flags, ...params].join('&');

  const newURL = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ''}${url.pathname}${allParams ? `?${allParams}` : ''}`;

  await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    world: chrome.scripting.ExecutionWorld.MAIN,
    func: startEngine,
    args: [newURL],
  });
}

async function impersonateAgent() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const currentURL = new URL(tabs[0].url);
  let newURL = `${currentURL.protocol}//${currentURL.hostname}`;
  if (state.autoPortConversion && state.port && currentURL.port) {
    newURL = `${newURL}:${state.port}`;
  } else if (currentURL.port) {
    newURL = `${newURL}:${currentURL.port}`;
  }

  // 处理opty_前缀的flags
  const flags = state.flags.map(flag => {
    const [name, value] = flag.split(':');
    return `opty_${name}=${value}`;
  });

  // 处理普通参数
  const params = state.params.map(param => {
    const [name, value] = param.split(':');
    return `${name}=${value}`;
  });

  // 合并所有参数
  const allParams = [...flags, ...params].join('&');

  newURL = `${newURL}${state.path}${allParams ? `?${allParams}` : ''}`;

  await chrome.scripting.executeScript({
    target: { tabId: tabs[0].id },
    world: chrome.scripting.ExecutionWorld.MAIN,
    func: startEngine,
    args: [newURL, state.currentAgent],
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
          case 'params':
            setParamsState(changes[key].newValue);
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
  setAgentSelect();
  setFlagList();
  setParamList(); 
}

document.addEventListener('DOMContentLoaded', async function () {
  document.getElementById('settingsLink').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('settingsLinkForCover').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('redirectBtn').addEventListener('click', async () => {
    await redirect();
  });

  await main();

  // Watch Storage
  watchStorage();

});