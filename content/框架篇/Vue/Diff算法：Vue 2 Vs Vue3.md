---
{"publish":true,"created":"2025-08-23T12:24:00.803+08:00","modified":"2026-01-24T13:38:56.297+08:00","cssclasses":""}
---

# Diff算法：Vue 2 Vs Vue3

## 设计思想

无论是Vue2还是Vue3，Vue的diff算法都是基于**Virtual DOM**的展开计算的，并且diff都只计算同一层的节点，不会出现跨层级的diff。通过这种方式，diff算法的时间复杂度可以降到O(n^2)，其中n为节点数量，通过Vue等现代框架的进一步优化，可以降至更低。如果采用跨层级的diff算法，时间复杂度可能会达到O(n^3)。

现代前端框架普遍采用key来将diff算法平均时间复杂度进一步降低至O(n)，具体实现方式是让框架使用者为每个节点都手动绑定一个稳定不变的key，框架底层在diff时利用哈希表来减少遍历次数。

Diff算法本质上是找出新旧节点的差异，然后根据差异进行更新，从而通过JS的计算来减少浏览器重复渲染的开销。因此，优化diff算法的主要思路是尽量减少diff算法的计算量，为此，Vue2和Vue3都提供了快速比较的算法，比如Vue2中四指针直接比较的算法，Vue3中双端对齐比较的算法。他们通过直接比较，来快速地找到对应的节点。

找出节点的差异后，Vue会针对差异的部分对旧节点（对应真实DOM）进行**打补丁**，即更新旧节点，从而达到更新视图的目的。例如，如果新旧节点都是元素节点，diff算法比较后发现是属性不同，那么打补丁操作会更新属性，如果新旧节点都是文本节点，比较发现是内容不同，那么打补丁操作会更新内容。如果新旧节点的类型不同，则直接替换。

新旧节点比较总共有四种情况：新增、删除、更新、移动。Vue会尽可能地利用移动的节点，从而减少DOM操作，尤其是在Vue3的diff算法中。

总的来说，diff算法有以下原则：
- 基于树结构（虚拟DOM）比较节点，只进行同层节点的比较
- 节点类型不同，则直接替换，否则继续比较属性和子节点
- 通过快速diff算法，尽量减少节点的比较
- 应该尽可能的利用移动的节点

## Vue2

Vue2采用四指针两端向中心遍历算法来比较节点，简单来说，就是用四个指针分别指向新节点左端节点（newStartIdx），新节点列表最右端节点（newStartIdx），旧节点左端节点（oldStartIdx）和旧节点列表最右端节点（oldEndIdx），然后四个指针两两比较，不断从两端向中心遍历。
```
newStart   →←   newEnd
   ↑             ↑
   ↓			 ↓
endStart   →←   oldEnd
```

这对于一些简单场景可以快速完成diff比较，比如：

```
A B C D  // 旧
D B C A  // 新
```

对于一些复杂场景，四指针快速比较法可能没办法处理，因此Vue、React以及其他采用虚拟DOM的框架通常采用key来标识节点，key相当于为这个节点打上了一个标志，这个标志要求保持**稳定不变**，以便在新旧列表对比时能快速根据key找到对应的节点。

想象下，如果key不是稳定不变的，例如采用index作为key`:key="index"`，中间第二个节点被删除，导致后面第三个节点原本`key===2`，结果在新节点中`key===1`，vue就无法找到正确的节点，从而导致复用错误或者重新卸载创建节点，从而影响性能。

