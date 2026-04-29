# InternX Project Architecture Documentation

## 1. Project Overview and Purpose
InternX is a comprehensive job and internship portal designed to bridge the gap between job seekers and providers using intelligent matching and personalized recommendations. The platform incorporates Advanced AI and Reinforcement Learning techniques to ensure that candidates are matched with the most suitable opportunities based on their resumes, skills, and interaction history. It aims to streamline the recruitment process by providing an intuitive interface for both applicants and recruiters, enhanced by automated Application Tracking System (ATS) scoring.

## 2. Problem Statement and Motivation
Traditional job portals often rely on simple keyword matching or chronological feeds, leading to a frustrating experience where candidates see irrelevant jobs and recruiters are flooded with unqualified applications. The motivation behind InternX is to build a smarter system that learns from user behavior and intelligently assesses candidate compatibility. By integrating Reinforcement Learning (LinUCB for personalized feeds and REINFORCE for ATS scoring), InternX aims to dynamically adapt to market needs and user preferences, improving the success rate of job matching over time.

## 3. Features and Functionalities
### For Job Seekers:
*   **User Registration & Profile Creation**: Comprehensive profile setup including resume data, skills, education, and experience.
*   **Personalized Job Feed**: A dynamic job feed powered by a LinUCB Contextual Bandit that learns from the user's views, clicks, and applications.
*   **Job Search & Filtering**: Advanced search across active internal jobs with filters for location, job type, experience, and salary.
*   **External Job Aggregation & Tracker**: AI-powered web search spanning LinkedIn, Indeed, Internshala, and Govt portals via the JSearch API (with realistic smart templates as fallback). Users can save these external jobs or self-report them as applied.
*   **ATS Resume Scoring**: Real-time feedback on resume compatibility with job requirements.
*   **Application Tracking**: Dashboard to view applied jobs, status updates, and saved jobs.
*   **Resume Builder/Optimizer**: AI-assisted tool to generate and optimize ATS-friendly resumes.

### For Job Providers:
*   **Job Posting & Management**: Create, edit, and delete job listings (Full-time, Internships, etc.).
*   **Applicant Tracking Dashboard**: View all candidates applied to a specific job, complete with ATS match percentages and resume snapshots.
*   **Application Status Management**: Update candidate status (Pending, Reviewed, Shortlisted, Rejected, Accepted).
*   **Market Prediction**: AI tool to predict audience distribution (Students vs. Professionals) for a potential job post.

### For Admins:
*   **User Management**: View, block, unblock, and delete users across the platform.
*   **Job Moderation**: Monitor all job postings, block inappropriate content, or delete jobs.
*   **Analytics Dashboard**: High-level metrics on total users, job providers, seekers, active jobs, and blocked entities.
*   **Audit Logging**: Comprehensive tracking of all administrative actions.

### Utilities & Development:
*   **Database Seeder**: An automated, idempotent Python script (`seed_db.py`) designed to populate the MongoDB instance with realistic dummy data including users, providers, diverse jobs, and application histories to facilitate testing and validation.

## 4. Detailed Workflow of the System
1.  **Authentication Flow**: Users sign up as either a Seeker or Provider. JWT tokens are issued for stateless authentication.
2.  **Profile Setup**: Seekers fill out their profiles, which are parsed to extract skills and experience. A text embedding of their profile is generated using `SentenceTransformer`.
3.  **Job Discovery**: Seekers visit their dashboard and are presented with a feed of jobs. The recommendation engine blends Cosine Similarity (baseline) and LinUCB Bandit scores (learned preferences).
4.  **Interaction Logging**: As the Seeker views or saves jobs, interactions are logged, updating the user's preference vector and the Bandit's state matrices online.
5.  **Application Process**: When a Seeker applies, the `ApplicantRanker` (a REINFORCE neural network) calculates a match percentage based on an 8-dimensional feature vector. The application is stored with this snapshot.
6.  **Provider Review**: The Provider views the application. When they accept or reject a candidate, this action acts as a reward signal.
7.  **Online Learning**: The reward signal triggers an online gradient step in the `ApplicantRanker`, adjusting the weights to improve future matching accuracy for similar candidate-job pairs.

