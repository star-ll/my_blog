---
{"publish":true,"created":"2025-11-09T15:29:49.000+08:00","modified":"2026-01-24T13:39:01.047+08:00","cssclasses":""}
---

#React
## 设计哲学
React 是由 **Facebook（Meta）** 于 2013 年开源的 **革命性 JavaScript 库**，专注于构建用户界面（UI）。它通过 **组件化架构** 与 **声明式编程模型**，彻底改变了开发者构建 Web 应用的方式，使复杂 UI 的开发变得高效、可维护且性能卓越。
React 的诸多创新思想——如**组件化架构**、**单向数据流**、**Hooks 机制**和**虚拟 DOM 模型**——深刻重塑了前端开发范式。深入理解这些设计，不仅能显著提升 React 开发能力，更能帮助开发者洞察现代前端框架的共通设计语言。
总的来说，React 的本质是 **构建可预测 UI 的声明式组件引擎**。它通过 **约束**（单向数据流/不可变性）带来 **自由**（组合扩展/跨平台），通过 **抽象**（虚拟DOM/Hooks）解决 **本质复杂度**（DOM操作/副作用管理）。
## React 的设计理念

### 声明式编程

在声明式编程中，开发者只需要关注“做什么”，而不是“怎么做”。而在React中，只需要开发者声明JSX来描述你想要呈现的UI（用户界面）是什么样子，而React会自动更新UI，保持它与应用状态一致。你不需要关心如何具体操作DOM，React会帮你处理这些细节。

```jsx
function MyComponent() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      You clicked {count} times
    </button>
  );
}

```

而另一种编程方式：命令式编程，正好与声明式编程相反，它关注”怎么做“而不是”做什么“，例如传统的JS、JQuery等直接操作DOM，来实现想要的UI。

```js
const button = document.querySelector('button');
let count = 0;
button.addEventListener('click', () => {
  count++;
  button.innerText = `You clicked ${count} times`;
});

```

两种编程方式各有优劣，主要优缺点如下：

|       | 优点                                                                             | 缺点                                            |
| ----- | ------------------------------------------------------------------------------ | --------------------------------------------- |
| 命令式编程 | 开发者负责具体的UI实现，拥有完全的控制权。在某些特定场景（如高性能需求）下，开发者可以进行个性化优化，往往能比框架的统一处理更符合实际需求         | 随着项目的增长，代码会变得难以维护，因为你必须手动跟踪每个UI元素的变化          |
| 声明式编程 | 开发者不需要关注具体实现的细节，只需要通过特定模板语言（如JSX、Vue Template）来描述UI，框架底层会自动处理好实现和细节，极大地提高了开发效率 | 具体UI实现由框架底层完成，隐藏了实现过程，增加了问题排查难度，需要开发者了解框架底层机制 |
现代前端开发基本都是采用Vue、React这种声明式编程方式，命令式编程（如JQuery）相对较少，这是因为在绝大多数场景下，开发效率更重要，并且声明式编程的缺点可以通过学习框架底层以及使用DevTools来缓解。
### 纯函数与副作用

React 的设计深度借鉴了纯函数的理念。所谓的纯函数，是指具备下面两个特性的函数：
- - 相同的输入，永远返回相同的输出
- 不产生副作用

```js
// 纯函数，相同输入的调用输出必定相同
function add(a,b){
	return a+b 
}
add(1,1) // 2
add(1,1) // 2
add(1,1) // 2

// 不是纯函数，相同输入的调用输出可能不相同
function addRandom(a,b){
	return a + b + Math.random()
}

addRandom(1,1) // 2.1742978408146465
addRandom(1,1) // 2.437442383087129

// 不是纯函数，因为产生了副作用
function addWindow(a,b){
	window.a = a
	return window.a + b
}

```

副作用是一个常见的概念，比如 react 的 useEffect、Vue 底层的 effect，都与副作用有关。副作用是指函数在执行计算返回值的过程中，对外部环境产生了影响。

比如上面 addWindow 函数，它在计算中对全局对象 window.a 进行赋值，从而对外部环境产生影响，因此不属于纯函数。

下面这个 react 组件可以看做是纯函数：