```ts
while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
  if (isUndef(oldStartVnode)) {
	oldStartVnode = oldCh[++oldStartIdx] // Vnode has been moved left
  } else if (isUndef(oldEndVnode)) {
	oldEndVnode = oldCh[--oldEndIdx]
  } else if (sameVnode(oldStartVnode, newStartVnode)) {
	patchVnode(
	  oldStartVnode,
	  newStartVnode,
	  insertedVnodeQueue,
	  newCh,
	  newStartIdx
	)
	oldStartVnode = oldCh[++oldStartIdx]
	newStartVnode = newCh[++newStartIdx]
  } else if (sameVnode(oldEndVnode, newEndVnode)) {
	patchVnode(
	  oldEndVnode,
	  newEndVnode,
	  insertedVnodeQueue,
	  newCh,
	  newEndIdx
	)
	oldEndVnode = oldCh[--oldEndIdx]
	newEndVnode = newCh[--newEndIdx]
  } else if (sameVnode(oldStartVnode, newEndVnode)) {
	// Vnode moved right
	patchVnode(
	  oldStartVnode,
	  newEndVnode,
	  insertedVnodeQueue,
	  newCh,
	  newEndIdx
	)
	canMove &&
	  nodeOps.insertBefore(
		parentElm,
		oldStartVnode.elm,
		nodeOps.nextSibling(oldEndVnode.elm)
	  )
	oldStartVnode = oldCh[++oldStartIdx]
	newEndVnode = newCh[--newEndIdx]
  } else if (sameVnode(oldEndVnode, newStartVnode)) {
	// Vnode moved left
	patchVnode(
	  oldEndVnode,
	  newStartVnode,
	  insertedVnodeQueue,
	  newCh,
	  newStartIdx
	)
	canMove &&
	  nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm)
	oldEndVnode = oldCh[--oldEndIdx]
	newStartVnode = newCh[++newStartIdx]
  } else {
	if (isUndef(oldKeyToIdx))
	  oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx)
	idxInOld = isDef(newStartVnode.key)
	  ? oldKeyToIdx[newStartVnode.key]
	  : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx)
	if (isUndef(idxInOld)) {
	  // New element
	  createElm(
		newStartVnode,
		insertedVnodeQueue,
		parentElm,
		oldStartVnode.elm,
		false,
		newCh,
		newStartIdx
	  )
	} else {
	  vnodeToMove = oldCh[idxInOld]
	  if (sameVnode(vnodeToMove, newStartVnode)) {
		patchVnode(
		  vnodeToMove,
		  newStartVnode,
		  insertedVnodeQueue,
		  newCh,
		  newStartIdx
		)
		oldCh[idxInOld] = undefined
		canMove &&
		  nodeOps.insertBefore(
			parentElm,
			vnodeToMove.elm,
			oldStartVnode.elm
		  )
	  } else {
		// same key but different element. treat as new element
		createElm(
		  newStartVnode,
		  insertedVnodeQueue,
		  parentElm,
		  oldStartVnode.elm,
		  false,
		  newCh,
		  newStartIdx
		)
	  }
	}
	newStartVnode = newCh[++newStartIdx]
  }
}
```

while结束条件是新旧节点列表任意一方遍历完毕，也就是说当while循环结束后，必然只剩下三种情况。

- 新节点列表遍历处理完成，旧节点列表未全部处理完毕
- 旧节点列表遍历处理完成，新节点列表未全部处理完毕
- 新旧节点列表都被处理完毕

对于第一种情况，新节点都被处理好了，但是存在多余的未被处理的旧节点，说明这些旧节点不再需要，直接卸载删除即可，同理，第二种直接创建插入即可。最后一种新旧节点列表都被处理完毕的情况则不需要做任何处理。

```ts
 if (oldStartIdx > oldEndIdx) {
  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm
  addVnodes(
	parentElm,
	refElm,
	newCh,
	newStartIdx,
	newEndIdx,
	insertedVnodeQueue
  )
} else if (newStartIdx > newEndIdx) {
  removeVnodes(oldCh, oldStartIdx, oldEndIdx)
}
```

## Vue3

### 快速比较

Vue3首先会使用双端对齐算法快速扫描一遍，简单来说就是新节点列表和旧节点列表左端对齐，然后从左端开始遍历比较，然后再右端对齐，从右端开始向左端遍历比较。

```plaintext
// 1. 从头部开始比较
(a b) c
(a b) d c

// 2. 从尾部开始比较
(c)
d (c)
```
### 新增与删除

经过快速比较后，两端的节点已经比较完毕，那么就可以开始比较中间的节点了。在一些情况下，可能会出现新节点列表为空，但是旧节点列表不为空的情况，这说明旧节点列表中多出来的节点需要被删除，相似的，如果出现旧节点列表为空，但是新节点列表不为空的情况，这说明新节点列表中多出来的节点需要被添加。

```plaintext
// 1. 新节点列表为空，旧节点列表不为空
(a b) c // 旧
(a b)   // 新

// 2. 旧节点列表为空，新节点列表不为空
(a b)     // 旧
(a b) c d // 新
```

以上面为例，当新节点列表为空时，则需要将旧节点列表中的节点（即c节点）全部删除，当旧节点列表为空时，则需要将新节点列表中的节点（即c和d节点）全部添加。

通过快速比较和这种新增与删除的策略，Vue3的diff算法可以达到O(n)的时间复杂度，其中n为节点数量。但是这只能处理简单的场景，对于更复杂的场景，例如出现了节点移动的情况，Vue3的diff算法会采用更复杂的策略。

### 乱序节点处理

#### 最长递增子序列

Vue3在Vue2的基础上，引入了LIS（最长递增子序列）算法，来处理乱序节点的情况。

