# PII Governance Dashboard

## Overview
The PII Governance Dashboard is an enterprise-like web application designed to scan detect, and track down Personal Identifiable Information (PII) within internal documents for small-medium sized companies. I chose this project to demonstrate the strict data compliance workflows, secure handling of documents, and real-time risk assessment. 

## Current Project Status and Architecture
This repository encompasses the frontend architecture and mock backend state. The plan is to eventually transform this into a full-stack project, plugging it into a reliable container backend after the frontend part is completed.

### Current Frontend Stack
* **Framework:** react (Vite)
* **Styling:** CSS Modules
* **Management State:** React Hooks ('useState', 'useEffect')
* **Features:** live text debouncing, instant feedback, and dynamic light and dark theming

### Design Choices

**Styling: Standardized CSS Modules over Utility Frameworks**
For a enterprise dashboard, I decided on standard CSS Modules for styling rather than Utility style framework such as Tailwind CSS in order to keep things simple and intuitive.
* **Clean Purpose-Driven Directories:** CSS Modules allow for strict boundaries component logic and visual rendering which is crucial for maintenance of enterprise codebases.
* **Localized Styling:** Code guidelines are restricted to their specific UI block, making sure it stops any global conflicts before they happen.
* **Native Theme Detection:** Auto toggle between light and dark mode via CSS and skipping unnecessary Javascript.

## Local Development

The following steps below will help you run the project on your machine:

### Prerequisites
Make sure [Node.js] (https:nodejs.org/) installed on your local environment.

### Installation
1. Clone repository:
   ```bash
   git clone <https://github.com/Vitz2007/pii-governance-tool>

1. Navigate to the project directory:
   cd <your-project-folder-name>

2. Install dependencies required:
   npm install

3. Start the local Vite server:
   npm run dev
4. Open browser of choice and copy/paste http://localhost:5173 to view the application


## Roadmap for Full-Stack Integration
In the current state, the application is utilizing a locak mock API to fake data submission and scanning. 

### Upcoming Backend Integration:
-
-
-

Created by AJ
