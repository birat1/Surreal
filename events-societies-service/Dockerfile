# Stage 1: Build
FROM python:3.12-slim AS build
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Run
FROM python:3.12-slim
WORKDIR /app
COPY --from=build /install /usr/local
COPY . .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]
