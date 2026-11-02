<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Rules

- Login and registration are client-side only: accounts live in this browser's localStorage, and the built-in `demo` / `1234` account is always available. Why: the brief asked for a practice app without real accounts; switch to Lovable Cloud logins if real accounts are ever needed.
- All account rules (minimum lengths, duplicate users, password confirmation, wrong password) are enforced in `src/lib/codeplay.ts` and covered by tests in `src/test/codeplay.test.ts`. Why: the game rules per category are the app's teaching contract and must not drift.
