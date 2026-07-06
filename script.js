const currencies = ["USD", "EUR", "GBP", "JPY", "AED", "CAD", "AUD", "NPR"];

const flags = {
  USD: "us",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  AED: "ae",
  CAD: "ca",
  AUD: "au",
  NPR: "np",
};

const currencyNames = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  AED: "UAE Dirham",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  NPR: "Nepalese Rupee",
};

const btnText = document.querySelector(".btn-text");
const spinner = document.querySelector(".spinner");
const amount = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertBtn = document.getElementById("convertBtn");
const swapBtn = document.getElementById("swapBtn");
const convertedAmount = document.getElementById("convertedAmount");
const exchangeRate = document.getElementById("exchangeRate");
const lastUpdated = document.getElementById("lastUpdated");
const ratesGrid = document.getElementById("ratesGrid");
const toast = document.getElementById("toast");
const toastMessage = document.querySelector(".toast-message");

async function loadLiveRates() {
  try {
    const response = await fetch("https://open.er-api.com/v6/latest/INR");
    const data = await response.json();
    ratesGrid.innerHTML = "";
    currencies.forEach((currency,index) => {
      const rate = 1 / data.rates[currency];
      const card = document.createElement("div");
      card.classList.add("rate-card", "hidden");
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
      card.style.transitionDelay = `${index * 100}ms`;
      observer.observe(card);
    });
  } catch (error) {
    console.log(error);
  }

  updateTime();
}

const symbols = {
  USD: "$",
  INR: "₹",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  AUD: "A$",
  CAD: "C$",
  AED: "د.إ",
  ZAR: "R",
  NPR: "₹",
};

function showToast(message, type) {
  toastMessage.innerText = message;
  toast.classList.remove("success", "error", "warning");
  if (type === "success") {
    toast.classList.add("success");
    document.querySelector(".toast-icon").innerHTML = "✅";
  } else if (type === "warning") {
    toast.classList.add("warning");
    document.querySelector(".toast-icon").innerHTML = "⚠️";
  } else {
    toast.classList.add("error");
    document.querySelector(".toast-icon").innerHTML = "❌";
  }
  toast.style.opacity = "1";
  toast.style.visibility = "visible";
  toast.style.right = "25px";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.visibility = "hidden";
    toast.style.right = "-400px";
  }, 3000);
}

async function convertCurrency(showNotification = true) {
  const amountValue = Number(amount.value);
  if (!amountValue || amountValue <= 0) {
    showToast("Please enter a valid amount.", "warning");
    return;
  }

  console.log(getComputedStyle(toast).opacity);

  try {
    btnText.innerText = "Converting...";
    spinner.style.display = "inline-block";
    convertBtn.disabled = true;
    convertedAmount.innerText = "Loading...";
    convertedAmount.classList.remove("result-pop");
    void convertedAmount.offsetWidth;
    convertedAmount.classList.add("result-pop");
    exchangeRate.innerText = "Fetching latest exchange rate...";
    exchangeRate.classList.remove("rate-animation");
    void exchangeRate.offsetWidth;
    exchangeRate.classList.add("rate-animation");
    const res = await fetch(
      `https://open.er-api.com/v6/latest/${fromCurrency.value}`,
    );

    const data = await res.json();
    const rate = data.rates[toCurrency.value];
    const result = amountValue * rate;
    animateResult(convertedAmount, result);

    animateResult(convertedAmount, result, () => {
      if (showNotification) {
        showToast("Currency converted successfully.", "success");
      }
    });

    exchangeRate.innerText = `1 ${fromCurrency.value} = ${rate.toFixed(4)} ${toCurrency.value}`;

    updateTime();
  } catch (err) {
    showToast("Unable to fetch exchange rates.", "error");
  } finally {
    btnText.innerText = "Convert";
    spinner.style.display = "none";
    convertBtn.disabled = false;
  }
}

loadLiveRates();

setInterval(() => {
  loadLiveRates();
}, 60000);

function animateResult(element, finalValue, callback) {
  let start = 0;
  const duration = 800;
  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const value = finalValue * easeOut;
    element.innerText = `${symbols[toCurrency.value] || ""}${value.toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )}`;
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      if (callback) {
        callback();
      }
    }
  }
  requestAnimationFrame(update);
}

function updateTime() {
  const now = new Date();

  lastUpdated.innerText = now.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

swapBtn.addEventListener("click", () => {
  const temp = fromCurrency.value;

  fromCurrency.value = toCurrency.value;
  toCurrency.value = temp;

  if (amount.value) {
    convertCurrency();
  }
});

document.getElementById("contactBtn").addEventListener("click", () => {
  document.getElementById("contact").scrollIntoView({
    behavior: "smooth",
  });
});

convertBtn.addEventListener("click", convertCurrency);

amount.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    convertCurrency();
  }
});

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

amount.value = 1000;
fromCurrency.value = "USD";
toCurrency.value = "INR";

convertCurrency(false);

const featureCards = document.querySelectorAll(".features .card");
featureCards.forEach((card, index) => {
    card.style.transitionDelay = `${index * 150}ms`;
});

document.querySelectorAll(".rates-grid").forEach(container => {
    container.querySelectorAll(".rate-card").forEach((card,index)=>{
        card.style.transitionDelay=`${index*150}ms`;
    });
});

const hiddenElements = document.querySelectorAll(".hidden");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
      observer.unobserve(entry.target);
    }
  });
});
hiddenElements.forEach((element) => {
  observer.observe(element);
});
