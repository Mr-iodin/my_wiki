# AI+心理文献整理

## 数据集整理



### 一、 咨询对话 （文本）

| 数据集名称          | 会议/年份                       | 构建方法                             | 数据来源                               | 数据规模                    | 语言 | 理论基础                             | 核心定位                                      | 链接 |
| :------------------ | :------------------------------ | :----------------------------------- | :------------------------------------- | :-------------------------- | :--- | :----------------------------------- | :-------------------------------------------- | ---- |
| SMILE (SMILECHAT)   | EMNLP 2024 Findings             | 单轮→多轮扩展（ChatGPT）             | 公开单轮心理问答（PsyQA）改写          | 55,165段对话，~183万条话语  | 中文 | 无特定理论，侧重形式多样性           | 大规模、低成本的多轮对话数据生成              | https://aclanthology.org/2024.findings-emnlp.34/ |
| CACTUS              | EMNLP 2024 Findings             | CBT结构化生成（LLM模拟）             | 完全合成（基于PatternReframe负面思维） | 31,577段对话，~99.5万条话语 | 英文 | 认知行为疗法（CBT）                  | 理论驱动的专业心理咨询对话模拟                | https://aclanthology.org/2024.findings-emnlp.832/ |
| PsyDT (PsyDTCorpus) | ACL 2025                        | LLM合成（数字孪生技术）              | 基于单轮对话，GPT-4模拟生成多轮        | 用于训练SoulChat2.0         | 中文 | 未明确指定流派                       | 特定风格心理咨询师数字分身                    | https://aclanthology.org/2025.acl-long.55/ |
| KokoroChat          | ACL 2025                        | 真人咨询师角色扮演                   | 经过训练的真人咨询师模拟对话           | 6,589段长对话               | 日文 | 未明确指定                           | 高质量、低隐私风险的日文咨询数据              | https://aclanthology.org/2025.acl-long.608/ |
| PsyDial             | ACL 2025                        | 真实对话隐私保护重建                 | 真实咨询对话（算法重构）               | 2,382段对话，平均37.8轮/段  | 中文 | 未明确指定                           | 保留真实对话深度与复杂性的开源数据            | https://aclanthology.org/2025.acl-long.1049/ |
| MindDialog          | Pattern Recognition (2026) 顶刊 | 真实视频转录+专家标注                | 325小时真实心理咨询演示视频            | 支持9项任务（分类+生成）    | 英文 | 多流派（CBT等）                      | 高生态效度、可解释性强的综合评估基准          | https://www.sciencedirect.com/science/article/abs/pii/S0031320326007314 |
| RealCBT             | EMNLP 2025 Findings             | 真实对话收集                         | 真实的CBT治疗对话                      | 未明确                      | 英文 | 认知行为疗法（CBT）                  | 用于对比真实与合成CBT对话情感动态的基准数据集 | https://aclanthology.org/2025.findings-emnlp.1089/ |
| PsyCoTalk           | ICLR 2026                       | 合成EMR + 多智能体诊断对话生成       | 基于合成电子病历生成                   | 3,000段多轮诊断对话         | 英文 | 精神病学诊断                         | 首个支持共病诊断的大规模对话数据集            | https://iclr.cc/virtual/2026/poster/10007048 |
| STAMPsy             | AAAI 2025                       | 多类型对话收集（诊断、咨询、治疗等） | 在线心理咨询平台                       | 5,000+段对话                | 中文 | 多类型融合（任务导向+知识驱动+共情） | 时空感知的混合型心理咨询对话数据集            | https://ojs.aaai.org/index.php/AAAI/article/view/34725 |



### 二、多模态情感感知模型（EEG、语音、视频信号）

