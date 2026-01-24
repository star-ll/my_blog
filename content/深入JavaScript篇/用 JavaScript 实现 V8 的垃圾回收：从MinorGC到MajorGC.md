---
{"publish":true,"created":"2026-01-21T16:38:29.000+08:00","modified":"2026-01-24T20:30:25.617+08:00","cssclasses":""}
---

## 引言

JavaScript 无需手动管理内存，也未提供显式 GC API，内存回收完全由引擎自动处理。但这不意味着可以忽视内存问题——闭包、事件监听、缓存或组件状态等常见场景仍可能导致内存泄漏。作为前端开发者，理解引擎的内存模型与 GC 机制（如引用计数、标记清除、分代回收），有助于预判风险、优化性能，并写出更健壮、可持续运行的应用代码。

## JS 对象在内存中的存储基础

### 原始类型和引用类型

JS 数据类型可以划分为两种：原始类型和引用类型。其中原始类型目前包含 `number`、`string`、`boolean`、`null`、`undefined`、`bigInt` 和 `symbol` 七种，而其他类型都归属于引用类型（Object）。

我们常见的 Date、RegExp、Function 等对象它们都属于引用类型，并且所有引用类型的祖先类都是 Object。

我们常说的“对象”有广义和狭义之分，在狭义上，对象特指`{}`或者 `new Object`声明的对象类型，但是在广义上，对象通常包括 Date、RegExp 等所有直接继承或间接继承 Object 的数据类型。

>  在很多文章中通过 object 和 Object 进行区分狭义对象和广义对象，前者指狭义的对象，后者泛指继承于 Object 构造函数的所有类型，由于广义对象几乎等同于引用值，因此 Object有时也特指引用值，很多国内文章直译成对象，需要注意其在不同语境的指向。

>  在 Object.create 出现之前，所有对象都通过原型链直接或者间接继承 Object 类（严格来说应该是构造函数），但是在 Object.create 出现后，前面这一说法将不再准确，因为Object.create 创建的对象没有原型链，自然也不会继承 Object。

> 除非特别说明，否则本文中的对象都特指广义上的对象，即引用值。

```javascript
let o = {} // 狭义上的对象，引用类型
let d = new Date() // 广义上的对象，引用类型
```

JS 变量声明时，JS 引擎会为其分配内存，其中根据值的不同（原始类型和引用类型），内存存储位置也不同，简单来说：

- **原始类型：直接保存在栈内存中**
- **引用类型：真实数据保存在堆内存中，执行栈中保存指向堆中对象的内存地址（可以理解为指针）**

### JS 内存中的栈和堆

那么，什么是栈空间和堆空间？

要明白这个问题，首先需要知道什么是调用栈（又称执行栈，全称执行上下文栈，Execution Context Stack）和执行上下文（Execution Context），可以参考[[深入JavaScript篇/深入JavaScript I：从规范中看JavaScript运行时机制]]。

执行上下文其实类似于进程，进程可以看做是静态代码的动态时概念，它包含：
- 代码逻辑（程序代码） 
- 运行时数据（变量）
- 系统资源上下文（网络、文件等）

而执行上下文也非常类似，它自身也可以看做是由三部分组成：
- **静态代码（特定三种类型： 函数、eval 和全局）**
- **运行时数据（this、参数等）**
- **资源上下文（由 js 引擎提供）**

执行栈则是专门管理调度执行上下文的结构，它具备栈“先进后出”的特性，JS 引擎同一时刻只会处理一个执行上下文，也就是栈顶，**作为栈顶的执行上下文就是正在执行的执行上下文**。

现在回答前面的问题：**栈空间其实就是执行上下文栈中专门分配的一块连续的、大小固定的、用于管理执行上下文运行时数据的内存区域**，执行栈中所有执行上下文的变量都保存在这块栈内存空间中，以函数执行上下文为例，其栈内存空间通常保存 this、argument 以及函数内声明的变量。

