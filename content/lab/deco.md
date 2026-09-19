---
title: Deco — 为理解框架而构建框架
description: A teaching-oriented Web Component framework built to study reactivity, rendering, scheduling, and framework design trade-offs.
publish: true
created: 2026-09-19
modified: 2026-09-19
---

> Deco 的目标不是成为另一个需要争夺用户的前端框架，而是成为一个可以阅读、运行和讨论的框架设计实验。

[View source on GitHub](https://github.com/star-ll/Deco)

## 为什么构建 Deco

阅读 Vue 或 React 的源码可以看到成熟框架最终的形态，但大量工程兼容、历史演进和性能优化也会掩盖最核心的设计问题。Deco 尝试在一个更小的系统里重新回答这些问题：

- 状态变化如何被追踪？
- 响应式更新何时发生？
- JSX 如何转换成真实 DOM？
- 多个更新如何被调度与合并？
- Web Component 生命周期如何与框架生命周期结合？
- 面向使用者的 API 应该隐藏什么，又应该暴露什么？

## 系统组成

```text
Reactive System → Scheduler → JSX Renderer → Web Component
```

围绕这条主链路，Deco 还实现了：

- `@Component`、`@Prop`、`@State`
- `@Watch`、`@Computed`
- `@Event`、`@Listen`、`@Ref`
- 生命周期
- 状态管理与插件机制
- CLI 与 Vite 插件
- Playwright 测试

## 教学价值

Deco 的价值不在于用更少的 API 替代 Vue，而在于把框架中经常被分开讲解的概念放回一个能够运行的整体：响应式系统产生更新，调度器控制时机，Renderer 落到 DOM，组件模型负责组织边界。

后续相关文章会围绕每个模块的设计目标、替代方案和取舍逐步展开。
