// portal.js — 13Ghosts.io Authentication
// Auth flow: sar1a.lempyra.com /auth/authorize → /auth/token
// sessionStorage only. No IP addresses. No localStorage.

var AUTH = {
    url:          'https://sar1a.lempyra.com',
    clientId:     '13ghosts',
    clientSecret: 'REDACTED',
    scope:        'admin,lab',
    tokenKey:     'ghosts_token',
    refreshKey:   'ghosts_refresh',
    userKey:      'ghosts_user'
};

// Redirect to dashboard if already authenticated
(function checkExisting() {
    var token = sessionStorage.getItem(AUTH.tokenKey);
    if (!token) return;
    try {
        var p = JSON.parse(atob(token.split('.')[1]));
        if (!p.exp || p.exp > Date.now() / 1000) {
            window.location.replace('../dashboard/');
        }
    } catch (e) {
        sessionStorage.removeItem(AUTH.tokenKey);
    }
})();

// ─── Gateway health check ───
var gatewayOnline = false;

function checkGateway() {
    var statusEl = document.getElementById('login-status');
    fetch(AUTH.url + '/auth/health', { signal: AbortSignal.timeout(5000) })
        .then(function (r) {
            if (!r.ok) throw new Error('unhealthy');
            gatewayOnline = true;
            statusEl.style.color = 'var(--bone)';
            statusEl.style.borderColor = 'rgba(74,63,56,0.6)';
            statusEl.textContent = '● auth gateway online';
        })
        .catch(function () {
            statusEl.style.color = 'var(--blood-glow)';
            statusEl.textContent = '✗ gateway offline — authentication unavailable';
            document.getElementById('submit-btn').disabled = true;
        });
}

// ─── Auth flow ───
function handleLogin(event) {
    event.preventDefault();

    var username = document.getElementById('username').value.trim();
    var password = document.getElementById('password').value;
    var btn      = document.getElementById('submit-btn');
    var statusEl = document.getElementById('login-status');
    var panelEl  = document.getElementById('login-panel');

    btn.disabled    = true;
    btn.textContent = 'Binding…';
    statusEl.style.color = 'var(--chalk-dim)';
    statusEl.textContent = '⟳ invoking authorization rite…';

    // Step 1: /auth/authorize → authorization code
    fetch(AUTH.url + '/auth/authorize', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username:  username,
            password:  password,
            client_id: AUTH.clientId,
            scope:     AUTH.scope
        })
    })
    .then(function (r) {
        if (r.status === 401 || r.status === 403) {
            return r.json().then(function () {
                throw new Error('entity not recognized — access sealed');
            });
        }
        if (!r.ok) {
            return r.json().then(function (d) {
                throw new Error(d.detail || 'authorization failed (' + r.status + ')');
            });
        }
        return r.json();
    })
    .then(function (authData) {
        var code = authData.code || authData.authorization_code;
        if (!code) throw new Error('no authorization code received');

        statusEl.textContent = '⟳ seal accepted — exchanging token…';

        // Step 2: /auth/token → JWT
        return fetch(AUTH.url + '/auth/token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                grant_type:    'authorization_code',
                code:          code,
                client_id:     AUTH.clientId,
                client_secret: AUTH.clientSecret
            })
        });
    })
    .then(function (r) {
        if (!r.ok) {
            return r.json().then(function (d) {
                throw new Error(d.detail || 'token binding failed (' + r.status + ')');
            });
        }
        return r.json();
    })
    .then(function (tokenData) {
        var accessToken = tokenData.access_token;
        if (!accessToken) throw new Error('no token in response');

        // sessionStorage only — page refresh = re-login by design
        sessionStorage.setItem(AUTH.tokenKey, accessToken);
        if (tokenData.refresh_token) {
            sessionStorage.setItem(AUTH.refreshKey, tokenData.refresh_token);
        }
        sessionStorage.setItem(AUTH.userKey, username);

        btn.textContent  = 'Seal Broken — Entering';
        btn.style.background    = 'var(--blood-glow)';
        statusEl.style.color    = 'var(--bone)';
        statusEl.textContent    = '✓ portal unsealed — entering lab…';

        setTimeout(function () {
            window.location.replace('../dashboard/');
        }, 700);
    })
    .catch(function (err) {
        // Screen shake
        if (panelEl) {
            panelEl.classList.remove('shake');
            void panelEl.offsetWidth; // reflow
            panelEl.classList.add('shake');
        }
        btn.disabled     = false;
        btn.style.background = '';
        btn.textContent  = 'Unseal';
        statusEl.style.color = 'var(--blood-glow)';
        statusEl.textContent = '✗ ' + (err.message || 'ritual failed');
        setTimeout(function () {
            panelEl && panelEl.classList.remove('shake');
        }, 500);
    });
}
