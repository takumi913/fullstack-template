---
name: postmortem-check
description: 检查代码变更风险。当用户准备提交代码、创建 PR、说"检查风险"、"pre-release check"、"会不会重蹈覆辙"时触发。分析当前变更是否可能触发历史已记录的 bug。
---

# Postmortem 风险检查

## 触发条件

- 用户说"检查风险"、"pre-release"、"会不会触发历史问题"
- 用户准备提交代码或创建 PR
- 用户完成功能开发，想确认安全性

## 工作流程

### 1. 获取当前变更

```bash
# 获取当前分支与 main 的差异
git diff origin/main...HEAD

# 获取变更的文件列表
git diff --name-only origin/main...HEAD

# 获取 commit 历史
git log --oneline origin/main...HEAD
```

### 2. 加载历史 Postmortem

读取 `postmortem/` 目录下所有 `PM-*.md` 文件，提取：

- **标题**：问题概述
- **检测模式/代码模式**：易错的代码片段
- **关键词**：用于匹配的核心词汇
- **根本原因**：问题的本质

### 3. 加载已接受的风险

检查 `postmortem/accepted-risks.json`（如存在）：
- 过滤掉已过期的接受记录
- 排除已接受的风险，避免误报

### 4. 风险分析

对比当前变更与历史模式：

| 检查项 | 说明 |
|--------|------|
| 关键词匹配 | 变更中是否包含历史问题的关键词 |
| 代码模式匹配 | 变更是否重复历史问题的代码模式 |
| 文件关联 | 变更的文件是否与历史问题相关 |
| 逻辑相似性 | 变更的逻辑是否与历史问题类似 |

### 5. 输出风险等级

```
risk_level: high | medium | low | none
```

| 等级 | 含义 | 建议 |
|------|------|------|
| high | 高度匹配历史问题模式 | 阻止提交，必须修复 |
| medium | 部分匹配，存在风险 | 建议 review |
| low | 轻微关联 | 注意即可 |
| none | 无风险 | 安全 |

### 6. 输出格式

```markdown
## 🔍 Postmortem 风险检查结果

### 风险等级：[HIGH/MEDIUM/LOW/NONE]

### 检测到的问题

| Postmortem ID | 风险描述 | 影响文件 | 建议 |
|---------------|----------|----------|------|
| PM-xxx | 描述 | file.go | 建议 |

### 总结
[总体评估]

### 下一步
- [ ] 检查项1
- [ ] 检查项2
```

## 注意事项

- 如果没有 postmortem 文件，提示用户先运行 onboarding
- 误报时建议用户使用 `accept-risk` 标记
- 高风险必须明确告知，不要模糊处理
