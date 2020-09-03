function check_form_inputs($scope) {
    let lower_bound = 0;
    let upper_bound = 100;
    alert_invalid_value("bcr", $scope, lower_bound, upper_bound);
    alert_invalid_value("mde", $scope, lower_bound, upper_bound);
    alert_invalid_value("sig_level", $scope, lower_bound, upper_bound);
    alert_invalid_value("power",$scope, lower_bound, upper_bound);
    alert_invalid_value("ratio", $scope, lower_bound, upper_bound);
    alert_invalid_value("reach", $scope, lower_bound, upper_bound);
}

function invalid_form($scope, lower_bound, upper_bound) {
    if ($scope.reach) {
        var invalid_output = (out_of_bound($scope.bcr, lower_bound, upper_bound) || out_of_bound($scope.mde, lower_bound, upper_bound) || out_of_bound($scope.sig_level, lower_bound, upper_bound) || out_of_bound($scope.power, lower_bound, upper_bound) || out_of_bound($scope.ratio, lower_bound, upper_bound) || out_of_bound($scope.reach, lower_bound, upper_bound));
    } else {
        var invalid_output = (out_of_bound($scope.bcr, lower_bound, upper_bound) || out_of_bound($scope.mde, lower_bound, upper_bound) || out_of_bound($scope.sig_level, lower_bound, upper_bound) || out_of_bound($scope.power, lower_bound, upper_bound) || out_of_bound($scope.ratio, lower_bound, upper_bound));
    }
    return invalid_output
}

function alert_invalid_value(form_field, $scope, lower_bound, upper_bound) {
    let value = $("#"+form_field).val();
    if (out_of_bound(value, lower_bound, upper_bound)) {
        $("#" + "alert_" + form_field).html("Please enter a value between 0 and 100");
        erase_chart($scope);
    } else {
        $("#" + "alert_" + form_field).html("")
    }
}

function out_of_bound(value, lower_bound, upper_bound) {
    const input = parseFloat(value);
    return (input > upper_bound || input < lower_bound);
}

function missing_values($scope) {
    return ($scope.bcr === null || $scope.mde === null || $scope.sig_level === null || $scope.power === null || $scope.ratio === null);
}

function alert_sample_size(display_message, log_message) {
    $("#alert_size").html(display_message);
    $("#alert_size").removeClass('d-none');
    $("#sample_size_A").html("");
    $("#sample_size_B").html("");
    console.log("value error: " + log_message);
}

// compute duration
function manage_duration($scope) {
    if ($scope.traffic != undefined) {
        if (too_small($scope.traffic, 0)) {
            hide_field("duration");
            $("#" + "alert_traffic").html("Please enter a positive number")
        } else {
            display_experiment_duration($scope.hide_duration);
            $("#alert_traffic").html("");
        }
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


function too_small(value, lower_bound) {
    const input = parseFloat(value);
    return (input < lower_bound);
}