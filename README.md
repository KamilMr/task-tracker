> This project runs a task tracker in the terminal using Node.js. Built with Node.js for everyone.

# Welcome

I am working on a small module to track tasks using Node.js, specifically designed to run in the terminal. This project will appeal to those who enjoy using Node.js and the terminal and prefer not to switch between the browser and the terminal. I am one of those people; working inside Neovim and the terminal, I like to spend as much time as possible there.

I would love to have a tracker that not only tracks what I am working on but also offers autocomplete and can be controlled using keybindings. This is both the reason and the goal for me.

Feel free to join me in working on this module. It is in the early stages, so please join me here https://discord.gg/Rk3hME8rfq, and let's work together. I am so excited.

Later, I plan to synchronize this project with track.toggle.com, but we will see how it goes.

# Features

- Ability to manage owners (add, view, update, delete).
- Ability to manage projects (add, view, update, delete, assign owner).
- Ability to manage tasks (add, view, update, delete).

# Coming Features

- Start and stop tasks with detailed tracking.
- Display current tasks in progress.
- Display summary of tasks for the current day.
- Autocomplete for CLI commands for efficient navigation.
- Keybindings for common actions within the terminal.
- Synchronization with track.toggle.com for external time tracking.
- Unit tests for all models and features.
- Comprehensive documentation and usage guidelines.

# Tasks to work on

All items have been moved to the project on GitHub: https://github.com/users/KamilMr/projects/4

# Docker Deployment

Run the task tracker in production using Docker Compose.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+

## Quick Start

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set your database credentials:
   ```
   MYSQL_ROOT_PASSWORD=your_secure_password
   MYSQL_DATABASE=task_tracker_v1
   ```

3. Build and start services:
   ```bash
   docker-compose up -d
   ```

4. Check logs:
   ```bash
   docker-compose logs -f tasktracker
   ```

5. Attach to the interactive terminal:
   ```bash
   docker-compose attach tasktracker
   ```
   Press `Ctrl+P` then `Ctrl+Q` to detach without stopping the container.

6. Stop services:
   ```bash
   docker-compose down
   ```

## Data Persistence

Database data is stored in Docker volume `mysql_data`. This ensures your tasks and project data persist across container restarts.

To completely remove all data:
```bash
docker-compose down -v
```

## Troubleshooting

- **Migrations fail**: Ensure database is healthy: `docker-compose ps`
- **Tracker won't start**: Check logs: `docker-compose logs tasktracker`
- **Permission errors**: Ensure .env file exists and is readable
- **Can't attach to container**: Make sure container is running: `docker-compose ps`

# Joining and Setting Up the Project

Here’s a guide to help you get started.

## Prerequisites

1. **Fork the Project**: Start by forking the repository to your own GitHub account.
2. **Clone the Fork**: Clone the forked repository to your local machine.
3. **Install MySQL and Nodejs**: Ensure that MySQL and Nodejs is installed on your local machine.
4. **Create a Database**: Run the SQL command `CREATE DATABASE <name>;` to create your local database.

## Project Setup

1. **Install Dependencies**: Navigate to your project directory and run `npm install` to install the necessary dependencies.
2. **Database Migration**: Set up the required database schema by running `npm run migrate`. Do it after you created data base.
3. **Start the Project**: You can start the project by running `node src/index.js` or `./src/index.js` from the project directory.

## Working on Tasks

1. **Choose a Task**: Tasks are detailed in the README.md under the tasks section. Pick one that you want to work on.
2. **Create a New Branch**: For each task, create a new branch from your fork, e.g., `git checkout -b task-2`.
3. **Development**: Work on the task in your branch. Commit changes as needed. If any question, please ask.

## Using Knex.js

- Familiarize yourself with the basics of SQL as you will need to understand `SELECT`, `INSERT`, `UPDATE`, `DELETE`, and how to use clauses like `WHERE` and operators like `AND`.
- Knex.js makes querying simpler, acting as a query builder. You don't need to dive deep into SQL.

## Submission and Review

1. **Pull Request**: Once you complete your task, push your branch to GitHub and create a pull request to the main branch of the original repository.
2. **Code Review**: Add me as a reviewer to your pull request.

## Need Help?

- If you encounter any issues during setup or development, please write on the dedicated project channel.

Happy coding! 🙂

# Discord

Would you like to work with me? Join me on discord :-)
[Click here](https://discord.gg/Rk3hME8rfq)
