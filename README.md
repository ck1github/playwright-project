# Enterprise QA Automation Framework (Playwright + TypeScript)

A production-ready test automation framework engineered for enterprise UI and REST API automation, featuring the Page Object Model (POM), Playwright `APIRequestContext`, single-worker stability, deterministic AI-assisted test design, and automated CI/CD pipelines (GitHub Actions & Jenkins).

---

## 🌟 Key Features

- **Modern Architecture**: Written in strict TypeScript with ES2022 module resolution.
- **UI Automation (POM)**: Resilient Page Object Model targeting SauceDemo with accessible locators (`getByRole`, `getByPlaceholder`, `data-test` fallback) and Playwright auto-waiting (no arbitrary sleeps).
- **REST API Automation**: Built-in `ApiClient` wrapping Playwright's `APIRequestContext` for CRUD operations, header handling, response parsing, and a lightweight runtime schema validation helper.
- **AI-Assisted Test Design**: Provider-neutral adapter (`ITestDesignAdapter`) capable of generating structured test proposals (titles, preconditions, steps, expected results, priority, and tags) from functional requirements using a deterministic mock engine without requiring external API keys.
- **CI/CD Integration**: Ready-to-run GitHub Actions workflow with artifact archiving, plus a cross-platform Jenkins Declarative Pipeline.
- **Reporting & Diagnostics**: Rich Playwright HTML reports, automatic failure screenshot capture, trace file generation (`trace: 'retain-on-failure'`), and video recording on retry.
- **Code Quality**: Strict TypeScript compiler checks (`tsc --noEmit`), ESLint flat configuration, and Prettier code formatting.

---

## 📁 Project Structure

```text
qa-automation-framework/
├── .github/
│   └── workflows/
│       └── playwright.yml            # GitHub Actions CI workflow
├── src/
│   ├── ai/
│   │   └── testDesignAdapter.ts      # AI-assisted test design adapter & validator
│   ├── fixtures/
│   │   └── testFixtures.ts           # Extended Playwright test fixture (loginPage, apiClient)
│   ├── pages/
│   │   └── LoginPage.ts              # Page Object Model for SauceDemo authentication
│   └── utils/
│       ├── apiClient.ts              # REST API client wrapper & schema assertion helper
│       └── env.ts                    # Typed environment variables and defaults
├── tests/
│   ├── api/
│   │   └── users-api.spec.ts         # REST API test suite (GET, POST, 404 negative)
│   ├── integration/
│   │   └── login-api.integration.spec.ts # AI adapter & cross-tier test suite
│   ├── ui/
│   │   └── login.spec.ts             # SauceDemo UI authentication test suite
│   └── legacy/                       # Preserved pre-existing user tests
├── test-data/
│   └── users.json                    # Centralized test data for UI and API tests
├── playwright-report/                # Self-contained HTML report (git-ignored)
├── test-results/                     # Traces, screenshots, failure videos (git-ignored)
├── .env.example                      # Environment variables template
├── .env                              # Local environment configuration (git-ignored)
├── .gitignore                        # Git ignore protecting secrets & build artifacts
├── .prettierrc.json                  # Prettier formatting rules
├── eslint.config.js                  # ESLint flat config
├── Jenkinsfile                       # Jenkins declarative pipeline script
├── package.json                      # Project scripts and dependencies
├── playwright.config.ts              # Playwright test configuration
├── tsconfig.json                     # TypeScript strict configuration
└── README.md                         # Framework documentation
```

---

## 🛠️ Prerequisites

- **Node.js**: v18+ LTS (Tested on v24.11.1)
- **npm**: v9+ (Tested on v11.6.4)
- **Git**: Installed and available in PATH
- **Operating System**: Windows, macOS, or Linux

---

## 🚀 Installation & Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd playwright-project
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Install Playwright Chromium browser**:

   ```bash
   npx playwright install chromium
   ```

4. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env   # On Windows PowerShell: Copy-Item .env.example .env
   ```
   Default values are pre-configured for public demo endpoints:
   - `BASE_URL=https://www.saucedemo.com`
   - `API_BASE_URL=https://jsonplaceholder.typicode.com`
   - `SAUCE_USERNAME=standard_user`
   - `SAUCE_PASSWORD=secret_sauce`
   - `SAUCE_LOCKED_USERNAME=locked_out_user`
   - `HEADLESS=true`
   - `AI_PROVIDER=mock`

---

## 🧪 Running Tests

| Command                    | Description                                           |
| :------------------------- | :---------------------------------------------------- |
| `npm run test`             | Executes the complete test suite                      |
| `npm run test:ui`          | Runs UI tests (`tests/ui/login.spec.ts`)              |
| `npm run test:api`         | Runs REST API tests (`tests/api/users-api.spec.ts`)   |
| `npm run test:integration` | Runs Integration & AI tests (`tests/integration/`)    |
| `npm run test:smoke`       | Runs tests tagged with `@smoke`                       |
| `npm run test:regression`  | Runs tests tagged with `@regression`                  |
| `npm run test:headed`      | Runs tests in headed browser mode (visible browser)   |
| `npm run test:debug`       | Opens Playwright Inspector for step-by-step debugging |
| `npm run report`           | Serves the generated Playwright HTML test report      |
| `npm run typecheck`        | Validates TypeScript types across the codebase        |
| `npm run lint`             | Lints files using ESLint                              |
| `npm run format`           | Auto-formats code with Prettier                       |

