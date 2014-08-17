angular.module('yewooApp', [])
    .controller('MainCtrl', function($scope) {
        alert(1);
        
        $scope.b = "asdf";
        $scope.a = 0;

        $scope.clickA = function() {
            $scope.a ++;
            alert("here");
        };
    });
