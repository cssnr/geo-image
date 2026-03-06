# Contributing

- [Development](#development)
- [Building](#building)
- [References](#references)

> [!WARNING]  
> This guide is not complete and just the bare minimum.

## Development

Install dependencies:

```shell
npm i
```

### Chrome

```shell
npm run dev
```

Open Chrome and navigate to `chrome://extensions/`, enable "Developer mode",
and load the unpacked extension from the `dist` directory.

This uses HMR including extension reloads.

### Firefox

```shell
npm run dev:ff
```

Open Firefox and navigate to `about:debugging#/runtime/this-firefox`, then click "Load Temporary Add-on..."
and load the unpacked extension from the `dist` directory.

This requires refreshing the page and reloading the extension when required.

### Android

This requires the [Android Debug Bridge (adb)](https://developer.android.com/tools/adb).

In another terminal (or without the watcher run `npm build:firefox`).

```shell
npm run dev:ff
```

Enable USB or Wireless Debugging and get your device `name`.

```shell
adb devices
```

Then run using your device `name`.

```shell
npm run android -- name
```

Or run directly w/o the --firefox-apk flag from the script.

```shell
web-ext run -t firefox-android -s dist --adb-device name
```

## Building

To create all archives in the `web-ext-artifacts` directory.

```shell
npm run build:all
```

### Chrome

To build the `dist` directory.

```shell
npm run build
```

To build and create an archive in the `web-ext-artifacts` directory.

```shell
npm run build:chrome
```

### Firefox

To build the `dist` directory.

```shell
npm run build -- --mode firefox
```

To build and create an archive in the `web-ext-artifacts` directory.

```shell
npm run build:firefox
```

## References

- [Vue 3 Documentation](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)