---

## 🔍 Debugging & Diagnostic Failure Analysis

### 1. Interactive Step-by-Step Debugging

Run tests in Playwright's visual inspector:

```bash
npm run test:debug
```

Or debug a specific test file:

```bash
npx playwright test tests/ui/login.spec.ts --debug
```

### 2. Trace Viewer

When a test fails, Playwright automatically records a trace package (`trace.zip`) inside `test-results/`.
Inspect execution timeline, DOM snapshots, network calls, and console logs:

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

### 3. Viewing the HTML Report

```bash
npm run report
```

The report displays test execution duration, step hierarchy, failure logs, and attached screenshots.

---

## 🌐 API Testing Architecture & Schema Validation

The framework uses `ApiClient` wrapping Playwright's `APIRequestContext`.

### Mock API Notice

REST API tests target [JSONPlaceholder](https://jsonplaceholder.typicode.com). JSONPlaceholder is a mock REST API server:

- `POST /posts` responds with `201 Created` and an assigned ID (`101`), but mutations are **not** persisted to an underlying database.
- Idempotency and status code verification are used to ensure stable test isolation without state pollution.

### Schema Assertion Example

```typescript
ApiClient.assertSchema<UserDto>(response.data, {
  id: 'number',
  name: 'string',
  username: 'string',
  email: 'string',
});
```

---

## 🤖 AI-Assisted Test Design Adapter

Located at [src/ai/testDesignAdapter.ts](file:///d:/playwright-project/src/ai/testDesignAdapter.ts).

### Design Pattern

- **Provider-Neutral Interface**: `ITestDesignAdapter` accepts a requirement string and produces structured test proposals conforming to `TestCaseProposal`.
- **Zero-Key Deterministic Mock**: Out of the box, `MockTestDesignAdapter` deterministically synthesizes functional, negative, and contract tests for authentication and REST APIs without external API tokens.
- **Enterprise Extensibility**: Real LLM endpoints (e.g. OpenAI, Anthropic, or internal enterprise gateways) can be connected by setting `AI_PROVIDER=openai` and `AI_API_KEY=...` in `.env` without modifying existing test specifications.
- **Contract Verification**: Includes `validateTestCaseStructure()` to guarantee required fields (`title`, `steps`, `expectedResults`, `riskPriority`) exist before passing proposals to Jira, TestRail, or automated specs.

---

## 🔄 CI/CD Pipelines

### 1. GitHub Actions (`.github/workflows/playwright.yml`)

- Triggered on `push` and `pull_request` to `main`/`master`.
- Uses Ubuntu runner with Node.js 22 LTS.
- Runs ESLint linting, TypeScript type checking, and tests in a single worker.
- Uploads `playwright-report/` on every run (pass or fail) and `test-results/` on failure.

### 2. Jenkins Declarative Pipeline (`Jenkinsfile`)

- **Required Plugins**:
  - `NodeJS Plugin` (configured with `NodeJS-22` under Global Tool Configuration)
  - `HTML Publisher Plugin` (publishes `playwright-report/index.html`)
  - `Pipeline: Stage View`
- **Stages**:
  1. `Checkout`: Pulls Git repository.
  2. `Install Dependencies`: `npm ci || npm install`.
  3. `Install Playwright Browsers`: `npx playwright install --with-deps chromium`.
  4. `Code Quality`: Parallel execution of `npm run lint` and `npm run typecheck`.
  5. `Execute Playwright Tests`: `npm run test:all`.
  6. `Post Actions`: Publishes HTML report and archives failure artifacts.

---

## 🔒 Security & Best Practices

- **Zero Hardcoded Secrets**: Credentials and URLs are read through [src/utils/env.ts](file:///d:/playwright-project/src/utils/env.ts) backed by `.env`.
- **Git Hygiene**: `.gitignore` strictly blocks `.env`, `node_modules/`, `test-results/`, and `playwright-report/`.
- **Low Memory Footprint**: Configured with `workers: 1` by default to prevent thread thrashing and memory exhaustion on developer laptops and resource-constrained CI runners.

---

## ➕ Extending the Framework

1. **Add a New Page Object**:
   Create `src/pages/<Feature>Page.ts` extending `Page` interactions with accessible locators.
2. **Register in Fixtures**:
   Add the new Page Object to `src/fixtures/testFixtures.ts`.
3. **Add Test Data**:
   Add test datasets into `test-data/<feature>.json`.
4. **Create Test Spec**:
   Create `tests/ui/<feature>.spec.ts` or `tests/api/<endpoint>.spec.ts`, tagging tests with `@smoke` or `@regression`.
