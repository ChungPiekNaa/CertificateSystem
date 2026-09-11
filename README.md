# Certificate System

A React-based certificate generation and management system for creating, editing, viewing, printing, and managing course completion certificates.

## Features

* Generate certificates with a fixed certificate layout and live preview
* Customize certificate wording and font sizes
* Automatically generate sequential certificate Ref IDs
* View and search generated certificates
* Edit existing certificate records
* Soft delete certificates while retaining the records
* Print certificates using the browser print function
* Export active certificate records to Excel

## Technology

* React + Vite
* Supabase
* JavaScript
* CSS
* SheetJS (`xlsx`)

## Database

The system uses two Supabase tables:

* `certificates` — stores certificate records and participant information
* `certificate_settings` — stores shared certificate wording settings

## Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Configure the Supabase connection before running the application.