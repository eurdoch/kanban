# Kanban Board CLI

A full-stack Kanban board application with a React frontend, Express API, and task manager service, packaged as an npm CLI tool.

## Project Structure

- **Frontend**: React-based Kanban board UI
- **API**: Express server with PostgreSQL database
- **Manager**: Service that polls for TODO tasks and processes them
- **CLI**: Command-line interface for running the servers

## Installation

### Global Installation

```bash
npm install -g kanban-board-cli
```

### Local Installation

```bash
npm install kanban-board-cli
```

## Using the CLI

Once installed, you can use the `kanban-cli` command:

```bash
kanban-cli [command]
```

### Available Commands

- `kanban-cli servers` - Start both API and manager servers and display logs
- `kanban-cli start` - Start servers without showing logs
- `kanban-cli stop` - Stop all running servers
- `kanban-cli logs` - View logs from all servers
- `kanban-cli restart` - Restart all servers
- `kanban-cli status` - Check server status
- `kanban-cli delete` - Remove servers from PM2
- `kanban-cli help` - Display help information

### Using in package.json Scripts

You can also use the CLI in your own project's package.json scripts:

```json
{
  "scripts": {
    "kanban": "kanban-cli servers",
    "kanban:logs": "kanban-cli logs"
  }
}
```

## For Development

If you're working on the project directly:

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
- CLI tool to manage services