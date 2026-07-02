FROM public.ecr.aws/lambda/python:3.11

WORKDIR ${LAMBDA_TASK_ROOT}

# Upgrade pip first so it can use modern pre-built wheels
RUN pip install --upgrade pip

COPY requirements.txt .
RUN pip install -r requirements.txt --no-cache-dir

COPY app/ ./app/

CMD ["app.main.handler"]
