# Contributing to RVZN

Thank you for your interest in contributing to RVZN! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/rvzn.git
   cd rvzn
   ```
3. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
4. Create a `.env` file with your Supabase credentials
5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Branching Strategy

- `main` - Production branch
- `develop` - Development branch
- Feature branches should be created from `develop` and named as `feature/your-feature-name`
- Bug fixes should be named as `fix/bug-description`

## Pull Request Process

1. Create a new branch from `develop`
2. Make your changes
3. Test your changes locally
4. Push your branch and create a pull request to `develop`
5. Wait for code review and address any feedback

## Code Style

- Follow the existing code style
- Use TypeScript for all new files
- Write meaningful commit messages
- Add comments for complex logic

## Testing

- Test your changes thoroughly before submitting a pull request
- Ensure all existing tests pass

## Documentation

- Update documentation when adding or modifying features
- Keep README.md and other documentation files up to date

## License

By contributing to RVZN, you agree that your contributions will be licensed under the project's [MIT License](LICENSE). 