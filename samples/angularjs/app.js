angular.module('App', []).controller('MainController', ['$scope', '$sce', '$http', function ($scope, $sce, $http) {
    $scope.result = null;

    $http({ method: 'GET', url: 'http://www.gistfy.com/github/isagalaev/highlight.js/test/detect/python/default.txt?type=html&lang=python' })
        .success(function (data, status, headers, config) {
            $scope.result = $sce.trustAsHtml(data);
        })
        .error(function (data, status, headers, config) {
            if (status === 400 || status === 412) {
                $scope.result =  $sce.trustAsHtml(data);
            } else if (status === 404) {
                $scope.result = $sce.trustAsHtml('<strong>File not found.</strong>');
            } else {
                $scope.result = $sce.trustAsHtml('<strong>Oh snap! There\'s an error.</strong>');
            }
        });
}]);