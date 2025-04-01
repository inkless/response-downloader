# Response Downloader

A tool to capture and save JSON responses from web requests using Playwright. It's particularly useful for capturing API responses from web applications for testing or development purposes.

## Prerequisites

- Node.js
- pnpm or npm
- Playwright

## Installation

1. Install dependencies:

```bash
pnpm install
# or
npm install
```

2. Install Playwright browsers:

```bash
npx playwright install
```

## Setup

1. Create a `.cookie` file in the root directory with your session token:

```
your_session_token_here
```

## Usage

The basic command structure is:

```bash
node index.js --url <required-url> [options]
```

### Required Parameters

- `--url`, `-u`: URL to fetch responses from
  - Required: Yes
  - Example: `--url "https://api.example.com"`

### Optional Parameters

- `--output-dir`, `-o`: Directory where JSON responses will be saved

  - Default: "./json_responses"
  - Example: `--output-dir "./my_responses"`

- `--headless`: Whether to run the browser in headless mode

  - Default: true
  - Example: `--headless false` (to see the browser)

- `--session-name`, `-s`: Name of the session cookie

  - Default: "session"
  - Example: `--session-name "my_session"`

- `--help`: Show help information

### Example Commands

```bash
# Basic usage with required URL
node index.js --url "https://api.example.com"

# Specify custom output directory
node index.js --url "https://api.example.com" --output-dir "./responses"

# Run with visible browser and custom session name
node index.js --url "https://api.example.com" --headless false --session-name "my_session"
```

## How It Works

1. The tool launches a Playwright browser instance
2. Loads your authentication cookie from the `.cookie` file
3. Navigates to the specified URL
4. Captures all JSON responses from the domain
5. Saves responses as individual JSON files in the output directory
6. Waits for 15 seconds to capture async requests
7. Automatically closes the browser

## Output

- JSON responses are saved in the specified output directory
- Filenames are generated from the request URLs (sanitized and truncated)
- JSON is pretty-printed for readability

## Notes

- Only JSON responses (content-type: application/json) are captured
- Only responses from the same domain as the target URL are saved
- The tool requires a valid session token in the `.cookie` file
- The browser stays open for 15 seconds to capture async requests

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
