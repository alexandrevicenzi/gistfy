# Changelog

### 1.1.0

- Heroku Button and deploy files.
- Better way to discover default CDN url.

### 1.0.0

There are breaking changes.

- Command line argument `base_url` was renamed to `cdn_url`.
- All static assets are under `/assets` now.

Fixes and Updates:

- swig replaced by nunjucks. See [this](https://github.com/paularmstrong/swig/issues/628)
- Update dependencies
- Remove unused CSS
- Add Google Analytics Track ID option
- Remove unused command line options
- Remove AngularJS dependency
- Added more syles. See [#13](https://github.com/alexandrevicenzi/gistfy/issues/13)
- Use full url to create snippet. See [#9](https://github.com/alexandrevicenzi/gistfy/issues/9)
- <iframe> support. See [#16](https://github.com/alexandrevicenzi/gistfy/issues/16)
- Fixed problem with copy and paste. See [#23](https://github.com/alexandrevicenzi/gistfy/issues/23)
- Add JSON-LD (For SEO)

### 0.3.3

- Support HTTP/HTTPS
- Drop OpenShift configuration

### 0.3.2

- Fix [#19](https://github.com/alexandrevicenzi/gistfy/issues/19)

### 0.3.1

- Add Sitemap.xml
- Add Open Graph

### 0.3.0

- Fix slice problem
- Fix [#15](https://github.com/alexandrevicenzi/gistfy/issues/15)
- Add "More Options" button
- Update components
- Split site in multiple pages
