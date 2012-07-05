var StreamCtrl = function($scope, $http) {
    $http.get('aggregate').success(function(data) {
        $scope.messages = data;
    });
};
