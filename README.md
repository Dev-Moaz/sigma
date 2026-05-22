# README FILE That Describes Every Component In The Project

# 💻 Project Context for AI Assistants: Sigma Hardware & Laptop Store

## 🎯 Project Overview

This project is a high-end, cinematic E-commerce platform specialized in PC Hardware, Gaming Laptops, and Accessories. The UI/UX is heavily inspired by premium tech brands, featuring GPU-accelerated 3D animations, glassmorphism, magnetic hover effects, and a highly reactive filtering system.

## 🛠 Tech Stack & Global Paradigms

- **Framework:** Next.js (App Router).
- **Styling:** Tailwind CSS + Custom inline CSS for dynamic gradients/shadows.
- **Animations:** `framer-motion` (used extensively for Parallax, Cinematic Focus Pulls, Magnetic Buttons, and Layout Animations).
- **State Management:** Custom Zustand store (`@/store/useAppStore`) managing `useTheme` (Dark/Light with specific hex colors/glows), `useCart`, and `useWishlist`.
- **Icons:** FontAwesome (`@fortawesome/react-fontawesome`).

---

## 📂 Core Components Breakdown

### 1. `components/layout/Header.tsx` (Main Navigation)

- **Role:** The primary global navigation bar with a dynamic glassmorphism effect that reacts to scroll (`useScroll`).
- **Key Features:**
  - **Cinematic Search Overlay:** A full-screen, blurred search interface with trending and category chips.
  - **Magnetic Buttons:** Custom `ActionBtn` components that track cursor movement (`useMotionValue`, `useSpring`) for a futuristic feel.
  - **State Integration:** Displays real-time `cartCount` and `wishCount` from the global store, complete with pulse animations on update.
  - **Responsive Layout:** Desktop dropdowns with staggered reveal animations and a mobile accordion-style menu.

### 2. `components/heroSection.tsx` (Landing Page Hero)

- **Role:** A visually stunning opening scene for the homepage.
- **Key Features:**
  - **3D Parallax & Physics:** Uses cursor tracking to manipulate a 3D laptop image and a heavy dynamic spotlight (`spotLightX`, `spotLightY`).
  - **Cinematic Reveal:** Starts with a blurred "Focus Pull" overlay that resolves into clarity.
  - **Dynamic Elements:** Includes a Typewriter effect for headers, Animated HUD-style `SpecCards`, and a continuous hardware brand marquee.
  - **Data Display:** Uses `CountUp` animations for statistics (in-view triggered) and a dynamic grid/particle background.

### 3. `components/layout/FilterNavbar.tsx` (Product Filtering Engine)

- **Role:** A highly reactive, sticky filtering and sorting bar used in product listing pages.
- **Key Features:**
  - **Dynamic Data Extraction:** Automatically extracts available `Categories` and `Brands` directly from the passed `products` prop using `useMemo` (No hardcoded filter options).
  - **Core Filtering Logic:** Combines Search Query + Category + Brand + Sort Option (Price/Rating/Featured) into a single reactive `useEffect` that outputs the filtered list to `onFilterChange`.
  - **UI/UX:** Sticky glass effect on scroll, layout-animated active chips (Framer Motion `layoutId`), and an expanding search bar that shrinks when unfocused.
  - **Horizontal Scroll:** Uses custom CSS (`hide-scrollbar`) for sleek, mobile-friendly horizontal category chips.

### 4. `components/layout/Footer.tsx` (Site Footer)

- **Role:** The global footer containing site links, legal info, and brand promises.
- **Key Features:**
  - **Interactive Background:** Features an animated grid pattern (`FooterGridBg`) and a floating particle system that moves upwards endlessly.
  - **Magnetic Socials:** Social media icons use physics-based cursor tracking (`useMotionValue`) identical to the header buttons.
  - **Theme Integration:** Dynamically adapts its radial gradients, borders, and text colors based on the global `useTheme` hook.

### 5. `components/ProductDetailPage.tsx` (The Crown Jewel - PDP)

