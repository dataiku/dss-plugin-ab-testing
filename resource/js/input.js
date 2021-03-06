 function get_inputs($scope, $http) {
    let config = dataiku.getWebAppConfig()
    let input_mode = config["statistics_entry"];
    $scope.dataset_name = config["statistics_dataset"];
    $scope.column_name = config["group_column"]

    if (input_mode === undefined && $scope.dataset_name === undefined) {
        $scope.createModal.error("Please define how you want to input your statistics from the settings tab. After definining them, please click on the button Save and view web app. By default, manual setting is on.");
    }
    else if (input_mode === undefined && $scope.dataset_name != undefined) {
        load_values_from_df($scope, $http);
    }
    else if (input_mode === "manual") {
        $scope.size_A = 1000;
        $scope.size_B = 1000;
        $scope.success_rate_A = 20;
        $scope.success_rate_B = 30;
        $scope.getResults(true);
    } else if (input_mode === "input_dataset") {
        if ($scope.dataset_name === undefined) {
            $scope.createModal.error("Please, specify the input dataset containing the statistics in the settings. It should be the output of the AB statistics recipe from the AB testing plugin. Otherwise, edit manually");
        }
        else {
            load_values_from_df($scope, $http);
        };
    } else {
        $scope.createModal.error("Please check the settings of the web ap")
    };
}

function load_values_from_df($scope, $http) {
    let formData = { dataset_name: $scope.dataset_name, column_name: $scope.column_name };
    $http.post(getWebAppBackendUrl("statistics"), formData)
        .then(function (response) {
            let response_data = response.data;
            let status = response_data.status;
            if (status==="ok"){
                $scope.size_A = parseInt(response_data.size_A);
                $scope.size_B = parseInt(response_data.size_B);
                $scope.success_rate_A = parseFloat(response_data.success_rate_A);
                $scope.success_rate_B = parseFloat(response_data.success_rate_B);
                $scope.getResults(true);
            } else if(status ==="error"){
            $scope.createModal.error(response_data.message);
            }
        }, function(e){
            if (e.status === 405) {
                $scope.createModal.error("Unauthorized, make sure that backend is running");
            } else {
            $scope.createModal.error(e.data);
            };
        });
}