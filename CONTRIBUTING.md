# Contributing to Sage Design Tokens

We love contributions, so thanks for choosing to get involved with the Sage Design Tokens project.

## Contents

- [Setting up dev environment](#setting-up-dev-environment)
- [Codebase Overview](#codebase-overview)
- [Adding or Modifying Tokens](#adding-or-modifying-tokens)
- [Testing](#testing)
- [Semantic Versioning](#semantic-versioning)
- [GPG Signing Commits](#gpg-signing-commits)
- [Git commit messages](#git-commit-messages)
- [Raising a Pull Request](#raising-a-pull-request)
- [Contributor License Agreement (CLA)](#contributor-license-agreement-cla)
- [Have a question?](#have-a-question)

## Setting up dev environment

### Prerequisites

- Node.js (check `.nvmrc` for the recommended version)
- npm >=v11.9

### Getting started

1. Clone the repository:
```bash
git clone https://github.com/Sage/design-tokens.git
cd design-tokens
```

2. Install dependencies:
```bash
npm install
```

3. Verify your setup by building the project:
```bash
npm run build
```

If the build succeeds, you're ready to start contributing!

## Codebase Overview

### Repository structure

```
design-tokens/
├── assets/                  # Static assets (fonts, etc.)
├── data/tokens/             # Source token definitions
│   ├── $metadata.json       # Token metadata configuration
│   ├── $themes.json         # Theme configuration and structure
│   ├── core.json            # Core token definitions
│   ├── components/          # Component-specific token definitions
│   ├── global/              # Global token definitions (brand, spacing, etc.)
│   └── mode/                # Mode-specific tokens (colours, typography, etc.)
├── dist/                    # Generated token outputs (CSS, SCSS, JS, JSON)
├── docs/                    # Documentation
├── scripts/                 # Build and utility scripts
├── tests/                   # Test files
├── package.json             # Project dependencies and scripts
└── vitest.config.ts         # Test configuration
```

### Token organisation

The project uses [Amazon Style Dictionary](https://styledictionary.com/) to transform token definitions into multiple output formats. Our tokens are compliant with the [Design Tokens Community Group Specification](https://design-tokens.github.io/community-group/format/) format.

Tokens are organised hierarchically by component and theme. For example:

```json
{
  "container": {
    "standard": {
      "inverse": {
        "bg-alt": {
          "$type": "color",
          "$value": "{mode.color.generic.bg.inverse.delicate}"
        }
      }
    }
  }
}
```

This generates tokens like:
- CSS: `--container-standard-inverse-bg-alt`
- SCSS: `$container-standard-inverse-bg-alt`
- JS: `container.standardInverse.bgAlt` (camelCase)

## Adding or Modifying Tokens

**Do not manually edit the token data files** — they are owned by the Design System team. If you need new tokens or need to modify existing tokens, please contact the Design System team at **Design.System@sage.com** and they will make the change via the TokenStudio plugin.

Once the Design System team has updated the tokens, the changes will be automatically reflected in this repository through the standard token generation process.

## Testing

### Running tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run a specific test file
npm test -- tests/components-tokens.test.ts
```

### Running linters

The project uses linters to validate code quality and formatting:

```bash
# Run linting checks
npm run stylelint:dist
```

These checks will also run in CI/CD, so it's good to run them locally to catch issues early.

### What tests validate

The test suite ensures consistency across all output formats:

1. **Token count**: Each format contains the same number of tokens
2. **Token values**: Values match exactly across CSS, SCSS, JS, and JSON outputs
3. **Naming consistency**: Token names convert correctly between formats (kebab-case to camelCase)
4. **Build output**: All tokens defined in source files are present in generated outputs

## Semantic Versioning

Design Tokens uses [semantic versioning](https://semver.org/) - we release major versions for breaking changes, minor versions for new features or non-essential changes, and patch versions for critical bugfixes.

We automate our release process by standardizing our git commit messages using the [`conventional-commits`](https://www.conventionalcommits.org/) format and the [`semantic-release`](https://www.npmjs.com/package/semantic-release) package, which uses commit messages to determine the next version number, generate release notes, and publish a new version.

## GPG Signing Commits

We recommend signing your commits with GPG to verify your identity and ensure the integrity of contributions. While not currently required, signing commits is a best practice that helps maintain the security and authenticity of the project history.

### Setting up GPG signing

#### 1. Generate a GPG key (if you don't have one)

```bash
gpg --full-generate-key
```

Follow the prompts to:
- Select key type: `RSA and RSA` (default)
- Set key size: `4096` bits (recommended)
- Set expiration: `1 year` or your preference
- Enter your name and email (should match your Git config)

#### 2. Get your GPG key ID

```bash
gpg --list-secret-keys --keyid-format=long
```

Look for the line with `sec` and copy the key ID (the part after `rsa4096/`).

#### 3. Configure Git to use your GPG key

```bash
git config user.signingkey <YOUR_KEY_ID>
git config commit.gpgSign true
```

To set this globally for all repositories:

```bash
git config --global user.signingkey <YOUR_KEY_ID>
git config --global commit.gpgSign true
```

#### 4. Add your public key to GitHub

```bash
gpg --armor --export <YOUR_KEY_ID>
```

Copy the output and add it to your [GitHub GPG keys settings](https://github.com/settings/keys).

### Signing commits

Once configured, commits will be automatically signed. If you've enabled `commit.gpgSign`, every commit will be signed by default.

To manually sign an individual commit (if not globally enabled):

```bash
git commit -S -m "your commit message"
```

Verify your commits are signed:

```bash
git log --show-signature
```

### Troubleshooting GPG signing

**"No secret key" error**: Ensure your GPG key ID is correctly configured and matches your Git email.

**"gpg: failed to sign the data"**: Make sure GPG is properly installed and your key is accessible:

```bash
gpg --list-secret-keys
```

**Git can't find gpg**: Install GPG and ensure it's in your PATH, or specify the GPG program:

```bash
git config gpg.program /usr/bin/gpg
```

## Git commit messages

Following the [`conventional-commits`](https://www.conventionalcommits.org/) format, all commit messages should be structured as below.

```none
<type>([optional scope]): <description>
<BLANK LINE>
[optional body]
<BLANK LINE>
[optional footer]
```

Design Tokens accepts the following commit types, shown with the corresponding release that is generated using `semantic-release`:

| Type        | Description                                                                                                 | Release Type |
| ----------- | ----------------------------------------------------------------------------------------------------------- | ------------ |
| `feat:`     | Introduce a new token or token category                                                                     | minor        |
| `fix:`      | A bug fix (e.g., correcting a token value)                                                                  | patch        |
| `docs:`     | Documentation only changes                                                                                  | :x:          |
| `style:`    | Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)      | :x:          |
| `refactor:` | A code change that neither fixes a bug nor adds a feature                                                   | :x:          |
| `perf:`     | A code change that improves performance                                                                    | patch        |
| `test:`     | Adding missing tests or correcting existing tests                                                           | :x:          |
| `build:`    | Changes that affect the build system or external dependencies                                               | :x:          |
| `ci:`       | Changes to CI configuration files and scripts                                                               | :x:          |
| `chore:`    | Other changes that don't modify token definitions or test files                                             | :x:          |
| `revert:`   | Reverts a previous commit                                                                                   | patch        |

### Denoting a breaking change

Any of the types in the previous table can trigger a **major** release by including `BREAKING CHANGE:` in the commit footer, or appending a `!` after the type/scope.

Examples of breaking changes:
- Renaming or removing existing tokens
- Changing token type or structure in a way that breaks consuming applications
- Removing token categories or themes

## Raising a Pull Request

We accept two standard workflows for raised pull requests:

- **Feature branch** workflow - for internal Sage contributors with access rights to the repository. Features should be developed in a branch off `master` and a pull request raised to merge back into `master`.
- **Forking** workflow - for third-party contributors outside Sage. You should fork the repository and make your changes there, then raise a pull request to merge back into Design Tokens `master` branch.

### Before you submit

Ensure the following are complete before submitting your PR:

1. **Build, lint, and test locally**: Run the full check suite to catch issues early:
   ```bash
   npm run build
   npm run stylelint:dist
   npm test
   ```
   Verify all checks pass before pushing your changes.

2. **Commit messages**: Follow the [conventional commits format](#git-commit-messages)

3. **PR description**: Clearly describe what tokens were added/modified and why

4. **No unrelated changes**: Keep your PR focused on a single feature or fix

### Review process

Pull requests will be reviewed by both the development team and design team. This ensures:
- Token definitions are correct and follow design standards
- Code quality and consistency are maintained
- All output formats are properly generated

## Contributor License Agreement (CLA)

For contributors external to Sage, we require a CLA to be signed before we can accept your pull request. Please find links to the relevant documents below:

- [Individual CLA](https://github.com/Sage/design-tokens/blob/master/cla/SAGE-CLA.docx)
- [Corporate CLA](https://github.com/Sage/design-tokens/blob/master/cla/SAGE-CCLA.docx)

## Have a question?

- Internal **Sage** contributors are invited to post in our Slack channel.
- External contributors are invited to use our [GitHub Issues](https://github.com/sage/design-tokens/issues) page.

We're here to help, so don't hesitate to ask if you're unsure about anything!