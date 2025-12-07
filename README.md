# munliwall

A simple yet powerful tool designed to transform your workspace with ease. `munliwall` lets you effortlessly manage your desktop backgrounds — download stunning wallpapers, upload your own creations, or update your setup automatically.

## Installation

### Desktop Application (Linux)

You can download the latest version of the desktop application from the [Releases](https://github.com/munlicode/munliwall/releases) page. We provide support for AppImage, Debian (.deb), and Snap packages.

#### AppImage (Recommended)

1.  Download `munliwall-x.x.x.AppImage`.
2.  Make it executable:
    ```bash
    chmod +x munliwall-x.x.x.AppImage
    ```
3.  Run it:
    ```bash
    ./munliwall-x.x.x.AppImage
    ```

#### Debian Package (.deb)

1.  Download `munliwall-x.x.x.deb`.
2.  Install it using `dpkg`:
    ```bash
    sudo dpkg -i munliwall-x.x.x.deb
    ```
    (Run `sudo apt install -f` if you encounter dependency errors)
3.  Launch "munliwall" from your applications menu.

#### Snap Package

1.  Download `munliwall-x.x.x.snap`.
2.  Install it:
    ```bash
    sudo snap install munliwall-x.x.x.snap --dangerous
    ```
    *(Note: The `--dangerous` flag is required because the package is installed locally and not verified by the Snap Store signature).*

### CLI Tool

The CLI tool allows you to manage wallpapers directly from your terminal.

1.  Download `cli.zip` from the Releases page.
2.  Unzip the archive:
    ```bash
    unzip cli.zip
    ```
3.  Navigate to the `dist` directory.
4.  Run the CLI:
    ```bash
    ./munliwall --help
    ```

**Example Commands:**

*   **Set a random wallpaper:**
    ```bash
    ./munliwall random
    ```
*   **Set a wallpaper from a specific source (e.g., Unsplash):**
    ```bash
    ./munliwall set --source unsplash --query "nature"
    ```
*   **List history:**
    ```bash
    ./munliwall history
    ```

## Development

To build the project locally:

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Build the desktop app:
    ```bash
    pnpm --filter @munlicode/munliwall-desktop run build
    ```

## License

MIT