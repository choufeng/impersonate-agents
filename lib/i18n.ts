export type Language = "en" | "zh";

export interface Translations {
  nav: {
    agents: string;
    ports: string;
    uris: string;
    tailParameters: string;
    optyParameters: string;
    combinations: string;
    settings: string;
    combinationsGroup: string;
  };

  common: {
    add: string;
    edit: string;
    delete: string;
    save: string;
    cancel: string;
    confirm: string;
    loading: string;
    export: string;
    import: string;
    copy: string;
    noData: string;
  };

  header: {
    title: string;
    exportConfig: string;
    importConfig: string;
  };

  agents: {
    title: string;
    addAgent: string;
    edit: string;
    agentId: string;
    username: string;
    noData: string;
  };

  ports: {
    title: string;
    addPort: string;
    edit: string;
    port: string;
    description: string;
    noData: string;
  };

  uris: {
    title: string;
    addUri: string;
    edit: string;
    uri: string;
    description: string;
    noData: string;
  };

  tailParameters: {
    title: string;
    addParam: string;
    edit: string;
    key: string;
    value: string;
    noData: string;
  };

  optyParameters: {
    title: string;
    addParam: string;
    edit: string;
    key: string;
    value: string;
    optyPrefix: string;
    noData: string;
  };

  combinations: {
    title: string;
    createCombination: string;
    edit: string;
    combinationName: string;
    agentId: string;
    draft: string;
    noData: string;
  };

  wizard: {
    step1Title: string;
    step2Title: string;
    step3Title: string;
    combinationTitle: string;
    combinationTitlePlaceholder: string;
    basicConfigDesc: string;
    parametersDesc: string;
    selectAgent: string;
    selectAgentPlaceholder: string;
    selectPort: string;
    selectPortPlaceholder: string;
    selectUri: string;
    selectUriPlaceholder: string;
    tailParams: string;
    noTailParams: string;
    optyParams: string;
    noOptyParams: string;
    editCombination: string;
    createCombination: string;
    basicInfo: string;
    basicConfig: string;
    parameterSelection: string;
    previous: string;
    next: string;
    save: string;
    saving: string;
    add: string;
    addAgent: string;
    addPort: string;
    addUri: string;
    addTailParam: string;
    addOptyParam: string;
    agentId: string;
    username: string;
    portNumber: string;
    description: string;
    descriptionOptional: string;
    uriAddress: string;
    uriOptional: string;
    uriDescription: string;
    paramName: string;
    paramValue: string;
    optyParamPlaceholder: string;
    createFailed: string;
    creating: string;
    create: string;
  };

  settings: {
    title: string;
    language: string;
    languageZh: string;
    languageEn: string;
    importExport: string;
    exportConfig: string;
    importConfig: string;
    importConflict: string;
    skipConflicts: string;
    overwriteConflicts: string;
    noConflicts: string;
    importSuccessSkip: string;
    importSuccessOverwrite: string;
    importFailed: string;
  };

  delete: {
    title: string;
    message: string;
  };

  toast: {
    success: string;
    error: string;
    agentCreated: string;
    agentUpdated: string;
    portCreated: string;
    portUpdated: string;
    uriCreated: string;
    uriUpdated: string;
    tailParamCreated: string;
    tailParamUpdated: string;
    optyParamCreated: string;
    optyParamUpdated: string;
    combinationCreated: string;
    combinationUpdated: string;
    combinationCopied: string;
    deleted: string;
    deleteFailed: string;
    exported: string;
    exportFailed: string;
    fileParseFailed: string;
  };

  popup: {
    selectConfig: string;
    basicInfo: string;
    selectAgent: string;
    selectPort: string;
    selectUri: string;
    tailParameters: string;
    optyParameters: string;
    resetAll: string;
    openSettings: string;
    redirecting: string;
    redirect: string;
    addressViewPlaceholder: string;
    switchToAddressView: string;
    switchToImpersonateView: string;
    fetchAddress: string;
    fetching: string;
    selectAddress: string;
    addressDisplayPlaceholder: string;
    loading: string;
    noAddress: string;
  };
}

