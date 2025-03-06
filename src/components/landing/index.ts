// Export all landing page components
export { default as DebtManagementVisualization } from './DebtManagementVisualization';
export { default as Features } from './Features';
export { default as Hero } from './Hero';
export { default as Pricing } from './Pricing';

// Also export for backwards compatibility with other imports
import DebtManagementVisualizationComponent from './DebtManagementVisualization';
import FeaturesComponent from './Features';
import HeroComponent from './Hero';
import PricingComponent from './Pricing';

export default {
  DebtManagementVisualization: DebtManagementVisualizationComponent,
  Features: FeaturesComponent,
  Hero: HeroComponent,
  Pricing: PricingComponent
}; 