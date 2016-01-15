function getVal(elem) {
    return $('#' + elem).val();
}

function getBaseUrl() {
    if (getVal('type') === 'gist') {
        return '/github/gist/' + getVal('gistid');
    } else if ($scope.isRepo) {
        return '/' + getVal('host') + '/' + getVal('user') + '/' +getVal('repo') + '/' + getVal('file');
    }
}

function unpackUrlToBaseUrl(url) {
    var gistMatch = /http[s]?:\/\/gist\.github\.com\/([a-zA-Z0-9\-\_]*)[\/]?([a-zA-Z0-9\-\_]*)/.exec(url);

    if (gistMatch) {
        var id = gistMatch[2] || gistMatch[1];

        if (id) {
            return '/github/gist/' + id;
        }

        return undefined;
    }

    var repoMatch = /http[s]?:\/\/(github|bitbucket)\.(com|org)\/([a-zA-Z0-9\-\_]+)[\/]([a-zA-Z0-9\-\_]+)[\/][a-zA-Z0-9\-\_]*[\/]([a-zA-Z0-9\-\_\.]*)[\/]([a-zA-Z0-9\-\_\/\.]*)/.exec(url);

    if (repoMatch) {
        var host = repoMatch[1],
            user = repoMatch[3],
            repo = repoMatch[4],
            branch = repoMatch[5],
            file = repoMatch[6];

        if (host && user && repo && branch && file) {
            return '/' + host + '/' + user + '/' + repo + '/' + file + '?branch=' + branch;
        }

        return undefined;
    }
}

function getParams(alwaysHtml) {
    var params = [];

    var branch = getVal('branch'),
        sliceFrom = getVal('slicefrom'),
        sliceTo = getVal('sliceto'),
        lang = getVal('lang'),
        style = getVal('style');
        type = getVal('filetype');

    if (branch) {
        params.push('branch=' + branch);
    }

    if (sliceFrom && sliceTo) {
        params.push('slice=' + sliceFrom + ':' + sliceTo);
    } else if (sliceFrom) {
        params.push('slice=' + sliceFrom);
    } else if (sliceTo) {
        params.push('slice=' + sliceTo);
    }

    if (lang) {
        params.push('lang=' + lang);
    }

    if (style) {
        params.push('style=' + style);
    }

    if (alwaysHtml) {
        params.push('type=html');
    } else if (type) {
        params.push('type=' + type);
    }

    return params;
}

function getQueryString(params) {
    if (params.length > 0) {
        return '?' + params.join('&');
    } else {
        return '';
    }
}

function showFile() {

    $('.result').hide();

    var url = getBaseUrl();
    var resultUrl = url + getQueryString(getParams());
    var getUrl = url + getQueryString(getParams(true));

    $.get(getUrl)
        .done(function (data) {
            $('.result-url').text('//' + location.host + resultUrl);
            $('#html-result').html(data);

            var library = getVal('library');

            if (library === 'jquery') {
                $('.result-all, .code, .jquery').show();
            } else if (library === 'angular') {
                $('.result-all, .code, .angular').show();
            } else {
                $('.result-all, .code, .js').show();
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 400 || jqXHR.status === 412) {
                $('#error-msg').html(jqXHR.responseText);
            } else if (jqXHR.status === 404) {
                $('#error-msg').text('File not found.');
            } else {
                $('#error-msg').text('Oh snap! There\'s an error.');
            }

            $('.result-all, .error-msg').show();
        });
}


$(document).ready(function () {
    $('#btn-more').click(function () {
        $('#btn-more').hide();
        $('#btn-less').show();
        $('.show-more').show();
    });

    $('#btn-less').click(function () {
        $('#btn-less').hide();
        $('#btn-more').show();
        $('.show-more').hide();
    });

    $('#type').change(function () {
        var type = $(this).val();

        if (type) {
            $('#btn-group').show();

            if (type === 'gist') {
                $('.is-repo').hide();
                $('.is-gist').show();
            } else if (type === 'repo') {
                $('.is-gist').hide();
                $('.is-repo').show();
            }
        } else {
            $('#btn-group').hide();
            $('.is-gist').hide();
            $('.is-repo').hide();
        }
    });

    $('#filetype').change(function () {
        var type = $(this).val();

        if (type === 'html') {
            $('.is-html').show();
        } else {
            $('.is-html').hide();
        }
    });

    $('select').change(function () {
        $('#gistid, #host, #user, #repo, #path, #library').each(function (idx, elem) {
            if ($(elem).is(":visible")) {
                $(elem).attr('required', '');
            } else {
                $(elem).removeAttr('required');
            }
        });
    });

    $('#formtry').submit(function (e) {
        e.preventDefault();
        showFile();
    });
});