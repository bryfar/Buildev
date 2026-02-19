# Buildev - AI-Powered Website Builder

![Buildev Banner](/Portada.png)

> **Experience the future of web development.** Buildev combines a VS Code-like environment with a powerful drag-and-drop canvas, powered by AI to help you build stunning websites in minutes.

## 🚀 Features

- **Hybrid Editor**: seamless switching between **Design Mode** (Visual Canvas) and **Code Mode** (Monaco Editor).
- **AI Assistant**: specialized AI chat for generating components, refactoring code, and answering technical questions.
- **Responsive Design**: Mobile-first approach with real-time preview for Desktop, Tablet, and Mobile.
- **Design System**: Built-in token management for colors, typography, and spacing.
- **Modern Stack**: Built with Next.js 14, TypeScript, Tailwind CSS, and Zustand.

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Database (Local)**: [Dexie.js](https://dexie.org/) (IndexedDB wrapper)

## 📦 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/buildev.git
    cd buildev
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    pnpm install
    # or
    yarn install
    ```

3.  **Environment Setup:**
    Copy the example environment file:
    ```bash
    cp .env.example .env.local
    ```
    *Note: Currently, the project runs with local storage and doesn't explicitly require backend keys for the core demo.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to [http://localhost:3000](http://localhost:3000) (or the port shown in your terminal).

## 📖 Usage Guide

### Dashboard
- **Create Project**: Start a new project from scratch.
- **Manage**: View recent projects, delete, or search.
- **Import**: (Coming Soon) Import designs from Figma or GitHub.

### Editor
- **Design Mode**:
    - **Canvas**: Drag and drop elements.
    - **Inspector**: Edit properties (Layout, Typography, Effects) in the Right Sidebar.
    - **Layers**: Manage the DOM tree in the Left Sidebar.
- **Code Mode**:
    - Full-featured code editor.
    - Changes in code reflect in the canvas (and vice-versa).
- **Preview**:
    - Test responsiveness on different device frames.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Buildev Team**
