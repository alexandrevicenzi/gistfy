## Gistfy

Gist your GitHub and Bitbucket repositories

## Requirements

- Node.js

## Dependencies

- express
- highlight.js
- swig

## Build dependencies

- jshint
- minify

## Usage

#### Basic

- `/github/<user>/<repo>/<branch>/<path_to_file>`
- `/github/gist/<gist_id>`
- `/bitbucket/<user>/<repo>/<branch>/<pathtofile>`

#### Extended

- `/github/<user>/<repo>/<branch>/<path_to_file>?branch=<branch>&slice=<from_line>:<to_line>&lang=<language>`

#### Embed

```html
<script type="text/javascript" src="/github/alexandrevicenzi/gistfy/examples/minimal.py?branch=master"></script>
```
