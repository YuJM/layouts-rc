# Layouts-rc Monorepo

[![Homepage](https://img.shields.io/badge/Homepage-layouts--rc--web.vercel.app-blue)](https://layouts-rc-web.vercel.app)
[![Repository](https://img.shields.io/badge/GitHub-YuJM%2Flayouts--rc-black?logo=github)](https://github.com/YuJM/layouts-rc)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> Production-ready React and Vue component libraries for modern web applications

## 📦 Packages

This monorepo contains three complementary libraries designed to simplify UI development:

### 🎨 [layouts-rc](packages/layouts/README.md)
**Flutter-inspired layout components for React**

- React component library inspired by Flutter layout widgets
- Type-safe layouts with flexible styling (Tailwind CSS, CSS-in-JS, CSS Modules)
- Components: `Scaffold`, `Row`, `Column`, `Center`, `SlotBaseComp`, and more
- Perfect for building responsive, structured layouts

```bash
npm install layouts-rc
```

### 🎭 [overlay-manager-rc](packages/overlay-rc/README.md)
**Lightweight overlay manager for React**

- Zero-dependency, 2KB gzipped overlay management
- Hook-based API with Promise support for async flows
- SSR-safe with Next.js, Remix compatibility
- Works seamlessly with Radix UI, shadcn/ui
- Perfect for dialogs, alerts, sheets, and modals

```bash
npm install overlay-manager-rc
```

### 🎪 [overlay-manager-vue](packages/overlay-vue/README.md)
**Reactive overlay manager for Vue 3**

- Fully reactive with Vue 3 composition API
- 3.17KB gzipped for modern apps
- Multiple overlay stacking support
- 97%+ test coverage
- Works with Radix Vue, reka-ui, Headless UI

```bash
npm install overlay-manager-vue
```

## 🚀 Quick Start

### React Projects

```tsx
// Install both packages
npm install layouts-rc overlay-manager-rc

// Use layouts
import { Scaffold, Row, Column } from 'layouts-rc';

// Use overlay manager
import { useOverlayManager, OverlayContainer } from 'overlay-manager-rc';
```

### Vue Projects

```bash
npm install overlay-manager-vue
```

```vue
<script setup>
import { useOverlay } from 'overlay-manager-vue';
</script>
```

## 🌐 Live Demo

Visit our interactive demo to see all packages in action:

**[https://layouts-rc-web.vercel.app](https://layouts-rc-web.vercel.app)**

## 📚 Documentation

Each package has comprehensive documentation:

- **layouts-rc**: [README](packages/layouts/README.md)
- **overlay-manager-rc**: [README](packages/overlay-rc/README.md) | [Migration Guide](packages/overlay-rc/docs/MIGRATION.md)
- **overlay-manager-vue**: [README](packages/overlay-vue/README.md) | [API Reference](packages/overlay-vue/docs/API.md) | [Migration Guide](packages/overlay-vue/docs/MIGRATION.md)

## 🛠️ Development

This is a pnpm workspace monorepo.

### Prerequisites

- Node.js 18+
- pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/YuJM/layouts-rc.git
cd layouts-rc

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Package Scripts

```bash
# Build specific package
pnpm --filter layouts-rc build
pnpm --filter overlay-manager-rc build
pnpm --filter overlay-manager-vue build

# Test specific package
pnpm --filter overlay-manager-rc test
pnpm --filter overlay-manager-vue test

# Type check
pnpm --filter overlay-manager-rc type-check
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT © [YuJM](https://github.com/YuJM)

## 🔗 Links

- [Homepage](https://layouts-rc-web.vercel.app)
- [npm - layouts-rc](https://www.npmjs.com/package/layouts-rc)
- [npm - overlay-manager-rc](https://www.npmjs.com/package/overlay-manager-rc)
- [npm - overlay-manager-vue](https://www.npmjs.com/package/overlay-manager-vue)
