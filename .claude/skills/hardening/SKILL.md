Run a post-feature hardening review on the code I just wrote.

Do the following steps in order:

1. **Test coverage check** — List every public method in new/modified services and hooks. For each one, confirm a test exists covering: happy path, not found / error case, and unauthorized access (wrong clubId or no auth). If any are missing, write the missing tests now.

2. **Security spot-check** — Scan the new code for:
   - Routes missing `@UseGuards(JwtAuthGuard)`
   - Queries missing `clubId` filter
   - User input passed directly to queries without DTO validation
   - Tokens or secrets hardcoded or logged
   Report each issue with file and line. Fix any CRITICAL or HIGH issues immediately.

3. **DRY check** — Look for logic duplicated from existing code in the codebase. If the same pattern exists elsewhere, extract a shared service, utility, or hook. Show what was extracted.

4. **Size check** — List any files touched that exceed 300 lines. For each, propose a concrete extraction (what responsibility to pull out and into which new file).

5. **Lint** — Run `cd server && npm run lint` and report results. Fix any errors.

6. **Tests** — Run `cd server && npm test` and report results. Fix any failures.

7. **Final verdict** — State whether the feature is ready to commit or what remains to be done.