- **Role:** The ultimate Single Product Page (PDP). It dynamically renders a highly immersive, cinematic showcase based on the product's specific hardware metadata.
- **Key Features:**
  - **CSS-Only 3D Visuals:** Generates mind-blowing 3D hardware components (CPU, GPU, RAM, NVMe) using raw CSS `transformStyle: "preserve-3d"`, customized SVG patterns (PCBs, Heatsinks), and `framer-motion` cursor tracking. _No WebGL/Three.js used!_
  - **Dynamic Content Engine:** Uses helper functions (`getCpuContent`, `getRamContent`, etc.) to read the product's `technical_metadata` and automatically generate matching headlines, 3D accents (e.g., Red for AMD, Blue for Intel), and statistics.
  - **Cinematic Chapters:** Sections are divided into "Chapters" (Processing, Visuals, Memory, etc.) revealing content via staggered `SplitReveal` and `TypewriterStat` animations on scroll.
  - **Sticky Action Bar:** A bottom glassmorphic bar that tracks scroll velocity and appears to keep the "Add to Cart" button and price always accessible.

### 6. `components/BrandPage.tsx` & `components/LaptopCategoryPage.tsx` (Dynamic Wrappers)

- **Role:** Prop-driven template pages for rendering specific subsets of laptops (e.g., By Brand like "Asus", or By Category like "Gaming").
- **Key Features:**
  - **Data Pre-Filtering:** Uses `useMemo` to filter the main `laptops.json` based on the passed `brandName` or `categoryName` prop before passing the data to the `FilterNavbar`.
  - **Pagination Engine:** Built-in client-side pagination (`ITEMS_PER_PAGE = 12`) to handle large datasets efficiently.
  - **Empty States:** Graceful fallback UI with `framer-motion` animations if no products match the current filter combination.
  - **Shared DNA:** Both utilize the same background particle systems and cinematic reveals, maintaining the site's premium feel.

### 7. `components/HardwareCategoryPage.tsx` (Hardware-Specific Listing)

- **Role:** The listing page specifically for PC Hardware components (CPUs, GPUs, RAM, etc.).
- **Key Features:**
  - **Schema Context:** Specifically typed for `HardwareProduct` and maps data from `hardware.json` (distinct from laptops).
  - **Specialized Cards:** Renders `HardwareProductCard` instead of the standard laptop card.
  - **Store Integration:** Safely integrates `useCart` (with discount price fallback) and `useWishlist` (checking `wishIds.includes(product.id)`) directly inside the grid map.

### 8. `components/wishlist.tsx` (User Collection)

- **Role:** Displays the user's saved/favorited products.
- **Key Features:**
  - **Zustand Subscription:** Reactively listens to `wishIds` from `useWishlist` to filter and display products from the JSON data.
  - **Bulk Actions:** Includes an "Add All to Cart" feature that maps over the wishlist and dispatches items to the cart store simultaneously.
  - **AnimatePresence:** Uses Framer Motion's `AnimatePresence` to smoothly animate items out when removed, and smoothly transition to a custom "Pulsing Heart" empty state when the list is cleared.

### 9. `components/ui/HardwareProductCard.tsx` (Advanced Hardware Card)

- **Role:** A highly interactive, 3D-tilt product card designed specifically for the `HardwareProduct` schema.
- **Key Features:**
  - **Smart Data Extraction:** Uses the `extractHardwareSpecs` helper to intelligently parse the hardware's flat `specs` object (key-value pairs) into a uniform array of objects with assigned colors, making them compatible with the visual HUD.
  - **CSS-Powered Performance:** Injects raw CSS keyframes (`CardKeyframes`) for continuous animations like `pc-grain-drift`, `pc-breath-cyan`, and `pc-scan-line` to ensure buttery-smooth performance without overloading the JavaScript thread.
  - **Cinematic Micro-Interactions:** On hover, the card utilizes Framer Motion to tilt based on cursor position (`useMotionValue` + `useSpring`), reveals flying HUD Badges (`HudBadge`) on the sides, and circular progress rings (`SpecRing`) at the bottom.
  - **State Integration:** Seamlessly handles "Add to Cart" ripple effects, success states, and Wishlist toggling directly from the card.

### 10. `components/ui/Logo.tsx` (Animated Brand Identity)

- **Role:** The global, animated Logo component used in both the Header and the Footer.
- **Key Features:**
  - **Variants:** Accepts a `variant` prop (`responsive` or `fixed`) to automatically adjust sizing and spacing depending on its context (e.g., shrinking on mobile headers but staying fixed in the footer).
  - **Framer Motion Accents:** Features a subtle rotation on hover, an infinite shimmer sweep effect across the bolt icon, and a breathing ambient glow ring behind it.
  - **Theme Aware:** Automatically syncs the "VOLT" text color with the global `useTheme` text color, while keeping "TECH" as a permanent gradient.

### 11. `components/ui/AccentLine.tsx` (Premium UI Polish)