## 5. Frontend Structure
The frontend is built using **React** and **Vite**, with routing handled by `react-router-dom`.
*   **Pages**:
    *   `Landing.jsx`: Public home page.
    *   `auth/SignUp.jsx`, `auth/SignIn.jsx`: Authentication pages.
    *   `searcher/SearcherDashboard.jsx`, `searcher/Profile.jsx`, `searcher/WebSearch.jsx`: Interfaces for job seekers.
    *   `provider/ProviderDashboard.jsx`: Interfaces for recruiters to manage jobs and applicants.
    *   `admin/AdminDashboard.jsx`: Moderation and analytics interface.
    *   `Builder.jsx`: Resume builder tool.
*   **Components**: Reusable UI elements (`Navbar`, `Footer`) and context providers (`AuthContext`, `ToastProvider`). Route protection is enforced via `ProtectedRoute` and `RoleRedirect`.

## 6. Backend Structure
The backend is a **FastAPI** application designed with modular routing and service-oriented architecture.
*   `main.py`: Entry point, configures CORS, mounts routers, and manages the lifecycle (loading/saving RL model states and starting the APScheduler for job expiry).
*   **Routes** (`routes/`):
    *   `auth.py`: JWT-based signup, signin, token refresh, and OTP password reset.
    *   `users.py`: Profile updates and user specific data retrieval.
    *   `jobs.py`: CRUD operations for jobs, searching, and provider job management.
    *   `applications.py`: Applying to jobs, tracking applications, updating status, and saving jobs.
    *   `recommendations.py`: Logging interactions and generating the personalized feed.
    *   `admin.py`: User/Job moderation, analytics, and audit logs.
*   **Services** (`services/`):
    *   `linucb_bandit.py` & `recommendation_engine.py`: Logic for the contextual bandit recommender.
    *   `applicant_ranker.py` & `scoring.py`: MLP network for ranking and heuristic ATS scoring.
    *   `ml.py`: Text embedding generation using Hugging Face `sentence-transformers`.
    *   `job_search.py`: External job fetching via JSearch API with smart template fallbacks.

## 7. Database Design
The project uses **MongoDB** (via `motor` async driver). Key collections include:
*   **users**: Stores credentials, role (`JOB_SEARCHER`, `JOB_PROVIDER`, `ADMIN`), profile details, resume data, score, and the user's `preference_vector` and `embedding`.
*   **jobs**: Stores job title, description, skills, salary range, provider ID, status, and stats (views, application counts).
*   **applications**: Links `job_id`, `applicant_id`, and `provider_id`. Stores the `status`, `match_percentage`, cover letter, and a snapshot of `resume_features` for RL updates.
*   **interactions**: Logs user actions (`view`, `click`, `apply`, `like`) on jobs, including the `job_vector` at the time of interaction.
*   **saved_jobs**: Maps `user_id` to `job_id` for internally bookmarked jobs.
*   **external_jobs**: Tracks jobs found via the external web search that the user has saved or marked as applied.
*   **admin_logs**: Audit trail for admin actions.

## 8. APIs and Their Working
The FastAPI backend exposes RESTful endpoints:
*   **POST /auth/signup & /auth/signin**: Authenticates users and returns Bearer tokens.
*   **GET /jobs & POST /jobs**: Fetches active jobs (with pagination and filters) or creates a new job (Providers only).
*   **POST /applications**: Submits a job application. Triggers the `ApplicantRanker` to compute a match score and saves the 8D feature vector.
*   **PUT /applications/{id}/status**: Updates application status. If the status is an accept/reject, it triggers the `online_update` of the `ApplicantRanker`.
*   **GET/POST /external-jobs**: Endpoints to list, save, and mark external web-search jobs as applied.
*   **GET /recommendations/feed**: Returns a blended list of jobs sorted by Cosine Similarity and LinUCB expected reward.
*   **POST /recommendations/interact**: Logs a user interaction, updates their preference vector, and performs a Sherman-Morrison update on the LinUCB matrices.

