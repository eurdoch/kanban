# Kanban Board Application

A full-stack Kanban board application with a React frontend, Express API, and task manager service.

## Project Structure

- **Frontend**: React-based Kanban board UI
- **API**: Express server with PostgreSQL database
- **Manager**: Service that polls for TODO tasks and processes them

## Running the Application

### Development

1. Start the frontend:
   ```
   yarn dev
   ```

2. Start both API and Manager servers with a single command:
   ```
   yarn servers
   ```
   This will start both servers using PM2 and display logs from both in real-time.

### PM2 Server Management

- Start servers: `yarn start:servers`
- View logs: `yarn logs`
- Check status: `yarn servers:status`
- Restart servers: `yarn restart:servers`
- Stop servers: `yarn stop:servers`
- Delete servers from PM2: `yarn delete:servers`

## Features

- Create, update, and delete tasks
- Move tasks between status columns (TODO, IN_PROGRESS, COMPLETED, STAGED)
- Automatic task polling in the frontend
- Background service to process TODO tasks