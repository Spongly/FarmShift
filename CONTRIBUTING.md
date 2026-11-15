# Contributing to FarmShift

Thank you for your interest in contributing to **FarmShift**! We welcome contributions from software engineers, agronomists, remote sensing researchers, students, and open-source enthusiasts.

## Code of Conduct

By participating in this project, you agree to uphold a welcoming, respectful, and collaborative environment. Please treat all contributors with kindness and constructive feedback.

## How Can You Contribute?

1. **Reporting Bugs:** Check the [GitHub Issues](https://github.com/Spongly/farmshift/issues) to ensure the issue hasn't been reported. Include details on reproduction steps, browser version, and console logs.
2. **Improving Data Models:** Enhance crop physiological thresholds, expanding beyond the initial 14 Nepalese crops (`src/data/cropData.ts`).
3. **Refining NASA Integrations:** Improve caching, temporal range handling, or visualization layers for GIBS / POWER endpoints (`src/services/`).
4. **Translations:** Help expand or polish English and Nepali terminology in `src/data/translations.ts`.
5. **Documentation:** Clarify setup instructions, methodology write-ups, or add examples.

## Development Workflow

### Prerequisites
- Node.js `v18+` or `v20+` (LTS recommended)
- `npm` v9+

### Setup
```bash
git clone https://github.com/Spongly/farmshift.git
cd farmshift
npm install
```

### Running Locally
```bash
npm run dev
```

### Validation & Quality Assurance
Before submitting a pull request, ensure all checks pass:

```bash
# Type check TypeScript
npm run type-check

# Run automated tests
npm test

# Lint files
npm run lint

# Verify production build
npm run build
```

## Pull Request Guidelines

- Branch naming: `feature/<feature-name>`, `fix/<bug-name>`, or `docs/<description>`.
- Keep commits clear, focused, and descriptive.
- Ensure all tests and TypeScript checks pass.
- Write or update tests in `tests/` when modifying logic or engines.
- Provide a clear PR description explaining what was changed and why.

Thank you for helping empower farmers with transparent climate intelligence!
