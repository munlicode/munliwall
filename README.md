# munliwall

A simple yet powerful tool designed to transform your workspace with ease. `munliwall` lets you effortlessly manage your desktop backgrounds — download stunning wallpapers, upload your own creations, or update your setup automatically.

## Demo


https://github.com/user-attachments/assets/1b2c2b4d-b964-44dc-b12e-b056c7c07cea



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
    _(Note: The `--dangerous` flag is required because the package is installed locally and not verified by the Snap Store signature)._

### CLI Tool

The CLI tool allows you to manage wallpapers directly from your terminal.

1.  **Download `cli.zip`** from the [Releases](https://github.com/munlicode/munliwall/releases) page.
2.  **Unzip the archive**:
    ```bash
    unzip cli.zip
    ```
    This will extract the executable binaries directly into your current directory. You will find files like `munliwall-cli-linux`, `munliwall-cli-macos`, and `munliwall-cli-win.exe`.
3.  **Make Executable (Linux/macOS)**:
    ```bash
    chmod +x munliwall-cli-linux # or munliwall-cli-macos
    ```
4.  **Run It**:
    ```bash
    ./munliwall-cli-linux --help # or the relevant binary for your OS
    ```

#### For Convenience (Optional)

To make the CLI tool easier to use from any directory, you can rename the binary and move it to a directory included in your system's `PATH` (e.g., `/usr/local/bin` on Linux/macOS):

```bash
# Rename the binary
mv munliwall-cli-linux munliwall # Replace with your OS's binary name if not Linux

# Move to a directory in your PATH (requires administrator/root privileges)
sudo mv munliwall /usr/local/bin/
```

Now you can simply type `munliwall` in any terminal to run the CLI:

```bash
munliwall --help
```

**Example Commands:**

- **Set a random wallpaper:**
  ```bash
  munliwall random
  ```
- **Set a wallpaper from a specific source (e.g., Unsplash):**
  ```bash
  munliwall set --source unsplash --query "nature"
  ```
- **List history:**
  ```bash
  munliwall history
  ```

## Updating

To update `munliwall` to the latest version, simply download the new release and install it. **Your data and settings will be preserved.**

- **AppImage:** Download the new AppImage and make it executable. **Cleanup:** You can safely delete the old `.AppImage` file to free up disk space. Your data is stored separately in your configuration folder and will not be lost.
- **Debian (.deb):** Install the new `.deb` package: `sudo dpkg -i munliwall-x.x.x.deb`. The system automatically replaces the old version, so no manual cleanup is required.
- **Snap:** Install the new `.snap` package: `sudo snap install munliwall-x.x.x.snap --dangerous`. This upgrades the existing installation automatically.

All user data is stored in your system's configuration folder (typically `~/.config/munliwall`) and remains safe during updates.

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
