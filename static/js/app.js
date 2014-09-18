angular.module('App', []).controller('MainController', ['$scope', function ($scope) {

    $scope.types = [{ id: 'gist' , desc: 'Gist' }, { id: 'repo', desc: 'Repository' }];
    $scope.hosts = [{ id: 'github', desc: 'GitHub' }, { id: 'bitbucket', desc: 'Bitbucket' }];

    $scope.model = {
        type: null,
        id: null,
        host: null,
        user: null,
        repo: null,
        file: null
    }

    $scope.btnOkClick = function () {

    };
}]);