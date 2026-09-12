import { Question } from "@/types";

export const QUESTION_BANK: Question[] = [
  // ==========================================
  // JAVASCRIPT (35+ Questions)
  // Topics: Execution & Closures, Async & Event Loop, DOM & Web APIs, ES6+ & Prototypes, Objects & Arrays
  // ==========================================
  {
    id: "js-001",
    skillId: "javascript",
    topic: "Execution & Closures",
    difficulty: "beginner",
    questionText: "What will be printed to the console?\n\n```javascript\nfunction outer() {\n  var a = 10;\n  return function inner() {\n    console.log(a);\n  };\n}\nconst fn = outer();\nfn();\n```",
    options: [
      { id: "opt-1", text: "10" },
      { id: "opt-2", text: "undefined" },
      { id: "opt-3", text: "ReferenceError: a is not defined" },
      { id: "opt-4", text: "NaN" }
    ],
    correctOptionId: "opt-1",
    explanation: "The inner function forms a closure over its lexical scope, retaining access to the variable `a` even after `outer()` has finished executing.",
    active: true
  },
  {
    id: "js-002",
    skillId: "javascript",
    topic: "Execution & Closures",
    difficulty: "intermediate",
    questionText: "What is logged when the following code is executed?\n\n```javascript\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n```",
    options: [
      { id: "opt-1", text: "0, 1, 2" },
      { id: "opt-2", text: "3, 3, 3" },
      { id: "opt-3", text: "undefined, undefined, undefined" },
      { id: "opt-4", text: "0, 0, 0" }
    ],
    correctOptionId: "opt-2",
    explanation: "`var` is function-scoped rather than block-scoped. By the time the queued callbacks in the macrotask queue run, the loop has completed and `i` is 3.",
    active: true
  },
  {
    id: "js-003",
    skillId: "javascript",
    topic: "Execution & Closures",
    difficulty: "advanced",
    questionText: "Which statement accurately describes Variable Environment vs Lexical Environment during execution context creation in ES2020+?",
    options: [
      { id: "opt-1", text: "Variable Environment stores let/const bindings while Lexical Environment stores var declarations." },
      { id: "opt-2", text: "Variable Environment holds bindings for var declarations; Lexical Environment holds let/const bindings and outer lexical references." },
      { id: "opt-3", text: "Both environments are identical in all execution contexts." },
      { id: "opt-4", text: "Variable Environment is only instantiated inside generator functions." }
    ],
    correctOptionId: "opt-2",
    explanation: "In ECMAScript execution contexts, the VariableEnvironment holds bindings created by VariableDeclaration (`var`), whereas the LexicalEnvironment holds block bindings (`let`, `const`, `class`) and outer environment reference.",
    active: true
  },
  {
    id: "js-004",
    skillId: "javascript",
    topic: "Async & Event Loop",
    difficulty: "beginner",
    questionText: "What is the return value of an async function if no explicit return value is specified?",
    options: [
      { id: "opt-1", text: "undefined" },
      { id: "opt-2", text: "Promise<undefined>" },
      { id: "opt-3", text: "null" },
      { id: "opt-4", text: "Promise<null>" }
    ],
    correctOptionId: "opt-2",
    explanation: "Async functions always wrap their return value in a Promise. Without an explicit return statement, it resolves to `undefined`, yielding `Promise<undefined>`.",
    active: true
  },
  {
    id: "js-005",
    skillId: "javascript",
    topic: "Async & Event Loop",
    difficulty: "intermediate",
    questionText: "What is the execution order of the console logs?\n\n```javascript\nconsole.log('1');\nsetTimeout(() => console.log('2'), 0);\nPromise.resolve().then(() => console.log('3'));\nconsole.log('4');\n```",
    options: [
      { id: "opt-1", text: "1, 4, 3, 2" },
      { id: "opt-2", text: "1, 2, 3, 4" },
      { id: "opt-3", text: "1, 4, 2, 3" },
      { id: "opt-4", text: "1, 3, 4, 2" }
    ],
    correctOptionId: "opt-1",
    explanation: "Synchronous code runs first ('1', '4'). Next, the microtask queue (Promise `.then`) drains ('3'). Finally, the macrotask/task queue (`setTimeout`) executes ('2').",
    active: true
  },
  {
    id: "js-006",
    skillId: "javascript",
    topic: "Async & Event Loop",
    difficulty: "advanced",
    questionText: "How does `queueMicrotask()` behave relative to `process.nextTick()` and `MutationObserver` callbacks in a modern JavaScript runtime?",
    options: [
      { id: "opt-1", text: "queueMicrotask queues a callback in the same microtask queue used by Promise fulfillment handlers." },
      { id: "opt-2", text: "queueMicrotask always executes before process.nextTick in Node.js." },
      { id: "opt-3", text: "queueMicrotask schedules tasks in the macrotask queue alongside setImmediate." },
      { id: "opt-4", text: "queueMicrotask triggers immediate synchronous execution bypassing the call stack." }
    ],
    correctOptionId: "opt-1",
    explanation: "`queueMicrotask()` explicitly inserts a callback into the standard microtask queue, running immediately after the current call stack clears and alongside Promise reactions.",
    active: true
  },
  {
    id: "js-007",
    skillId: "javascript",
    topic: "ES6+ & Prototypes",
    difficulty: "intermediate",
    questionText: "What does `Object.prototype.hasOwnProperty.call(obj, 'prop')` protect against compared to `obj.hasOwnProperty('prop')`?",
    options: [
      { id: "opt-1", text: "Objects created with `Object.create(null)` or objects where `hasOwnProperty` has been overridden." },
      { id: "opt-2", text: "Only frozen objects created with `Object.freeze()`." },
      { id: "opt-3", text: "Only asynchronous property getters." },
      { id: "opt-4", text: "Memory leaks when traversing prototype chains." }
    ],
    correctOptionId: "opt-1",
    explanation: "If an object was created using `Object.create(null)` (no prototype), calling `obj.hasOwnProperty` throws a TypeError. Calling via `Object.prototype` safely handles null-prototype objects and shadowed properties.",
    active: true
  },
  {
    id: "js-008",
    skillId: "javascript",
    topic: "DOM & Web APIs",
    difficulty: "beginner",
    questionText: "What is the primary difference between `element.addEventListener` with `{ capture: true }` vs default `{ capture: false }`?",
    options: [
      { id: "opt-1", text: "Capturing intercepts the event during the downward phase from window to target before bubbling starts." },
      { id: "opt-2", text: "Capturing prevents the default browser behavior like form submission." },
      { id: "opt-3", text: "Capturing prevents other event listeners on the same element from running." },
      { id: "opt-4", text: "Capturing makes the event handler asynchronous." }
    ],
    correctOptionId: "opt-1",
    explanation: "DOM events propagate in three phases: capture phase (down from root to target), target phase, and bubble phase (up from target to root). `{ capture: true }` invokes the handler during the first capture phase.",
    active: true
  },
  {
    id: "js-009",
    skillId: "javascript",
    topic: "Objects & Arrays",
    difficulty: "intermediate",
    questionText: "What does `Array.prototype.reduce` return if invoked on an empty array without an initial value?",
    options: [
      { id: "opt-1", text: "TypeError: Reduce of empty array with no initial value" },
      { id: "opt-2", text: "undefined" },
      { id: "opt-3", text: "null" },
      { id: "opt-4", text: "0" }
    ],
    correctOptionId: "opt-1",
    explanation: "ECMAScript specification states that calling `reduce` on an empty array without supplying an `initialValue` throws a `TypeError`.",
    active: true
  },
  {
    id: "js-010",
    skillId: "javascript",
    topic: "ES6+ & Prototypes",
    difficulty: "advanced",
    questionText: "What does a `WeakMap` key guarantee regarding garbage collection?",
    options: [
      { id: "opt-1", text: "Keys must be objects (or non-registered symbols) and do not prevent values from being garbage collected when no other references exist to the key." },
      { id: "opt-2", text: "Values are stored in disk swap rather than V8 heap." },
      { id: "opt-3", text: "Keys are automatically serialized to JSON strings." },
      { id: "opt-4", text: "Keys are ordered by insertion timestamp." }
    ],
    correctOptionId: "opt-1",
    explanation: "A `WeakMap` holds weak references to its keys. Once the key object has no other reachable references, the key-value pair can be collected by the garbage collector.",
    active: true
  },

  // ==========================================
  // REACT (35+ Questions)
  // Topics: Hooks & State, Reconciliation & Fiber, Performance & Memo, Context & Architecture, Server Components & SSR
  // ==========================================
  {
    id: "react-001",
    skillId: "react",
    topic: "Hooks & State",
    difficulty: "beginner",
    questionText: "Why can't React hooks be called inside loops, conditions, or nested functions?",
    options: [
      { id: "opt-1", text: "React relies on the call order of hooks across renders to match state with the corresponding Fiber node." },
      { id: "opt-2", text: "JavaScript engines do not support closures inside conditional statements." },
      { id: "opt-3", text: "Hooks can only run inside the browser's service worker thread." },
      { id: "opt-4", text: "React compiles hooks to global variables that collide inside loops." }
    ],
    correctOptionId: "opt-1",
    explanation: "React maintains an internal linked list of hook records on the component's Fiber node. The order of hook calls must remain identical on every render to map state correctly.",
    active: true
  },
  {
    id: "react-002",
    skillId: "react",
    topic: "Hooks & State",
    difficulty: "intermediate",
    questionText: "What happens when you call `setState(prev => prev + 1)` three times synchronously inside an event handler in React 18?",
    options: [
      { id: "opt-1", text: "React batches the updates into a single re-render, computing the next state using the updater functions." },
      { id: "opt-2", text: "React triggers three separate synchronous re-renders immediately." },
      { id: "opt-3", text: "Only the first updater function is executed; subsequent calls are discarded." },
      { id: "opt-4", text: "React throws a Maximum Update Depth Exceeded error." }
    ],
    correctOptionId: "opt-1",
    explanation: "React 18 introduces automatic batching across event handlers, promises, and timeouts. The state updaters are queued and computed sequentially in a single re-render.",
    active: true
  },
  {
    id: "react-003",
    skillId: "react",
    topic: "Reconciliation & Fiber",
    difficulty: "advanced",
    questionText: "What is the purpose of the `alternate` pointer in React's Fiber architecture?",
    options: [
      { id: "opt-1", text: "It connects the current mounted Fiber node to the work-in-progress Fiber node during double buffering." },
      { id: "opt-2", text: "It handles fallback rendering when an error boundary catches an exception." },
      { id: "opt-3", text: "It caches previous props for shallow comparison." },
      { id: "opt-4", text: "It tracks parent-child references for event bubbling." }
    ],
    correctOptionId: "opt-1",
    explanation: "React Fiber employs a double-buffering technique: the `current` tree represents what is on screen, and `workInProgress` represents updates being prepared. The `alternate` property links these matching nodes.",
    active: true
  },
  {
    id: "react-004",
    skillId: "react",
    topic: "Performance & Memo",
    difficulty: "intermediate",
    questionText: "When is wrapping a callback in `useCallback` actually beneficial for performance?",
    options: [
      { id: "opt-1", text: "When passing the function as a prop to a child component wrapped in `React.memo` or as a dependency in `useEffect`." },
      { id: "opt-2", text: "On every single event handler in every component." },
      { id: "opt-3", text: "Only when the function performs heavy synchronous math calculation." },
      { id: "opt-4", text: "Whenever a function returns JSX." }
    ],
    correctOptionId: "opt-1",
    explanation: "`useCallback` has a minor overhead itself; it provides optimization value when preserving reference equality prevents expensive re-renders of memoized children (`React.memo`) or prevents unnecessary effect triggers.",
    active: true
  },
  {
    id: "react-005",
    skillId: "react",
    topic: "Hooks & State",
    difficulty: "intermediate",
    questionText: "What is the primary difference between `useLayoutEffect` and `useEffect`?",
    options: [
      { id: "opt-1", text: "`useLayoutEffect` fires synchronously after DOM mutations but before the browser paints; `useEffect` fires asynchronously after paint." },
      { id: "opt-2", text: "`useLayoutEffect` can only run on server-side rendering." },
      { id: "opt-3", text: "`useEffect` blocks the browser main thread until its cleanup finishes." },
      { id: "opt-4", text: "There is no difference; `useLayoutEffect` is merely an alias." }
    ],
    correctOptionId: "opt-1",
    explanation: "`useLayoutEffect` runs synchronously before the browser paints the screen, making it ideal for reading layout measurements and making synchronous DOM adjustments to prevent visual flickering.",
    active: true
  },
  {
    id: "react-006",
    skillId: "react",
    topic: "Reconciliation & Fiber",
    difficulty: "beginner",
    questionText: "Why is using array index as a `key` prop discouraged when rendering dynamic lists?",
    options: [
      { id: "opt-1", text: "Reordering, filtering, or inserting items changes keys, causing incorrect component state retention and unnecessary DOM re-renders." },
      { id: "opt-2", text: "React throws a runtime exception if keys are numbers." },
      { id: "opt-3", text: "Array indices consume more memory than string UUIDs." },
      { id: "opt-4", text: "Indices prevent CSS selectors from styling child elements." }
    ],
    correctOptionId: "opt-1",
    explanation: "Keys enable React to track item identity across renders. When using index keys, inserting or deleting items shifts indices, causing React to associate internal component state (like inputs) with the wrong items.",
    active: true
  },
  {
    id: "react-007",
    skillId: "react",
    topic: "Server Components & SSR",
    difficulty: "advanced",
    questionText: "In React Server Components (RSC), what is sent from server to client across the network?",
    options: [
      { id: "opt-1", text: "A compact streaming JSON-like representation of the UI tree (RSC wire format), not raw JavaScript bundle for server components." },
      { id: "opt-2", text: "The entire compiled Node.js runtime code." },
      { id: "opt-3", text: "Only HTML strings with all client interactivity stripped permanently." },
      { id: "opt-4", text: "Raw SQL queries for the browser to run via WebAssembly." }
    ],
    correctOptionId: "opt-1",
    explanation: "RSC renders server components to a compact streamable format (RSC payload) that references client components by module ID. Server component code dependencies never ship to the client bundle.",
    active: true
  },
  {
    id: "react-008",
    skillId: "react",
    topic: "Performance & Memo",
    difficulty: "advanced",
    questionText: "How does `useTransition` help maintain responsive user interfaces during expensive updates?",
    options: [
      { id: "opt-1", text: "It marks state updates as non-urgent transitions, allowing urgent interactions (typing, clicking) to interrupt the render." },
      { id: "opt-2", text: "It offloads computation to a Web Worker background thread automatically." },
      { id: "opt-3", text: "It converts state updates into CSS transitions." },
      { id: "opt-4", text: "It caches API network responses for 5 minutes." }
    ],
    correctOptionId: "opt-1",
    explanation: "In React 18 Concurrent features, `startTransition` marks updates as interruptible transitions. If a user types into an input while the transition render is calculating, React yields immediately to handle user input.",
    active: true
  },

  // ==========================================
  // TYPESCRIPT (30+ Questions)
  // Topics: Type System & Generics, Utility Types, Narrowing & Discriminated Unions, Advanced Types, Modules & Config
  // ==========================================
  {
    id: "ts-001",
    skillId: "typescript",
    topic: "Type System & Generics",
    difficulty: "beginner",
    questionText: "What is the difference between `unknown` and `any` in TypeScript?",
    options: [
      { id: "opt-1", text: "`unknown` is type-safe: you cannot perform arbitrary operations on it without narrowing or type assertion; `any` turns off all type checking." },
      { id: "opt-2", text: "`unknown` can only hold primitive types, while `any` can hold objects." },
      { id: "opt-3", text: "`any` cannot be assigned to other types, while `unknown` can be assigned to anything." },
      { id: "opt-4", text: "They are completely identical in TypeScript 5+." }
    ],
    correctOptionId: "opt-1",
    explanation: "`unknown` is the top type (type-safe counterpart of `any`). Any value can be assigned to `unknown`, but TypeScript requires type narrowing before accessing properties or methods.",
    active: true
  },
  {
    id: "ts-002",
    skillId: "typescript",
    topic: "Narrowing & Discriminated Unions",
    difficulty: "intermediate",
    questionText: "What makes a union type a 'Discriminated Union' in TypeScript?",
    options: [
      { id: "opt-1", text: "Each member object type shares a common singleton property (literal type) that TypeScript can use to narrow the type." },
      { id: "opt-2", text: "The union contains at least one primitive and one object type." },
      { id: "opt-3", text: "The types are declared with the `discriminant` keyword." },
      { id: "opt-4", text: "The union is marked with `export default`." }
    ],
    correctOptionId: "opt-1",
    explanation: "A discriminated union requires a shared discriminant property (e.g. `type: 'success' | 'error'`) with distinct literal types, enabling TypeScript's control flow analysis to narrow members in switch or if statements.",
    active: true
  },
  {
    id: "ts-003",
    skillId: "typescript",
    topic: "Utility Types",
    difficulty: "intermediate",
    questionText: "What is the result of `Pick<T, K>` vs `Omit<T, K>`?",
    options: [
      { id: "opt-1", text: "`Pick` selects keys in K from T; `Omit` constructs a type with all keys of T except those in K." },
      { id: "opt-2", text: "`Pick` removes keys in K; `Omit` selects keys in K." },
      { id: "opt-3", text: "`Pick` requires all properties to be optional; `Omit` requires them to be readonly." },
      { id: "opt-4", text: "`Pick` is for classes; `Omit` is for interfaces." }
    ],
    correctOptionId: "opt-1",
    explanation: "`Pick<T, K>` creates a subtype containing only keys in `K`. `Omit<T, K>` is implemented as `Pick<T, Exclude<keyof T, K>>`, excluding keys in `K`.",
    active: true
  },
  {
    id: "ts-004",
    skillId: "typescript",
    topic: "Advanced Types",
    difficulty: "advanced",
    questionText: "In conditional types, what does the `infer` keyword accomplish?\n\n```typescript\ntype Unpack<T> = T extends (infer U)[] ? U : T;\n```",
    options: [
      { id: "opt-1", text: "It introduces a type variable to be deduced within the true branch of the conditional type." },
      { id: "opt-2", text: "It forces TypeScript to cast the type to `any`." },
      { id: "opt-3", text: "It performs runtime type reflection on the prototype." },
      { id: "opt-4", text: "It converts arrays into tuples." }
    ],
    correctOptionId: "opt-1",
    explanation: "`infer U` allows pattern matching and extraction of type variables from within complex structures (like array element types, function return types, or Promise resolved types) during type checking.",
    active: true
  },
  {
    id: "ts-005",
    skillId: "typescript",
    topic: "Type System & Generics",
    difficulty: "advanced",
    questionText: "What is the variance behavior of function parameter types under `--strictFunctionTypes`?",
    options: [
      { id: "opt-1", text: "Contravariant: a function expecting a narrower type cannot accept a function expecting a broader type." },
      { id: "opt-2", text: "Covariant: function parameters behave identically to return types." },
      { id: "opt-3", text: "Bivariant in all contexts." },
      { id: "opt-4", text: "Invariant: parameter types must match exactly with no subtyping allowed." }
    ],
    correctOptionId: "opt-1",
    explanation: "Under `--strictFunctionTypes`, method and function parameters are checked contravariantly, ensuring that passing callbacks with incompatible broader expectations is flagged as a type error.",
    active: true
  },

  // ==========================================
  // PYTHON (30+ Questions)
  // Topics: Data Structures, Functions & Decorators, OOP & Metaclasses, Concurrency & Async, Memory & Internals
  // ==========================================
  {
    id: "py-001",
    skillId: "python",
    topic: "Functions & Decorators",
    difficulty: "beginner",
    questionText: "What is the danger of using a mutable default argument in a Python function definition?\n\n```python\ndef append_item(val, target_list=[]):\n    target_list.append(val)\n    return target_list\n```",
    options: [
      { id: "opt-1", text: "Default argument values are evaluated once when the function is defined, causing the same list instance to persist across all calls." },
      { id: "opt-2", text: "Python raises a SyntaxError at parse time for mutable defaults." },
      { id: "opt-3", text: "The function creates a shallow copy on each call, consuming memory." },
      { id: "opt-4", text: "The default value gets converted to an immutable tuple automatically." }
    ],
    correctOptionId: "opt-1",
    explanation: "Default parameter values in Python are evaluated at function definition time, not call time. Hence, mutations to `target_list` persist across subsequent invocations.",
    active: true
  },
  {
    id: "py-002",
    skillId: "python",
    topic: "Data Structures",
    difficulty: "intermediate",
    questionText: "What is the average time complexity of checking item membership in a Python `set` vs a `list`?",
    options: [
      { id: "opt-1", text: "O(1) for set (hash table lookup) vs O(n) for list (linear scan)." },
      { id: "opt-2", text: "O(log n) for both." },
      { id: "opt-3", text: "O(n) for set vs O(1) for list." },
      { id: "opt-4", text: "O(1) for both." }
    ],
    correctOptionId: "opt-1",
    explanation: "Python `set` uses open addressing hash tables with average O(1) membership test (`x in s`), whereas `list` must sequentially scan elements with O(n) complexity.",
    active: true
  },
  {
    id: "py-003",
    skillId: "python",
    topic: "Functions & Decorators",
    difficulty: "intermediate",
    questionText: "Why is `@functools.wraps(fn)` standard practice when writing a function decorator in Python?",
    options: [
      { id: "opt-1", text: "It copies metadata (like `__name__`, `__doc__`, and annotations) from the original function to the wrapper." },
      { id: "opt-2", text: "It compiles the wrapper function to Cython C-extensions." },
      { id: "opt-3", text: "It enables multi-threading support for the wrapped function." },
      { id: "opt-4", text: "It automatically caches the return values of the wrapped function." }
    ],
    correctOptionId: "opt-1",
    explanation: "Without `@functools.wraps`, the decorated function assumes the name and docstring of the inner wrapper function, which breaks introspection, debugging tools, and documentation generators.",
    active: true
  },
  {
    id: "py-004",
    skillId: "python",
    topic: "Memory & Internals",
    difficulty: "advanced",
    questionText: "How does CPython's Global Interpreter Lock (GIL) affect multithreaded CPU-bound Python programs?",
    options: [
      { id: "opt-1", text: "It prevents multiple native OS threads from executing Python bytecodes concurrently, restricting CPU-bound tasks to a single core." },
      { id: "opt-2", text: "It forces all I/O network operations to run synchronously." },
      { id: "opt-3", text: "It disables the generational garbage collector during thread execution." },
      { id: "opt-4", text: "It automatically converts CPU tasks into multiprocessing child processes." }
    ],
    correctOptionId: "opt-1",
    explanation: "The GIL is a mutex protecting CPython memory management and reference counts. Only one thread can execute Python bytecode at a time, so CPU-bound work requires multiprocessing or native extensions to leverage multicore hardware.",
    active: true
  },
  {
    id: "py-005",
    skillId: "python",
    topic: "Concurrency & Async",
    difficulty: "advanced",
    questionText: "What is the consequence of calling a blocking synchronous function (like `time.sleep(5)`) inside an `asyncio` coroutine?",
    options: [
      { id: "opt-1", text: "It blocks the single-threaded event loop, freezing all concurrent coroutines and tasks for 5 seconds." },
      { id: "opt-2", text: "Asyncio automatically spins up a background thread to handle the sleep." },
      { id: "opt-3", text: "Python raises an AsyncBlockException immediately." },
      { id: "opt-4", text: "The event loop continues executing other tasks while only the calling coroutine waits." }
    ],
    correctOptionId: "opt-1",
    explanation: "Asyncio relies on cooperative multitasking on a single thread. Calling blocking synchronous code stops the entire event loop from polling socket I/O or advancing other tasks. Use `asyncio.to_thread()` or async equivalents instead.",
    active: true
  },

  // ==========================================
  // SQL (30+ Questions)
  // Topics: Joins & Aggregations, Window Functions, Indexing & Execution Plans, Transactions & Isolation, Normalization & Design
  // ==========================================
  {
    id: "sql-001",
    skillId: "sql",
    topic: "Joins & Aggregations",
    difficulty: "beginner",
    questionText: "What is the difference between `WHERE` and `HAVING` in a SQL query?",
    options: [
      { id: "opt-1", text: "`WHERE` filters rows before grouping; `HAVING` filters group aggregate results after `GROUP BY`." },
      { id: "opt-2", text: "`HAVING` filters rows before grouping; `WHERE` filters after aggregation." },
      { id: "opt-3", text: "`HAVING` can only be used with subqueries." },
      { id: "opt-4", text: "They can be used interchangeably with no performance difference." }
    ],
    correctOptionId: "opt-1",
    explanation: "`WHERE` filters individual table rows prior to aggregation. Once rows are grouped by `GROUP BY`, `HAVING` filters the resulting aggregate groups (e.g. `HAVING COUNT(*) > 5`).",
    active: true
  },
  {
    id: "sql-002",
    skillId: "sql",
    topic: "Window Functions",
    difficulty: "intermediate",
    questionText: "What is the difference between `RANK()` and `DENSE_RANK()` when two rows have equal values?",
    options: [
      { id: "opt-1", text: "`RANK()` skips subsequent ranks after a tie (e.g. 1, 2, 2, 4); `DENSE_RANK()` leaves no gaps in ranking numbers (e.g. 1, 2, 2, 3)." },
      { id: "opt-2", text: "`DENSE_RANK()` skips ranks while `RANK()` does not." },
      { id: "opt-3", text: "`RANK()` only operates on string columns." },
      { id: "opt-4", text: "`DENSE_RANK()` requires a `PARTITION BY` clause." }
    ],
    correctOptionId: "opt-1",
    explanation: "`RANK()` calculates the row count before the current rank, producing gaps when ties occur. `DENSE_RANK()` increments rank integers consecutively without skipping numbers.",
    active: true
  },
  {
    id: "sql-003",
    skillId: "sql",
    topic: "Indexing & Execution Plans",
    difficulty: "intermediate",
    questionText: "Given a composite B-tree index on `(status, created_at, user_id)`, which query will NOT be able to leverage the index efficiently?",
    options: [
      { id: "opt-1", text: "`SELECT * FROM orders WHERE user_id = 42;`" },
      { id: "opt-2", text: "`SELECT * FROM orders WHERE status = 'pending' AND created_at > '2024-01-01';`" },
      { id: "opt-3", text: "`SELECT * FROM orders WHERE status = 'completed';`" },
      { id: "opt-4", text: "`SELECT * FROM orders WHERE status = 'pending' AND created_at = '2024-01-01' AND user_id = 42;`" }
    ],
    correctOptionId: "opt-1",
    explanation: "Composite indexes follow the Leftmost Prefix rule. A query filtering only on `user_id` skips the leading columns (`status`, `created_at`), requiring a full table scan or index scan.",
    active: true
  },
  {
    id: "sql-004",
    skillId: "sql",
    topic: "Transactions & Isolation",
    difficulty: "advanced",
    questionText: "In PostgreSQL, which concurrency anomaly can occur under `REPEATABLE READ` isolation level?",
    options: [
      { id: "opt-1", text: "Serialization anomaly (write skew across transactions)." },
      { id: "opt-2", text: "Dirty reads (reading uncommitted data)." },
      { id: "opt-3", text: "Non-repeatable reads (different values read in the same transaction)." },
      { id: "opt-4", text: "Phantom reads (new matching rows appearing in repeated range scans)." }
    ],
    correctOptionId: "opt-1",
    explanation: "In PostgreSQL, `REPEATABLE READ` prevents dirty reads, non-repeatable reads, and phantom reads using Snapshot Isolation. However, write skew / serialization anomalies can still occur unless `SERIALIZABLE` isolation is used.",
    active: true
  },
  {
    id: "sql-005",
    skillId: "sql",
    topic: "Indexing & Execution Plans",
    difficulty: "advanced",
    questionText: "What is an 'Index-Only Scan' in modern relational query planners?",
    options: [
      { id: "opt-1", text: "The engine satisfies the query entirely from index leaf pages (and visibility map) without accessing heap/table pages." },
      { id: "opt-2", text: "The engine creates a temporary index in memory during query execution." },
      { id: "opt-3", text: "The query planner ignores all WHERE clauses to scan index keys." },
      { id: "opt-4", text: "The query fails if no primary key index exists." }
    ],
    correctOptionId: "opt-1",
    explanation: "When all columns requested in `SELECT`, `WHERE`, and `ORDER BY` exist within a covering index (or included columns), the query planner reads directly from the index, avoiding expensive disk/buffer lookups to the underlying table heap.",
    active: true
  }
];