> 注意：子序列不要求元素的下标是连续

我们以一个简单的示例来说明：

```js
const oldList = ['a', 'b', 'c', 'd']
const newList = ['a', 'd', 'b', 'c']
```

在上面的示例中，从`oldList`转变为`newList`有两种方式：

- 一种是将d节点移动到了a节点的后面
- 另一种情况是将b节点和c节点移动到了d节点后面

两种方式都能达到我们所需要的效果，但是从性能层面考虑，前者只移动一次，而后者却要移动两次，从性能上看肯定是前者更好，因此Vue3要做的，就是让diff算法能够正确地执行第一种方案，也就是说diff算法应该尽可能少地移动节点。

那么如何实现这一目的呢？直接找到最少需要移动的节点可能会比较困难，但是我们可以换个思路，如果我们能够得到最长的不需要移动的节点，那么剩下的节点就是能够实现最小移动次数的节点。

以上面的示例进行分析，`oldList`代表旧节点列表，而`newList`代表新节点列表，我们以节点在`newList`中节点为基准，找到对应旧节点的下标。

```javascript
const oldList = ['a', 'b', 'c', 'd']
const newList = ['a', 'd', 'b', 'c']

// 新节点在旧节点列表位置的映射关系
const mapped = [0, 3, 1, 2] // 对应newList所有元素在oldList中的下标
```

通过观察可以发现，通过对 `mapped` 数组 `[0, 3, 1, 2]` 求最长递增子序列，可以得到 `[0, 1, 2]`，对应的是 `a, b, c` 这三个节点，它们在 `oldList` 中的相对顺序未改变。`d` 不在最长递增子序列中，因此我们只需要移动剩余节点即可。

这种方式的原理在于，我们是构建了一个`{新节点下标： 旧节点下标}`的数组形式的映射关系，在这个关系中新节点列表`newList = ['a', 'd', 'b', 'c']`的节点顺序必然是递增的，我们以`newList`为基准，然后反推其在旧节点列表中的下标位置`mapped = [0, 3, 1, 2]`，其中`[0, 1, 2]`是最长递增子序列，这说明发生移动的前后，`a、b、c`这三个节点始终保持相同的递增顺序关系，它们将被视为“稳定的”节点，那么只要移动剩余节点，就可以以尽可能少的移动次数完成旧节点到新节点的更新。

> 注意文中以`{新节点下标： 旧节点下标}`来直观地表示映射关系，但是实际上vue3使用的是数组结构而不是对象或Map。

通过LIS来优化移动次数的原理在于：如果一组子序列在发生移动的前后到保持一致的顺序关系，那么他们是稳定的，找出最长的递增子序列就找到了最长的稳定节点序列，之后只要移动剩余节点即可。因此，Vue3中LIS 算法的核心原理可以简化为：**找到新旧列表中相对顺序保持一致的最长子序列（即 “稳定子序列”）**

#### 变量说明

Vue3 diff算法很多变量采用简写的形式，例如`c1`实际上表示旧节点列表`oldChildren`，初学者容易混淆这些变量，提前了解这些变量的含义和关系有利于理解整个diff流程。

| 变量名         | 说明                        |
| ----------- | ------------------------- |
| c1          | 旧节点列表                     |
| c2          | 新节点列表                     |
| s1          | start1，旧节点列表左指针           |
| e1          | end1，旧节点列表右指针             |
| s2          | start2，新节点列表左指针           |
| e2          | end2，新节点列表右指针             |
| toBePatched | 经过双端对齐比较处理后，中间未被处理的乱序节点长度 |
| moved       | 是否存在移动的标志                 |

#### 具体实现

前面提到过，Vue3需要构建一个`{新节点下标： 旧节点下标}`的数组形式的映射关系，以便找到最长稳定序列，当然你也可以通过构建`{旧节点下标: 新节点下标}`反过来也可以找到最长递增子序列，但是Vue3找到最长递增子序列的目的是为了实现尽可能少的移动，最终移动的是旧节点，因此Vue3源码中实际上采用的是前者这种形式，以更方便地移动节点。

Vue3首先做的是遍历新节点列表构建keyToNewIndexMap`{新节点key: 新节点index}`关系表

```ts
// 5.1 构建{新节点key: 新节点index}关系表
const keyToNewIndexMap: Map<string | number | symbol, number> = new Map()
for (i = s2; i <= e2; i++) {
// optimized是模板编译中一个vnode标志，表示vnode是静态节点块还是动态节点
const nextChild = (c2[i] = optimized
  ? cloneIfMounted(c2[i] as VNode)
  : normalizeVNode(c2[i]))
if (nextChild.key != null) {
  keyToNewIndexMap.set(nextChild.key, i)
}
}
```

