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

#### URLs

- `/github/gist/:id`
> **id** is Gist id.

- `/:host/:user/:repo/:path(*)`
> **host** can be *github* or *bitbucket*.

> **user** is your username. *e.g. alexandrevicenzi*

> **repo** is your repository name. *e.g. gistfy*

> **path** is your wanted file path. *e.g. examples/minimal.py*

Some optional parameters supported:

> **slice=start:end** Zero index based. Reverse index, like Python. *e.g. 1: or 1:3 or 1 or -1 or 1:-2 or -5:-2*.

> **branch** Branch name or changeset id. Default to *master*.

> **lang** See [highlight.js documentation](http://highlightjs.readthedocs.org/en/latest/css-classes-reference.html) for CSS names. Some are not supported.

> **type** Response type. Can be *html* or *js*. *js* is used for `script` tag.

A complete example:

>`/bitbucket/myusername/myprojectname/mypath/otherpath/myfile.py?branch=master&type=js&lang=python&slice=1:4`

>`/github/myusername/myprojectname/mypath/otherpath/myfile.py`

#### Embed

```html
<script type="text/javascript" src="/github/alexandrevicenzi/gistfy/examples/minimal.py?branch=master"></script>
```