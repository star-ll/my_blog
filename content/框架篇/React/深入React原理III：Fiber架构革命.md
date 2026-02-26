---
{"publish":true,"created":"2026-02-13T10:13:31.000+08:00","modified":"2026-02-13T10:13:31.000+08:00","cssclasses":""}
---

## 引言

React 更新可以划分两个大的阶段，即 render 阶段和 commit 阶段，React 采用“先计算、后提交”的思路：用 Fiber 树（内部的可调度工作结构）来组织 UI 更新，通过新旧 Fiber 对比（调和）找出差异，并在 commit 阶段把差异应用到真实 DOM。

Render 阶段可以简单看做是一个 React 创建新树（ WorkInProgress 树）来替换旧树（Current 树）的过程，并且 React 还会在这个过程中做很多“标记”，包括对比新旧树的差异计算得到的更新标记。而 Commit 阶段则可以简单看做 React 根据 Render 阶段找出的更新标记，来实际更新 DOM 的过程。

>  注意：除非特殊说明，否则本文只关注 React 18 的并发模式部分

## Fiber 树

### 从虚拟 DOM 到 Fiber

如果你之前了解过 Vue 原理，那么你对虚拟 DOM 肯定不会陌生，简单来说，虚拟 DOM 就是通过 JS 对象来抽象表示真实的 DOM 节点。虚拟 DOM 的优势有两方面：

1. 通过对比新的虚拟 DOM 树和旧的虚拟 DOM 树，找出节点的差异，从而只修改差异部分，从而避免更新所有 DOM 节点。
2. 虚拟 DOM 提供抽象层，通过自定义渲染器来实现跨平台（例如 Uniapp）

事实上，虚拟 DOM 节点很简单，想象一下一个真实的 DOM 节点可能有哪些属性，它可能有一个节点类型, 还应该有一个属性指向真实 DOM 节点，如果是元素节点的话还应该有一个元素节点 tagName，如果是文本节点，那么应该有一个保存文本值的 textContent 属性等等，顺着这个思路，我们可以实现一个很简单的文本类型的 vnode（虚拟 dom 节点）。

```js
const vnode = {
	type: 'textNode',
	dom: null, // 真实dom的引用
	textContent: ''
}
```

如果同一个 vnode 在新虚拟 DOM 树和在旧的虚拟 DOM 树时的 textContent 不同，那么说明应该更新该 textContent 了。

```js
if(newVnode.textContext !== oldVnode.textContext){
	// 更新真实dom的textContent
	oldVnode.dom.textContent = newVnode.textContent
}
```

当然，这只是为了讲解虚拟 DOM 作用写的一个非常简单的例子，实际应用会比这复杂的多。更多细节参考 [[框架篇/Vue/Diff算法：Vue 2 Vs Vue3]]

React 18 实现了 Fiber 架构，区别于传统的虚拟 DOM，Fiber 是一个链表树，它与传统的虚拟 DOM 在结构、功能上有较大不同。

除根节点外 fiber 节点下几个指针：
- Return：指向父节点
- Sibling：指向同层右侧下一个兄弟节点
- Child：指向子节点
- Alternate：指向另一个 Fiber 树对应的 fiber 节点

```
// /或\表示双向，→单向  

         	 Root
         	 
     child/return ↖return
     
        A	→sibling  B
        
```

React 采用链表结构是为了更好地实现中断/恢复，如果是传统的 children 数组结构保存子节点列表，那么在中断之前就必须保存层级和该层下标等众多信息，才能在之后恢复时定位到之前中断的 fiber 节点。但是 fiber 架构的链表结构保证了，只需要保存当前 fiber 节点即可在恢复时继续工作。

### 双缓冲树

React 采用双缓冲树架构，包含 current 树和 workInProgress 树（简称 WIP 树）两颗 fiber 树，current 树表示对应当前真实 DOM 节点的虚拟 dom 树，而 workInProgress 表示正在构建的 fiber 节点树，它对应更新后的 DOM 树。

- WIP 树：对应即将更新的 DOM
- Current 树：当前的 DOM

React 采用双缓冲树的核心作用是提供一个“工作区”：render 阶段在 workInProgress 树上完成调和与标记，从而支持安全的中断、恢复和重做，同时不影响 current 树对应的已提交 UI。  
在此基础上，React 会在 commit 阶段根据这些标记只对差异部分执行 DOM 操作，以尽量减少真实 DOM 的修改。

