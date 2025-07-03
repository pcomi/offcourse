if (typeof window.TokenUtils === 'undefined') 
{
    const TokenUtils = 
    {
        getCookie: function(name) 
        {
            const cookies = document.cookie.split(';');
            for (let cookie of cookies) 
            {
                const [cookieName, ...cookieParts] = cookie.split('=');
                const trimmedCookieName = cookieName.trim();
                if (trimmedCookieName === name) 
                {
                    return decodeURIComponent(cookieParts.join('='));
                }
            }
            return null;
        },

        isValidToken: function() 
        {
            const token = this.getCookie('token');
            
            if (!token) 
            {
                return false;
            }

            try 
            {
                const parts = token.split('.');
                if (parts.length !== 3) 
                {
                    return false;
                }

                const payload = parts[1];
                const decodedPayload = JSON.parse(atob(payload));
                
                if (!decodedPayload.id || !decodedPayload.username) 
                {
                    return false;
                }

                if (decodedPayload.exp && Date.now() >= decodedPayload.exp * 1000) 
                {
                    return false;///expired
                }

                return true;
            } catch (e) {
                return false;
            }
        },

        getUserDataFromToken: function() 
        {
            if (!this.isValidToken()) 
            {
                return null;
            }

            const token = this.getCookie('token');
            
            try 
            {
                const parts = token.split('.');
                const payload = parts[1];
                const decodedPayload = JSON.parse(atob(payload));
                
                return {
                    id: decodedPayload.id,
                    username: decodedPayload.username,
                    level: decodedPayload.level || 1,
                    experience: decodedPayload.experience || 0
                };
            } 
            catch (e) 
            {
                return null;
            }
        },

        isLoggedIn: function() 
        {
            return this.isValidToken();
        },

        getUsernameFromToken: function() 
        {
            const userData = this.getUserDataFromToken();
            return userData ? userData.username : null;
        }
    };

    window.TokenUtils = TokenUtils;///global
}