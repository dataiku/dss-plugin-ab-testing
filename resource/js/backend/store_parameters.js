function store_parameters() {
    let formData = new FormData(document.getElementById('form_data'));
    let n_A = $("#sample_size_A").html();
    let n_B = $("#sample_size_B").html();
    let data = new URLSearchParams(formData);
    data.append("size_A", n_A);
    data.append("size_B", n_B);
    let headers = new Headers();
    let init = {
        method: 'POST',
        headers: headers,
        body: data
    };
    const url = getWebAppBackendUrl('/write_parameters');
    let promise = fetch(url, init);
    return promise;
}

function manage_response(response) {
    if (response.ok) {
        return response.json();
    } else {
        console.log('Invalid response from the network');
    }
}