React 每次更新都会构建一个新的 workInProgress 树，并替代 current 树，每次更新都重复此操作，因此，**React 更新的 Render 阶段可以看做是在不断的构建新的 workInProgress 并替换 current 树的过程。**

### Lane
#### Lane 更新优先级

React 18 并发模式更新时，会通过 Lane 来实现优先级更新策略，Lane 意思是车道，事实上，我们可以主线程看做是车道，更新看做是车道中行驶的汽车，Lane相当于车道优先使用权。

车道只有一个，因为 JS 是单线程，只有一个主线程，每次只能跑一组汽车（更新）。因此，React 会按照车道优先使用权进行排序，最高优先级的具有车道使用权（即renderLanes），等它们（renderLanes）到达终点，再换下一批次高车道优先使用权的汽车（次高 lanes优先级的更新）形势。

如果在此期间中途插入了更高车道优先级，那么真正行驶的汽车（renderLanes 更新）需要停车让出车道位置（中断），让新的高优先级汽车去行驶（此时它就是 renderLanes）。

按照这个规则，直到所有汽车都跑到终点（更新完毕）。

>  注意：中断只局限于 Render 阶段，Commit 更新具有原子性，无法被中断。

React 18 的 lane 有下面几种类型：

```js
const NoLane = 0b0000000000000000000000000000000; // 无更新
const SyncLane = 0b0000000000000000000000000000010; // 同步更新
const InputContinuousLane = 0b0000000000000000000000000001000; // 用户连续输入，如 input/textarea 的 onChange
const DefaultLane = 0b0000000000000000000000000100000; // 普通状态更新，如 setState() 默认使用的优先级
const TransitionLane1 = 0b0000000000000000000000010000000; // useTransition 标记的更新（React有一组TransitionLane）
const IdleLane = 0b0010000000000000000000000000000; // 空闲优先级，useDeferredValue 超时后使用
const OffscreenLane = 0b0100000000000000000000000000000; // 隐藏内容预渲染，如 Suspense fallback 的预加载


// 所有可调度更新的掩码
export const UpdateLanes = SyncLane | InputContinuousLane | DefaultLane | TransitionLanes;

```

假如在一次更新中包含 `DefaultLane | InputContinuousLane`，那么 React 会先执行 `InputContinuousLane` Lane 更新，然后再执行 `DefaultLane` Lane 的更新，但是如果在更新过程中插入了一个 `SyncLane` 的更新，那么因为无论是 `DefaultLane` 还是 `InputContinuousLane` 都没有 `SyncLane` 优先级高，因此 React 会立即中断之前的更新任务（前提是在 render 阶段，还没进入到 commit 阶段中，这一点后面会详细解析），并立即切换到 `SyncLane` 的更新中。

**总之，React 的更新遵循最高优先级原则，根据优先级顺序进行更新，每次都只更新未完成 Lane 中最高优先级的更新。**

#### 更新标志

**Lane 在 React 18 中扮演很重要的角色，它不仅仅代表更新的优先级，同时也是是否应该更新的标志。**换句话说，所有 fiber 节点的 lanes 默认是 NoLane，如果某个 fiber 节点中 lanes 不为 NoLane，那么说明这个 fiber 节点应该被更新。

此外，当一个 fiber 节点被打上 lanes 后，会向上冒泡，标志所有祖先节点 childLanes 属性，这是为了跳过不必要的遍历.

因为 react 的更新是从 fiber 树根节点开始遍历，当遍历到一个 fiber 节点的 childLanes 不是 NoLane 时，就说该节点的子孙节点中存在更新，应该向下遍历，否则，则说明此节点所有子孙节点都没有更新，应该跳过。

这部分具体逻辑实现在 `markUpdateLaneFromFiberToRoot` 函数中。

```ts
function markUpdateLaneFromFiberToRoot(sourceFiber, lane) {
  // 更新fiber lanes优先级
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
  var alternate = sourceFiber.alternate;

  if (alternate !== null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }

  var node = sourceFiber;
  var parent = sourceFiber.return;

  // 向上冒泡，标记所有祖先节点的childLanes
  while (parent !== null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;

    if (alternate !== null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    }

    node = parent;
    parent = parent.return;
  }

  // 冒泡到跟节点，返回根节点
  if (node.tag === HostRoot) {
    var root = node.stateNode;
    return root;
  } else {
    return null;
  }
}
```

