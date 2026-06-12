FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

RUN useradd -m app
USER app

CMD ["gunicorn", "-b", "0.0.0.0:8080", "app.main:app"]