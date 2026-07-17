# 🛒 SwiftShop - QA Automation Sandbox WebApp

![QA CI Status](https://github.com/dnpath/SwiftShop/actions/workflows/frontend-ci.yml/badge.svg)

[🛒 SwiftShop](https://dnpath.github.io/SwiftShop)

A lightweight, high-fidelity e-commerce web application designed explicitly for frontend manual and automated QA testing (Selenium, Cypress, Playwright, Appium). Built entirely using vanilla HTML5, CSS Grid, and JavaScript, it runs completely **frontend-only**—making it perfect for instant deployment on **GitHub Pages** with zero backend database setup required.

---

## 🚀 Key Features Built for Testing

*   **Mock Authentication Layer:** Accepts any username/password combination for testing valid/invalid authorization flows without locked accounts.
*   **Persistent LocalStorage Engine:** App state (cart items, active orders, login sessions) survives page refreshes and cookie handshakes to match production environments.
*   **Asynchronous Processing Simulation:** Placing an order triggers a real-world asynchronous status change (`Pending` ➡️ `Confirmed`) after exactly **5 seconds** to practice handling element pooling and polling conditions.
*   **QA Run-Time Injector Panel:**
    *   *Flash Sale Drop:* Dynamically updates DOM elements with unpredictable partial IDs (`PROD-DYN-XXXX`) to practice building robust locators.
    *   *Swing Market Prices:* Alters element values on the fly to test data calculation validation scripts.
    *   *Simulate API Latency:* Forces a structural `3-second` network delay that generates an intermediate loading element (`#loading-spinner`) to test **Explicit Waits** and prevent flaky test runs.

---

## 🛠️ Project Structure

```text
├── .github/workflows/
│   └── frontend-ci.yml   # GitHub Actions Automation Workflow
├── index.html            # Core UI Application (HTML, CSS, JS)
├── app.test.js           # Headless JSDOM Vitest Unit Tests
└── README.md             # Project Documentation