| 数据集名称                    | 核心模态                   | 数据规模                              | 特点与定位                                                   | 链接 |
| :---------------------------- | :------------------------- | :------------------------------------ | :----------------------------------------------------------- | ---- |
| **EAV (EEG-Audio-Video)**     | EEG (30通道) + 音频 + 视频 | 42名被试，共8,400次交互               | **首个对话情境下的EEG-音频-视频三模态情感数据集**。被试与对话系统进行情绪对话（愤怒、快乐、悲伤、平静、中性），数据同步采集，标签统一。 | https://www.nature.com/articles/s41597-024-03838-4 |
| **DEAP**                      | EEG (32通道) + 生理信号    | 32名被试，40段1分钟视频刺激           | **情感计算领域最经典的基准数据集之一**。被试观看音乐视频后对唤醒度和效价进行1-9分评分，广泛用于情感识别算法验证。 | http://eecs.qmul.ac.uk/mmv/datasets/deap/ |
| **SEED / SEED-IV**            | EEG (62通道)               | 15名被试（SEED）/ 15名被试（SEED-IV） | **上海交通大学BCMI实验室发布的中国被试数据集**。SEED含3类情绪（积极/中性/消极），SEED-IV扩展为4类（快乐/悲伤/恐惧/中性），是EEG情感识别的国际基准。 | https://bcmi.sjtu.edu.cn/home/seed/ |
| **语音交互情绪诱发EEG数据集** | EEG                        | 待进一步确认                          | 2024年发表于*Scientific Data*，专门针对**语音-用户交互场景**中自然诱发的不同情绪进行EEG记录。 | https://www.nature.com/articles/s41597-024-03887-9 |



## 文献整理

### 研究方向一：情感感知与多模态分析

##### TPAMI 及其他 IEEE 期刊/会议

| 论文                                                         |                       核心贡献                       | 链接                                                         |
| :----------------------------------------------------------- | :--------------------------------------------------: | ------------------------------------------------------------ |
| **Transformer-Based Adaptive Decision Fusion for Non-Paired Multimodal Emotion Recognition** (IEEE 会议 2026) |       面向非配对多模态情感识别的自适应决策融合       | https://ieeexplore.ieee.org/document/11608092 |
| **Affect-Jigsaw: Integrating Core and Peripheral Emotions for Harmonious Fine-Grained Multimodal Emotion Recognition** (ICASSP 2026) |       融合核心与外围情绪的细粒度多模态情感识别       | https://ieeexplore.ieee.org/document/11460645 |
| **A Review of Multimodal Dynamic Facial Expression Recognition Based on Unimodal Pretrained Models Transfer** (IEEE 会议 2026) | 基于单模态预训练模型迁移的多模态动态面部表情识别综述 | https://ieeexplore.ieee.org/document/11316745 |
| **Multimodal Machine Learning: A Survey and Taxonomy** (TPAMI 2019) |             多模态机器学习综述与分类体系             | https://doi.org/10.1109/TPAMI.2018.2798607 |
| **Affective image content analysis: Two decades review and new perspectives** (TPAMI 2021) |         情感图像内容分析：二十年回顾与新视角         | https://doi.org/10.1109/TPAMI.2021.3094362 |
| **Automatic analysis of facial affect: A survey** (TPAMI 2014)     |                 面部情感自动分析综述                 | https://doi.org/10.1109/TPAMI.2014.2366127 |
| **GMCDA: Graph-Based Multisource Conditional Distribution Domain Adaptation Network for EEG Recognition of Emotions** (IEEE T-HMS 2026) |    基于图的多源条件分布域适应网络用于EEG情绪识别     | https://ieeexplore.ieee.org/document/11369788 |
| **Lightweight Asymmetric Multimodal Fusion for Cross-Subject Emotion Recognition** (IEEE Access 2026) |       轻量级非对称多模态融合用于跨被试情绪识别       | https://ieeexplore.ieee.org/document/11474823 |

##### ACL / EMNLP

