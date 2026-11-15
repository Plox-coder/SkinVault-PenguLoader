# SkinVault for Pengu Loader

**SkinVault** is an unofficial League of Legends collection viewer and JSON exporter for [Pengu Loader](https://pengu.dev/). It reads collection information from the running League Client so you can inspect your items and export them to SkinVault Web.

**SkinVault Web:** [Open the collection viewer](https://plox-coder.github.io/SkinVault/)  
**SkinVault Web source code:** [Plox-coder/SkinVault on GitHub](https://github.com/Plox-coder/SkinVault)

## Features

- View standard League of Legends skins and their ownership status (League Classic content is excluded).
- Scan summoner icons, ward skins and chromas, where supported by your League Client version.
- See **Owned**, **Missing** and **Unverified** states. An unverified item is not automatically treated as missing.
- Search and filter your collection.
- Correct skin ownership manually and optionally enter RP reference prices inside the plugin.
- Export a JSON collection file for use in SkinVault Web, or import a previous SkinVault JSON export.
- Keep manual changes locally between sessions.

The plugin interface is in English. Item names are provided by the League Client and may follow your client's language settings.

## Installation

1. Install and enable [Pengu Loader](https://pengu.dev/guide/installation).
2. Open this repository's **Releases** section and download the latest **`SkinVault-PenguLoader-v0.4.zip`** asset. Do not use GitHub's automatically generated "Source code" archives for installation.
3. Extract the ZIP into Pengu Loader's `plugins` directory. The resulting folder structure should be:

   ```text
   Pengu Loader/
   └── plugins/
       └── SkinVault/
           └── index.js
   ```

4. Restart the League Client. A **SkinVault** button should appear in the lower-right corner.

No Node.js, build step or browser extension is needed to install this plugin. The GitHub repository contains the same ready-to-use `SkinVault/index.js` source as the release ZIP.

## Usage

1. Log in to the League Client and open **SkinVault**.
2. Skin ownership is checked once shortly after the plugin loads. Use **Sync skins** to refresh it manually.
3. Click **Scan icons, wards & chromas** to read the other collections.
4. For chromas, click **Scan 30 skins for chromas** repeatedly to check the next batch. Some ownership statuses may remain unverified if the Client API does not provide them.
5. Click **Export JSON** to save `skinvault-collection.json` locally, then open [SkinVault Web](https://plox-coder.github.io/SkinVault/) and import the file to explore your collection.

**Note:** The RP total displayed inside the Pengu Loader plugin uses prices entered in the plugin. The separate SkinVault web app has its own price-reference system.

## Privacy and limitations

- The plugin uses read-only **GET** requests to the League Client's local API. It does not change owned content, make purchases or automate games.
- Manual states and prices are stored locally using Pengu Loader's available storage or browser storage.
- JSON exports can contain your summoner display name and information about items you own. **Do not upload your personal export to a public GitHub repository.**
- Some endpoints and ownership information may differ between League Client versions. Unknown ownership is shown as **Unverified** rather than assumed missing.
- Skin and item data displayed in the plugin comes from your League Client, so names may be localized even though the interface is in English.

## Source

The plugin is a single JavaScript file at `SkinVault/index.js` using Pengu Loader's `export function load()` entry point. No compilation is needed.

## Disclaimer

SkinVault is an unofficial fan project. It is not affiliated with, endorsed by, or sponsored by Riot Games or Pengu Loader. League of Legends and associated assets are the property of Riot Games.
