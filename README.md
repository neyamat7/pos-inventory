# 🛍️ Inventory Management

An advanced, modern, and highly scalable **Inventory Management** application. Built using the latest web technologies, it provides a seamless and responsive user experience to manage products, customers, orders, and sales analytics.

---

## 🔑 Admin Credentials

To access the administrative dashboard, please use the following credentials:

- **Email:** `admin@gmail.com`
- **Password:** `12345678`

---

## 🚀 Features

- **Auth & Authorization:** Secure Authentication using NextAuth.js.
- **Inventory Management:** Browse, Add, Update, and Delete products seamlessly.
- **Customer Management:** Comprehensive customer registry with robust search (including multi-language support).
- **Dashboard & Analytics:** Real-time metrics powered by ApexCharts & Recharts.
- **Responsive Layout:** Mobile-friendly layouts, built with Tailwind CSS & MUI (Material UI).

---

## 🛠️ Technology Stack

Designed for high performance and maintainability, our stack includes:

### **Frameworks & Core**

- **[Next.js 15](https://nextjs.org/)** - React Framework (App Router & Turbopack enabled)
- **[React 18](https://react.dev/)** - UI Library

### **Styling & UI Components**

- **[Material UI (MUI) v6](https://mui.com/)** - Core Component Library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS Framework
- **[Emotion](https://emotion.sh/)** - CSS-in-JS library

### **State Management & Data Fetching**

- **[Redux Toolkit](https://redux-toolkit.js.org/)** - Global state management
- **[React Hook Form](https://react-hook-form.com/)** - Form handling
- **[NextAuth.js](https://next-auth.js.org/)** - Secure authentication

### **Charts & Extensions**

- **[ApexCharts](https://apexcharts.com/)** & **[Recharts](https://recharts.org/)** - For Data Visualization 📊
- **[FullCalendar](https://fullcalendar.io/)** - For comprehensive scheduling components 📅
- **[Tiptap](https://tiptap.dev/)** - Rich-Text Editor 📝
- **[Mapbox GL](https://www.mapbox.com/)** - For advanced mapping

---

## ⚙️ Project Setup

Follow these instructions to set up the project on your local machine.

### Prerequisites

Ensure you have **Node.js** (v20+) and your preferred package manager installed, such as `npm`, `yarn`, or `pnpm`.

### Installation

1. **Install Dependencies**
   It's recommended to use `pnpm` as defined in the project:

   ```bash
   pnpm install
   ```

2. **Environment Variables**
   Create a `.env.local` file in the root directory based on `.env.example` to provide necessary environment variables for NextAuth, APIs, and Database connection strings.

3. **Run the Development Server**
   Start the application locally using Turbopack for ultrafast compilation:

   ```bash
   pnpm dev
   ```

4. **Access the App**
   Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard.

---

## 📦 Building for Production

Compile the project and optimize it for deployment:

```bash
pnpm build
pnpm start
```

---

## 🎨 Linting & Formatting

To ensure code quality and consistency across the project:

- **Linting:**
  ```bash
  pnpm lint
  ```
- **Automatically Fix Lint Issues:**
  ```bash
  pnpm lint:fix
  ```
- **Format Code (Prettier):**
  ```bash
  pnpm format
  ```

---

## 🤝 Contribution Guidelines

We welcome contributions! Please open an issue to discuss your intended changes, or simply submit a Pull Request following our code format and linting structures.

---

**Built with ❤️ and Next.js.**
