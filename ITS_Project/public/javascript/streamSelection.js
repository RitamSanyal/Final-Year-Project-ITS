document.getElementById('streamForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const streamChoice = document.getElementById('streamChoice').value;

    try {
        const response = await fetch('/select-stream', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ stream_choice: streamChoice })
        });

        if (response.ok) {
            alert('Stream selection saved successfully!');
            // Redirect or perform any action you want after successful selection
        } else {
            alert('Failed to save stream selection. Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving stream selection.');
    }
});
