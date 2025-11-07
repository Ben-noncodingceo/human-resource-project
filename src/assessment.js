// 测评系统核心逻辑

class AssessmentSystem {
    constructor() {
        this.currentAssessment = null;
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.activeQuestions = []; // 本次测评抽样后的题目
        this.startTime = null;
        this.timeLimit = 5 * 60; // 5分钟
        this.timer = null;
        // 会话与岗位调度
        this.sessionMode = false;
        this.sessionQueue = [];
        this.sessionResults = [];
        this.currentPosition = null;
        
        this.assessmentTypes = {
            intelligence: {
                name: '智力测评',
                description: '评估认知能力和问题解决能力',
                questions: this.generateIntelligenceQuestions()
            },
            responsibility: {
                name: '责任心测评', 
                description: '评估责任感和工作态度',
                questions: this.generateResponsibilityQuestions()
            },
            openness: {
                name: '开放性测评',
                description: '评估创新思维和学习意愿',
                questions: this.generateOpennessQuestions()
            },
            optimism: {
                name: '乐观测评',
                description: '评估积极态度和情绪稳定性',
                questions: this.generateOptimismQuestions()
            },
            logic: {
                name: '逻辑能力测评',
                description: '评估逻辑思维和分析能力',
                questions: this.generateLogicQuestions()
            },
            eq_empathy: {
                name: '情商-沟通共情能力测评',
                description: '评估沟通理解、同理心与人际敏感度',
                questions: this.generateEQEmpathyQuestions()
            }
        };
    }

    // 生成智力测评题目（题库扩展至100，含难度分层与稳定ID）
    generateIntelligenceQuestions() {
        const bank = [];
        // 生成等差数列/等比数列题（难度1-2）
        for (let i = 1; i <= 30; i++) {
            const a1 = 2 + (i % 5);
            const d = 2 + (i % 4);
            const n = 5 + (i % 3);
            const seq = Array.from({ length: n }, (_, k) => a1 + k * d);
            const next = a1 + n * d;
            const opts = [next, next + d, next - d, next + 2 * d];
            bank.push({ id: `intel-ap-${i}`, question: `数列 ${seq.join(', ')} , ? 的下一个数字是：`, options: opts.map(v => String(v)), correct: 0, difficulty: i % 2 === 0 ? 1 : 2 });
        }
        // 生成逻辑蕴涵/否定题（难度2-3）
        for (let i = 1; i <= 30; i++) {
            const variants = [
                { P: '所有A都是B', Q: '所有B都是C', concl: '所有A都是C' },
                { P: '若X则Y', Q: '若Y则Z', concl: '若X则Z' },
                { P: '一些M是N', Q: '所有N都是O', concl: '一些M是O' },
            ];
            const v = variants[i % variants.length];
            const options = [v.concl, `所有C都是A`, '无法确定', `${v.P} 与 ${v.Q} 等价`];
            bank.push({ id: `intel-lo-${i}`, question: `${v.P}，且${v.Q}，可以推出：`, options, correct: 0, difficulty: i % 3 === 0 ? 3 : 2 });
        }
        // 生成函数复合与基础算术（难度1-2）
        for (let i = 1; i <= 20; i++) {
            const a = 1 + (i % 5);
            const b = 2 + (i % 7);
            const f = (x) => a * x + b;
            const x = 2 + (i % 4);
            const fx = f(f(x));
            const opts = [fx, fx + a, fx - b, fx + 2];
            bank.push({ id: `intel-fc-${i}`, question: `若f(x)=${a}x+${b}，求f(f(${x}))：`, options: opts.map(v => String(v)), correct: 0, difficulty: 2 });
        }
        // 生成组合与集合（难度2-3）
        for (let i = 1; i <= 20; i++) {
            const universe = 10 + (i % 5);
            const evens = Math.floor(universe / 2);
            const primes = 4 + (i % 3);
            const unionApprox = Math.min(universe, evens + primes - 2);
            const options = [String(universe), String(unionApprox), String(evens), '无法确定'];
            bank.push({ id: `intel-set-${i}`, question: `若全集U={1..${universe}}，A为偶数集合，B为质数集合，A∪B的元素个数约为：`, options, correct: 1, difficulty: i % 2 === 0 ? 3 : 2 });
        }
        return bank;
    }