| 会议       | 论文                                                         | 核心贡献                                | 链接 |
| :--------- | :----------------------------------------------------------- | :-------------------------------------- | ---- |
| EMNLP 2025 | **Emotion Transfer with Enhanced Prototype for Unseen Emotion Recognition in Conversation (UERC + ProEmoTrans)** | 对话中未知情绪识别与原型迁移框架        | https://aclanthology.org/2025.emnlp-main.31/ |
| ACL 2025   | **Clue of Emotion (CoE) Framework**                          | 对话情绪识别的情绪线索框架              | https://aclanthology.org/2025.acl-long.1148/ |
| ACL 2025   | **ECERC: Evidence-Cause Attention Network for Multi-Modal Emotion Recognition in Conversation** | 多模态对话情绪识别的证据-原因注意力网络 | https://aclanthology.org/2025.acl-long.102/ |
| EMNLP 2025 | **Multimodal Emotion Recognition in Conversations: A Survey** | 多模态对话情绪识别综述                  | https://aclanthology.org/2025.findings-emnlp.332/ |
| EMNLP 2025 | **MERMAID: Multi-perspective Self-reflective Agents with Generative Augmentation for Emotion Recognition** | 多视角自反思智能体与生成增强的情绪识别  | https://aclanthology.org/2025.emnlp-main.1252/ |

##### ICLR / ICML / NeurIPS

| 会议                            | 论文                                                         | 核心贡献                                                   | 链接                                                         |
| :------------------------------ | :----------------------------------------------------------- | :--------------------------------------------------------- | ------------------------------------------------------------ |
| ICLR 2025                       | **Multi-modal brain encoding models for multi-modal stimuli** | 多模态刺激的多模态脑编码模型                               | https://openreview.net/forum?id=0dELcFHig2                   |
| ICME 2025                       | **Unimodal-driven Distillation in Multimodal Emotion Recognition with Dynamic Fusion (SUMMER)** | 单模态驱动的动态融合多模态情绪识别蒸馏                     | https://ieeexplore.ieee.org/document/11209909                |
| ICML 2025                       | **OV-MER: Towards Open-Vocabulary Multimodal Emotion Recognition** | 开放词汇多模态情绪识别                                     | https://proceedings.mlr.press/v267/lian25b.html              |
| ICML 2025 (Oral, Top 1%)        | **AffectGPT: A New Dataset, Model, and Benchmark for Emotion Understanding with Multimodal LLMs** | 首个面向MLLM的细粒度情感理解数据-模型-评测体系             | https://icml.cc/virtual/2025/session/46912                   |
| ICML 2025 (Spotlight, Top 2.6%) | **MODA: MOdular Duplex Attention for Multimodal Perception, Cognition, and Emotion Understanding** | 模块化双工注意力机制，覆盖感知、认知与情感理解             | https://icml.cc/virtual/2025/poster/46210                    |
| NeurIPS 2025                    | **BiM-TTA: A Multimodal BiMamba Network with Test-Time Adaptation for Emotion Recognition Based on Physiological Signals** | 基于生理信号的多模态双向Mamba网络与测试时自适应情绪识别    | https://neurips.cc/virtual/2025/loc/san-diego/poster/119989  |
| NeurIPS 2025                    | **egoEMOTION: Egocentric Vision and Physiological Signals for Emotion and Personality Recognition** | 首个结合自我中心视觉与生理信号的多模态情绪与人格识别数据集 | https://neurips.cc/virtual/2025/loc/san-diego/poster/121710  |
| NeurIPS 2025                    | **EmoNet-Face: An Expert-Annotated Benchmark for Synthetic Emotion Recognition** | 专家标注的合成情绪识别基准                                 | https://neurips.cc/virtual/2025/loc/san-diego/poster/121788  |
| TPAMI 2023                      | **Multimodal Learning With Transformers: A Survey**          | 多模态 Transformer 方法体系综述（表示、融合、跨模态对齐）  | https://ieeexplore.ieee.org/document/10123038                |
| IEEE TAFFC 2022                 | **Deep Facial Expression Recognition: A Survey**             | 深度面部表情识别综述（数据、方法与跨域泛化）               | https://doi.org/10.1109/TAFFC.2020.2981446                   |
| Information Fusion 2017         | **A Review of Affective Computing: From Unimodal Analysis to Multimodal Fusion** | 情感计算从单模态到多模态融合的经典综述                     | https://www.sciencedirect.com/science/article/pii/S1566253517300738 |



### 研究方向二：情感计算中的心理与行为建模

##### TPAMI 及其他期刊/会议（ACII 等）

