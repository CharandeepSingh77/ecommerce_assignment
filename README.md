# E-Commerce Angular Application

A modern e-commerce application built with **Angular 17** and **GraphQL**, featuring product management, category management, shopping cart functionality, and user authentication.

---

## Features

- **Product Management**
  - Browse products with filters
  - View product details
  - Add/Edit/Delete products
  - Product categorization

- **Shopping Cart**
  - Add/Remove items
  - Adjust quantities
  - Calculate total price
  - Checkout process

- **User Management**
  - User registration
  - Authentication
  - Profile management
  - JWT token handling

- **Category Management**
  - Browse categories
  - Add/Edit/Delete categories
  - Default electronics category

---

## Tech Stack

- **Frontend**
  - Angular 17
  - Apollo Angular 8
  - Bootstrap 5.3
  - RxJS 7.8

- **API**
  - GraphQL API (https://api.escuelajs.co/graphql)
  - Apollo Client for GraphQL operations

---

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** (v6 or higher)
- **Angular CLI** (v17)

---

## Installation

Follow these steps to set up the project locally:

1. **Clone the repository**:
   \`\`\`bash
   git clone [repository-url]
   cd pt
   \`\`\`

2. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Start the development server**:
   \`\`\`bash
   ng serve
   \`\`\`

4. **Open your browser** and navigate to:
   \`\`\`bash
   http://localhost:4200
   \`\`\`

---

## Project Structure

Here is the folder structure of the project:

\`\`\`
src/
├── app/
│   ├── components/       # UI components
│   ├── services/        # Business logic and API calls
│   ├── models/          # TypeScript interfaces
│   ├── guards/          # Route guards
│   └── graphql/         # GraphQL queries and mutations
├── assets/             # Static files
└── styles/             # Global styles
\`\`\`

---

## Key Features Implementation

### Authentication

- JWT-based authentication
- Token refresh mechanism
- Protected routes with guards

### Product Management

- GraphQL queries for product operations
- Real-time updates with Apollo Client
- Image handling and preview

### Shopping Cart

- In-memory cart management
- Reactive updates using \`BehaviorSubject\`
- Cart total calculation

### Category Management

- Local storage for offline access
- Default electronics category
- Category CRUD operations

---

## Available Scripts

You can use the following commands to run and build the project:

- **Start the development server**:  
  \`\`\`bash
  ng serve
  \`\`\`

- **Build the project**:  
  \`\`\`bash
  ng build
  \`\`\`

- **Run unit tests**:  
  \`\`\`bash
  ng test
  \`\`\`

- **Build for production**:  
  \`\`\`bash
  ng build --prod
  \`\`\`

---

## License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## Acknowledgments

- **Angular Team** for the amazing framework
- **Apollo GraphQL** for the excellent GraphQL client
- **Bootstrap Team** for the UI components