- **Role:** A micro-component used to separate layout sections (like the top of the Header and Footer) with a futuristic neon touch.
- **Key Features:**
  - **Continuous Gradient Shift:** Uses Framer Motion to animate a cyan-to-blue linear gradient back and forth infinitely.
  - **Customizable:** Accepts `duration` and `opacity` props, allowing the Footer to have a slower, dimmer line while the Header has a fast, bright one.

### 12. Auth Pages (`app/(auth)/login/page.tsx` & `create_account/page.tsx`)

- **Role:** Cinematic, terminal-inspired authentication flows.
- **Key Features:**
  - **Custom Physics Cursor:** Bypasses the default OS cursor with a dual-spring custom cursor (tight dot + loose trailing ring) using `useMotionValue` for zero-reflow rendering.
  - **Interactive HUD Elements:** Inputs feature a "Spinning Gradient Border" using conic gradients on focus. Password fields include a reactive, spring-animated strength meter.
  - **State Machine Buttons:** The Submit button morphs seamlessly through `idle` ➔ `loading` (spinner) ➔ `success` (green checkmark + radiating pulse) using Framer Motion's `AnimatePresence` and layout animations.

### 13. `app/(main)/cart/page.tsx` (Secure Checkout Cart)

- **Role:** The user's shopping cart, connecting directly to the global `useCart` Zustand store.
- **Key Features:**
  - **Layout:** A split-screen design. The left column dynamically lists items with quantity controls (increment/decrement/remove), while the right column features a sticky, 3D-tilt "Order Summary" HUD.
  - **Data Handling:** Intelligently handles quantity updates (omitting the `qty` property when sending updates to the store to avoid type clashes) and auto-removes items if the quantity drops to zero.
  - **Empty State:** Features a floating holographic box animation to encourage users to head to the shop.

### 14. Listing Pages (`ShopPage`, `DealsPage`, `Wishlist`)

- **Role:** The primary aggregation grids for browsing products, all featuring client-side pagination (`ITEMS_PER_PAGE = 12`) and integrated with a Schema-Agnostic `FilterNavbar`.
- **Key Features:**
  - **`app/(main)/shop/page.tsx`:** The universal catalog rendering all available Laptops.
  - **`app/(main)/wishlist/page.tsx`:** Subscribes to `useWishlist` to display saved items. Features a powerful "Add All to Cart" batch action and a pulsing neon heart empty state.
  - **`app/(main)/deals/page.tsx` (Advanced Aggregation):**
    - Showcases discounted items across the entire platform by filtering for the `isDeal: true` flag.
    - **Union Type Architecture:** Successfully aggregates **BOTH** `Product` (Laptops) and `HardwareProduct` schemas into a single, unified state array `Array<Product | HardwareProduct>`.
    - **Smart Type Guarding:** Utilizes a custom TypeScript Type Guard (`isLaptop`) to dynamically and safely render either a `ProductCard` or a `HardwareProductCard` within the same responsive grid.
    - **Unified Filtering Engine:** Passes the combined data to `FilterNavbar`, which uses helper functions to normalize disparate schema properties (e.g., dynamically resolving `discountPrice` vs `price` for accurate sorting) without breaking strict Type-Safety.

### 15. `app/product/[id]/page.tsx` (Next.js App Router Wrapper)

- **Role:** The Server Component wrapper for the client-side `ProductDetailPage`.
- **Key Features:**
  - **Next.js 15+ Compatibility:** Treats `params` as a `Promise` (`await params`) to safely extract the `id` in modern Next.js versions.
  - **Data Fetching:** Decodes the URI component and cross-references it with static JSON data. If no product matches the ID, it gracefully triggers the Next.js `notFound()` boundary.

### 16. `store/useAppStore.ts` (Global State Management)

- **Role:** The single source of truth for global client-side state, utilizing `Zustand` with `localStorage` persistence.
- **Key Features:**
  - **Modular Slices:** Combines `ThemeSlice`, `CartSlice`, and `WishlistSlice` into one cohesive `AppState`.
  - **Smart Rehydration & Derived State:** Solves rehydration sync issues by storing _only_ the string value of `theme` ("dark" | "light") in local storage. Derived values (like `isDark` boolean and `t` ThemeColors) are calculated on the fly inside the `useTheme` selector. This guarantees the UI never falls out of sync with the stored theme.
  - **Performance Optimized:** Exports specialized, typed selectors (`useTheme`, `useCart`, `useWishlist`) wrapped in `useShallow` to prevent unnecessary component re-renders.
  - **DOM Syncing:** Automatically applies the current theme as a `data-theme` attribute to the HTML root upon rehydration (`onRehydrateStorage`).

