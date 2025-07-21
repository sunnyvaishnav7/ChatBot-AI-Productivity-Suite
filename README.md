# ChatBot AI & Productivity Suite

A modern, full-stack web application that combines AI chat, meeting notes, and a Google Meet-inspired video call UI. Built with React, Spring Boot, and a beautiful animated UI.

---

## ✨ Features

- **AI Chat**: Ask questions and get instant, intelligent answers from an AI backend. Fast, responsive chat UI with keyboard shortcuts.
- **Meeting Notes**: Create, edit, search, and organize notes. Features auto spellcheck, auto-correct, image uploads, export, and print. Notes are saved locally for privacy.
- **Video Call (UI Demo)**: Google Meet-inspired interface with participant grid, video/mic toggles, screen sharing, chat, hand raise, meeting lock, and more. (UI demo only, no real calls.)
- **Modern UI & Animations**: Animated backgrounds, 3D globe on the landing page, sparkling headings, and a fully responsive design.
- **Theme Switcher**: Toggle between light and dark mode from the settings menu.
- **Navigation**: Top navigation bar for easy access to all features. Fully responsive for desktop and mobile.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Framer Motion, Lucide Icons, CSS Modules
- **Backend**: Spring Boot, REST API, MySQL (for meeting persistence)
- **Other**: LocalStorage (notes), Custom CSS, Animated SVG/Canvas

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Java 17+
- MySQL (for backend persistence)

### Frontend Setup
```bash
cd frontend/vite-project
npm install
npm run dev
```
Visit [http://localhost:5173](http://localhost:5173) in your browser.

### Backend Setup
```bash
cd gemini-chat
# Configure your MySQL credentials in src/main/resources/application.properties
./mvnw spring-boot:run
```
Backend runs on [http://localhost:8080](http://localhost:8080)

---

## 📚 Usage
- **Chat**: Type your question and press Enter. Use Shift+Enter for a new line.
- **Meeting Notes**: Create, edit, search, upload images, export, and print notes. All notes are private and stored in your browser.
- **Video Call**: Simulate joining/creating meetings, manage participants, chat, and try out all controls. (No real calls, UI demo only.)
- **Theme**: Click the settings icon in the navbar to toggle light/dark mode.

---

## 📱 Responsive Design
- Works beautifully on desktop, tablet, and mobile.
- Navigation and layout adapt to all screen sizes.

---

## 🖌️ Customization
- Easily change accent colors in CSS variables.
- Add more settings or features in the settings dropdown.
- Extend backend for real-time video/audio or persistent chat if desired.

---

## 🤝 Contributing
Pull requests and feedback are welcome! Please open an issue or submit a PR for improvements or bug fixes.

---

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Credits
- Inspired by Google Meet, ChatGPT, and modern productivity tools.
- Built with ❤️ by [Your Name].
