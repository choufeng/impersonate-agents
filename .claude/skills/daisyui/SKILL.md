# DaisyUI 组件库技能

## 概述

DaisyUI 是一个基于 Tailwind CSS 的组件库，提供了 65+ 个预构建的组件，无需 JavaScript 即可使用。

- 官网: https://daisyui.com
- 当前版本: 5.5.14
- GitHub: https://github.com/saadeghi/daisyui

---

## 安装与配置

### 安装

DaisyUI 作为 Tailwind 插件安装：

```bash
npm i -D daisyui@latest
```

### 配置

在 CSS 文件中添加 DaisyUI 插件：

```css
@import "tailwindcss";
@plugin "daisyui";
```

或者在 tailwind.config.js 中配置：

```javascript
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui/src/plugin.js")],
};
```

---

## Plasmo 项目中的使用

本项目已配置 DaisyUI：

### 当前配置

- **版本**: 5.5.14
- **主题**: abyss（自定义主题）
- **样式加载**: style.css 中 `@tailwind base/components/utilities;`

### 在 Plasmo 中使用

```tsx
// 1. 导入 Tailwind 和 DaisyUI
import "style.css";

// 2. 在 JSX 中使用类名
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">Card Title</h2>
  </div>
</div>;
```

---

## 核心组件（本项目需求）

### 1. Toggle - 开关组件

用于 T Force（Temporary Force）功能的参数切换。

#### 基础用法

```tsx
<input type="checkbox" className="toggle" checked={enabled} />
```

#### 样式变体

```tsx
// 颜色
<input type="checkbox" className="toggle toggle-primary" />
<input type="checkbox" className="toggle toggle-secondary" />
<input type="checkbox" className="toggle toggle-success" />
<input type="checkbox" className="toggle toggle-warning" />
<input type="checkbox" className="toggle toggle-error" />

// 尺寸
<input type="checkbox" className="toggle toggle-xs" />
<input type="checkbox" className="toggle toggle-sm" />
<input type="checkbox" className="toggle toggle-md" />  // 默认
<input type="checkbox" className="toggle toggle-lg" />
<input type="checkbox" className="toggle toggle-xl" />

// 禁用状态
<input type="checkbox" className="toggle" disabled />
```

#### 带标签

```tsx
<label className="label cursor-pointer">
  <input type="checkbox" className="toggle" />
  <span className="label-text">参数名称</span>
</label>
```

#### React 受控组件

```tsx
const [enabled, setEnabled] = useState(false);

<input
  type="checkbox"
  className="toggle"
  checked={enabled}
  onChange={(e) => setEnabled(e.target.checked)}
/>;
```

---

### 2. Select - 下拉选择组件

用于选择组合配置。

#### 基础用法

```tsx
<select className="select select-bordered">
  <option disabled selected>
    选择配置...
  </option>
  <option>开发环境配置</option>
  <option>生产环境配置</option>
</select>
```

#### 样式变体

```tsx
// 颜色
<select className="select select-primary" />
<select className="select select-secondary" />
<select className="select select-success" />
<select className="select select-warning" />
<select className="select select-error" />

// 尺寸
<select className="select select-xs" />
<select className="select select-sm" />
<select className="select select-md" />  // 默认
<select className="select select-lg" />
<select className="select select-xl" />

// 禁用
<select className="select" disabled>
  <option>无法选择</option>
</select>
```

#### React 受控组件

```tsx
const [selected, setSelected] = useState("");

<select
  className="select select-bordered"
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
>
  <option disabled selected>
    选择配置...
  </option>
  <option value="dev">开发环境配置</option>
  <option value="prod">生产环境配置</option>
</select>;
```

---

### 3. Button - 按钮组件

用于保存配置和跳转按钮。

#### 基础用法

```tsx
<button className="btn">默认按钮</button>
```

#### 样式变体

