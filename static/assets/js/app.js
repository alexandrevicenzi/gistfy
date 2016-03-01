function getVal(elem) {
    return $('#' + elem).val();
}

function unpackUrl() {
    var url = getVal('url'), id, host, user, repo, branch, file;

    var gistMatch = /http[s]?:\/\/gist\.github\.com\/([a-zA-Z0-9\-\_]*)[\/]?([a-zA-Z0-9\-\_]*)/.exec(url);

    if (gistMatch) {
        id = gistMatch[2] || gistMatch[1];

        if (id) {
            return {
                type: 'gist',
                url: '/github/gist/' + id
            };
        }

        return undefined;
    }

    var repoMatch = /http[s]?:\/\/(github|bitbucket)\.(com|org)\/([\w\d\-]+)\/([^\/]+)\/[\d\w]+\/([^\/]+)\/([^?]+)/.exec(url);

    if (repoMatch) {
        host = repoMatch[1];
        user = repoMatch[3];
        repo = repoMatch[4];
        branch = repoMatch[5];
        file = repoMatch[6];

        if (host && user && repo && branch && file) {
            return {
                type: 'repo',
                url: '/' + host + '/' + user + '/' + repo + '/' + file + '?branch=' + branch,
            };
        }

        return undefined;
    }

    var rawGitHubMatch = /http[s]?:\/\/raw\.githubusercontent\.com\/([\w\d\-]+)\/([^\/]+)\/([^\/]+)\/([^?\n]+)/.exec(url);

    if (rawGitHubMatch) {
        user = rawGitHubMatch[1];
        repo = rawGitHubMatch[2];
        branch = rawGitHubMatch[3];
        file = rawGitHubMatch[4];

        if (user && repo && branch && file) {
            return {
                type: 'repo',
                url: '/github/' + user + '/' + repo + '/' + file + '?branch=' + branch,
            };
        }

        return undefined;
    }

    var rawBitbucketMatch = /http[s]?:\/\/bitbucket\.org\/([\w\d\-]+)\/([^\/]+)\/raw\/([^\/]+)\/([^?\n]+)/.exec(url);

    if (rawBitbucketMatch) {
        user = rawBitbucketMatch[1];
        repo = rawBitbucketMatch[2];
        branch = rawBitbucketMatch[3];
        file = rawBitbucketMatch[4];

        if (user && repo && branch && file) {
            return {
                type: 'repo',
                url: '/bitbucket/' + user + '/' + repo + '/' + file + '?branch=' + branch,
            };
        }

        return undefined;
    }
}

function getQueryString(type, html) {
    var params = [];

    var sliceFrom = getVal('slicefrom'),
        sliceTo = getVal('sliceto'),
        lang = getVal('lang'),
        style = getVal('style');

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

    if (html) {
        params.push('type=html');
    }

    if (params.length > 0) {
        return (type === 'repo' ? '&' : '?') + params.join('&');
    }

    return '';
}

function fadeOut() {
    setTimeout(function () {
        $('.alert-popup').fadeOut();
    }, 10 * 1000);
}

function showResult() {
    $('#result').hide();
    $('.alert-popup').fadeOut();

    var urlData = unpackUrl();

    if (urlData) {
        var resultUrl = urlData.url + getQueryString(urlData.type, false);
        var getUrl = urlData.url + getQueryString(urlData.type, true);

        $.get(getUrl)
            .done(function (data) {
                $('#result-url').text('//' + location.host + resultUrl);
                $('#html-result').html(data);
                $('#result').show();
                $('.alert-success').fadeIn(fadeOut);
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 400 || jqXHR.status === 412) {
                    $('#error-msg').text('Invalid URL or private file.');
                } else if (jqXHR.status === 404) {
                    $('#error-msg').text('File not found.');
                } else {
                    $('#error-msg').text('Unknown error.');
                }

                $('.alert-danger').fadeIn(fadeOut);
            });
    } else {
        $('#error-msg').text('Invalid URL.');
        $('.alert-danger').fadeIn(fadeOut);
    }
}

$(document).ready(function () {
    $('a[data-try-url]').click(function () {
        $('#url').val($(this).data('try-url'));
        $('#url-help').modal('hide');
        $('#formtry').submit();
    });

    $('#formtry').submit(function (e) {
        e.preventDefault();
        showResult();
    });
});
