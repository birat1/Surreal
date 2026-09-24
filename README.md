# Surreal

A full-stack microservices-based web application designed for campus networking, finding friends, joining societies, and managing events.

## Setting up .env

An `.env.example` file is provided outlining what should be in an `.env` file for this to work properly

## Running the project

1. `docker compose up` - can also include `-d` for detached or `--build` for building
2. `docker compose down` - can also include `-v` for deleting volumes

## Seeding commands

1. `docker compose exec user-auth-service python seed/seed.py` - seeds users and their profiles
2. `docker compose exec events-societies-service python seed/seed_events.py` - seeds events

Details for seeded users can be found at user-auth-service/seed/seed_data.json
For example, you can use:

```
email: test@surrey.ac.uk
password: password

email: test2@surrey.ac.uk
password: password
```
