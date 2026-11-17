# AI+文献目录



| 序号 | 工作             | 类型与发表信息                    | 核心设计                                                     | 代码是否开源                                                 | 精读 |
| ---- | ---------------- | --------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ---- |
| ①    | **PRAGMA**       | 评测基准 · EMNLP 2026 主会        | 按单一事件／长期轨迹与对齐／纠正划分任务，分别评估指导与用户历史的一致性及证据支撑。 | **论文声明公开**。[GitHub](https://github.com/yuhyojeong/PRAGMA) · [数据集](https://huggingface.co/datasets/stellahj/PRAGMA)。本次未能核实仓库文件或许可证。 ([aclanthology.org](https://aclanthology.org/2026.emnlp-main.2628.pdf?utm_source=chatgpt.com)) | -    |
| ②    | **PGMem**        | 图记忆方法 · EMNLP 2026 主会      | 用来源边和证据边连接用户画像与历史事件，按证据有效性检索。   | **源码公开，未见许可证**。[GitHub](https://github.com/wonjunchoi23/pgmem) 可查看实现和依赖。 ([GitHub](https://github.com/wonjunchoi23/pgmem?utm_source=chatgpt.com)) | -    |
| ③    | **MemORAI**      | 图记忆方法 · Findings of ACL 2026 | 选择性过滤记忆、建立轮次级溯源图，再用动态加权 PageRank 检索子图。 | **未找到官方公开实现**。 ([aclanthology.org](https://aclanthology.org/2026.findings-acl.1408.pdf?utm_source=chatgpt.com)) | -    |
| ④    | **TSHMem**       | 图记忆方法 · EMNLP 2026 主会      | 构建时序–语义分层图，将时间相关性纳入图转移概率。            | **未找到官方公开实现**。 ([aclanthology.org](https://aclanthology.org/2026.emnlp-main.1034/?utm_source=chatgpt.com)) | -    |
| ⑤    | **MADial-Bench** | 评测基准 · NAACL 2025 主会长文    | 对照被动事实回忆与情绪触发的主动回忆，评估记忆检索和支持性回应。 | **开源（MIT）**。[GitHub](https://github.com/hejunqing/MADial-Bench) 提供数据、推理和评测脚本。 ([GitHub](https://github.com/hejunqing/MADial-Bench?utm_source=chatgpt.com)) | -    |



------



##### ① PRAGMA

​        **PRAGMA: Evaluating Personalized Guidance with Memory Alignment in Lifelong Conversations**，在长期对话中评估基于记忆对齐的个性化指导。一个用于评估**长期对话中个性化指导能力**的基准测试集，核心创新在于将记忆评估从“事实召回”推进到“基于用户演变轨迹和错误假设的开放式指导”。

`# EMNLP 2026 (Main)`

> PRAGMA, a benchmark for evaluating personalized guidance in long-term conversations, containing curated longitudinal conversation histories, evidence annotations, and guidance scenarios grounded in evolving user contexts and incorrect user assumptions.
>
> **重点研究：** 现有对话记忆评估主要关注检索和事实召回，但真实场景中用户寻求的是推荐、规划、决策支持等**实用指导**。个性化指导要求模型跨多次对话整合信息，并推理用户**不断变化的偏好**和**可能错误的假设**。

- PDF：https://aclanthology.org/2026.emnlp-main.2628.pdf
- ACL Anthology：https://aclanthology.org/2026.emnlp-main.2628/
- arXiv：https://arxiv.org/abs/2609.09664
- DOI：10.18653/2026.emnlp-main.2628

PRAGMA 的核心洞察是：知道“用户上周说过喜欢某家店”和“基于用户过去半年的消费习惯和最近搬家的事实，推荐一家新店”之间，存在一条现有基准没有覆盖的鸿沟。前者是事实召回，后者才是**个性化指导**。

同时，构建了一套以**四类查询**为核心的评估框架：

- **核心能力定义**：PRAGMA（PRActical Guidance with Memory Alignment），评估模型能否在**演变中的用户轨迹**和**可能错误的用户假设**下，提供有据可依的开放式指导。
- **四类查询（2×2 分类）**：
  - **Event-Align**：基于一致的**事件级**经历提供指导（静态，记忆对齐）。
  - **Event-Correct**：在纠正用户**事件级**错误假设后提供指导（静态，记忆错位）。
  - **Traj-Align**：基于用户**长期轨迹**的演变提供指导（动态，记忆对齐）。
  - **Traj-Correct**：识别用户当前决策与**长期轨迹**冲突并提供纠正性指导（动态，记忆错位）。
- **评估指标**：检索侧使用 Recall、Precision、F1、Exact Recall（会话级）；生成侧用 GPT-5 作为评判者，从**Alignment**（与用户经历和长期历史的一致性）和 **Grounding**（对标注证据的明确支持）两个维度评分，四类查询各有独立评分标准。
- **数据构建**：通过可控、人工验证的流水线生成长对话历史，包含演变中的用户状态和细粒度证据标注。历史由“证据会话”和“填充会话”拼接而成，模拟真实长期对话的稀疏信息分布。

**🌟 主要实验结果**

- **检索强 ≠ 指导好**：Query Rewriting 在 Traj-Align 上达到接近 oracle 的检索性能（Recall 95.95），但下游 Alignment 仅 25.00，Grounding 仅 20.00。这直接说明，**找对记忆不等于会用记忆**，个性化指导的瓶颈在记忆利用环节，而非检索环节。
- **纠正性指导是最大短板**：在 Event-Correct 和 Traj-Correct 上，模型对齐分数极低。分析发现，**不一致检测本身不是主要瓶颈**——加入“用户假设可能错误”的指令后对齐分数大幅提升。真正的困难在于**Grounding**：即使识别了不一致，模型也难以可靠地找到并利用证据来支撑纠正性回应。
- **模型存在过度迎合倾向**：纠正性对齐分数极低的部分原因是，指令微调后的 LLM 倾向于**验证而非挑战用户的错误假设**，这与此前观察到的谄媚行为一致。在个性化指导场景中，这种倾向尤其有害，因为有效帮助有时恰恰需要指出用户错了。
- **记忆系统的“保存-检索-利用”三者不可兼得**：A-MEM 几乎完美保存证据（98-99%），但在 Traj-Correct 上仅检索到 48.9%；Mem0 和 SimpleMem 在重写压缩中丢失信息，但摘要型记忆的下游利用率反而更高。说明**记忆的抽象形式本身是影响生成可用性的关键接口**，而非单纯的压缩机制。
- **检索粒度存在类型依赖**：轨迹类查询（Traj-Align）会话级检索优于轮次级（Dense 从 45.00 提升至 63.00）；纠正类查询（Event-Correct）则轮次级更优，因为过大的会话上下文会淹没细粒度纠正证据。

**与之前关注的工作的关系**：PRAGMA 与你之前看的 **ENPMR-Bench** 和 **MemGuide** 共享一个核心判断——**检索到相关记忆不等于能有效利用它**。ENPMR 发现检索记忆条件下共情得分（4.38）远低于黄金记忆（4.91），PRAGMA 发现检索近 oracle 但 Grounding 仍很低。区别在于，PRAGMA 将评估场景从情感支持/任务完成扩展到了**开放式实用指导**，并引入了“用户假设可能错误”这一维度，这是现有记忆基准（包括 ES-MemEval、ENPMR、MADial-Bench）都没有系统覆盖的。如果你在研究记忆检索后的利用环节，PRAGMA 的“Alignment vs. Grounding”双维评估提供了一个可借鉴的拆解方式。



------



##### ② PGMem

​         **PGMem: Tightly Coupled Persona–Memory Graph for Lifelong Personalized Agents**，面向终身个性化智能体的紧耦合画像–记忆图。一个用于**终身个性化对话智能体**的**紧耦合人格-记忆图**框架，核心创新在于将用户人格信号与支撑其存在或修正的对话事件通过“证据边”显式连接，解决“人格画像与事件脱节”导致的**有效性缺口**和**检索缺口**。

`# EMNLP 2026 Main`

> PGMem, a heterogeneous persona-memory graph that connects event and persona nodes through typed provenance and evidence edges, keeping each persona signal traceable to the events that support or revise it. At retrieval time, PGMem expands from query-relevant seeds and ranks signals by evidential validity.
>
> **重点研究：** 现有记忆系统能很好地组织过往事件，但将用户人格存储为扁平的画像，与支撑这些画像的事件脱节。这种松耦合导致两个问题：人格信号可能已经过时或失效（validity gap），以及检索时无法找到支撑某个画像的关键证据（retrieval gap）。

- arXiv：https://arxiv.org/abs/2608.01708
- PDF：https://arxiv.org/pdf/2608.01708
- GitHub：https://github.com/wonjunchoi23/pgmem/
- Hugging Face Papers：https://huggingface.co/papers/2608.01708
- 作者：Wonjun Choi, Yerim Kim, Yukyung Lee, Susik Yoon

PGMem 的核心洞察是：一个用户说“我喜欢跑步”并不等于这个偏好永远有效。它可能被后来的事件（受伤、搬家）**修正或推翻**。如果系统只存一个静态的“喜欢跑步”标签，检索时就会给出过时的人格判断。PGMem 的做法是：**每一条人格信号都必须能追溯到支撑或修正它的事件证据**。

同时，构建了一套以**异构人格-记忆图**为核心的框架：

- **核心能力定义**：PGMem（Persona-Memory Graph），将事件层节点（Context、Episode）与人格层节点（State、Trait）通过两类边连接：
  - **SourceEdges**：记录人格信号的来源（溯源）。
  - **EvidenceEdges**：记录事件对人格信号的支撑或修正关系（有效性信号）。
- **证据感知检索**：检索时从查询相关的种子节点出发，**沿证据边扩展**，按“证据有效性”对人格信号排序，优先返回当前仍然有效、且有事件支撑的信号。
- **核心解决的缺口**：
  - **记忆-人格有效性缺口**：人格信号不再脱离事件孤立存在，每条信号都有证据链。
  - **人格感知检索缺口**：直接查询-记忆的语义相似度可能漏掉支撑某个画像的关键事件，沿证据边扩展可以找回这些证据。
- **评测设置**：在**三个终身个性化基准**上，使用**小语言模型（SLM）** 作为骨干进行实验。

**🌟 主要实验结果**

- **持续优于各类记忆基线**：PGMem 在三个终身个性化基准上，一致优于基于摘要的、人格感知的、图结构的以及智能体式的记忆基线 。
- **上下文越长，优势越明显**：性能增益随对话上下文增长而**扩大**，说明耦合的人格-记忆图在长程对话中检索和 grounding 能力更强，而非仅靠短程匹配 。
- **消融验证核心组件贡献**：消融实验确认了**人格节点、证据边、有效性感知检索机制**各自的贡献 。

**与之前关注的工作的关系**：PGMem 和你刚看的 **TSHMem** 都采用**图结构 + 显式约束注入检索**的思路。TSHMem 注入的是**时序约束**（哪条记忆在时间上有效），PGMem 注入的是**证据有效性约束**（哪条人格信号有事件支撑、是否仍然成立）。两者的共同逻辑是：**纯语义相似度不够，检索必须受非语义信号的引导**。而 PGMem 的“人格信号必须可追溯到事件”这一设计，对 **ES-MemEval** 中的“用户建模”能力也有直接参考价值——情感支持场景中，用户的偏好和状态同样需要追踪其来源和演变，而非当作静态标签使用。



------



##### ③ MemORAI

​        **MemORAI: Memory Organization and Retrieval via Adaptive Graph Intelligence for LLM Conversational Agents**，面向 LLM 对话智能体的自适应图智能记忆组织与检索。一个通过**自适应图智能**来组织与检索记忆的框架，核心创新在于用“选择性过滤 + 溯源图 + 查询自适应子图检索”三件套，解决现有图记忆系统信息稀释、缺乏溯源、检索忽略查询上下文的通病。

`# Findings of ACL 2026`

> MemORAI, a framework that integrates selective memory filtering with dual-layer compression, a provenance-enriched multi-relational graph tracking factual origins at the turn level, and query-adaptive subgraph retrieval with Dynamic Weighted PageRank, achieving state-of-the-art performance in memory retrieval and personalized response generation on LOCOMO and LongMemEval.
>
> **重点研究：** 现有基于图的记忆系统存在三个结构性问题——信息稀释（无关内容淹没关键记忆）、缺乏溯源（无法追踪事实来源）、统一检索（忽略当前查询的具体语境）。如何让图记忆的**组织**和**检索**都变得“自适应”？

- PDF：https://aclanthology.org/2026.findings-acl.1408.pdf
- ACL Anthology：https://aclanthology.org/2026.findings-acl.1408/
- arXiv：https://arxiv.org/abs/2605.01386
- DOI：10.18653/v1/2026.findings-acl.1408

MemORAI 的核心洞察是：图结构本身不保证好的记忆检索。如果图里塞满了无关细节，或者检索时不考虑“用户现在在问什么”，图就退化成了一个更复杂的向量库。MemORAI 从**存储端**和**检索端**同时下手解决这个问题。

同时，构建了一套以**三项创新**为核心的记忆框架：

- **核心能力定义**：MemORAI（Memory Organization and Retrieval via Adaptive Graph Intelligence），即通过**选择性的记忆组织**和**查询自适应的检索**，让图记忆真正服务于个性化长期对话。
- **创新一：选择性记忆过滤 + 双层压缩**：不是把所有对话内容都塞进图里，而是先过滤出与**用户画像（user persona）** 相关的内容，再通过双层压缩保留核心信息，避免信息稀释。
- **创新二：溯源增强的多关系图（Provenance-Enriched Multi-Relational Graph）**：在**轮次级（turn-level）** 追踪每条事实的来源，使得检索到的记忆可以追溯到具体对话轮次。这解决了“知道答案但不知道从哪来的”问题，对需要验证的个性化场景尤其重要。
- **创新三：查询自适应子图检索 + 动态加权 PageRank**：检索时不是在整个图上做统一匹配，而是根据当前查询动态调整边的权重，用 **Dynamic Weighted PageRank** 在子图上进行检索。这意味着同一个用户问不同问题时，检索路径和重点会随之变化。
- **评测基准**：**LOCOMO** 和 **LongMemEval**，两个长期对话记忆的标准基准。

**🌟 主要实验结果**

- **在两个基准上均达到 SOTA**：MemORAI 在 LOCOMO 和 LongMemEval 上的**记忆检索**和**个性化回应生成**任务中均取得了当时最优的性能，论文将其归因于“选择性存储 + 增强表示 + 自适应检索”三者的组合效应。
- **三者的必要性得到验证**：论文的核心论点是，仅靠其中任何一项都不够——选择性过滤解决“存什么”，溯源图解决“怎么表示”，查询自适应检索解决“怎么找”。三者缺一不可，才能实现连贯且个性化的 LLM 智能体。



------



##### ④ TSHMem

**TSHMem**，一个用于长期对话智能体的**时序-语义分层记忆图**框架，核心创新在于将时序约束显式注入图检索路径，解决“语义相似但时序失效”的记忆检索问题。

`# EMNLP 2026 Main`

> TSHMem: A Temporal-Semantic Hierarchical Memory Graph for Long-Term Conversational Agents
>
> TSHMem：面向长期对话智能体的时序–语义分层记忆图
>
> TSHMem, a Temporal-Semantic Hierarchical Memory Graph for long-term conversational agents, which addresses noisy temporal-entity cues and weak coupling between temporal anchors and retrieval paths by organizing dialogue turns, statements, summaries, and entities into a heterogeneous memory graph, and injecting temporal relevance into graph transition probabilities.
>
> **重点研究：** 长期对话智能体面临时序敏感查询时，需要同时满足“上下文相关”和“在特定时间/事件/事实更新下有效”的证据。但噪声化的时序-实体线索、时序锚点与检索路径之间的弱耦合，以及稀疏的长尾证据，常导致系统检索到语义相似但**时序上无效或过时**的记忆。

- ACL Anthology（作者页面索引）：https://aclanthology.org/people/wenhao-yu-3367/

TSHMem 的核心洞察是：现有的记忆检索系统（包括基于嵌入的 RAG 和基于图的记忆方法）主要依赖**语义匹配**来召回证据，但用户查询中隐含的**时间约束**（如“上个月提到的那个方案”“搬家之前的偏好”）往往无法被语义相似度捕捉。结果就是：系统找到了“说得像”的记忆，但那条记忆可能已经过时或被后续事件推翻。

同时，构建了一套以**时序感知图检索**为核心的框架：

- **核心能力定义**：TSHMem（Temporal-Semantic Hierarchical Memory Graph），即在一个异构记忆图上，将**时序相关性注入图转移概率**，使检索过程同时受语义匹配和时间约束的引导。
- **异构记忆图构建**：将对话轮次、自包含陈述、分层摘要和实体组织为异构图中的不同节点类型，保留对话的层次结构。
- **时序意图解析与实体激活**：解析查询中的时序意图（如“之前”“上个月”“搬家前”），激活查询相关的实体节点，解析事件引用的约束条件。
- **时序相关性注入图转移**：将时序相关性作为图转移概率的一部分，而非事后过滤。检索时结合**时序感知的结构传播**、语义匹配和分层排序，返回紧凑的、时序有效的证据。
- **评测数据**：**LongMemEval S*** 和 **LoCoMo**。

**🌟 主要实验结果**

- **LongMemEval S* 上大幅领先**：TSHMem 达到 \**66.3% 准确率\**，相比最强基线绝对提升 \**18.6%\**，同时检索的**证据 token 数量更少**。这意味着它在“更准”的同时“更省”，说明时序注入确实提升了检索精度而非靠扩大召回范围。
- **LoCoMo 上同样优于强基线**：论文声称在 LongMemEval S* 和 LoCoMo 上均持续优于强检索与记忆智能体基线。
- **核心机制的有效性来源**：论文将增益归因于时序约束与检索路径的**显式耦合**——不是在检索后过滤时间戳，而是在图传播阶段就让时间相关性影响哪些节点被激活和传播。这与纯语义 RAG 和纯图记忆系统形成了方法论上的区分。

**与之前关注的工作的关系**：TSHMem 和你之前看的 **MemGuide**（意图驱动记忆选择）在“用中间状态约束检索”的思路上有结构相似性——MemGuide 用**任务意图和槽位缺口**约束检索，TSHMem 用**时序约束**约束图检索。区别在于约束的类型：前者是目标导向的，后者是时间感知的。而 **ES-MemEval** 和 **ENPMR-Bench** 关注的是情感维度的记忆检索，TSHMem 则是时序维度的记忆检索。如果你在研究长期记忆检索的多维度约束问题，TSHMem 提供了一个将**非语义约束（时间）** 显式嵌入图检索的工程范式。



------



##### ⑤ MADial-Bench

**MADial-Bench**，一个用于评估**记忆增强对话系统（MADS）** 在真实世界场景中表现的基准测试集，核心创新在于首次将**主动记忆回忆（Proactive Memory Recall）** 纳入评估框架，与被动事实检索形成双范式对照。

`# NAACL 2025 (Long Papers)`

> MADial-Bench: Towards Real-world Evaluation of Memory-Augmented Dialogue Generation
>
> MADial-Bench：迈向记忆增强对话生成的真实世界评估
>
> MADial-Bench, a benchmark for evaluating Memory-Augmented Dialogue Systems (MADS) in real-world scenarios, incorporating both passive and proactive memory recall paradigms based on cognitive science and psychology theories.
>
> **重点研究：** 现有记忆增强对话评估只关注被动的事实检索，忽略了由情绪、环境等丰富触发因素驱动的主动记忆回忆，这在情感支持场景中至关重要。

- PDF：https://aclanthology.org/2025.naacl-long.499.pdf
- ACL Anthology：https://aclanthology.org/2025.naacl-long.499/
- arXiv：https://arxiv.org/abs/2409.15240
- GitHub：https://github.com/hejunqing/MADial-Bench
- DOI：10.18653/v1/2025.naacl-long.499

MADial-Bench 的核心洞察是：人类记忆的唤起并非总是“被问题触发”，很多时候是由**情绪和周围环境**主动触发的。现有基准（如检索准确率、PPL）只关注被动的事实查询，评估维度不足以衡量类人对话，且缺乏实际应用价值。

同时，构建了一套基于认知科学与心理学理论的双范式评估框架：

- **核心能力定义**：区分**被动记忆回忆（Passive Recall）** 与**主动记忆回忆（Proactive Recall）**。前者针对客观事实（活动、物品、社会关系），后者由情绪驱动，模拟人类在情感支持场景中的记忆唤起方式。
- **双任务设计**：
  - **记忆检索（Memory Retrieval）**：从记忆库中召回相关记忆。
  - **记忆识别与回应生成（Memory Recognition & Response Generation）**：识别并利用记忆生成支持性回应。
- **主动回忆的四类情绪**：基于心理学文献，选定 **Happiness、Sadness、Anxiety、Disappointment** 四种与童年经历相关、表达直接的情绪作为主动回忆的触发条件。
- **数据规模**：**171 条历史记忆**，**160 段对话**（1,474 轮），主动回忆子集 100 段、被动回忆子集 60 段，平均每段对话约 9.2 轮。
- **记忆结构**：每条记忆包含时间、情绪、场景、事件四个字段，模拟人类记忆的多维特征。
- **新评估指标**：引入 **Memory Injection（记忆注入度）**、**ES Proficiency（情感支持熟练度）** 和 **Intimacy（亲密度）** 三个维度，全面评估生成回应质量。

**🌟 主要实验结果**

- **LLM 在记忆识别上落后于人类**：实验显示，LLM 在细致提示下能实现较高的自然度和风格连贯性，但在**记忆识别和对话生成**方面落后于人类，表明记忆利用能力仍是瓶颈。
- **主动回忆是独特挑战**：MADial-Bench 首次将“由情绪触发的主动记忆回忆”纳入评估，填补了现有基准只测被动事实检索的空白。
- **发现了评估维度间的相关性**：广泛测试揭示了**记忆注入、情感支持熟练度和亲密度**之间存在显著相关性，为理解记忆增强对话系统的内部机制提供了新视角。
- **自动评估不可靠，推荐人工评估**：GitHub 仓库明确指出，LLM-as-Judge 无法胜任如此细致的评估任务，强烈建议使用**人工评估**，评估标准详见仓库的 `annotation` 目录。
- **后续基准中被引用为对比基线**：在情感记忆评估相关工作（如 emotional-memory 项目）中，MADial-Bench 被用作“情绪一致性与情绪调节检索”的构造边界对比基准，其 nDCG@5 被报告为 0.304（对比基线 0.221）。

**与之前关注的工作的关系**：MADial-Bench 的“主动回忆”范式与 **ENPMR-Bench** 的“需求条件化检索”在动机上高度一致——都反对“语义相似即检索”的简化逻辑，主张记忆唤起应由**情感状态或潜在需求**驱动。区别在于，MADial-Bench 更侧重**评估范式的建立**（区分被动/主动），而 ENPMR-Bench 更侧重**检索机制的设计**（需求→记忆类型的映射）。如果你在研究情感支持场景下的记忆利用，MADial-Bench 的“主动回忆子集”可以直接作为测试你方法在情绪触发场景下表现的评估工具。



------



### 二、用户画像/意图分析

| **工作**                               | **类型与发表信息**                              | **核心设计**                                                 | **代码公开状态与许可证**                                     | **精读** |
| -------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | -------- |
| **PersonaMem**                         | 动态画像基准 · **COLM 2025**                    | 用模拟的长期用户–助手对话检验模型能否理解用户特征、跟踪偏好变化，并在**新情境**中生成个性化回应。 ([proceedings.colm.cc](https://proceedings.colm.cc/paper_files/paper/2025/hash/b111aa30ab71255946b19b6bd4e68939-Abstract-Conference.html?utm_source=chatgpt.com)) | **代码和数据公开，仓库采用 MIT。** [代码与数据](https://github.com/bowen-upenn/PersonaMem) | -        |
| **Inside Out（PersonaTree）**          | 长期画像维护方法 · **ACL 2026 主会长文**        | 从持续对话中维护结构化画像，根据新证据对条目执行**新增、更新、删除或保留**，并在需要时进一步调取细节。 ([aclanthology.org](https://aclanthology.org/2026.acl-long.614/?utm_source=chatgpt.com)) | **未找到可核实的官方公开实现。**                             | -        |
| **PREFINFER**                          | 情境化偏好推断方法 · **Findings of EMNLP 2026** | 输入**用户–LLM 历史对话和当前请求**，推断此次请求适用的偏好。用合成历史训练，覆盖同一主题下因情境变化而不同的偏好。 ([aclanthology.org](https://aclanthology.org/2026.findings-emnlp.700/?utm_source=chatgpt.com)) | **代码、数据和模型公开，代码仓库采用 MIT。** [官方仓库](https://github.com/THU-KEG/PREFINFER) | -        |
| **PrefEval**                           | 长对话偏好基准 · **ICLR 2025**                  | 在长对话中插入显式或隐式偏好，测试模型在后续请求中能否**识别、记住并遵循**这些偏好。 ([proceedings.iclr.cc](https://proceedings.iclr.cc/paper_files/paper/2025/hash/28a46044775d97a4efcbcf14e7f13209-Abstract-Conference.html?utm_source=chatgpt.com)) | **代码和数据公开。** 仓库许可证为 **CC BY-NC 4.0**。[代码与评测数据](https://github.com/amazon-science/PrefEval) | -        |
| **Thinking Ahead（PGR／MemoryQuest）** | 目标驱动检索方法与基准 · **EMNLP 2026 主会**    | 在**查询时**从当前目标推演可能的后续步骤，再用这些步骤查找与原问题语义相似度低、但对任务有用的个人记忆。 ([aclanthology.org](https://aclanthology.org/2026.emnlp-main.2054/?utm_source=chatgpt.com)) | **代码和基准公开，未见代码许可证。** [代码与基准](https://github.com/harshita-chopra/PGR-mem) | -        |
| **T-Mem**                              | 联想式记忆检索方法 · **EMNLP 2026 主会**        | 在**写入时**为事实和对话片段生成未来的召回线索，使措辞差别很大、但存在潜在关联的请求也能触发相关记忆。 ([aclanthology.org](https://aclanthology.org/2026.emnlp-main.427/?utm_source=chatgpt.com)) | **代码和评测实现公开，仓库采用 MIT。** [代码](https://github.com/Sherlockwz/T-Mem) | -        |
| **BenchPreS**                          | 偏好适用性基准 · **EMNLP 2026 主会**            | 给定已记住的用户偏好，测试模型在不同沟通情境下**何时应用、何时抑制**该偏好，尤其关注涉及第三方和正式规范的情境。 ([aclanthology.org](https://aclanthology.org/2026.emnlp-main.1040/?utm_source=chatgpt.com)) | **数据公开，未核实独立的官方评测代码。** [数据](https://huggingface.co/datasets/sangyon/BenchPreS) | -        |
| **MemoryCD**                           | 跨领域用户记忆基准 · **Findings of EMNLP 2026** | 用同一用户跨多年、跨领域的**真实评论和行为记录**评测个性化，包含明确的跨领域设置，可参考其数据划分方式。 ([aclanthology.org](https://aclanthology.org/2026.findings-emnlp.1804/?utm_source=chatgpt.com)) | **代码和数据公开，代码仓库采用 MIT。** [代码](https://github.com/AgentMemoryWorld/MemoryCD) · [数据](https://huggingface.co/datasets/WZDavid/MemoryCD) | -        |
| **Persona2Web**                        | 用户意图消歧基准 · **ICML 2026**                | 通过带时间戳的**模拟网页行为历史**推断当前含糊请求中省略的偏好，再在真实网页上执行任务。适合参考如何构造「同一句请求有多个合理解释」的样本。 ([proceedings.mlr.press](https://proceedings.mlr.press/v306/kim26ap.html?utm_source=chatgpt.com)) | **代码和数据公开，未见代码许可证。** [代码](https://github.com/serin-kimm/Persona2Web) · [项目与数据](https://serin-kimm.github.io/Persona2Web/) | -        |



------



**MemGuide**，一个面向**目标导向多会话 LLM 智能体**的**意图驱动记忆选择框架**，核心创新在于将记忆检索从“语义相似”转向“任务意图对齐 + 槽位缺口补全”。

`# AAAI 2026 (Oral)`

> ​        MemGuide, a two-stage intent-driven memory selection framework for goal-oriented multi-session LLM agents, which retrieves goal-consistent QA-formatted memory units via Intent-Aligned Retrieval and then reranks them by slot-completion gain through Missing-Slot Guided Filtering, addressing the degradation of multi-session coherence caused by semantic-similarity-only retrieval.
>
> **重点研究：** 现有基于 RAG 的长期记忆方法优先考虑语义相似度而非任务意图，导致多会话任务导向对话中用户需要反复提供已给过的信息，对话连贯性和效率下降。

- PDF：https://ojs.aaai.org/index.php/AAAI/article/view/40313
- DOI：https://doi.org/10.1609/aaai.v40i36.40313
- 作者主页（含录用通知）：https://elvin-yiming-du.github.io/news/

MemGuide 的核心洞察是：在多会话任务导向对话（TOD）中，用户可能在多次会话中反复修改同一个任务（如订机票），语义相似的历史片段很多，但其中大部分对**推进当前任务**没有实际帮助。现有 RAG 方法用当前话语直接匹配历史文本，召回的是“说了什么像”，而非“要做什么一致”。

同时，构建了一套以**任务意图**和**槽位缺口**为核心的两阶段记忆选择框架：

- **核心能力定义**：MemGuide（Intent-Driven Memory Selection），即先对齐任务意图，再按“填补缺失槽位的边际收益”筛选记忆，而非依赖原始语义相似度。
- **第一阶段：意图对齐检索（Intent-Aligned Retrieval）**：用 LLM 从当前对话中抽取**任务意图**，再从 QA 格式的记忆库中检索具有**相同目标**的记忆单元，确保召回的记忆在“要做什么”层面相关。
- **第二阶段：缺失槽位引导过滤（Missing-Slot Guided Filtering）**：用 CoT 推理器枚举当前意图下**尚未填充或确认的任务槽位**（如订机票场景中已给目的地，则“出发日期”“座位偏好”为缺失槽位），再用**微调后的 LLaMA-8B 过滤器**对候选记忆逐一打分，评估其填补缺失槽位的概率，按边际槽位完成收益重排序。
- **主动生成策略**：生成模块拿到筛选后的核心事实后，主动利用记忆中的信息去确认或建议缺失槽位（如“上次您选了加航，这次还订加航吗？”），减少来回追问轮次。
- **配套基准 MS-TOD**：首个多会话任务导向对话基准，包含 **132 个多样化人设**、**956 个任务目标**、**2,861 段对话**、**18,530 条话语**，平均每用户 **21.67 个会话**，标注了意图对齐的记忆目标和确认型回应。

**🌟 主要实验结果**

- **任务成功率大幅提升**：在 MS-TOD 上，MemGuide 将任务成功率从 **88% 提升至 99%（+11%）**，同时将完成任务所需对话轮次平均**缩短 2.84 轮**。
- **缺失槽位过滤是关键增益来源**：去掉 Missing-Slot Guided Filtering 后，Qwen2.5-7B 的 JGA 从 0.74 骤降至 0.41，GPT-4o-mini 的对话轮次从 3.19 升至 4.30，说明细粒度记忆选择对准确率和交互效率都至关重要。
- **结构化 QA 记忆优于原始历史**：意图对齐检索配合 QA 格式记忆，相比检索原始对话历史，在 LLaMA3-8B 上 GPT-4 Score 从 5.09 提升至 6.34，Mistral-7B 从 5.86 提升至 6.71。
- **单会话任务上同样有效**：在 SGD 上达到 SOTA JGA 0.846，在 MultiWOZ2.2 上 JGA 0.879，表明 QA 记忆和槽位过滤机制在单会话 DST 任务中也具备泛化能力。
- **检索质量改善**：相比纯语义检索，Recall@5 平均提升 **7.7%**，text-embedding-3-small 从 0.792 提升至 0.832。

**MemGuide 与之前关注的工作的关系**：MemGuide 的“先对齐意图、再按缺口补全收益筛选”的思路，与 **ENPMR-Bench** 的“需求条件化检索”在逻辑上相通——都是用推理出的中间状态（任务意图 / 情感需求）作为检索条件，而非直接做语义匹配。区别在于场景：MemGuide 面向**任务完成效率**，ENPMR 面向**情感支持中的共情回应**。如果你在研究情感支持场景下的记忆检索，MemGuide 的“识别信息缺口 → 按补全收益排序”的过滤机制，在方法论上有直接借鉴价值。



------



**ReflectDiffu**，一个**轻量级、心理学启发的共情回复生成框架**，核心创新在于用“情感传染”感知情绪、用“意图模仿”的**双重反思机制（Exploring-Sampling-Correcting）** 将情绪映射为精确的回应意图，再以**扩散模型**在意图引导下生成回复。

`# ACL 2025 (Long Papers)`

> ReflectDiffu, a lightweight and comprehensive framework for empathetic response generation that integrates emotion contagion and intent mimicry within a reinforcement learning-refined diffusion framework, addressing empathetic misalignment stemming from emotional misrecognition without the computational overhead of LLMs.
>
> **重点研究：** 现有工作要么忽略了情绪与意图之间的复杂交互（导致共情可控性不足），要么依赖大语言模型（计算开销过大）。如何让轻量级模型有效完成“情绪决策 → 意图行动”的映射？

- PDF：https://aclanthology.org/2025.acl-long.1235.pdf
- ACL Anthology：https://aclanthology.org/2025.acl-long.1235/
- arXiv：https://arxiv.org/abs/2409.10289
- DOI：10.18653/v1/2025.acl-long.1235

ReflectDiffu 的核心洞察是：共情行为在心理学上是一条链——**感知对方情绪 → 产生意图 → 执行行动**。现有方法要么只关注情绪识别、忽略意图的中间作用，导致生成的回复“情绪对了但行动错了”；要么直接上 LLM，牺牲了轻量性。ReflectDiffu 的目标是用小模型复现这条认知链。

同时，构建了一套以**三个模块**为核心的框架：

- **核心能力定义**：ReflectDiffu，通过**情感传染（Emotion Contagion）** 增强情绪感知，通过**意图模仿（Intent Mimicry）** 的“双重反思”机制将情绪映射为意图，最终由扩散解码器在意图引导下生成回复。
- **模块一：情感传染编码器（Emotion Contagion Encoder）**：用**情感原因标注器（ERA）** 从对话中挖掘情绪成因，生成推理掩码，再用对比专家（Contrastive-Experts）做细粒度情绪分类。设计动机是“先理解为什么有这个情绪，再决定怎么回应”。
- **模块二：意图双重机制（Intent Twice Mechanism）**：粗到细的意图选择流程——
  - **Exploring**：根据情绪类别查询预定义的**情绪-意图映射表**，得到 top-3 候选意图（如“悲伤”对应“确认/安慰/鼓励”）。
  - **Sampling**：策略网络从候选意图中采样一个具体意图。
  - **Correcting**：用强化学习奖励信号修正意图选择，奖励 = BARTScore（回复质量）+ 情绪匹配度。
- **模块三：扩散回复解码器（Diffusion Response Decoder）**：用 DDPM 从噪声逐步去噪生成回复 token 嵌入，**意图向量作为条件输入**引导生成过程。扩散模型的多样性优于自回归、成，适合需要灵活表达的共情对话。
- **训练数据**：**EmpatheticDialogues** 数据集。

**🌟 主要实验结果**

- **意图准确率大幅领先**：ReflectDiffu 达到 **80.32% 的意图准确率**，远超所有基线模型。这是其“双重反思”机制有效性的最直接证据——模型确实学会了将情绪映射到正确的回应意图。
- **自动评估全面超越 SOTA**：相比此前最佳基线 CAB，ReflectDiffu 在 BLEU-1/2/3/4、BARTScore、情绪准确率（Acc_emo）和多样性（Distinct-2）上均有显著提升，其中情绪准确率提升约 **30.1%**，Distinct-2 提升约 **47.4%**。
- **轻量模型超越 LLM**：与 Llama-3.1-8B（few-shot CoT）相比，ReflectDiffu 在 BLEU、BARTScore、情绪准确率、意图准确率和多样性上均表现更优，同时保持**远低得多的计算开销**。这直接回应了论文“轻量 vs. LLM”的核心权衡问题。
- **人工评估一致胜出**：在共情（Emp.）、相关性（Rel.）、流畅性（Flu.）三个维度上，ReflectDiffu 对 MTRS、MOEL、MIME 等基线均取得显著胜率。例如对 MTRS，共情胜率 **51.1%** vs 败率 18.0%。

**与之前关注的工作的关系**：ReflectDiffu 和 **IAMM**（ACL 2024）都试图解决“共情生成不能只靠语义匹配”的问题，但路径不同。IAMM 在**理解阶段**做迭代关联词捕捉，ReflectDiffu 在**决策阶段**做情绪→意图的映射与修正。而你之前问的 **REG** 则是在**检索阶段**引入情感相似性。三者分别对应共情生成链路上的三个环节：检索什么范例 → 如何理解对话 → 如何决定回应意图。如果你在研究情感支持场景下的记忆利用，ReflectDiffu 的“意图作为情绪与回复之间的中间表示”这一设计，对“记忆检索后如何转化为恰当回应”有方法论参考价值。



------



**IntentionFrame**，一个用于**细粒度对话意图理解**的**半结构化多维度框架**，核心创新在于用“情境、情感、行为、知识”四个自由文本维度替代传统的刚性槽位结构或非结构化自由文本，并配套提出 **WeRG（弱监督强化生成）** 方法来低成本规模化生成高质量标注。

`# EMNLP 2025 (Main)`

> IntentionFrame, a semi-structured framework inspired by psychological and cognitive intention theories, which organizes conversational intents into four interrelated aspects: situation, emotion, action, and knowledge, paired with a Weakly-supervised Reinforced Generation (WeRG) method to efficiently scale annotations.
>
> **重点研究：** 现有对话意图理解方法要么依赖刚性的槽位-值结构，要么使用非结构化自由文本，都无法充分捕捉对话的复杂性。如何构建一个既能保持可解释性、又能为 LLM 提供丰富上下文的意图表示框架？

- PDF：https://aclanthology.org/2025.emnlp-main.1427.pdf
- ACL Anthology：https://aclanthology.org/2025.emnlp-main.1427/
- DOI：10.18653/v1/2025.emnlp-main.1427
- 作者：Jinggui Liang, Dung Vo, Lizi Liao（新加坡管理大学）

IntentionFrame 的核心洞察是：真正的对话意图不是“订机票”这样一个标签，也不是一段模糊的自由描述，而是由**情境、情感、行为、知识**四个维度交织构成的心理状态。这个设计受心理学与认知科学中“意图作为语义指针”理论的启发，将意图理解为绑定情境、情感评价、行为与自我知识的神经过程。

同时，构建了一套以**四维半结构化表示**为核心的框架：

- **核心能力定义**：IntentionFrame 将用户每一轮的意图表示为四元组 `⟨situation, emotion, action, knowledge⟩`，每个维度用**自由形式的自然语言**表达，而非预定义的静态本体。这既保留了可解释性，又避免了槽位结构的刚性限制。
  - **情境（Situation）**：当前对话涉及的物理或情境特征。
  - **情感（Emotion）**：用户表达的情感状态或评价。
  - **行为（Action）**：用户为实现目标而提及或采取的行动。
  - **知识（Knowledge）**：对话中提及的实体及相关知识。
- **WeRG 方法（弱监督强化生成）**：为了低成本规模化标注，WeRG 利用**少量高质量人工标注 + 大量粗粒度标注数据**作为弱监督信号，通过强化学习（KL 正则化目标）训练 LLM 生成可靠的 IntentionFrame 标注。数据配比设为 `D_coarse : D_mid : D_fine = 10 : 10 : 1`。
- **评测数据**：在 **DuRecDial** 和 **ESConv** 两个数据集上进行实验，后者是情感支持对话数据集，与你之前关注的情感支持场景有直接关联。额外在 **MSDialog** 上验证了跨域泛化能力。
- **标注质量**：人工评估采用 Aspect Description Validity（ADV）标准，四维度平均分在 **2.74–2.83**（满分 3 分），Fleiss‘ Kappa 为 0.48–0.64，达到中等至高度一致性。

**🌟 主要实验结果**

- **对话理解与下游任务均显著提升**：论文声称 IntentionFrame + WeRG 在对话理解（CU）和下游的**回应生成**与**任务完成**上均取得显著改善，自动指标与人工评估一致支持这一结论。
- **情感支持场景被纳入验证**：ESConv 上的标注质量（ADV 2.74–2.83，Kappa 0.50–0.63）表明该框架在情感支持对话中同样有效，这意味着它可能对你研究的情感支持记忆检索场景有借鉴价值。
- **跨域泛化得到验证**：在 MSDialog（信息寻求对话）上的实验显示 IntentionFrame 持续优于基线，证明四维设计是领域无关的，不局限于任务导向对话。
- **WeRG 解决了标注规模化瓶颈**：通过强化学习平衡粗粒度与细粒度监督信号，避免了纯人工标注的高成本，同时保持了标注质量。

**与之前关注的工作的关系**：IntentionFrame 的“四维意图表示”与你研究的 **ENPMR-Bench**（情感需求感知检索）在逻辑上有潜在连接——ENPMR 需要从对话中推断用户的情感需求，而 IntentionFrame 的“情感 + 情境 + 行为”维度恰好提供了更细粒度的意图信号。如果你在思考如何更准确地刻画“用户当前缺什么”，IntentionFrame 提供了一种比单一情感标签更丰富的表示方案。不过它本身不涉及**记忆检索**或**长期记忆**，是一个纯对话理解侧的框架。



------



**Just a Scratch**，一个用于提升 LLM **自伤检测中意图区分能力**的框架，核心创新在于将自伤表达细分为“随意提及（Casual Mention, CM）”与“严肃意图（Serious Intent, SI）”，并引入**表情符号的语境化解读**来捕捉文本之外的隐含信号。

`# ACL 2025 (Long Papers)`

> Just a Scratch, a unified framework enhancing LLMs’ comprehension of self-harm by distinguishing intent through nuanced language–emoji interplay, presenting the CESM-100 emoji matrix and the SHINES dataset with detailed annotations for self-harm labels, casual mentions (CMs), and serious intents (SIs).
>
> **重点研究：** 现有 LLM 难以区分自伤表达中的“随口一说”与“真实求助”，也忽略了表情符号在自伤语境下的语义偏移（如 🔪 可能暗示自伤，😂 可能掩盖痛苦）。如何让模型准确判断自伤表达的**真实意图层级**？

- PDF：https://aclanthology.org/2025.acl-long.1330.pdf
- ACL Anthology：https://aclanthology.org/2025.acl-long.1330/
- DOI：10.18653/v1/2025.acl-long.1330
- 资源页（数据集与代码）：https://www.iitp.ac.in/~ai-nlp-ml/resources.html#SHINES

Just a Scratch 的核心洞察是：社交媒体上的自伤表达具有**高度隐晦、依赖语境**的特点。同一句话在不同语境下可能是夸张修辞（“我还不如电死自己”），也可能是真实的求救信号（“我甚至不想看到明天”）。现有 LLM 在区分这种意图层级上表现不稳定，且几乎忽略了表情符号在自伤语境中的**语义漂移**——一个 😂 可能是在用笑声掩盖痛苦，而非表达快乐。

同时，构建了一套以**意图分层 + 表情语境化**为核心的框架：

- **核心能力定义**：将自伤检测从简单的二分类（自伤/非自伤）升级为**意图分层任务**——区分“随意提及（CM）”与“严肃意图（SI）”，并生成可解释的判定理由。
- **CESM-100（百表情敏感度矩阵）**：精选 **100 个表情符号**，为每个符号提供**自伤语境下的特定解读**。例如，🔪 在普通语境中是“刀”，在自伤语境中可能暗示工具或方法；😂 可能表示“用幽默掩饰痛苦”。
- **SHINES 数据集**：包含 **5,206 条**社交媒体帖子，提供三层标注——自伤标签（自伤/非自伤）、CM/SI 跨度标注、表情解释。其中 4,206 条来自 Reddit 心理健康版块（经 Presidio 去标识化，三名标注者独立标注，Fleiss‘ κ = 0.78），另有 1,000 条由 ChatGPT-3.5 合成并经人工修正表情标注。
- **三阶段统一框架**：
  - **输入增强**：将帖子文本与 CESM-100 的表情解读合并输入。
  - **多任务微调**：主任务为自伤检测，辅助任务为 CM/SI 跨度抽取，联合训练。
  - **解释生成**：基于分类与跨度结果，生成可解释的判定理由。
- **评估模型**：Llama 3、Mental-Alpaca、MentalLlama，覆盖零样本、少样本、微调三种设置。

**🌟 主要实验结果**

- **F1 从 0.74 提升至 0.88**：多任务微调 + CESM-100 的组合将 LLM 的自伤检测 F1 从零样本基线的 **0.74** 提升至 **0.88**，说明意图分层与表情语境化确实提供了有效信号。
- **意图区分是核心增益来源**：将 CM/SI 跨度检测作为辅助任务联合训练，迫使模型学习“随口提及”与“严肃意图”之间的边界，这比单纯增加训练数据更有效。
- **表情矩阵弥补了纯文本的盲区**：CESM-100 为模型提供了表情符号在自伤语境下的“翻译表”，使模型能够利用此前被忽略的非文本信号。
- **可解释性同步提升**：框架在提升检测性能的同时，生成判定理由，使预测结果对人工审核更有参考价值。

**与之前关注的工作的关系**：Just a Scratch 的核心逻辑——“**同一表面表达下存在不同的真实意图层级**”——与 **ENPMR-Bench** 的“需求推断”有结构上的呼应。ENPMR 要求模型从对话中推断用户**潜在的情感需求**（而非字面内容），Just a Scratch 则要求模型从帖子中推断自伤表达的**真实意图层级**（而非表面修辞）。两者都指向同一个问题：**表面语义不足以支撑高风险的决策，需要额外的推理层来捕捉隐含信号**。如果你在研究情感支持场景中的意图理解，Just a Scratch 的“CM/SI 分层”思路可以作为“如何操作化意图粒度”的参考案例。



------



 **IntentionFrame**，一个用于**细粒度对话意图理解**的**半结构化多维度框架**，核心创新在于用“情境、情感、行为、知识”四个自由文本维度替代传统的刚性槽位结构或非结构化自由文本，并配套提出 **WeRG（弱监督强化生成）** 方法来低成本规模化生成高质量标注。

`# EMNLP 2025 (Main)`

> ​        IntentionFrame, a semi-structured framework inspired by psychological and cognitive intention theories, which organizes conversational intents into four interrelated aspects: situation, emotion, action, and knowledge, paired with a Weakly-supervised Reinforced Generation (WeRG) method to efficiently scale annotations.
>
> **重点研究：** 现有对话意图理解方法要么依赖刚性的槽位-值结构，要么使用非结构化自由文本，都无法充分捕捉对话的复杂性。如何构建一个既能保持可解释性、又能为 LLM 提供丰富上下文的意图表示框架？

- PDF：https://aclanthology.org/2025.emnlp-main.1427.pdf
- ACL Anthology：https://aclanthology.org/2025.emnlp-main.1427/
- DOI：10.18653/v1/2025.emnlp-main.1427

IntentionFrame 的核心洞察是：真正的对话意图不是“订机票”这样一个标签，也不是一段模糊的自由描述，而是由**情境、情感、行为、知识**四个维度交织构成的心理状态。这个设计受心理学与认知科学中“意图作为语义指针”理论的启发 。

同时，构建了一套以**四维半结构化表示**为核心的框架：

- **核心能力定义**：IntentionFrame 将用户每一轮的意图表示为四元组 `⟨situation, emotion, action, knowledge⟩`，每个维度用**自由形式的自然语言**表达，而非预定义的静态本体。这既保留了可解释性，又避免了槽位结构的刚性限制 。
  - **情境（Situation）**：当前对话涉及的物理或情境特征。
  - **情感（Emotion）**：用户表达的情感状态或评价。
  - **行为（Action）**：用户为实现目标而提及或采取的行动。
  - **知识（Knowledge）**：对话中提及的实体及相关知识。
- **WeRG 方法（弱监督强化生成）**：为了低成本规模化标注，WeRG 利用**少量高质量人工标注 + 大量粗粒度标注数据**作为弱监督信号，通过强化学习（KL 正则化目标）训练 LLM 生成可靠的 IntentionFrame 标注。数据配比设为 `D_coarse : D_mid : D_fine = 10 : 10 : 1` 。
- **评测数据**：在 **DuRecDial** 和 **ESConv** 两个数据集上进行实验，后者是情感支持对话数据集，与你之前关注的情感支持场景有直接关联 。额外在 **MSDialog** 上验证了跨域泛化能力 。
- **标注质量**：人工评估采用 Aspect Description Validity（ADV）标准，四维度平均分在 **2.74–2.83**（满分 3 分），Fleiss‘ Kappa 为 0.48–0.64，达到中等至高度一致性 。

**🌟 主要实验结果**

- **对话理解与下游任务均显著提升**：论文声称 IntentionFrame + WeRG 在对话理解（CU）和下游的**回应生成**与**任务完成**上均取得显著改善，自动指标与人工评估一致支持这一结论 。
- **情感支持场景被纳入验证**：ESConv 上的标注质量（ADV 2.74–2.83，Kappa 0.50–0.63）表明该框架在情感支持对话中同样有效，这意味着它可能对你研究的情感支持记忆检索场景有借鉴价值 。
- **跨域泛化得到验证**：在 MSDialog（信息寻求对话）上的实验显示 IntentionFrame 持续优于基线，证明四维设计是领域无关的，不局限于任务导向对话 。
- **WeRG 解决了标注规模化瓶颈**：通过强化学习平衡粗粒度与细粒度监督信号，避免了纯人工标注的高成本，同时保持了标注质量 。





### 三、教育相关

| **工作**       | **类型与发表信息**                                           | **核心设计**                                                 | **代码公开状态与许可证**                                     | **精读**                                                     |
| -------------- | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| **LongTutor**  | 长期个性化辅导基准 · **ACL 2026 主会长文**                   | 基于真实学生练习日志，按**历史证据获取 → 知识状态诊断 → 自适应教学行动**三步评测。用专家标注构建基准，并用生成器–验证器管线扩展样本。 ([aclanthology.org](https://aclanthology.org/2026.acl-long.1371/?utm_source=chatgpt.com)) | **代码和数据公开。** 提供历史特征构建、样本生成、推理和评测脚本。论文将**评测脚本**标为 MIT，数据标为 CC BY 4.0。[代码与数据](https://github.com/liano3/LongTutor) ([github.com](https://github.com/liano3/LongTutor?utm_source=chatgpt.com)) | -                                                            |
| **LEAP／LEAD** | 长期辅导规划系统与配套数据集 · **AAAI 2026 主会**            | 从过往辅导对话中提取认知状态，跟踪学生的**跨题学习进度**，结合直接规划与深度推理生成教学支架。LEAD 用 PTA 的真实代码提交记录作为基础，再模拟师生对话。 ([ojs.aaai.org](https://ojs.aaai.org/index.php/AAAI/article/view/36984?utm_source=chatgpt.com)) | **代码和部分数据公开。** 官方仓库包含认知建模、规划、训练代码及 `LEAD/cpp.json`，未见代码许可证。[代码与数据](https://github.com/PlayerDza/LEAP) ([github.com](https://github.com/PlayerDza/LEAP?utm_source=chatgpt.com)) | -                                                            |
| **ScaffoldLM** | 多轮数学辅导框架 · **ACL 2026 主会长文**                     | 先生成分步教学计划，再在**单次辅导会话内**逐轮评估学生状态、判断当前步骤是否达成，并据此更新记忆和选择下一步辅导动作。 ([aclanthology.org](https://aclanthology.org/2026.acl-long.325/?utm_source=chatgpt.com)) | **代码公开。** 提供数据合成、模型服务和训练脚本，README 标注 **CC BY 4.0**。[代码](https://github.com/BNU-ERC-ITEA/ScaffoldLM) · [模型](https://huggingface.co/ffffddddsss/scaffoldLM-7B) ([github.com](https://github.com/BNU-ERC-ITEA/ScaffoldLM?utm_source=chatgpt.com)) | -                                                            |
| **Who Am I?**  | 历史感知学生模拟框架 · **EMNLP 2026 主会**                   | 将学生过去的**答题与辅导对话**压缩为包含知识状态和行为倾向的文本画像。模拟器用画像预测后续学生话语，再以模拟表现为奖励，用 GRPO 优化画像生成器。 ([aclanthology.org](https://aclanthology.org/2026.emnlp-main.415/?utm_source=chatgpt.com)) | **代码公开，论文数据尚待发布。** 提供画像训练、学生模拟和评测代码。README 表示数据完成去标识化后发布，未见代码许可证。[代码](https://github.com/umass-ml4ed/dialogue_student_sim) ([github.com](https://github.com/umass-ml4ed/dialogue_student_sim?utm_source=chatgpt.com)) | -                                                            |
| **EduAdapt**   | 年级适应性问答基准 · **EMNLP 2025 主会**                     | 提供约 **4.8 万条**带年级标签的科学问答，覆盖 1–12 年级和 9 个科学科目。用选择题考察答题准确率，用开放题考察回答的年级适配性。 ([aclanthology.org](https://aclanthology.org/2025.emnlp-main.1736/?utm_source=chatgpt.com)) | **代码暂时移除，数据公开。** 官方仓库目前仅有 README，作者说明更新期间移除了代码。Hugging Face 数据页标注 **Apache 2.0**。[仓库说明](https://github.com/NaumanNaeem/EduAdapt/blob/main/README.md) · [数据](https://huggingface.co/datasets/Numaanmbz/EduAdapt) ([huggingface.co](https://huggingface.co/datasets/Numaanmbz/EduAdapt?utm_source=chatgpt.com)) | https://mr-iodin.github.io/my_wiki/2026/EDUADAPT_%E6%96%87%E7%8C%AE%E7%B2%BE%E8%AF%BB/ |
| **ELI-Why**    | 教学解释效用基准 · **Findings of ACL 2025**                  | 收录约 **1.34 万个「为什么」问题**。通过两项人类研究，分别考察教育者能否识别解释的目标教育层级，以及学习者认为解释是否满足自己的信息需求。 ([aclanthology.org](https://aclanthology.org/2025.findings-acl.1306/?utm_source=chatgpt.com)) | **部分分析脚本和数据公开。** 提供可读性、相似度等分析脚本，未见代码许可证。[代码](https://github.com/INK-USC/ELI-Why) · [数据](https://huggingface.co/datasets/INK-USC/eli-why) ([github.com](https://github.com/INK-USC/ELI-Why?utm_source=chatgpt.com)) | -                                                            |
| **MathBuddy**  | 多模态情感感知数学辅导系统 · **EMNLP 2025 System Demonstrations** | 融合学生当轮话语与近期面部表情，估计**当前情绪状态**，再在挑战和激励两种辅导策略之间切换。 ([aclanthology.org](https://aclanthology.org/2025.emnlp-demos.63/?utm_source=chatgpt.com)) | **代码和标注数据公开。** 仓库含前后端和情绪标注。代码采用 **Apache 2.0**，数据采用 **CC BY-SA 4.0**。[代码与数据](https://github.com/ITU-NLP/MathBuddy) ([GitHub](https://github.com/ITU-NLP/MathBuddy?utm_source=chatgpt.com)) | -                                                            |



------



​        **LongTutor**，一个用于评估 LLM 在**长期个性化辅导**中表现的基准测试集，核心创新在于将辅导评估从“孤立短交互”推进到“基于长期学习历史的诊断与教学”范式。

`# ACL 2026 (Long Papers)`

> ​        LongTutor, a benchmark for long-term personalized tutoring grounded in formative assessment theory, built from expert-annotated real-world learning logs, evaluating LLMs across three progressive tasks: historical evidence acquisition, knowledge state diagnosis, and adaptive teaching action.
>
> **重点研究：** 现有 LLM 辅导评估主要关注孤立、短期的交互，忽略了学习的长期本质。LLM 能否有效利用学生的长期学习历史，进行准确的知识状态诊断并采取自适应教学行动？

- PDF：https://aclanthology.org/2026.acl-long.1371.pdf
- ACL Anthology：https://aclanthology.org/2026.acl-long.1371/
- DOI：10.18653/v1/2026.acl-long.1371
- Checklist：https://aclanthology.org/attachments/2026.acl-long.1371.checklist.pdf

LongTutor 的核心洞察是：真正有效的辅导不是一次性的问答，而是基于**形成性评价理论**，从学生长期解题历史中诊断知识状态，再据此采取自适应教学策略。现有基准（如 MathTutorBench、EduBench）将辅导视为孤立快照，绕过了“从历史中挖掘潜在知识状态”这一核心能力 。

LongTutor 将这条链拆成 **历史证据获取 → 知识状态诊断 → 自适应教学** 三个评测任务，构建了一套以**三项递进任务**为核心的评估框架：

- **核心能力定义**：LongTutor 围绕三个渐进能力组织评估——**历史证据获取（Historical Evidence Acquisition）**、**知识状态诊断（Knowledge State Diagnosis）**、**自适应教学行动（Adaptive Teaching Action）** 。
- **任务一：历史证据获取**：从学生长期解题记录（问题文本、知识点、时间戳、对错标签）中定位与当前问题相关的历史证据。
- **任务二：知识状态诊断**：基于获取的证据进行认知推理，将学生当前错误归因到具体的知识状态缺陷（如概念缺口），对齐修订版 Bloom 分类学的知识维度 。
- **任务三：自适应教学行动**：基于诊断出的知识状态，采取自适应教学策略（如类比迁移）来搭建问题解决的脚手架 。
- **数据构建**：基于真实世界学习日志 **XES3G5M** 进行专家标注扩展，采用**双专家独立标注 + 仲裁**的严格质控流程，标注者间一致性 Cohen‘s Kappa = **0.90** 。
- **自动化扩展管线**：为突破人工标注的规模瓶颈，提出 **generator–verifier 管线**，合成数据与人工标注的标签一致性达到 Cohen‘s Kappa = **0.81**，为向更大数据集和多学科领域扩展提供了低成本路径 。
- **评估设置**：输入为学生最近 **100 条**练习记录构成的长期上下文，采用统一零样本提示模板 。教学行动任务使用 **LLM-as-a-Judge**，从历史利用、策略对齐、恰当性、连贯性四个维度以 1-5 分打分 。

| 维度         | 评估指向（基于论文任务设计推断）                             | 评分方式 |
| :----------- | :----------------------------------------------------------- | :------- |
| **历史利用** | 教学回应是否有效利用了学生长期学习历史中的证据（如过往错题、知识点记录），而非脱离历史给出通用回答 | 1-5 分   |
| **策略对齐** | 所采用的教学策略是否与诊断出的知识状态相匹配（如针对概念缺口使用类比迁移等自适应策略） | 1-5 分   |
| **恰当性**   | 教学回应的内容与语气是否适合当前学生的知识水平和学习情境，是否避免了不恰当的难度跳跃或误导 | 1-5 分   |
| **连贯性**   | 教学回应内部逻辑是否连贯，以及与对话上下文（前序诊断、学生当前问题）是否保持一致 | 1-5 分   |



**🌟 主要实验结果**

- **LLM 在证据获取上表现良好，但在诊断和教学上显著不足**：实验揭示了关键的能力错配——模型擅长基础的历史证据检索，但在需要深层认知推理的**知识状态诊断**和**自适应教学行动**上表现明显落后 。这表明当前 LLM 尚不能有效利用学生的长期学习历史来实现个性化辅导。
- **长期上下文利用是核心瓶颈**：开源中文模型（如 DeepSeek-V3.2、GLM-4.6）在教学质量和连贯性上具有竞争力，但在**长上下文利用**上存在显著差距 。
- **检索策略对比揭示时间邻近并非最优**：论文对比了固定时间窗口与基于知识点匹配的**过滤历史（Filtered History）** 策略，后者优先考虑语义相关性而非时间邻近性，为长期历史利用提供了替代思路 。
- **基准的可扩展性得到验证**：generator–verifier 管线在标签和排序一致性上达到 Kappa 0.81，证明自动化扩展是可行的，为构建真正长期的 AI 辅导系统铺平了道路 。

​        **LongTutor 与之前关注的工作的关系**：LongTutor 的“从长期历史中诊断状态 → 据此采取行动”的逻辑，与 **MemGuide** 的“识别任务意图 → 按槽位缺口筛选记忆”在结构上有相通之处——都是**先推理出中间状态，再以此指导后续行为**。区别在于，MemGuide 面向任务完成效率，LongTutor 面向教学诊断与干预。如果你在研究长期记忆在个性化场景中的应用，LongTutor 的“三项递进任务”设计（证据 → 诊断 → 行动）提供了一个清晰的评估分层范式。



------



**LEAP**，一个用于**个性化教育中的自适应辅导对话规划**的长期教育自适应规划系统，核心创新在于通过**认知状态记忆**捕捉学生的长期学习进度，并采用“直接规划 + 深思熟虑推理”的协作机制，在效率与教学质量之间取得平衡。

`# AAAI 2026 (Main)`

> LEAP, a Long-term Educational Adaptive Planning system that models students' long-term learning processes through cognitive state extraction, and plans scaffolds via collaboration of direct planning and thoughtful reasoning to improve efficiency while aligning with personalized needs.
>
> **重点研究：** 基于 LLM 的智能辅导系统虽然能生成有帮助的支架式教学对话，但由于**忽视学生的长期学习过程**，无法提供符合个性化需求的教学支架。同时，通过复杂推理追求更合适的支架会带来额外的计算开销。如何让辅导系统“记住”学生跨问题的长期表现，并以高效方式规划个性化支架？

- PDF：https://ojs.aaai.org/index.php/AAAI/article/view/36984
- DOI：https://doi.org/10.1609/aaai.v40i1.36984
- 作者：Zhiang Dong, Zhenlong Dai, Xiangwei Lv, Jingyuan Chen（浙江大学）

LEAP 的核心洞察是：一个好的教师不仅看学生“这道题做得怎么样”，更看学生“一直以来在哪些概念上反复挣扎”。现有 LLM 辅导系统大多只关注当前对话，缺乏对学生**跨问题、跨课程**长期学习状态的建模，导致支架要么过于笼统，要么需要昂贵的逐步推理。

同时，构建了一套以**认知状态记忆 + 协作规划**为核心的框架：

- **核心能力定义**：LEAP（Long-term Educational Adaptive Planning），即系统能够**提取并维护学生的认知状态**，并据此高效规划个性化的教学支架。
- **认知状态提取（Cognitive State Extraction）**：系统从历史对话中生成核心摘要，存入**认知状态记忆库（Cognitive Status Memory）**。检索时同时考虑**语义相似度**和**概念覆盖度**（当前对话涉及的概念与历史摘要的重叠程度），并引入时间衰减机制，过期记忆会被删除以维护时效性。
- **协作规划机制**：针对不同教学情境采用双路径策略——解决**已确认掌握**的知识点时，采用 **Enlighten Scaffold** 快速直接地提供帮助；面对**不确定**的知识点时，则启动**深思熟虑的推理**，寻找能给学生最大启发的支架。这种设计在效率与质量之间做了显式权衡。
- **配套数据集 LEAD（Long-term Educational Archive Dataset）**：基于在线教育平台 PTA 的真实学生多轮代码提交数据构建。通过 **Dean-Teacher-Student 多智能体框架**（由 GPT-4o 驱动）模拟师生互动，利用 Code Diff 捕捉学生多次提交间的理解变化，从而生成反映学习过程的辅导对话。覆盖**数据结构与算法分析、C++ 程序设计、多元统计分析**三门课程。

**🌟 主要实验结果**

- **长期学习过程建模是核心增益来源**：LEAP 的核心贡献在于将“同一学生在不同问题上的表现”纳入辅导规划，而非仅依赖当前对话。这直接回应了论文指出的现有系统缺陷——忽视学生的长期学习过程。
- **效率与质量的显式权衡**：通过“直接规划 vs. 深思熟虑推理”的协作机制，LEAP 在不需要复杂推理的场景下快速响应，在需要时再投入计算资源，避免了“所有情况都做深度推理”带来的开销。
- **数据集构建的局限性（需注意）**：LEAD 数据集通过多智能体模拟生成，而非采集真实师生对话。这意味着模型学到的可能是“GPT 风格的教学对话分布”，而非真实教师的策略分布，泛化能力存在潜在限制。

**与之前关注的工作的关系**：LEAP 和 **LongTutor** 都聚焦“长期学习历史”在教育中的应用，但定位不同。LongTutor 是**基准**，评估模型能否从长期历史中诊断知识状态并采取教学行动；LEAP 是**系统**，实际构建了一个能维护认知状态并规划支架的辅导框架。LEAP 的“认知状态记忆检索”机制——同时考虑语义相似度与概念覆盖度——与 **MemGuide** 的“意图对齐 + 槽位缺口”在思路上有相通之处：都不是单纯依赖语义匹配来找记忆，而是引入**任务相关的结构化信号**来筛选真正有用的历史。如果你在研究记忆检索在教育场景中的应用，LEAP 的“概念覆盖度 + 时间衰减”检索评分提供了一个可借鉴的具体设计。



------



**ScaffoldLM**，一个用于**多轮数学对话辅导**的**规划引导 + 评估驱动记忆**框架，核心创新在于用“分步教学计划”作为稳定骨架、用“评估驱动的控制循环”动态更新辅导记忆，从而在提供显式支架的同时适配学习者不断变化的认知状态。

`# ACL 2026 (Long Papers)`

> ScaffoldLM, a planning-guided tutoring framework with an assessment-driven memory for multi-turn math dialogue tutoring, which first generates a stepwise pedagogical plan as a stable backbone for explicit scaffolding, and during tutoring updates memory via an assessment-driven control loop that infers the learner's cognitive state, evaluates step-target completion, and adaptively selects tutoring actions.
>
> **重点研究：** 现有方法通过模拟辅导行为或偏好来 prompt/微调 LLM，但往往无法维持高质量的教學对话——既缺乏显式的分步支架，也无法适配学习者**不断演变的认知状态**。如何让辅导系统既有稳定的教学结构，又能根据学生的实时状态动态调整？

- PDF：https://aclanthology.org/2026.acl-long.325.pdf
- ACL Anthology：https://aclanthology.org/2026.acl-long.325/
- DOI：10.18653/v1/2026.acl-long.325
- GitHub：https://github.com/BNU-ERC-ITEA/ScaffoldLM

ScaffoldLM 的核心洞察是：好的辅导需要**两条线同时走**。一条是“计划线”——把解题过程拆成中间目标，确保支架有逻辑骨架、不泄露答案；另一条是“状态线”——实时判断学生当前处于哪个认知状态、当前步骤是否达成，据此选择下一步辅导动作。现有方法要么只有骨架（僵硬），要么只有反应（散乱），两者没有真正耦合。

同时，构建了一套以**规划 + 评估驱动记忆**为核心的框架：

- **核心能力定义**：ScaffoldLM 将辅导建模为多轮交互。每轮中，辅导器基于工作记忆 `M_{i-1}` 和学习者话语生成回应。记忆 `M` 包含：**分步教学计划、当前活跃步骤、步骤级进度、推断的学习者状态、对话历史**。
- **分步教学计划（Stepwise Pedagogical Planning）**：从解题步骤生成显式的分步计划，将问题分解为中间目标。这是支架的“稳定骨架”，确保辅导始终朝着正确的逻辑方向推进，而不是随机反应。
- **评估驱动的控制循环（Assessment-Driven Control Loop）**：每轮中，系统先**评估学习者回应**，推断其认知状态（如理解、困惑、部分正确），再判断当前步骤目标是否达成，然后**自适应选择辅导动作**。记忆随之更新，支持连贯的多轮引导。
- **一致性约束的数据合成**：用双智能体模拟流水线生成训练数据——Learner Agent 扮演采样出的认知状态，Tutor Agent 评估并回应。只有**当辅导器的评估与学习者意图状态一致时**，该轮次才被保留，确保训练数据中“状态-动作”监督的可靠性。

**🌟 主要实验结果**

- **辅导质量显著优于强基线**：在多轮数学辅导基准上，ScaffoldLM 在教学质量上大幅领先。其优势来自结构化设计——分步计划提供了中间引导目标，使模型能有效帮助学习者**而不泄露最终答案**。
- **在“泄露答案”与“帮助学习者”之间取得更优平衡**：Pareto 前沿分析显示，即使没有显式优化奖励权衡，引入教学结构本身就让 ScaffoldLM 在“帮助解题”和“限制过早揭示”之间达到了显著更优的平衡点。
- **推理能力未退化**：ScaffoldLM-7B 在 Math-500、OlympiadBench、TheoremQA 上的表现与骨干模型 Qwen2.5-7B-Instruct 基本持平（Math-500 仅 -1.2，OlympiadBench +0.5，TheoremQA -0.3），说明支架式微调成功注入了教学行为，而没有牺牲基础数学推理能力。

**与之前关注的工作的关系**：ScaffoldLM 和 **LEAP** 都涉及“长期/多轮教育中的记忆与规划”，但切入层面不同。LEAP 关注**跨问题的长期认知状态记忆**（学生在不同题目间的持续表现），ScaffoldLM 关注**单次辅导会话内的步骤级状态追踪与计划推进**。两者在“评估驱动”这一点上相通：都不是被动存储历史，而是**主动评估状态、据此决定下一步动作**。如果你在研究记忆在教育场景中的利用，ScaffoldLM 的“计划作为稳定骨架 + 状态评估作为动态调节”的双层结构，提供了一个比单纯“检索历史”更精细的设计范式。作者自述的局限也值得注意：训练数据以合成数学数据为主，对开放式或主观学科的适用性尚未验证。



------



**Who Am I?**，一个用于**辅导对话中学生模拟**的**历史感知画像**框架，核心创新在于提出“历史条件化学生模拟”任务，并设计两阶段强化学习框架——画像生成器压缩学生历史，模拟器基于画像预测学生话语，两者联合优化以生成忠实于学生真实知识状态与行为倾向的模拟。

`# EMNLP 2026 (Main)`

> Who Am I? History-Aware Profiles for Student Simulation in Tutoring Dialogues, a framework for history-conditioned student simulation that leverages a student’s past question-answering and dialogue records to generate profiles, enabling LLM-based simulators to faithfully role-play students in future tutoring dialogues.
>
> **重点研究：** 现有学生模拟工作大多只关注“对话内”模拟，缺乏对学生知识状态和行为倾向的上下文，部分原因是未基于学生过去的答题或对话交互。如何利用学生的长期学习历史，让 LLM 模拟出“像这个学生”的回应，而非泛泛的“像一个学生”？

- PDF：https://aclanthology.org/2026.emnlp-main.415.pdf
- ACL Anthology：https://aclanthology.org/2026.emnlp-main.415/
- arXiv：https://arxiv.org/abs/2605.30051
- DOI：10.18653/2026.emnlp-main.415

Who Am I? 的核心洞察是：**模拟一个具体学生，和模拟“学生”这个角色，是两回事**。一个学生过去的答题记录（哪些知识点反复错）和对话记录（遇到困难时怎么说、向辅导者求助的频率和方式）共同构成了他的“学习指纹”。只用当前对话上下文去 prompt LLM 扮演学生，生成出来的话语可能“像学生”，但不像**这个**学生。

同时，构建了一套以**“画像生成 + 模拟器”两组件**为核心的框架：

- **核心能力定义**：**历史条件化学生模拟（History-Conditioned Student Simulation）**。给定学生 u*u* 在时间步 j*j* 之前的历史 h≺ju*h*≺*j**u*（包含答题记录 xQA*x**Q**A* 和对话记录 xD*x**D*），目标是忠实预测该学生在后续辅导对话中的话语轮次 s^i∼MS(s∣s<i,t≤i,qu,j,pu,j)*s*^*i*∼M*S*(*s*∣*s*<*i*,*t*≤*i*,*q**u*,*j*,*p**u*,*j*)，其中 pu,j*p**u*,*j* 是从历史压缩得到的**画像（profile）**。
- **画像生成器（Profile Generator）**：将学生历史压缩为结构化文本画像，同时捕捉**知识状态**（已掌握/未掌握的概念、具体误解）和**行为倾向**（对话行为类型、语言风格）。画像不是通用摘要，而是专门为“预测该学生未来对话行为”优化的表示。
- **学生模拟器（Student Simulator）**：基于画像和当前对话上下文，生成下一轮学生话语。训练流程为：先 **SFT**，再 **DPO**（偏好优化），最后用 **GRPO** 对画像生成器做强化学习——以**下游对话模拟的忠实度**作为奖励信号，反向优化画像应该保留什么信息。
- **数据集**：从真实数学学习平台收集的**首个**学生辅导对话 + 答题记录数据集。包含 **670 名学生**、**66,705 条答题记录**、**1,775 段辅导对话**，涵盖代数、几何、数论等主题。

**🌟 主要实验结果**

- **画像 + RL 联合优化显著优于基线**：在对话行为匹配（Acts）、回答正确性（Corr.）、误解匹配（Errors）等指标上，RL 优化后的画像（ProfileRL）在 Acts 上达到 **0.644**，Errors 达到 **0.149**，显著优于所有基线（p < 0.05）。关键增益来自 GRPO：没有它，画像生成器不知道历史中**哪部分信息**对预测未来对话有用。
- **答题历史和对话历史是互补信号，缺一不可**：消融实验显示，移除画像中的“行为”部分主要损害 Acts 和语言相似度指标，但**同时也会降低 Corr. 和 Errors**——学生怎么说话透露了他们是否真的理解。反之，移除“知识”部分对 Corr./Errors 打击最大，但也会损害 Acts——学生的知识水平决定了他们倾向于求助还是沉默。
- **仅靠 SFT 不足以实现忠实模拟**：去掉 DPO（模拟器偏好优化）和 GRPO（画像优化）后，Acts 从 0.605 降至 0.589，Corr. 从 0.466 降至 0.436，Errors 从 0.150 降至 0.115。说明“压缩画像 + 只用 SFT 模拟”无法捕捉学生行为的细粒度差异。
- **RL 优化让画像从“泛泛描述”变为“可操作证据”**：定性案例显示，GPT 生成的原始画像可能说“未发现重复误解”，而 GRPO 优化后的画像会明确指出“学生在 Squares/Cubes 等知识点上有具体误解”，并引用学生原话如 “i dont understand” 作为语言风格证据——这些才是预测未来对话行为真正有用的信息。

**与之前关注的工作的关系**：Who Am I? 和 **ScaffoldLM**、**LEAP** 都涉及教育场景中的“学生状态建模”，但方向相反。ScaffoldLM 和 LEAP 是**辅导者侧**：用记忆/评估来规划教学动作；Who Am I? 是**学生侧**：用历史来模拟学生的反应，目的是为辅导模型提供可复用的评估环境。它的核心方法论——**用下游任务的表现作为奖励信号，反向优化历史压缩的“画像”**——与 **ENPMR-Bench** 的“需求条件化检索”在逻辑上有相通之处：都不是直接优化“摘要好不好”，而是优化“压缩后的表示对下游任务有没有用”。如果你在研究如何从长期历史中提取对特定任务有用的用户表示，Who Am I? 的 GRPO 画像优化提供了一个可借鉴的训练范式。



------



**EduAdapt**，一个用于评估 LLM **年级适应性（Grade-Level Adaptability）** 的问答基准数据集，核心创新在于首次为 K-12 全学段（1-12 年级）构建了带年级标签的科学 QA 对，系统性地暴露了模型在低年级（1-5 年级）内容生成上的系统性缺陷。

`# EMNLP 2025 (Main)`

> EduAdapt, the first dataset and evaluation framework for assessing grade-level adaptability in LLMs, comprising nearly 48k grade-labeled QA pairs across nine science subjects spanning Grades 1-12, revealing that even larger models struggle to generate developmentally appropriate responses for early-grade students.
>
> **重点研究：** LLM 在学术基准上表现强劲，但往往无法根据学生的年级水平调整回答。K-12 教育中，适龄的词汇和解释对有效学习至关重要，而现有模型常为低年级学生生成过于高级或模糊的输出，且缺乏标准化基准来评估这种跨认知发展阶段的适应能力。

- PDF：https://aclanthology.org/2025.emnlp-main.1736.pdf
- ACL Anthology：https://aclanthology.org/2025.emnlp-main.1736/
- arXiv：https://arxiv.org/abs/2510.17389
- DOI：https://doi.org/10.18653/v1/2025.emnlp-main.1736
- GitHub：https://github.com/NaumanNaeem/EduAdapt

EduAdapt 的核心洞察是：**答对题不等于教得对**。一个模型可以准确回答“光合作用是什么”，但给二年级学生的解释和给十二年级学生的解释应该有本质差异。现有基准（MMLU、GSM8K）只测“是否正确”，不测“是否适合这个年龄段的学生”。

同时，构建了一套以**年级分层 + 多维质量评估**为核心的框架：

- **核心能力定义**：EduAdapt（Educational Adaptability），即模型能否根据目标年级的认知水平，调整词汇复杂度、概念深度和解释风格。
- **年级分层**：将 1-12 年级重组为四个发展阶段——**1-2 年级、3-5 年级、6-8 年级、9-12 年级**，以捕捉认知发展的关键跃迁。
- **数据规模**：从约 **166,000** 条初始 QA 对中，经自反思评分（五项标准均需 ≥8/10）过滤后，保留 **47,734 条**高质量 QA 对，涵盖 **9 个科学科目**（生物、物理、化学、计算机、生态、地理、地质、医学、气象），对齐 **NGSS**（下一代科学标准）。数据集划分为：训练集 28,640 / 开发集 9,547 / 测试集 9,547。
- **题目类型**：包含多项选择题（MCQ）和开放式问题两种形式。
- **评估维度（五项标准）**：语言恰当性（Language Appropriateness）、年级对齐（Grade Alignment）、相关性（Relevance）、清晰度（Clarity）、学科契合度（Subject Fit），每项 1-10 分。

**🌟 主要实验结果**

- **低年级是系统性短板**：更大的模型整体表现更好，但**所有模型在 1-5 年级内容上都显著挣扎**。Qwen2.5-14B 和 Mistral-Small-24B 在 MCQ 上达到最高准确率（约 86%），但低年级准确率明显下降。小模型（1.5B-3B）在低年级开放式问题上甚至低于 60%。
- **传统自动指标在 EduAdapt 上失效**：BLEU、ROUGE、BERTScore 被证明**不可靠**——BERTScore 即使答案语义错误或发育不适配，也常超过 90%；BLEU/ROUGE 分布平坦，无法区分正确性和年级对齐差异。论文最终采用 **LLM-as-a-Judge**：三个独立裁判（Qwen2.5-72B、LLaMA3.3-70B、GPT-4o）对开放式回答按五项标准各打 1-10 分，取平均作为最终评分。
- **错误模式揭示深层问题**：低分 QA 对的分析显示——低年级问题常因“过度简化而偏离主题”，高年级问题则常因“过于技术化或涉及生僻知识”而失去相关性。模型能生成“清晰”的问题，但常常抓不住该年级应有的**核心学科知识**。
- **数据构建的双重质控**：先由 LLM 自反思打分过滤（166k → 47.7k），再由三名教育内容背景的人工标注者复核约 10% 的测试集，确保质量。

**与之前关注的工作的关系**：EduAdapt 和 **LongTutor** 都涉及教育场景，但切入角度不同。LongTutor 评估的是“从长期学习历史中诊断知识状态并采取教学行动”，EduAdapt 评估的是“同一知识能否按目标年级正确表达”。前者关注**时间维度上的个性化**，后者关注**发展维度上的适配性**。如果你在研究记忆或个性化系统在教育中的应用，EduAdapt 提供了一个重要的警示：**“知道正确答案”和“用合适的方式说出来”是两种不同的能力**，后者需要模型对“接收者当前处于什么认知阶段”有显式的建模。



------



**ELI-Why**，一个用于评估语言模型**解释性回答教学效用（Pedagogical Utility）** 的基准测试集，核心创新在于通过“教育者”与“学习者”双视角人类研究，揭示了模型“能生成”年级适配解释与解释“真适合”目标学习者之间的显著鸿沟。

`# Findings of ACL 2025`

> ​        ELI-Why: Evaluating the Pedagogical Utility of Language Model Explanations, a benchmark of 13.4K "Why" questions designed to assess whether language models can tailor explanatory answers to learners with different educational backgrounds, revealing that GPT-4-generated grade-tailored explanations match their intended educational level only 50% of the time.
>
> **重点研究：** 语言模型在教育中被广泛使用，但其根据学习者不同信息需求和知识背景定制回答的能力尚未被充分探索。模型被 prompt 要求面向特定年级生成解释，是否真的意味着解释适合那个年级的学习者？

- PDF：https://aclanthology.org/2025.findings-acl.1306.pdf
- ACL Anthology：https://aclanthology.org/2025.findings-acl.1306/
- arXiv：https://arxiv.org/abs/2506.14200
- DOI：10.18653/v1/2025.findings-acl.1306
- 代码/数据：[inklab.usc.edu/eli-why](https://inklab.usc.edu/eli-why)

ELI-Why 的核心洞察是：**“能生成”不等于“真适合”**。GPT-4 可以被 prompt 要求“用小学水平解释光合作用”，但生成出来的解释是否真的被人类教育者认可为小学水平、是否真的满足小学学习者的信息需求，是另一个问题。现有教育基准（如 MMLU、GSM8K）只测“是否正确”，不测解释的“教学适配性”。

同时，构建了一套以**“Why”问题 + 双视角人类评估**为核心的框架：

- **核心能力定义**：ELI-Why 评估的是语言模型的**教学适配能力（Pedagogical Adaptation）**——能否根据目标学习者的教育背景，调整解释的知识深度、概念复杂度和信息呈现方式，而非仅仅调整表面风格。
- **为什么选“Why”问题**：相比“是什么”或“怎么做”，“为什么”类问题既需要知识寻求，又在知识呈现方式上留有主观空间，适合考察“同一知识如何为不同人解释”。
- **数据规模**：从 50 个种子问题出发，GPT-4 few-shot 过度生成约 30K 个“Why”问题，经人工去重和众包过滤（去除过于小众的领域问题）后，保留 **13,392 个**。其中 STEM 问题 **6,217 个**（物理、化学、计算机、材料工程等），非 STEM 问题 **7,175 个**（社会学、法律、文化、历史、公共关系等）。
- **三个教育等级**：小学（约美国 4 年级）、高中（至大学二年级）、研究生。选择这三个层级是为了尽量让信息需求不重叠。
- **四个模型家族**：GPT-4-0613、Llama-3.2-3B-Instruct、Qwen 2.5 14B Instruct、DeepSeek R1 Distill Llama 8B。零样本提示，要求模型扮演该年级的专家生成解释，并明确禁止添加问候语或装饰性词汇，以确保适配体现在**知识深度**而非表面风格。

**🌟 主要实验结果**

- **年级匹配率仅 50%**：在教育者视角的人类研究中，GPT-4 生成的“年级适配”解释，只有 **约 50%** 被人类评审正确识别为目标年级；而人工从网络策划的解释达到 **79%**。这意味着模型声称面向小学的解释，有一半被教育者判定为“不像小学水平”。
- **学习者满意度低 20%**：在学习者视角的研究中，覆盖小学、高中、研究生三组参与者（物理和心理学方向），用户认为 GPT-4 生成的解释比人工策划的解释**平均低 20%** 的适配度。这一差距在研究生和高中背景的用户中尤为明显。
- **自动化指标失效**：可读性评分（如 Flesch-Kincaid）和表面特征（句子数量、复杂词比例）**无法区分**不同模型家族为不同年级生成解释的差异。虽然解释随年级升高变得更长、包含更多“复杂”词，但在**年级级可读性**上往往重叠。这说明教学适配不能靠简单的文本统计来衡量。
- **Prompt 层面的年级指定效果有限**：论文的核心结论是，仅靠 prompt 要求模型“面向 X 年级”不足以实现真正的教学适配。用户感知到的难度等级与模型意图往往不匹配，模型生成的解释在“信息深度”上并未真正对齐目标学习者的认知阶段。

**与之前关注的工作的关系**：ELI-Why 和 **EduAdapt** 构成一对互补的“教育适配”基准。EduAdapt 测的是**答题**的年级适配（是否正确且适龄），ELI-Why 测的是**解释**的年级适配（是否让目标学习者真正理解）。两者都指向同一个结论：模型对“接收者当前处于什么认知阶段”缺乏显式、有效的建模。如果你在研究个性化系统或记忆在教育中的应用，ELI-Why 的警示是：**“知道用户是谁”和“用适合他的方式说话”之间，存在一条模型尚未跨越的鸿沟**。



------



**MathBuddy**，一个**情感感知的多模态数学辅导系统**，核心创新在于将学生的**文本情绪**与**面部表情**实时融合，动态映射到教学策略，让LLM辅导者从“只讲题”变为“看脸色教学”。

`# EMNLP 2025 (System Demonstrations)`

> MathBuddy, an emotionally aware LLM-powered Math Tutor, which dynamically models the student‘s emotions from both conversational text and facial expressions, aggregates them into a unified affective state, and maps it to relevant pedagogical strategies—challenging a positive/neutral student while motivating a negative one.
>
> **重点研究：** 现有LLM辅导系统在教学内容上不断进步，却普遍缺乏**情感智能**，将所有学习者一视同仁，忽视其情绪状态。在数学这类学习者焦虑被充分记录的主题中，这种忽视会直接导致参与度下降和挫败感加剧。如何让AI辅导者“看见”学生的情绪，并据此调整怎么教？

- PDF：https://aclanthology.org/2025.emnlp-demos.pdf
- ACL Anthology：https://aclanthology.org/2025.emnlp-demos/
- arXiv：https://arxiv.org/abs/2508.19993
- DOI：10.18653/v1/2025.emnlp-demos.6319
- GitHub：https://github.com/ITU-NLP/MathBuddy

MathBuddy的核心洞察是：教育心理学早已证实，**负面情绪（困惑、挫败）会直接抑制解题能力和动机，而正面情绪（投入、好奇）与学习增益正相关**。但现有的LLM辅导系统把情绪信号完全丢弃了。MathBuddy要做的，是把人类教师“看学生脸色行事”的本能，工程化为一个可运行的多模态系统。

同时，构建了一套以**双模态情绪融合 + 策略映射**为核心的框架：

- **核心能力定义**：MathBuddy将辅导建模为**情绪条件化的对话生成**。给定学生的上一轮话语和面部表情，系统先提取并聚合情绪状态，再以此为条件提示LLM辅导者生成教学回应。
- **文本情绪识别**：由于缺乏现成的学生-辅导者情绪标注数据，作者对**MathDial-Bridge**数据集的224条学生话语进行了人工标注，将情绪建模为**多标签分类**（Boredom / Engagement / Neutral），并附带0-2的强度极性分数。微调后的BERT模型在测试集上达到**61.8%准确率、57.9% F1**。
- **面部情绪识别**：使用**face-api.js**在浏览器端实时检测面部表情，可识别Happy、Sad、Angry、Surprised等7类情绪。在自建测试集上报告**76%准确率、71% F1**。面部情绪样本按**半衰期120秒**的衰减函数进行时间聚合，赋予近期表情更高权重。
- **多模态情绪聚合**：两种模态的情绪首先映射到**Positive / Neutral / Negative**三个原始类别。聚合规则的关键设计是：**Positive和Negative始终优先于Neutral**；若两者冲突，以**置信度**作为次级裁决标准。例如文本判Positive（置信度50%）与面部判Negative（置信度70%）冲突时，系统选择Negative。系统明确假设：**任何非中性的信号都意味着“中性不成立”**，从而更积极地触发策略调整。
- **情感感知教学策略映射**：聚合后的情绪被映射到两条教学路径——**Positive或Neutral → 挑战（Challenge）** 学生；**Negative → 激励（Motivate）** 学生。这两条路径通过提示工程注入LLM Tutor，使回应在教学内容之外携带情感适配性。

**🌟 主要实验结果**

- **Win Rate大幅提升23个点**：在用户研究中，MathBuddy的情感感知回应相比基线取得了**23个百分点的win rate增益**，这是该系统核心假设——情绪建模能提升教学效能——最直接的证据。
- **八维教学评估全面改善**：在基于**Maurya et al. (2025)** 框架的**八个教学维度**上进行自动评估，整体**DAMR分数提升约3个点**。这说明情感适配的收益不局限于“让学生感觉好”，而是渗透到了多个可测量的教学质量维度中。
- **首个情感感知LLM辅导系统**：作者将MathBuddy定位为**第一个**基于教育理论、并根据学生情感状态自适应调整的LLM辅导系统，填补了“教学内容强、情感智能缺”这一结构性空白。
- **配套资源开源**：系统代码、标注数据集和demo视频均已公开，为后续情感感知教育系统的研究提供了可复现的基础。

**与之前关注的工作关系**：MathBuddy和**ScaffoldLM**、**Who Am I?** 都涉及数学辅导中的学生建模，但维度不同。ScaffoldLM建模的是**认知状态**（步骤是否达成、概念是否理解），Who Am I?建模的是**行为倾向**（遇到困难时怎么说话、求助频率），而MathBuddy建模的是**情感状态**（正/负/中性）并将它作为教学策略的**直接切换开关**。三者构成互补：一个理想的辅导系统可能需要同时追踪认知、行为和情感三条线。MathBuddy的“双模态融合 + 冲突裁决”设计，为如何在实时对话系统中可靠地获取情感信号提供了一个工程上可落地的参考方案。



------
