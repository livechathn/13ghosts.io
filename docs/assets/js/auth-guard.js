// auth-guard.js — 13Ghosts.io
// Include via <script src="/assets/js/auth-guard.js"> on any protected page.
// Page refresh = re-login by design. No localStorage. sessionStorage only.
(function () {
    var TOKEN_KEY = 'ghosts_token';
    var token = sessionStorage.getItem(TOKEN_KEY);

    function portalUrl() {
        // Relative from any page one level deep (dashboard/, etc.)
        return '../portal/';
    }

    function redirect() {
        window.location.replace(portalUrl());
    }

    if (!token) {
        redirect();
        return;
    }

    try {
        var payload = JSON.parse(atob(token.split('.')[1]));
        if (payload.exp && payload.exp < Date.now() / 1000) {
            sessionStorage.removeItem(TOKEN_KEY);
            redirect();
        }
    } catch (e) {
        sessionStorage.removeItem(TOKEN_KEY);
        redirect();
    }
})();
