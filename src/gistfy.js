#!/usr/bin/env node

var config = require('./config'),
    express = require('express'),
    fs = require('fs'),
    hljs = require('highlight.js'),
    https = require('https'),
    nunjucks = require('nunjucks'),
    njeval = require('nunjucks-eval'),
    path = require('path'),
    url = require('url'),
    util = require('util');

var app = express(),
    templateFile = fs.readFileSync(path.resolve(__dirname, '../template.html'), 'utf8'),
    template = nunjucks.compile(templateFile);

/* https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String */
String.prototype.startsWith = function (searchString, position) {
    position = position || 0;
    return this.lastIndexOf(searchString, position) === position;
};

String.prototype.endsWith = function (searchString, position) {
    var subjectString = this.toString();
    if (position === undefined || position > subjectString.length) {
        position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
};

function escapeJS(s) {
    return s.replace(/\\/g, '&#92;')
            //.replace(/\\/g,"\\\\")
            //.replace(/\n/g, '<br>&#08;')
            .replace(/\n/g, '\\n')
            .replace(/\r/g, '\\r')
            .replace(/\'/g, '\\\'')
            .replace(/\"/g, '\\\"');
}

function highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
        return hljs.highlight(language, code).value;
    } else {
        return hljs.highlightAuto(code).value;
    }
}

function downloadFile(urlStr, callback) {
    var options = url.parse(urlStr);

    options.headers = {
        'User-Agent': config.user_agent
    };

    https.get(options, function (response) {
        response.setEncoding('utf8');

        var body = '';

        response.on('data', function (chunk) {
            body += chunk;
        });

        response.on('end', function () {
            callback(body, response.statusCode, response.headers);
        });

    }).on('error', function (e) {
        console.log(e);
    });
}

function downloadJSON(url, callback) {
    downloadFile(url, function (data, status, headers) {
        callback(JSON.parse(data), status, headers);
    });
}

function guessLanguage(file) {
    if (file) {
        var lang = file.split('.').pop();
        var langDef = hljs.getLanguage(lang);

        if (!langDef){
            return null;
        }

        return langDef.aliases ? langDef.aliases[0] : lang;
    } else {
        return null;
    }
}

function processData(data, slice) {

    var start, end, len;

    if (data.endsWith('\n')) {
        data = data.substring(0, data.length - 1);
    }

    if (slice) {
        if (slice.indexOf(':') > -1) {
            slice = slice.split(':');

            if (slice) {
                // From line X to line Y.
                // e.g: slice=1:5 or slice=-3:-1
                start = parseInt(slice.shift(), 10);

                if (start === 0 || Number.isNaN(start)) {
                    start = 1;
                }

                end = parseInt(slice.shift(), 10);

                if (end === 0 || Number.isNaN(end)) {
                    end = -1;
                }
            }
        } else {
            // Single line.
            // e.g: slice=5
            start = parseInt(slice, 10);

            if (Number.isNaN(start)) {
                start = 1;
                end = -1;
            } else {
                end = start;
            }
        }

        len = data.split('\n').length;

        if (start < 0) {
            start = (len + start) + 1;
        } else if (start > len) {
            start = 1;
        }

        if (end < 0) {
            end = (len + end) + 1;
        } else if (end > len) {
            end = len;
        }

        data = data.split('\n').slice(start - 1, end).join('\n');
    } else {
        start = 1;
        end = data.split('\n').length;
    }

    return { data: data, start: start, end: end };
}

function buildResponse(type, options, callback) {
    switch (type) {
        case "js":
            var js = 'document.write(\'<link rel=\"stylesheet\" href=\"' + config.base_url + '/css/gistfy.' + options.style + '.min.css\">\');\n'+
                     'document.write(\'' + escapeJS(template.render(options)) + '\');';
            callback(200, js, 'text/javascript; charset=utf-8');
            break;
        case "html":
            var html = '<link rel=\"stylesheet\" href=\"' + config.base_url + '/css/gistfy.' + options.style + '.min.css\">' +
                       template.render(options);
            callback(200, html, 'text/html; charset=utf-8');
            break;
        default:
            callback(400, 'Invalid type.', 'text/html');
    }
}

