import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { holdLocalDatabase } from "./source/database/local/hold.ts"

// The server runs in Node, in the dev server and in a build alike
// (source/node.ts)
export default defineConfig({
    resolve: { tsconfigPaths: true },
    // Start builds into subfolders of this (output/client, output/server).
    build: { outDir: "output" },
    // The prerender (below) fetches every page from a Vite preview server
    // it starts with this config, in the build's own process. On
    // localhost, that server listens on ::1 alone, while fetch gives ::1
    // 250 ms and then tries 127.0.0.1, where nothing listens. So when
    // rendering other pages holds the event loop longer, the build fails
    // with `fetch failed` (ETIMEDOUT ::1, ECONNREFUSED 127.0.0.1). An
    // address leaves nothing to race. Nothing else uses Vite's preview:
    // `pnpm preview` runs source/node.ts.
    preview: { host: "127.0.0.1" },
    plugins: [
        tailwindcss(),
        tanstackStart({
            srcDirectory: "source",
            // The website lives in source/frontend; source/server.ts (the
            // server's entry) stays at the top, next to backend/ and
            // database/.
            router: {
                entry: "frontend/router",
                routesDirectory: "frontend/routes",
                generatedRouteTree: "frontend/routeTree.gen.ts"
            },
            // Every page is written out as HTML at build time, found by
            // following links from the home page, but the dashboard, which
            // is drawn in the browser for whoever's signed in. Only /api,
            // the dashboard and anything that isn't a page run on request
            // (source/server.ts).
            prerender: {
                enabled: true,
                crawlLinks: true,
                filter: ({ path }) =>
                    path !== "/dashboard" && !path.startsWith("/dashboard/")
            },
            // And /sign-in, whatever links to it: the email's link lands
            // there, so it's a page even once the home page doesn't link it
            pages: [{ path: "/sign-in" }]
        }),
        viteReact(),
        // A running dev server counts as using this checkout's Postgres, so
        // its idle watch doesn't stop it under one
        // (source/database/local/hold.ts)
        holdLocalDatabase()
    ]
})