然后遍历旧节点列表，这一步实现了三点目的：
1. 可以通过前面的keyToNewIndexMap快速判断旧节点key是否在新节点列表中不存在，如果是，则说明此旧节点不再需要，将其删除。
2. 构建newIndexToOldIndexMap`{新节点index: 旧节点index}`关系表，为下一步移动做准备
3. 判断是否存在移动

```ts
// 5.2 遍历旧节点列表
let j
let patched = 0
// 新节点列表中间未被处理的乱序部分的长度
const toBePatched = e2 - s2 + 1
let moved = false
// 用户判断是否存在移动
let maxNewIndexSoFar = 0
// {新节点index: 旧节点index}关系表
const newIndexToOldIndexMap = new Array(toBePatched)
// 初始设置为0，作为特殊标志，后面oldIndex会被设置为index+1
for (i = 0; i < toBePatched; i++) newIndexToOldIndexMap[i] = 0

for (i = s1; i <= e1; i++) {
	const prevChild = c1[i]
	if (patched >= toBePatched) {
	  // 所有的新节点都被处理了，那么剩下的旧节点就是多余的
	  unmount(prevChild, parentComponent, parentSuspense, true)
	  continue
	}
	let newIndex
	if (prevChild.key != null) {
	  newIndex = keyToNewIndexMap.get(prevChild.key)
	} else {
	  // 缺失key，遍历查找相同类型的节点。尽量复用
	  // 注意isSameVNodeType会比较key，会避开有key的节点
	  for (j = s2; j <= e2; j++) {
		if (
		  newIndexToOldIndexMap[j - s2] === 0 &&
		  isSameVNodeType(prevChild, c2[j] as VNode)
		) {
		  newIndex = j
		  break
		}
	  }
	}
	if (newIndex === undefined) {
	  unmount(prevChild, parentComponent, parentSuspense, true)
	} else {
	  // +1是为了将初始0作为特殊标志，0表示没有对应的旧节点
	  newIndexToOldIndexMap[newIndex - s2] = i + 1
	  if (newIndex >= maxNewIndexSoFar) {
		maxNewIndexSoFar = newIndex
	  } else {
		moved = true
	  }
	  patch() // 打补丁
	  patched++
	}
}
```

5.2有两处处理删除旧节点的地方，在第一处，toBePatched是新节点列表中未被处理的中间乱序节点的长度，同时用patched表示被处理的新节点，如果patched大于toBePatched则说明所有的新节点都被处理了，那么剩下的旧节点直接卸载即可。

第二处是未在keyToNewIndexMap中找到对应的新节点，如果这是由于缺少key导致的，那么Vue会遍历新节点列表尽可能找到可以复用的新节点（相同类型且没有key的节点），如果没有找到，则会删除此旧节点。

这一步另一个目的是为了构建{新节点index: 旧节点index}这个关系表，这一步是为了后面利用LIS来移动做准备。

前面这两点好理解，主要在于最后一点，Vue是如何判断是否存在移动的？答案仍然在于递增序列上。

Vue3会维护一个maxNewIndexSoFar，然后遍历旧节点，如果旧节点对应的新位置（对应新节点的index）大于maxNewIndexSoFar，而重新设置maxNewIndexSoFar为这个新节点index，否则则说明存在移动。

这是因为如果没有移动的情况下，新旧节点列表的索引都应该保持递增的稳定关系。

```ts
let a1 = ['A', 'B', 'C'] // 对应下标： 0 1 2
let a1 = ['A', 'B', 'C', 'D] // ABC对应下标仍然是： 0 1 2

let b1 = ['A', 'B', 'C'] // 对应下标： 0 1 2
let b2 = ['A', 'C', 'B']// 对应下标： 0 2 1
```

从上面的例子可以看出，如果新旧两个列表如果没有发生移动，那么其节点在其前后的列表的下标都应该是保持递增的关系，否则说明发生了移动。

如果发生了移动，则需要`patch`进行“打补丁”，并且将`moved`标志设为`true`。