### 17. `lib/hardware-schema.ts` & `lib/laptop-schema.ts` (Unified Data Architecture)

- **Role:** The foundational TypeScript types and interfaces that dictate how product data flows through the application.
- **Key Features (Unified Schema):**
  - **Standardized Media:** Both Laptops and Hardware now use a consistent `images: string[]` array for product media, ensuring architectural parity and support for future gallery systems.
- **Key Features (Hardware Schema):**
  - **Discriminated Unions:** Uses a `BaseHardwareProduct` interface that is extended by specific components (`CPUProduct`, `GPUProduct`, etc.), combined into a single `HardwareProduct` union type. This allows strict, category-specific TypeScript validations (e.g., ensuring a CPU has a `socket` while a Case has `motherboardSupport`).
- **Key Features (Laptop Schema):**
  - **Dual Spec System:** Splits product specifications into two distinct objects:
    - `specs`: An array of `ProductSpec` objects mapped specifically for rendering beautiful visual HUD Badges on product cards (includes colors and labels).
    - `technical_metadata`: A flat object with raw numerical/string values (e.g., `ram_gb: 32`) strictly used for the under-the-hood Filtering Engine to ensure fast and accurate complex queries.

### 18. `lib/theme.ts` (Design System Tokens)

- **Role:** The central registry for the cinematic color system, defining the exact hex and rgba values for Dark and Light modes.
- **Key Features:**
  - **Granular Control:** Instead of generic colors, it defines hyper-specific UI tokens (`glowCyan`, `radialMask`, `shimmer`, `accentBadgeBorder`) ensuring that glassmorphism and 3D lighting effects remain consistent across components.
  - **Strict Typing:** Driven by the `ThemeColors` type, ensuring that any component consuming the `useTheme` hook has precise autocomplete and cannot request a non-existent color token.

### 19. Category Route Wrappers (`app/(main)/(laptop_category)/*/page.tsx`)

- **Role:** Structural App Router pages (e.g., `/gaming`, `/business`, `/2-in-1`, `/ultrabooks`) that act as specific entry points.
- **Key Features:**
  - **DRY Architecture:** Instead of duplicating layout and fetching logic, these pages serve as thin Server Component wrappers. They simply import the heavy-lifting `LaptopCategoryPage` component and pass the specific category props, keeping the routing tree clean and highly maintainable.

### 20. ### `components/HardwareProductDetailPage.tsx` (Hardware PDP Showcase)

- **Role:** The dedicated, cinematic Single Product Page (PDP) explicitly built for PC Components (CPUs, GPUs, RAM, Motherboards, etc.). It adapts its entire layout and visual engine based on the specific hardware category.
- **Key Features:**
  - **Dynamic 3D Render Engine:** Features highly complex, CSS-only 3D models (`CpuVisual`, `GpuVisual`, `RamVisual`, `StorageVisual`). These models use `transformStyle: "preserve-3d"`, custom SVG patterns (like PCB traces and heatsinks), and react instantly to cursor movement via `framer-motion`'s `useMotionValue` and `useSpring`.
  - **Context-Aware Chapters:** The `chapters` useMemo hook intelligently reads the product's category (e.g., "CPU" vs "Storage") and automatically generates cinematic scroll-reveal sections highlighting relevant metrics (e.g., "Cores & Clock Speed" for CPUs, or "Read Speeds" for NVMe).
  - **High-Performance Parallax Hero:** The hero section employs a massive background particle system, floating 3D product images (`pdp-float` keyframes), and flying HUD `SpecCards` that move inversely to the cursor for a deep 3D illusion.
  - **Immersive Micro-Interactions:** Includes a custom `MagneticButton` that breaks out of the standard DOM flow to follow the cursor with built-in ripple effects, and `SplitReveal` typography animations that trigger sequentially on scroll.
  - **Sticky Action Hub:** A reactive bottom navigation bar connected to `useScroll` velocity. It hides during fast scrolling but anchors perfectly to the bottom of the screen, keeping the "Add to Cart" function and pricing perpetually accessible without breaking immersion.

### 21. `app/(main)/hardware/[id]/page.tsx` (Dedicated Hardware Route)

