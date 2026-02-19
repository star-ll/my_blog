---
{"publish":true,"created":"2026-02-17T19:21:16.091+08:00","modified":"2026-02-19T16:32:15.026+08:00","cssclasses":""}
---


## 引言：AI 时代下程序员角色的转变

在传统程序开发中，工程师的成长路径往往被划分得非常清晰。业内也一直流传着一句很经典的话：初级前端写页面，中级前端写业务，高级前端写架构。

这套分工逻辑在过去长期存在，主要原因是因为“写代码”的门槛很高，越高级的工程师越需要把精力投入在更稀缺的能力上，比如系统设计、抽象建模、性能与稳定性治理。

但进入 AI 编程时代之后，这条分界线开始被重新划定。

AI 编程大模型的出现，使得即使是普通人也能快速生成一套完善的系统，哪怕他完全不懂任何编程技术。这极大地降低了“写代码”的门槛。初级工程师能在几小时内完成过去需要几天的工作；甚至非技术人员也可以通过自然语言生成一个可用的应用。

表面上来看，程序员的价值降低了，但是从更高维度思考，降低的其实是“写代码”的价值，而程序员本身并不只是“写代码”。

一个不具备软件工程技术体系知识的普通人，虽然能利用 AI 快速开发上线一个应用，但是伴随着用户量和业务负责度的增长，新的问题出现了：

- 架构是否可演化？
- 系统是否可控？
- 代码是否可维护？
- 团队是否能长期交付？
- 真实线上问题如何调试定位？
- 安全与合规风险如何治理？
- 性能瓶颈与资源消耗如何优化？

这些问题并不会因为 AI 更强而消失，反而会因为“代码生成更快”而更早爆发。

更现实的一点是：AI 生成代码的速度越快，系统复杂度增长得也越快。如果没有明确的边界、规则和质量体系，项目很容易在短时间内变成一个“能跑但不可控”的黑盒。早期看似效率极高，后期却会在维护、扩展、重构、排障上付出数倍成本。

而且，具笔者实践，AI 知识量极为庞大，但是“它知道”和“它知道怎么用、什么时候用、用到什么程度”完全是两码事。AI 可以给出几十种实现方式，但它并不会对系统的长期成本负责，也无法替代工程师做出真正面向未来的架构决策。

而这些工程化问题，恰恰是程序员最擅长解决的。AI 编程降低了“写代码”的门槛，但并没有降低构建复杂系统的难度。相反，当代码生成变得廉价，真正稀缺的能力将更多集中在架构设计、规则制定与质量治理上：

程序员的核心价值也将从“写代码”转向更高维度的“掌控系统架构”。
## AI Code 时代两种常见的编程范式

在当前 AI 时代，有两种主流的编程范式：Vibe Code（氛围编程）和 Architecture-first Code（架构优先编程）。
### Vibe Code: 让 AI 自由生长

Vibe Code 的特点是不人为的约束 AI，**人只负责与 AI 沟通想法灵感，让 AI 自由发挥**。

赞同 Vibe code 的人通常认为：

- AI 的知识广度 > 人类工程师
- AI 写代码比人更规范
- 人为干预会降低 AI 表现

因此，他们认为既然如此，还不如将整个编程都交给 AI 来完成，人只需要提供需求和灵感，不要过多干涉 AI，让 AI 能够充分地自由发挥。
### 架构优先的 AI Code: 让 AI 在规则下发挥

另一种 AI 编程范式则相反，它同样赞同使用 AI code，但是**强调架构优先，在项目前期就明确设计实现系统架构和工程化约束，来确保 AI Code 在规则之内进行**。

赞同架构优先的人通常认为：

-  AI 很强，但不可控，缺乏对长期系统风险的责任意识
- 软件的核心问题不是“生成代码”，而是“管理复杂度”
- 系统架构一旦失控，后期维护成本会指数级上升
- 约束不会削弱 AI，反而能让 AI 在明确边界内更高质量地发挥

