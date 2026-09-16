/*
 * CSS files are resolved by Vite at build time and ship no type declarations of
 * their own. Without this, TypeScript reports TS2307 ("Cannot find module …")
 * for every side-effect CSS import (`import './x.css'`) once
 * `noUncheckedSideEffectImports` is enabled — as editors commonly do.
 *
 * The Studio has no equivalent of Astro's `astro/client` reference, which is
 * what declares these on the web side.
 */
declare module '*.css'
