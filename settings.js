document.getElementById('addAgentButton').addEventListener('click', function () {
    addAgentRow();
});

document.getElementById('saveButton').addEventListener('click', function () {
    const domain = document.getElementById('domain').value;
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

// Load settings when the page loads
window.addEventListener('load', function () {
    chrome.storage.sync.get(['domain', 'agents'], function (result) {
        console.log('Settings loaded', result);
        document.getElementById('domain').value = result.domain || '';
        if (result.agents) {
            result.agents.split('|').forEach(agent => {
                const [name, value] = agent.split(':');
                addAgentRow(name, value);
            });
        } else {
            addAgentRow();
        }
    });
});

document.getElementById('loadAgentsButton').addEventListener('click', function () {
    if (confirm('Loading will overwrite the current configuration. Are you sure you want to proceed?')) {
        const agentsCode = document.getElementById('agentsCode').value;
        const optionRegex = /<option value="([^"]+)">([^<]+)<\/option>/g;
        let match;
        let agentsString = '';

        while ((match = optionRegex.exec(agentsCode)) !== null) {
            if (agentsString !== '') {
                agentsString += '|';
            }
            agentsString += `${match[2]}:${match[1]}`;
        }

        if (agentsString === '') {
            alert('No valid options found in the input.');
        } else {
            chrome.storage.sync.set({ agents: agentsString }, function () {
                alert('Agents loaded successfully!');
            });
        }
    }
}); 