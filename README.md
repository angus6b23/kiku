<div align = center>
<img src="https://raw.githubusercontent.com/angus6b23/kiku/master/public/icon.svg" width="800" height="300" alt="kiku-logo">
</div>

# Kiku
<div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; margin-left: -0.5rem">
<img alt="GitHub License" src="https://img.shields.io/github/license/angus6b23/kiku">
<img alt="GitHub release (with filter)" src="https://img.shields.io/github/v/release/angus6b23/kiku">
<img alt="Liberapay receiving" src="https://img.shields.io/liberapay/receives/12a.app">
</div>

An electron application for playing music from youtube on desktop. The application supports using [local api](https://github.com/LuanRT/YouTube.js), [invidious](https://github.com/iv-org/invidious) and [piped](https://github.com/TeamPiped/Piped) as source.

**Note: This is a music application. If you want a video client, please see [Freetube](https://github.com/FreeTubeApp/FreeTube)**

**Warning: The application is currently under development and can be unstable in terms of behaviour and performance **

## Screenshots
<div style="display: flex; flex-wrap: wrap; gap: 1rem">
<img src="https://raw.githubusercontent.com/angus6b23/kiku/master/assets-src/screenshot1.png" width="240" height="135" alt="kiku-screenshot" />
<img src="https://raw.githubusercontent.com/angus6b23/kiku/master/assets-src/screenshot2.png" width="240" height="135" alt="kiku-screenshot" />
<img src="https://raw.githubusercontent.com/angus6b23/kiku/master/assets-src/screenshot3.png" width="240" height="135" alt="kiku-screenshot" />
<img src="https://raw.githubusercontent.com/angus6b23/kiku/master/assets-src/screenshot4.png" width="240" height="135" alt="kiku-screenshot" />
<img src="https://raw.githubusercontent.com/angus6b23/kiku/master/assets-src/screenshot5.png" width="240" height="135" alt="kiku-screenshot" />
<img src="https://raw.githubusercontent.com/angus6b23/kiku/master/assets-src/screenshot6.png" width="240" height="135" alt="kiku-screenshot" />
</div>



## Features 

- Select from source you like (Youtube, invidious, piped)
- Automatical fallback to another source when one source failed
- Available on Windows, Mac and Linux thanks to electron
- Translation available

## Installing

Binaries are available in [release](https://github.com/angus6b23/kiku/releases/latest).
- Linux: AppImage, Binary, Flatpak
- Windows: Portable, Install

## Building the application by yourself

1.  Clone the git repository

    `git clone https://github.com/angus6b23/kiku`

2.  Run yarn / npm to install dependencies

	Using yarn
	`yarn`

	Using npm
	`npm install`

3.  Build and package the files

	Using yarn
	`yarn build && yarn package`
	
	Using npm
	`npn run build && npm run package`

4. If the building process is successful, the binaries will be "out" folder

## License

![img](https://www.gnu.org/graphics/gplv3-or-later.svg)

This app is provided under GPL v3.0 or later. For details, please see https://www.gnu.org/licenses/gpl-3.0.en.html
