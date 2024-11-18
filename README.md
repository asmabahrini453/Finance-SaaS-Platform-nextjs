
# Finance SaaS Platform

This project is a Finance SaaS Platform designed to help users manage their daily transactions, including income and expenses. It provides interactive charts, transaction management, and support for CSV file imports, all while being built with modern tools like Clerk, Neon DB, and Drizzle ORM.

## Authentication and User Management

- **Authentication**: The authentication process is handled by **Clerk**, providing secure and seamless user login and registration.
- **User Settings**: Users can update their credentials and account settings directly via Clerk's user management interface.

## Database and ORM

- **Database**: The platform uses **Neon**, a seamless PostgreSQL database, for storing and retrieving data efficiently.
- **ORM**: **Drizzle ORM** is used for interacting with the database, ensuring clean and maintainable code.

## Features

### Dashboard
- After logging in, users can access a **dashboard** to track income and expenses through **interactive charts**.
- **Filters**: Filter data by accounts or a specific date range for a customized view.
- **Category Chart**: View transaction summaries grouped by categories.

### Transactions Page
- Check your **transaction history** in a detailed table displaying key information:
  - **Date**  
  - **Category**  
  - **Payee**  
  - **Amount**  
  - **Associated Account**
- Manage transactions with the following actions:
  - **Add**: Create a new transaction.
  - **Edit**: Update existing transaction details.
  - **Delete**: Remove a single transaction.
  - **Bulk Delete**: Delete multiple transactions at once.
  - **Bulk Create**: Import transactions in bulk using a **CSV file**. Map the columns in the file to specific fields, then save the transactions.

### Accounts and Categories Management
- **Accounts**: Manage your accounts directly within the platform.
- **Categories**: Organize your transactions by managing categories through a dedicated page.

## Conclusion
This platform provides an all-in-one solution for tracking and managing financial transactions, offering robust features and a user-friendly experience. Whether you're looking to keep track of daily expenses or organize bulk transactions, this tool makes it simple and efficient.  