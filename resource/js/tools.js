function get_inputs($scope, $http) {
    let config = dataiku.getWebAppConfig()
    let input_mode = config["statistics_entry"];
    $scope.dataset_name = config["statistics_dataset"];

    if (input_mode === undefined && $scope.dataset_name === undefined) {
        alert("Please define how you want to input your statistics from the settings tab. After definining them, please click on the button Save and view web app. By default, manual setting is on.");
    }
    else if (input_mode === undefined && $scope.dataset_name != undefined) {
        load_values_from_df($scope, $http);
    }
    else if (input_mode === "manual") {
        $scope.size_A = 1000;
        $scope.size_B = 1000;
        $scope.success_rate_A = 20;
        $scope.success_rate_B = 30;
    } else if (input_mode === "input_dataset") {
        if ($scope.dataset_name === undefined) {
            alert("Please, specify the input dataset containing the statistics. It should be the output of the AB statistics recipe from the AB testing plugin.");
        }
        else {
            load_values_from_df($scope, $http);
        };
    } else {
        alert("Please check the settings of the web ap")
    };
}

function load_values_from_df($scope, $http) {
    let formData = { name: $scope.dataset_name };
    $http.post(getWebAppBackendUrl("statistics"), formData).then(function (response) {
        let response_data = response.data
        $scope.size_A = response_data.size_A;
        $scope.size_B = response_data.size_B;
        $scope.success_rate_A = response_data.success_rate_A;
        $scope.success_rate_B = response_data.success_rate_B;
    });
}