> 额外提一嘴，由于栈内存空间是固定的，因此无线递归调用函数时，就会产生无限函数执行上下文，从而占满整个栈空间，产生栈溢出。

但是需要注意，栈空间只存储原始值和引用值的指针，引用值真正被存储在堆空间中，这样设计出于多方面考虑，比如执行上下文生命周期比较短暂，但是引用值（对象）又通常比较长，如果将对象直接保存在栈内存空间中，当该执行上下文执行完毕被释放后，对象将不可被访问。

```javascript
function f1(){
  // 假设如果对象被保存在栈空间中
  let ctx = {a: 1}
  
  return ctx
}



const ctx = f1()
console.log(ctx) // 将无法访问，因为f1执行上下文被释放
```

另一种方法是分配一个非常大的内存空间用于保存所有的对象，对象创建时将对象保存在这个内存空间中，然后再复制到栈空间中。但是这种方法需要频繁复制，性能极差，且同一个对象被内存隔离，无法共享内部属性。

因此，JS 引擎采用了一个更优的方法，分配一个非常大的内存空间用于保存所有的对象，这个内存空间被称为堆空间，对象创建时将对象保存在这个内存空间中，但是后面不同的是，JS 引擎不会复制对象到栈空间中，而是在栈空间中保存这个对象在堆内存空间中的地址（类似 c 语言中的指针的概念），js 可以通过栈空间的这个指针访问到堆空间中的真实对象。
### 标识符与对象的联系

前面的栈空间和堆空间解决了动态数据分配和存储问题，我们还需要解决静态标识符和真实内存之间的问题，也就是 JS 怎么通过标识符访问到真实的内存地址？

事实上，在 ECMA 规范中是通过一个叫**环境记录**（Environment Record）的概念来保存标识符和内存地址的关系，也就是我们常说的作用域。

我们可以用一个 Map 来简单的模拟这个关系。

```js
let a = {};

// 底层可以看做是
identifierMap = new Map(); // 标识符与变量内存地址映射表
const memory_id = Page.alloc() // 分配内存
identifierMap.set('a', memory_id) // 记录关系
```

### 页


### 用 JS 实现一个页


## V8 垃圾回收

### 代际假说

### 半空间

### 标记清除法


