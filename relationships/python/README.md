# redis-om-python-retail

This repository contains several example sub-projects:

1. Tthe `api` directory contains an example of how to use [Redis OM Python](https://github.com/redis/redis-om-python) with FastAPI.
1. The `one-to-one` directory contains a one-to-one data modeling example project.
1. The `one-to-many` directory contains a one-to-many data modeling example project.
1. The `many-to-many` directory contains a many-to-many data modeling example project.

## Installing

You install this project with Poetry.

First, [install Poetry](https://python-poetry.org/docs/#installation). You can probably pip install it into your Python environment:

    $ pip install poetry

Then install the example app's dependencies:

    $ poetry install

## Running the Projects

### Environment Variables

This project expects you to set a `REDIS_OM_URL` environment variable, which should be the connection string to your Redis instance following the redis-py URL format:

    redis://[[username]:[password]]@localhost:6379/[database number]

#### API

To try the API, first, start the server:

    $ poetry run uvicorn main:app --app-dir api

Once it is running you can visit http://127.0.0.1:8000/docs to see the API documentation.

### one-to-one

To run the one-to-one "separate" example run:

    $ poetry run python ./one-to-one/separate.py

To run the one-to-one "embedded" example run:

    $ poetry run python ./one-to-one/embedded.py

### one-to-many

To run the one-to-many example run:

    $ poetry run python ./one-to-many/main.py

### many-to-many

To run the many-to-many example run:

    $ poetry run python ./many-to-many/main.py

## About the projects

### The API

- **main.py**: The FastAPI application entrypoint
- **api.py**: Contains the FastAPI API routes
- **generate.py**: Contains functionality for clearing and regenerating data on your Redis instance
- **models.py**: Contains the redis-om-python models
  - There is some additional code in the models to make things a little bit cleaner in the database
- **utils.py**: Contains utility functions

### One-to-One

- **separate.py**: A one-to-one data modeling example using separate models
- **embedded.py**: A one-to-one data modeling example using embedded models
- **utils.py**: Contains utility functions

### One-to-Many

- **main.py**: A one-to-many data modeling example
- **utils.py**: Contains utility functions

### Many-to-Many

- **main.py**: A many-to-many data modeling example
- **utils.py**: Contains utility functions
