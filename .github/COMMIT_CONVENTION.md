# Commit Convention

This project follows a simplified [Conventional Commits](https://www.conventionalcommits.org/) format.

## Format

```
<type>(<scope>): <short summary>
```

- **type** – describes the kind of change (see below)
- **scope** – optional, identifies the area affected (e.g. `auth`, `posts`, `client`)
- **short summary** – imperative, present tense, lowercase, no period at the end

## Types

| Type       | When to use                                                  |
|------------|--------------------------------------------------------------|
| `feat`     | A new feature                                                |
| `fix`      | A bug fix                                                    |
| `refactor` | Code change that neither fixes a bug nor adds a feature      |
| `docs`     | Documentation only changes                                   |
| `style`    | Formatting, missing semicolons, whitespace (no logic change) |
| `test`     | Adding or updating tests                                     |
| `chore`    | Build process, dependency updates, tooling                   |
| `perf`     | Performance improvements                                     |
| `ci`       | CI/CD pipeline changes                                       |

## Examples

```
feat(auth): add refresh token endpoint
fix(posts): prevent duplicate likes on rapid click
refactor(routes): centralize route registration in index.js
docs: add setup guide README_SETUP.md
test(user): add unit tests for profile update controller
chore(deps): bump express to 5.2.1
```

## Breaking Changes

Append `!` after the type/scope and add a `BREAKING CHANGE:` footer:

```
feat(api)!: rename /auth/signup to /auth/register

BREAKING CHANGE: The /auth/signup endpoint has been removed.
```
