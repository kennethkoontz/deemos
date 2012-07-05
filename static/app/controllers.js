var StreamCtrl = function($scope, $http) {
    $http.get('https://api.twitter.com/1/statuses/home_timeline.json').success(function(data) {
        $scope.messages = data;
    });
};
