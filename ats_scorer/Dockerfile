FROM python:3.10-slim

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .

# Install dependencies needed for PyMuPDF or general build
RUN apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Pre-download SentenceTransformer model to bake into the image
RUN python -c "from sentence_transformers import SentenceTransformer; SentenceTransformer('all-MiniLM-L6-v2')"

# Copy application code
COPY ./app /app/app
COPY ./data /app/data

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
