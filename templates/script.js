/* ============================================
   Tailwind Configuration
   ============================================ */

tailwind.config = {
    theme: {
        extend: {
            colors: {
                cream: '#efebe0',
                doodleYellow: '#eab308',
                doodlePink: '#f472b6',
                doodleGreen: '#34d399',
                doodleRed: '#f87171',
                doodleBlue: '#38bdf8',
                paperMain: '#ffffff',
                paperRuled: '#fbf9f1'
            },
            fontFamily: {
                sans: ['Fredoka', 'sans-serif'],
                hand: ['Caveat', 'cursive'],
                readable: ['Nunito', 'sans-serif'],
            }
        }
    }
};

/* ============================================
   Application JavaScript
   ============================================ */

const randomCat = "https://cataas.com/cat?width=400&height=400";
let currentCatUrl = "";

// Load a fresh CATAAS cat image on page load
window.addEventListener('DOMContentLoaded', () => {
    currentCatUrl = randomCat;
    document.getElementById('waiting-cat-img').src = currentCatUrl;
});

// PaySim Scenarios - Pre-configured test cases
const scenarios = {
    fraud1: {
        step: 187,
        type: 'TRANSFER',
        amount: 481572.00,
        oldbalanceOrg: 481572.00,
        newbalanceOrig: 0.00,
        oldbalanceDest: 0.00,
        newbalanceDest: 0.00
    },
    fraud2: {
        step: 463,
        type: 'CASH_OUT',
        amount: 292741.50,
        oldbalanceOrg: 292741.50,
        newbalanceOrig: 0.00,
        oldbalanceDest: 60123.00,
        newbalanceDest: 60123.00
    },
    fraud3: {
        step: 312,
        type: 'TRANSFER',
        amount: 1900000.00,
        oldbalanceOrg: 1900000.00,
        newbalanceOrig: 0.00,
        oldbalanceDest: 0.00,
        newbalanceDest: 0.00
    },
    safe1: {
        step: 42,
        type: 'PAYMENT',
        amount: 1452.30,
        oldbalanceOrg: 18700.00,
        newbalanceOrig: 17247.70,
        oldbalanceDest: 53400.00,
        newbalanceDest: 54852.30
    },
    safe2: {
        step: 168,
        type: 'TRANSFER',
        amount: 45000.00,
        oldbalanceOrg: 97320.00,
        newbalanceOrig: 52320.00,
        oldbalanceDest: 2100.00,
        newbalanceDest: 47100.00
    },
    safe3: {
        step: 9,
        type: 'CASH_IN',
        amount: 850.00,
        oldbalanceOrg: 14200.00,
        newbalanceOrig: 13350.00,
        oldbalanceDest: 3200.00,
        newbalanceDest: 4050.00
    }
};

/**
 * Load a predefined scenario into the form
 * @param {string} key - The scenario key from scenarios object
 */
function loadScenario(key) {
    const s = scenarios[key];
    document.getElementById('step').value = s.step;
    document.getElementById('type').value = s.type;
    document.getElementById('amount').value = s.amount.toFixed(2);
    document.getElementById('oldbalanceOrg').value = s.oldbalanceOrg.toFixed(2);
    document.getElementById('newbalanceOrig').value = s.newbalanceOrig.toFixed(2);
    document.getElementById('oldbalanceDest').value = s.oldbalanceDest.toFixed(2);
    document.getElementById('newbalanceDest').value = s.newbalanceDest.toFixed(2);
}

/**
 * Analyze transaction data and return fraud detection flags
 * @returns {Array<string>} Array of warning/info flags
 */
function getFlags() {
    const flags = [];
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    const oldOrg = parseFloat(document.getElementById('oldbalanceOrg').value) || 0;
    const newOrg = parseFloat(document.getElementById('newbalanceOrig').value) || 0;
    const oldDest = parseFloat(document.getElementById('oldbalanceDest').value) || 0;
    const newDest = parseFloat(document.getElementById('newbalanceDest').value) || 0;
    const type = document.getElementById('type').value;

    if (newOrg === 0 && oldOrg > 0)
        flags.push("Origin account fully drained to $0.");
    if (newDest === oldDest && amount > 0 && type === 'TRANSFER')
        flags.push("Destination balance unchanged after a large transfer.");
    if (amount > 1000000)
        flags.push("Unusually large transaction amount (above $1M).");
    if (Math.abs(amount - oldOrg) < 1 && amount > 0)
        flags.push("Transfer exactly equals the origin balance (full sweep).");
    if ((type === 'PAYMENT' || type === 'CASH_IN') && amount < 50000)
        flags.push("Low-risk transaction type and nominal amount.");
    if (amount > 0 && Math.abs(newOrg - (oldOrg - amount)) < 1 && Math.abs(newDest - (oldDest + amount)) < 1)
        flags.push("Balances reconcile perfectly—no missing funds.");

    return flags;
}

/**
 * Handle form submission and fraud prediction
 */
