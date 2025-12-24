import { useEffect, useState } from "react"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

export default function Popup() {
  const [domain, setDomain] = useState("")
  const [port, setPort] = useState("")
  const [path, setPath] = useState("")
  const [agents, setAgents] = useState<{ name: string, value: string }[]>([])
  const [flags, setFlags] = useState<{ name: string, value: boolean }[]>([])
  const [params, setParams] = useState<{ name: string, value: string }[]>([])
  const [autoPortConversion, setAutoPortConversion] = useState(false)
  const [currentAgent, setCurrentAgent] = useState("")
  const [currentUrl, setCurrentUrl] = useState("")
  const [hasPermission, setHasPermission] = useState(true)

  useEffect(() => {
    loadSettings()
    checkDomainPermission()
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
      const [name, value] = f.split(":")
      return { name, value: value === "true" }
    }))
    setParams((data.params || "").split("|").filter(Boolean).map((p: string) => {
      const [name, value] = p.split(":")
      return { name, value }
    }))
    setAutoPortConversion(data.autoPortConversion || false)
  }

  const checkDomainPermission = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const data = await storage.getAll()
    setCurrentUrl(tab.url)
    if (data.domain && !tab.url.includes(data.domain)) {
      setHasPermission(false)
    }
  }

  const handleAutoPortToggle = async () => {
    const newValue = !autoPortConversion
    setAutoPortConversion(newValue)
    await storage.set("autoPortConversion", newValue)
  }

  const handleAgentChange = async (value: string) => {
    setCurrentAgent(value)
    if (value) {
      await impersonateAgent(value)
    }
  }

  const handleFlagToggle = async (name: string) => {
    const newFlags = flags.map(f => 
      f.name === name ? { ...f, value: !f.value } : f
    )
    setFlags(newFlags)
    const flagsStr = newFlags.map(f => `${f.name}:${f.value}`).join("|")
    await storage.set("flags", flagsStr)
  }

  const handleParamChange = async (name: string, value: string) => {
    const newParams = params.map(p => 
      p.name === name ? { ...p, value } : p
    )
    setParams(newParams)
    const paramsStr = newParams.map(p => `${p.name}:${p.value}`).join("|")
    await storage.set("params", paramsStr)
  }

  const impersonateAgent = async (agentValue: string) => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = new URL(tabs[0].url)
    let newURL = `${url.protocol}//${url.hostname}`
    
    if (autoPortConversion && port && url.port) {
      newURL = `${newURL}:${port}`
    } else if (url.port) {
      newURL = `${newURL}:${url.port}`
    }

    const flagParams = flags.map(f => `opty_${f.name}=${f.value}`)
    const paramParams = params.map(p => `${p.name}=${p.value}`)
    const allParams = [...flagParams, ...paramParams].join("&")

    newURL = `${newURL}${path}${allParams ? `?${allParams}` : ""}`

    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      world: chrome.scripting.ExecutionWorld.MAIN,
      func: startEngine,
      args: [newURL, agentValue]
    })
  }

  const handleRedirect = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = new URL(tabs[0].url)
    
    const flagParams = flags.map(f => `opty_${f.name}=${f.value}`)
    const paramParams = params.map(p => `${p.name}=${p.value}`)
    const allParams = [...flagParams, ...paramParams].join("&")

    const newURL = `${url.protocol}//${url.hostname}${url.port ? `:${url.port}` : ""}${url.pathname}${allParams ? `?${allParams}` : ""}`

    await chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      world: chrome.scripting.ExecutionWorld.MAIN,
      func: startEngine,
      args: [newURL]
    })
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '10px', minWidth: '300px', minHeight: '300px' }}>
      {!hasPermission && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 999,
          color: 'white',
          fontSize: '1.1rem'
        }}>
          You can't use it on this page. 
          <a href="#" onClick={openSettings} style={{ marginLeft: '10px', color: '#4284fa' }}>Settings</a>
        </div>
      )}
      
      <div className="checkbox-container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingBottom: '10px',
        borderBottom: '1px solid #f2f2f2',
        marginBottom: '10px'
      }}>
        <label style={{ fontSize: '16px', display: 'inline-block', marginBottom: '4px' }}>
          <input
            type="checkbox"
            checked={autoPortConversion}
            onChange={handleAutoPortToggle}
            style={{ marginRight: '5px' }}
          />
          Conversion local port to <span>{port}</span>
        </label>
      </div>

      <div style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px solid #f2f2f2' }}>
        <label htmlFor="agentSelect" style={{ fontSize: '16px', display: 'inline-block', marginBottom: '4px' }}>Impersonates: </label>
        <select
          id="agentSelect"
          value={currentAgent}
          onChange={(e) => handleAgentChange(e.target.value)}
          style={{
            width: '100%',
            height: '30px',
            padding: '5px',
            border: '1px solid #ddd',
            borderRadius: '3px',
            backgroundColor: 'white',
            fontSize: '14px'
          }}
        >
          <option value="">Select an agent</option>
          {agents.map((agent, index) => (
            <option key={index} value={agent.value}>{agent.name}</option>
          ))}
        </select>
      </div>

      <label style={{ fontSize: '16px', display: 'inline-block', marginBottom: '4px' }}>Flags: </label>
      <ul style={{
        listStyleType: 'none',
        padding: 0,
        margin: '7px',
        overflowY: 'auto',
        maxHeight: '150px'
      }}>
        {flags.map((flag, index) => (
          <li
            key={index}
            onClick={() => handleFlagToggle(flag.name)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              padding: '10px',
              borderBottom: '1px solid #f2f2f2'
            }}
          >
            <span>{flag.name}</span>
            <span style={{ color: flag.value ? 'green' : 'inherit' }}>{flag.value.toString()}</span>
          </li>
        ))}
      </ul>

      <label style={{ fontSize: '16px', display: 'inline-block', marginBottom: '4px' }}>Parameters: </label>
      <ul style={{
        listStyleType: 'none',
        padding: 0,
        margin: '7px',
        overflowY: 'auto',
        maxHeight: '150px'
      }}>
        {params.map((param, index) => (
          <li
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px',
              borderBottom: '1px solid #f2f2f2'
            }}
          >
            <span style={{
              marginRight: '10px',
              flexGrow: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              minWidth: 0
            }}>{param.name}</span>
            <input
              type="text"
              value={param.value}
              onChange={(e) => handleParamChange(param.name, e.target.value)}
              style={{
                width: '80px',
                height: '24px',
                padding: '2px 5px',
                border: '1px solid #ddd',
                borderRadius: '3px',
                flexShrink: 0
              }}
            />
          </li>
        ))}
      </ul>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={handleRedirect}
          style={{
            width: '180px',
            height: '30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: '1px solid #4284fa',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          Redirect with flags only
        </button>
        <a href="#" onClick={openSettings} style={{ color: '#4284fa', textDecoration: 'none' }}>Settings</a>
      </div>
    </div>
  )
}