/*
Optional parameters:
    @param extended     Use extended template. Show user information at header. e.g., extended=true. Default: false. 
    @param lang         Set code language, for highlight. e.g., lang=python. Default is based in file extension. e.g., file.py returns python highlight style.
    @param locale       Set template locale, for translation. e.g., locale=en. Default: en.
    @param slice        Slice file, returning only the lines selected. e.g., slice=1:8. Default: null.
    @param style        Set template style. e.g., style=github, Default: github.
    @param type         Return type for content. e.g. type=html. Default: js.
*/
app.get('/github/gist/:id', function (req, res) {

    var extended = req.query.extended,
        lang = req.query.lang,
        locale = req.query.locale || 'en',
        slice = req.query.slice,
        style = req.query.style || 'github',
        type = req.query.type || 'js';

    var url = util.format('https://api.github.com/gists/%s', req.params.id);

    downloadJSON(url, function (data, status, headers) {
        if (status === 200) {
            var files = [];

            for (var k in data.files) {
                var file = data.files[k];
                var newData = processData(file.content, slice),
                    c = highlight(newData.data, lang || guessLanguage(file.filename));

                files.push({
                    htmlUrl: data.html_url,
                    rawUrl: file.raw_url,
                    fileName: file.filename,
                    content: c,
                    lineStart: newData.start,
                    lineEnd: newData.end + 1
                });
            }

            var options = {
                files: files,
                repoUrl: null,
                style: style,
                extended: extended
            };

            buildResponse(type, options, function (status, content, contentType) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('content-type', contentType);
                res.send(content);
            });
        } else {
            res.status(status).send(data);
        }
    });
});

/*
Optional parameters:
    @param branch       Set file branch or changeset. e.g., branch=master or branch=38d25e12627b. Default: master.
    @param extended     Use extended template. Show user information at header. e.g., extended=true. Default: false. 
    @param lang         Set code language, for highlight. e.g., lang=python. Default is based in file extension. e.g., file.py returns python highlight style.
    @param locale       Set template locale, for translation. e.g., locale=en. Default: en.
    @param slice        Slice file, returning only the lines selected. e.g., slice=1:8. Default: null.
    @param style        Set template style. e.g., style=github, Default: github.
    @param type         Return type for content. e.g. type=html. Default: js.
*/
app.get('/:host/:user/:repo/:path(*)', function (req, res) {

    var host = req.params.host.toLowerCase(),
        path = req.params.path,
        repo = req.params.repo,
        user = req.params.user,
        branch = req.query.branch || 'master',
        extended = req.query.extended,
        lang = req.query.lang,
        locale = req.query.locale || 'en',
        slice = req.query.slice,
        style = req.query.style || 'github',
        type = req.query.type || 'js',
        fileName = path.split('/').pop(),
        htmlUrl, rawUrl, repoUrl, from, to;

    if (host === 'github') {
        htmlUrl =  util.format('https://github.com/%s/%s/blob/%s/%s', user, repo, branch, path);
        rawUrl =  util.format('https://raw.githubusercontent.com/%s/%s/%s/%s', user, repo, branch, path);
        repoUrl = util.format('https://github.com/%s/%s', user, repo);
    } else if (host === 'bitbucket') {
        htmlUrl =  util.format('https://bitbucket.org/%s/%s/src/%s/%s', user, repo, branch, path);
        rawUrl =  util.format('https://api.bitbucket.org/1.0/repositories/%s/%s/raw/%s/%s', user, repo, branch, path);
        repoUrl = util.format('https://bitbucket.org/%s/$s', user, repo);
    } else {
        res.status(400).send('Invalid host: ' + host);
        return;
    }

    downloadFile(rawUrl, function (data, status, headers) {

        if (status === 200) {
            var newData = processData(data, slice),
                content = highlight(newData.data, lang || guessLanguage(fileName));

            var options = {
                files: [{
                    htmlUrl: htmlUrl,
                    rawUrl: rawUrl,
                    fileName: fileName,
                    content: content,
                    lineStart: newData.start,
                    lineEnd: newData.end + 1
                }],
                repoUrl: repoUrl,
                style: style,
                extended: extended
            };

            buildResponse(type, options, function (status, content, contentType) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "X-Requested-With");
                res.setHeader('Content-Type', contentType);
                res.send(content);
            });
        } else {
            res.status(status).send(data);
        }
    });
});

app.use(express.static(path.resolve(__dirname, '../static')));
app.set('views', path.resolve(__dirname, '../views/'));

var env = nunjucks.configure(app.get('views'), {
    autoescape: true,
    express: app,
    // watch: true,
    // noCache: true
});

njeval.install(env);
env.addGlobal('ga', config.ga_id);
app.set('view engine', 'nunjucks');

app.get('/', function (req, res) {
    res.redirect('/index.html');
});

app.get('/:path(index|api|usage|examples|about).html', function (req, res) {
    res.render(req.params.path + '.html', function(err, html){
        if (err) {
            console.log(err);
            res.render('500.html');
        } else {
            res.send(html);
        }
    });
});

app.get('*', function (req, res) {
    res.status(404).render('404.html');
});

app.listen(config.port, config.host, function () {
    console.log(util.format('Listening on http://%s:%s', config.host, config.port));
});
