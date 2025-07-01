if (typeof window.TokenUtils === 'undefined') {
    const TokenUtils = {
        // Get a specific cookie by name
        getCookie: function(name) {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) {
                const [cookieName, ...cookieParts] = cookie.split('=');
                const trimmedCookieName = cookieName.trim();
                if (trimmedCookieName === name) {
                    return decodeURIComponent(cookieParts.join('='));
                }
            }
            return null;
        },

        // Check if token is valid (exists and has correct structure)
        isValidToken: function() {
            const token = this.getCookie('token');
            
            if (!token) {
                return false;
            }

            try {
                // JWT tokens have 3 parts separated by dots
                const parts = token.split('.');
                if (parts.length !== 3) {
                    return false;
                }

                // Try to decode the payload
                const payload = parts[1];
                const decodedPayload = JSON.parse(atob(payload));
                
                // Check if token has required fields
                if (!decodedPayload.id || !decodedPayload.username) {
                    return false;
                }

                // Check if token is expired
                if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) {
                    return false;
                }

                return true;
            } catch (e) {
                return false;
            }
        },

        // Get user data from JWT token
        getUserDataFromToken: function() {
            if (!this.isValidToken()) {
                return null;
            }

            const token = this.getCookie('token');
            
            try {
                const parts = token.split('.');
                const payload = parts[1];
                const decodedPayload = JSON.parse(atob(payload));
                
                return {
                    id: decodedPayload.id,
                    username: decodedPayload.username,
                    level: decodedPayload.level || 1,
                    experience: decodedPayload.experience || 0
                };
            } catch (e) {
                return null;
            }
        },

        // Check if user is logged in
        isLoggedIn: function() {
            return this.isValidToken();
        },

        // Get just the username (for backwards compatibility)
        getUsernameFromToken: function() {
            const userData = this.getUserDataFromToken();
            return userData ? userData.username : null;
        }
    };

    // Make it available globally
    window.TokenUtils = TokenUtils;
}