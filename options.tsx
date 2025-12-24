import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export default function Options() {
  const [domain, setDomain] = useState("")
  const [port, setPort] = useState("")
  const [path, setPath] = useState("")
  const [agents, setAgents] = useState<{ name: string, value: string }[]>([])
  const [flags, setFlags] = useState<{ name: string }[]>([])
  const [params, setParams] = useState<{ name: string, value: string }[]>([])

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    const data = await storage.getAll()
    setDomain(data.domain || "")
    setPort(data.port || "")
    setPath(data.path || "")
    setAgents((data.agents || "").split("|").filter(Boolean).map((a: string) => {
      const [name, value] = a.split(":")
      return { name, value }
    }))
    setFlags((data.flags || "").split("|").filter(Boolean).map((f: string) => {
      const [name] = f.split(":")
      return { name }
    }))
    setParams((data.params || "").split("|").filter(Boolean).map((p: string) => {
      const [name, value] = p.split(":")
      return { name, value }
    }))
  }

  const handleSaveAgents = async () => {
    const agentsStr = agents.map(a => `${a.name}:${a.value}`).join("|")
    await storage.set("domain", domain)
    await storage.set("port", port)
    await storage.set("path", path)
    await storage.set("agents", agentsStr)
    alert("Settings saved!")
  }

  const handleSaveFlags = async () => {
    const flagsStr = flags.map(f => `${f.name}:true`).join("|")
    await storage.set("flags", flagsStr)
    alert("Flag settings saved!")
  }

  const handleSaveParams = async () => {
    const paramsStr = params.map(p => `${p.name}:${p.value}`).join("|")
    await storage.set("params", paramsStr)
    alert("Parameter settings saved!")
  }

  const addAgent = () => {
    setAgents([...agents, { name: "", value: "" }])
  }

  const removeAgent = (index: number) => {
    if (confirm("Are you sure you want to delete this agent?")) {
      setAgents(agents.filter((_, i) => i !== index))
    }
  }

  const updateAgent = (index: number, field: "name" | "value", value: string) => {
    setAgents(agents.map((a, i) => i === index ? { ...a, [field]: value } : a))
  }

  const addFlag = () => {
    setFlags([...flags, { name: "" }])
  }

  const removeFlag = (index: number) => {
    if (confirm("Are you sure you want to delete this flag?")) {
      setFlags(flags.filter((_, i) => i !== index))
    }
  }

  const updateFlag = (index: number, value: string) => {
    setFlags(flags.map((f, i) => i === index ? { ...f, name: value } : f))
  }

  const addParam = () => {
    setParams([...params, { name: "", value: "" }])
  }

  const removeParam = (index: number) => {
    if (confirm("Are you sure you want to delete this parameter?")) {
      setParams(params.filter((_, i) => i !== index))
    }
  }

  const updateParam = (index: number, field: "name" | "value", value: string) => {
    setParams(params.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', fontSize: '14px' }}>
      <h1>Settings</h1>
      
      <h3>Domain</h3>
      <label>
        <input
          type="text"
          placeholder="domain"
          id="domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          style={{ width: '200px', height: '30px', marginLeft: '10px' }}
        />
      </label>

      <h3>Port</h3>
      <p>for local development, will autojump to this port, if it is empty, will not change the port</p>
      <label>
        <input
          type="text"
          placeholder="port"
          id="port"
          value={port}
          onChange={(e) => setPort(e.target.value)}
          style={{ width: '200px', height: '30px', marginLeft: '10px' }}
        />
      </label>

      <h3>Path</h3>
      <p>Path of you want to jump, '/app/lab/overview'</p>
      <label>
        <input
          type="text"
          placeholder="path"
          id="path"
          value={path}
          onChange={(e) => setPath(e.target.value)}
          style={{ width: '200px', height: '30px', marginLeft: '10px' }}
        />
      </label>

      <h3>Agents</h3>
      <div id="agentsContainer" style={{ marginBottom: '20px', borderBottom: '1px solid #ccc' }}>
        {agents.map((agent, index) => (
          <div key={index} className="agent-row" style={{ marginBottom: '10px' }}>
            <input
              type="text"
              className="agent-name"
              placeholder="Agent Name"
              value={agent.name}
              onChange={(e) => updateAgent(index, "name", e.target.value)}
              style={{ width: '200px', height: '30px', fontSize: '14px', marginLeft: '10px' }}
            />
            <input
              type="text"
              className="agent-value"
              placeholder="Agent Value"
              value={agent.value}
              onChange={(e) => updateAgent(index, "value", e.target.value)}
              style={{ width: '300px', height: '30px', fontSize: '14px', marginLeft: '10px' }}
            />
            <button
              onClick={() => removeAgent(index)}
              style={{ marginLeft: '10px', fontSize: '14px' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <button
        id="addAgentButton"
        onClick={addAgent}
        style={{ width: '100px', height: '36px', fontSize: '14px', marginLeft: '10px' }}
      >
        Add Agent
      </button>
      <button
        id="saveButton"
        onClick={handleSaveAgents}
        style={{
          width: '120px',
          height: '36px',
          backgroundColor: '#007bff',
          color: 'white',
          border: '1px solid #4284fa',
          marginLeft: '10px'
        }}
      >
        Save Changes
      </button>

      <hr />

      <h3>Flags (opty_)</h3>
      <div id="flagsContainer" style={{ marginBottom: '20px' }}>
        {flags.map((flag, index) => (
          <div key={index} className="flag-row" style={{ marginBottom: '10px' }}>
            <input
              type="text"
              className="flag-name"
              placeholder="Flag"
              value={flag.name}
              onChange={(e) => updateFlag(index, e.target.value)}
              style={{ width: '200px', height: '30px', fontSize: '14px', marginLeft: '10px' }}
            />
            <button
              onClick={() => removeFlag(index)}
              style={{ marginLeft: '10px', fontSize: '14px' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <button
        id="addFlagButton"
        onClick={addFlag}
        style={{ width: '100px', height: '36px', fontSize: '14px', marginLeft: '10px' }}
      >
        Add Flag
      </button>
      <button
        id="saveFlagButton"
        onClick={handleSaveFlags}
        style={{
          width: '120px',
          height: '36px',
          backgroundColor: '#007bff',
          color: 'white',
          border: '1px solid #4284fa',
          marginLeft: '10px'
        }}
      >
        Save Changes
      </button>

      <hr />

      <h3>Parameters</h3>
      <div id="paramsContainer">
        {params.map((param, index) => (
          <div key={index} className="param-row" style={{ marginBottom: '10px' }}>
            <input
              type="text"
              className="param-name"
              placeholder="Parameter Name"
              value={param.name}
              onChange={(e) => updateParam(index, "name", e.target.value)}
              style={{ width: '200px', height: '30px', fontSize: '14px', marginLeft: '10px' }}
            />
            <input
              type="text"
              className="param-value"
              placeholder="Parameter Value"
              value={param.value}
              onChange={(e) => updateParam(index, "value", e.target.value)}
              style={{ width: '200px', height: '30px', fontSize: '14px', marginLeft: '10px' }}
            />
            <button
              onClick={() => removeParam(index)}
              style={{ marginLeft: '10px', fontSize: '14px' }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
      <button
        id="addParamButton"
        onClick={addParam}
        style={{ width: '100px', height: '36px', fontSize: '14px', marginLeft: '10px' }}
      >
        Add Parameter
      </button>
      <button
        id="saveParamButton"
        onClick={handleSaveParams}
        style={{
          width: '120px',
          height: '36px',
          backgroundColor: '#007bff',
          color: 'white',
          border: '1px solid #4284fa',
          marginLeft: '10px'
        }}
      >
        Save Changes
      </button>
    </div>
  )
}
