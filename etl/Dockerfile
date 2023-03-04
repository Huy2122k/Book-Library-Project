FROM python:3.8

RUN apt-get update && apt-get install -y cron 

RUN pip install pandas mysql-connector-python elasticsearch

COPY . /app

WORKDIR /app

RUN echo "0 19 * * * cd /app && python3 etl.py && python3 load_library_data.py" >> /etc/crontab

CMD ["cron", "-f"]
# CMD ["python", "-c", "while True: print('hello world')"]

