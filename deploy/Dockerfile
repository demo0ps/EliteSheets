FROM python:3.13-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PORT=8080 SHEETQMS_ENV=production
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && useradd --uid 10001 --create-home appuser
COPY sheetqms ./sheetqms
COPY web ./web
RUN mkdir -p /home/appuser/.local/sheetqms-cloud && chown -R appuser:appuser /home/appuser /app
USER appuser
CMD ["sh", "-c", "exec uvicorn sheetqms.online:app --host 0.0.0.0 --port ${PORT:-8080} --no-access-log --proxy-headers --forwarded-allow-ips='*'"]
