document.addEventListener('DOMContentLoaded', function() {
    // Check if the user is logged in
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');

    const userInfoDiv = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    const signOutButton = document.getElementById('signOutButton');
    const loginButton = document.getElementById('loginButton');

    if (token && username) {
        // User is logged in
        usernameDisplay.textContent = `Welcome, ${username}!`;
        usernameDisplay.style.display = 'inline';
        signOutButton.style.display = 'inline';
        loginButton.style.display = 'none';
    } else {
        // User is not logged in
        usernameDisplay.style.display = 'none';
        signOutButton.style.display = 'none';
        loginButton.style.display = 'inline';
    }

    // Sign out button click handler
    signOutButton.addEventListener('click', function() {
        // Clear login status from local storage
        localStorage.removeItem('token');
        localStorage.removeItem('username');

        // Redirect to the login page
        window.location.href = 'login.html';
    });

    // Example of fetching data with the token
    // You'll need to adapt this to your specific needs
    async function fetchData() {
        try {
            const response = await fetch('/api/protected', { // Replace with your API endpoint
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}` // Include the token in the Authorization header
                }
            });

            const data = await response.json();

            if (data.success) {
                // Process the data
                console.log('Data:', data);
            } else {
                // Handle unauthorized access
                console.error('Unauthorized:', data.message);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});

function openLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function closeLogin() {
    document.getElementById('loginModal').style.display = 'none';
}

function openResell() {
    document.getElementById('resellModal').style.display = 'block';
}

function closeResell() {
    document.getElementById('resellModal').style.display = 'none';
}