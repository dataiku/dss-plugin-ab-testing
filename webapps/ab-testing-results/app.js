// explanation fields
explain("size");
explain("success_rate");
explain("tail");
explain("sig_level");

// explanation fields
explain("size");
explain("success_rate");
explain("tail");
explain("sig_level");


var app = angular.module("resultApp", []);

app.controller("ResultController", function ($scope, $http) {
    $scope.sig_level = 95;
    $scope.tail = "false";
    $scope.uplift = null;
    $scope.z_score = null;
    $scope.p_value = null;
    $scope.distribution = Random_normal_Dist(0, 1);
    get_inputs($scope, $http);
    plot_results_chart($scope);


    $scope.getResults = function () {
        let formData = { size_A: $scope.size_A, size_B: $scope.size_B, success_rate_A: $scope.success_rate_A, success_rate_B: $scope.success_rate_B, tail: $scope.tail, sig_level: $scope.sig_level };
        $http.post(getWebAppBackendUrl("ab_calculator"), formData)
            .then(function (response) {
                let response_data = response.data;
                $scope.z_score = response_data.Z_score;
                $scope.p_value = response_data.p_value;
                $scope.uplift = Math.round(Math.abs($scope.success_rate_A - $scope.success_rate_B));
                $scope.test_is_significant = test_outcome($scope);
                $scope.chart.config.data.datasets = get_results_datasets($scope);
                $scope.chart.update(0);
            }).catch(function (error) {
                alert("Issue with the fetch operation, please check back end and back end logs.");
            });
    };

    $scope.saveResults = function () {
        let formData = { size_A: $scope.size_A, size_B: $scope.size_B, success_rate_A: $scope.success_rate_A, success_rate_B: $scope.success_rate_B, tail: $scope.tail, sig_level: $scope.sig_level, z_score: $scope.Z_score, p_value : $scope.p_value, uplift: $scope.uplift};
        $http.post(getWebAppBackendUrl("write_parameters"), formData);
    }
});