因此，他们更倾向在项目前期就做足架构设计和工程化约束等工作，以此来确保即使随着项目长期迭代演化而导致项目复杂度不断增加时，也能保持对项目架构和代码的整体“掌控”，即使有一天遇到 AI 无法处理的棘手问题，也能及时地人为介入。
### 两种范式对比

严格上来说，两种方案没有优劣之分，只是适用场景不同。

对于 Vibe code，通常适用于：

- 独立开发者
- 一人型公司
- 不懂编程的人
- 小型项目
- 临时短期产品
- 企业级产品的前期验证

它优点是：**可以快速实现需求和灵感的落地，同时极大地降低了开发的门槛**。但是缺点也很明显，那就是：**随着项目的不断迭代演化，会逐渐丧失对系统代码的“掌控”**，一旦出现 AI 不擅长解决的需求或者缺陷，那么很容易造成灾难性后果。

而架构优先的 AI Code 与其相反，它通常适用于：

- 存量项目
- 需要长期维护的项目
- 对稳定性可控性有较高要求的项目

**它牺牲了前期的开发速度，在前期投入更多的时间在架构设计、工程约束等方面，但是这也使得在项目的长期迭代演化中，能够更加可控。**

| 维度    | Vibe Code   | 架构优先 AI Code      |
| ----- | ----------- | ----------------- |
| 目标    | 快速跑起来       | 长期可控可演进           |
| 适用场景  | 原型、demo、小工具 | 中大型系统、长期维护        |
| 架构来源  | 后置、AI 自由发挥  | 前置、明确设计           |
| 风险    | 黑盒、技术债爆炸    | 前期慢一点但稳定          |
| 人类角色  | 提需求 + 调整    | 设计者 + 审核者 + 质量负责人 |
| AI 角色 | 主产出者        | 高效执行者             |

虽然从技术层面来看，Vibe Code 与架构优先的 AI Code 并没有绝对的优劣之分，它们各自都有明确的适用场景。但如果从现实的软件生命周期出发，大多数项目最终都会进入“需要长期维护”的阶段。

即便在项目早期强调灵感快速落地，一旦产品真正投入实际使用，就不可避免地开始面临版本迭代、需求扩展、缺陷修复、性能优化以及稳定性治理等问题。软件几乎不存在“只开发、不维护”的状态。

而一旦进入项目发展或后期维护阶段，如果前期缺乏明确的架构设计和工程化约束，当系统遇到 AI 无法直接处理的复杂问题时，开发者往往会发现自己面对的是一个“能运行但难以理解”的黑盒系统。

此时，为了解决一个具体问题，开发者不得不：

- 先花大量时间理解 AI 生成的整体结构
- 再梳理隐藏的依赖关系与数据流
- 最后才能进行有风险的修改

原本在前期节省下来的时间成本，很可能会在后期以数倍的形式被偿还。

因此，尽管 Vibe Code 在原型阶段具备极高效率，但对于大多数具有持续演化可能的项目而言，更稳妥的选择通常是架构优先的 AI Code 范式。它牺牲的是初期的一部分速度，换取的是长期的可控性与系统演化的确定性。

## 架构优先 AI Code 的核心原则

Architecture-first 的 AI Code 范式笔者总结提炼了五个核心原则，分别是：

- **架构优先**：架构设计优先于功能实现
- **工程化约束**：规则优先于自由生成
- **人工审计**：AI 变更必须人工审计
- **测试优先**：测试与验证必须伴随生成
- **文档优先**：核心文档必须同步建立

这五条核心原则其实就是在重构开发者的职责：AI 负责具体代码实现，开发者负责控制系统边界。

### 原则一：架构设计优先于功能实现

在开始任何功能生成之前，必须先明确：

- 系统的整体分层结构
- 核心模块的边界与职责
- 数据模型与依赖方向
- 扩展点与未来演化路径

AI 可以生成实现，但系统结构必须由人类定义。

因为结构一旦失控，后期任何优化都会变得异常困难。

