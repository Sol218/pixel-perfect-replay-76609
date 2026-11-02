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

- Login and registration stay client-side: accounts live in this browser's storage and the built-in `demo` / `1234` account always works. Why: the brief asked for a practice app without real accounts; move to Lovable Cloud logins only if real accounts are requested.
- Account rules (minimum lengths, duplicate users, password confirmation, wrong password) live in `src/lib/codeplay.ts` and are covered by `src/test/codeplay.test.ts`. Why: these rules and the per-category game rules are the app's teaching contract and must not drift silently.
