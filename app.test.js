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
    let windowContext;

    beforeEach(() => {
        // 1. Inject the HTML into the virtual DOM
        document.documentElement.innerHTML = html.toString();
        
        // 2. Capture the JSDOM window context securely
        windowContext = globalThis.window || global.window;

        // 3. Clear local storage safely
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        } else if (windowContext && windowContext.localStorage) {
            windowContext.localStorage.clear();
        }
        
        vi.useFakeTimers();

        // 4. Extract and evaluate the scripts directly in the global scope 
        // to guarantee functions append cleanly to global execution contexts
        const scriptEl = document.querySelector('script');
        if (scriptEl) {
            const scriptContent = scriptEl.textContent;
            // Using Function() executes the code in global scope, attaching functions to window
            const runInGlobalScope = new Function(scriptContent);
            runInGlobalScope.call(windowContext);
        }
        
        // 5. Fire the load event to initialize app state
        if (windowContext && windowContext.onload) windowContext.onload();
    });

    test('Initial view defaults strictly to login page', () => {
        const loginView = document.getElementById('login-view');
        const shopView = document.getElementById('shop-view');
        
        expect(loginView.classList.contains('hidden')).toBe(false);
        expect(shopView.classList.contains('hidden')).toBe(true);
    });

    test('Authenticating state reveals main application dashboards', () => {
        const mockEvent = { preventDefault: () => {} };
        
        // Safely extract from whatever global reference JSDOM attached it to
        const loginFn = windowContext.login || globalThis.login;
        loginFn(mockEvent);

        const navPanel = document.getElementById('nav');
        const shopView = document.getElementById('shop-view');

        expect(navPanel.classList.contains('hidden')).toBe(false);
        expect(shopView.classList.contains('hidden')).toBe(false);
    });

    test('Adding item increments global cart counter badges', () => {
        const mockEvent = { preventDefault: () => {} };
        const loginFn = windowContext.login || globalThis.login;
        loginFn(mockEvent);

        // Safely extract and call the addToCart method
        const addToCartFn = windowContext.addToCart || globalThis.addToCart;
        addToCartFn('PROD-001');

        const cartCounter = document.getElementById('cart-count');
        expect(cartCounter.textContent).toBe('1');
    });

    test('Simulating API delay renders loading indicator, then resolves', () => {
        const mockEvent = { preventDefault: () => {} };
        const loginFn = windowContext.login || globalThis.login;
        loginFn(mockEvent);

        // Safely extract and call the latency handler
        const loadAsyncFn = windowContext.loadAsyncCatalogWithDelay || globalThis.loadAsyncCatalogWithDelay;
        loadAsyncFn(3000);

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
        const mockEvent = { preventDefault: () => {} };
        const loginFn = windowContext.login || globalThis.login;
        loginFn(mockEvent);

        // Safely extract and call the injector
        const injectPromoFn = windowContext.injectDynamicPromoItem || globalThis.injectDynamicPromoItem;
        injectPromoFn();

        const cards = document.querySelectorAll('.product-card');
        const targetedCard = Array.from(cards).find(card => 
            card.getAttribute('data-id').includes('PROD-DYN')
        );

        expect(targetedCard).toBeDefined();
        expect(targetedCard.textContent).toMatch(/Quantum Memory Leak|Bug-Smasher/);
    });
});