## 9. Authentication and Security Features
*   **Stateless JWT Authentication**: Access and refresh tokens manage sessions securely without server-side session storage.
*   **Role-Based Access Control (RBAC)**: Route dependencies (`require_job_searcher`, `require_job_provider`, `require_admin`) ensure users only access authorized endpoints.
*   **Password Hashing**: `bcrypt` is used to securely hash passwords before database storage.
*   **OTP Password Reset**: Secure reset flow generating a time-limited 6-digit OTP.

## 10. Algorithms / Logic Used in the Project
### 1. LinUCB Contextual Bandit (Job Recommendation)
*   **Purpose**: Replaces static feed ranking with a self-improving formula: `UCB_score = expected_reward + α × uncertainty`.
*   **Mechanism**: Maintains an `A` matrix and `b` vector for each job. The context vector is a concatenation of the user's preference vector and the job's feature vector.
*   **Update**: When a user interacts with a job, the reward (e.g., view=0.2, apply=1.0) is used to update the matrices via online learning.

### 2. REINFORCE Applicant Ranker (ATS Matching)
*   **Purpose**: A Multi-Layer Perceptron (MLP) neural network that scores candidate compatibility instead of relying solely on keyword overlap.
*   **Features**: Uses an 8-dimensional vector encompassing skill overlap, experience match, cosine similarity of text embeddings, education level, and cover letter presence.
*   **Online Update**: Uses the REINFORCE policy gradient method. A provider's decision (accept=+1.0, reject=-1.0) serves as the reward to perform a single gradient step (using Adam optimizer) on the network weights in real-time.

### 3. Text Embeddings
*   **Purpose**: `SentenceTransformer` (`all-MiniLM-L6-v2`) converts user bios and job descriptions into 384-dimensional dense vectors to calculate semantic similarity, handling cases where exact keywords differ but meanings align.

## 11. Technologies Used and Why They Were Chosen
*   **Frontend**: **React** & **Vite** for fast development, HMR, and component-based UI.
*   **Backend**: **FastAPI** (Python 3.10) for high performance, async support, and native Pydantic validation which is ideal for ML integrations.
*   **Database**: **MongoDB Atlas** (via `motor`) for flexible schema design, essential for evolving user profiles and job structures.
*   **Machine Learning**:
    *   **PyTorch**: Lightweight implementation of the MLP Ranker.
    *   **NumPy**: Fast matrix operations for the LinUCB Bandit.
    *   **Sentence-Transformers**: Efficient NLP embeddings.
*   **Task Scheduling**: **APScheduler** for background tasks like expiring old jobs.

## 12. System Architecture Explanation
The architecture follows a decoupled client-server model.
1.  **Client Layer**: React SPA communicating via JSON REST APIs.
2.  **API Gateway / Controller Layer**: FastAPI endpoints handling routing, auth, and request validation.
3.  **Service Layer**: Encapsulates business logic, including database operations (`database.py`) and ML operations (`linucb_bandit.py`, `applicant_ranker.py`, `recommendation_engine.py`).
4.  **Data Persistence Layer**: MongoDB for primary data. Local persistent files (`bandit_state.pkl`, `ranker_weights.pt`) for RL model states, loaded into memory on server startup and saved on shutdown.

## 13. Data Flow Explanation
1.  **User Onboarding**: User creates an account → Data stored in MongoDB → Profile embedded into a 384D vector.
2.  **Provider Posts Job**: Job stored in MongoDB → Job is vectorized into a vocabulary-based feature vector.
3.  **Seeker Views Feed**: `recommendation_engine` fetches active jobs → Calculates blended scores using Cosine Similarity and `LinUCB.score()` → Returns sorted feed.
4.  **Interaction**: Seeker clicks a job → `log_interaction` updates the user's `preference_vector` in MongoDB → `LinUCB.update()` adjusts the math model in-memory.
5.  **Application**: Seeker applies → `ApplicantRanker.extract_features` creates an 8D vector → Match % calculated and stored in `applications` collection.
6.  **Provider Action**: Provider reviews and accepts application → `ApplicantRanker.online_update` performs a PyTorch backward pass → Model gets smarter for the next candidate.