```tsx
// 颜色
<button className="btn btn-primary">主按钮</button>
<button className="btn btn-secondary">次要按钮</button>
<button className="btn btn-success">成功</button>
<button className="btn btn-warning">警告</button>
<button className="btn btn-error">错误</button>

// 样式风格
<button className="btn btn-soft">柔和风格</button>
<button className="btn btn-outline">轮廓风格</button>
<button className="btn btn-ghost">幽灵风格</button>
<button className="btn btn-link">链接风格</button>

// 尺寸
<button className="btn btn-xs">超小</button>
<button className="btn btn-sm">小</button>
<button className="btn btn-md">中</button>
<button className="btn btn-lg">大</button>
<button className="btn btn-xl">超大</button>

// 布局
<button className="btn btn-wide">宽按钮</button>
<button className="btn btn-block">块级按钮</button>

// 禁用状态
<button className="btn" disabled>禁用</button>
<button className="btn btn-disabled">禁用</button>
```

#### 带图标的按钮

```tsx
<button className="btn">
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    />
  </svg>
  点击我
</button>
```

#### 加载状态

```tsx
<button className="btn">
  <span className="loading loading-spinner"></span>
  加载中...
</button>
```

---

### 4. Card - 卡片组件

用于展示配置详情。

#### 基础结构

```tsx
<div className="card bg-base-100 shadow-xl">
  <div className="card-body">
    <h2 className="card-title">卡片标题</h2>
    <p>卡片内容</p>
    <div className="card-actions justify-end">
      <button className="btn btn-primary">操作</button>
    </div>
  </div>
</div>
```

#### 带图片的卡片

```tsx
<div className="card bg-base-100 shadow-xl">
  <figure>
    <img src="https://example.com/image.jpg" alt="图片" />
  </figure>
  <div className="card-body">
    <h2 className="card-title">卡片标题</h2>
    <p>卡片内容</p>
  </div>
</div>
```

#### 卡片变体

```tsx
// 尺寸
<div className="card card-xs">超小卡片</div>
<div className="card card-sm">小卡片</div>
<div className="card card-md">中等卡片</div>
<div className="card card-lg">大卡片</div>
<div className="card card-xl">超大卡片</div>

// 边框样式
<div className="card card-border">边框卡片</div>
<div className="card card-dash">虚线卡片</div>

// 图片全背景
<div className="card image-full">全背景图</div>

// 带侧边栏
<div className="card card-side">侧边栏卡片</div>
```

#### 卡片部件

- **card-title**: 卡片标题
- **card-body**: 卡片主体
- **card-actions**: 卡片操作区
- **figure**: 图片区域

---

### 5. Modal - 模态框组件

用于确认对话框。

#### 推荐方法：HTML Dialog 元素

```tsx
<button onClick={() => document.getElementById('my_modal').showModal()}>
  打开对话框
</button>

<dialog id="my_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">对话框标题</h3>
    <p className="py-4">对话框内容</p>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">关闭</button>
      </form>
    </div>
  </div>
</dialog>
```

#### 带外部关闭功能

```tsx
<dialog id="my_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">对话框标题</h3>
    <p className="py-4">点击外部区域也可关闭</p>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
```

#### 自定义宽度

```tsx
<dialog id="my_modal" className="modal">
  <div className="modal-box w-11/12 max-w-5xl">
    <h3 className="font-bold text-lg">宽对话框</h3>
  </div>
</dialog>
```

#### 响应式定位

```tsx
<dialog id="my_modal" className="modal modal-bottom sm:modal-middle">
  <div className="modal-box">
    <p>小屏底部，中屏居中</p>
  </div>
</dialog>
```

#### Modal 部件

- **modal**: 模态框容器
- **modal-box**: 模态框内容区
- **modal-action**: 模态框操作区
- **modal-backdrop**: 背景遮罩（用于点击外部关闭）
- **modal-toggle**: 隐藏的 checkbox（旧方法）
- **modal-open**: 保持打开状态的修饰符

---

### 6. Alert - 提示组件

用于提示消息（保存成功、删除确认等）。

#### 基础用法

```tsx
<div role="alert" className="alert">
  <span>默认提示消息</span>
</div>
```

#### 颜色变体

```tsx
<div role="alert" className="alert alert-info">
  <span>信息提示</span>
</div>

<div role="alert" className="alert alert-success">
  <span>成功提示</span>
</div>

<div role="alert" className="alert alert-warning">
  <span>警告提示</span>
</div>

<div role="alert" className="alert alert-error">
  <span>错误提示</span>
</div>
```

#### 样式变体

