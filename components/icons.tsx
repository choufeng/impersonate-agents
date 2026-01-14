import {
  User,
  Network,
  Globe,
  Settings,
  Package,
  Wrench,
  Save,
  Rocket,
  Download,
  Upload,
  Edit,
  Trash2,
  Copy,
  UserCircle,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Check,
  X,
  RefreshCw,
} from "lucide-react";

// 类型定义
export interface IconProps {
  className?: string;
  size?: number;
  color?: string;
}

// 基础图标组件
const IconWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center justify-center ${className}`}>
    {children}
  </span>
);

// Agent 图标
export const AgentIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <User size={size} />
  </IconWrapper>
);

// Port 图标
export const PortIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Network size={size} />
  </IconWrapper>
);

// URI 图标
export const UriIcon: React.FC<IconProps> = ({ className = "", size = 20 }) => (
  <IconWrapper className={className}>
    <Globe size={size} />
  </IconWrapper>
);

// 尾参图标
export const TailParamIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Settings size={size} />
  </IconWrapper>
);

// OPTY 参数图标
export const OptyParamIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Wrench size={size} />
  </IconWrapper>
);

// 组合配置图标
export const CombinationIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Package size={size} />
  </IconWrapper>
);

// 设置图标
export const SettingsIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Settings size={size} />
  </IconWrapper>
);

// 保存图标
export const SaveIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Save size={size} />
  </IconWrapper>
);

// 跳转图标
export const RocketIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Rocket size={size} />
  </IconWrapper>
);

// 导出配置图标
export const ExportIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Download size={size} />
  </IconWrapper>
);

// 导入配置图标
export const ImportIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Upload size={size} />
  </IconWrapper>
);

// 编辑图标
export const EditIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Edit size={size} />
  </IconWrapper>
);

// 删除图标
export const DeleteIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Trash2 size={size} />
  </IconWrapper>
);

// 复制图标
export const CopyIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Copy size={size} />
  </IconWrapper>
);

// 用户头像图标
export const UserIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <UserCircle size={size} />
  </IconWrapper>
);

// 成功图标
export const SuccessIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <CheckCircle size={size} />
  </IconWrapper>
);

// 错误图标
export const ErrorIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <XCircle size={size} />
  </IconWrapper>
);

// 警告图标
export const WarningIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <AlertCircle size={size} />
  </IconWrapper>
);

// 信息图标
export const InfoIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Info size={size} />
  </IconWrapper>
);

// 箭头图标
export const ArrowRightIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <ChevronRight size={size} />
  </IconWrapper>
);

// 向下箭头图标
export const ChevronDownIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <ChevronDown size={size} />
  </IconWrapper>
);

// 向右箭头图标
export const ChevronRightIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <ChevronRight size={size} />
  </IconWrapper>
);

// 确认图标
export const CheckIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <Check size={size} />
  </IconWrapper>
);

// 取消图标
export const XIcon: React.FC<IconProps> = ({ className = "", size = 20 }) => (
  <IconWrapper className={className}>
    <X size={size} />
  </IconWrapper>
);

// 刷新图标
export const RefreshIcon: React.FC<IconProps> = ({
  className = "",
  size = 20,
}) => (
  <IconWrapper className={className}>
    <RefreshCw size={size} />
  </IconWrapper>
);

// 导航图标映射
export const navigationIcons = {
  agents: AgentIcon,
  ports: PortIcon,
  uris: UriIcon,
  "tail-parameters": TailParamIcon,
  "opty-parameters": OptyParamIcon,
  combinations: CombinationIcon,
};

// 状态图标映射
export const statusIcons = {
  success: SuccessIcon,
  error: ErrorIcon,
  warning: WarningIcon,
  info: InfoIcon,
};