当标记完成后，React 会调度 ensureRootIsScheduled 确保树更新任务被调度系统调度。

如果你了解过 Vue 或者其他组件粒度或者原子粒度的框架底层就会发现，React 更新与它们之间很大的一个差异在于，React 的更新始终是以 Fiber 树为更新粒度的，每次调度更新都会从 Fiber 树根节点进行遍历。

为了提升性能，React 会通过跳过未更新的子树、直接复制 current 树的 fiber 节点等方法来减少遍历和对比等操作带来的性能损耗。

#### 为什么采用位运算？

Lane 之所以采用位运算而不是数组或者集合，主要是因为数组或集合能实现的功能位运算都能实现，甚至更强，并且性能更好。

```js
// 假设x是一个未知的lane标志

X | A // 合并A
X & A > 0 // 判断X是否存在A
X & ~A // 将X中的A删除
X & -X // 获取X中最小值，即最高优先级
```

试想一下，如果封装集合 Set，也能实现这些功能，但是复杂度、性能等方面都不如位运算，**因此这种位运算的思想被广泛运用在前端框架中。**
#### React 中重要的 Lane 标志

React 和 Lane 相关的标志有三个：

1. Fiber.lanes： 即我们前面说的 lane，每个 fiber 都有，默认是 NoLanes
2. Fiber.childLanes：当某个 fiber 被打上 lanes 时，会冒泡其祖先 fiber 节点添加 childLanes 标志，目的是为了遍历时跳过无关子树，后面会详细介绍。
3. Root.pendingLanes：fiber根节点才有，用于获取 fiber 树有哪些待更新的优先级，每次取最高优先级处理

## 更新

### 组件更新

前面说过，React 更新是以 Fiber 树为更新粒度的，但是它会借助 childLanes 来跳过不需要更新的子树。具体来说，当调用 setState 函数时，setState 内部会做这这几件事：

1. **创建 update 任务**（这里先忽略这一步，留到[[框架篇/React/深入React原理IV：Hook原理和调和更新]]中）
2. **标记当前组件 fiber 更新优先级，同时向上冒泡标记组件节点的 childLanes**
3. **触发 fiber 树全局更新**

核心在 `dispatchSetState`, 它就是 useState 返回的 setState 函数。

```js
  // dispatchSetState就是[state,setState]中的setState
  function dispatchSetState(fiber, queue, action) {
    // 标记当前fiber优先级
    var lane = requestUpdateLane(fiber);
    
    // 内部执行markUpdateLaneFromFiberToRoot函数，冒泡更新祖先节点的childLanes（函数内还涉及到hook操作，这里先不关注）
    var root = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
    
    if (root !== null) {
      // 更新的入口函数，函数内会触发全局更新
	  scheduleUpdateOnFiber(root, fiber, lane, eventTime);
	}
  }
```

### 全局更新与跳过子树

React 的更新是全局更新，从根节点开始遍历，但是不会遍历整个树。主要步骤是：
1. setState 被调用
2. 标记并调用scheduleUpdateOnFiber
3. 调用ensureRootIsScheduled，确保全局更新进入调度
4. 全局更新被异步调度
5. 取 fiber 根节点中 pendingLanes 最高优先级 renderLanes
6. 深度遍历 Fiber 树，只遍历 `if ((fiber.childLanes & renderLanes) !== NoLanes)` 的子树，其他子树将被跳过
7. 处理所有 `if ((fiber.lanes & renderLanes) !== NoLanes)` 的 fiber 节点

从这可以看出，**React 的更新是更新是以整个 fiber 树为粒度的，但是 React 通过 lane 标志来跳过无关子树，从而减少遍历次数，优化性能。**

### Lane 更新优先级

在 React 18 并发模式下，React 更新每次都是优先处理最高优先级的 Lane，也就是说当有更高优先级插入时，React 会中断当前 Lanes 的更新，转向新的最高优先级 Lane 进行更新，但是需要注意，**Lane 插入导致的更新中断只会发生在 Render 阶段，因为 Commit 阶段会更新 DOM，需要保证原子性。**
## Render

