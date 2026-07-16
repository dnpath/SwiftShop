// @vitest-environment jsdom

import { beforeEach, describe, expect, test, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

const getHtmlPath = () => {
    const localPath = path.resolve(__dirname, './index.html');
    if (fs.existsSync(localPath)) return localPath;
    
    const rootPath = path.resolve(process.cwd(), './index.html');
    if (fs.existsSync(rootPath)) return rootPath;
    
    return '/home/runner/work/SwiftShop/SwiftShop/index.html';
};

const html = fs.readFileSync(getHtmlPath(), 'utf8');

describe('SwiftShop QA Sandbox Unit Tests', () => {
    let window;

    beforeEach(() => {
        // 1. Inject the HTML into the virtual DOM
        document.documentElement.innerHTML = html.toString();
        
        // 2. Capture the JSDOM window context
        window = globalThis.window || global.window;

        // 3. Clear local storage safely
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        } else if (window && window.localStorage) {
            window.localStorage.clear();
        }
        
        vi.useFakeTimers();

        // 4. FIX: Find the script tag inside your HTML and execute it manually in JSDOM
        const scriptEl = document.querySelector('script');
        if (scriptEl) {
            const newScript = document.createElement('script');
            newScript.textContent = scriptEl.textContent;
            document.body.appendChild(newScript); // This forces JSDOM to execute the code
        }
        
        // 5. Fire the load event to initialize app state
        if (window && window.onload) window.onload();
    });

    test('Initial view defaults strictly to login page', () => {
        const loginView = document.getElementById('login-view');
        const shopView = document.getElementById('shop-view');
        
        expect(loginView.classList.contains('hidden')).toBe(false);
        expect(shopView.classList.contains('hidden')).toBe(true);
    });

    test('Authenticating state reveals main application dashboards', () => {
        const loginForm = document.getElementById('login-form');
        
        // Trigger a submit event
        loginForm.dispatchEvent(new window.Event('submit'));

        const navPanel = document.getElementById('nav');
        const shopView = document.getElementById('shop-view');

        expect(navPanel.classList.contains('hidden')).toBe(false);
        expect(shopView.classList.contains('hidden')).toBe(false);
    });

    test('Adding item increments global cart counter badges', () => {
        // Authenticate first to render the shop view
        document.getElementById('login-form').dispatchEvent(new window.Event('submit'));

        // Click the first Add to Cart button
        const addCartBtn = document.querySelector('.btn-add-cart');
        addCartBtn.click();

        const cartCounter = document.getElementById('cart-count');
        expect(cartCounter.textContent).toBe('1');
    });

    test('Simulating API delay renders loading indicator, then resolves', () => {
        document.getElementById('login-form').dispatchEvent(new window.Event('submit'));

        // Trigger the latency helper directly
        window.loadAsyncCatalogWithDelay(3000);

        let spinner = document.getElementById('loading-spinner');
        expect(spinner).not.toBeNull();
        expect(spinner.textContent).toContain('Querying structural catalog endpoints');

        // Fast-forward fake timers by 3 seconds
        vi.advanceTimersByTime(3000);

        spinner = document.getElementById('loading-spinner');
        expect(spinner).toBeNull();
        expect(document.querySelectorAll('.product-card').length).toBeGreaterThan(0);
    });

    test('Flash sale drops introduce a distinct, interactive product entry', () => {
        document.getElementById('login-form').dispatchEvent(new window.Event('submit'));

        // Fire the dynamic injector
        window.injectDynamicPromoItem();

        const cards = document.querySelectorAll('.product-card');
        const targetedCard = Array.from(cards).find(card => 
            card.getAttribute('data-id').includes('PROD-DYN')
        );

        expect(targetedCard).toBeDefined();
        expect(targetedCard.textContent).toMatch(/Quantum Memory Leak|Bug-Smasher/);
    });
});
