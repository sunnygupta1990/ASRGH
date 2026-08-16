# Navigation persistence change

The application previously stored navigation only in React memory, so a full browser refresh reset the public page and admin portal state.

Navigation state is now centralized in `src/utils/navigation.ts` and synchronized with the browser URL hash from `AppContext`. This preserves the current public page, selected entity, admin portal visibility, and admin tab across refreshes without adding page-specific logic or a routing dependency.

The existing API cache fix (`cache: 'no-store'`) is retained.

Run `npm run build` before deployment.
