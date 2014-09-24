#!/usr/bin/env node

var config = require('./config'),
    express = require('express'),
    fs = require('fs'),
    hljs = require('highlight.js'),
    https = require('https'),
    path = require('path'),
    swig  = require('swig'),
    url = require('url'),
    util = require('util');

var app = express(),
    template = swig.compileFile(path.resolve(__dirname, '../template.min.html'));

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
    return s.replace(/\\/g, '&#92;')/*.replace(/\\/g,"\\\\")*/.replace(/\n/g, '<br>').replace(/\'/g, '\\\'').replace(/\"/g, '\\\"');
}

function highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
        return hljs.highlight(language, code).value;
    } else {
        return hljs.highlightAuto(code).value;
    }
}

function range(low, high) {
    var list = [];
    for (var i = low; i <= high; i++) {
        list.push(i);
    }
    return list;
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
        // TODO:
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

    // TODO: Use while, maybe more than once.
    if (data.startsWith('\n')) {
        data = data.substring(1);
    }

    if (data.endsWith('\n')) {
        data = data.substring(0, data.length - 1);
    }

    if (slice) {

        if (slice.indexOf(':') > -1) {
            slice = slice.split(':');
            if (slice) {
                // e.g 1:5 or -3:-1
                start = parseInt(slice.shift()) || 0;
                end = parseInt(slice.shift()) || -1;
            }
        } else {
            start = parseInt(slice) || 0;
            end = start;
        }

        len = data.split('\n').length;

        if (start < 0) {
            start = len + start;
        } else if (start + 1 > len) {
            start = 0;
        }

        if (end < 0) {
            end = len + end;
        } else if (end + 1 > len) {
            end = len - 1;
        }

        data = data.split('\n').slice(start, end + 1).join('\n');

    } else {
        start = 0;
        end = data.split('\n').length - 1;
    }

    return { data: data, start: start, end: end };
}

function buildResponse(type, options, callback) {
    switch (type) {
        case "js":
            var js = 'document.write(\'<link rel=\"stylesheet\" href=\"' + config.base_url + '/css/gistfy.' + options.style + '.min.css\">\');\n'+
                     'document.write(\'' + escapeJS(template(options)) + '\');';
            callback(200, js, 'text/javascript; charset=utf-8');
            break;
        case "html":
            var html = '<link rel=\"stylesheet\" href=\"' + config.base_url + '/css/gistfy.' + options.style + '.min.css\">' + template(options);
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
        locale = req.query.locale || config.locale,
        slice = req.query.slice,
        style = req.query.style || config.style,
        type = req.query.type || config.type;

    var url = util.format('https://api.github.com/gists/%s', req.params.id);

    downloadJSON(url, function (data, status, headers) {
        if (status === 200) {
            var files = [];

            for (var k in data.files) {
                var file = data.files[k];

                var newData = processData(file.content, slice),
                    lines = range(newData.start, newData.end),
                    c = highlight(newData.data, lang || guessLanguage(file.filename));

                files.push({
                    htmlUrl: data.html_url,
                    rawUrl: file.raw_url,
                    fileName: file.filename,
                    content: c,
                    lineRange: lines,
                });
            }

            var options = {
                files: files,
                repoUrl: null,
                style: style,
                extended: extended
            };

            buildResponse(type, options, function (status, content, contentType) {
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
        branch = req.query.branch || config.branch,
        extended = req.query.extended,
        lang = req.query.lang,
        locale = req.query.locale || config.locale,
        slice = req.query.slice,
        style = req.query.style || config.style,
        type = req.query.type || config.type,
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
                lines = range(newData.start, newData.end),
                content = highlight(newData.data, lang || guessLanguage(fileName));

            var options = {
                files: [{
                    htmlUrl: htmlUrl,
                    rawUrl: rawUrl,
                    fileName: fileName,
                    content: content,
                    lineRange: lines
                }],
                repoUrl: repoUrl,
                style: style,
                extended: extended
            };

            buildResponse(type, options, function (status, content, contentType) {
                res.setHeader('content-type', contentType);
                res.send(content);
            });
        } else {
            res.status(status).send(data);
        }
    });
});

app.use(express.static(path.resolve(__dirname, '../static/')));

app.listen(config.port, config.host, function () {
    console.log(util.format('Listening on http://%s:%s', config.host, config.port));
});
