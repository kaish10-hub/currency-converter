const currencies = [
    "USD",
    "EUR",
    "GBP",
    "JPY",
    "AED",
    "CAD",
    "AUD",
    "NPR"
];

const flags = {
    USD: "us",
    EUR: "eu",
    GBP: "gb",
    JPY: "jp",
    AED: "ae",
    CAD: "ca",
    AUD: "au",
    NPR: "np"
};

const currencyNames = {
    USD: "US Dollar",
    EUR: "Euro",
    GBP: "British Pound",
    JPY: "Japanese Yen",
    AED: "UAE Dirham",
    CAD: "Canadian Dollar",
    AUD: "Australian Dollar",
    NPR: "Nepalese Rupee"
};

const ratesGrid = document.getElementById("ratesGrid");

async function loadLiveRates() {

    try {

        const response = await fetch(
            "https://open.er-api.com/v6/latest/INR"
        );

        const data = await response.json();

        ratesGrid.innerHTML = "";

        currencies.forEach(currency => {

            const rate = 1 / data.rates[currency];

            const card = document.createElement("div");

            card.classList.add("rate-card");

            card.innerHTML = `
            
            <div class="currency-info">

                <img src="https://flagcdn.com/w80/${flags[currency].toLowerCase()}.png">

                <div>
                    <h3>${currency}</h3>
                    <small>${currencyNames[currency]}</small>
                </div>

            </div>

            <h1>&#8377;${rate.toFixed(2)}</h1>

            <span class="positive">
                1 ${currency} = ₹${rate.toFixed(2)}
            </span>

            `;

            ratesGrid.appendChild(card);

        });

    }
    catch (error) {

        console.log(error);

    }

}

const amount = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");

const convertedAmount = document.getElementById("convertedAmount");
const exchangeRate = document.getElementById("exchangeRate");
const lastUpdated = document.getElementById("lastUpdated");

const symbols = {
    USD: "$",
    INR: "₹",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    AUD: "A$",
    CAD: "C$",
    AED: "د.إ",
    ZAR: "R"
};

async function convertCurrency() {

    const amountValue = Number(amount.value);

    if (!amountValue || amountValue <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    try {

        convertBtn.innerText = "Converting...";
        convertBtn.disabled = true;

        convertedAmount.innerText = "Loading...";
        exchangeRate.innerText = "Fetching latest exchange rate...";

        const res = await fetch(
            `https://open.er-api.com/v6/latest/${fromCurrency.value}`
        );

        const data = await res.json();

        const rate = data.rates[toCurrency.value];

        const result = amountValue * rate;

        convertedAmount.innerText =
            `${symbols[toCurrency.value] || ""}${result.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;

        exchangeRate.innerText =
            `1 ${fromCurrency.value} = ${rate.toFixed(4)} ${toCurrency.value}`;

        updateTime();

    } catch (err) {

        alert("Unable to fetch exchange rates.");

    } finally {

        convertBtn.innerText = "Convert";
        convertBtn.disabled = false;

    }

}

loadLiveRates();

setInterval(() => {
    loadLiveRates();
}, 60000);

// Update Time
function updateTime() {

    const now = new Date();

    lastUpdated.innerText = now.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
    });

}

document.querySelector(".mode-toggle button")
    .addEventListener("click", () => {

        document.body.classList.toggle("dark");

    });

// Swap currencies
swapBtn.addEventListener("click", () => {

    const temp = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = temp;

    if (amount.value) {
        convertCurrency();
    }

});

document.getElementById("contactBtn")
    .addEventListener("click", () => {

        document.getElementById("contact")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

// Convert button
convertBtn.addEventListener("click", convertCurrency);

// Enter key
amount.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {
        convertCurrency();
    }

});

// Auto convert when currency changes
fromCurrency.addEventListener("change", () => {

    if (amount.value) {
        convertCurrency();
    }

});

toCurrency.addEventListener("change", () => {

    if (amount.value) {
        convertCurrency();
    }

});

// Default values
amount.value = 1000;
fromCurrency.value = "USD";
toCurrency.value = "INR";

convertCurrency();