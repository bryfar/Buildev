/**
 * QA Test Script for Buildev v0.1.0
 * Uses Playwright to verify all critical UI functionality
 */
const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, 'qa_screenshots');
const fs = require('fs');
if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

const results = [];

function log(area, status, detail) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
  const line = `${icon} [${area}] ${detail}`;
  console.log(line);
  results.push({ area, status, detail });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`UNCAUGHT: ${err.message}`));

  // ===== TEST 1: Dashboard loads =====
  console.log('\n========== QA BUILDEV v0.1.0 ==========\n');
  console.log('--- TEST 1: Dashboard ---');
  try {
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_dashboard.png'), fullPage: true });
    
    const title = await page.title();
    log('Dashboard', title ? 'PASS' : 'FAIL', `Page title: "${title}"`);
    
    const appDiv = await page.$('#app');
    const appHTML = await appDiv?.innerHTML();
    log('Dashboard', appHTML && appHTML.length > 100 ? 'PASS' : 'FAIL', 
      `App div rendered: ${appHTML ? appHTML.length : 0} chars`);
    
    // Check for key UI elements  
    const hasButtons = await page.$$eval('button', btns => btns.length);
    log('Dashboard', hasButtons > 0 ? 'PASS' : 'FAIL', `Buttons found: ${hasButtons}`);
    
  } catch (err) {
    log('Dashboard', 'FAIL', `Error loading: ${err.message}`);
  }

  // ===== TEST 2: New Project Modal =====
  console.log('\n--- TEST 2: Project Creation ---');
  try {
    // Look for "New Project" or "+" button
    const newProjBtn = await page.$('button:has-text("New Project"), button:has-text("New"), button:has-text("+"), .btn-create, .btn-new');
    if (newProjBtn) {
      await newProjBtn.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_new_project_modal.png'), fullPage: true });
      log('ProjectCreation', 'PASS', 'New Project button found and clicked');
      
      // Check for modal
      const hasModal = await page.$('.modal, .dialog, [role="dialog"], .overlay, .wizard, .create-modal');
      log('ProjectCreation', hasModal ? 'PASS' : 'WARN', `Modal visible: ${!!hasModal}`);
      
      // Try typing project name
      const nameInput = await page.$('input[type="text"], input[placeholder*="name" i], input[placeholder*="project" i], input');
      if (nameInput) {
        await nameInput.fill('QA Test Project');
        log('ProjectCreation', 'PASS', 'Name input found and filled');
      }
      
      // Look for create/submit button
      const createBtn = await page.$('button:has-text("Create"), button:has-text("Launch"), button:has-text("Submit"), .btn-submit, .btn-create');
      if (createBtn) {
        const isDisabled = await createBtn.isDisabled();
        log('ProjectCreation', 'PASS', `Create button found (disabled: ${isDisabled})`);
      }
    } else {
      log('ProjectCreation', 'WARN', 'No "New Project" button found - may need auth first');
    }
  } catch (err) {
    log('ProjectCreation', 'FAIL', `Error: ${err.message}`);
  }

  // ===== TEST 3: Navigate to Editor =====
  console.log('\n--- TEST 3: Editor View ---');
  try {
    // Try navigating directly to an editor page
    await page.goto('http://localhost:5173/editor/test-page', { waitUntil: 'networkidle', timeout: 10000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_editor_view.png'), fullPage: true });
    
    // Check for toolbar
    const toolbar = await page.$('.navbar, .toolbar, .editor-header, nav, header');
    log('Editor', toolbar ? 'PASS' : 'WARN', `Toolbar present: ${!!toolbar}`);
    
    // Check for left sidebar (block panel)
    const sidebar = await page.$('.sidebar, .left-panel, .block-panel, .panel-left, aside');
    log('Editor', sidebar ? 'PASS' : 'WARN', `Left sidebar present: ${!!sidebar}`);
    
    // Check for right panel (properties)
    const rightPanel = await page.$('.property-panel, .right-panel, .panel-right, .props-panel, .inspector');
    log('Editor', rightPanel ? 'PASS' : 'WARN', `Property panel present: ${!!rightPanel}`);
    
    // Check for canvas area
    const canvas = await page.$('.canvas, .editor-canvas, .canvas-wrapper, .viewport, main');
    log('Editor', canvas ? 'PASS' : 'WARN', `Canvas area present: ${!!canvas}`);
    
  } catch (err) {
    log('Editor', 'WARN', `Editor navigation: ${err.message}`);
  }

  // ===== TEST 4: Check CSS Theme Variables =====
  console.log('\n--- TEST 4: Design System ---');
  try {
    const cssVars = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      return {
        bgMain: root.getPropertyValue('--bg-main').trim(),
        brandPrimary: root.getPropertyValue('--brand-primary').trim(),
        textMain: root.getPropertyValue('--text-main').trim(),
        borderMain: root.getPropertyValue('--border-main').trim(),
      };
    });
    
    log('DesignSystem', cssVars.bgMain ? 'PASS' : 'FAIL', `--bg-main: ${cssVars.bgMain}`);
    log('DesignSystem', cssVars.brandPrimary ? 'PASS' : 'FAIL', `--brand-primary: ${cssVars.brandPrimary}`);
    log('DesignSystem', cssVars.textMain ? 'PASS' : 'FAIL', `--text-main: ${cssVars.textMain}`);
    log('DesignSystem', cssVars.borderMain ? 'PASS' : 'FAIL', `--border-main: ${cssVars.borderMain}`);
  } catch (err) {
    log('DesignSystem', 'FAIL', `Error checking CSS vars: ${err.message}`);
  }

  // ===== TEST 5: Backend API =====
  console.log('\n--- TEST 5: Backend API ---');
  try {
    const health = await page.evaluate(async () => {
      const res = await fetch('http://localhost:4000/api/health');
      return res.json();
    });
    log('BackendAPI', health.ok ? 'PASS' : 'FAIL', `Health check: ${JSON.stringify(health)}`);
  } catch (err) {
    log('BackendAPI', 'FAIL', `API error: ${err.message}`);
  }

  // ===== TEST 6: Console Errors =====
  console.log('\n--- TEST 6: Console Errors ---');
  if (consoleErrors.length === 0) {
    log('ConsoleErrors', 'PASS', 'No JavaScript errors detected');
  } else {
    consoleErrors.forEach(e => log('ConsoleErrors', 'FAIL', e));
  }

  // ===== SUMMARY =====
  console.log('\n========== QA SUMMARY ==========');
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warns = results.filter(r => r.status === 'WARN').length;
  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`⚠️  WARNS:  ${warns}`);
  console.log(`Total: ${results.length} checks`);
  console.log('================================\n');

  await browser.close();
})();
