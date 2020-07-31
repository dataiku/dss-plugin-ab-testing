function manage_response(response) {
    if (response.ok) {
        return response.json();
    } else {
        console.log('Invalid response from the network');
    }
}