在前面我们已经对 React 的虚拟 DOM、双缓冲树机制、更新粒度和 Lane 等有了初步的了解，下一步是深入到具体代码中。

React 的更新可以划分成两个大的阶段：Render 阶段和 Commit 阶段。**Render 阶段本质上可以看做是在构建 workInProgress 树的过程。** 理解了这一点有利于理解 render 阶段的代码。

#### 时间切片

React render 阶段进入的入口函数是 `renderRootConcurrent`, 他被 `performConcurrentWorkOnRoot` 调用，而 `performConcurrentWorkOnRoot` 被 `ensureRootIsScheduled` 调用，而后者则是触发整个 react fiber 树进行更新的函数。

调用链路如下：

1. ensureRootIsScheduled
2. (异步调度)
3. performConcurrentWorkOnRoot
4. renderRootConcurrent

>  着重强调下：组件的更新入口函数是 `scheduleUpdateOnFiber` 函数，而全局更新的入口函数是 `ensureRootIsScheduled` 函数，两者之间的关系是前者会调用后者，后者的作用是确保将最高 Lane 的全局更新任务被调度，注意是调度而不是执行，什么时候执行由调度系统决定。

我们重点关注下 `renderRootConcurrent`。

```tsx
function renderRootConcurrent(root, lanes) {
	// ...
    do {
      try {
        workLoopConcurrent();
        break;
      } catch (thrownValue) {
        handleError(root, thrownValue);
      }
    } while (true);

    if (workInProgress !== null) {
      // render阶段被中断，但是还没全部完成
      return RootInProgress;
    } else {
      // 全部处理完成
      return workInProgressRootExitStatus;
    }
  }
```

除去无关代码后，可以看到，`renderRootConcurrent` 函数核心部分是一个一直循环 while ，它会尝试调用 workLoopConcurrent，如果过程中触发异常，则会重复执行，如果顺序执行，则会跳出循环。这个循环的目的是为了提供**错误边界恢复**，避免一个组件出现异常而导致所有节点都异常。

函数最后通过检查 workInProgress 来确认 render 阶段是否完成，并返回相应标识，如果 render 阶段完成，则会进入到 commit 阶段。

`WorkLoopConcurrent` 函数是 render 阶段能够中断/恢复的关键函数，代码如下：

```ts
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress);
  }
}
```

`WorkLoopConcurrent` 函数通过 while 循环执行 `performUnitOfWork`，并通过 `shouldYield` 来实现超时中断，此外，当 `workInProgress` 为 null 时说明执行完毕，也应该退出。

`ShouldYield` 实际上执行的是 react 中的 `shouldYieldToHost`，当执行时间超过阈值（默认 5ms）时，则返回 `true`，表示应该中断执行，这是因为屏幕刷新率通常是 60 hz，这意味着浏览器应该在 16.66 ms 内完成渲染帧，react 尽可能地减少阻塞时间，可以让主线程有充足的时间完成渲染，避免出现由于渲染不及时导致卡顿。

```ts
var frameInterval = frameYieldMs; // frameYieldMs = 5
var startTime = -1;

function shouldYieldToHost() {
  var timeElapsed = getCurrentTime() - startTime;

  if (timeElapsed < frameInterval) {
    return false;
  } 
  return true;
}
```

这是在 react 18 并发模式下的行为，如果是同步模式下，则不会通过 shouldYield 去中断，则是直接全部完成。如果工作量大时，这会长时间地占用主线程，导致页面卡顿。

```ts
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}
```

`performUnitOfWork` 是处理 fiber 的工作函数，每次执行完后都会将 workInProgress 指向下一个 fiber 节点，再结合前面 `workLoopConcurrent` 函数的 while 循环，只要没有超时（`shouldYield`），那么就会一直被调用处理每一个 fiber 节点，直到下一个 fiber 节点为空，表示处理完毕，才会退出。

```ts
function performUnitOfWork(unitOfWork) {
  var current = unitOfWork.alternate;
  var next;

  next = beginWork(current, unitOfWork, subtreeRenderLanes);

  if (next === null) {
    // 执行完毕，所有fiber节点都被beginWork处理过了，接下来
    // 执行将每个fiber节点传递到completeWork函数执行
    completeUnitOfWork(unitOfWork);
  } else {
    // workInProgress指向下一个需要处理的fiber节点
    workInProgress = next;
  }
}
```

