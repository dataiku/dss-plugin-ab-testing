// compute duration
function manage_duration($scope) {
    if ($scope.traffic != undefined) {
        display_experiment_duration($scope);
    } else {
        hide_field("duration");
    };
}


function display_experiment_duration($scope) {
    let duration = compute_duration($scope);
    $("#nb_of_days").html(duration);
    $("#duration").removeClass('d-none');
}


function compute_duration($scope) {
    let daily_traffic = parseFloat($("#traffic").val());
    let n_A = $scope.sample_size_A;
    let n_B = $scope.sample_size_B;
    let sample_size = n_A + n_B;
    return Math.ceil(sample_size / daily_traffic);
}
