# 面试测评工具（HR评估模块）

专业的候选人职业能力评估系统，支持岗位优先的测评流程、题库抽样、可选指标与综合报告导出；新增核心能力雷达图与 HR 面试评价（反馈选填）。

## 本次更新摘要

- 流程优化：改为“先选择岗位”再按岗位核心指标自动调度测评，核心完成后可选择可选指标。
- 题库扩展与抽样：智力题库扩展至 100 题；每次测评按难度配额与使用频次权重抽样 10 题，减少高频重复。
- 新增测评：加入 EQ-沟通与共情能力测评，含 40 道主观题并评分标准化至 100 分。
- 导出增强：Excel 新增第一张“Fields”说明页与“Questions”完整题库页；保留“Summary”“Answers”“Recommendation”。
- 导航与安全：在关键页面加入“返回上一步”，提供确认提示避免误操作丢失数据。
- 面试评价模块：结果页支持 0-10 分评分与“反馈意见（选填）”，自动保存草稿；新增评价记录列表页供 HR 查看。
- 可视化增强：新增“核心考察能力雷达图”，按岗位核心维度展示本次得分，支持响应式显示与图例标注。
- 缺陷修复：修复“开发”岗位在智力测评推进卡住的问题（推进以抽样题数为准，并加入题目渲染错误边界）。

## 运行方式
- 方式一（快速预览）：在项目根目录运行 `python3 -m http.server 8000 -d src`，访问 `http://localhost:8000/`
- 方式二（直接在 src 下预览）：进入 `src/` 目录运行 `python3 -m http.server 8001` 或 `8002`
- 若有 `npm` 脚本，可执行 `npm start`（取决于本地配置）

## 使用说明

1. 欢迎页点击“开始（先选择岗位）”，进入岗位选择页，并查看该岗位的核心测评清单。
2. 点击“开始核心测评”，系统按岗位核心指标队列依次进行测评；完成后进入可选指标页面。
3. 可在可选指标页勾选需要的测评类型或直接跳过。
4. 每项测评均为 10 题：
   - 客观题（智力/逻辑）：按题目难度计分，满分 100。
   - 主观题（责任心/开放性/乐观/EQ）：按评分表累加并标准化至 100。
5. 结果页展示分数、星级与岗位建议；可编辑建议内容并导出 PDF/Word/Excel。
6. 结果页底部可填写 HR 面试评价（0-10 分与“反馈意见（选填）”），支持自动草稿保存与历史记录查看。

## 功能模块

- 核心功能
  - 岗位优先流程：按岗位核心指标自动调度测评，支持可选指标扩展
  - 测评类型：智力、逻辑、责任心、开放性、乐观、EQ-沟通共情
  - 抽样与评分：每次 10 题，按难度与反频权重抽样，统一标准化至 100 分
  - 结果与建议：展示分数、星级与岗位建议，可编辑与导出
  - 核心能力雷达图：按岗位核心维度展示本次得分，含彩色图例
  - HR 面试评价：0-10 分评分；“反馈意见”字段为选填

- 辅助功能
  - 设置弹窗：管理岗位列表（名称、权重、拖拽排序），自动保存
  - 建议编辑器：按岗位覆盖默认建议模板，立即生效
  - 自动草稿保存：面试评价输入自动保存草稿并提示
  - 评价记录列表：快速查看历史评价记录

- 配置选项
  - `window.positionMetricsMap`：岗位到测评类型映射（core/optional）
  - `localStorage.positionsList`：岗位列表与权重（设置弹窗维护）
  - `localStorage.positionMetricsMap`：可覆盖默认映射（JSON）
  - `localStorage.lastAssessment`：最近一次测评结果快照
  - `localStorage.interviewEvaluation_<id>`：面试评价记录（`feedback` 允许为 `null`）
  - `localStorage.evaluationDraft_<id>`：评价草稿

- API 接口（如有）
  - 当前版本不依赖后端 API，所有逻辑在浏览器端执行
  - 若接入后端服务，建议：将评价表的 `feedback` 字段允许 `NULL`，去除最小长度校验

## 使用示例

```bash
# 方式一：快速预览（推荐）
python3 -m http.server 8000 -d src
# 打开 http://localhost:8000/

# 方式二：Electron 打包预览（可选）
npm ci
npm run build-mac   # macOS
# 或 npm run build-win  # Windows
```

体验流程：
- 在欢迎页选择“开始（先选择岗位）”，进入岗位选择页与核心测评清单
- 执行核心测评 → 可选指标（可跳过） → 结果页
- 查看分数与岗位建议、核心能力雷达图
- 填写 HR 面试评价（评分必填；反馈意见选填），保存或导出报告

## 截图预览

> 如图片未显示，请在 `docs/screenshots/` 目录补充实际截图文件。

- 欢迎页与岗位选择（`docs/screenshots/overview.png`）
- 核心测评进行中（`docs/screenshots/assessment.png`）
- 结果页与雷达图（`docs/screenshots/result_radar.png`）
- HR 面试评价（`docs/screenshots/interview_evaluation.png`）

## 最低运行要求

- 浏览器：现代浏览器（Chrome / Edge / Safari 最新版）
- 预览：macOS/Linux/Windows 可运行 `python3`（建议 3.8+）
- Electron 构建：Node.js 16+；macOS 需 Xcode Command Line Tools；Windows 需 NSIS（electron-builder 会提示安装）

## Excel 导出结构

- Fields：各 Sheet 与字段的中文说明，便于后续数据处理。
- Summary：测评类型、分数、星级、时间、岗位。
- Answers：抽样题的答题快照（序号、题目、选择索引、选择内容）。
- Recommendation：岗位建议文本（按行拆分）。
- Questions：当前测评类型完整题库（题目ID、文本、全部选项、难度、正确索引、主观评分数组）。

## 岗位与测评映射

- 默认映射见 `window.positionMetricsMap`，可在浏览器 `localStorage` 中用键 `positionMetricsMap` 覆盖（JSON）。
- 岗位列表设置可通过右上角齿轮按钮打开：支持增删改权重与拖拽排序（自动保存至 `localStorage.positionsList`）。

## 重要说明

- 智力测评推进逻辑以抽样题数组 `activeQuestions` 长度为准，避免与完整题库长度不一致导致卡住。
- 题目渲染加入错误边界：索引越界或题目为空时自动结束并提示。
- 浏览器端数据均存于 `localStorage`，包括：
  - `lastAssessment` 与 `lastAssessmentAnswers`
  - `usageCounts_<type>`（抽样反频权重）
  - `currentInterviewId` 与 `interviewEvaluation_<id>`（面试评价）
  - `evaluationDraft_<id>`（评价草稿）

## 目录结构

```
├── README.md
├── main.js
├── package-lock.json
├── package.json
└── src/
    ├── assessment.js
    ├── index.html
    └── styles.css
```

## 许可证

MIT License
