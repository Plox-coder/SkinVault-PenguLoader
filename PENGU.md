# SkinVault

**A League of Legends collection viewer and JSON exporter for Pengu Loader.**

Browse your skins, summoner icons, ward skins and chromas directly in the League Client. Check owned, missing and unverified items, filter your collection, and export a JSON file for **SkinVault Web**.

### Features

- View and search standard LoL skins and ownership status.
- Scan icons, ward skins and chromas (availability depends on the League Client API).
- Check chromas in batches and keep uncertain results marked **Unverified**.
- Export/import SkinVault JSON files and save manual changes locally.
- English interface, with cosmetic names taken from your League Client language.

### Installation

1. Install and enable **Pengu Loader**.
2. Download the **`SkinVault-PenguLoader-v0.4.zip`** asset from the latest GitHub Release.
3. Extract it into Pengu Loader's `plugins` folder so you have `plugins/SkinVault/index.js`.
4. Restart League of Legends and click the **SkinVault** button in the client.

The plugin only makes read-only requests to the League Client. Some cosmetic ownership data may be unavailable or unverified. It does not ask for Riot account credentials.

*Unofficial fan project, not affiliated with Riot Games or Pengu Loader.*