| 论文                                                         | 核心贡献                                 | 链接 |
| :----------------------------------------------------------- | :--------------------------------------- | ---- |
| **Knowledge-Based Emotion Recognition Using Large Language Models** (TPAMI 2025) | 利用心理学理论指导自动化情感识别方法设计 | https://ieeexplore.ieee.org/document/10970319 |
| **Is GPT a computational model of emotion?** (ACII 2023)     | 探讨GPT是否为情感的计算模型              | https://ieeexplore.ieee.org/document/10388119 |

##### ACL / EMNLP

| 会议       | 论文                                                         | 核心贡献                                         | 链接 |
| :--------- | :----------------------------------------------------------- | :----------------------------------------------- | ---- |
| ACL 2025 (Findings) | **Mechanistic Interpretability of Emotion Inference in Large Language Models** | LLM情绪推理的机械可解释性                        | https://aclanthology.org/2025.findings-acl.679/ |
| ACL 2025 (Findings) | **Beyond Verbal Cues: Emotional Contagion Graph Network (ECGN) for Causal Emotion Entailment** | 模拟非语言隐含情绪对他人情绪影响的情绪传染图网络 | https://aclanthology.org/2025.findings-acl.88/ |
| EMNLP 2025 (Demo)  | **Metamo: Empowering LLMs with Psychological Distortion Detection for Cognition-aware Coaching** | 心理扭曲检测与认知感知辅导                       | https://aclanthology.org/2025.emnlp-demos.66/ |
| EMNLP 2025         | **EMNLP: Educator-role Moral and Normative LLMs Profiling**  | 教育者角色LLM的道德与规范性画像                  | https://aclanthology.org/2025.emnlp-main.42/ |
| EMNLP 2023 (Findings) | **Evaluating Emotion Arcs Across Languages: Bridging the Global Divide in Sentiment Analysis** | 情感弧（emotion arcs）建模：刻画个体/群体情绪随时间的变化轨迹，并跨语言评估 | https://aclanthology.org/2023.findings-emnlp.271/ |
| ACL 2025 | **CuLEmo: Cultural Lenses on Emotion — Benchmarking LLMs for Cross-Cultural Emotion Understanding** | 首个跨文化情绪理解基准：6 种语言 × 400 问，评测 LLM 的文化推理能力 | https://aclanthology.org/2025.acl-long.925/ |
| ACL 2025 | **BRIGHTER: Bridging the Gap in Human-Annotated Textual Emotion Recognition Datasets for 28 Languages** | 28 种语言（含大量低资源语言）的多标签情绪标注数据集 | https://aclanthology.org/2025.acl-long.436/ |
| ACL 2026 | **Tears or Cheers? Benchmarking LLMs via Culturally Elicited Distinct Affective Responses (CEDAR)** | 基于“文化引发差异化情感反应”构建的多模态基准（7 语言、14 类细粒度情绪） | https://aclanthology.org/2026.acl-long.1769/ |



##### ICLR / ICML / NeurIPS

| 会议         | 论文                                                         | 核心贡献                                          | 链接 |
| :----------- | :----------------------------------------------------------- | :------------------------------------------------ | ---- |
| NeurIPS 2024 | **Apathetic or Empathetic? Evaluating LLMs' Emotional Alignments with Humans** | 评估LLM与人类的情感对齐（基于情绪评价理论）       | https://papers.nips.cc/paper_files/paper/2024/hash/b0049c3f9c53fb06f674ae66c2cf2376-Abstract-Conference.html |
| ICML 2026    | **Emergence of Hierarchical Emotion Organization in Large Language Models** | LLM中层级化情绪组织的涌现，与心理学情绪轮理论对齐 | https://icml.cc/virtual/2026/poster/60939 |
| NeurIPS 2025 (Competition) | **EEG Foundation Challenge: Psychopathology factor prediction** | 基于EEG数据预测精神病理学因素                     | https://neurips.cc/virtual/2025/loc/san-diego/competition/127719 |
| ICLR 2024 (Oral) | **On the Humanity of Conversational AI: Evaluating the Psychological Portrayal of LLMs** | 提出 PsychoBench 框架，系统评估 LLM 的心理画像（人格、情感、价值观） | https://openreview.net/forum?id=H3UayAQWoE |



### 研究方向三：情感表达生成与人机交互

##### TPAMI 及其他 IEEE 期刊/会议

