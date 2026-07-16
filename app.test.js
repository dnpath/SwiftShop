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
        // 1. Inject HTML layout first to initialize the DOM elements
        document.documentElement.innerHTML = html.toString();
        
        // 2. Point to the verified JSDOM global window structure
        window = globalThis.window || global.window;

        // 3. Clean up storage through the global environment context safely
        if (typeof localStorage !== 'undefined') {
            localStorage.clear();
        } else if (window && window.localStorage) {
            window.localStorage.clear();
        }
        
        vi.useFakeTimers(); 
        
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
        
        // Simulate a submit event profile
        loginForm.dispatchEvent(new window.Event('submit'));

        const navPanel = document.getElementById('nav');
        const shopView = document.getElementById('shop-view');

        expect(navPanel.classList.contains('hidden')).toBe(false);
        expect(shopView.classList.contains('hidden')).toBe(false);
    });

    test('Adding item increments global cart counter badges', () => {
        // Authenticate first
        document.getElementById('login-form').dispatchEvent(new window.Event('submit'));

        // Target the first "Add to Cart" button discovered in the rendered grid
        const addCartBtn = document.querySelector('.btn-add-cart');
        addCartBtn.click();

        const cartCounter = document.getElementById('cart-count');
        expect(cartCounter.textContent).toBe('1');
    });

    test('Simulating API delay renders loading indicator, then resolves', () => {
        document.getElementById('login-form').dispatchEvent(new window.Event('submit'));

        // Trigger the 3-second delay method
        window.loadAsyncCatalogWithDelay(3000);

        // Assert spinner element exists immediately
        let spinner = document.getElementById('loading-spinner');
        expect(spinner).not.toBeNull();
        expect(spinner.textContent).toContain('Querying structural catalog endpoints');

        // Fast-forward time inside the fake clock framework by 3 seconds
        vi.advanceTimersByTime(3000);

        // Assert loader is cleanly unmounted and replaced with the active product cards
        spinner = document.getElementById('loading-spinner');
        expect(spinner).toBeNull();
        expect(document.querySelectorAll('.product-card').length).toBeGreaterThan(0);
    });

    test('Flash sale drops introduce a distinct, interactive product entry', () => {
        document.getElementById('login-form').dispatchEvent(new window.Event('submit'));

        // Fire the runtime injector function
        window.injectDynamicPromoItem();

        const cards = document.querySelectorAll('.product-card');
        const targetedCard = Array.from(cards).find(card => 
            card.getAttribute('data-id').includes('PROD-DYN')
        );

        expect(targetedCard).toBeDefined();
        expect(targetedCard.textContent).toMatch(/Quantum Memory Leak|Bug-Smasher/);
    });
});
