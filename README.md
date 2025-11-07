# 面试测评工具（HR评估模块）

专业的候选人职业能力评估系统，支持岗位优先的测评流程、题库抽样、可选指标与综合报告导出，并新增 HR 面试评价模块。

## 本次更新摘要

- 流程优化：改为“先选择岗位”再按岗位核心指标自动调度测评，核心完成后可选择可选指标。
- 题库扩展与抽样：智力题库扩展至 100 题；每次测评按难度配额与使用频次权重抽样 10 题，减少高频重复。
- 新增测评：加入 EQ-沟通与共情能力测评，含 40 道主观题并评分标准化至 100 分。
- 导出增强：Excel 新增第一张“Fields”说明页与“Questions”完整题库页；保留“Summary”“Answers”“Recommendation”。
- 导航与安全：在关键页面加入“返回上一步”，提供确认提示避免误操作丢失数据。
- 面试评价模块：结果页支持 0-10 分评分与不少于 200 字反馈，自动保存草稿；新增评价记录列表页供 HR 查看。
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
6. 结果页底部可填写 HR 面试评价（0-10 分与 200 字以上反馈），支持自动草稿保存与历史记录查看。

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
