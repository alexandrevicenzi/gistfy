angular.module('App', []).controller('MainController', ['$scope', '$sce', '$http', function ($scope, $sce, $http) {

    $scope.fileTypes = [{ id: 'js' , desc: 'JavaScript' }, { id: 'html', desc: 'HTML (jQuery or AngularJS)' }];
    $scope.fileTypesFor = [{ id: 'jquery' , desc: 'jQuery' }, { id: 'angular', desc: 'AngularJS' }];
    $scope.hosts = [{ id: 'github', desc: 'GitHub' }, { id: 'bitbucket', desc: 'Bitbucket' }];
    $scope.styles = [{ id: 'github' , desc: 'GitHub' }, { id: 'monokai', desc: 'Monokay' }, { id: 'monokai_sublime', desc: 'Monokay Sublime' }];
    $scope.types = [{ id: 'gist' , desc: 'Gist' }, { id: 'repo', desc: 'Repository' }];

    $scope.model = {
        type: null,
        id: null,
        host: null,
        user: null,
        repo: null,
        file: null,
        branch: null,
        slice: null,
        lang: null,
        style: null,
        fileType: null,
        fileTypeFor: null
    };

    $scope.result = {
        url: null,
        show: false,
        html: null,
        type: null,
        hasError: false,
        errorMsg: null
    };

    $scope.showMore = false;

    $scope.isActive = function (viewLocation) {
        if (Array.isArray(viewLocation)) {
            return viewLocation.indexOf(location.pathname) > -1;
        } else {
            return viewLocation === location.pathname;
        }
    };

    $scope.changeType = function () {
        $scope.isGist = ($scope.model.type !== null) && ($scope.model.type.id === 'gist');
        $scope.isRepo = ($scope.model.type !== null) && ($scope.model.type.id === 'repo');
        $scope.result.show = false;
        $scope.showMore = false;

        $scope.model = {
            type: $scope.model.type,
            id: null,
            host: null,
            user: null,
            repo: null,
            file: null,
            branch: null,
            slice: null,
            lang: null,
            style: null,
            fileType: null,
        };
    };

    $scope.thisYear = function () {
        return (new Date()).getFullYear();
    };

    $scope.btnOkClick = function () {
        if (!$scope.formTry.$valid) {
            return;
        }

        var url;

        if ($scope.isGist) {
            url = '/github/gist/' + $scope.model.id;
        } else if ($scope.isRepo) {
            url = '/' + $scope.model.host.id + '/' + $scope.model.user + '/' + $scope.model.repo + '/' + $scope.model.file;
        }

        var params = [];

        if ($scope.showMore) {

            if ($scope.model.branch) {
                params.push('branch=' + $scope.model.branch);
            }

            if ($scope.model.slice) {
                params.push('slice=' + $scope.model.slice);
            }

            if ($scope.model.lang) {
                params.push('lang=' + $scope.model.lang);
            }

            if ($scope.model.style) {
                params.push('style=' + $scope.model.style.id);
            }
        }

        var sep;

        if (params.length > 0) {
            url = url + '?' + params.join('&');
            sep = '&';
        } else {
            sep = '?';
        }

        $http({ method: 'GET', url: url + sep + 'type=html' })
            .success(function (data, status, headers, config) {
                $scope.result.url = /*'http://www.gistfy.com'*/location.origin + url;
                $scope.result.html = $sce.trustAsHtml(data);

                if ($scope.model.fileType && $scope.model.fileType.id === 'html') {
                    $scope.result.type = $scope.model.fileTypeFor.id;
                } else {
                    $scope.result.type = 'js';
                }

                $scope.result.hasError = false;
                $scope.result.show = true;
            })
            .error(function (data, status, headers, config) {
                $scope.result.html = null;
                $scope.result.hasError = true;

                if (status === 400 || status === 412) {
                    $scope.result.errorMsg =  $sce.trustAsHtml(data);
                } else if (status === 404) {
                    $scope.result.errorMsg = ($scope.isGist ? 'Gist not found.' : 'File not found.');
                } else {
                    $scope.result.errorMsg = 'Oh snap! There\'s an error.';
                }

                $scope.result.show = true;
            });
    };

    $scope.changeType();
}]);