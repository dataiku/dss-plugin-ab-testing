function manage_duration(sample_size_A, sample_size_B, traffic) {
    if (traffic && traffic > 0) {
        display_experiment_duration(sample_size_A, sample_size_B, traffic);
    } else {
        hide_field("duration");
    };
}


function display_experiment_duration(sample_size_A, sample_size_B, traffic) {
    let sample_size = sample_size_A + sample_size_B
    let duration = Math.ceil(sample_size / traffic);
    $("#nb_of_days").html(duration);
    $("#duration").removeClass('d-none');
}