| 论文                                                         | 核心贡献                           | 链接 |
| :----------------------------------------------------------- | :--------------------------------- | ---- |
| **Social Functions of Machine Emotional Expressions** (Proceedings of the IEEE 2023) | 机器情感表达的社会功能综述         | https://ieeexplore.ieee.org/document/10093227 |
| **Affective Expression Design in Bionic Cat Cyber-Physical Agents** (IEEE 会议 2026) | 仿生猫信息物理智能体的情感表达设计 | https://ieeexplore.ieee.org/document/11565668 |
| **Closing the Affective Loop in Human-Robot Conversation** (IEEE 会议 2026) | 人机对话中的情感闭环               | https://ieeexplore.ieee.org/document/11582208 |

##### ACL / EMNLP

| 会议              | 论文                                                         | 核心贡献                                  | 链接 |
| :---------------- | :----------------------------------------------------------- | :---------------------------------------- | ---- |
| ACL 2025          | **ReflectDiffu: Reflect between Emotion-intent Contagion and Mimicry for Empathetic Response Generation via a RL-Diffusion Framework** | 情绪-意图传染与模仿反思的共情回复生成框架 | https://aclanthology.org/2025.acl-long.1235/ |
| ACL 2025 (Findings) | **Chain-Talker: Chain Understanding and Rendering for Empathetic Conversational Speech Synthesis** | 链式理解与渲染的共情对话语音合成          | https://aclanthology.org/2025.findings-acl.101/ |
| ACL 2025 (Findings) | **MECoT: Markov Emotional Chain-of-Thought for Personality-Consistent Role-Playing** | 马尔可夫情感思维链用于人格一致的角色扮演  | https://aclanthology.org/2025.findings-acl.435/ |
| EMNLP 2025 (Oral) | **When Words Smile: Generating Diverse Emotional Facial Expressions from Text** | 从文本生成多样化情绪面部表情              | https://aclanthology.org/2025.emnlp-main.1374/ |
| EMNLP 2025 (Findings) | **Seeing is Believing: Emotion-Aware Audio-Visual Language Modeling for Expressive Speech Generation** | 情感感知的音-视语言建模用于表现性语音生成 | https://aclanthology.org/2025.findings-emnlp.140/ |

##### ICLR / ICML / NeurIPS

| 会议         | 论文                                                         | 核心贡献                                  | 链接 |
| :----------- | :----------------------------------------------------------- | :---------------------------------------- | ---- |
| ICLR 2025    | **EcoFace: Audio-Visual Emotional Co-Disentanglement Speech-Driven 3D Talking Face Generation** | 音-视情感协同解耦的语音驱动3D说话人脸生成 | https://openreview.net/forum?id=iDcWYtYUwX |
| ICCV 2025    | **SynFER: Towards Boosting Facial Expression Recognition with Synthetic Data** | 基于合成数据增强的面部表情识别            | https://openaccess.thecvf.com/content/ICCV2025/papers/He_SynFER_Towards_Boosting_Facial_Expression_Recognition_with_Synthetic_Data_ICCV_2025_paper.pdf |
| ICML 2025    | **Emotional Face-to-Speech (DEmoFace)**                      | 从表情面部到语音的生成框架                | https://icml.cc/virtual/2025/poster/45920 |
| NeurIPS 2025 ※ | **Emotion-Director: Bridging Affective Shortcut in Emotion-Oriented Image Generation** | 多模态提示的情感导向文生图                | https://arxiv.org/abs/2512.19479 |
| AAAI 2022 | **CEM: Commonsense-Aware Empathetic Response Generation** | 基于常识推理增强共情回复生成 | https://ojs.aaai.org/index.php/AAAI/article/view/21373 |
| NeurIPS 2023 | **StyleTTS 2: Towards Human-Level Text-to-Speech through Style Diffusion and Adversarial Training with Large Speech Language Models** | 风格扩散 + 大语音模型对抗训练的类人级语音合成 | http://papers.nips.cc/paper_files/paper/2023/hash/3eaad2a0b62b5ed7a2e66c2188bb1449-Abstract-Conference.html |
| SIGGRAPH Asia 2023 | **Emotional Speech-Driven Animation with Content-Emotion Disentanglement (EMOTE)** | 语音驱动 3D 面部动画中的内容-情感解耦 | https://dl.acm.org/doi/10.1145/3610548.3618183 |



