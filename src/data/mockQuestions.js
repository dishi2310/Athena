/**
 * Mock question bank for the Athena examination system.
 * Questions focus on Desktop Application Architecture, Electron, and React.
 */
export const MOCK_QUESTIONS = [
  {
    id: 1,
    category: "Electron Architecture",
    question: "What is the primary role of the Main process in an Electron desktop application?",
    options: [
      "Rendering UI elements and animating CSS transitions",
      "Managing native application lifecycle and creating BrowserWindow instances",
      "Parsing client-side JSX templates dynamically in memory",
      "Handling local browser storage, cookies, and indexedDB directly",
    ],
    correctAnswer: 1,
    explanation:
      "The Main process runs Node.js, manages application lifecycle events (app.whenReady, quit), and creates native window instances via BrowserWindow.",
  },
  {
    id: 2,
    category: "Security & IPC",
    question: "Which mechanism is recommended in modern Electron to securely expose selective Node.js APIs to the renderer process?",
    options: [
      "Enabling nodeIntegration: true and contextIsolation: false",
      "Using the deprecated remote module across renderer processes",
      "contextBridge.exposeInMainWorld() within a preload script",
      "Directly importing electron in renderer React components",
    ],
    correctAnswer: 2,
    explanation:
      "contextBridge.exposeInMainWorld() in a preload script safely creates an isolated API surface without giving renderer code direct Node.js system access.",
  },
  {
    id: 3,
    category: "React Fundamentals",
    question: "In React, which hook is appropriate for subscribing to external events (like window blur or webcam streaming) and cleaning them up?",
    options: [
      "useMemo",
      "useCallback",
      "useReducer",
      "useEffect",
    ],
    correctAnswer: 3,
    explanation:
      "useEffect is intended for side effects. Returning a cleanup function from useEffect guarantees event listeners and streams are disposed when unmounting.",
  },
  {
    id: 4,
    category: "Electron Window Management",
    question: "How can an Electron application be placed into strict Kiosk mode to prevent students from accessing the host operating system?",
    options: [
      "Setting win.kiosk = true on the BrowserWindow instance",
      "Applying document.body.requestFullscreen() in renderer CSS only",
      "Disabling all CSS animations on the root element",
      "Adding a CSS z-index of 999999 to the main card",
    ],
    correctAnswer: 0,
    explanation:
      "win.kiosk = true locks down the window to fullscreen and restricts typical OS task-switching behaviors, ideal for exam environments.",
  },
  {
    id: 5,
    category: "State Management",
    question: "What is the primary benefit of lifting state up to a parent component in a React application?",
    options: [
      "It makes components render without any re-render cycles",
      "It allows multiple sibling components to share and stay synchronized with a single source of truth",
      "It eliminates the need for any CSS styling in child components",
      "It automatically caches state in the browser's localStorage",
    ],
    correctAnswer: 1,
    explanation:
      "Lifting state up shares a single source of truth between components that need to read or mutate the same data (such as ExamScreen and ResultScreen).",
  },
  {
    id: 6,
    category: "Web APIs & Media",
    question: "Which Web API is used to capture video media directly from the user's connected camera device?",
    options: [
      "navigator.mediaDevices.getUserMedia()",
      "window.requestAnimationFrame()",
      "document.getMediaStream()",
      "window.fetchCameraBuffer()",
    ],
    correctAnswer: 0,
    explanation:
      "navigator.mediaDevices.getUserMedia() prompts the user for permission and returns a MediaStream with video and/or audio tracks.",
  },
  {
    id: 7,
    category: "Security & Anti-Cheating",
    question: "During an online proctored exam, what browser event is triggered when a user tabs away or clicks outside the active application window?",
    options: [
      "window.unload",
      "window.blur",
      "document.keypress",
      "window.resize",
    ],
    correctAnswer: 1,
    explanation:
      "The window 'blur' event fires whenever the application loses focus, making it a critical trigger for detecting window switching or split-screen cheating attempts.",
  },
  {
    id: 8,
    category: "Performance & Vite",
    question: "Why is Vite significantly faster than traditional bundlers during local development?",
    options: [
      "It compresses all JavaScript files to binary bytecode during build",
      "It serves source code over native ESM and leverages Esbuild for fast pre-bundling",
      "It bypasses all syntax checking and transpilation completely",
      "It requires applications to run without any dependencies",
    ],
    correctAnswer: 1,
    explanation:
      "Vite leverages native browser ES Modules (ESM) and compiles dependencies using Esbuild (written in Go), delivering instant dev server startup and HMR.",
  },
  {
    id: 9,
    category: "Electron IPC",
    question: "Which IPC pattern should be used when the renderer process requests data and awaits a Promise-based response from the main process?",
    options: [
      "ipcRenderer.send() and ipcMain.on()",
      "ipcRenderer.invoke() and ipcMain.handle()",
      "ipcRenderer.postMessage() with synchronous polling",
      "window.alert() with console.log()",
    ],
    correctAnswer: 1,
    explanation:
      "ipcRenderer.invoke() paired with ipcMain.handle() provides an asynchronous, Promise-based request-response channel between renderer and main.",
  },
  {
    id: 10,
    category: "React Patterns",
    question: "When rendering a dynamic list of items in React (such as option choices or question palette chips), why is a unique 'key' prop required?",
    options: [
      "To style each item with a distinctive background color",
      "To help React identify which items have changed, been added, or removed for optimal DOM reconciliation",
      "To allow the user to click on the item via keyboard shortcuts",
      "To convert the JSX element into a native Web Component",
    ],
    correctAnswer: 1,
    explanation:
      "Keys provide a stable identity to list items across re-renders, enabling React's virtual DOM reconciliation algorithm to perform minimal and accurate DOM mutations.",
  },
];
