// ===================== FIREBASE + KEYS ====================
const USERS_KEY = 'teslaUsers';
const SESSION_KEY = 'teslaSession';
const DEPOSIT_KEY = 'teslaDepositRequests';
const CAR_ORDERS_KEY = 'teslaCarOrders';
const PLANS_KEY = 'teslaPlanRequests';

const firebaseConfig = {
    apiKey: "AIzaSyAueqbCcGN_LKDTd6YnPkPcWSIufFqsqwM",
    authDomain: "fedex-4bdba.firebaseapp.com",
    projectId: "fedex-4bdba"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// ===================== FIREBASE HELPERS ====================
async function getUserByUid(uid) {
    if (!uid) return null;
    const doc = await db.collection('users').doc(uid).get();
    if (!doc.exists) return null;
    return { uid: doc.id, ...doc.data() };
}
async function getUserByEmail(email) {
    const snap = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { uid: doc.id, ...doc.data() };
}
async function getCarOrders() {
    const snap = await db.collection('carOrders').get();
    return snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
}
async function saveDeposit(deposit) {
    const id = deposit.firestoreId || String(deposit.id);
    const data = { ...deposit };
    delete data.firestoreId;
    await db.collection('depositRequests').doc(id).set(data, { merge: true });
}
async function savePlanRequest(plan) {
    const id = plan.firestoreId || String(plan.id);
    const data = { ...plan };
    delete data.firestoreId;
    await db.collection('planRequests').doc(id).set(data, { merge: true });
}
async function saveWithdrawal(withdrawal) {
    const id = withdrawal.firestoreId || String(withdrawal.id);
    const data = { ...withdrawal };
    delete data.firestoreId;
    await db.collection('withdrawalRequests').doc(id).set(data, { merge: true });
}
function waitForAuthUser() {
    return new Promise(resolve => {
        const unsub = auth.onAuthStateChanged(u => { unsub(); resolve(u); });
    });
}

// ==================== MODAL & TOAST ====================
function showModal(options) {
    const modal = document.getElementById('universalModal');
    const content = document.getElementById('universalModalContent');
    const icon = document.getElementById('universalIcon');
    const title = document.getElementById('universalTitle');
    const text = document.getElementById('universalText');
    const actions = document.getElementById('universalActions');

    content.classList.remove('shake');
    void content.offsetWidth;

    const type = options.type || 'info';
    const iconClass = {
        success: 'fa-check', error: 'fa-times',
        info: 'fa-info-circle', warning: 'fa-exclamation-triangle'
    }[type] || 'fa-info-circle';

    icon.className = 'universal-icon ' + type;
    icon.innerHTML = '<i class="fas ' + iconClass + '"></i>';
    title.className = 'universal-title ' + type;
    title.textContent = options.title || '';
    text.textContent = options.text || '';
    actions.innerHTML = '';

    if (type === 'error' || type === 'warning') content.classList.add('shake');

    (options.buttons || []).forEach(btn => {
        const b = document.createElement('button');
        b.className = btn.style === 'outline' ? 'btn-outline' : 'btn-primary btn-block';
        b.textContent = btn.label;
        if (btn.style !== 'outline') b.style.maxWidth = '100%';
        b.onclick = () => { if (btn.action) btn.action(); };
        actions.appendChild(b);
    });
    modal.style.display = 'flex';
}
function hideModal() {
    const m = document.getElementById('universalModal');
    if (m) m.style.display = 'none';
}
document.addEventListener('click', (e) => {
    if (e.target.id === 'universalModal') hideModal();
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const iconMap = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle' };
    toast.innerHTML = `<i class="fas ${iconMap[type] || 'fa-info-circle'}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 400);
    }, 2600);
}
function setButtonLoading(btn, isLoading) {
    if (!btn) return;
    if (isLoading) btn.classList.add('btn-loading');
    else btn.classList.remove('btn-loading');
}
function shakeInput(input) {
    if (!input) return;
    input.classList.add('input-error');
    setTimeout(() => input.classList.remove('input-error'), 600);
}

// ==================== CAR DATA ====================
const CARS = [
    { id: 1, name: 'Model 3 Standard', price: 38630, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4962.jpeg' },
    { id: 2, name: 'Model 3 Premium', price: 44130, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4963.jpeg' },
    { id: 3, name: 'Model 3 Performance', price: 56630, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4964.jpeg' },
    { id: 4, name: 'Model Y', price: 45000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4965.jpeg' },
    { id: 5, name: 'Model Y Long Range', price: 45000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4966.jpeg' },
    { id: 6, name: 'Model Y Performance', price: 55000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4967.jpeg' },
    { id: 7, name: 'Cybertruck AWD', price: 80000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4968.jpeg' },
    { id: 8, name: 'Cybertruck Cyberbeast', price: 112000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4969.jpeg' },
    { id: 9, name: 'Model S Plaid', price: 96000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4975.jpeg' },
    { id: 10, name: 'Model X Plaid', price: 90000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4971.jpeg' },
    { id: 11, name: 'Model Y L', price: 60000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4965.jpeg' },
    { id: 12, name: 'Cybercab', price: 29000, img: 'https://raw.githubusercontent.com/express-02/Image-/refs/heads/main/IMG_4973.jpeg' }
];
const DELIVERY_FEE = 800;

// ==================== LANDING PAGE ====================
if (document.getElementById('investHero')) {
    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');

    const openMenu = () => { sideMenu.classList.add('open'); menuOverlay.classList.add('open'); };
    const closeMenu = () => { sideMenu.classList.remove('open'); menuOverlay.classList.remove('open'); };
    const openLogin = () => { loginModal.style.display = 'flex'; };
    const openSignup = () => { signupModal.style.display = 'flex'; };

    document.getElementById('navMenu').onclick = (e) => { e.preventDefault(); openMenu(); };
    document.getElementById('closeMenu').onclick = closeMenu;
    menuOverlay.onclick = closeMenu;

    document.getElementById('navLogin').onclick = (e) => { e.preventDefault(); openLogin(); };
    document.getElementById('btnInvest').onclick = () => {
        if (JSON.parse(localStorage.getItem(SESSION_KEY))) { window.location.href = 'dashboard.html'; return; }
        openLogin();
    };
    document.getElementById('btnShop').onclick = () => {
        if (JSON.parse(localStorage.getItem(SESSION_KEY))) { window.location.href = 'dashboard.html'; return; }
        openLogin();
    };
    document.getElementById('closeLogin').onclick = () => loginModal.style.display = 'none';
    document.getElementById('closeSignup').onclick = () => signupModal.style.display = 'none';
    document.getElementById('menuLogin').onclick = (e) => { e.preventDefault(); closeMenu(); openLogin(); };
    document.getElementById('menuSignup').onclick = (e) => { e.preventDefault(); closeMenu(); openSignup(); };
    document.getElementById('showSignup').onclick = (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
    };

    // SIGNUP
    document.getElementById('signupForm').onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('signupSubmitBtn');
        setButtonLoading(submitBtn, true);
        const email = document.getElementById('regEmail').value.trim();
        const emailInput = document.getElementById('regEmail');
        const password = document.getElementById('regPassword').value;

        try {
            const cred = await auth.createUserWithEmailAndPassword(email, password);
            const userData = {
                name: document.getElementById('regName').value.trim(),
                email: email,
                state: document.getElementById('regState').value.trim(),
                postal: document.getElementById('regPostal').value.trim(),
                dob: document.getElementById('regDob').value,
                balance: 0, stocks: 0, invested: 0,
                status: 'pending', role: 'user',
                createdAt: new Date().toISOString()
            };
            await db.collection('users').doc(cred.user.uid).set(userData);
            localStorage.removeItem(SESSION_KEY);
            await auth.signOut();
            setButtonLoading(submitBtn, false);

            showModal({
                type: 'success',
                title: 'Account Created!',
                text: "Your account has been submitted for verification.\nOur admin team will review and approve it shortly.\n\nYou'll be able to log in once approved.",
                buttons: [{ label: 'GOT IT', style: 'primary', action: () => { hideModal(); signupModal.style.display = 'none'; } }]
            });
        } catch (error) {
            console.error('SIGNUP ERROR:', error);
            setButtonLoading(submitBtn, false);
            if (error.code === 'auth/email-already-in-use') {
                shakeInput(emailInput);
                showModal({
                    type: 'error',
                    title: 'Email Already Exists',
                    text: "An account with this email already exists.\nPlease log in instead, or use a different email.",
                    buttons: [
                        { label: 'TRY AGAIN', style: 'primary', action: () => hideModal() },
                        { label: 'GO TO LOGIN', style: 'outline', action: () => { hideModal(); signupModal.style.display = 'none'; openLogin(); } }
                    ]
                });
                return;
            }
            if (error.code === 'auth/weak-password') {
                shakeInput(document.getElementById('regPassword'));
                showModal({
                    type: 'error', title: 'Password Too Weak',
                    text: 'Please use a stronger password and try again.',
                    buttons: [{ label: 'TRY AGAIN', style: 'primary', action: () => hideModal() }]
                });
                return;
            }
            showModal({
                type: 'error', title: 'Signup Error',
                text: 'We could not create your account.\nPlease check your information and try again.',
                buttons: [{ label: 'TRY AGAIN', style: 'primary', action: () => hideModal() }]
            });
        }
    };

    // ==================== LOGIN (FIXED ERROR MESSAGES) ====================
    document.getElementById('loginForm').onsubmit = async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('loginSubmitBtn');
        setButtonLoading(submitBtn, true);

        const emailInput = document.getElementById('loginEmail');
        const passInput = document.getElementById('loginPassword');
        const enteredEmail = emailInput.value.trim();
        const enteredPass = passInput.value;

        try {
            const cred = await auth.signInWithEmailAndPassword(enteredEmail, enteredPass);
            const user = await getUserByUid(cred.user.uid);

            if (!user) {
                await auth.signOut();
                setButtonLoading(submitBtn, false);
                showModal({
                    type: 'warning',
                    title: "You're Not a User Yet!",
                    text: "We couldn't find your customer profile.\nPlease sign up again.",
                    buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }]
                });
                return;
            }

            if (user.status !== 'approved') {
                await auth.signOut();
                setButtonLoading(submitBtn, false);
                showModal({
                    type: 'info', title: 'Account Not Approved',
                    text: "Your account is still pending admin approval.\nYou'll be able to log in once our team verifies your account.",
                    buttons: [{ label: 'OK, GOT IT', style: 'primary', action: () => hideModal() }]
                });
                return;
            }

            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
            setButtonLoading(submitBtn, false);
            showToast('Login successful. Redirecting…', 'success');
            setTimeout(() => { window.location.href = 'dashboard.html'; }, 800);

        } catch (error) {
            console.error('LOGIN ERROR:', error);
            setButtonLoading(submitBtn, false);

            // Firebase returns 'auth/invalid-credential' for BOTH wrong password
            // AND unknown email. So we check Firestore to figure out which one it is.
            let userProfileExists = null;
            try {
                userProfileExists = await getUserByEmail(enteredEmail);
            } catch (e) { /* ignore */ }

            // ---- WRONG PASSWORD ----
            if (
                error.code === 'auth/wrong-password' ||
                (error.code === 'auth/invalid-credential' && userProfileExists)
            ) {
                shakeInput(passInput);
                showModal({
                    type: 'error',
                    title: 'Incorrect Password',
                    text: "The password you entered is incorrect.\nPlease check and try again.",
                    buttons: [
                        { label: 'TRY AGAIN', style: 'primary', action: () => hideModal() }
                    ]
                });
                return;
            }

            // ---- NOT A USER ----
            if (
                error.code === 'auth/user-not-found' ||
                (error.code === 'auth/invalid-credential' && !userProfileExists)
            ) {
                shakeInput(emailInput);
                shakeInput(passInput);
                showModal({
                    type: 'warning',
                    title: "You're Not a User Yet!",
                    text: "We couldn't find an account with this email.\nPlease sign up to get started.",
                    buttons: [
                        { label: 'SIGN UP NOW', style: 'primary', action: () => { hideModal(); loginModal.style.display = 'none'; openSignup(); } },
                        { label: 'TRY AGAIN', style: 'outline', action: () => hideModal() }
                    ]
                });
                return;
            }

            // ---- OTHER ----
            showModal({
                type: 'error',
                title: 'Login Error',
                text: 'We could not complete your login.\nPlease try again.',
                buttons: [{ label: 'TRY AGAIN', style: 'primary', action: () => hideModal() }]
            });
        }
    };
}

// ==================== DASHBOARD ====================
async function initDashboard() {
    let session = JSON.parse(localStorage.getItem(SESSION_KEY)) || {};

    // ---------- Tab switching ----------
    const switchTab = (target) => {
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        const el = document.getElementById(`tab-${target}`);
        if (el) el.classList.add('active');
        document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
        const top = document.querySelector(`.tab-btn[data-tab="${target}"]`);
        if (top) top.classList.add('active');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        const bot = document.querySelector(`.nav-item[data-target="${target}"]`);
        if (bot) bot.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // ---------- Menu ----------
    const dashMenu = document.getElementById('dashMenu');
    const dashOverlay = document.getElementById('dashMenuOverlay');
    if (dashMenu && dashOverlay) {
        document.getElementById('dashMenuBtn').onclick = () => { dashMenu.classList.add('open'); dashOverlay.classList.add('open'); };
        document.getElementById('closeDashMenu').onclick = () => { dashMenu.classList.remove('open'); dashOverlay.classList.remove('open'); };
        dashOverlay.onclick = () => { dashMenu.classList.remove('open'); dashOverlay.classList.remove('open'); };
        document.querySelectorAll('#dashMenu .side-menu-links a').forEach(link => {
            link.onclick = (e) => {
                e.preventDefault();
                dashMenu.classList.remove('open'); dashOverlay.classList.remove('open');
                switchTab(link.dataset.target);
            };
        });
    }

    document.querySelectorAll('.tab-btn').forEach(t => t.onclick = () => switchTab(t.dataset.tab));
    document.querySelectorAll('.nav-item').forEach(n => n.onclick = () => switchTab(n.dataset.target));

    // ---------- Live ticker ----------
    const tickers = {
        tsla: 245.50, rivn: 15.80, lcid: 3.45, nio: 5.20,
        xpev: 8.10, li: 25.40, f: 12.30
    };
    const tickerIds = {
        tsla: { p: 'tickTsla', c: 'tickTslaPct' }, rivn: { p: 'tickRivn', c: 'tickRivnPct' },
        lcid: { p: 'tickLcid', c: 'tickLcidPct' }, nio: { p: 'tickNio', c: 'tickNioPct' },
        xpev: { p: 'tickXpev', c: 'tickXpevPct' }, li: { p: 'tickLi', c: 'tickLiPct' },
        f: { p: 'tickF', c: 'tickFPct' }
    };
    function tick() {
        Object.keys(tickers).forEach(k => {
            const old = tickers[k];
            const change = (Math.random() - 0.5) * old * 0.004;
            const nw = old + change;
            const pct = ((nw - old) / old) * 100;
            tickers[k] = nw;
            const pEl = document.getElementById(tickerIds[k].p);
            const cEl = document.getElementById(tickerIds[k].c);
            if (!pEl) return;
            pEl.textContent = '$' + nw.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const up = pct >= 0;
            pEl.classList.remove('flash-up', 'flash-down');
            void pEl.offsetWidth;
            pEl.classList.add(up ? 'flash-up' : 'flash-down');
            if (cEl) {
                cEl.textContent = (up ? '+' : '') + pct.toFixed(2) + '%';
                cEl.className = 'tick-pct ' + (up ? 'green' : 'red');
            }
        });
    }
    setInterval(tick, 3500);

    // ---------- Stocks ----------
    const stocks = [
        { symbol: 'TSLA', name: 'Tesla, Inc.', price: 245.50, exchange: 'NASDAQ' },
        { symbol: 'RIVN', name: 'Rivian Automotive', price: 15.80, exchange: 'NASDAQ' },
        { symbol: 'LCID', name: 'Lucid Group', price: 3.45, exchange: 'NASDAQ' },
        { symbol: 'NIO', name: 'NIO Inc.', price: 5.20, exchange: 'NYSE' },
        { symbol: 'XPEV', name: 'XPeng Inc.', price: 8.10, exchange: 'NYSE' },
        { symbol: 'LI', name: 'Li Auto Inc.', price: 25.40, exchange: 'NASDAQ' },
        { symbol: 'F', name: 'Ford Motor Company', price: 12.30, exchange: 'NYSE' }
    ];

    const plansListEl = document.getElementById('plansList');
    if (plansListEl) {
        plansListEl.innerHTML = stocks.map(s => `
            <div class="plan-item">
                <div class="plan-header">
                    <span class="plan-tier">${s.exchange}</span>
                    <div class="plan-return">${s.symbol}<span>Stock</span></div>
                </div>
                <div class="plan-name">${s.name}</div>
                <div class="plan-price">$${s.price.toFixed(2)}<small>/ share</small></div>
                <ul class="plan-features">
                    <li><i class="fas fa-check"></i> Ticker: ${s.symbol}</li>
                    <li><i class="fas fa-check"></i> Exchange: ${s.exchange}</li>
                    <li><i class="fas fa-check"></i> Market Order</li>
                </ul>
                <button class="plan-buy" data-name="${s.name}" data-symbol="${s.symbol}" data-price="${s.price}">BUY STOCK</button>
            </div>
        `).join('');
    }

    // ---------- Stock buy modal ----------
    const planModal = document.getElementById('planPaymentModal');
    document.querySelectorAll('.plan-buy').forEach(btn => {
        btn.onclick = () => {
            const price = parseFloat(btn.dataset.price);
            document.getElementById('planPayName').textContent = btn.dataset.name;
            document.getElementById('planPayBadge').textContent = btn.dataset.symbol;
            document.getElementById('planPayPriceDisplay').textContent = '$' + price.toFixed(2);
            planModal.dataset.pricePerShare = price;
            planModal.dataset.planName = btn.dataset.name;
            planModal.dataset.planSymbol = btn.dataset.symbol;
            document.getElementById('shareQuantity').value = 1;
            document.getElementById('planPayAmount').textContent = '$' + price.toFixed(2);
            planModal.style.display = 'flex';
        };
    });
    const shareQtyEl = document.getElementById('shareQuantity');
    if (shareQtyEl) {
        shareQtyEl.addEventListener('input', function () {
            const qty = parseInt(this.value) || 0;
            const price = parseFloat(planModal.dataset.pricePerShare) || 0;
            document.getElementById('planPayAmount').textContent = '$' + (qty * price).toFixed(2);
        });
    }
    document.getElementById('closePlanPayment').onclick = () => { planModal.style.display = 'none'; };

    document.getElementById('btnConfirmPlanPayment').onclick = async () => {
        const qty = parseInt(document.getElementById('shareQuantity').value) || 1;
        const pricePerShare = parseFloat(planModal.dataset.pricePerShare);
        const totalCost = qty * pricePerShare;
        const stockName = planModal.dataset.planName;
        const stockSymbol = planModal.dataset.planSymbol;
        const fbUser = auth.currentUser;
        if (qty < 1) {
            shakeInput(document.getElementById('shareQuantity'));
            showModal({ type: 'error', title: 'Invalid Quantity', text: 'Please enter at least 1 share.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
            return;
        }
        if (!fbUser) { window.location.href = 'index.html'; return; }
        try {
            const user = await getUserByUid(fbUser.uid);
            if (!user) return;
            await savePlanRequest({
                id: Date.now(), userUid: fbUser.uid, userEmail: user.email, userName: user.name,
                planName: `${stockName} (${stockSymbol}) - ${qty} shares`,
                amount: totalCost, status: 'pending', requestedAt: new Date().toISOString()
            });
            planModal.style.display = 'none';
            showModal({
                type: 'success', title: 'Stock Purchase Submitted',
                text: `${qty} share${qty > 1 ? 's' : ''} of ${stockName} (${stockSymbol})\nTotal Cost: $${totalCost.toFixed(2)}\n\nSend payment to:\n1D3FiQUNbT4aT9yUN4sWry3rFiSA8neuCQ\n\nYour order will be executed once the admin confirms your payment.`,
                buttons: [{ label: 'GOT IT', style: 'primary', action: () => hideModal() }]
            });
        } catch (err) {
            console.error('PLAN REQUEST ERROR:', err);
            showModal({ type: 'error', title: 'Request Error', text: 'Your stock request could not be submitted.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
        }
    };

    // ---------- Cars ----------
    const carGrid = document.getElementById('carGrid');
    if (carGrid) {
        carGrid.innerHTML = CARS.map(car => `
            <div class="car-card">
                <img src="${car.img}" alt="${car.name}">
                <div class="car-card-body">
                    <h4>${car.name}</h4>
                    <p class="car-price">$${car.price.toLocaleString()}</p>
                    <button class="btn-buy" data-id="${car.id}">BUY NOW</button>
                </div>
            </div>
        `).join('');
        document.querySelectorAll('.btn-buy').forEach(btn => {
            btn.onclick = () => {
                const car = CARS.find(c => c.id == btn.dataset.id);
                document.getElementById('purchaseCarName').textContent = `${car.name} — $${car.price.toLocaleString()}`;
                document.getElementById('purchaseModal').style.display = 'flex';
                document.getElementById('purchaseModal').dataset.carId = car.id;
            };
        });
    }
    document.getElementById('closePurchase').onclick = () => { document.getElementById('purchaseModal').style.display = 'none'; };

    // ---------- Deposit UI ----------
    let depAmount = 0;
    const depStep1 = document.getElementById('step1Card');
    const depStep2 = document.getElementById('step2Card');
    const depStep3 = document.getElementById('step3Card');
    const depCustom = document.getElementById('customAmount');
    const depBtns = document.querySelectorAll('#amountGrid .amount-btn');

    depBtns.forEach(btn => {
        btn.onclick = () => {
            depBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            depAmount = parseInt(btn.dataset.amount);
            depCustom.value = '';
        };
    });
    if (depCustom) {
        depCustom.oninput = () => {
            depBtns.forEach(b => b.classList.remove('active'));
            depAmount = parseFloat(depCustom.value) || 0;
        };
    }

    document.getElementById('btnContinueDeposit').onclick = () => {
        if (!depAmount || depAmount < 100) {
            shakeInput(depCustom);
            showModal({ type: 'error', title: 'Invalid Amount', text: 'The minimum deposit is $100.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
            return;
        }
        document.getElementById('depositAmountDisplay').textContent = '$' + depAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        depStep1.style.display = 'none';
        depStep2.style.display = 'block';
        depStep2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    document.getElementById('btnBackDeposit').onclick = () => { depStep2.style.display = 'none'; depStep1.style.display = 'block'; };
    document.getElementById('btnNotifyDeposit').onclick = async () => {
        const fbUser = auth.currentUser;
        if (!fbUser) return;
        try {
            const user = await getUserByUid(fbUser.uid);
            if (!user) return;
            await saveDeposit({
                id: Date.now(), userUid: fbUser.uid, name: user.name, email: user.email,
                amount: depAmount, method: 'BTC', wallet: '1D3FiQUNbT4aT9yUN4sWry3rFiSA8neuCQ',
                status: 'pending', requestedAt: new Date().toISOString()
            });
            document.getElementById('successAmount').textContent = '$' + depAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            depStep2.style.display = 'none';
            depStep3.style.display = 'block';
            depStep3.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } catch (err) {
            console.error('DEPOSIT ERROR:', err);
            showModal({ type: 'error', title: 'Request Error', text: 'Your request could not be submitted.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
        }
    };
    document.getElementById('btnNewDeposit').onclick = () => {
        depAmount = 0; depCustom.value = '';
        depBtns.forEach(b => b.classList.remove('active'));
        depStep3.style.display = 'none';
        depStep1.style.display = 'block';
        depStep1.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ---------- Withdraw UI ----------
    let wAmount = 0;
    let wMethod = null;
    let wDetails = {};

    const wStep1 = document.getElementById('wStep1');
    const wStep2 = document.getElementById('wStep2');
    const wStep3 = document.getElementById('wStep3');
    const wStep4 = document.getElementById('wStep4');

    const wAmountInput = document.getElementById('withdrawAmount');
    const wPercentBtns = document.querySelectorAll('[data-wpercent]');

    wPercentBtns.forEach(btn => {
        btn.onclick = () => {
            const pct = parseInt(btn.dataset.wpercent);
            const bal = Number(session.balance || 0);
            const calc = Math.floor((bal * pct / 100) * 100) / 100;
            wAmountInput.value = calc;
            wAmount = calc;
            wPercentBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
    });

    if (wAmountInput) {
        wAmountInput.oninput = () => {
            wAmount = parseFloat(wAmountInput.value) || 0;
            wPercentBtns.forEach(b => b.classList.remove('active'));
        };
    }

    document.getElementById('wMethodCrypto').onclick = () => {
        wMethod = 'crypto';
        document.getElementById('wMethodCrypto').classList.add('active');
        document.getElementById('wMethodBank').classList.remove('active');
    };
    document.getElementById('wMethodBank').onclick = () => {
        wMethod = 'bank';
        document.getElementById('wMethodBank').classList.add('active');
        document.getElementById('wMethodCrypto').classList.remove('active');
    };

    document.getElementById('wBtnContinue').onclick = () => {
        const bal = Number(session.balance || 0);

        if (!wAmount || wAmount < 50) {
            shakeInput(wAmountInput);
            showModal({ type: 'error', title: 'Invalid Amount', text: 'Minimum withdrawal is $50.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
            return;
        }
        if (wAmount > bal) {
            shakeInput(wAmountInput);
            showModal({ type: 'error', title: 'Insufficient Balance', text: `You only have $${bal.toFixed(2)} available.`, buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
            return;
        }
        if (!wMethod) {
            showModal({ type: 'error', title: 'Select Method', text: 'Please choose a withdrawal method.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
            return;
        }

        document.getElementById('wCryptoFields').style.display = wMethod === 'crypto' ? 'block' : 'none';
        document.getElementById('wBankFields').style.display = wMethod === 'bank' ? 'block' : 'none';
        document.getElementById('wStep2Label').textContent = wMethod === 'crypto'
            ? 'Enter your Bitcoin wallet address.'
            : 'Enter your bank account details.';

        wStep1.style.display = 'none';
        wStep2.style.display = 'block';
        wStep2.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    document.getElementById('wBtnBack1').onclick = () => { wStep2.style.display = 'none'; wStep1.style.display = 'block'; };

    document.getElementById('wBtnReview').onclick = () => {
        if (wMethod === 'crypto') {
            const addr = document.getElementById('wCryptoAddress').value.trim();
            if (!addr || addr.length < 20) {
                shakeInput(document.getElementById('wCryptoAddress'));
                showModal({ type: 'error', title: 'Invalid Address', text: 'Please enter a valid Bitcoin wallet address.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
                return;
            }
            wDetails = { type: 'crypto', wallet: addr };
        } else {
            const bankName = document.getElementById('wBankName').value.trim();
            const accName = document.getElementById('wAccountName').value.trim();
            const accNum = document.getElementById('wAccountNumber').value.trim();
            if (!bankName || !accName || !accNum) {
                showModal({ type: 'error', title: 'Missing Details', text: 'Please fill in all bank details.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
                return;
            }
            wDetails = { type: 'bank', bank: bankName, accountName: accName, accountNumber: accNum };
        }

        document.getElementById('wReviewAmount').textContent = '$' + wAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        document.getElementById('wReviewMethod').textContent = wMethod === 'crypto' ? 'Bitcoin (BTC)' : 'Bank Transfer';
        document.getElementById('wReviewReceive').textContent = '$' + wAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const detailsBox = document.getElementById('wReviewDetails');
        if (wMethod === 'crypto') {
            detailsBox.innerHTML = `<div class="summary-row"><span>Wallet Address</span><span style="font-size:0.7rem; color:var(--green); word-break:break-all;">${wDetails.wallet}</span></div>`;
        } else {
            detailsBox.innerHTML = `
                <div class="summary-row"><span>Bank</span><span>${wDetails.bank}</span></div>
                <div class="summary-row"><span>Account Name</span><span>${wDetails.accountName}</span></div>
                <div class="summary-row"><span>Account Number</span><span>${wDetails.accountNumber}</span></div>
            `;
        }

        wStep2.style.display = 'none';
        wStep3.style.display = 'block';
        wStep3.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    document.getElementById('wBtnBack2').onclick = () => { wStep3.style.display = 'none'; wStep2.style.display = 'block'; };

    document.getElementById('wBtnConfirm').onclick = async () => {
        const btn = document.getElementById('wBtnConfirm');
        setButtonLoading(btn, true);
        const fbUser = auth.currentUser;
        if (!fbUser) { window.location.href = 'index.html'; return; }

        try {
            const userRef = db.collection('users').doc(fbUser.uid);
            const withdrawalId = Date.now();

            await db.runTransaction(async tx => {
                const snap = await tx.get(userRef);
                if (!snap.exists) throw new Error('USER_NOT_FOUND');
                const u = snap.data();
                const bal = Number(u.balance || 0);
                if (bal < wAmount) throw new Error('INSUFFICIENT_FUNDS');

                tx.update(userRef, { balance: bal - wAmount });
                tx.set(db.collection('withdrawalRequests').doc(String(withdrawalId)), {
                    id: withdrawalId,
                    userUid: fbUser.uid,
                    userEmail: u.email,
                    userName: u.name,
                    amount: wAmount,
                    method: wMethod,
                    details: wDetails,
                    status: 'pending',
                    requestedAt: new Date().toISOString()
                });
            });

            await saveWithdrawal({
                id: withdrawalId,
                userUid: fbUser.uid,
                userEmail: session.email,
                userName: session.name,
                amount: wAmount,
                method: wMethod,
                details: wDetails,
                status: 'pending',
                requestedAt: new Date().toISOString()
            });

            const updated = await getUserByUid(fbUser.uid);
            if (updated) {
                session = updated;
                localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
            }

            document.getElementById('wSuccessAmount').textContent = '$' + wAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            document.getElementById('wSuccessMethod').textContent = wMethod === 'crypto' ? 'Bitcoin (BTC)' : 'Bank Transfer';

            wStep3.style.display = 'none';
            wStep4.style.display = 'block';
            wStep4.scrollIntoView({ behavior: 'smooth', block: 'start' });

            setButtonLoading(btn, false);
            await updateUI();

        } catch (err) {
            console.error('WITHDRAWAL ERROR:', err);
            setButtonLoading(btn, false);

            if (err.message === 'INSUFFICIENT_FUNDS') {
                showModal({ type: 'error', title: 'Insufficient Funds', text: 'Your balance is too low for this withdrawal.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
                return;
            }

            showModal({ type: 'error', title: 'Withdrawal Error', text: 'Could not submit your withdrawal. Please try again.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
        }
    };

    document.getElementById('wBtnNew').onclick = () => {
        wAmount = 0; wMethod = null; wDetails = {};
        wAmountInput.value = '';
        document.getElementById('wCryptoAddress').value = '';
        document.getElementById('wBankName').value = '';
        document.getElementById('wAccountName').value = '';
        document.getElementById('wAccountNumber').value = '';
        document.getElementById('wMethodCrypto').classList.remove('active');
        document.getElementById('wMethodBank').classList.remove('active');
        wPercentBtns.forEach(b => b.classList.remove('active'));
        wStep4.style.display = 'none';
        wStep1.style.display = 'block';
        wStep1.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // ---------- Logout ----------
    document.getElementById('btnLogout').onclick = () => {
        showToast('Logging out…', 'info');
        setTimeout(async () => {
            localStorage.removeItem(SESSION_KEY);
            await auth.signOut();
            window.location.href = 'index.html';
        }, 800);
    };

    // ---------- Copy helpers ----------
    window.copyAddress = function () {
        const el = document.getElementById('btcAddress');
        navigator.clipboard.writeText(el.innerText).then(() => showToast('Wallet address copied', 'success'));
    };
    window.copyPlanAddress = function () {
        const el = document.getElementById('planBtcAddress');
        navigator.clipboard.writeText(el.innerText).then(() => showToast('Wallet address copied', 'success'));
    };

    // ============================================================
    // FIREBASE (wrapped so UI still works if Firestore errors)
    // ============================================================
    try {
        const fbUser = await waitForAuthUser();
        if (!fbUser) {
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'index.html';
            return;
        }

        const profile = await getUserByUid(fbUser.uid);
        if (!profile) {
            await auth.signOut();
            localStorage.removeItem(SESSION_KEY);
            window.location.href = 'index.html';
            return;
        }

        session = profile;
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        const updateUI = async () => {
            let user;
            try {
                user = await getUserByUid(auth.currentUser ? auth.currentUser.uid : session.uid);
            } catch (e) { user = session; }
            if (!user) return;
            session = user;
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));

            document.getElementById('userBalance').textContent = `$${(user.balance || 0).toFixed(2)}`;
            document.getElementById('userStocks').textContent = `$${(user.stocks || 0).toFixed(2)}`;
            document.getElementById('userInvested').textContent = `$${(user.invested || 0).toFixed(2)}`;
            document.getElementById('userAvatar').textContent = (user.name || 'U').substring(0, 2).toUpperCase();
            document.getElementById('profileAvatarLarge').textContent = (user.name || 'U').substring(0, 2).toUpperCase();
            document.getElementById('heroName').textContent = user.name || '-';
            document.getElementById('heroEmail').textContent = user.email || '-';

            const wAvail = document.getElementById('withdrawAvailableBalance');
            if (wAvail) wAvail.textContent = '$' + (user.balance || 0).toFixed(2);

            const heroStatus = document.getElementById('heroStatus');
            if (user.status === 'approved') {
                heroStatus.className = 'verified-badge';
                heroStatus.innerHTML = '<i class="fas fa-check-circle"></i> VERIFIED';
            } else if (user.status === 'pending') {
                heroStatus.className = 'verified-badge pending';
                heroStatus.innerHTML = '<i class="fas fa-hourglass-half"></i> PENDING APPROVAL';
            } else {
                heroStatus.className = 'verified-badge blocked';
                heroStatus.innerHTML = '<i class="fas fa-ban"></i> BLOCKED';
            }

            document.getElementById('profBalance').textContent = `$${(user.balance || 0).toFixed(0)}`;
            document.getElementById('profStocks').textContent = `$${(user.stocks || 0).toFixed(0)}`;
            document.getElementById('profInvested').textContent = `$${(user.invested || 0).toFixed(0)}`;
            document.getElementById('profName').textContent = user.name || '-';
            document.getElementById('profEmail').textContent = user.email || '-';
            document.getElementById('profState').textContent = user.state || 'N/A';
            document.getElementById('profPostal').textContent = user.postal || 'N/A';
            document.getElementById('profDob').textContent = user.dob || 'N/A';
            document.getElementById('profStatus').textContent = (user.status || 'pending').toUpperCase();
            document.getElementById('profStatus').className = `badge ${user.status || 'pending'}`;
            document.getElementById('profSince').textContent = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                : 'N/A';

            try {
                const orders = (await getCarOrders()).filter(o => o.userEmail === user.email);
                const list = document.getElementById('pendingCarsList');
                if (orders.length === 0) list.innerHTML = '<p class="small-note">No pending car deliveries.</p>';
                else list.innerHTML = orders.map(o => `
                    <div class="car-status-card">
                        <h4>${o.carName}</h4>
                        <p>Status: ${o.status.replace('_', ' ').toUpperCase()}</p>
                        <p>Delivery Fee: $${o.deliveryFee} (pending)</p>
                        <p style="font-size:0.65rem; margin-top:5px;">Ordered: ${new Date(o.purchasedAt).toLocaleDateString()}</p>
                    </div>
                `).join('');
            } catch (e) { console.warn('Could not load car orders:', e); }
        };

        await updateUI();

        // Car purchase
        document.getElementById('purchaseForm').onsubmit = async (e) => {
            e.preventDefault();
            const carId = parseInt(document.getElementById('purchaseModal').dataset.carId);
            const car = CARS.find(c => c.id === carId);
            const fbUser2 = auth.currentUser;
            if (!fbUser2) { window.location.href = 'index.html'; return; }

            const userRef = db.collection('users').doc(fbUser2.uid);
            const orderId = Date.now();

            try {
                await db.runTransaction(async tx => {
                    const snap = await tx.get(userRef);
                    if (!snap.exists) throw new Error('USER_NOT_FOUND');
                    const u = snap.data();
                    const bal = Number(u.balance || 0);
                    if (bal < car.price) throw new Error('INSUFFICIENT_FUNDS');

                    tx.update(userRef, { balance: bal - car.price });
                    tx.set(db.collection('carOrders').doc(String(orderId)), {
                        id: orderId, userEmail: u.email, userName: u.name, userUid: fbUser2.uid,
                        carId: car.id, carName: car.name, carPrice: car.price,
                        deliveryFee: DELIVERY_FEE,
                        buyerInfo: {
                            name: document.getElementById('buyName').value,
                            phone: document.getElementById('buyPhone').value,
                            address: document.getElementById('buyAddress').value,
                            city: document.getElementById('buyCity').value,
                            postal: document.getElementById('buyPostal').value
                        },
                        status: 'pending_delivery', purchasedAt: new Date().toISOString()
                    });
                });

                const updated = await getUserByUid(fbUser2.uid);
                if (updated) { session = updated; localStorage.setItem(SESSION_KEY, JSON.stringify(updated)); }

                document.getElementById('purchaseModal').style.display = 'none';
                showModal({
                    type: 'success', title: 'Order Confirmed!',
                    text: `${car.name} — $${car.price.toLocaleString()}\nDeducted from your balance.\n\nNEXT STEP — PAY DELIVERY FEE\n\nTo start your shipment, pay the $${DELIVERY_FEE} delivery fee to:\n1D3FiQUNbT4aT9yUN4sWry3rFiSA8neuCQ\n\nThen contact Customer Service to schedule delivery.`,
                    buttons: [{ label: 'GOT IT', style: 'primary', action: () => hideModal() }]
                });
                await updateUI();
            } catch (err) {
                console.error('CAR PURCHASE ERROR:', err);
                if (err.message === 'INSUFFICIENT_FUNDS') {
                    const bal = Number(session.balance || 0);
                    const shortfall = car.price - bal;
                    document.getElementById('purchaseModal').style.display = 'none';
                    showModal({
                        type: 'warning', title: 'Insufficient Funds',
                        text: `Car: ${car.name}\nPrice: $${car.price.toLocaleString()}\nYour Balance: $${bal.toFixed(2)}\nShortfall: $${shortfall.toLocaleString()}\n\nPlease deposit funds and try again.`,
                        buttons: [
                            { label: 'GO TO DEPOSIT', style: 'primary', action: () => { hideModal(); switchTab('deposit'); } },
                            { label: 'CANCEL', style: 'outline', action: () => hideModal() }
                        ]
                    });
                    return;
                }
                showModal({ type: 'error', title: 'Order Error', text: 'We could not complete the order.', buttons: [{ label: 'OK', style: 'primary', action: () => hideModal() }] });
            }
        };

        // Real-time listener
        try {
            db.collection('users').doc(fbUser.uid).onSnapshot(async snap => {
                if (!snap.exists) return;
                const u = { uid: snap.id, ...snap.data() };
                session = u;
                localStorage.setItem(SESSION_KEY, JSON.stringify(u));
                await updateUI();
                if (u.status === 'blocked') {
                    localStorage.removeItem(SESSION_KEY);
                    await auth.signOut();
                    showModal({
                        type: 'warning', title: 'Account Blocked',
                        text: 'Your account has been blocked by the administrator.',
                        buttons: [{ label: 'OK', style: 'primary', action: () => { hideModal(); window.location.href = 'index.html'; } }]
                    });
                }
            });
        } catch (e) { console.warn('Real-time listener failed:', e); }

    } catch (firebaseError) {
        console.warn('Firebase setup error (UI still works):', firebaseError);
    }
}