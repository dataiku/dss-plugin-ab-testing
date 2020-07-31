function get_std() {
    let bcr = parseFloat($('#bcr').val()) / 100;
    let new_size_A = parseFloat($("#sample_size_A").html());
    let new_size_B = parseFloat($("#sample_size_B").html());
    let std = Math.sqrt(bcr * (1 - bcr) * (1 / new_size_A + 1 / new_size_B));
    return std;
}