### 原则二：规则优先于自由生成

AI 的默认行为是“尽可能完成任务”，而不是“尽可能符合团队规范”。

因此必须提前定义：

- 目录结构规范
- 命名规范
- 接口风格
- 代码风格与技术栈约束
- 依赖管理规则

通常情况下，大部分都不需要手动声明给 AI，现代 AI 代码编辑器通常能够通过自动读取 Eslint、package、TS 类型文件等方式来识别规范。

而除此之外的规则则需要显式声明给 AI，下一章工程化实践中将会详细介绍。

### 原则三：AI 变更必须人工审计

人工审计是实现人“掌控”系统的关键一步，虽然我们可以通过制定各种规则来规范 AI Code，但是我们不能保证 AI 生成的代码没有偏差，当前 AI 在局部上下文中的代码生成能力非常优秀，但是还无法对整个系统负责，尤其是需要长期迭代维护的系统。

在笔者实践中，就有遇到过：

1. AI 能完成要求，但是实现效果不如直接引入第三方库
2. AI 完成要求的同时影响了另一个功能逻辑
3. AI 的实现逻辑只适用于当前任务，没有抽象出来应对未来同一类需求
4. AI 的代码实现追求功能全面，没有考虑现实的成本约束和业务边界

开发者必须审计 AI 生成的代码，因为 AI 只负责生成代码，无法对生成的代码负责，只有人才能负责。

此外 AI 在对现实世界的理解能力、对大上下文大长期记忆能力、对业务的理解能力等方面都有一定的短板，这方面需要人来弥补。

最后，人工审计能够有效破除“系统代码黑盒”问题，前面我们提到过：

>  Vibe Code 面临的一个问题是系统后期维护过程中，整个系统代码对于开发者来说是一个黑盒，当出现 AI 无法解决的问题时，很容易造成灾难性后果，而且重新人为介入成本也非常高。

但是通过人工审计，开发者能够做到对于 AI 生成的代码有着清晰的了解，再配合其他文档优先、架构优先等原则，可以快速人工介入到系统代码修复中去。
### 原则四：测试与验证必须伴随生成

在 AI 编程时代，生成代码的速度远快于人工审查的速度。因此，任何生成行为都必须具备可验证机制。因此，AI 生成的代码，不仅要“能运行”，更要“可被验证”。

通常应包含以下层级的验证机制：

1. **静态规范校验**：每次生成后执行 `lint`，确保代码风格与规范一致。
2. **构建验证**：每轮生成后执行 `build`，确保编译正确。
3. **行为测试**：核心工具函数生成单元测试

上面是最基本的 AI code 测试和验证，实际开发可以根据实际情况进行调整。对于关键业务路径，应当补齐集成测试/回归测试。
### 原则五：核心文档必须同步建立

核心文档必须与代码生成同步建立，其目的在于确保人类开发者与 AI 在系统结构、模块职责与关键设计决策上保持一致的认知，避免系统逐渐演变为只有 AI “知道如何生成”、但人类难以理解的黑盒。

当 API说明、更改记录与关键技术决策被明确记录并持续更新时，系统的可维护性、可交接性与团队协作效率都会显著提升，从而为项目的长期演化提供稳定而可控的基础。

## 工程化实践: 如何落地

### 架构优先与工程化约束

前面我们总结了架构优先 AI Code 范式的五条核心原则，那么我们下面来讲怎么具体落实在实际项目中，以我最近开发的一个应用来介绍。

这个应用是一个基于 React Native 实现的类似幕布一样的大纲式笔记 APP。这是我最开始想法，或者说是灵感。

这个时候我就可以选择 Vibe Code 直接 AI 生成，但是我考虑到后期维护和功能扩展方面的问题，因此打算自行设计整个系统，包括：

- 系统边界（业务、性能、稳定性等）
- 系统架构
- AI 工程化约束
- 技术栈
- ...

而 AI 只负责按照我设计的架构框架内，完成具体的代码实现。

在这个系统，我划分层级为 6 层：

