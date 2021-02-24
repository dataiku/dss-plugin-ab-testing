function manage_duration($scope) {
    if ($scope.traffic != undefined) {
        display_experiment_duration($scope);
    } else {
        hide_field("duration");
    };
}


function display_experiment_duration($scope) {
    let sample_size = $scope.sample_size_A + $scope.sample_size_B
    let duration = Math.ceil(sample_size / $scope.traffic);
    $("#nb_of_days").html(duration);
    $("#duration").removeClass('d-none');
}