const form = document.getElementById("prediction-form");
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const rightPanel = document.getElementById("right-panel");
    const waitingState = document.getElementById("waiting-state");
    const loadingIndicator = document.getElementById("loading-indicator");
    const resultContainer = document.getElementById("result-container");

    // Expand the right panel width slightly when a result is expected
    rightPanel.classList.remove("lg:w-48", "xl:w-64");
    rightPanel.classList.add("lg:w-80", "xl:w-96");

    if (waitingState) waitingState.classList.add("hidden");
    resultContainer.classList.add("hidden");
    resultContainer.innerHTML = "";
    loadingIndicator.classList.remove("hidden");
    loadingIndicator.classList.add("flex");

    const formData = new FormData(form);

    fetch("/predict", {
        method: "POST",
        headers: { "X-Requested-With": "XMLHttpRequest" },
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            setTimeout(() => {
                loadingIndicator.classList.add("hidden");
                loadingIndicator.classList.remove("flex");

                const isFraud = data.is_fraud;
                const score = data.risk_score;
                const flags = getFlags();

                let flagListHtml = '';
                if (flags.length > 0) {
                    flagListHtml = '<ul class="list-none pl-2 mt-2 space-y-2">';
                    flags.forEach(f => {
                        flagListHtml += `<li class="font-sans text-xs text-gray-700 border-l-2 border-gray-400 pl-2"><i class="fa-solid fa-circle-info text-[10px] mr-1 text-gray-500"></i> ${f}</li>`;
                    });
                    flagListHtml += '</ul>';
                }

                if (isFraud) {
                    resultContainer.innerHTML = `
                        <div class="bg-red-50 p-5 border-2 border-red-300 rounded-2xl shadow-md relative overflow-hidden h-full flex flex-col justify-start">
                            <div class="absolute right-[-10px] top-[-10px] text-8xl opacity-5 pointer-events-none text-red-700"><i class="fa-solid fa-triangle-exclamation"></i></div>
                            <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-red-600">
                                <i class="fa-solid fa-shield-virus"></i> NOT SAFE (FRAUD)
                            </h2>
                            <div class="mb-4 bg-red-100 border border-red-200 p-4 rounded-xl text-center shadow-inner">
                                <span class="block text-red-800 font-bold uppercase tracking-wider text-[10px] mb-1"><i class="fa-solid fa-chart-pie mr-1"></i> Fraud Probability</span>
                                <span class="text-4xl font-sans font-black text-red-600 drop-shadow-sm">${score}%</span>
                            </div>
                            <div class="bg-white/80 p-3 rounded-xl border border-red-200 mb-4">
                                <span class="font-bold text-[10px] uppercase tracking-wider text-red-600 mb-2 block"><i class="fa-solid fa-list-check mr-1"></i> Why It's Flagged:</span>
                                ${flagListHtml}
                            </div>
                            <div class="mt-auto flex justify-center opacity-70">
                                <img src="${currentCatUrl}" alt="Cat Companion" class="w-16 h-16 object-cover rounded-full border-2 border-red-300 shadow-sm">
                            </div>
                        </div>
                    `;
                } else {
                    resultContainer.innerHTML = `
                        <div class="bg-green-50 p-5 border-2 border-green-300 rounded-2xl shadow-md relative overflow-hidden h-full flex flex-col justify-start">
                            <div class="absolute right-[-10px] top-[-10px] text-8xl opacity-5 pointer-events-none text-green-700"><i class="fa-solid fa-shield-check"></i></div>
                            <h2 class="text-xl font-bold mb-3 flex items-center gap-2 text-green-600">
                                <i class="fa-solid fa-check-circle"></i> SAFE
                            </h2>
                            <div class="mb-4 bg-green-100 border border-green-200 p-4 rounded-xl text-center shadow-inner">
                                <span class="block text-green-800 font-bold uppercase tracking-wider text-[10px] mb-1"><i class="fa-solid fa-chart-pie mr-1"></i> Risk Probability</span>
                                <span class="text-4xl font-sans font-black text-green-600 drop-shadow-sm">${score}%</span>
                            </div>
                            <div class="bg-white/80 p-3 rounded-xl border border-green-200 mb-4">
                                <span class="font-bold text-[10px] uppercase tracking-wider text-green-600 mb-2 block"><i class="fa-solid fa-list-check mr-1"></i> Positive Signals:</span>
                                ${flagListHtml}
                            </div>
                            <div class="mt-auto flex justify-center opacity-70">
                                <img src="${currentCatUrl}" alt="Cat Companion" class="w-16 h-16 object-cover rounded-full border-2 border-green-300 shadow-sm">
                            </div>
                        </div>
                    `;
                }

                resultContainer.classList.remove("hidden");
            }, 400);
        })
        .catch(error => {
            console.error(error);
            alert("Failed to connect to backend server. Make sure it's running.");
            loadingIndicator.classList.add("hidden");
            loadingIndicator.classList.remove("flex");
            if (waitingState) waitingState.classList.remove("hidden");

            // Revert right panel width on error
            rightPanel.classList.remove("lg:w-80", "xl:w-96");
            rightPanel.classList.add("lg:w-48", "xl:w-64");
        });
});