- UI 层：包括所有 React 组件，只关注 UI 样式和行为
- 状态层：包括 Zustand、Context 和自定义的内存数据结构
- 功能层：具体的业务逻辑实现
- 调度层：一个基于优先级的调度系统，和 React 调度系统不同的是，它负责整个系统资源的统筹管理。
- 存储层：DB 和缓存
- 算法层：为调度层、功能层等提供通用算法支持，比如调度层中所需要的 `MinHeap`，功能层需要的 `debounce` 防抖等。

层级之间要做到尽可能地解耦，每层专注于自身的职责（单一职责）。以调度层为例，它负责统筹整个系统的资源，当用户删除某个节点时，通常伴随着：

1. UI 层更新
2. 状态层更新
3. undo 栈更新
4. 存储层更新
5. ...

这些操作是有优先级关系的，比如说存储层更新的优先级通常没有 UI 更新的优先级高，并且这些操作具有**事务**的特点，即如果一个失败就全体失败，进行回滚，否则会破坏系统稳定性。
### AGENTS: 全局约束

前面我们已经完成了架构设计，那么怎么将架构转换成实际的工程化约束呢？我们以 Codex 为例，可以通过 `AGENTS.md` 将系统架构转换成全局约束。

> 不同 AI 编辑器规则配置文件有所不同，比如 Codex 是AGENTS.md，有些编辑器是README.md，但是实现思路相同。

`AGENTS.md` 中的内容会在每次对话中被 AI 引用，因此它很适合作为：

- 项目规则文档
- 分层架构说明
- 层级依赖链路
- 错误处理规范
- 性能指标约束
- 系统目标说明

下面是笔者设计的 `AGENTS.md`, 抛砖引玉：

```markdown
# Project Intro

An outline notes app built with React Native.

This project uses Expo Development Build (dev client), not Expo Go.

# Code

## Table of contents

- app: UI component files.
- assets: static assets.
- components: public components, such as `outline-item`.
- constants: constants, such as SQL-related constants.
- scripts: executable scripts.
- test: test files.
- utils: shared utility methods.
- hooks: public react hooks.
- lib:
  - algorithms: reusable algorithms, such as debounce, stack, queue, etc.
  - features: core business logic connecting UI and DB/Scheduler layers.
  - storage: DB or cache.
  - scheduler: system-level scheduling logic (not React UI scheduling).
- skills: prompt templates & agent playbooks (non-runtime, docs only).

## System Architecture

- UI layer
- State layer
- Feature layer
- Storage layer
- Scheduler layer
- Algorithms layer

State layer includes:

- Based on Zustand, Context, and other patterns (such as custom in-memory trees).
- Supplies state for UI.
- May call `lib/features` (Feature layer).
- Must not directly call Scheduler or Storage.

Feature layer includes:

- Core business logic
- Supplies APIs for UI or State layers using FP, OOP, etc.
- Must not directly manipulate UI components.
- May call `lib/**`.

Scheduler layer includes:

- Task IDs must be named from `lib/scheduler/task-id`.
- `task.id` must include a name prefix, such as `storage-${id}`.

## Dependency Rules

- UI layer -> State layer -> Feature layer -> (Storage layer, Scheduler layer, etc.) -> Algorithms layer
- UI/State MUST NOT import from `lib/storage/**` directly (use `lib/features/**`).
- `lib/algorithms/**` MUST be pure (no IO, no React Native APIs).
- `lib/storage/**` MUST NOT depend on UI/State/Feature.

## Code Constraint

### Review

After any code generation, summarize changes + testing steps in a short bullet list.

### Document

If you modify these files, you **must** update `DESCRIPTION.md` in the same directory.

- `lib/storage/**`
- `lib/algorithms/**`
- `lib/features/**`
- `lib/scheduler/**`

`DESCRIPTION.md` format:

- ## API (exports, params, returns, errors)
- ## Changes (date + summary + breaking changes if any)

### Test

When you add or generate APIs under these directories, you **must** add corresponding unit tests at the same time:

- `lib/scheduler/**`
- `lib/algorithms/**`
- `utils/**`

# Commands

Package manager: npm

- android: `npm run android`
- ios: `npm run ios`
- web: `npm run web`
- lint: `npm run lint`

You MUST run `npm run lint` after code changes to check compiler error.

# AI Code Constraint

**You must follow the rules at the top of every file.**

```

在这个全局文档中，基本践行了前面提到的五条核心原则：

- 架构优先：先设计架构在进行功能开发，让 AI 在已有架构下进行开发
- 工程化约束：文档中中包含了各层级的详细依赖规则
- 人工审计：每次代码生成都要求简述修改内容和测试步骤
- 测试优先：核心目录下的代码变更都需要生成测试用例
- 文档优先：核心目录下的代码变更都需要生成文档记录
### 单文件

`AGENTS.md` 是全局约束，但是很多时候我们可能需要局部约束，比如某个文件需要特定的局部 AI Code 规则。

实现起来也很简单，你可以注意到我前面 `AGENTS.md` 中的：

```
**You must follow the rules at the top of every file.**
```

它的作用是“提醒”AI Code，如果文件顶部有 AI Code 规则，那么应当遵循这些规则。

这个文件顶部就可以写具体的规则约束，而且只在这个文件中生效。

```typescript
/**
 * AI CODE RULES:
 * 1. If you need to move the cursor(activeId), set the activeId first and then set the node, refer to removeItem.
 */

