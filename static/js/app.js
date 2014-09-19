$(document).ready(function() {

});

angular.module('App', []).controller('MainController', ['$scope', '$sce', '$http', function ($scope, $sce, $http) {

    $scope.types = [{ id: 'gist' , desc: 'Gist' }, { id: 'repo', desc: 'Repository' }];
    $scope.hosts = [{ id: 'github', desc: 'GitHub' }, { id: 'bitbucket', desc: 'Bitbucket' }];

    $scope.model = {
        type: null,
        id: null,
        host: null,
        user: null,
        repo: null,
        file: null
    };

    $scope.showResult = false;
    $scope.htmlResult = null;
    $scope.resultError = false;

    $scope.changeType = function () {
        $scope.isGist = ($scope.model.type !== null) && ($scope.model.type.id === 'gist');
        $scope.isRepo = ($scope.model.type !== null) && ($scope.model.type.id === 'repo');
        $scope.showResult = false;
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
            url = '/github/gist/' + $scope.model.id + '?type=html';
        } else if ($scope.isRepo) {
            url = '/' + $scope.model.host + '/' + $scope.model.user + '/' + $scope.model.repo + '/' + $scope.model.file + '?type=html';
        }

        $http({method: 'GET', url: url})
            .success(function(data, status, headers, config) {
                $scope.htmlResult = $sce.trustAsHtml(data);
                $scope.resultError = false;

                $('pre code').each(function(i, block) {
                    hljs.highlightBlock(block);
                });

                $scope.showResult = true;
            })
            .error(function(data, status, headers, config) {
                $scope.htmlResult = null;
                $scope.resultError = true;
                $scope.showResult = true;
            });
    };

    $scope.changeType();
}]);