```jsx
// 纯函数组件：props 输入 => JSX 输出
function UserCard({ user, onEdit }) {
    return (
        <div className="user-card">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <button onClick={() => onEdit(user.id)}>
                Edit
            </button>
        </div>
    );
}

// 相同的 props，永远返回相同的 JSX
const user = { id: 1, name: "John", email: "john@example.com" };
const result1 = UserCard({ user, onEdit: console.log });
const result2 = UserCard({ user, onEdit: console.log });
// result1 和 result2 完全相同
```

然而在实际开发中，几乎不可避免地产生副作用，比如通过 HTTP 请求请求服务器，获取远程数据。但是 React 提供了 useEffect 等 Hook 来处理副作用，确保在组件渲染过程中不会对外部环境产生不良影响。

```jsx
// 副作用示例：使用 useEffect 从服务器获取数据
function UserProfile({ userId }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUser(userId).then(setUser);
    }, [userId]);

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
        </div>
    );
}
```

### 不可变数据和单向数据流

React 强调**不可变数据**和**单向数据流**。这意味着：
- 组件的状态（state）和属性（props）都是不可变的，一旦被创建，就不能直接修改。
- 数据只能从父组件流向子组件，不能反向流动。

不可变数据是纯函数的一个重要特性，它确保了相同的输入始终返回相同的输出，避免了由于共享状态而导致的不可预测行为。

在函数式编程中，数据是不可变的，即不允许直接修改，而是通过返回一个新的对象来表示数据的变化。

```js
function setUser(user, newName){
	return {...user, name: newName}
}
```

在 React 内部，setState 的实现也借鉴了不可变数据理念实现。当调用 setState 时，React 会将新的状态替换旧状态的引用，而不是直接修改当前状态。这让 React 的状态变化容易追溯、观察，因为之前的状态都会保存为快照。

此外，React 的单向数据流也非常符合函数式编程的理念,，在函数式编程中，数据的流动通常是单向的。

```js
// 函数式编程：数据输入 → 函数处理 → 数据输出
const processData = (input) => {
    const step1 = transformA(input);
    const step2 = transformB(step1);
    return transformC(step2);
};
```

而在 React 中，状态的流动也是单向的，从父组件流向子组件。这与函数式编程的理念是一致的。这种方式的好处在于避免了由于共享状态而导致的复杂问题，使得组件的状态变化变得简单、可预测，并且方便进行组件的测试和调试。

总之，不可变数据和单向数据流的设计理念确保了 React 组件的状态管理变得简单、可预测，同时也避免了由于共享状态而导致的复杂问题。

### 组合优于继承（Hook）

自 React 16.8 引入 Hook API 以来，React 逐渐确立了以函数式组件为核心的开发模式。与传统的类组件相比，函数式组件更加注重**组合（Composition）而非继承（Inheritance）**的设计理念。

在 React 的类组件体系中，组件主要通过继承 `React.Component` 或 `React.PureComponent` 类来获得生命周期方法、状态管理等能力。这种基于继承的模式虽然符合传统的面向对象编程思想，但在组件复用和逻辑组织方面存在一定的局限性，尤其是在大型项目中，类组件的代码组织形式导致其难以实现关注点分离原则：

```js
// 类组件：基于继承
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = { /*...*/ };
  }
  
  componentDidMount() { /*...*/ }
  
  render() {
    return <div>{/*...*/}</div>;
  }
}
```

而函数式组件配合 Hooks，则彻底转向了组合式的开发范式：

```js
// 函数式组件：基于组合
function MyComponent() {
  // 组合多个 Hooks 来构建组件逻辑
  const [state, setState] = useState();
  const contextValue = useContext(MyContext);
  const ref = useRef();
  
  // 同一职责代码
  const count = ref(1)
  useEffect(() => { /*...*/ }, []);
  
  return <div>{/*...*/}</div>;
}
```

**组合模式的核心优势体现在：**

1. **逻辑复用更加灵活**：通过自定义 Hooks，可以将组件逻辑提取为可复用的函数，避免类组件中高阶组件（HOC）或渲染属性（Render Props）带来的嵌套地狱。
2. **关注点分离更清晰**：不同于类组件中将生命周期相关的代码分散在不同的方法中，Hooks 允许按照功能而非生命周期来组织代码，使相关逻辑更加内聚。
3. **避免继承的固有缺陷**：继承带来的紧耦合、层级过深等问题在组合模式下得到有效解决，组件之间的关系更加扁平化和灵活。

这种设计哲学的转变，不仅影响了 React 自身的 API 设计，也重新定义了现代前端组件的开发范式，推动了整个前端生态向更加函数式、声明式的方向发展。