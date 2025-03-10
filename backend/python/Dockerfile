FROM python:3.7

WORKDIR /app

COPY ./backend/python/requirements.txt ./
RUN pip install -r requirements.txt

EXPOSE 8080
ENTRYPOINT ["python", "server.py"]
