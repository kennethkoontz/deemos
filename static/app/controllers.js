var StreamCtrl = function($scope, $http, $cookies) {
    if ($cookies.session !== undefined) {
        $scope.hasFeed = true;
        $http.get('aggregate').success(function(data) {
            if (angular.isObject(data) && !angular.equals({}, data)) {
                $scope.messages = data;
            }
        });
    }
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

var LoginCtrl = function($scope, $http) {
    $scope.login = function() {
        var data = {email: $scope.email, password: $scope.password};
        $http.post('login/submit', data).
            success(function(data) {
                window.location = '../';
            }).
            error(function(data) {
                $scope.invalidLogin = true;
            });
    }
};

var RegisterCtrl = function($scope, $http) {

    $scope.checkEmail = function() {
        var query = 'checkEmail?email='+$scope.email;

        if ($scope.email) {
            $http.get(query).success(function(data) {
                if (data.rows.length === 0) {
                    $scope.emailAvailable = true;
                    $scope.emailNotAvailable = false;
                } else {
                    $scope.emailAvailable = false;
                    $scope.emailNotAvailable = true;
                }
            });
        }
    }

    $scope.registerEmail = function() {
        $http.post('register/email', {email:$scope.email, password:$scope.password}).success(function(data) {
            window.location = '../';
        });
    }

}

function Ctrl($scope) {
      $scope.userType = '';
}
