document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('settingsLink').addEventListener('click', function () {
    chrome.runtime.openOptionsPage();
  });

  const list = document.getElementById('agentList');

  chrome.storage.sync.get(['domain', 'port', 'agents'], function (result) {
    const domain = result.domain || '';
    const port = result.port || '';
    const agents = result.agents ? result.agents.split('|') : [];

    agents.forEach(agent => {
      const [name, value] = agent.split(':');
      const li = document.createElement('li');
      li.textContent = name;
      li.setAttribute('data-value', value);
      list.appendChild(li);
    });

    list.addEventListener('click', function (event) {
      const li = event.target;
      if (li.tagName === 'LI') {
        const selectedValue = li.getAttribute('data-value');
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const tab = tabs[0];
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: impersonateAgent,
            args: [selectedValue, domain, port]
          });
        });
      }
    });
  });

  function impersonateAgent(selectedValue, domain, port) {
    if (window.location.hostname.endsWith(domain)) {
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
        console.log("test", window.location.origin);
        postRequest("/impersonate/", { impersonation_tool: "a3g", targetUserId: userId })
          .then(() => {
            console.log("Impersonating user done", window.location.origin, port);
            const currentPort = window.location.port;
            let baseUrl = window.location.origin;
            if (port && currentPort) {
              baseUrl = `${window.location.protocol}//${window.location.hostname}:${port}`;
            }
            window.location.href = `${baseUrl}/app/lab/overview`
          });
      }

      if (impersonationBanner) {
        postRequest("/unimpersonate/", { impersonation_tool: "impersonation_banner" })
          .then(() => impersonateUser(selectedValue));
      } else {
        impersonateUser(selectedValue);
      }
    } else {
      alert(`You can only impersonate agents on ${domain}, and make sure you have the permission.`);
    }
  }
});