## 最终代码
```js
let pageId = 1;
class Page {
  id = pageId++;
  MAX_PAGE_SIZE = 1024;
  HALF_PAGE_SIZE = Math.floor(this.MAX_PAGE_SIZE / 2);

  space = new Array(this.MAX_PAGE_SIZE);
  allocPtr = 0;

  fromStart = 0;
  fromEnd = this.HALF_PAGE_SIZE - 1;
  toStart = this.HALF_PAGE_SIZE;
  toEnd = this.MAX_PAGE_SIZE - 1;

  identifierMap = new Map(); // 标识符与变量内存地址映射表

  hasFreeSpaceSize(size) {
    return size > 0 && this.fromEnd - this.allocPtr + 1 >= size;
  }

  alloc(identifier, size, data, scoped) {
    if (!this.hasFreeSpaceSize(size)) {
      return null;
    }

    const start = this.allocPtr;

    for (let i = start; i < start + size; i++) {
      this.space[i] = {
        identifier,
        data,
        scoped,
        gcCount: 0,
      };
      this.allocPtr++;
    }

    this.identifierMap.set(identifier, start); // 记录标识符与变量内存地址的映射关系

    return this.space[start];
  }

  dealloc(start, size) {
    if (!this.space[start]) {
      return;
    }

    const { data, identifier } = this.space[start];

    for (let i = start; i < start + size; i++) {
      this.space[i] = undefined;
    }

    this.identifierMap.delete(identifier);
  }
}

class Heap {
  static UpGradeCount = 2; // 升级阈值

  // 新生代和老生代物理隔离
  pages = [new Page(), new Page()]; // 新生代
  oldPages = [new Page(), new Page()]; // 老生代

  rootSet = new Set([globalThis]); // 一组根，包含执行上下文、全局对象、dom根节点等，这个例子为了简化只包含全局对象
  linkMap = new Map(); // 模拟对象引用关系
  remarkSet = new Set(); // 模拟标记可达对象
  objMemoryMap = new Map(); // 记录对象内存地址(page, memoryData, size, identifier)

  createObject(identifier, size, data, scoped) {
    for (const page of this.pages) {
      if (!page.hasFreeSpaceSize(size)) {
        continue;
      }
      const memoryData = page.alloc(identifier, size, data, scoped);
      if (memoryData !== null) {
        this.objMemoryMap.set(data, { page, memoryData, size, identifier });
        return memoryData;
      }
    }
    return null;
  }

  // 分配对象内存
  alloc(identifier, size, obj, scoped) {
    const memoryData = this.createObject(identifier, size, obj, scoped); // 模拟创建对象并分配内存

    if (memoryData === null) {
      return null;
    }

    // 记录对象引用关系
    const set = this.linkMap.get(scoped) || new Set();
    set.add(obj);
    this.linkMap.set(scoped, set);

    console.log(
      `创建对象${identifier}，内存地址${memoryData.start}，大小${size}`
    );

    return obj;
  }

  // 新生代晋升，只改变物理内存地址，不改变对象引用关系
  upgradeToOldPage({ data: obj, scoped, identifier }) {
    const { page, memoryData, size } = this.objMemoryMap.get(obj);

    // 从新生代移除
    page.dealloc(memoryData.start, size);
    this.objMemoryMap.delete(obj);

    // 加入老生代
    for (const page of this.oldPages) {
      if (!page.hasFreeSpaceSize(size)) {
        continue;
      }
      const memoryData = page.alloc(identifier, size, obj, scoped);
      if (memoryData !== null) {
        console.log(`对象${identifier}晋升到老生代`);

        this.objMemoryMap.set(obj, { page, memoryData, size, identifier });
        return memoryData;
      }
    }

    return null;
  }

  // 回收对象
  dealloc({ data: obj, scoped, identifier }) {
    // 删除引用关系
    const set = this.linkMap.get(scoped);
    if (!set) {
      return;
    }
    set.delete(obj);

    // 回收内存
    const { page, memoryData, size } = this.objMemoryMap.get(obj);
    page.dealloc(memoryData.start, size);
    this.objMemoryMap.delete(obj);

    console.log(
      `回收对象${identifier}，内存地址${memoryData.start}，大小${size}`
    );
  }

  markLiveObjects() {
    const mark = (obj) => {
      this.remarkSet.add(obj);

      // 递归引用的对象
      for (const ref of this.linkMap.get(obj) || []) {
        if (!this.remarkSet.has(ref)) {
          mark(ref);
        }
      }
    };

    // 从一组根开始
    for (const obj of this.rootSet) {
      mark(obj);
    }

    console.log(
      `标记可达对象，可达对象有：` +
        Array.from(this.remarkSet)
          .map((obj) => {
            if (obj === globalThis) {
              return "global";
            }

            return JSON.stringify(obj);
          })
          .join(", ")
    );
  }

  clearMark() {
    this.remarkSet.clear();
  }
}

function minorGC(heap) {
  console.log("Minor GC");

  // 1. 标记可达对象
  heap.markLiveObjects();

  // 2. 遍历新生代，回收不可达对象
  let pageLen = heap.pages.length;
  for (let pageIndex = 0; pageIndex < pageLen; pageIndex++) {
    const page = heap.pages[pageIndex];

    let fromStart = page.fromStart;
    let fromEnd = page.fromEnd;
    let toStart = page.toStart;
    let toEnd = page.toEnd;

    // 2.1 遍历fromSpace，将活对象移动到toSpace，多次存活的对象晋升为老生代
    for (let i = fromStart, j = toStart; i <= fromEnd; i++) {
      if (page.space[i] === undefined) {
        // 内存碎片
        continue;
      }

      if (!heap.remarkSet.has(page.space[i].data)) {
        // 死对象（不可达）
        continue;
      }

      // 检查对象是否需要晋升到老生代
      if (page.space[i].gcCount >= Heap.UpGradeCount) {
        heap.upgradeToOldPage(page.space[i]);
        continue;
      }

      page.space[i].gcCount++;

      // 移动对象到toSpace
      page.space[j] = page.space[i];

      // 更新指针
      page.space[j].start = j;
      page.allocPtr = ++j;
    }

    // 2.2 清空fromSpace
    for (let i = fromStart; i <= fromEnd; i++) {
      page.space[i] = undefined;
    }

    // 2.3更新标识符映射表
    for (let i = toStart; i <= toEnd; i++) {
      const obj = page.space[i]?.data;

      if (!obj) {
        continue;
      }

      page.identifierMap.set(page.space[i].identifier, i);
    }

    // 3. 交换fromSpace和toSpace
    const oldFromStart = page.fromStart;
    const oldFromEnd = page.fromEnd;
    page.fromStart = page.toStart;
    page.fromEnd = page.toEnd;
    page.toStart = oldFromStart;
    page.toEnd = oldFromEnd;
  }

  // 4. 清空标记
  heap.clearMark();
}

function majorGC(heap) {
  console.log("Major GC");

  // 1. 标记所有可达对象
  heap.markLiveObjects();

  // 2. 遍历所有对象，删除未被标记的对象
  // 这里忽略了oldPage和page的差异，但是实际上，老生代的page整页有效，而新生代只使用整页的一半
  for (const page of [...heap.pages, ...heap.oldPages]) {
    for (let i = page.fromStart; i <= page.fromEnd; i++) {
      // 内存碎片或已被回收的对象
      if (page.space[i] === undefined) {
        continue;
      }

      if (!heap.remarkSet.has(page.space[i].data)) {
        // 死对象（不可达）
        heap.dealloc(page.space[i]);
      }
    }
  }

  // 3. 内存碎片整理（可选,这里省略）
  // ...

  // 4. 清空标记
  heap.clearMark();
}

const demo = {
  initVal() {
    const heap = new Heap();

    var a = { _id: 1 }; // 这里用var是为了对象自动绑定为window属性
    let b = { _id: 2 };
    a.child = b;

    // 创建对象并分配内存
    heap.alloc("a", 1, a, globalThis);
    heap.alloc("b", 1, b, a);

    return {
      vars: [a, b],
      heap,
    };
  },

  testUpgrade() {
    const { vars, heap } = this.initVal();
    const [a, b] = vars;
    // 多次回收新生代，以触发晋升
    minorGC(heap);
    minorGC(heap);
    minorGC(heap);
    // 对象a晋升到老生代
    // 对象b晋升到老生代
  },

  testMinorGC() {
    const { vars, heap } = this.initVal();
    const [a, b] = vars;

    minorGC(heap);
    // 标记可达对象，可达对象有：global, {"_id":1,"child":{"_id":2}}, {"_id":2}
    {
      const { page, memoryData } = heap.objMemoryMap.get(b);
      console.log(
        `内存地址：${memoryData.start}, 内容：${JSON.stringify(
          page.space[memoryData.start].data
        )}`
      );
      // 内存地址：513, 内容：{"_id":2}
      // 说明地址已经从from空间移动到了to空间
    }

    delete a.child;
    // 模拟引擎内部解除引用
    heap.linkMap.get(a).delete(b);

    minorGC(heap);
    // 标记可达对象，可达对象有：global, {"_id":1}
    {
      const { page, start } = heap.objMemoryMap.get(b);
      console.log(page.space[start]);
      // undefined
      // 说明对象b已经被回收
    }
  },
  testMajorGC() {
    const { vars, heap } = this.initVal();
    const [a, b] = vars;

    majorGC(heap);
    // 标记可达对象，可达对象有：global, {"_id":1}
    {
      const { page, start } = heap.objMemoryMap.get(b);
      console.log(page.space[start]);
      // undefined
      // 说明对象b已经被回收
    }
  },
};

// demo.testUpgrade();
demo.testMinorGC();

```