function startEngine(newURL: string, currentAgent?: string) {
  const coverNode = document.createElement('div')
  coverNode.style.width = '100vw'
  coverNode.style.height = '80px'
  coverNode.style.backgroundColor = 'black'
  coverNode.style.color = 'white'
  coverNode.style.position = 'absolute'
  coverNode.style.display = 'flex'
  coverNode.style.justifyContent = 'center'
  coverNode.style.alignItems = 'center'
  coverNode.style.bottom = '0'
  coverNode.style.left = '0'
  coverNode.style.zIndex = '9999'
  coverNode.innerHTML = 'Redirecting, please with a seconds.'
  document.body.appendChild(coverNode)

  function postRequest(url: string, data: any) {
    return fetch(url, {
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data),
      method: "POST",
      credentials: "same-origin"
    })
  }

  function impersonateUser(userId: string) {
    postRequest("/impersonate/", { impersonation_tool: "a3g", targetUserId: userId })
      .then(() => {
        window.location.href = newURL
      })
  }

  let impersonationBanner = document.querySelector("header.uc-impersonationBanner")

  if (currentAgent) {
    if (impersonationBanner) {
      postRequest("/unimpersonate/", { impersonation_tool: "impersonation_banner" })
        .then(() => impersonateUser(currentAgent))
    } else {
      impersonateUser(currentAgent)
    }
  } else {
    window.location.href = newURL
  }
}
