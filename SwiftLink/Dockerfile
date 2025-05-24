FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1
ENV DB_HOST=postgres  
ENV DB_PORT=5432
ENV DB_NAME=postgres
ENV DB_USER=postgres
ENV DB_PASSWORD=postgres

WORKDIR /app

COPY ./requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "SwiftLink.wsgi:application", "--bind", "0.0.0.0:8001", "--certfile=./a.cert", "--keyfile=./a.key", "--timeout", "90"]

EXPOSE 8001
