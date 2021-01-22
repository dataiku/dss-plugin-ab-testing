// compute duration
function manage_duration($scope) {
    if ($scope.traffic != undefined) {
        display_experiment_duration($scope.hide_duration);
    } else {
        hide_field("duration");
    };
}


function display_experiment_duration() {
    let duration = compute_duration();
    $("#nb_of_days").html(duration);
    $("#duration").removeClass('d-none');
}


function compute_duration() {
    let daily_traffic = parseFloat($("#traffic").val());
    let n_A = parseFloat($("#sample_size_A").html());
    let n_B = parseFloat($("#sample_size_B").html());
    let sample_size = n_A + n_B;
    return Math.ceil(sample_size / daily_traffic);
}