- **Role:** The dedicated Next.js Server Component wrapper specifically architecture for PC Hardware routing. It strictly separates hardware URLs from laptop URLs (e.g., `/hardware/123`), enhancing SEO and routing clarity.
- **Key Features:**
  - **Modern Next.js 15+ Paradigms:** Safely extracts the dynamic product `id` by unwrapping the `params` Promise (`await params`).
  - **Type-Safe Data Fetching:** Decodes the URI component and cross-references it strictly against the `HardwareProduct[]` schema within `hardware.json`.
  - **Separation of Concerns:** Acts purely as a server-side data provider. It handles the logic and validation, then seamlessly passes the payload to the heavy, client-side `HardwareProductDetailPage` for rendering.
  - **Graceful Fallbacks:** Instantly triggers the Next.js `notFound()` boundary if a user navigates to an invalid or discontinued hardware component URL, preventing client-side crashes.

---

### 22. `components/ui/shared/` (Unified Animation & UI System)

- **Role:** A collection of highly optimized, reusable components that power the site's cinematic atmosphere.
- **Key Components:**
  - **`Particles.tsx`**: A GPU-accelerated particle engine that handles infinite upward drift with theme-aware coloring. Used in Hero, Footer, and all Product Cards.
  - **`CinematicReveal.tsx`**: The standard scroll-reveal wrapper that ensures consistent blur and translation entrance effects across the entire platform.
  - **`ProductUI.tsx`**: Centralizes the logic for `StarRating`, `StockBar`, and `BadgePill` to ensure 100% visual parity between different product listing types.
  - **`MagneticButton.tsx`**: A shared physics-based button with built-in ripple effects and magnetic hover tracking.

### 23. `app/(main)/profile/*` (User Dashboard)

- **Role:** A comprehensive, cinematic dashboard for authenticated users to manage their account, track orders, and adjust settings.
- **Key Features:**
  - **Modular Architecture:** Utilizes a custom `ProfileLayout` with a persistent, responsive sidebar (or bottom bar on mobile) that shares the site's signature particle and parallax background system.
  - **Overview Page (`/profile`):** Features interactive HUD-style stat cards (Total Orders, Volt Points) and a summary of recent activity with dynamic color-coding for order statuses.
  - **Orders Tracking (`/profile/orders`):** A visually rich list of past purchases, rendering product thumbnails, complex status badges, and action buttons ("Buy Again", "View Invoice") using Framer Motion reveals.
  - **Settings (`/profile/settings`):** A futuristic forms interface for managing personal information, security (passwords), and notification preferences, utilizing glowing input fields that react on focus.

### 24. `app/(main)/compare/page.tsx` (Product Comparison Matrix)

- **Role:** A high-end analytical interface for side-by-side product evaluation.
- **Key Features:**
  - **Cross-Category Comparison:** One of the few engines that can normalize and compare both Laptops and Hardware components (CPUs, GPUs, etc.) in a single unified grid.
  - **Dynamic Spec Mapping:** Uses a custom resolver to map disparate data fields (e.g., mapping a Laptop's `technical_metadata.cpu` and a Hardware's `specs.socket`) into a consistent "Processor" or "Graphics" row.
  - **Interactive HUD UI:** Features a glassmorphic matrix with floating action buttons, real-time price formatting, and animated star ratings.
  - **Empty State Engine:** Includes a cinematic "Empty Matrix" view with particle systems to guide users back to the shop.
  - **Direct Commerce:** Integrated "Buy Now" buttons that sync with the `useCart` store, allowing immediate conversion from the comparison view.

### 25. `lib/supabase-service.ts` (Data Resiliency Layer)

- **Role:** The primary data orchestration layer that implements a "Smart Fallback" system.
- **Key Features:**
  - **Environment-Aware Fetching:** Automatically detects if Supabase environment variables are present.
  - **Dynamic Fallback:** If the live database is unavailable, it transparently switches to local JSON (`laptops.json`, `hardware.json`) ensuring the site remains functional.
  - **Unified Interface:** Provides a consistent API for components to fetch data regardless of the source (Supabase vs JSON).

### 26. `app/actions/` (Server Action Hub)

- **Role:** Centralized directory for secure, server-side operations, bypassing the need for traditional REST/API routes.
- **Key Actions:**
  - **`auth.ts`:** Manages user authentication (Login, Signup, Signout) and profile creation, integrating directly with Supabase Auth and the `profiles` table.
  - **`products.ts`:** Handles live product updates and metadata synchronization.
  - **`orders.ts`:** Processes checkout transactions, creates order records, maps order items, and updates inventory stock levels atomically.

### 27. `app/(main)/checkout/page.tsx` (Cinematic Checkout - COMPLETED)

