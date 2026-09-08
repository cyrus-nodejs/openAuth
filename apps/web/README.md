# **Next.js Starter Project**

This repository is a fully configured starter template for building modern web applications using Next.js 14. It includes essential tools and configurations to streamline
development and ensure code quality.

## **Features**

- **Next.js 14**: Fast and scalable framework with the latest features.
- **TypeScript**: Provides static typing to reduce runtime errors.
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development.
- **Shadcn/UI**: Pre-configured components with accessibility and customization in mind.
- **ESLint**: Linting tool with custom rules for code quality and style enforcement.
- **Husky**: Ensures pre-commit hooks run to maintain code consistency.
- **Lint-Staged**: Runs ESLint checks on staged files before committing.
- **Directory Structure**: Organized with a focus on scalability and maintainability.

---

## **Getting Started**

### **Prerequisites**

Ensure you have the following installed on your system:

- Node.js >= 18.0.0
- npm >= 9.0.0

### **Installation**

1. Clone the repository:
   ```bash
   git clone https://github.com/Sleeky-Programmers/starter-frontend-repo
   ```
2. Navigate to the project directory:
   ```bash
   cd nextjs-starter
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

---

## **Usage**

### **Development Server**

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to view your application.

### **Build**

Build the application for production:

```bash
npm run build
```

### **Linting**

Run linting checks:

```bash
npm run lint
```

### **Pre-Commit Checks**

Husky and lint-staged ensure all staged files pass linting rules before commits.

---

## **Directory Structure**

The project follows a modular and scalable structure:

```
src/
├── app/              # Next.js app directory
├── assets/           # Static assets
├── components/       # Reusable components
├── context/          # React context providers
├── features/         # Feature-specific modules
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and helpers
```

---

## **ESLint Configuration**

Custom rules include:

- **`no-console`**: Warns for `console.log` usage (allows `console.warn` and `console.error`).
- **Boundaries Plugin**: Enforces modular boundaries across the project.

### **Lint-Staged**

Lint-staged ensures only staged files are checked during pre-commit:

```json
{
	"*.ts?(x)": ["eslint --fix"]
}
```

---

### **Add Components**

Use `shadcn` to generate accessible and customizable UI components:

```bash
npx shadcn add button
```

---

## **Contributing**

Contributions are welcome! Please fork the repository and submit a pull request for review.
