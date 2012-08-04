var StreamCtrl = function($scope, $http) {
    $http.get('aggregate').success(function(data) {
        $scope.messages = data;
    });
};

var MessageCtrl = function($scope, $http) {
    $scope.master = {body: "What's up?"};

    $scope.reset = function() {
        $scope.message = angular.copy($scope.master);
    };

    $scope.update = function(message) {
        $http.post('tweet', message).success(function(data) {
            $scope.reset();
        });
    };

    $scope.isUnchanged = function(message) {
        return angular.equals(message, $scope.master);
    };

    $scope.reset();
};