`performUnitOfWork` 有两个核心的函数，每个被遍历的 fiber 节点都会先后被这两个函数处理。这两个函数是 Render 阶段最重要的两个“工作”函数。

1. BeginWork
2. CompleteWork

### BeginWork 阶段

#### BeginWork

先来看 `beginWork`，代码中 `didReceiveUpdate` 标志组件是否需要更新。

```ts
function beginWork(current, workInProgress, renderLanes) {
  if (current !== null) {
    var oldProps = current.memoizedProps;
    var newProps = workInProgress.pendingProps;

    if (oldProps !== newProps || hasContextChanged() || ( workInProgress.type !== current.type )) {
      // 检查props是否变化
      // 检查context是否变化
      // 检查组件是否变化
      didReceiveUpdate = true;
    } else {
      // Props和Context都没变，继续检查其他更新条件
      var hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(current, renderLanes);
      if (!hasScheduledUpdateOrContext && (workInProgress.flags & DidCapture) === NoFlags) {
        // 没有任何更新需要处理，可以安全跳过
        didReceiveUpdate = false;
        return attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes);
      }

      if ((current.flags & ForceUpdateForLegacySuspense) !== NoFlags) {
        // 特殊情况强制更新
        // See https://github.com/facebook/react/pull/19216.
        didReceiveUpdate = true;
      } else {
        // 有状态更新但props没变，暂时标记为无更新
      	// 后续的状态处理可能会改变这个标志
        didReceiveUpdate = false;
      }
    }
  }

  workInProgress.lanes = NoLanes;

	// 根据fiber类型做相应的处理
  switch (workInProgress.tag) {
    // ...
    case FunctionComponent:
      {
        var Component = workInProgress.type;
        var unresolvedProps = workInProgress.pendingProps;
        var resolvedProps = workInProgress.elementType === Component ? unresolvedProps : resolveDefaultProps(Component, unresolvedProps);
        return updateFunctionComponent(current, workInProgress, Component, resolvedProps, renderLanes);
      }

    case ClassComponent:
      {
        var _Component = workInProgress.type;
        var _unresolvedProps = workInProgress.pendingProps;

        var _resolvedProps = workInProgress.elementType === _Component ? _unresolvedProps : resolveDefaultProps(_Component, _unresolvedProps);

        return updateClassComponent(current, workInProgress, _Component, _resolvedProps, renderLanes);
      }

    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes);

    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes);

    case HostText:
      return updateHostText(current, workInProgress);
	// ...
  }

  throw new Error("Unknown unit of work tag (" + workInProgress.tag + "). This error is likely caused by a bug in " + 'React. Please file an issue.');
}
```

可以看到，beginWork 函数会检查组件是否更新，然后根据 fiber 类型进行相应的处理。
#### 组件更新

接下来，我们重点关注下 `updateFunctionComponent`，这是组件更新的关键函数。

```ts
function updateFunctionComponent(current, workInProgress, Component, nextProps, renderLanes) {
  {
    // 标记组件渲染开始
    markComponentRenderStarted(workInProgress);
  }

  {
  	// 调用函数组件，renderWithHooks函数会返回子节点
    nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, context, renderLanes);
    // 检查是否使用了useId
    hasId = checkDidRenderIdHook();

	// strict模式下会调用两次组件渲染来检查副作用
    if ( workInProgress.mode & StrictLegacyMode) {
      setIsStrictModeForDevtools(true);

      try {
        nextChildren = renderWithHooks(current, workInProgress, Component, nextProps, context, renderLanes);
        hasId = checkDidRenderIdHook();
      } finally {
        setIsStrictModeForDevtools(false);
      }
    }

    setIsRendering(false);
  }

  {
  	// 标志组件渲染完成
    markComponentRenderStopped();
  }

  if (current !== null && !didReceiveUpdate) {
  	// 更新阶段且没有收到更新，则跳过hook处理和调和阶段
  	// didReceiveUpdate标志在前面的beginWork中会被设置
    bailoutHooks(current, workInProgress, renderLanes);
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
  }


  // reconcileChildren调和阶段
  workInProgress.flags |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);
  return workInProgress.child;
}
```

