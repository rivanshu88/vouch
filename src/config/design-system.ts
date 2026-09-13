export const DESIGN_TOKENS = {
  colors: {
    background: "#FAFAFA",
    surface: "#FFFFFF",
    surfaceMuted: "#F4F4F5",
    border: "#E4E4E7",
    borderSubtle: "#F1F1F4",
    textPrimary: "#09090B",
    textSecondary: "#52525B",
    textMuted: "#71717A",
    accent: "#0284C7", // Slate cyan/sky for senior engineering trust
    accentHover: "#0369A1",
    accentSubtle: "#E0F2FE",
    verifiedGreen: "#059669",
    verifiedGreenBg: "#ECFDF5",
    verifiedGreenBorder: "#A7F3D0",
    unverifiedAmber: "#D97706",
    unverifiedAmberBg: "#FFFBEB",
    unverifiedAmberBorder: "#FDE68A",
    dangerRed: "#DC2626",
    dangerRedBg: "#FEF2F2",
  },
  typography: {
    fontFamilySans: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontFamilyMono: "var(--font-geist-mono), monospace",
  },
  borderRadius: {
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    full: "9999px",
  },
  shadows: {
    subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)",
    elevated: "0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)",
  },
};

export const INITIAL_SKILLS = [
  { id: "javascript", name: "JavaScript", category: "languages" as const, description: "Core ES6+, closures, async/await, DOM APIs, and execution model" },
  { id: "react", name: "React", category: "frontend" as const, description: "Hooks, reconciliation, component state, context, performance, and modern SSR" },
  { id: "typescript", name: "TypeScript", category: "languages" as const, description: "Type inference, generics, utility types, narrowing, and discriminated unions" },
  { id: "python", name: "Python", category: "languages" as const, description: "Data structures, generators, OOP, decorators, and asynchronous programming" },
  { id: "sql", name: "SQL", category: "database" as const, description: "Joins, grouping, window functions, indexing, normalization, and query optimization" },
  { id: "nextjs", name: "Next.js", category: "frontend" as const, description: "App Router, Server Components, Route Handlers, caching, and Server Actions" },
  { id: "nodejs", name: "Node.js", category: "backend" as const, description: "Event loop, streams, buffers, Express, and microservices architecture" },
  { id: "solidity", name: "Solidity", category: "languages" as const, description: "Smart contracts, EVM execution, ERC standards, reentrancy guards, and gas optimization" },
  { id: "pytorch", name: "PyTorch", category: "backend" as const, description: "Tensor operations, autograd, model training loops, neural architectures, and inference" },
  { id: "go", name: "Go", category: "languages" as const, description: "Concurrency primitives, channels, goroutines, memory management, and high-throughput networking" },
  { id: "docker", name: "Docker", category: "devops" as const, description: "Container lifecycle, multi-stage builds, rootless execution, and orchestration" },
  { id: "linux", name: "Linux", category: "devops" as const, description: "POSIX system calls, process scheduling, eBPF telemetry, shell automation, and networking" },
  { id: "rust", name: "Rust", category: "languages" as const, description: "Borrow checker, lifetimes, fearless concurrency, zero-cost abstractions, and systems programming" },
];

