/**
 * Example: Mobile-First Responsive Design Test
 * 
 * Este archivo muestra cómo usar el sistema de responsive design
 * mobile-first que genera automáticamente tablet y desktop variants
 */

import {
  generateComponentWithAI,
  generateResponsiveDesigns,
  generateComponentWithResponsiveVariants,
} from '@/lib/aiService';
import {
  createSiteElementFromComponent,
  convertResponsiveDesignToDeltas,
  isValidResponsiveDesign,
  MOBILE_FIRST_BREAKPOINTS,
  scaleElementForBreakpoint,
} from '@/lib/responsiveUtils';

/**
 * Ejemplo 1: Generar solo componente mobile
 */
export async function exampleMobileOnly() {
  console.log('📱 Example 1: Mobile-Only Component');
  
  const component = await generateComponentWithAI(
    'A beautiful header with logo and navigation'
  );
  
  console.log('Generated Mobile Component:', {
    name: component.name,
    width: component.width,
    height: component.height,
    type: component.type,
  });
  
  // Crear elemento
  const element = createSiteElementFromComponent(component);
  console.log('✓ SiteElement created for mobile');
  
  return element;
}

/**
 * Ejemplo 2: Generar con responsive automático (RECOMENDADO)
 */
export async function exampleWithResponsive() {
  console.log('\n🎨 Example 2: Component with Automatic Responsive Variants');
  
  const result = await generateComponentWithResponsiveVariants(
    'A modern hero section with gradient background, large headline, and call-to-action button'
  );
  
  if (result.responsive && isValidResponsiveDesign(result.responsive)) {
    console.log('✓ Mobile design generated');
    console.log(`  Size: ${result.mobile.width}x${result.mobile.height}px`);
    
    console.log('✓ Responsive variants generated');
    console.log(`  Tablet: ${result.responsive.tablet.width}x${result.responsive.tablet.height}px`);
    console.log(`  Desktop: ${result.responsive.desktop.width}x${result.responsive.desktop.height}px`);
    
    // Crear elemento con variants
    const element = createSiteElementFromComponent(
      result.mobile,
      result.responsive
    );
    
    console.log('✓ SiteElement created with responsive overrides');
    console.log(`  Responsive object keys: ${Object.keys(element.responsive).join(', ')}`);
    
    return element;
  } else {
    console.warn('⚠ Responsive variants not available, using mobile only');
    const element = createSiteElementFromComponent(result.mobile);
    return element;
  }
}

/**
 * Ejemplo 3: Generar responsive para componente existente
 */
export async function exampleAddResponsiveToExisting() {
  console.log('\n🔄 Example 3: Add Responsive to Existing Component');
  
  // Paso 1: Generar mobile
  const mobile = await generateComponentWithAI('A product card');
  console.log('✓ Mobile component created');
  
  // Paso 2: Agregar responsive variants
  const responsive = await generateResponsiveDesigns(
    mobile,
    'A product card showing image, title, price, and add-to-cart button'
  );
  
  if (responsive) {
    console.log('✓ Responsive variants added');
    console.log(`  Changes detected in responsive: ${Object.keys(responsive).length} breakpoints`);
    
    const element = createSiteElementFromComponent(mobile, responsive);
    return element;
  }
  
  return createSiteElementFromComponent(mobile);
}

/**
 * Ejemplo 4: Información de Breakpoints
 */
export function exampleBreakpointInfo() {
  console.log('\n📐 Example 4: Breakpoint Information');
  console.log('Mobile-First Breakpoints:');
  
  MOBILE_FIRST_BREAKPOINTS.forEach((bp) => {
    console.log(`  • ${bp.name}: ${bp.width}px - ${bp.description}`);
  });
}

/**
 * Ejemplo 5: Fallback Escalado (sin Gemini)
 */
export function exampleScalingFallback() {
  console.log('\n📊 Example 5: Scaling Fallback (without Gemini)');
  
  const mobileComponent = {
    name: 'Button',
    type: 'rectangle' as const,
    x: 20,
    y: 20,
    width: 120,
    height: 44,
    fontSize: 14,
    letterSpacing: 0.5,
  };
  
  const tabletProps = scaleElementForBreakpoint(mobileComponent, 'tablet');
  const desktopProps = scaleElementForBreakpoint(mobileComponent, 'desktop');
  
  console.log('Mobile size: 120x44px');
  console.log(`Tablet scaled: ${tabletProps.width}x${tabletProps.height}px`);
  console.log(`Desktop scaled: ${desktopProps.width}x${desktopProps.height}px`);
}

/**
 * Ejemplo 6: Flujo Completo
 */
export async function exampleCompleteFlow() {
  console.log('\n🚀 Example 6: Complete Flow');
  
  // 1. Generar componente
  const result = await generateComponentWithResponsiveVariants(
    'An attractive testimonial card with avatar, quote, author name, and company'
  );
  
  // 2. Crear elemento
  const element = createSiteElementFromComponent(
    result.mobile,
    result.responsive
  );
  
  // 3. Convertir responsive a deltas
  if (result.responsive) {
    const deltas = convertResponsiveDesignToDeltas(result.responsive);
    console.log('✓ Generated deltas for:');
    Object.entries(deltas).forEach(([breakpoint, delta]) => {
      console.log(`  • ${breakpoint}: ${Object.keys(delta).join(', ')}`);
    });
  }
  
  // 4. Simular cambio de breakpoint
  console.log('\nSimulating breakpoint changes:');
  console.log(`Mobile (375px): width=${element.width}px`);
  
  if (element.responsive?.tablet) {
    const tabletWidth = element.responsive.tablet.width;
    console.log(`Tablet (768px): width=${tabletWidth}px`);
  }
  
  if (element.responsive?.desktop) {
    const desktopWidth = element.responsive.desktop.width;
    console.log(`Desktop (1024px): width=${desktopWidth}px`);
  }
  
  return element;
}

/**
 * Ejecutar todos los ejemplos (para testing/documentación)
 */
export async function runAllExamples() {
  console.log('='.repeat(60));
  console.log('Mobile-First Responsive Design System - Examples');
  console.log('='.repeat(60));
  
  try {
    exampleBreakpointInfo();
    exampleScalingFallback();
    
    // Nota: Los siguientes requieren API calls, descomenta para testear
    // await exampleMobileOnly();
    // await exampleWithResponsive();
    // await exampleAddResponsiveToExisting();
    // await exampleCompleteFlow();
    
    console.log('\n' + '='.repeat(60));
    console.log('✓ All examples completed');
    console.log('='.repeat(60));
  } catch (error) {
    console.error('Error running examples:', error);
  }
}