export const en: Translations = {
  nav: {
    agents: "Agents",
    ports: "Ports",
    uris: "URI",
    tailParameters: "Tail Parameters",
    optyParameters: "OPTY Parameters",
    combinations: "Combinations",
    settings: "Settings",
    combinationsGroup: "Configuration Resources",
  },

  common: {
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    loading: "Loading...",
    export: "Export",
    import: "Import",
    copy: "Copy",
    noData: "No data",
  },

  header: {
    title: "Configuration",
    exportConfig: "Export Config",
    importConfig: "Import Config",
  },

  agents: {
    title: "Agents",
    addAgent: "Add Agent",
    edit: "Edit Agent",
    agentId: "Agent ID",
    username: "Username",
    noData: "No agents yet",
  },

  ports: {
    title: "Ports",
    addPort: "Add Port",
    edit: "Edit Port",
    port: "Port",
    description: "Description",
    noData: "No ports yet",
  },

  uris: {
    title: "URI",
    addUri: "Add URI",
    edit: "Edit URI",
    uri: "URI",
    description: "Description",
    noData: "No URIs yet",
  },

  tailParameters: {
    title: "Tail Parameters",
    addParam: "Add Parameter",
    edit: "Edit Parameter",
    key: "Key",
    value: "Value",
    noData: "No tail parameters yet",
  },

  optyParameters: {
    title: "OPTY Parameters",
    addParam: "Add Parameter",
    edit: "Edit Parameter",
    key: "Key",
    value: "Value",
    optyPrefix: "OPTY_",
    noData: "No OPTY parameters yet",
  },

  combinations: {
    title: "Combinations",
    createCombination: "Create Combination",
    edit: "Edit Combination",
    combinationName: "Name",
    agentId: "Agent ID",
    draft: "Draft",
    noData: "No combinations yet",
  },

  wizard: {
    step1Title: "Step 1: Basic Information",
    step2Title: "Step 2: Basic Configuration",
    step3Title: "Step 3: Parameter Selection",
    combinationTitle: "Combination Title",
    combinationTitlePlaceholder: "e.g., Development Environment Configuration",
    basicConfigDesc:
      "Select basic configuration (optional, leave blank to fill later)",
    parametersDesc: "Select parameters (optional, leave blank to fill later)",
    selectAgent: "Agent (Username)",
    selectAgentPlaceholder: "Please select Agent (optional)",
    selectPort: "Port",
    selectPortPlaceholder: "Please select Port (optional)",
    selectUri: "URI",
    selectUriPlaceholder: "Please select URI (optional)",
    tailParams: "Tail Parameters",
    noTailParams: "No tail parameter data",
    optyParams: "OPTY Parameters",
    noOptyParams: "No OPTY parameter data",
    editCombination: "Edit Combination Configuration",
    createCombination: "Create Combination Configuration",
    basicInfo: "Basic Info",
    basicConfig: "Basic Configuration",
    parameterSelection: "Parameter Selection",
    previous: "Previous",
    next: "Next",
    save: "Save",
    saving: "Saving...",
    add: "+ Add",
    addAgent: "Add Agent",
    addPort: "Add Port",
    addUri: "Add URI",
    addTailParam: "Add Tail Parameter",
    addOptyParam: "Add OPTY Parameter",
    agentId: "Agent ID *",
    username: "Username *",
    portNumber: "Port Number *",
    description: "Description",
    descriptionOptional: "(optional)",
    uriAddress: "URI Address *",
    uriOptional: "(optional)",
    uriDescription: "URI purpose description (optional)",
    paramName: "Parameter Name *",
    paramValue: "Parameter Value *",
    optyParamPlaceholder: "e.g., TIMEOUT (automatically add OPTY_ prefix)",
    createFailed: "Creation failed, please try again",
    creating: "Creating...",
    create: "Create",
  },

  settings: {
    title: "Settings",
    language: "Language",
    languageZh: "中文",
    languageEn: "English",
    importExport: "Import/Export",
    exportConfig: "Export Configuration",
    importConfig: "Import Configuration",
    importConflict: "Import Conflict",
    skipConflicts: "Skip Conflicts",
    overwriteConflicts: "Overwrite Conflicts",
    noConflicts: "No conflicts detected. All configurations will be imported.",
    importSuccessSkip: "Import successful (skipped conflicts)",
    importSuccessOverwrite: "Import successful (overwrote conflicts)",
    importFailed: "Import failed",
  },

  delete: {
    title: "Confirm Delete",
    message:
      'Are you sure you want to delete "{name}"? This action cannot be undone.',
  },

  toast: {
    success: "Success",
    error: "Error",
    agentCreated: "Agent created",
    agentUpdated: "Agent updated",
    portCreated: "Port created",
    portUpdated: "Port updated",
    uriCreated: "URI created",
    uriUpdated: "URI updated",
    tailParamCreated: "Tail parameter created",
    tailParamUpdated: "Tail parameter updated",
    optyParamCreated: "OPTY parameter created",
    optyParamUpdated: "OPTY parameter updated",
    combinationCreated: "Combination created",
    combinationUpdated: "Combination updated",
    combinationCopied: "Combination copied",
    deleted: "Deleted",
    deleteFailed: "Delete failed",
    exported: "Configuration exported",
    exportFailed: "Export failed",
    fileParseFailed: "File parsing failed",
  },

  popup: {
    selectConfig: "Select configuration...",
    basicInfo: "Basic Info",
    selectAgent: "Select Agent",
    selectPort: "Select Port",
    selectUri: "Select URI",
    tailParameters: "Parameters",
    optyParameters: "OPTY Parameters",
    resetAll: "Reset All",
    openSettings: "Open Settings",
    redirecting: "Redirecting...",
    redirect: "Redirect",
    addressViewPlaceholder: "Address view content coming soon",
    switchToAddressView: "Switch to address view",
    switchToImpersonateView: "Switch to impersonate view",
    fetchAddress: "Fetch",
    fetching: "Fetching...",
    selectAddress: "Select address...",
    addressDisplayPlaceholder: "Select an address to view details",
    loading: "Loading...",
    noAddress: "No address available",
  },
};