updateFunctionComponent 函数返回 `workInProgress.child` 后，会一直返回到 `performUnitOfWork`，并将 `workInProgress.child` 赋值给 workInProgress，然后重新处理子节点。
#### 总结

总结下来 beginWork 主要做了这几件事：
1. 检查 prop、context 等确定是否有更新，并标记 didReceiveUpdate
2. 根据 fiber 类型进行相应的处理，以函数组件为例
3. 执行函数组件（renderWithHooks） 
	1. 如果前面 didReceiveUPdate 标志当前组件不需要更新，则跳过 hook 处理和调和，并返回 current 树对应的子树 
	2. 否则，说明需要更新，则更新 hook 并执行调和，返回子节点以便进入子节点
4. 返回 `workInProgress.child` 作为下一个需要处理的节点

### CompleteWork 阶段

如果说 **beginWork 是“向下走”**（处理当前 fiber，并决定要不要进入子节点），那 **completeWork 就是“往上归”**：当一个 fiber 的子树都处理完了，开始为当前 fiber **收尾**——把子节点的结果“汇总”起来，准备好 commit 阶段真正要执行的 DOM 变更。

在 `performUnitOfWork` 里，当 `beginWork` 返回 `next === null`，就意味着 **当前 fiber 没有子节点可继续向下**（或者子节点都已经处理完毕），于是进入`completeUnitOfWork(unitOfWork)`

#### completeUnitOfWork

`completeUnitOfWork` 本质上是在做一件事：  
**对当前节点执行 completeWork，如果有兄弟就转去处理兄弟；没有兄弟就继续回到父节点 completeWork。**

简化后的结构大概是这样（忽略无关代码）：

```js
function completeUnitOfWork(unitOfWork) {
  var completedWork = unitOfWork;

  do {
    var current = completedWork.alternate;
    var returnFiber = completedWork.return;

    // 关键：对当前 fiber 做 completeWork
    completeWork(current, completedWork, subtreeRenderLanes);

    // 把子树的 flags / effect 汇总到父节点（为 commit 做准备）
    bubbleProperties(completedWork);

    // 如果有兄弟节点，下一步处理兄弟（重新进入 beginWork）
    var sibling = completedWork.sibling;
    if (sibling !== null) {
      workInProgress = sibling;
      return;
    }

    // 没兄弟就回到父节点，继续 completeWork
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

```

这里你可以把它想成：
- beginWork：一路 DFS 往下“开枝散叶”
- completeWork：一路往上“收拾现场 + 记账”
- 遇到 sibling：切到 sibling，再走 beginWork 的那条“往下”路线
#### completeWork

`completeWork` 会根据 fiber 类型做不同处理。核心目标是两类：

1. **构建/更新宿主环境的实例**（Host 环境：浏览器里就是 DOM）
2. **收集副作用 flags**（Placement/Update/Deletion 等），让 commit 阶段照单执行

```js
function completeWork(current, workInProgress, renderLanes) {
  switch (workInProgress.tag) {
    case HostComponent:
      // 创建或更新 DOM 节点，处理属性
      // 并把 children 的 DOM 挂接关系“算出来”
      break;

    case HostText:
      // 创建或更新 Text 节点
      break;

    case FunctionComponent:
    case ClassComponent:
      // 本身不直接生成 DOM
      // 主要是做一些收尾与属性冒泡
      break;

    case HostRoot:
      // root 收尾，准备进入 commit
      break;
  }
}

```

#### DOM 的创建与更新标记

以HostComponent（如 `<div />`）为例，它是 **真正对应 DOM 的 fiber**。

核心逻辑可以概括成三步：

1. **mount：没有 current 时创建 DOM 实例**
    - `createInstance(type, props, rootContainer, ...)`
    - 把子节点 DOM append 进去（但注意：这是在“构建离屏结构/引用”，真正插入页面要等 commit）
2. **update：有 current 时对比 props，决定是否打 Update flag**
    - `prepareUpdate(instance, type, oldProps, newProps, ...)`
    - 如果有差异，把更新 payload 挂到 `workInProgress.updateQueue`（不同版本细节略有差异），并标记 `Update`
3. **把 DOM 引用挂在 fiber 上**
    - `workInProgress.stateNode = instance`

Text 节点（HostText）类似：创建或对比文本内容，必要时标记 Update。

### bubbleProperties

