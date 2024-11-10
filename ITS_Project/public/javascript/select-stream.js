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
            // Redirect to the profile page upon successful stream selection
            window.location.href = '/profile';
        } else {
            const errorData = await response.json();
            alert(`Failed to save stream selection: ${errorData.error || "Please try again."}`);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while saving stream selection.');
    }
});