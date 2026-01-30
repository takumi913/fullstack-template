---
name: postmortem-create
description: 创建尸检报告。当用户修复了一个 bug、提交了 fix: 类型的 commit、或明确要求"创建尸检报告"、"写 postmortem"、"记录这个 bug"时触发。
---

# Postmortem 报告创建

## 触发条件

- 用户说"创建尸检报告"、"写 postmortem"、"记录这个 bug"
- 用户刚修复了一个 bug 并希望记录
- 用户提交了 fix: 类型的 commit

## 工作流程

### 1. 收集信息

执行以下命令获取上下文：

```bash
# 获取最近的 fix commit
git log --oneline --grep="^fix" -i -n 5

# 获取当前 staged 或最近 commit 的 diff
git diff --cached  # 或 git show HEAD
```

### 2. 生成报告 ID

格式：`PM-YYYYMMDD-NNN`

查找现有报告数量：
```bash
ls postmortem/PM-$(date +%Y%m%d)-*.md 2>/dev/null | wc -l
```

### 3. 分析并生成报告

读取 `postmortem/TEMPLATE.md` 获取模板格式。

报告必须包含：

| 字段 | 要求 |
|------|------|
| Bug ID | PM-YYYYMMDD-NNN 格式 |
| 严重程度 | Critical/High/Medium/Low |
| 问题描述 | 现象和影响 |
| 根本原因 | 使用 5-Whys 分析法 |
| 修复方案 | 代码变更详情 |
| 检测模式 | **关键** - 提取代码模式和关键词 |
| 预防措施 | 短期和长期措施 |

### 4. 检测模式要求

这是最重要的部分，用于未来的风险检测：

```markdown
## 检测模式

### 代码模式
// 展示可能触发此 bug 的代码片段
// 使用具体的代码示例

### 关键词
- keyword1
- keyword2
- keyword3
```

### 5. 保存报告

保存到 `postmortem/PM-YYYYMMDD-NNN.md`

### 6. 确认

告知用户报告已创建，并提示：
- 检查报告内容是否准确
- 补充遗漏的细节
- 考虑是否需要关联其他 postmortem

## 输出格式

使用中文编写，技术术语保持英文。直接输出 Markdown，不要代码块包装。
