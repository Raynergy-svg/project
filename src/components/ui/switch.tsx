// Re-export the Switch component from lowercase file
// This resolves case sensitivity issues between macOS (case-insensitive) and Linux (case-sensitive)
// Since our components are using lowercase imports but some might have uppercase references
export { Switch, default, SwitchProps } from './switch'; 