### 研究方向四：情感计算应用

##### TPAMI 及其他 IEEE 期刊/会议

| 论文                                                         | 核心贡献                                 | 链接 |
| :----------------------------------------------------------- | :--------------------------------------- | ---- |
| **Efficient Emotion Recognition Using Media-Pipe 3D Landmarks and Explainable Machine Learning Models** (IEEE ISC 2025) | 面向智能辅导系统与医疗诊断的高效情绪识别 | https://ieeexplore.ieee.org/document/11293353 |
| **Transformer-Based Adaptive Decision Fusion for Non-Paired Multimodal Emotion Recognition** (IEEE 会议 2026；与研究方向一重复) | 面向医疗健康与自适应学习的情感识别       | https://ieeexplore.ieee.org/document/11608092 |
| **On the Evolution of Speech Representations for Affective Computing: A Brief History and Critical Overview** (IEEE SPM 2021) | 情感计算中语音表征的演进                 | https://ieeexplore.ieee.org/document/9591501 |

##### ACL / EMNLP

| 会议              | 论文                                                         | 核心贡献                         | 链接 |
| :---------------- | :----------------------------------------------------------- | :------------------------------- | ---- |
| ACL 2025          | **iNews: A Multimodal Dataset for Modeling Personalized Affective Responses to News** | 个性化情感新闻响应的多模态数据集 | https://aclanthology.org/2025.acl-long.1217/ |
| ACL 2025          | **ES-VR: Dialogue Systems for Emotional Support via Value Reinforcement** | 基于价值强化的情感支持对话系统   | https://aclanthology.org/2025.acl-long.1395/ |
| EMNLP 2025 (Demo) | **MathBuddy: A Multimodal System for Affective Math Tutoring** | 情感化数学辅导的多模态系统       | https://aclanthology.org/2025.emnlp-demos.63/ |
| EMNLP 2025 (Findings) | **Beyond Coarse Labels: Fine-Grained Problem Augmentation and Multi-Dimensional Feedback for Emotional Support Conversation (EmoCare)** | 细粒度问题增强的情感支持对话     | https://aclanthology.org/2025.findings-emnlp.86/ |
| ACL 2021 | **Towards Emotional Support Dialog Systems (ESConv)** | 定义情感支持对话任务，基于帮助技巧理论构建 ESConv 数据集 | https://aclanthology.org/2021.acl-long.269/ |
| ACL 2021 (Findings) | **PsyQA: A Chinese Dataset for Generating Long Counseling Text for Mental Health Support** | 中文心理咨询长文本回复生成数据集 | https://aclanthology.org/2021.findings-acl.130/ |

##### ICLR / ICML / NeurIPS

| 会议               | 论文                                                         | 核心贡献                               | 链接 |
| :----------------- | :----------------------------------------------------------- | :------------------------------------- | ---- |
| ICLR 2025 Workshop | **Filter bubbles and affective polarization in user-personalized LLM outputs** | 个性化LLM输出中的过滤气泡与情感极化    | https://proceedings.mlr.press/v296/wu25a.html |
| NeurIPS 2025       | **mdJPT: Multi-dataset Joint Pre-training of Emotional EEG Enables Generalizable Affective Computing** | 多数据集联合预训练实现可泛化的情感计算 | https://proceedings.neurips.cc/paper_files/paper/2025/hash/f1b8d443042f376aa3654b6c68de6297-Abstract-Conference.html |





## 研究方向

### 研究方向一：情感感知与多模态分析

**核心目标**：从面部、语音、生理信号等多种模态中准确识别人类情感状态。

**主要子方向**：

- **视觉情感识别**：从面部表情、身体姿态、手势中提取特征并识别情感；

- **语音情感识别**：分析文本、口语、韵律、语音质量及情感爆发；