export const zh: Translations = {
  nav: {
    agents: "Agents",
    ports: "端口",
    uris: "URI",
    tailParameters: "尾部参数",
    optyParameters: "OPTY 参数",
    combinations: "组合配置",
    settings: "设置",
    combinationsGroup: "配置资源",
  },

  common: {
    add: "添加",
    edit: "编辑",
    delete: "删除",
    save: "保存",
    cancel: "取消",
    confirm: "确认",
    loading: "加载中...",
    export: "导出",
    import: "导入",
    copy: "复制",
    noData: "暂无数据",
  },

  header: {
    title: "配置管理",
    exportConfig: "导出配置",
    importConfig: "导入配置",
  },

  agents: {
    title: "Agents",
    addAgent: "添加 Agent",
    edit: "编辑 Agent",
    agentId: "Agent ID",
    username: "用户名",
    noData: "暂无 Agent 数据",
  },

  ports: {
    title: "端口",
    addPort: "添加端口",
    edit: "编辑端口",
    port: "端口号",
    description: "描述说明",
    noData: "暂无端口数据",
  },

  uris: {
    title: "URI",
    addUri: "添加 URI",
    edit: "编辑 URI",
    uri: "URI",
    description: "描述说明",
    noData: "暂无 URI 数据",
  },

  tailParameters: {
    title: "尾部参数",
    addParam: "添加参数",
    edit: "编辑参数",
    key: "参数名",
    value: "参数值",
    noData: "暂无尾部参数数据",
  },

  optyParameters: {
    title: "OPTY 参数",
    addParam: "添加参数",
    edit: "编辑参数",
    key: "参数名",
    value: "参数值",
    optyPrefix: "OPTY_",
    noData: "暂无 OPTY 参数数据",
  },

  combinations: {
    title: "组合配置",
    createCombination: "创建组合",
    edit: "编辑组合",
    combinationName: "组合名称",
    agentId: "Agent ID",
    draft: "草稿",
    noData: "暂无组合配置",
  },

  wizard: {
    step1Title: "步骤 1: 基础信息",
    step2Title: "步骤 2: 基础配置",
    step3Title: "步骤 3: 参数选择",
    combinationTitle: "组合标题",
    combinationTitlePlaceholder: "例如：开发环境配置",
    basicConfigDesc: "选择基础配置（可选，留空可稍后填写）",
    parametersDesc: "选择参数（可选，留空可稍后填写）",
    selectAgent: "Agent（用户名）",
    selectAgentPlaceholder: "请选择 Agent（可选）",
    selectPort: "端口",
    selectPortPlaceholder: "请选择端口（可选）",
    selectUri: "URI",
    selectUriPlaceholder: "请选择 URI（可选）",
    tailParams: "尾部参数",
    noTailParams: "暂无尾部参数数据",
    optyParams: "OPTY 参数",
    noOptyParams: "暂无 OPTY 参数数据",
    editCombination: "编辑组合配置",
    createCombination: "创建组合配置",
    basicInfo: "基础信息",
    basicConfig: "基础配置",
    parameterSelection: "参数选择",
    previous: "上一步",
    next: "下一步",
    save: "保存",
    saving: "保存中...",
    add: "+ 添加",
    addAgent: "添加 Agent",
    addPort: "添加端口",
    addUri: "添加 URI",
    addTailParam: "添加尾部参数",
    addOptyParam: "添加 OPTY 参数",
    agentId: "Agent ID *",
    username: "用户名 *",
    portNumber: "端口号 *",
    description: "描述",
    descriptionOptional: "（可选）",
    uriAddress: "URI 地址 *",
    uriOptional: "（可选）",
    uriDescription: "URI 用途说明（可选）",
    paramName: "参数名 *",
    paramValue: "参数值 *",
    optyParamPlaceholder: "如 TIMEOUT（自动添加OPTY_前缀）",
    createFailed: "创建失败，请重试",
    creating: "创建中...",
    create: "创建",
  },

  settings: {
    title: "设置",
    language: "语言",
    languageZh: "中文",
    languageEn: "English",
    importExport: "导入导出",
    exportConfig: "导出配置",
    importConfig: "导入配置",
    importConflict: "导入冲突",
    skipConflicts: "跳过冲突",
    overwriteConflicts: "覆盖冲突",
    noConflicts: "没有检测到冲突，将直接导入所有配置。",
    importSuccessSkip: "导入成功（跳过冲突）",
    importSuccessOverwrite: "导入成功（覆盖冲突）",
    importFailed: "导入失败",
  },

  delete: {
    title: "确认删除",
    message: "确定要删除「{name}」吗？此操作无法撤销。",
  },

  toast: {
    success: "成功",
    error: "失败",
    agentCreated: "Agent 已创建",
    agentUpdated: "Agent 已更新",
    portCreated: "端口已创建",
    portUpdated: "端口已更新",
    uriCreated: "URI 已创建",
    uriUpdated: "URI 已更新",
    tailParamCreated: "尾部参数已创建",
    tailParamUpdated: "尾部参数已更新",
    optyParamCreated: "OPTY 参数已创建",
    optyParamUpdated: "OPTY 参数已更新",
    combinationCreated: "组合已创建",
    combinationUpdated: "组合已更新",
    combinationCopied: "组合已复制",
    deleted: "已删除",
    deleteFailed: "删除失败",
    exported: "配置已导出",
    exportFailed: "导出失败",
    fileParseFailed: "文件解析失败",
  },

  popup: {
    selectConfig: "选择配置...",
    basicInfo: "基础信息",
    selectAgent: "请选择 Agent",
    selectPort: "请选择 Port",
    selectUri: "请选择 URI",
    tailParameters: "参数",
    optyParameters: "OPTY 参数",
    resetAll: "重置全部",
    openSettings: "打开设置",
    redirecting: "跳转中...",
    redirect: "跳转",
    addressViewPlaceholder: "地址视图内容即将推出",
    switchToAddressView: "切换到地址视图",
    switchToImpersonateView: "切换到模拟视图",
    fetchAddress: "获取",
    fetching: "获取中...",
    selectAddress: "选择地址...",
    addressDisplayPlaceholder: "选择地址以查看详情",
    loading: "加载中...",
    noAddress: "暂无地址",
  },
};
