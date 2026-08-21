# DeepResearch AI 🤖🔬

**DeepResearch AI** is a production-quality, autonomous AI research agent platform designed to convert complex user queries into structured, source-backed, cited research reports.

---

## 🌟 Key Features

* **7-Step Autonomous Agent Workflow**:
  1. **Query Analysis**: Extracts core research dimensions, keywords, and timeframes.
  2. **Dynamic Research Plan**: Generates subtopic breakdowns tailored to research depth (*Quick*, *Standard*, *Deep*).
  3. **Multi-Source Search**: Queries academic, governmental, news, and enterprise domains without duplicates.
  4. **Source Evaluation**: Grades source domain authority, HTTPS encryption, and content freshness transparently.
  5. **Empirical Synthesis**: Extracts non-repetitive facts and maps claims directly to citations (`[1]`, `[2]`).
  6. **Structured Markdown Reports**: Generates Executive Summaries, Table of Contents, Analysis, Limitations, Future Trends, and Cited References.
  7. **Interactive Follow-up Q&A**: Asks contextual follow-up questions without re-running full search pipelines.
* **Publication-Ready PDF Exports**: Download formatted PDF documents directly from report pages.
* **JWT Authentication**: Password hashing using PBKDF2/HMAC-SHA256 and JWT session management.
* **Zero-Config Smart Fallbacks**: Zero-config execution out of the box using built-in search and local synthesis engines, with seamless support for OpenAI, Gemini, and Anthropic API keys.
* **Modern Premium UI**: Responsive dark/light theme system, glassmorphism UI components, live execution step progress tracker, and interactive dashboard analytics.

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, Javascript, Modern CSS (Glassmorphism, Dark/Light Themes), Lucide Icons, React Markdown.
* **Backend**: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, PyJWT.
* **Database**: SQLite (Local development), PostgreSQL ready (SQLAlchemy ORM abstraction).
* **PDF Export**: FPDF2 PDF document generator.
* **Deployment**: Docker, Docker Compose, Nginx.

---

## 📁 Project Structure

```
deepresearch-ai/
├── backend/
│   ├── app/
│   │   ├── api/          # FastAPI REST endpoints (auth, research, report, dashboard, user)
│   │   ├── core/         # Settings configuration, Security JWT & Hashing
│   │   ├── database/     # SQLAlchemy engine, session maker
│   │   ├── models/       # Database ORM models (User, Research, Plan, Source, Report, FollowUp)
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── services/     # AI service layer, Search service, PDF generator
│   │   ├── agents/       # Autonomous research agent pipeline logic
│   │   └── main.py       # FastAPI main app entrypoint
│   ├── requirements.txt  # Python backend dependencies
│   ├── .env.example      # Sample environment configuration
│   └── .env              # Local environment variables
├── frontend/
│   ├── src/
│   │   ├── components/   # Navbar, Footer, ProtectedRoute, Modals
│   │   ├── pages/        # Landing, Login, Register, Dashboard, NewResearch, Progress, Report, History, Settings, 404
│   │   ├── services/     # Axios API service with JWT authorization header interceptor
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── App.jsx       # Route definitions
│   │   └── main.jsx      # React root rendering
│   └── package.json
├── docker/
│   ├── Dockerfile.backend
│   └── Dockerfile.frontend
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
* **Node.js**: v18+ and npm
* **Python**: v3.10+ (or Python 3.12)

---

### 2. Backend Setup & Run

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\activate
   ```

3. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```

4. Create your `.env` file (copied from `.env.example`):
   ```bash
   cp .env.example .env
   ```

5. Start the FastAPI backend server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *The API server will run at `http://localhost:8000` with interactive Swagger docs at `http://localhost:8000/api/docs`.*

---

### 3. Frontend Setup & Run

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   *The web application will open at `http://localhost:5173`.*

---

## 🐳 Docker Deployment

To launch the full stack application with Docker Compose:

```bash
docker-compose up --build
```

* **Frontend App**: `http://localhost:3000`
* **Backend API**: `http://localhost:8000`

---

## 🔐 Security & Environment Variables

Key settings in `.env`:

| Key | Description | Default |
| :--- | :--- | :--- |
| `SECRET_KEY` | Secret key for signing JWT tokens | `min_32_chars_secret` |
| `DATABASE_URL` | Database URI | `sqlite:///./deepresearch.db` |
| `DEFAULT_AI_PROVIDER` | AI provider (`fallback`, `openai`, `gemini`, `anthropic`) | `fallback` |
| `OPENAI_API_KEY` | Optional OpenAI API Key | `""` |
| `GEMINI_API_KEY` | Optional Gemini API Key | `""` |
| `DEFAULT_SEARCH_PROVIDER` | Search provider (`duckduckgo`, `tavily`, `serper`) | `duckduckgo` |

---

## 📄 License
Released under the MIT License.