- **Role:** A premium, secure interface for completing Cash on Delivery (COD) orders with real-time feedback.
- **Key Features:**
  - **Dynamic Order Verification:** Verifies cart pricing and discounts client-side and validates details during the transaction.
  - **Automatic Profile Sync:** Pre-fills the shipping address, phone, and full name directly from the user's Supabase profile while allowing custom one-time overrides.
  - **Volt Points Integration:** Auto-calculates earned Volt Points upon purchase and securely syncs them with the customer's profile.
  - **Transactional Safety:** Dispatches order details to the `orders` and `order_items` tables in Supabase, updating stock counts atomically.

### 28. `app/(main)/admin/page.tsx` (The Admin Control Center - COMPLETED)

- **Role:** A premium, secure command center dashboard for site administrators to manage live inventory and process customer orders.
- **Key Features:**
  - **Role-Based Protection:** Strictly guarded at the layout/server-action level, requiring users to have `role = 'admin'` in their `profiles` table to access or modify data.
  - **Live Inventory Manager (CRUD):** Fully functional dashboard to insert, update, or soft-delete product catalog items and hardware components in real-time.
  - **Order Pipeline Manager:** A real-time interface for administrators to view customer orders, inspect item details, and transition order statuses (Pending ➔ Processing ➔ Shipped ➔ Completed) with direct DB updates.
  - **Analytics Panel:** Displays dynamic counters for Total Revenue, Total Orders, Average Order Value, and active accounts.

### 29. `components/AuthSync.tsx` (Token & Session Sync Engine - COMPLETED)

- **Role:** A client-side listener that bridges the gap between client-side Supabase Auth and Server Actions.
- **Key Features:**
  - **Active Session Synchronization:** Automatically listens to Supabase auth state transitions (`onAuthStateChange`) on the client.
  - **Cookie-Based Auth Bridge:** Encrypts and writes active access tokens (`sb-access-token`) and refresh tokens (`sb-refresh-token`) to secure HTTP-only-friendly cookies.
  - **Zero Session Mismatch:** Guarantees Server Actions and Server-Rendered pages are always aware of the active client session instantly.

### 30. `scripts/profiles-ultimate.sql` (Bulletproof Database Triggers)

- **Role:** Implements the official, robust database trigger pattern recommended by Supabase for user initialization.
- **Key Features:**
  - **`handle_new_user()` Trigger:** A highly privileged PostgreSQL function (`SECURITY DEFINER`) that automatically listens for inserts into `auth.users` and creates a matching row in `public.profiles` on the spot.
  - **Zero-Fail Registration:** Eliminates race conditions or permission issues during the signup phase, allowing instantaneous profile creation with default parameters (100 Volt Points, `role: 'user'`).
  - **Cascading Safety:** Configured with `ON DELETE CASCADE` to clean up profile data if a user is deleted from the Auth center.

---

## 🧠 AI Prompting Guidelines for this Project

_Dear AI, when writing or refactoring code for this project, please adhere to the following rules:_

1. **No External 3D Libraries:** If asked to create a 3D effect, use Framer Motion `useMotionValue` mapped to `rotateX`/`rotateY` with CSS `perspective`. Do not suggest `react-three-fiber` or `three.js`.

2. **Strict Store Usage:** Always import global state (Cart, Wishlist, Theme) from `@/store/useAppStore`. Do not create local React Contexts for these.

3. **Glassmorphism Standard:** Backgrounds should utilize `rgba` or hex with opacity + `backdrop-filter: blur() saturate()`. Borders should be subtle `rgba(255,255,255,0.1)`.

4. **Data Sourcing:** Pages act as server/client boundaries. They import JSON data directly or receive it as props, then pass it down to `FilterNavbar` and `ProductCard` arrays.

5. **State Selectors:** Never access the Zustand store directly via `useAppStore(state => state)`. Always use the predefined selectors (`useTheme()`, `useCart()`, `useWishlist()`) which implement `useShallow` to prevent render cycles.

6. **Theme Colors:** Do not hardcode hex values in new UI components. Always destructure `t` from `useTheme()` (e.g., `const { t } = useTheme()`) and apply colors via inline styles or styled components (e.g., `color: t.accentText`).

7. **Derived State Rule:** Never save derived/computed values (like full object configurations based on a string ID) into Zustand's `localStorage` persistence. Calculate them in the selector to avoid rehydration mismatches.
8. **Reuse Shared UI:** Before creating local animation logic or HUD elements, check components/ui/ for shared components like Particles, CinematicReveal, or ProductUI elements. Always favor consolidation over duplication.
