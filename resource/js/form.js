function set_form_default_values() {
    document.getElementById("bcr").defaultValue = "30";
    document.getElementById("mde").defaultValue = "5";
    document.getElementById("sig_level").defaultValue = "95";
    document.getElementById("power").defaultValue = "80";
    document.getElementById("ratio").defaultValue = "100";
    document.getElementById("reach").defaultValue = "100";
}

// alert if values are invalid

function invalid_form(lower_bound, upper_bound) {
    let bcr = $("#bcr").val();
    let mde = $("#mde").val();
    let sig_level = $("#sig_level").val();
    let power = $("#power").val();
    let ratio = $("#ratio").val();
    let reach = $("#reach").val();
    if (reach) {
        var invalid_output = (out_of_bound(bcr, lower_bound, upper_bound) || out_of_bound(mde, lower_bound, upper_bound) || out_of_bound(sig_level, lower_bound, upper_bound) || out_of_bound(power, lower_bound, upper_bound) || out_of_bound(ratio, lower_bound, upper_bound) || out_of_bound(reach, lower_bound, upper_bound));
    } else {
        var invalid_output = (out_of_bound(bcr, lower_bound, upper_bound) || out_of_bound(mde, lower_bound, upper_bound) || out_of_bound(sig_level, lower_bound, upper_bound) || out_of_bound(power, lower_bound, upper_bound) || out_of_bound(ratio, lower_bound, upper_bound));
    }
    return invalid_output
}

function check_form_inputs() {
    check_form_input("bcr");
    check_form_input("mde");
    check_form_input("sig_level");
    check_form_input("power");
    check_form_input("ratio");
    check_form_input("reach");
}

function check_form_input(form_field) {
    let form_element = document.getElementById(form_field);
    form_element.addEventListener("change", function () { alert_invalid_value(form_field, form_element.value, 0, 100); });
}


function alert_invalid_value(form_field, value, lower_bound, upper_bound) {
    if (out_of_bound(value, lower_bound, upper_bound)) {
        $("#" + "alert_" + form_field).html("Please enter a value between 0 and 100")
    } else {
        $("#" + "alert_" + form_field).html("")
    }
}


function out_of_bound(value, lower_bound, upper_bound) {
    const input = parseFloat(value);
    return (input > upper_bound || input < lower_bound);
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