import { create } from "zustand";

```

比如说在上面这个例子中，为了避免删除节点再移动光标会导致手机输入法闪烁的问题，因此改为先移动光标，再删除节点，并且要求其他操作也这样实现。
### Skills: AI 编程的 function

另一个非常常用的 AI Code 功能是 Skills，我通常称它为 AI 编程中的 function。因为 function 在计算机中本身意味着封装和复用，这也是 skills 的主要特点，不过它封装的不是具体的代码，而是 AI 工作流程、约束流程和输出标准。

而 Skills 的价值在于：它将“人类工程师的经验”沉淀为可复用的工程资产。

对于架构优先的 AI Code 范式来说，Skills 不仅仅是一个 prompt 模板库，更是工程化约束的一部分。它可以将前面提到的架构分层、依赖规则、测试策略、文档规范等原则，进一步固化为 AI 的执行流程，使 AI 在每次生成时都自动遵循一致的输出标准。

从实践角度来看，Skills 通常可以覆盖以下几类高频场景：

- **新增功能模块**：自动生成符合分层架构的目录结构、代码骨架、接口定义与测试用例
- **重构与抽象**：将临时实现重构为可复用的 Feature API，并补齐测试与文档
- **生成单元测试**：对某个函数或模块生成覆盖边界条件的测试用例
- **生成文档与变更记录**：在修改核心目录时自动更新对应的 `DESCRIPTION.md`
- **代码审计与 Review**：对 AI 的变更输出进行结构化检查（是否破坏依赖规则、是否引入隐性耦合等）

## 总结

AI 时代重构了程序员的职责，当“写代码”变得廉价后，程序员的价值由原来的“写代码”变为更高维度的“掌控系统架构”。

Vibe Code 让灵感落地的速度前所未有地提升，它在原型验证、小型项目、个人开发场景中非常高效。但对于大多数真实项目而言，一旦进入长期迭代和维护阶段，缺乏架构设计与工程化约束的系统很容易变成“能跑但不可控”的黑盒，并在未来以数倍成本偿还早期节省的时间。

因此，笔者更倾向认为：在 AI Code 时代，大多数具有持续演化可能的项目都应该采用架构优先的范式——让人掌控系统架构与边界，AI 负责具体代码实现。这套 AI 编程范式并不是要限制 AI，而是让 AI 在**架构优先**、**工程化约束**、**人工审计**、**测试优先**和**文档优先**等原则下，建立一套可持续、可长期维护的系统开发工程。