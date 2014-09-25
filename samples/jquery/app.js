$(document).ready(function () {
    $.ajax({ type: 'GET', url: 'http://www.gistfy.com/github/isagalaev/highlight.js/test/detect/python/default.txt?type=html&lang=python' })
        .done(function (data) {
            $('#result').html(data);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 400 || jqXHR.status === 412) {
                $('#result').html(errorThrown);
            } else if (jqXHR.status === 404) {
                $('#result').html('<strong>' + $scope.isGist ? 'Gist not found.' : 'File not found.' + '</strong>');
            } else {
                $('#result').html('<strong>Oh snap! There\'s an error.</strong>');
            }
        });
});
