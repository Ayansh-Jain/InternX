# InternX - ATS Resume Builder

A modern, startup-grade resume builder web application that helps students, freshers, and professionals create ATS-optimized resumes instantly.

![InternX](https://img.shields.io/badge/InternX-Resume%20Builder-E6CFA6?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat-square&logo=vite)

## ✨ Features

- **Smart Form Builder** - Intuitive 6-step guided form
- **ATS Optimization** - Keywords, action verbs, and formatting optimized for ATS
- **Resume Scoring** - Comprehensive 0-100 score with detailed feedback
- **Multiple Templates** - Classic, Modern, and Minimal ATS-friendly templates
- **Live Preview** - Real-time resume preview as you type
- **PDF Export** - Print-ready PDF download
- **Grammar Check** - Built-in grammar and spelling suggestions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Python 3.9+

### Frontend Setup

```bash
# Navigate to project directory
cd InternX

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

```bash
# Navigate to backend directory
cd InternX/backend

# Create virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the API server
python main.py
```

The API will be available at `http://localhost:8000`

## 📁 Project Structure

```
InternX/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation bar
│   │   ├── Footer.jsx           # Footer component
│   │   ├── AnimatedButton.jsx   # Reusable button with animations
│   │   ├── ResumeForm.jsx       # Multi-step form (6 steps)
│   │   ├── ResumePreview.jsx    # Live resume preview (3 templates)
│   │   ├── TemplateSelector.jsx # Template selection UI
│   │   ├── ScoreCard.jsx        # ATS score display
│   │   └── FeedbackPanel.jsx    # Improvement suggestions
│   ├── pages/
│   │   ├── Landing.jsx          # Home page with hero section
│   │   └── Builder.jsx          # Resume builder page
│   ├── App.jsx                  # Main app with routing
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles & design system
├── backend/
│   ├── routes/
│   │   └── resume.py            # API endpoints
│   ├── services/
│   │   ├── scoring.py           # ATS scoring algorithm
│   │   ├── generator.py         # Content optimization
│   │   └── grammar.py           # Grammar checking
│   ├── main.py                  # FastAPI application
│   └── requirements.txt         # Python dependencies
├── public/
│   └── favicon.svg              # Site icon
├── index.html                   # HTML entry point
├── package.json                 # Node.js dependencies
└── vite.config.js               # Vite configuration
```

## 🎨 Design System

### Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#E6CFA6` | Warm Beige - Accents |
| `--secondary` | `#3A4B41` | Deep Green - Primary actions |
| `--white` | `#FFFFFF` | Backgrounds |
| `--gray-600` | `#4B5563` | Body text |

### Typography
- **Headings**: Bebas Neue (Google Fonts)
- **Body**: Inter (Google Fonts)

## 📊 ATS Scoring System

The resume is scored out of 100 points:

| Factor | Points | Description |
|--------|--------|-------------|
| Keywords | 25 | Matching skills to target job role |
| Quantification | 20 | Numbers and metrics in achievements |
| Grammar | 15 | Spelling and grammar quality |
| Completeness | 15 | All sections properly filled |
| Action Verbs | 10 | Strong action verbs at bullet starts |
| ATS Readability | 15 | Proper formatting and structure |

### Score Interpretation
- **70-100** 🟢 Strong - Ready to submit
- **40-69** 🟡 Needs Improvement - Follow suggestions
- **0-39** 🔴 Weak - Significant gaps to address

## 🔌 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-resume` | POST | Optimize resume content |
| `/api/analyze-resume` | POST | Get ATS score and feedback |
| `/api/templates` | GET | Get available templates |
| `/api/check-grammar` | POST | Check grammar and spelling |

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 5** - Build tool
- **Framer Motion** - Animations
- **React Hook Form** - Form handling
- **React Router** - Navigation
- **html2pdf.js** - PDF export

### Backend
- **FastAPI** - Python web framework
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server

## 📝 Usage Guide

1. **Landing Page**: Click "Build My Resume" to start
2. **Step 1 - Personal**: Enter contact information
3. **Step 2 - Education**: Add educational background
4. **Step 3 - Skills**: Add technical, tools, and soft skills
5. **Step 4 - Experience**: Add work experience with bullet points
6. **Step 5 - Projects**: Add notable projects and achievements
7. **Step 6 - Target Role**: Specify desired job position
8. **Review**: Check the live preview on the right
9. **Analyze**: Click "Analyze Score" for ATS evaluation
10. **Export**: Click "Download PDF" to save your resume

## 🔧 Development

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

Built with ❤️ by InternX Team