```tsx
// 柔和风格
<div role="alert" className="alert alert-soft">
  <span>柔和提示</span>
</div>

// 轮廓风格
<div role="alert" className="alert alert-outline">
  <span>轮廓提示</span>
</div>

// 虚线风格
<div role="alert" className="alert alert-dash">
  <span>虚线提示</span>
</div>
```

#### 带按钮的 Alert

```tsx
<div role="alert" className="alert alert-info">
  <span>确定要删除此配置吗？</span>
  <div>
    <button className="btn btn-sm">取消</button>
    <button className="btn btn-sm btn-primary">删除</button>
  </div>
</div>
```

#### 响应式布局

```tsx
<div role="alert" className="alert alert-vertical sm:alert-horizontal">
  <span>小屏垂直，大屏水平</span>
</div>
```

---

### 7. Input - 输入框组件

用于编辑参数名称和值。

#### 基础用法

```tsx
<input type="text" className="input input-bordered" />
```

#### 样式变体

```tsx
// 颜色
<input type="text" className="input input-primary" />
<input type="text" className="input input-secondary" />
<input type="text" className="input input-success" />
<input type="text" className="input input-warning" />
<input type="text" className="input input-error" />

// 尺寸
<input type="text" className="input input-xs" />
<input type="text" className="input input-sm" />
<input type="text" className="input input-md" />  // 默认
<input type="text" className="input input-lg" />

// 禁用
<input type="text" className="input input-disabled" disabled />
<input type="text" className="input" disabled />
```

#### 输入框组

```tsx
// 使用 join 组件分组
<div className="join">
  <input className="input input-bordered join-item" placeholder="用户名" />
  <span className="join-item">@</span>
  <input className="input input-bordered join-item" placeholder="域名" />
</div>
```

---

## 主题系统

### 内置主题

DaisyUI 提供了 30+ 内置主题：

- light, dark
- cupcake, bumblebee, emerald, corporate
- synthwave, retro, cyberpunk
- valentine, halloween, garden, forest
- aqua, lofi, pastel, fantasy, wireframe
- black, luxury, dracula
- cmyk, autumn, business, acid
- lemonade, night, coffee, winter
- dim, nord, sunset
- caramellatte, abyss, silk

### 本项目主题

项目已配置 **abyss** 主题：

```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      abyss: {
        DEFAULT: "#2C3047",
        50: "#f5f6f9",
        100: "#e8ebf2",
        // ... 完整的色板
      }
    }
  }
}
```

### 切换主题

```tsx
// 方法1：使用 Theme Controller
<input type="radio" name="theme" className="theme-controller" value="light" />
<input type="radio" name="theme" className="theme-controller" value="dark" />
<input type="radio" name="theme" className="theme-controller" value="abyss" />

// 方法2：使用 data-theme 属性
<html data-theme="abyss">
  <head>...</head>
</html>
```

---

## Tailwind 类名混合使用

### 基础规则

1. **DaisyUI 类名**：使用双下划线（如 `toggle`, `btn`）
2. **Tailwind 类名**：使用标准语法（如 `w-96`, `p-4`）
3. **同时使用**：直接混合，无需特殊处理

### 示例

```tsx
// 正确：混合使用
<div className="card bg-base-100 shadow-xl w-96 p-4">
  <div className="card-body">
    <h2 className="card-title text-xl font-bold">标题</h2>
    <button className="btn btn-primary w-full mt-4">
      保存
    </button>
  </div>
</div>

// 组合样式
<input type="checkbox" className="toggle toggle-primary w-12" />
<select className="select select-bordered w-full" />
<button className="btn btn-success hover:btn-success hover:brightness-110">
  提交
</button>
```

---

## Plasmo + DaisyUI 最佳实践

### 1. 组件命名规范

```tsx
// ✅ 推荐：语义化类名
<div className="card bg-base-100">
  <div className="card-body">
    <h2 className="card-title">标题</h2>
  </div>
</div>

// ❌ 避免：内联样式（除非必要）
<div style={{ backgroundColor: '#2C3047' }}>
  <h2 style={{ fontWeight: 'bold' }}>标题</h2>
</div>
```

### 2. 响应式设计

