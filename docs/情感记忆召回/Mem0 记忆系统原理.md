



# Mem0 记忆系统原理

### 0.框架总览

![](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%25E6%2588%25AA%25E5%25B1%258F2026-11-06%252020.35.04.png)



* `Messages`：在和用户对话时，会有个维护上下文的 messages ,通常是**用户的一条消息 + AI 助手的一条回复**。例如：

  > **用户**：我上次答辩前跟同门模拟问答，感觉挺有帮助。
  > **助手**：听起来，提前练习让你更有准备。

  这两条原始消息将会一起进入 Mem0 左边的**提取阶段**。

* `Extraction Phase`: 分为两个阶段，

  - 第一阶段：基于传入的 messages 上下文能提炼出什么样的一条新记忆；
  - 第二阶段：将这条新记忆放到记忆库中检索，找到与他相近的多条记忆；

* `Update Phase`:引入了数据库的思想，对向量数据库进行增删改查。

  根据最新的这一条记忆与已有相近的多条记忆比对，判断这条“新记忆”是否已经在库中/与原有记忆冲突（比如原本说自己喜欢滑雪，但是突然又说自己不喜欢滑雪），此时就需要选择添加/修改库中已存在的记忆，以此来维护记忆库中记忆的唯一性。

  1. **检索相似旧记忆。** 以每条候选记忆为查询，通过向量相似度从记忆库中找出最相近的若干条旧记忆。
  2. **比较并执行操作。** LLM 对照候选记忆和检索出的旧记忆，判断它们是重复、互补还是冲突，再通过工具调用执行相应操作。 [arxiv.org](https://arxiv.org/html/2504.19413?utm_source=chatgpt.com)

## 1. 环境准备

### 1.1 安装依赖

Mem0 的安装包名是 `mem0ai`，导入模块名是 `mem0`。这里同时安装 `chromadb` 作为本地向量库，避免 `qdrant-client` 引入的 protobuf 版本冲突。

```python
# 安装 zstd（Ollama 解压依赖）
!sudo apt-get update -qq && sudo apt-get install -y -qq zstd

# 安装 mem0ai 与 chromadb
!pip install -q mem0ai chromadb

# 安装 ollama
!pip install ollama

# 重新安装 Ollama
!curl -fsSL https://ollama.com/install.sh | sh
```

### 1.2 启动 Ollama 服务

Kaggle 容器里没有 systemd，必须用 `subprocess` 手动启动 Ollama。如果之前已经启动过 Ollama，或者调整过 GPU 相关环境变量，建议先做一次“干净重启”，确保服务在启动时能正确探测到 GPU。

**为什么需要这一步**：Ollama 只在 `ollama serve` 启动的那一刻做一次硬件探测。如果当时环境里有遮蔽 GPU 的变量（如 `CUDA_VISIBLE_DEVICES`），或者已有旧进程占着端口，新服务会静默回退到 CPU，之后所有推理都走 CPU，直到你重启服务。

```python
# 1. 杀掉所有已有的 ollama 进程
!pkill -f ollama

# 2. 清除可能遮蔽 GPU 的环境变量（关键）
import os
os.environ.pop("CUDA_VISIBLE_DEVICES", None)
os.environ.pop("OLLAMA_LLM_LIBRARY", None)  # 设置后会锁定库版本，可能导致不认 GPU

# 3. 重新启动 Ollama，并把启动日志写到文件，方便排查 GPU 探测
import subprocess
import time

subprocess.Popen(
    ["ollama", "serve"],
    stdout=open("/kaggle/working/ollama_serve.log", "w"),
    stderr=subprocess.STDOUT,
)
time.sleep(5)

# 4. 验证服务是否就绪
import requests
status = requests.get("http://127.0.0.1:11434").status_code
assert status == 200, "Ollama 服务未就绪"
print("Ollama 服务已就绪，状态码:", status)
```

![截屏2026-10-20 22.21.09](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.21.09.png)

**验证 GPU 是否被识别**：启动后检查日志，确认 Ollama 探测到了 CUDA 设备：

```python
!grep -i "inference compute\|CUDA\|GPU" /kaggle/working/ollama_serve.log | head -20
```

如果日志里出现类似 `library=CUDA`、`description="Tesla T4"` 的行，说明 GPU 已被识别。加载模型后再用 `!ollama ps` 看 `PROCESSOR` 列，确认模型真正跑在 GPU 上（显示 `100% GPU`），而不是回退到 CPU。

![截屏2026-10-20 22.22.07](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.22.07.png)

### 1.3 拉取模型

Mem0 需要两个模型：一个 LLM 用于事实抽取，一个 Embedding 模型用于向量化。这里选用 `llama3.1:8b` 和 `nomic-embed-text`。

```python
!ollama pull llama3.1:8b
!ollama pull nomic-embed-text
#!ollama pull qwen2.5:3b #如果llama3.1:8b跑不动可以试着跑qwen2.5:3b
```

拉取完成后确认模型列表：

```
!ollama list
```

<img src="https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.24.58.png" alt="截屏2026-10-20 22.24.58" style="zoom:50%;" />

## 2. 初始化 Mem0

### 2.1 配置说明

`Memory.from_config()` 接收一个字典，分别配置 LLM、Embedder 和 Vector Store。这里 LLM 和 Embedder 都指向本地 Ollama，向量库使用 Chroma 的本地文件模式。

**关键点**：`nomic-embed-text` 输出 768 维向量。如果后续换用 Qdrant，`embedding_model_dims` 必须设为 768，而不是 OpenAI 默认的 1536。

```python
from mem0 import Memory

config = {
    "vector_store": {
        "provider": "chroma",
        "config": {
            "collection_name": "mem0_demo",
            "path": "/kaggle/working/chroma_db",
        }
    },
    "llm": {
        "provider": "ollama",
        "config": {
            "model": "llama3.1:8b",
            "ollama_base_url": "http://localhost:11434",
            "temperature": 0.1,
        }
    },
    "embedder": {
        "provider": "ollama",
        "config": {
            "model": "nomic-embed-text",
            "ollama_base_url": "http://localhost:11434",
        }
    }
}

m = Memory.from_config(config)
print("Mem0 初始化成功") #运行成功后会显示“Mem0 初始化成功”
```

## 3. 写入记忆（`add`）

### 3.1 基本写入

调用 `add` 时，Mem0 不会原样存储你输入的句子，而是让 LLM 抽取一条精简的事实。下面存入一条关于用户偏好的记忆。

```python
m.add("我喜欢靠窗的座位，讨厌嘈杂的环境", user_id="demo_user")
```

![截屏2026-10-20 22.32.40](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.32.40.png)

### 3.2 查看存储结果

`get_all` 返回该 `user_id` 下的所有记忆条目。观察 `memory` 字段，它应该是一条第三人称陈述句，而不是你输入的原句。

```
import json

all_memories = m.get_all(filters={"user_id": "demo_user"})
print(json.dumps(all_memories, ensure_ascii=False, indent=2))
```

![截屏2026-10-20 22.33.00](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.33.00.png)

### 3.3 写入多条记忆

再写入两条不同类型的记忆，用于后续检索演示。

```python
m.add("我在 A 项目里用 Python 做数据分析", user_id="demo_user")
m.add("我对花生过敏", user_id="demo_user")
```

![截屏2026-10-20 22.39.26](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.39.26.png)

再次查看全部记忆：

```python
all_memories = m.get_all(filters={"user_id": "demo_user"})
for mem in all_memories["results"]:
    print("-", mem["memory"])
```

![截屏2026-10-20 22.39.43](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.39.43.png)

## 4. 检索记忆（`search`）

Mem0 的**多信号混合检索**在融合了语义相似度、关键词匹配和实体匹配后，会它不是单一的余弦相似度，而是一个经过归一化和加性融合的 `[0, 1]` 值。得到的**综合相关性分数**。

Mem0 的检索会并行运行几路信号，然后把它们融合成一个最终分数：

1. **语义搜索（向量相似度）**：把查询和记忆都转成向量，计算它们的语义接近程度。这是最基础的一路，也是你看到分数的主要来源。
2. **BM25 关键词搜索**：检查查询和记忆在字面上的重合度。比如“项目”这个词在两条记忆里都出现了，BM25 这一路就会给它们都加分。**注意**：BM25 只对已经通过语义搜索找出来的候选记忆进行“加分”，它自己不会新增候选记忆。
3. **实体匹配**：从查询和记忆中抽取命名实体（比如“A 项目”、“B 项目”），如果查询里的实体和某条记忆关联的实体匹配上了，那条记忆会获得一个额外的“实体加分”。

这三路分数会被**归一化**，然后**加性融合**。最终的除数取决于当前有几路信号是激活的：只有语义是 1.0，语义+BM25 是 2.0，三路全开是 2.5。你当前用的是 Ollama 的 `nomic-embed-text` 和 `llama3.1:8b`，Mem0 默认会尝试启用所有可用的信号，所以你的分数大概率是融合了三路信号的结果。

### 4.1 检索路径的核心逻辑

检索并行运行多路信号，融合后排序返回。官方文档列出的信号包括：语义（向量相似度）、关键词（BM25）、实体匹配、时间信号（可选）。源码中 `score_and_rank()` 将 `semantic_score + bm25_score + entity_boost` 加性融合。实体链接的工作方式是：存储时抽取实体并嵌入，检索时查询中的实体与已存储实体匹配，对关联记忆**加分**，即使记忆文本与查询不是紧密匹配，也可能被拉入结果。

**OSS 与 Platform 的关键差异**：开源版的实体信号仅靠“重叠加分”，**没有图记忆**；Platform 的实体信号由内置 Graph Memory 驱动。

### 4.2 语义检索

```python
results = m.search("我用什么工具做数据分析", filters={"user_id": "demo_user"})
for r in results["results"]:
    print(r["memory"], "| score:", r.get("score"))
```

![截屏2026-10-20 22.40.09](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.40.09.png)

### 4.3 关键词检索

```python
results = m.search("花生过敏", filters={"user_id": "demo_user"})
for r in results["results"]:
    print(r["memory"], "| score:", r.get("score"))
```

![截屏2026-10-20 22.40.25](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.40.25.png)

### 4.4 宽泛查询

```python
results = m.search("我的偏好和项目", filters={"user_id": "demo_user"})
for r in results["results"]:
    print(r["memory"], "| score:", r.get("score"))
```

![截屏2026-10-20 22.40.47](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.40.47.png)

### 4.5 完整返回结构

```python
results = m.search("数据分析", filters={"user_id": "demo_user"})
print(json.dumps(results["results"][0], ensure_ascii=False, indent=2))
```

![截屏2026-10-20 22.41.07](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%E6%88%AA%E5%B1%8F2026-10-20%2022.41.07.png)

返回对象包含 `id`、`memory`、`score`、`metadata`、`created_at` 等字段。`MemoryItem` 模型本身定义了 7 个字段（id、memory、hash、metadata、score、created_at、updated_at），实际存储的 payload 还可能包含 `user_id`、`agent_id`、`run_id`、`text_lemmatized` 等。

## 5. API 注意事项

### 5.1 `search` 的参数变化

在 `mem0ai 2.2.1`（v3）中，`search()` **不再接受顶层 `user_id` 参数**。传入 `user_id="..."` 会抛出 `ValueError`，提示改用 `filters`。这是 v3 的规范化变更，OSS 与 Platform 行为已对齐。

**错误写法**：

```python
# m.search("数据分析", user_id="demo_user")  # ValueError
```

**正确写法**：

```python
m.search("数据分析", filters={"user_id": "demo_user"})
```

`add()` 和 `delete_all()` 仍然接受顶层 `user_id=`，不受影响。

### 5.2 默认检索参数

v3 的检索默认值为：`top_k=20`，`threshold=0.1`，`rerank=False`。返回结果最多 20 条，分数低于 0.1 的记忆被过滤。可显式覆盖：

```python
results = m.search(
    "数据分析",
    filters={"user_id": "demo_user"},
    top_k=5,
    threshold=0.2,
)
```

### 5.3 调试检索分数

OSS 支持 `explain=True` 参数，用于查看各信号对最终分数的贡献，便于调试检索质量。

```python
results = m.search("数据分析", filters={"user_id": "demo_user"}, explain=True)
```



## 6. 作用域与数据模型

### 6.1 作用域标识符

Mem0 通过 `user_id`、`agent_id`、`run_id` 来隔离记忆。官方建议**始终用 `filters` 传入这些标识符**，防止不同用户、Agent 或会话的记忆混在一起。`metadata` 可用于产品层面的过滤（workspace、feature area 等），但需要写入时主动设置。

Platform 额外支持 `app_id` 用于租户隔离；OSS 不支持 `app_id`。

### 6.2 数据存储模型

Mem0 的数据分布在三类存储中：

| 存储       | 内容           | 用途                       |
| :--------- | :------------- | :------------------------- |
| SQL 数据库 | 事实与元数据   | 权威来源，支持历史审计     |
| 向量数据库 | 嵌入向量       | 语义相似度检索             |
| 实体存储   | 抽取的命名实体 | 检索时对共享实体的记忆加分 |

实体抽取的实现位于 `mem0/utils/entity_extraction.py`，支持四类实体：PROPER（大写序列）、QUOTED（引号文本）、COMPOUND（名词复合）、NOUN（兜底名词）。实体被嵌入到与记忆相同的向量空间，存入 `{collection}_entities` 集合，payload 包含 `entity_type` 和 `linked_memory_ids`。

## 7. 组件可替换性

Mem0 OSS 的核心设计之一是组件可插拔。当前配置与可替换选项对照：

| 组件     | 当前配置                            | 可替换选项                                                   |
| :------- | :---------------------------------- | :----------------------------------------------------------- |
| LLM      | Ollama `llama3.1:8b`                | OpenAI、DeepSeek、Azure、Bedrock 等                          |
| Embedder | Ollama `nomic-embed-text`（768 维） | OpenAI `text-embedding-3-small`（1536 维）、Hugging Face、FastEmbed 等 |
| 向量库   | Chroma 本地模式                     | Qdrant、PGVector、Milvus、FAISS、Pinecone 等                 |

**换 Embedder 时务必同步调整向量维度**。从 `nomic-embed-text` 换到 OpenAI 的 `text-embedding-3-small`，维度要从 768 改成 1536，否则向量库会报维度不匹配。

## 8. OSS 与 Platform 的能力差异（检索相关）

以下差异直接影响你在 OSS 上观察到的检索行为，与 Platform 不完全一致：

| 能力                 | OSS              | Platform           |
| :------------------- | :--------------- | :----------------- |
| 图记忆               | 已移除（v3 起）  | 原生、始终开启     |
| 记忆衰减（decay）    | 不支持，传入报错 | 可选开启           |
| 时间推理（Temporal） | 不支持           | 支持               |
| 后台整合（Dream）    | 无               | 支持               |
| Reranker             | 需自行配置       | 托管 reranker 目录 |

这意味着你在 OSS 实验中看到的检索分数和排序，**不包含** Platform 的图记忆增强、时间加成和衰减机制。如果你后续要做 Platform 与 OSS 的对照实验，这一点需要在方法部分注明。

## 9. 基准表现（官方数据，Platform 环境）

以下数据来自 Mem0 官方评测，反映的是 **Platform** 在单次检索（single-pass，top_200）条件下的表现，包含 OSS 不可用的专有优化：

**LoCoMo**：整体 92.5，单跳 91.2，多跳 91.3，开放域 72.7，时间推理 92.0。

**LongMemEval**：整体 94.4，单会话用户 98.6，单会话助手 98.2，单会话偏好 96.7，知识更新 93.6，时间推理 97.0，多会话 88.0。知识更新是 ADD-only 架构下相对最弱的类别，官方解释为“旧事实被保留而非覆盖，语义相似的先前事实可能与新事实同时出现”。

**BEAM**：1M 规模整体 64.1，10M 规模整体 48.6。10M 规模下多会话推理（26.1）、时间推理（16.3）、事件排序（20.2）显著下降，官方承认这是“全领域开放问题”。

## 10. 已知局限（来自第三方分析）

以下局限来自第三方对 Mem0 的分析，与官方基准数据存在差异，阅读时需注意来源：

- **写入幻觉**：每次 `add` 都经过 LLM 抽取，幻觉事实会被永久写入（ADD-only），除非后续显式删除。
- **无置信度/溯源**：一条事实要么存在，要么不存在，没有权重、证据计数或来源链。
- **无双时间有效性**：无法区分“何时学到”和“何时成为事实”，不支持关于过去信念的回溯查询。

## 11. 小结

这个 Notebook 演示了 Mem0 OSS 的核心工作流：**写入时 LLM 抽取事实 → 转向量存入向量库 + 实体集合 → 检索时语义/BM25/实体多信号融合排序**。你观察到的 `score` 是融合后的结果，返回的记忆是抽取后的事实而非原句。v3 API 的 `search` 必须用 `filters` 传作用域标识符。OSS 与 Platform 在检索能力上存在实质差异（无图记忆、无时间推理、无衰减），后续实验设计需明确区分。

**参考来源**

- Mem0 官方文档 “How Mem0 Works”：https://docs.mem0.ai/core-concepts/how-it-works
- Mem0 官方文档 “Platform vs Open Source”：https://docs.mem0.ai/platform/platform-vs-oss
- Mem0 官方博客 “How Mem0 uses embeddings”：https://mem0.ai/blog/how-mem0-uses-embeddings-and-why-we-are-evaluating-nvidia-nemotron-3-embed?trk=public_profile__posts-text#1
- Mem0 官方基准页面 “Memory Evaluation”：https://mem0.mintlify.app/core-concepts/memory-evaluation
- GitHub 社区分析（实体抽取、BM25、融合逻辑）：https://raw.githubusercontent.com/carsteneu/ai-memory-comparison/refs/heads/main/evidence/mem0.md#1
- Mem0 搜索文档（explain 参数、filters 行为）：https://mem0.mintlify.app/core-concepts/memory-operations/search







## 文献整理

### 一、研究背景与动机

大型语言模型（LLMs）虽然在生成连贯响应方面表现出色，但其固定的上下文窗口从根本上限制了在多会话交互中保持长期一致性的能力（Chhikara et al., 2025）。作者通过一个生动的例子说明这一问题：当用户在第一轮对话中提到自己是素食主义者且不摄入乳制品，在后续会话中系统若无持久记忆，可能会推荐鸡肉等完全违背用户饮食偏好的建议（Chhikara et al., 2025）

### 二、提出的方法

##### 2.1 Mem0架构

Mem0采用增量处理范式，包含两个核心阶段（Chhikara et al., 2025）。

* **提取阶段**：系统接收新的消息对（mₜ₋₁, mₜ），结合对话摘要和近期消息序列，通过LLM提取一组显著记忆候选事实。

* **更新阶段**：对每个候选事实，系统检索语义相似的历史记忆，并通过函数调用接口让LLM自主决策四种操作之一：**ADD**（创建新记忆）、**UPDATE**（补充现有记忆）、**DELETE**（删除被矛盾的信息）和**NOOP**（无需修改）。

##### 2.2 Mem0g架构

# 论文概括：Mem0——面向生产级AI代理的可扩展长期记忆系统

## 一、研究背景与动机

大型语言模型（LLMs）虽然在生成连贯响应方面表现出色，但其固定的上下文窗口从根本上限制了在多会话交互中保持长期一致性的能力（Chhikara et al., 2025）[1]。与人类能够动态整合新信息并修正过时信念不同，LLMs一旦信息超出上下文窗口就会"重置"，导致AI代理忘记用户偏好、重复提问，甚至与已确认的事实相矛盾。作者通过一个生动的例子说明这一问题：当用户在第一轮对话中提到自己是素食主义者且不摄入乳制品，在后续会话中系统若无持久记忆，可能会推荐鸡肉等完全违背用户饮食偏好的建议（Chhikara et al., 2025）[1]。

## 二、提出的方法

### 2.1 Mem0架构

Mem0采用增量处理范式，包含两个核心阶段（Chhikara et al., 2025）[1]：

- **提取阶段**：系统接收新的消息对（mₜ₋₁, mₜ），结合对话摘要和近期消息序列，通过LLM提取一组显著记忆候选事实。
- **更新阶段**：对每个候选事实，系统检索语义相似的历史记忆，并通过函数调用接口让LLM自主决策四种操作之一：**ADD**（创建新记忆）、**UPDATE**（补充现有记忆）、**DELETE**（删除被矛盾的信息）和**NOOP**（无需修改）。

### 2.2 Mem0g架构

Mem0g在基础架构上引入图式记忆表示，将记忆存储为有向标记图（Chhikara et al., 2025）[1]：

- **节点**代表实体（如人物、地点），**边**代表实体间关系（如"居住于"），**标签**赋予节点语义类型。
- 提取过程采用两阶段流水线：实体提取器识别关键信息元素，关系生成器建立实体间的语义连接。
- 存储时采用冲突检测机制，由LLM判断旧关系是否应标记为无效（而非物理删除），以支持时间推理。
- 检索采用**实体中心法**和**语义三元组法**双策略。

## 三、实验设置

### 3.1 数据集与评估指标

实验使用**LOCOMO基准**，包含10个长对话（平均约600轮对话、26000个token），涵盖单跳、多跳、时间推理和开放域四类问题（Chhikara et al., 2025）[1]。评估采用：
- **性能指标**：F1分数、BLEU-1和LLM-as-a-Judge分数（J）
- **部署指标**：Token消耗、搜索延迟和总延迟

### 3.2 基线对比

与六类基线系统对比：已建立的LOCOMO基准（LoCoMo、ReadAgent、MemoryBank、MemGPT、A-Mem）、开源记忆方案（LangMem）、RAG（不同块大小和k值）、全上下文方法、专有模型（OpenAI记忆功能）以及专用记忆平台（Zep）（Chhikara et al., 2025）[1]。

##### 四、主要结果

### 4.1 性能对比

![截屏2026-10-21 16.56.58](https://cdn.jsdelivr.net/gh/Mr-iodin/images@main/img/%25E6%2588%25AA%25E5%25B1%258F2026-10-21%252016.56.58.png)

**Mem0在单跳和多跳问题上表现最佳**：单跳J分数达67.13，多跳达51.15，均优于所有基线（Chhikara et al., 2025）[1]。**Mem0g在时间推理上最优**，J分数达58.13；在开放域任务中，Zep以76.60的J分数略胜Mem0g的75.71。整体而言，Mem0相比OpenAI在LLM-as-a-Judge指标上实现约26%的相对提升，Mem0g比基础Mem0整体高约2%（Chhikara et al., 2025）。

### 4.2 效率优势

- **延迟降低**：Mem0的p95总延迟为1.44秒，相比全上下文方法的17.12秒降低约91%；Mem0g为2.59秒，降低约85%（Chhikara et al., 2025）[1]。
- **Token节省**：相比全上下文方法节省超过90%的token成本（Chhikara et al., 2025）[1]。
- **记忆存储效率**：Mem0平均每对话仅占用7k token，Mem0g约14k token，而Zep的记忆图消耗超过600k token（Chhikara et al., 2025）[1]。

## 五、结论与未来方向

Mem0和Mem0g作为互补的记忆架构，分别在快速检索（单跳/多跳）和复杂关系推理（时间/开放域）方面展现优势，在保持接近全上下文方法性能的同时，大幅降低计算开销（Chhikara et al., 2025）[1]。未来研究方向包括：优化图操作以减少Mem0g的延迟开销、探索混合层次记忆架构、开发受人类认知过程启发的记忆整合机制，以及将记忆框架扩展到程序推理和多模态交互等更广泛领域（Chhikara et al., 2025）[1]。

## 参考文献

[1] Chhikara, P., Khant, D., Aryan, S., Singh, T., & Yadav, D. (2025). Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory. *arXiv preprint arXiv:2504.19413*.











**《Mem0: Building Production-Ready AI Agents with Scalable Long-Term Memory》**，一个面向生产部署的可扩展长期记忆架构，核心思路是在对话过程中动态提取、整合和检索显著信息，而非将完整历史塞入上下文窗口。它在 LoCoMo 基准上相比 OpenAI Memory 取得约 26% 的相对提升，同时将 p95 延迟降低 91%、token 成本节省超过 90%。

`# arXiv 2025`（未标注正式会议/期刊录用）

> LLM 的固定上下文窗口无法支撑跨多会话对话的一致性。Mem0 的做法是：用 LLM 从对话中提取值得保留的事实与偏好，存入可检索的记忆层；后续对话时按需检索少量相关记忆注入系统提示，而非重放全部历史。论文同时提出基于图结构的增强变体 Mem0g，用于捕获对话元素之间的复杂关系。

- PDF：https://arxiv.org/abs/2504.19413
- arXiv：https://arxiv.org/abs/2504.19413
- GitHub：https://github.com/mem0ai/mem0

Mem0 定义了一个**以 LLM 为提取器的分层记忆管理框架**：记忆的写入和读取均由模型调用完成，而非规则引擎。

> 每次对话后调用 `memory.add(messages, user_id=...)`，由 LLM 判断哪些信息值得存、以什么形式存；生成回复前调用 `memory.search(query, user_id=..., limit=3)`，检索最相关的少量记忆注入系统提示。默认使用 `gpt-4.1-nano` 作为提取与检索的 LLM 后端，也可切换本地模型。记忆按 User（长期偏好）、Session（当前会话）、Agent（跨会话知识）三个层级组织。

同时，构建了一套以**LoCoMo 基准**为核心的评估体系：

- **核心能力定义**：Production-Ready Long-Term Memory，即在真实多会话交互中维持个性化一致性的同时，控制延迟和 token 成本。
- **两种变体**：
  - **Mem0（基础版）**：基于 LLM 的平面化事实提取与检索
  - **Mem0g（图增强版）**：在图结构中存储对话元素及其关系，捕获更复杂的关联
- **对比基线**：六类——已有记忆增强系统、不同 chunk 大小与 k 值的 RAG、完整上下文、开源记忆方案、专有模型系统、专用记忆管理平台
- **评估基准**：LoCoMo，涵盖 single-hop、multi-hop、temporal、open-domain 四类问题

**🌟 主要实验结果**

- **准确率提升**：在 LLM-as-a-Judge 指标上相比 OpenAI Memory 取得 **26% 的相对提升**；Mem0g 相比基础版再高约 **2%**。原始论文报告 Mem0 的 J 分数约 66.9%，Mem0g 约 68.4%，OpenAI Memory 基线为 52.9%。
- **延迟与成本大幅下降**：相比完整上下文方法，p95 延迟降低 **91%**（Mem0 总 p95 约 1.44s，完整上下文约 17.12s），token 成本节省 **超过 90%**。
- **后续算法版本显著改进**：2026 年 4 月的新算法在 LoCoMo 上达到 **92.5**（旧版 71.4），LongMemEval 达到 **94.4**（旧版 67.8）。但需注意，这些数字反映的是 Mem0 **托管平台**的专有优化版本，开源 SDK 用户“应预期方向性相似但数值不同”的结果。
- **后续研究揭示的局限**：2026 年 IEEE COMPSAC 的独立评估将 Mem0 与 RAG、完整上下文归入同一准确率簇（77%–81%），但指出 RAG 基线在总拥有成本（TCO）上比 Mem0 低 **8.4 倍**，且两者是帕累托前沿上仅有的非支配后端。另有研究指出，Mem0 的提取式管线在 LongMemEval 上仅 49.0%，显著低于 Zep（71.2%）和 Hindsight（83.6–91.4%），表明“提取-更新”范式在长时程、事实频繁变化的场景中可能丢失检索多样性信号。默认提取模型 gpt-4.1-nano 在 UPDATE/DELETE 操作中会产生频繁的 JSON 解析错误，导致部分生命周期更新静默失败。

**与隐私与心理陪伴脉络的关联**

Mem0 在你的阅读脉络中扮演的是**“被评估的基础设施”**角色，而非隐私或心理陪伴的直接研究。CIMemories 和 CI-Work 所揭示的语境完整性失败，正是发生在 Mem0 这类持久记忆系统之上的：Mem0 负责“存什么、取什么”，但它本身不包含“在什么语境下不该取什么”的隐私治理逻辑。AgeMem 试图用强化学习让模型学会何时存/取/忘，Mem0 则是用 LLM 提取加向量检索的工程方案实现类似目标，但两者的共同盲区在于：**检索的相关性排序不区分“有帮助”与“该场景下不该提”**。在心理陪伴场景中，Mem0 的三层记忆结构（User/Session/Agent）提供了组织用户长期信息的框架，但其 `search` 接口返回的是语义相关的结果，而非语境合规的结果。此外，Mem0 的提取式记忆在“事实随时间演变”的场景（如用户情绪状态、关系状态的变化）中表现弱于图结构方案，这在心理陪伴的长程追踪中是一个需要警惕的局限。