completeWork 结束后，会执行 `bubbleProperties` ，把子节点的 flags（以及 effect 信息）**向上汇总**，作用有两个：

- `subtreeFlags`：表示“这棵子树里有没有需要 commit 的东西”
- 这样 commit 阶段就能快速跳过“完全没变化”的分支，提高效率

这和 childLanes 的作用非常类似。
### 总结

BeginWork 负责递过程，而 completeWork 负责归过程，简单来说 completeWork 做了下面几件事：

1. **当 beginWork 走到尽头（next === null）时，进入 completeUnitOfWork 开始回溯**
2. 对每个 fiber 执行 `completeWork`（以最常见几种类型为例）：
    - HostComponent/HostText：创建或更新 DOM 相关实例，必要时打上 `Update` 等 flags
    - Function/Class：本身不产 DOM，主要参与副作用汇总与收尾
3. 通过 `bubbleProperties` 把子树的 flags / effect 信息向上汇总，方便 commit 快速定位需要处理的节点
4. 回溯过程中：有 sibling 就切 sibling 重新 beginWork；没 sibling 就继续向父节点回溯，直到 root 完成

接下来 commit 阶段就会根据这些 flags，执行真正的 DOM 插入、更新、删除等操作。

总的来说，可以简单理解 completeWork 做的是将 flags 等标志冒泡（类似前面的 childLanes）和初始化 DOM（这里注意只创建，没实际挂载到 DOM 树）等收尾工作。

### Render 阶段总结

#### 一句话概括

**Render 阶段可以看做是 React 为 renderLanes 构建 workInProgress 树，并在期间打上各种标志（effect、flags 等）的过程，这些标志将在后面被 commit 阶段使用。**

这句话拆开有几个重点：
- **RenderLanes**：React 从root.pendingLanes 中选出最高优先级 lane 集合，作为本次renderLanes，Render 阶段不会一次性处理所有 lanes，而是只处理当前renderLanes。
- **构建 workInProgress 树**：双缓冲树，Render 阶段会构建 WIP 树并替换 current 树，current 树对应着当前 DOM 树。
- **打上各种标志**：render 阶段会通过调和给 fiber 打上 flags 等标志，以便 commit 阶段使用。

#### 跳过子树

需要注意的是，在更新阶段（非初始渲染时），React 每次更新都构建 workInProgress 树，可以说 react 是以整个 fiber 树为更新粒度的，但是它会跳过不需要更新的子树，直接复用 current 树对应的子树，组件是否需要更新依靠前面所说的 `didReceiveUpdate` 标志进行判断。

另外，可以发现，当某个组件更新时（didReceiveUpdate 为 true），默认情况下其整个子树都会被处理，但是如果使用 memo，则会进行 props 和 ref 的比较，如果两者都相同，则复用 current 树对应的子树。
```ts
function updateMemoComponent(current, workInProgress, Component, nextProps, renderLanes) {
	// ...
	if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
}
```

#### 遍历顺序

React 处理 fiber 树的遍历是**深度优先遍历**，先顺着 child 指针 beginWork 所有子节点，当没有子节点时，先执行 completeWork 处理自身，然后再检查所有有兄弟节点，若有，则仍然按照深度优先处理兄弟节点，否则回溯调用 completeWork 处理父节点。

以下面这个结构为例
```
     A
   /   \
  B  -  D
 /       \
C         E - F

// B是A的child，C是B的child，D是B的sibling
// E是D的child，F是E的sibling
```

那么遍历顺序就是：
1. BeginWork (A)
2. BeginWork (B)
3. BeginWork (C)
4. CompleteWork (C)
5. CompleteWork (B)
6. BeginWork (D)
7. BeginWork (E)
8. CompleteWork (E)
9. BeginWork (F)
10. CompleteWork (F)
11. CompleteWork (D)
12. CompleteWork (A)

## Commit
Render 阶段本质上是在构建 workInProgress 树，并打上各种 flags（Placement / Update / Deletion / Passive 等）。  

而 **Commit 阶段**则是 React 真正把这些 flags 对应的变更 **原子性地应用到真实 DOM** 的过程。

Commit 阶段有两个重要特征：
- **不可中断**：Render 阶段可以时间切片，但 Commit 必须一次性完成，否则页面会处于“半更新”状态。
- **只做执行**：Render 阶段负责计算，Commit 阶段负责照单执行。