- **生理信号情感识别**：利用中枢信号（fMRI、EEG）和外周信号（GSR）进行情感状态识别；

  | 数据类型                    | 核心指标/参数                                            | 优势                                           | 局限性                                     |
  | :-------------------------- | :------------------------------------------------------- | :--------------------------------------------- | :----------------------------------------- |
  | **脑电图(EEG)**             | 非侵入式；采样率≥256Hz，常见512-2000Hz；微伏(μV)级分辨率 | 时间分辨率高、设备成本低、便携性好             | 信号易受干扰，空间分辨率低                 |
  | **脑磁图(MEG)**             | 非侵入式；测量大脑产生的微弱磁场                         | 时间和空间分辨率优于EEG                        | 设备极其昂贵，需要磁屏蔽室                 |
  | **功能性磁共振成像(fMRI)**  | 非侵入式；通过监测血氧水平依赖(BOLD)信号间接反映神经活动 | 空间分辨率极高                                 | 设备庞大、成本高、时间分辨率低（有延迟）   |
  | **功能性近红外光谱(fNIRS)** | 非侵入式；采样率约8Hz；通过近红外光监测血氧变化          | 成本较低、便携性较好、运动伪迹相对较少         | 时间分辨率较低，测量深度有限               |
  | **皮层脑电图(ECoG)**        | 半侵入式；电极置于大脑皮层表面                           | 信号质量和时空分辨率远优于头皮EEG              | 需要通过手术植入，有感染风险               |
  | **脑内信号(Spikes/LFP)**    | 侵入式；电极植入大脑皮层内部                             | 信号质量和时空分辨率最高，可捕捉单个神经元放电 | 侵入性最强，手术风险高，长期稳定性可能下降 |

  **辅助信号：**为提高系统稳定性和准确性，BCI系统常同步采集**肌电(EMG)**、**眼电(EOG)** 和**心电(ECG)** 等信号。这些信号并非来自大脑，但能反映肌肉活动、眼球运动等信息，用于**识别伪迹**（如眨眼造成的信号干扰）或作为**补充控制信号**。

- **多模态融合**：融合视觉、语音、生理等多模态信息进行综合情感识别

- **群体情感识别**：识别多人场景下的群体情感状态

- **数据与标注**：情感数据集的构建方法（情绪诱导、动作捕捉等）及情感语料库的标注工具与方法



### 研究方向二：情感计算中的心理与行为建模

**核心目标**：从心理学和行为科学视角，构建可计算的情感模型。

**主要子方向**：

- **情感概念计算化**：将“情感”、“情绪”、“人格”、“态度”等心理学概念形式化，便于计算机处理
- **情感过程计算模型**：构建考虑情感影响的决策模型，或预测用户情感状态的动态模型
- **跨文化/跨群体情感差异**：研究不同文化、群体、语言背景下的情感表达差异
- **标准与标记语言**：参与或提出情感计算领域的标准和标记语言规范



### 研究方向三：情感表达生成与人机交互

**核心目标**：设计能自然表达情感并适应用户情感状态的交互系统。

**主要子方向**：

- **情感表达生成模型**：为虚拟智能体或机器人生成视觉、声学、文本形式的情感表达
- **语言与非语言表达建模**：实现各类情感的语言及非语言（如面部、姿态）表达的计算模型
- **情感自适应交互**：根据用户的情感状态动态调整技术系统的交互方式
- **情感影响与调节**：开发计算方法来影响或改变用户的情感状态
- **情感画像与长期自适应**：在中期到长期交互中构建用户情感画像并实现自适应



### 研究方向四：情感计算应用

**核心目标**：将情感计算技术落地于实际场景，解决现实问题。

**主要应用领域**：

- **教育**：情感感知用于学习状态监测与教学反馈
- **医疗健康**：心理疾病辅助诊断、情绪健康管理
- **娱乐与人机交互**：游戏、虚拟现实中的情感体验设计
- **客户服务**：客户满意度分析与服务优化
- **设计与车辆操作**：用户体验设计、驾驶安全监测
- **社会智能体与机器人**：赋予智能体情感交互能力
- **情感环境智能**：智能环境中的情感感知与响应
- **多媒体检索与生成**：基于情感的图像、音乐、视频检索与生成
- **监控与生物识别**：情感驱动的安防与身份验证
