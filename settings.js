document.getElementById('addAgentButton').addEventListener('click', function () {
    addAgentRow();
});

document.getElementById('saveButton').addEventListener('click', function () {
    const domain = document.getElementById('domain').value;
    const port = document.getElementById('port').value;
    const path = document.getElementById('path').value;
    const agents = [];

    document.querySelectorAll('.agent-row').forEach(row => {
        const name = row.querySelector('.agent-name').value;
        const value = row.querySelector('.agent-value').value;
        if (name && value) {
            agents.push(`${name}:${value}`);
        }
    });

    const agentsJoined = agents.join('|');

    chrome.storage.sync.set({
        'domain': domain,
        'port': port,
        'path': path,
        'agents': agentsJoined
    }, function () {
        console.log('Settings saved');
        alert('Settings saved!');
    });
});

function addAgentRow(name = '', value = '') {
    const container = document.getElementById('agentsContainer');
    const row = document.createElement('div');
    row.className = 'agent-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'agent-name';
    nameInput.placeholder = 'Agent Name';
    nameInput.value = name;

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'agent-value';
    valueInput.placeholder = 'Agent Value';
    valueInput.value = value;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete this agent?')) {
            row.remove();
        }
    });

    row.appendChild(nameInput);
    row.appendChild(valueInput);
    row.appendChild(deleteButton);
    container.appendChild(row);
}


/** flags start
 **/
document.getElementById('addFlagButton').addEventListener('click', function () {
    addFlagRow();
});

function addFlagRow(name = '') {
    const container = document.getElementById('flagsContainer');
    const row = document.createElement('div');
    row.className = 'flag-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'flag-name';
    nameInput.placeholder = 'Flag';
    nameInput.value = name;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete this flag?')) {
            row.remove();
        }
    });

    row.appendChild(nameInput);
    row.appendChild(deleteButton);
    container.appendChild(row);
}


document.getElementById('saveFlagButton').addEventListener('click', function () {
    const flags = [];

    document.querySelectorAll('.flag-row').forEach(row => {
        const name = row.querySelector('.flag-name').value;
        if (name) {
            flags.push(`${name}:true`);
        }
    });

    const flagsJoined = flags.join('|');
    chrome.storage.sync.set({
        'flags': flagsJoined
    }, function () {
        console.log('Flag settings saved');
        alert('Flag settings saved!');
    });
});

/** parameters start
 **/
function addParamRow(name = '', value = '') {
    const container = document.getElementById('paramsContainer');
    const row = document.createElement('div');
    row.className = 'param-row';

    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.className = 'param-name';
    nameInput.placeholder = 'Parameter Name';
    nameInput.value = name;

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.className = 'param-value';
    valueInput.placeholder = 'Parameter Value';
    valueInput.value = value;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', function () {
        if (confirm('Are you sure you want to delete this parameter?')) {
            row.remove();
        }
    });

    row.appendChild(nameInput);
    row.appendChild(valueInput);
    row.appendChild(deleteButton);
    container.appendChild(row);
}

document.getElementById('addParamButton').addEventListener('click', function () {
    addParamRow();
});

document.getElementById('saveParamButton').addEventListener('click', function () {
    const params = [];

    document.querySelectorAll('.param-row').forEach(row => {
        const name = row.querySelector('.param-name').value;
        const value = row.querySelector('.param-value').value;
        if (name && value) {
            params.push(`${name}:${value}`);
        }
    });

    const paramsJoined = params.join('|');
    chrome.storage.sync.set({
        'params': paramsJoined
    }, function () {
        console.log('Parameter settings saved');
        alert('Parameter settings saved!');
    });
});

// Load settings when the page loads
window.addEventListener('load', function () {
    chrome.storage.sync.get(['domain', 'port', 'agents', 'flags', 'path', 'params'], function (result) {
        console.log('Settings loaded', result);
        document.getElementById('domain').value = result.domain || '';
        document.getElementById('port').value = result.port || '';
        document.getElementById('path').value = result.path || '';
        if (result.agents) {
            result.agents.split('|').forEach(agent => {
                const [name, value] = agent.split(':');
                addAgentRow(name, value);
            });
        } else {
            addAgentRow();
        }
        if (result.flags) {
            result.flags.split('|').forEach(flag => {
                const [name] = flag.split(':');
                addFlagRow(name);
            });
        }
        if (result.params) {
            result.params.split('|').forEach(param => {
                const [name, value] = param.split(':');
                addParamRow(name, value);
            });
        }
    });
});