    // 生成责任心测评题目
    generateResponsibilityQuestions() {
        return [
            {
                question: '当团队项目出现问题时，您通常会：',
                options: [
                    '主动承担责任并寻找解决方案',
                    '等待他人来处理',
                    '推卸责任给其他人',
                    '隐瞒问题不报告'
                ],
                scoring: [3, 1, 0, 0]
            },
            {
                question: '对于工作中的承诺，您的态度是：',
                options: [
                    '总是尽力按时完成',
                    '大部分情况下会完成',
                    '经常延期但会完成',
                    '经常无法完成承诺'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '当发现同事的工作错误时，您会：',
                options: [
                    '及时提醒并帮助改正',
                    '报告给上级',
                    '装作没看见',
                    '利用这个错误为自己谋利'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '面对工作中的挑战，您通常：',
                options: [
                    '主动迎接挑战',
                    '在指导下接受挑战',
                    '尽量避免挑战',
                    '拒绝接受挑战'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对于工作质量，您的标准是：',
                options: [
                    '追求完美，精益求精',
                    '达到基本要求即可',
                    '差不多就行',
                    '能交差就可以'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '当项目进度落后时，您会：',
                options: [
                    '主动加班并协调资源补位',
                    '等待安排，按时工作即可',
                    '推迟交付并解释原因',
                    '不予理会'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对于流程规范，您的态度是：',
                options: ['严格遵守并优化', '大体遵守', '偶尔忽略', '经常忽略'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '遇到跨部门协作问题时，您会：',
                options: ['主动沟通并设定共识', '在领导协调下沟通', '等待对方主动联系', '不主动沟通'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对于个人任务追踪，您：',
                options: ['有完善的待办与提醒机制', '偶尔记录', '很少记录', '不做记录'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '当出现质量问题时，您：',
                options: ['第一时间止损并复盘', '报告并等待处理', '降低标准交付', '忽略问题'],
                scoring: [3, 2, 1, 0]
            }
        ];
    }

    // 生成开放性测评题目
    generateOpennessQuestions() {
        return [
            {
                question: '面对新的工作方法，您的态度是：',
                options: [
                    '积极学习并尝试应用',
                    '在了解后考虑使用',
                    '保持观望态度',
                    '坚持使用老方法'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对于不同的观点，您通常：',
                options: [
                    '认真倾听并思考其合理性',
                    '选择性接受部分观点',
                    '不太在意他人观点',
                    '强烈反对不同观点'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '在创意brainstorming中，您：',
                options: [
                    '积极提出各种想法',
                    '在他人启发下提出想法',
                    '很少提出想法',
                    '认为这是在浪费时间'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '面对变化的工作环境，您：',
                options: [
                    '快速适应并找到新方法',
                    '需要一段时间适应',
                    '感到不安和抗拒',
                    '强烈反对变化'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对于跨文化交流，您：',
                options: [
                    '很感兴趣并积极参与',
                    '愿意参与但有所保留',
                    '勉强参与',
                    '尽量避免'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '当产品试错时，您：',
                options: ['鼓励试验并记录结果', '谨慎试验', '尽量避免试验', '反对试验'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '学习新技术时，您：',
                options: ['主动规划学习路线', '跟随团队学习', '被动接触', '拒绝学习'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '参与跨职能项目时，您：',
                options: ['主动承担学习曲线', '在指导下参与', '尽量不参与', '拒绝参与'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对用户反馈，您：',
                options: ['深入分析并快速迭代', '选择性采纳', '不太重视', '忽略反馈'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对创新评审，您：',
                options: ['积极参与并提出方案', '参与但较少发言', '偶尔参与', '不参与'],
                scoring: [3, 2, 1, 0]
            }
        ];
    }

    // 生成乐观测评题目
    generateOptimismQuestions() {
        return [
            {
                question: '面对失败，您通常会：',
                options: [
                    '从中学习并看到改进机会',
                    '分析原因避免重蹈覆辙',
                    '感到沮丧但会恢复',
                    '认为自己总是失败'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对于未来的职业发展，您：',
                options: [
                    '充满信心和期待',
                    '谨慎乐观',
                    '有些担忧',
                    '感到很悲观'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '当遇到困难时，您：',
                options: [
                    '相信一定能找到解决办法',
                    '努力寻找解决方案',
                    '希望问题能自行解决',
                    '认为问题无法解决'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对于团队的前景，您：',
                options: [
                    '非常乐观',
                    '比较乐观',
                    '不太确定',
                    '比较悲观'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '面对批评，您：',
                options: [
                    '积极接受并改进',
                    '选择性接受',
                    '感到受伤但会调整',
                    '完全否定自己'
                ],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '当出现突发事件时，您：',
                options: ['冷静处理并快速反应', '寻求帮助后处理', '等待形势好转', '放弃处理'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对业绩不达标，您：',
                options: ['制定纠偏计划并执行', '与团队沟通调整', '期待自然恢复', '接受现状'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '面对压力峰值，您：',
                options: ['积极分解任务与排期', '寻求支持', '被动拖延', '拒绝任务'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '收到负面反馈时，您：',
                options: ['及时复盘并调整', '选择性采纳', '不予理会', '情绪化反应'],
                scoring: [3, 2, 1, 0]
            },
            {
                question: '对长期目标，您：',
                options: ['坚定执行与跟踪', '阶段性检查', '偶尔回顾', '不做规划'],
                scoring: [3, 2, 1, 0]
            }
        ];
    }

    // 生成逻辑能力测评题目
    generateLogicQuestions() {
        return [
            {
                question: '如果A→B，B→C，那么可以推出：',
                options: ['A→C', 'C→A', 'A↔C', '无法确定'],
                correct: 0,
                difficulty: 2
            },
            {
                question: '所有程序员都会编程，张三会编程，那么：',
                options: [
                    '张三是程序员',
                    '张三可能是程序员',
                    '张三不是程序员', 
                    '无法确定'
                ],
                correct: 1,
                difficulty: 3
            },
            {
                question: '数列 1, 1, 2, 3, 5, ? 的下一个数字是：',
                options: ['7', '8', '9', '10'],
                correct: 1,
                difficulty: 2
            },
            {
                question: '如果"所有鸟都会飞"为假，那么：',
                options: [
                    '有些鸟不会飞',
                    '所有鸟都不会飞',
                    '只有一只鸟不会飞',
                    '无法确定'
                ],
                correct: 0,
                difficulty: 3
            },
            {
                question: 'A、B、C三人中有一人说谎。A说："B说谎"，B说："C说谎"，C说："A和B都说谎"。谁说谎？',
                options: ['A', 'B', 'C', '无法确定'],
                correct: 1,
                difficulty: 3
            },
            {
                question: '若存在命题P∧Q为真，且P为假，则Q：',
                options: ['必为真', '必为假', '不确定', '与P等价'],
                correct: 1,
                difficulty: 3
            },
            {
                question: '集合推理：若全集U={1..10}，A为偶数集合，B为质数集合，A∪B的元素个数约为：',
                options: ['10', '8', '7', '6'],
                correct: 2,
                difficulty: 3
            },
            {
                question: '若f(x)=x^2，g(x)=2x+1，求f(g(3))：',
                options: ['49', '36', '25', '64'],
                correct: 0,
                difficulty: 2
            },
            {
                question: '命题逻辑：¬(P∨Q)等价于：',
                options: ['¬P∨¬Q', '¬P∧¬Q', 'P∨Q', 'P∧Q'],
                correct: 1,
                difficulty: 3
            },
            {
                question: '推理：若“若参加训练则成绩提升”为真，且成绩未提升，则可以推断：',
                options: ['参加了训练', '未参加训练', '无法判断', '提升了其它能力'],
                correct: 1,
                difficulty: 3
            }
        ];
    }

    // 开始测评
    startAssessment(type) {
        this.currentAssessment = type;
        this.currentQuestionIndex = 0;
        this.answers = [];
        // 生成抽样题目（10题，难度覆盖与权重避免高频）
        this.activeQuestions = this.sampleQuestions(type, 10);
        this.startTime = Date.now();
        this.startTimer();
        try { console.info('开始测评', { type, count: this.activeQuestions.length }); } catch (e) {}
        this.showQuestion();
    }

    // 显示题目
    showQuestion() {
        const assessment = this.assessmentTypes[this.currentAssessment];
        const question = this.activeQuestions[this.currentQuestionIndex];
        
        if (!question) {
            console.error('题目渲染失败：索引越界或题目为空', {
                type: this.currentAssessment,
                index: this.currentQuestionIndex,
                total: this.activeQuestions ? this.activeQuestions.length : 0
            });
            try { alert('题目加载出现异常，已自动结束当前测评'); } catch (e) {}
            this.finishAssessment();
            return;
        }
        document.getElementById('assessmentTitle').textContent = assessment.name;
        // 选项随机分布（保留原始索引用于评分）
        const optionData = question.options.map((opt, idx) => ({ text: opt, idx }));
        for (let i = optionData.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionData[i], optionData[j]] = [optionData[j], optionData[i]];
        }

        const container = document.getElementById('questionContainer');
        container.innerHTML = `
            <div class="question-container">
                <div class="question-text">${this.currentQuestionIndex + 1}. ${question.question}</div>
                <div class="answer-options">
                    ${optionData.map((option) => `
                        <div class="answer-option">
                            <input type="radio" id="option${option.idx}" name="answer" value="${option.idx}">
                            <label for="option${option.idx}">${option.text}</label>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        this.updateProgress();
        this.updateNavigationButtons();
    }

    // 下一题
    nextQuestion() {
        const selectedAnswer = document.querySelector('input[name="answer"]:checked');
        if (!selectedAnswer) {
            alert('请选择一个答案');
            return;
        }

        this.answers.push(parseInt(selectedAnswer.value));
        
        if (this.currentQuestionIndex < this.activeQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.showQuestion();
        } else {
            this.finishAssessment();
        }
    }

    // 上一题
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.answers.pop();
            this.showQuestion();
        }
    }

    // 更新进度条
    updateProgress() {
        const totalQuestions = this.activeQuestions.length;
        const progress = ((this.currentQuestionIndex + 1) / totalQuestions) * 100;
        document.getElementById('progressBar').style.width = progress + '%';
    }

    // 更新导航按钮
    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        
        prevBtn.disabled = this.currentQuestionIndex === 0;
        
        const totalQuestions = this.activeQuestions.length;
        if (this.currentQuestionIndex === totalQuestions - 1) {
            nextBtn.textContent = '完成测评';
        } else {
            nextBtn.textContent = '下一题';
        }
    }

    // 开始计时器
    startTimer() {
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const remaining = this.timeLimit - elapsed;
            
            if (remaining <= 0) {
                this.finishAssessment();
                return;
            }
            
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            document.getElementById('timerDisplay').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // 完成测评
    finishAssessment() {
        clearInterval(this.timer);
        const score = this.calculateScore();
        try { console.info('完成测评', { type: this.currentAssessment, score, answersCount: this.answers.length }); } catch (e) {}
        // 保存答题快照用于导出（基于抽样题）
        const snapshot = this.answers.map((ansIdx, i) => ({
            question: this.activeQuestions[i].question,
            selectedIndex: ansIdx,
            selectedText: this.activeQuestions[i].options[ansIdx]
        }));
        localStorage.setItem('lastAssessmentAnswers', JSON.stringify(snapshot));

        // 更新使用频次权重
        try {
            const key = `usageCounts_${this.currentAssessment}`;
            const usage = JSON.parse(localStorage.getItem(key) || '{}');
            this.activeQuestions.forEach(q => {
                usage[q.id] = (usage[q.id] || 0) + 1;
            });
            localStorage.setItem(key, JSON.stringify(usage));
        } catch (e) {}

        // 会话模式：记录并调度下一项或展示汇总/可选指标
        this.sessionResults.push({ type: this.currentAssessment, score, answers: this.answers.slice(), questions: this.activeQuestions.slice() });
        if (this.sessionMode && this.sessionQueue.length > 0) {
            const nextType = this.sessionQueue.shift();
            // 若核心完成且进入可选阶段，渲染可选指标页面
            if (nextType === '__OPTIONAL__') {
                this.showOptionalMetricsPage();
                return;
            }
            // 切换到下一个测评
            this.currentQuestionIndex = 0;
            this.answers = [];
            this.startAssessment(nextType);
            return;
        }

        // 非会话或会话结束：展示结果与建议
        this.showResults(score);
    }

    // 计算分数
    calculateScore() {
        const assessment = this.assessmentTypes[this.currentAssessment];
        let score = 0;
        
        if (this.currentAssessment === 'intelligence' || this.currentAssessment === 'logic') {
            // 客观题评分
            this.answers.forEach((answer, index) => {
                if (answer === this.activeQuestions[index].correct) {
                    score += (this.activeQuestions[index].difficulty || 2) * 20;
                }
            });
            score = Math.min(100, score);
        } else {
            // 主观题评分
            this.answers.forEach((answer, index) => {
                score += this.activeQuestions[index].scoring[answer];
            });
            score = (score / (this.answers.length * 3)) * 100;
        }
        
        return Math.round(score);
    }

    // 显示结果
    showResults(score) {
        document.getElementById('assessmentPage').classList.add('d-none');
        document.getElementById('resultPage').classList.remove('d-none');
        
        const stars = Math.ceil(score / 20);
        const starDisplay = '★'.repeat(stars) + '☆'.repeat(5 - stars);
        
        document.getElementById('scoreDisplay').innerHTML = `
            <div class="score-display">${score}分</div>
            <div class="score-stars">${starDisplay}</div>
            <p class="text-muted">5分制评分：${stars}/5</p>
        `;
        
        // 保存结果到本地存储
        localStorage.setItem('lastAssessment', JSON.stringify({
            type: this.currentAssessment,
            score: score,
            stars: stars,
            timestamp: Date.now()
        }));
        // 设置本次会话的面试记录ID（用于评价关联）
        try {
            const interviewId = `${this.currentPosition || 'unknown'}_${Date.now()}`;
            localStorage.setItem('currentInterviewId', interviewId);
        } catch (e) {}

        // 初始化评价模块（在结果页渲染时）
        try {
            if (window.initEvaluationModule) window.initEvaluationModule();
            if (window.renderCoreRadarChart) window.renderCoreRadarChart();
        } catch (e) {}

        // 若为会话模式，渲染汇总表并保留建议编辑与导出
        if (this.sessionMode) {
            this.renderSessionSummary();
        }
    }

    // 生成职位建议（结构化升级版）
    generateRecommendation(position, assessmentType, score) {
        const baseTemplates = {
            developer: { name: '软件开发工程师', cert: 'AWS/Azure/阿里云开发者认证', domain: '微服务/后端架构', conf: 'QCon/ArchSummit', report: '技术方案评审' },
            designer: { name: 'UI/UX设计师', cert: 'NN/g UX认证或阿里巴巴UX训练营', domain: '用户研究/交互设计', conf: 'IxDA/UXPA', report: '用户研究报告' },
            manager: { name: '项目经理', cert: 'PMP/敏捷Scrum认证', domain: '项目管理/跨部门协作', conf: 'PMI大会/敏捷大会', report: '项目复盘报告' },
            sales: { name: '销售代表', cert: 'SPIN销售/认证顾问培训', domain: '客户开拓/方案打磨', conf: '行业展会/峰会路演', report: '销售漏斗分析' },
            analyst: { name: '数据分析师', cert: '数据分析师(DA)/SQL专项认证', domain: 'BI建模/统计分析', conf: 'PyCon/数据智能峰会', report: '数据洞察报告' },
            hr: { name: '人力资源专员', cert: 'HRCI/企业人才盘点认证', domain: '人才招聘/组织发展', conf: '人力资源发展大会', report: '人才盘点/招聘分析' },
        };

        const level = score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'average' : 'poor';

        // 权重系数读取
        const positionsList = JSON.parse(localStorage.getItem('positionsList') || '[]');
        const weight = positionsList.find(p => p.id === position)?.weight ?? 0.6;

        // 数量动态缩放（最低基线）
        const scale = (base) => Math.max(base, Math.round(base * weight));
        const posMeta = baseTemplates[position] || { name: '目标岗位', cert: '行业认证', domain: '相关领域', conf: '行业会议', report: '业务报告' };

        // KPI建议按岗位类型细化
        const kpiByRole = {
            developer: [
                `代码质量：单元测试覆盖率≥${Math.min(85, 70 + Math.round(10 * weight))}%`,
                `交付效率：两周迭代完成功能≥${scale(2)}项`,
                `故障率：线上缺陷率≤${Math.max(0.5, (1 - weight) * 2).toFixed(2)}%`
            ],
            designer: [
                `设计产出：每月完成高保真原型≥${scale(2)}套`,
                `用户验证：每月可用性测试≥${scale(2)}次，满意度≥${Math.min(90, 80 + Math.round(10 * weight))}%`,
                `交互规范：完善组件库并提交规范更新≥${scale(1)}次/月`
            ],
            manager: [
                `进度达成：里程碑按时交付率≥${Math.min(95, 85 + Math.round(10 * weight))}%`,
                `风险控制：关键风险识别与缓释方案≥${scale(3)}项/月`,
                `团队健康：成员满意度≥${Math.min(90, 80 + Math.round(10 * weight))}%`
            ],
            sales: [
                `业绩目标：季度新签合同≥${scale(3)}个`,
                `线索管理：有效商机转化率≥${Math.min(35, 25 + Math.round(10 * weight))}%`,
                `客户维系：NPS净推荐值≥${Math.min(60, 40 + Math.round(15 * weight))}`
            ],
            analyst: [
                `分析输出：每月完成专项分析报告≥${scale(2)}份`,
                `数据质量：数据误差率≤${Math.max(1.0, (1 - weight) * 3).toFixed(1)}%`,
                `洞察贡献：推动业务策略改进建议≥${scale(2)}项/月`
            ],
            hr: [
                `招聘效率：关键岗位平均招聘周期≤${Math.max(25, 35 - Math.round(10 * weight))}天`,
                `组织发展：季度人才盘点覆盖≥${Math.min(90, 70 + Math.round(15 * weight))}%`,
                `员工关系：核心人群留存率≥${Math.min(95, 85 + Math.round(8 * weight))}%`
            ]
        };

        const kpis = kpiByRole[position] || [
            `目标达成：关键工作指标按计划完成率≥${Math.min(90, 75 + Math.round(10 * weight))}%`
        ];

        // 根据测评类型附加一句亮点/改进建议
        const typeTrait = {
            intelligence: { excellent: '认知与学习能力突出，适合承担高复杂度任务。', poor: '建议补足基础知识与系统性训练。' },
            logic: { excellent: '逻辑推理能力强，适合结构化问题求解。', poor: '建议训练结构化思维与因果分析。' },
            responsibility: { excellent: '责任心强，适合承担关键职责与目标。', poor: '建议强化承诺管理与过程监督。' },
            openness: { excellent: '开放创新，适合探索式任务与新方案。', poor: '建议增加外部输入与创意练习。' },
            optimism: { excellent: '心态积极，利于团队协作与压力管理。', poor: '建议开展情绪管理与复盘训练。' },
            eq_empathy: { excellent: '沟通与共情能力强，适合高协作与客户互动场景。', poor: '建议加强倾听技巧与非暴力沟通训练。' }
        };
        const traitSummary = typeTrait[assessmentType]?.[level] || '整体表现稳定，可通过持续训练提升上限。';

        const contactsPerMonth = Math.max(5, Math.round(5 * weight));
        const studyHoursPerWeek = Math.max(5, Math.round(5 * weight));
        const conferencesCount = Math.max(3, Math.round(3 * weight));
        const reportsPerMonth = Math.max(2, Math.round(2 * weight));

        const recommendation = `
            <div>
                <p><strong>针对 ${posMeta.name} 岗位，建议采取以下行动方案：</strong></p>
                <ol>
                    <li>技能提升：在90天内完成 ${posMeta.cert} 认证（需通过官方考试，分数≥85分）。</li>
                    <li>项目实践：主导或参与至少1个 ${posMeta.domain} 项目（需产出可展示的成果文档）。</li>
                    <li>行业交流：参加 ${posMeta.conf} 等${conferencesCount}场行业活动（每次需收集10+名片并做会议纪要）。</li>
                    <li>量化指标：每月产出 ${posMeta.report} 报告${reportsPerMonth}份，阅读行业白皮书3篇（需做读书笔记）。</li>
                    <li>人脉建设：通过LinkedIn每月新增${contactsPerMonth}位行业联系人（需建立持续沟通关系）。</li>
                </ol>
                <p><strong>具体学习路径：</strong> 每周至少${studyHoursPerWeek}小时专项学习，包含：体系化课程（40%）、项目实战（40%）、复盘总结（20%）。</p>
                <p><strong>KPI建议：</strong></p>
                <ul>
                    ${kpis.map(k=>`<li>${k}</li>`).join('')}
                </ul>
                <p><strong>测评解读：</strong> ${traitSummary}（当前分数：${score}，权重系数：${weight}）。</p>
            </div>
        `;

        return recommendation;
    }

    // —— 新增：EQ-沟通共情题库（主观量表，约40题） ——
    generateEQEmpathyQuestions() {
        const stems = [
            '我能迅速理解他人的感受并作出回应',
            '在对话中我能注意到对方的非语言信号',
            '当他人表达困难时我会主动提供支持',
            '我会用对方能接受的方式表达不同意见',
            '我能在紧张场景保持冷静与尊重',
            '我经常换位思考来理解他人动机',
            '我能识别团队情绪并调整沟通策略',
            '我善于总结对方观点以确保理解一致',
            '我会在冲突后主动修复关系',
            '我乐于倾听并给出建设性反馈',
            '我能把复杂信息讲解得简明易懂',
            '我会观察对方反应并适时停顿或追问',
            '我能在不同文化背景下保持敏感与包容',
            '我会避免打断他人，鼓励其完整表达',
            '我能识别误解并及时澄清',
            '我会根据对方性格调整沟通方式',
            '我能在团队内化解误会与紧张氛围',
            '我愿意承认自己的沟通失误并改进',
            '我能引导对话聚焦于问题而非情绪',
            '我能在反馈中兼顾事实与情感',
            '我能迅速建立融洽的初次关系',
            '我在会议中注意让每个人都有发言机会',
            '我会用具体例子帮助对方理解建议',
            '我能发现对方真正的顾虑并回应',
            '我在面对挑衅时能保持专业',
            '我能为不同利益相关者找到共同点',
            '我会记录沟通要点并后续跟进',
            '我能识别并避免引发防御性的表达',
            '我擅长主持困难对话并达成共识',
            '我能通过提问帮助对方梳理思路',
            '我在跨部门沟通中能建立信任',
            '我能及时察觉并回应客户情绪变化',
            '我会主动复盘沟通成效并持续改进',
            '我能识别潜在冲突并提前介入',
            '我能在远程沟通中保持清晰与温度',
            '我会对情绪化表达保持耐心并引导',
            '我能在高压场景中维持合作氛围',
            '我在双赢思维下推进谈判',
            '我能通过故事化表达增强说服力',
            '我能及时表达感谢与认可'
        ];
        return stems.map((s, idx) => ({
            id: `eq-${idx+1}`,
            question: s,
            options: ['非常符合', '比较符合', '一般', '不太符合'],
            scoring: [3, 2, 1, 0]
        }));
    }

    // —— 题目抽样（难度覆盖+权重避免高频） ——
    sampleQuestions(type, count = 10) {
        const full = this.assessmentTypes[type].questions;
        // 确保每题有ID
        const normalized = full.map((q, i) => ({ id: q.id || `${type}-${i}-${(q.question||'').slice(0,10)}`, ...q }));
        // 读取使用频次；次数越多，抽样权重越低
        let usage = {};
        try { usage = JSON.parse(localStorage.getItem(`usageCounts_${type}`) || '{}'); } catch (e) {}
        // 按难度分桶（主观题可能无difficulty，视为2）
        const buckets = { 1: [], 2: [], 3: [] };
        normalized.forEach(q => {
            const d = q.difficulty || 2;
            const u = usage[q.id] || 0;
            const weight = 1 / (1 + u); // 简单反频权重
            buckets[d].push({ ...q, __w: weight });
        });
        // 难度配额：3易、4中、3难（可按需调整）
        const quota = { 1: 3, 2: 4, 3: 3 };
        const result = [];
        const pickFrom = (arr, k) => {
            // 加权随机不放回
            const chosen = [];
            const pool = arr.slice();
            for (let i = 0; i < k && pool.length > 0; i++) {
                const totalW = pool.reduce((sum, it) => sum + (it.__w || 1), 0);
                let r = Math.random() * totalW;
                let idx = 0;
                for (; idx < pool.length; idx++) {
                    r -= (pool[idx].__w || 1);
                    if (r <= 0) break;
                }
                chosen.push(pool[idx]);
                pool.splice(idx, 1);
            }
            return chosen;
        };
        result.push(...pickFrom(buckets[1], quota[1]));
        result.push(...pickFrom(buckets[2], quota[2]));
        result.push(...pickFrom(buckets[3], quota[3]));
        // 若题库不足或某难度数量不足，补齐至count
        const flat = [...buckets[1], ...buckets[2], ...buckets[3]];
        while (result.length < count && flat.length > 0) {
            // 从剩余中继续加权抽取
            const totalW = flat.reduce((s, it) => s + (it.__w || 1), 0);
            let r = Math.random() * totalW;
            let idx = 0;
            for (; idx < flat.length; idx++) {
                r -= (flat[idx].__w || 1);
                if (r <= 0) break;
            }
            result.push(flat[idx]);
            flat.splice(idx, 1);
        }
        return result.map(({ __w, ...q }) => q);
    }

    // —— 会话调度：岗位核心与可选指标 ——
    startPositionCoreFlow(positionId) {
        this.sessionMode = true;
        this.sessionQueue = [];
        this.sessionResults = [];
        this.currentPosition = positionId;
        // 读取岗位->指标映射
        const map = (window.positionMetricsMap) || {};
        const cfg = map[positionId] || { core: ['intelligence','logic','responsibility'], optional: ['eq_empathy','openness','optimism'] };
        // 安排核心测评顺序
        this.sessionQueue = [...cfg.core];
        // 在核心后插入一个可选阶段标识
        this.sessionQueue.push('__OPTIONAL__');
        // 切换页面并启动
        document.getElementById('positionFlowPage').classList.add('d-none');
        document.getElementById('assessmentPage').classList.remove('d-none');
        const first = this.sessionQueue.shift();
        this.startAssessment(first);
    }

    showOptionalMetricsPage() {
        // 渲染可选指标复选框
        const map = (window.positionMetricsMap) || {};
        const cfg = map[this.currentPosition] || { optional: ['eq_empathy','openness','optimism'] };
        const container = document.getElementById('optionalMetricsContainer');
        container.innerHTML = (cfg.optional || []).map(t => {
            const name = this.assessmentTypes[t]?.name || t;
            return `<div class="form-check"><input class="form-check-input" type="checkbox" id="opt-${t}" value="${t}"><label class="form-check-label" for="opt-${t}">${name}</label></div>`;
        }).join('') || '<div class="text-muted">暂无可选指标</div>';
        // 切换到可选指标页面
        document.getElementById('assessmentPage').classList.add('d-none');
        document.getElementById('optionalMetricsPage').classList.remove('d-none');
    }

    startOptionalFlow(types) {
        // 将所选类型加入队列并开始下一项
        document.getElementById('optionalMetricsPage').classList.add('d-none');
        document.getElementById('assessmentPage').classList.remove('d-none');
        this.sessionQueue = [...types];
        if (this.sessionQueue.length === 0) {
            this.finishSessionAndShowSummary();
            return;
        }
        const next = this.sessionQueue.shift();
        this.startAssessment(next);
    }

    finishSessionAndShowSummary() {
        // 结束会话，展示汇总
        this.sessionQueue = [];
        document.getElementById('optionalMetricsPage').classList.add('d-none');
        document.getElementById('assessmentPage').classList.add('d-none');
        document.getElementById('resultPage').classList.remove('d-none');
        this.renderSessionSummary();
    }

    renderSessionSummary() {
        const table = document.getElementById('summaryTable');
        if (!table) return;
        if (!this.sessionResults || this.sessionResults.length === 0) { table.classList.add('d-none'); return; }
        const rows = this.sessionResults.map((r, i) => `<tr><td>${i+1}</td><td>${this.assessmentTypes[r.type]?.name || r.type}</td><td>${r.score}</td></tr>`).join('');
        table.innerHTML = `
            <h5 class="mb-2">本次会话汇总</h5>
            <table class="table table-striped"><thead><tr><th>#</th><th>测评类型</th><th>分数</th></tr></thead><tbody>${rows}</tbody></table>
        `;
        table.classList.remove('d-none');
        try {
            if (window.renderCoreRadarChart) window.renderCoreRadarChart();
        } catch (e) {}
    }
}

// 全局变量
// 默认岗位与核心/可选指标映射（可通过后台或localStorage覆盖）
window.positionMetricsMap = (function() {
    try {
        const stored = localStorage.getItem('positionMetricsMap');
        if (stored) return JSON.parse(stored);
    } catch (e) {}
    return {
        developer: { core: ['intelligence','logic','responsibility'], optional: ['eq_empathy','openness','optimism'] },
        designer:  { core: ['openness','responsibility','optimism'], optional: ['eq_empathy','intelligence','logic'] },
        manager:   { core: ['responsibility','logic','optimism'], optional: ['eq_empathy','openness','intelligence'] },
        sales:     { core: ['optimism','responsibility','openness'], optional: ['eq_empathy','intelligence','logic'] },
        analyst:   { core: ['logic','intelligence','responsibility'], optional: ['eq_empathy','openness','optimism'] },
        hr:        { core: ['responsibility','eq_empathy','optimism'], optional: ['openness','logic','intelligence'] },
    };
})();

let assessmentSystem = new AssessmentSystem();

// 更新职位建议
function updateRecommendation() {
    const position = document.getElementById('positionSelect').value;
    const recommendationDiv = document.getElementById('recommendation');
    
    if (!position) {
        recommendationDiv.classList.add('d-none');
        return;
    }
    
    const lastAssessment = JSON.parse(localStorage.getItem('lastAssessment'));
    if (lastAssessment) {
        let recommendation = assessmentSystem.generateRecommendation(
            position, 
            lastAssessment.type, 
            lastAssessment.score
        );
        // 应用HR自定义覆盖（后台编辑）
        try {
            const overrides = JSON.parse(localStorage.getItem('recommendationOverrides') || '{}');
            if (overrides && overrides[position]) {
                recommendation = overrides[position];
            }
        } catch (e) {}
        
        recommendationDiv.innerHTML = `
            <div class="d-flex align-items-center justify-content-between mb-2">
                <h5 class="mb-0"><strong>面试/入职建议：</strong></h5>
                <button class="btn btn-sm btn-outline-secondary" onclick="openRecommendationEditor()" title="编辑建议">
                    <span class="material-symbols-outlined" style="font-size:20px; vertical-align:middle;">settings</span>
                </button>
            </div>
            <p class="recommendation-text">${recommendation}</p>
            <hr>
            <small class="text-muted">
                基于${assessmentSystem.assessmentTypes[lastAssessment.type].name}结果：
                ${lastAssessment.score}分 (${lastAssessment.stars}/5星)
            </small>
        `;
        recommendationDiv.classList.remove('d-none');
    }
}

// 页面导航函数
function showAssessmentSelection() {
    document.getElementById('welcomePage').classList.add('d-none');
    document.getElementById('assessmentSelection').classList.remove('d-none');
}

function startAssessment(type) {
    document.getElementById('assessmentSelection').classList.add('d-none');
    document.getElementById('assessmentPage').classList.remove('d-none');
    assessmentSystem.startAssessment(type);
}

function nextQuestion() {
    assessmentSystem.nextQuestion();
}

function previousQuestion() {
    assessmentSystem.previousQuestion();
}

function startNewAssessment() {
    document.getElementById('resultPage').classList.add('d-none');
    document.getElementById('welcomePage').classList.remove('d-none');
}

function exportReport() {
    const lastAssessment = JSON.parse(localStorage.getItem('lastAssessment'));
    if (lastAssessment) {
        const report = `
面试测评报告
================
测评类型: ${assessmentSystem.assessmentTypes[lastAssessment.type].name}
测评分数: ${lastAssessment.score}分
5分制评分: ${lastAssessment.stars}/5星
测评时间: ${new Date(lastAssessment.timestamp).toLocaleString()}

职位建议: ${document.getElementById('recommendation').textContent || '请先选择职位'}
        `;
        
        const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '面试测评报告.txt';
        a.click();
        URL.revokeObjectURL(url);
    }
}
