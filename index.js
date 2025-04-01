const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const yargs = require("yargs");

// Parse command line arguments
const argv = yargs
  .option("url", {
    alias: "u",
    description: "URL to fetch responses from",
    type: "string",
    required: true,
  })
  .option("output-dir", {
    alias: "o",
    description: "Output directory",
    type: "string",
    default: "./json_responses",
  })
  .option("headless", {
    description: "Run in headless mode",
    type: "boolean",
    default: true,
  })
  .option("session-name", {
    alias: "s",
    description: "Session name",
    type: "string",
    default: "session",
  })
  .help().argv;

console.log(`Fetching from ${argv.url}`);

const outputDir = argv["output-dir"];
const headless = argv.headless;
const domain = argv.url.split("/")[2];
const sessionName = argv["session-name"];

// Sanitize filename and truncate
const safeFilename = (url) =>
  url
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 50);

function createAuthCookie(name, value) {
  // Set expiration to 1 hour from now
  const oneHourFromNow = Math.floor(Date.now() / 1000) + 60 * 60;

  return {
    name,
    value,
    domain,
    path: "/",
    expires: oneHourFromNow,
    secure: true,
    httpOnly: true,
    sameSite: "None",
  };
}

(async () => {
  // Load authentication cookie
  const session = fs
    .readFileSync(path.resolve(__dirname, ".cookie"))
    .toString()
    .trim();

  const browser = await chromium.launch({ headless: headless });
  const context = await browser.newContext();
  await context.addCookies([createAuthCookie(sessionName, session)]);

  const page = await context.newPage();

  // Create output directory
  fs.mkdirSync(outputDir, { recursive: true });

  // Response handler for JSON content
  page.on("response", async (response) => {
    try {
      const url = response.url();
      const headers = response.headers();
      const contentType = headers["content-type"] || "";

      if (!url.includes(domain)) {
        return;
      }

      // Filter for JSON responses
      if (!contentType.includes("application/json")) return;

      // Generate filename
      const filename = `${safeFilename(
        url.replace(`https://${domain}/`, "")
      )}.json`;
      const filepath = path.join(outputDir, filename);

      // Get and format response body
      const body = await response.body();
      const jsonBody = JSON.parse(body.toString());

      // Save pretty-printed JSON
      fs.writeFileSync(filepath, JSON.stringify(jsonBody, null, 2));

      console.log(`Saved JSON response: ${filename}`);
    } catch (error) {
      console.error(`Error processing ${url}: ${error.message}`);
    }
  });

  // Navigate to target page
  await page.goto(argv.url);

  // Keep browser open to capture async requests
  await page.waitForTimeout(15000); // Adjust based on needs

  await browser.close();
})();
