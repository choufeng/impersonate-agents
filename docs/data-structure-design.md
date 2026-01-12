# 数据存储表结构设计

## 表结构概览

本项目需要存储以下几类数据，采用类似数据库表的结构进行组织：

---

### 1. Agent 表

存储用户代理（agent）的基本信息。

| 字段     | 类型   | 描述               |
| -------- | ------ | ------------------ |
| id       | string | agent 的唯一标识符 |
| username | string | agent 的用户名     |

---

### 2. 端口表 (Ports)

存储系统中使用的端口号。

| 字段        | 类型   | 描述                       |
| ----------- | ------ | -------------------------- |
| id          | string | 端口的唯一标识符           |
| port        | number | 端口号（例如：8080, 5432） |
| description | string | 端口用途说明（可选）       |

---

### 3. URI 表

存储系统使用的各种 URI。

| 字段        | 类型   | 描述                 |
| ----------- | ------ | -------------------- |
| id          | string | URI 的唯一标识符     |
| uri         | string | URI 地址             |
| description | string | URI 用途说明（可选） |

---

### 4. 尾部参数表 (Tail Parameters)

存储尾部参数的键值对。

| 字段  | 类型   | 描述             |
| ----- | ------ | ---------------- |
| id    | string | 参数的唯一标识符 |
| key   | string | 参数键           |
| value | string | 参数值           |

---

### 5. OPTY 参数表 (OPTY Parameters)

存储以 OPTY 开头的参数键值对。

| 字段  | 类型   | 描述                   |
| ----- | ------ | ---------------------- |
| id    | string | 参数的唯一标识符       |
| key   | string | 参数键（以 OPTY 开头） |
| value | string | 参数值                 |

---

### 6. 组合表 (Combinations)

将上述表中的数据组合成一个打包配置，便于快捷切换。

| 字段             | 类型           | 描述                             |
| ---------------- | -------------- | -------------------------------- |
| id               | string         | 组合的唯一标识符                 |
| title            | string         | 组合标题，描述当前的使用场景     |
| agentId          | string \| null | 引用的 agent ID（可选）          |
| portId           | string \| null | 引用的 port ID（可选）           |
| uriId            | string \| null | 引用的 URI ID（可选）            |
| tailParameterIds | string[]       | 引用的尾部参数 ID 列表（可选）   |
| optyParameterIds | string[]       | 引用的 OPTY 参数 ID 列表（可选） |
| createdAt        | string         | 创建时间                         |
| updatedAt        | string         | 更新时间                         |

---

## 数据结构示例

```typescript
// Agent
interface Agent {
  id: string;
  username: string;
}

// Port
interface Port {
  id: string;
  port: number;
  description?: string;
}

// URI
interface UriEntry {
  id: string;
  uri: string;
  description?: string;
}

// Tail Parameter
interface TailParameter {
  id: string;
  key: string;
  value: string;
}

// OPTY Parameter
interface OptyParameter {
  id: string;
  key: string; // Should start with "OPTY"
  value: string;
}

// Combination
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
```

---

## 设计考虑

- 所有表都包含 `id` 字段作为唯一标识符
- 可选字段（如 `description`）提供额外的上下文信息
- 键值对表（Tail Parameters, OPTY Parameters）支持灵活的参数配置
- OPTY 参数表专门用于存储以 "OPTY" 开头的参数，便于特殊处理
- 组合表（Combinations）通过外键 ID 引用其他表的数据，实现配置的快速切换和复用
- 组合表支持部分配置，并非所有字段都必须填入值