```ts
	// 5.3 移动和挂载
  // 构建LIS
  const increasingNewIndexSequence = moved
	? getSequence(newIndexToOldIndexMap)
	: EMPTY_ARR
  j = increasingNewIndexSequence.length - 1
  // 遍历新节点列表，toBePatched是未被处理的新节点列表长度
  for (i = toBePatched - 1; i >= 0; i--) {
	const nextIndex = s2 + i
	const nextChild = c2[nextIndex] as VNode
	const anchor =
	  nextIndex + 1 < l2 ? (c2[nextIndex + 1] as VNode).el : parentAnchor
	if (newIndexToOldIndexMap[i] === 0) {
	  // 挂载新节点
	  patch(
		null,
		nextChild,
		container,
		anchor,
		parentComponent,
		parentSuspense,
		namespace,
		slotScopeIds,
		optimized,
	  )
	} else if (moved) {
	  // 移动不再LIS中的节点
	  if (j < 0 || i !== increasingNewIndexSequence[j]) {
		move(nextChild, container, anchor, MoveType.REORDER)
	  } else {
		j--
	  }
	}
  }
```

最后一步会做两件事：
1. 挂载新节点
2. 移动节点

如果moved标志为true，则说明存在移动的情况，Vue3会将前面的`newIndexToOldIndexMap`通过`getSequence(newIndexToOldIndexMap)`转换成LIS（最长递增子序列），如果没有出现移动的情况，那么自然没必要去做额外的处理，直接赋值一个空数组即可（EMPTY_ARR）。

需要注意的是Vue会从后向前遍历，这是为了方便获取插入（document.insertBefore）的锚点（anchor）。

至此，Vue 已妥善处理了节点的移动、更新（patch）、新增与删除等操作，完成了从真实 DOM 到新虚拟节点（newVnode）的转换。

### 没有key的情况

Vue3相较于Vue另一个优化是专门实现了没有Key场景下的算法。Vue3通过编译时优化来识别列表是否使用了key。代码如下所示，`PatchFlags`是一个编译时标志。

```ts
  if (patchFlag & PatchFlags.KEYED_FRAGMENT) {
	// this could be either fully-keyed or mixed (some keyed some not)
	// presence of patchFlag means children are guaranteed to be arrays
	patchKeyedChildren(
	  c1 as VNode[],
	  c2 as VNodeArrayChildren,
	  container,
	  anchor,
	  parentComponent,
	  parentSuspense,
	  namespace,
	  slotScopeIds,
	  optimized,
	)
	return
  } else if (patchFlag & PatchFlags.UNKEYED_FRAGMENT) {
	// unkeyed
	patchUnkeyedChildren(
	  c1 as VNode[],
	  c2 as VNodeArrayChildren,
	  container,
	  anchor,
	  parentComponent,
	  parentSuspense,
	  namespace,
	  slotScopeIds,
	  optimized,
	)
	return
  }
```

`patchUnkeyedChildren`这个函数比较简单，核心思想是尽可能的复用节点。新旧节点列表左端对齐开始遍历，直接复用旧节点。

```ts
  const patchUnkeyedChildren = (
    c1: VNode[],
    c2: VNodeArrayChildren,
    container: RendererElement,
    anchor: RendererNode | null,
    parentComponent: ComponentInternalInstance | null,
    parentSuspense: SuspenseBoundary | null,
    namespace: ElementNamespace,
    slotScopeIds: string[] | null,
    optimized: boolean,
  ) => {
    c1 = c1 || EMPTY_ARR
    c2 = c2 || EMPTY_ARR
    const oldLength = c1.length
    const newLength = c2.length
    const commonLength = Math.min(oldLength, newLength)
    let i
    for (i = 0; i < commonLength; i++) {
      const nextChild = (c2[i] = optimized
        ? cloneIfMounted(c2[i] as VNode)
        : normalizeVNode(c2[i]))
      patch(
        c1[i],
        nextChild,
        container,
        null,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
      )
    }
    if (oldLength > newLength) {
      // remove old
      unmountChildren(
        c1,
        parentComponent,
        parentSuspense,
        true,
        false,
        commonLength,
      )
    } else {
      // mount new
      mountChildren(
        c2,
        container,
        anchor,
        parentComponent,
        parentSuspense,
        namespace,
        slotScopeIds,
        optimized,
        commonLength,
      )
    }
  }
```

### Vue2 vs Vue3

相较于Vue2，Vue3创新性地引入了LIS来优化处理移动场景的逻辑，借助相对顺序稳定的特性，可以使用更少的移动次数来完成节点的移动操作。

此外，Vue3还借助编译时技术来提前判断开发者是否采用了key，如果没有使用key，则会进入到`patchUnkeyedChildren`算法中，也就是说，Vue3为有key和没有key两种场景专门做了针对性优化。

基于上述两点，使得Vue3 diff性能整体上优化Vue2性能，尤其是在存在大量节点移动的场景下，不过相应的，Vue3diff算法的理解成本也增加了。