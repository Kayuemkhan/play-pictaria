import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const stillFrames = process.argv.slice(2).filter((a) => /^\d+$/.test(a)).map(Number);

const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});

const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: {
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({
  serveUrl: bundled,
  id: "main",
  puppeteerInstance: browser,
});

if (stillFrames.length) {
  for (const f of stillFrames) {
    await renderStill({
      composition,
      serveUrl: bundled,
      output: `/tmp/frames/frame-${f}.png`,
      frame: f,
      puppeteerInstance: browser,
      overwrite: true,
    });
    console.log("still", f);
  }
} else {
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: "/mnt/documents/pictaria-launch-22s-v2.mp4",
    puppeteerInstance: browser,
    muted: true,
    concurrency: 1,
  });
  console.log("rendered");
}

await browser.close({ silent: false });
