# Deploy cheat engine core script

## Usage

```sh
python main.py --version 1.0.4
```

## Build output path

`{repository_root}/deploy/output`

The build creates ZIP archives for both engines. The MZ archive intentionally
does not include `js/main.js`; users must add `"cheat/init/import.js"` to the
existing `scriptUrls` list so the game's engine bootstrap is preserved.
