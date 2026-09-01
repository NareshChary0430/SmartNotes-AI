# 🧠 SmartNotes-AI

> **AI-powered learning platform for smarter, faster, and exam-focused preparation.**

SmartNotes-AI is an intelligent **AI-driven learning platform** designed to help students learn, prepare, and revise more efficiently.

The platform allows students to generate **exam-ready notes**, visualize complex concepts using **diagrams and charts**, practice **important questions**, and revise their subjects efficiently — all from a single application.

Built as a **full-stack SaaS application**, SmartNotes-AI includes secure authentication, credit-based AI usage, online payments, and an interactive learning experience.

---

## 🚀 Features

### 🤖 AI-Powered Notes Generation

* Generate structured and exam-oriented notes using AI.
* Convert complex topics into easy-to-understand explanations.
* Generate concise summaries for quick revision.
* Supports Markdown-based content rendering.

### 📚 Smart Learning

* Generate important questions from a given topic.
* Practice questions for exam preparation.
* Create topic-based learning material.
* Quickly revise previously generated notes.

### 📊 Visual Learning

SmartNotes-AI makes difficult concepts easier to understand through visual representations.

* 📈 Charts and graphs
* 🔄 Flow diagrams
* 🧩 Concept diagrams
* 🗺️ Mermaid-based diagrams
* 📊 Interactive data visualization

### 🔐 Secure Authentication

* User authentication and authorization.
* Firebase-based authentication.
* Protected application routes.
* Secure user session management.

### 💳 Credit-Based Usage

SmartNotes-AI follows a **credit-based SaaS model**.

Users receive credits that can be consumed when using AI-powered features.

* Credit balance tracking
* Credit-based AI operations
* Credit purchase functionality
* Usage management

### 💰 Online Payments

The platform supports online payments for purchasing additional credits.

* Secure payment flow
* Credit packages
* Payment status handling
* Automatic credit updates after successful payment

### 📱 Responsive UI

Designed to provide a smooth experience across:

* 💻 Desktop
* 📱 Mobile
* 📟 Tablet


# 🛠️ Tech Stack

## Frontend

| Technology         | Purpose                         |
| ------------------ | ------------------------------- |
| **React.js**       | Building the user interface     |
| **React Router**   | Application routing             |
| **Redux Toolkit**  | Global state management         |
| **React Redux**    | Connecting Redux with React     |
| **Axios**          | API communication               |
| **Tailwind CSS**   | Styling and responsive UI       |
| **React Icons**    | UI icons                        |
| **React Markdown** | Rendering AI-generated Markdown |
| **Mermaid.js**     | Generating diagrams             |
| **Recharts**       | Charts and data visualization   |
| **Motion**         | Animations and transitions      |
| **Firebase**       | Authentication                  |
| **Vite**           | Development and build tooling   |

---

# 📦 Dependencies

```json
{
  "@reduxjs/toolkit": "^2.12.0",
  "@tailwindcss/vite": "^4.3.0",
  "axios": "^1.18.0",
  "firebase": "^12.15.0",
  "mermaid": "^11.12.2",
  "motion": "^12.40.0",
  "react": "^19.2.6",
  "react-dom": "^19.2.6",
  "react-icons": "^5.6.0",
  "react-markdown": "^10.1.0",
  "react-redux": "^9.3.0",
  "react-router-dom": "^7.17.0",
  "recharts": "^3.10.1",
  "tailwindcss": "^4.3.0"
}
```

---

# 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │     SmartNotes-AI   │
                    └──────────┬──────────┘
                               │
                 ┌─────────────┴─────────────┐
                 │                           │
          ┌──────▼──────┐             ┌──────▼──────┐
          │   Frontend  │             │   Backend   │
          │    React    │◄───────────►│    APIs     │
          └──────┬──────┘             └──────┬──────┘
                 │                           │
       ┌─────────┼─────────┐          ┌──────┼──────┐
       │         │         │          │      │      │
    Redux     Firebase   UI/UX      AI     DB    Payment
       │         │         │          │      │      │
       └─────────┴─────────┘          └──────┴──────┘
```

---

# 🔄 How SmartNotes-AI Works

### Step 1 — Authentication

Users sign in securely using the authentication system.

### Step 2 — Choose a Topic

The user enters a subject or topic they want to study.

### Step 3 — Generate Learning Material

The AI processes the topic and generates:

* Exam-ready notes
* Important questions
* Summaries
* Diagrams
* Charts

### Step 4 — Learn & Visualize

Students can read the generated notes and understand concepts through diagrams and visualizations.

### Step 5 — Practice

Users can generate and practice important questions related to the topic.

### Step 6 — Revise

Generated content can be used for quick revision before examinations.

### Step 7 — Purchase Credits

When credits are exhausted, users can purchase additional credits through the payment system.

---

# 📁 Suggested Project Structure

```text
SmartNotes-AI/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── redux/
│   │   ├── services/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
│
├── server/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
└── screenshots/
    ├── home.png
    ├── notes.png
    ├── visual-learning.png
    ├── questions.png
    └── payment.png
```

---

# ⚙️ Installation & Setup

## 1. Clone the Repository

```bash
git clone https://github.com/your-username/SmartNotes-AI.git
```

Navigate into the project:

```bash
cd SmartNotes-AI
```

---

## 2. Install Frontend Dependencies

```bash
cd client
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the `client` directory.

```env
VITE_API_URL=your_backend_api_url
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

> ⚠️ Never commit sensitive credentials or secret keys to GitHub.

---

## 4. Start the Development Server

```bash
npm run dev
```

The application will be available at the local Vite development URL shown in your terminal.

---

# 🧪 Available Scripts

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run ESLint

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

---

# 🎯 Key Highlights

* 🤖 AI-powered learning
* 📖 Exam-oriented notes
* 📊 Interactive visualizations
* 🧠 Smart question generation
* 🔐 Secure authentication
* 💳 Credit-based SaaS model
* 💰 Online payment integration
* ⚡ Fast React + Vite application
* 🎨 Modern Tailwind CSS interface
* 📱 Responsive design
* 🔄 Redux-based state management
* 📈 Interactive charts
* 🔀 Mermaid diagrams

---

# 🔮 Future Enhancements

Some planned improvements include:

* 🎙️ AI-powered voice explanations
* 📄 PDF notes export
* 📚 Personalized study plans
* 🧠 AI-powered quiz evaluation
* 📅 Exam preparation schedules
* 📈 Student performance analytics
* 🔊 Text-to-speech learning
* 🌐 Multi-language support
* 🤝 Collaborative study rooms
* 🏆 Gamification and achievements

---

# 👨‍💻 Developer

**Your Name**

Full Stack Developer | React.js | Node.js | AI Applications

---

# ⭐ Support

If you find **SmartNotes-AI** useful, consider giving the repository a ⭐ on GitHub.

---

## 📄 License

This project is developed for educational and demonstration purposes.
