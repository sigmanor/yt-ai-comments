# [1.9.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.8.0...v1.9.0) (2026-05-16)


### Bug Fixes

* **ci:** repair release workflow token handling ([de4ea2f](https://github.com/Sigmanor/yt-ai-comments/commit/de4ea2faaa50901ff9fdcc02faf087d5297987f9))
* **settings:** surface missing api key warnings ([ebc9285](https://github.com/Sigmanor/yt-ai-comments/commit/ebc9285e9e0075403c9b6161a956aefd6be44d58))


### Features

* **comments:** add selectable generated variants ([29be40a](https://github.com/Sigmanor/yt-ai-comments/commit/29be40aba6dc15dd7788592247ecc4e4ebb72ea3))
* **options:** allow temperature values up to 2.0 ([67f11e3](https://github.com/Sigmanor/yt-ai-comments/commit/67f11e3df1c9bfe395a3a6017b7f6f982de78343))

# [1.8.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.7.1...v1.8.0) (2025-11-03)


### Features

* **content:** add browser language detection and update default prompt ([cf4b18f](https://github.com/Sigmanor/yt-ai-comments/commit/cf4b18f7861eac5121472b133620479c64294243))
* **options:** increase temperature range to allow more creativity ([bc1091e](https://github.com/Sigmanor/yt-ai-comments/commit/bc1091eb2fcdd97166df7562e92bb7105010755b))
* **options:** update default language detection and prompt template ([203cfc3](https://github.com/Sigmanor/yt-ai-comments/commit/203cfc3dc911c9c447c70be5dc9eb0daca47113a))
* **popup:** add browser language detection and update title with version link ([3bc617d](https://github.com/Sigmanor/yt-ai-comments/commit/3bc617dd133c2ee6779eccaf03f979b9b27c221d))

## [1.7.1](https://github.com/Sigmanor/yt-ai-comments/compare/v1.7.0...v1.7.1) (2025-08-18)


### Bug Fixes

* **firefox:** replace magic-wand.png with Base64 encoding to resolve Firefox security error ([fb865a8](https://github.com/Sigmanor/yt-ai-comments/commit/fb865a828fb6a28fff39374d7e5c521a12041300))

# [1.7.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.6.0...v1.7.0) (2025-08-18)


### Bug Fixes

* **ui:** update label text and button label in generate dropdown ([68353c6](https://github.com/Sigmanor/yt-ai-comments/commit/68353c6d68b099c468bb783ece7014ce6dabceda))


### Features

* **ui:** dynamically update copyright year in about page ([e25e9d9](https://github.com/Sigmanor/yt-ai-comments/commit/e25e9d9c2415a3fd5bdc8c814dbeeda91a9303d8))
* **ui:** replace generate button text with magic wand icon ([5737c6e](https://github.com/Sigmanor/yt-ai-comments/commit/5737c6e3d46d1ae20f5806fa115a81b651209f4e))

# [1.6.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.5.0...v1.6.0) (2025-08-16)


### Bug Fixes

* **release:** update Firefox extension path in .releaserc.json ([803632e](https://github.com/Sigmanor/yt-ai-comments/commit/803632e8ad452a0d5bd9a121674adab223ec8b66))


### Features

* **scripts:** update package.json version alongside manifest files ([082cb1b](https://github.com/Sigmanor/yt-ai-comments/commit/082cb1be1b4760e63250d8177652586f1c9e63ae)), closes [#123](https://github.com/Sigmanor/yt-ai-comments/issues/123)
* **ui:** add dropdown menu for comment generation with mood and language options ([4b890d1](https://github.com/Sigmanor/yt-ai-comments/commit/4b890d17a14e84e0d69e4f2611127b0696b4ac5b))
* **ui:** persist and restore user mood preference in comment generation ([ff7d5c4](https://github.com/Sigmanor/yt-ai-comments/commit/ff7d5c47842f1fba052d453c070e606f07b5d275))

# [1.5.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.4.0...v1.5.0) (2025-05-31)


### Features

* add OpenRouter provider for comment generation ([1db3bb7](https://github.com/Sigmanor/yt-ai-comments/commit/1db3bb793ce584d8f138a85474ce8e19f340062e))

# [1.4.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.3.0...v1.4.0) (2025-04-08)


### Bug Fixes

* adjust about window height to better fit the content ([cfd23be](https://github.com/Sigmanor/yt-ai-comments/commit/cfd23bed7d8a4212ddaca0485f8a0b010d3a06e5))


### Features

* update version fetching to use manifest.json version ([f2f3550](https://github.com/Sigmanor/yt-ai-comments/commit/f2f3550453c1afe4bad472be431b74e9b8b377dd))

# [1.3.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.2.1...v1.3.0) (2025-04-07)


### Bug Fixes

* correct Settings page title ([e00f3c5](https://github.com/Sigmanor/yt-ai-comments/commit/e00f3c53c676607522aa30e98d2cd6544769831e))
* ensure consistent styling across all relevant input fields ([20721fb](https://github.com/Sigmanor/yt-ai-comments/commit/20721fb6194884124d741514c7433b1a08740952))


### Features

* add icon buttons for about, settings, and donation to the popup window ([6377bf4](https://github.com/Sigmanor/yt-ai-comments/commit/6377bf4a18d2c001771c0ae3220e36782f3eeffa))
* update about page with version link and styling changes ([045ddc7](https://github.com/Sigmanor/yt-ai-comments/commit/045ddc75372d38c5ecdd717da88233b1f0e4d96e)), closes [#5e99e6](https://github.com/Sigmanor/yt-ai-comments/issues/5e99e6)
* update color scheme for form elements ([ad8b9dd](https://github.com/Sigmanor/yt-ai-comments/commit/ad8b9dd9cd5763e03bb3489d984732700e568afa)), closes [#556fa2d9](https://github.com/Sigmanor/yt-ai-comments/issues/556fa2d9) [#ff0000](https://github.com/Sigmanor/yt-ai-comments/issues/ff0000)
* update favicon and icon in About window ([6ba5d92](https://github.com/Sigmanor/yt-ai-comments/commit/6ba5d92052313ec539b0edf6d374fab81a07141e))
* update favicon and icon in Settings window ([0c5af80](https://github.com/Sigmanor/yt-ai-comments/commit/0c5af809ecccd53fe40f7700528758a115789a87))

## [1.2.1](https://github.com/Sigmanor/yt-ai-comments/compare/v1.2.0...v1.2.1) (2025-04-04)


### Bug Fixes

* adjust "Generate Comment" spacing ([62bdf66](https://github.com/Sigmanor/yt-ai-comments/commit/62bdf6685fb1e2d33758b97607ad0983a6b20f12))

# [1.2.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.1.0...v1.2.0) (2025-04-04)


### Features

* add dark theme styles for input, select, and textarea elements ([2edea1a](https://github.com/Sigmanor/yt-ai-comments/commit/2edea1a1fa4fa267dcbe8aa7b1ef55bc5b8f2f1a))
* add input validation for max-tokens field ([2399d53](https://github.com/Sigmanor/yt-ai-comments/commit/2399d539f65d9d7f99e74f3eb07cc160ce9b4d57))
* adjust height for about window ([cbbc155](https://github.com/Sigmanor/yt-ai-comments/commit/cbbc155ae25f3398a7f4de37b918beb9b92c1241))
* remove number input arrows ([b615d36](https://github.com/Sigmanor/yt-ai-comments/commit/b615d36dba17d30d81659a38936bcb02432d353c))
* update prompt guidelines ([356af20](https://github.com/Sigmanor/yt-ai-comments/commit/356af20ce801e774cbe4d377a16e1578d89557b3))

# [1.1.0](https://github.com/Sigmanor/yt-ai-comments/compare/v1.0.0...v1.1.0) (2025-04-04)


### Bug Fixes

* removed unnecessary horizontal rule and added extension icon and title to the settings page ([2a492ec](https://github.com/Sigmanor/yt-ai-comments/commit/2a492ec53d2f2a5d16e760a1122b9eaf1d609127))


### Features

* **about:** add dynamic version fetching from GitHub ([4945b0d](https://github.com/Sigmanor/yt-ai-comments/commit/4945b0dd9cf93e8fe1203fd2141c68470dcebc81))
* add about button to options page ([d607576](https://github.com/Sigmanor/yt-ai-comments/commit/d607576638bf59ccd1135319dfd1577c6da2178b))
* add about page for the extension ([79bc263](https://github.com/Sigmanor/yt-ai-comments/commit/79bc26359eca13fbcb48d010a177a4d82e4f6940))
* add AI provider, API key, and model options to popup ([68f5006](https://github.com/Sigmanor/yt-ai-comments/commit/68f50064ea9de3dca83a602ac628644010e9b1a4))
* add donation button to about page ([81459c9](https://github.com/Sigmanor/yt-ai-comments/commit/81459c92d11474b28d4b62bd282e7b768d12e466))
* add favicon to about and options pages ([fe6079a](https://github.com/Sigmanor/yt-ai-comments/commit/fe6079a3cee112ccf4843dde67f8d7aedcc08096))
* add GitHub API URL to permissions ([cfd8262](https://github.com/Sigmanor/yt-ai-comments/commit/cfd826200ac2fa1509fd170c330e58c885440e43))
* add source code and license information to about page ([47f654b](https://github.com/Sigmanor/yt-ai-comments/commit/47f654beed2dffc7b012bfd6862b43476aec2e74))
* close popup after opening settings page ([580add9](https://github.com/Sigmanor/yt-ai-comments/commit/580add9f17d7c9cdd5acbc6c7245444904713daf))
* remove theme selection from popup ([4a9eeac](https://github.com/Sigmanor/yt-ai-comments/commit/4a9eeaca77a9131cca95c01e28b702b408deb488))
* reorganize options in Settings and popup ([2922305](https://github.com/Sigmanor/yt-ai-comments/commit/2922305780bb1b700be84a733b39102c19d46be1))
* update donate button styling and content ([ed92f00](https://github.com/Sigmanor/yt-ai-comments/commit/ed92f0095907c1083bee05fb6a5c6ff20d421b52))
* update focus styles and cursor pointers for Settings and popup ([0a9704c](https://github.com/Sigmanor/yt-ai-comments/commit/0a9704ccef27d6c6a4220b6e0c7d23ae03d7afa4))

# 1.0.0 (2025-04-04)


### Features

* add light and dark theme styles ([feafa2f](https://github.com/Sigmanor/yt-ai-comments/commit/feafa2f17173d7046ab8dd5d5f9d5a626721cd42))
* add theme selection and application functionality ([2575f1c](https://github.com/Sigmanor/yt-ai-comments/commit/2575f1ce784c6579374022f35f914bd8764dd6df))
* add theme selection to options page ([733da2f](https://github.com/Sigmanor/yt-ai-comments/commit/733da2fb2e806423f57a9a1a53d41f5918287aea))
* **popup:** add language and theme selection options ([b6ca5e2](https://github.com/Sigmanor/yt-ai-comments/commit/b6ca5e2e52b7e7e8ee2b406e0d23f735718f6738))
* **popup:** add theme selection and system preference handling ([e8dc2a3](https://github.com/Sigmanor/yt-ai-comments/commit/e8dc2a32b9e9430fa1586b8b33da8117a70d431c))