```tsx
// Popup 小屏优化
<div className="card w-[360px] p-4">
  <div className="flex flex-col sm:flex-row gap-4">
    <div className="w-full sm:w-1/2">左侧</div>
    <div className="w-full sm:w-1/2">右侧</div>
  </div>
</div>
```

### 3. 状态管理

```tsx
// 使用 React Hooks
import { useState, useEffect } from "react";

const [value, setValue] = useState("");
const [loading, setLoading] = useState(false);

useEffect(() => {
  // 组件加载时执行
}, []);
```

### 4. Chrome Storage 集成

```tsx
import { Storage } from "@plasmohq/storage";

// 读取存储
const storage = new Storage({
  config: {
    agents: [],
    combinations: [],
  },
});

const [agents, setAgents] = useState([]);

useEffect(() => {
  storage.get("agents").then(setAgents);
}, []);

// 保存到存储
const saveAgent = async (agent: Agent) => {
  await storage.set("agents", [...agents, agent]);
};
```

### 5. 类型安全

```tsx
// 定义接口
interface Agent {
  id: string;
  username: string;
}

interface Combination {
  id: string;
  title: string;
  agentId: string | null;
  portId: string | null;
  uriId: string | null;
  tailParameterIds: string[];
  optyParameterIds: string[];
  createdAt: string;
  updatedAt: string;
}

// 使用类型
const [selectedCombination, setSelectedCombination] =
  useState<Combination | null>(null);
```

---

## 常见组件组合

### 配置项卡片

```tsx
<div className="card bg-base-100 shadow-sm">
  <div className="card-body">
    <h3 className="card-title font-bold text-lg">配置项</h3>
    <div className="form-control w-full max-w-xs mt-4">
      <label className="label">
        <span className="label-text">参数名称</span>
        <input type="text" className="input input-bordered" />
      </label>
    </div>
    <div className="card-actions justify-end mt-4">
      <button className="btn btn-sm btn-error">删除</button>
      <button className="btn btn-sm btn-primary">保存</button>
    </div>
  </div>
</div>
```

### 参数切换行

```tsx
<div className="flex items-center justify-between p-2">
  <span className="font-medium">参数名</span>
  <input type="checkbox" className="toggle toggle-primary" />
</div>
```

### 模态对话框（确认删除）

```tsx
<button onClick={() => document.getElementById('delete_modal').showModal()}>
  删除
</button>

<dialog id="delete_modal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">确认删除</h3>
    <p className="py-4">确定要删除此配置吗？此操作无法撤销。</p>
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">取消</button>
        <button className="btn btn-error">删除</button>
      </form>
    </div>
  </div>
</dialog>
```

---

## 参考资源

- [DaisyUI 官网](https://daisyui.com)
- [DaisyUI GitHub](https://github.com/saadeghi/daisyui)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Plasmo 文档](https://docs.plasmo.com)

---

## 项目特定需求回顾

### Popup 页面需要的组件

1. **toggle** - T Force 参数切换
2. **select** - 组合配置选择
3. **card** - 配置详情展示
4. **btn** - 保存和跳转按钮
5. **alert** - 操作提示消息

### Options 页面需要的组件

1. **card** - 各类型数据的卡片展示
2. **input** - 添加/编辑表单
3. **btn** - 增删改操作按钮
4. **modal** - 确认对话框
5. **alert** - 提示消息
6. **select** - 下拉选择
7. **tabs/menu** - 侧边导航

---

## 使用指南

### 何时使用此技能

在以下情况下应该使用此技能：

1. 项目中使用 DaisyUI 组件
2. 需要查找组件的正确类名
3. 需要了解组件的变体和选项
4. 需要在 Plasmo 项目中集成 DaisyUI

### 如何使用此技能

1. 阅读相关组件的文档
2. 复制示例代码
3. 根据需求调整样式
4. 使用 Tailwind 类名自定义布局和间距
5. 保持类型安全和响应式设计

---

**注意事项：**

- DaisyUI 类名使用双下划线（`$$` 在文档中，实际使用时去掉 `$$`）
- 所有组件都是纯 CSS，无需 JavaScript 库
- 优先使用 DaisyUI 组件而非自定义样式
- 可以通过 Tailwind 类名进行细粒度自定义
- 确保无障碍支持（正确使用 ARIA 属性）
