# Setup Chrome for ARM64

A comprehensive GitHub Action that installs and configures Google Chrome for ARM64 architecture with CI/CD optimizations. This action provides the same functionality as `browser-actions/setup-chrome` but with full ARM64 compatibility.

## Features

- ✅ **ARM64 Native Support**: Installs Chrome directly from Google's ARM64 repositories
- 🔧 **CI/CD Optimized**: Pre-configured Chrome flags for headless testing
- 🎯 **Multiple Chrome Channels**: Supports stable, beta, and dev channels
- 🚗 **Optional ChromeDriver**: Includes ChromeDriver installation with version matching
- 🌐 **Tool Integration**: Compatible with Puppeteer, Playwright, and Lighthouse CI
- ⚡ **Performance Optimized**: CI wrapper with optimized flags for faster execution

## Usage

### Basic Usage

```yaml
- name: Setup Chrome ARM64
  uses: ./.github/actions/setup-chrome-arm64
```

### Advanced Configuration

```yaml
- name: Setup Chrome ARM64 with ChromeDriver
  uses: ./.github/actions/setup-chrome-arm64
  with:
    chrome-version: 'stable'
    install-chromedriver: 'true'
```

## Inputs

| Input | Description | Required | Default |
|-------|-------------|----------|---------|
| `chrome-version` | Chrome version to install (`stable`, `beta`, `dev`) | No | `stable` |
| `install-chromedriver` | Whether to install ChromeDriver | No | `false` |

## Outputs

| Output | Description |
|--------|-------------|
| `chrome-path` | Path to Chrome executable |
| `chrome-version` | Installed Chrome version |
| `chromedriver-path` | Path to ChromeDriver executable (if installed) |

## Environment Variables Set

The action sets these environment variables for compatibility with various tools:

- `CHROME_BIN` - Chrome executable path
- `PUPPETEER_EXECUTABLE_PATH` - For Puppeteer integration
- `CHROME_PATH` - Generic Chrome path
- `CHROMIUM_PATH` - Alternative Chrome path
- `LHCI_CHROME_PATH` - For Lighthouse CI
- `CHROMEDRIVER_PATH` - ChromeDriver path (if installed)

## CI/CD Optimizations

This action creates a CI-optimized Chrome wrapper at `/usr/local/bin/chrome-ci` with these flags:

- `--no-sandbox` - Disables sandboxing for CI environments
- `--disable-setuid-sandbox` - Disables setuid sandbox
- `--disable-dev-shm-usage` - Prevents /dev/shm issues
- `--headless=new` - Uses new headless mode
- `--disable-gpu` - Disables GPU acceleration
- `--disable-extensions` - Disables extensions
- `--no-first-run` - Skips first run experience
- And many more CI-specific optimizations...

## Tool Integration Examples

### Puppeteer

```yaml
- name: Setup Chrome ARM64
  uses: ./.github/actions/setup-chrome-arm64

- name: Run Puppeteer Tests
  run: |
    # Puppeteer will automatically use PUPPETEER_EXECUTABLE_PATH
    npm test
```

### Lighthouse CI

```yaml
- name: Setup Chrome ARM64
  uses: ./.github/actions/setup-chrome-arm64

- name: Run Lighthouse CI
  run: |
    # Lighthouse CI will use LHCI_CHROME_PATH
    lhci autorun --collect.url="https://example.com"
```

### Playwright

```yaml
- name: Setup Chrome ARM64
  uses: ./.github/actions/setup-chrome-arm64

- name: Run Playwright Tests
  run: |
    # Use Chrome path in Playwright config
    CHROME_PATH="${{ steps.chrome.outputs.chrome-path }}" npx playwright test
```

## Architecture Compatibility

- ✅ **ubuntu-24.04-arm** (Recommended)
- ✅ **ubuntu-22.04-arm** 
- ✅ **ubuntu-20.04-arm**
- ❌ **AMD64/x86_64** (Use `browser-actions/setup-chrome` instead)

## Troubleshooting

### Chrome Installation Failed

If Chrome installation fails, check:
1. Runner architecture is ARM64
2. Network connectivity to Google repositories
3. Required system dependencies are available

### ChromeDriver Compatibility

ChromeDriver ARM64 binaries may not always be available. The action includes fallback mechanisms:
1. First tries to get ARM64 ChromeDriver
2. Falls back to x64 version with QEMU emulation
3. Installs emulation dependencies automatically

### Puppeteer Integration

If Puppeteer doesn't detect Chrome automatically:

```javascript
const browser = await puppeteer.launch({
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
});
```

## Comparison with browser-actions/setup-chrome

| Feature | browser-actions/setup-chrome | setup-chrome-arm64 |
|---------|------------------------------|---------------------|
| ARM64 Support | ❌ | ✅ |
| AMD64 Support | ✅ | ❌ |
| Chrome Channels | ✅ | ✅ |
| ChromeDriver | ✅ | ✅ |
| CI Optimizations | ✅ | ✅ |
| Tool Integration | ✅ | ✅ |

## Contributing

This action is part of the Resume-as-Code project. For issues or improvements, please open an issue in the main repository.

## License

MIT License - see the main project license for details.