React 会把 Commit 进一步拆成三个子阶段：

| 子阶段             | 核心作用             | 是否修改 DOM |
| --------------- | ---------------- | -------- |
| Before Mutation | DOM 变更前的准备工作     | ❌        |
| Mutation        | 执行 DOM 插入/更新/删除  | ✅        |
| Layout          | DOM 变更后的同步副作用与回调 | ❌        |
## Commit 的入口

当 Render 完成后，React 会调用 Commit 阶段的入口函数： `commitRoot(root)`

commitRoot 内部会依次执行三个阶段：

- `commitBeforeMutationEffects`
- `commitMutationEffects`
- `commitLayoutEffects`
### Before Mutation
Before Mutation 的核心目标是：**在 DOM 真正被修改之前，先处理一些必须提前读取或清理的副作用。**

这个阶段不会修改 DOM，主要做三件事：

- 处理 Snapshot（getSnapshotBeforeUpdate）
- 处理 Focus / Selection 等状态保存，避免 Mutation 阶段 DOM 替换后光标丢失。
- 标记/收集 Passive Effects（useEffect），并在 commit 结束后调度异步执行。
### Mutation

Mutation 阶段是 Commit 的核心，它将借助 render 阶段计算得到的 flags 去真正执行 DOM 的插入、删除、更新。

总的来说，Mutation 对 DOM 对操作可以分为三类：

| 类型    | flags     | 是否修改 DOM | 操作                        |
| ----- | --------- | -------- | ------------------------- |
| 插入/移动 | Placement | 是        | 把新 DOM 节点插入到正确位置（包含插入和移动） |
| 更新    | Update    | 是        | 更新属性、事件、文本内容等             |
| 删除    | Deletion  | 是        | 从 DOM 树移除节点，并做卸载相关清理      |

对于更新和删除比较好理解，React 直接根据 flags 更新或者删除对应节点即可，然而 React 中用 Placement 同时表示插入和移动可能让人较为困惑，要知道在另一个流行的前端框架 Vue 中，会区分对待插入和移动，甚至会一套极为复杂的 LIS 算法来尽量减少移动次数。

而 React 不同，在对待插入和移动上，React 只关心节点应该在哪个位置上，并将它放到这个位置上，因为在 DOM API 层面，`insertBefore` 对已存在节点会自动进行移动。这样性能上可能略有欠缺，但是可以让 mutation 阶段更加简单、可预测。

这其实也体现了两个框架之间设计理念的差异，Vue 在DOM更新方面更加追求极致的性能，而 React 更看中可预测性。

>  关于 Mutation 和调和更多细节，笔者将它们放到[[框架篇/React/深入React原理IV：Hook原理和调和更新]]一章中介绍。
### Layout
DOM 更新完成后，React 进入 Layout 阶段。

Layout 阶段主要是执行一些生命周期钩子函数，比如：
- useLayoutEffect
- componentDidMount
- componentDidUpdate

此外，React 会在 Layout 阶段完成 ref 的赋值，以保证 ref 指向最新 DOM。

```jsx
 <div ref={el => ...} />
```
## Commit 阶段总结

Commit 阶段就是**根据 Render 阶段的 flags，把 workInProgress 的计算结果原子性提交到真实 DOM。**

## 总结

React 18 的更新可以理解为“先计算、后提交”的两段式流程：

Render 阶段在 workInProgress 树上完成本次 `renderLanes` 对应的工作（可被时间切片中断/恢复），通过 beginWork/completeWork 深度优先遍历 Fiber，完成子树的调和与 DOM 实例准备，并在 Fiber 上打上 Placement / Update / Deletion / Passive 等 flags 与子树汇总标记；

Commit 阶段则在不可中断的前提下按三个小阶段执行这些标记：

Before Mutation 负责 DOM 变更前的读取与准备（如 snapshot、selection 等），Mutation 真正执行 DOM 的插入/更新/删除，Layout 在 DOM 更新后触发同步副作用（useLayoutEffect、生命周期、ref 挂载），而 useEffect 这类 passive effect 会在 commit 结束后被调度异步执行。

整体上，双缓冲树提供“工作区隔离”，Lane 提供“更新优先级与可跳过子树的标记体系”，两者共同支撑了并发模式下可中断的 Render 与原子性的 Commit。