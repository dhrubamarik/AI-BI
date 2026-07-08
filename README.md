# 🚀 AI Business Intelligence Dashboard
### *Turning raw CSV data into actionable insights with LLMs*

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build](https://img.shields.io/badge/build-production--ready-orange.svg)

## 🌟 Overview
The **AI Business Intelligence Dashboard** is a next-generation data analytics platform. Unlike traditional BI tools that require manual configuration and SQL knowledge, this platform uses **Llama 3.3 (Groq API)** to automatically understand the schema of *any* business CSV and allow users to "chat" with their data.

From Sales and HR to Finance and Inventory, just upload a file and ask: *"Why did our revenue dip last month?"* or *"Predict next month's growth."*

---

## 🛠️ Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Backend** | Node.js, Express.js |
| **Frontend** | EJS, Tailwind CSS, Chart.js |
| **Database** | MongoDB Atlas |
| **AI Engine** | Groq API (Llama 3.3 70B Model) |
| **Auth** | JWT (JSON Web Tokens), bcrypt.js |
| **File Handling** | Multer, csv-parser |

---

## 🚀 Key Features

### 🧠 1. Zero-Config AI Schema Understanding
No need to define columns. The AI analyzes headers and sample rows to detect:
*   **Business Domain:** (Sales, Marketing, HR, etc.)
*   **Metrics:** (Revenue, Salary, Bounce Rate)
*   **Dimensions:** (Region, Department, Date)

### 📊 2. Dynamic KPI & Visualization Engine
The dashboard doesn't just show text; it generates **context-aware charts** using Chart.js.
*   **Smart Selection:** AI chooses the best chart type (Pie, Bar, Line) based on your question.
*   **Real-time Math:** Performs groupings and aggregations (Python Pandas-style logic) instantly in the backend.

### 💬 3. Natural Language Reasoning
Ask complex business questions that go beyond simple sums:
*   **Trend Analysis:** *"Explain the drop in Q2 sales."*
*   **Forecasting:** *"What happens if marketing spend increases by 20%?"*
*   **Content Generation:** *"Generate a LinkedIn post based on these results."*

### 🔒 4. Enterprise-Grade Privacy
*   **User Isolation:** Every file and chat history is strictly linked to a unique `userId`.
*   **Row-Level Security:** Users can never access or even see the existence of another user's data.

---

## 📐 Architecture & Data Flow

```mermaid
graph TD
    A[User] -->|Upload CSV| B(Multer / CSV Parser)
    B -->|Cleaned JSON| C{AI Schema Engine}
    C -->|Identify Domain/KPIs| D[(MongoDB Atlas)]
    A -->|Ask Question| E[Query Service]
    E -->|Context + Prompt| F(Groq Llama 3.3)
    F -->|Reasoning| G[Dynamic Chart Service]
    G -->|Aggregation Logic| H[Frontend Dashboard]
    H -->|Chart.js| I[Interactive Visuals]
