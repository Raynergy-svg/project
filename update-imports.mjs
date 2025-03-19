import fs from 'fs';
import path from 'path';

// List of files to update from the grep search
const filesToUpdate = [
  '/Users/davidcertan/Downloads/project/src/pages/SignIn.tsx',
  '/Users/davidcertan/Downloads/project/src/pages/PaymentSuccess.tsx',
  '/Users/davidcertan/Downloads/project/src/pages/AdminTools.tsx',
  '/Users/davidcertan/Downloads/project/src/pages/admin/SecurityEvents.tsx',
  '/Users/davidcertan/Downloads/project/src/pages/admin/AdminLayout.tsx',
  '/Users/davidcertan/Downloads/project/src/pages/admin/AdminDashboard.tsx',
  '/Users/davidcertan/Downloads/project/src/pages/tools/DebtPayoffTool.tsx',
  '/Users/davidcertan/Downloads/project/src/pages/SupportTickets.tsx',
  '/Users/davidcertan/Downloads/project/src/components/auth/SignUpForm.tsx',
  '/Users/davidcertan/Downloads/project/src/components/onboarding/UserOnboarding.tsx',
  '/Users/davidcertan/Downloads/project/src/components/Navigation.tsx',
  '/Users/davidcertan/Downloads/project/src/components/help/articles/SnowballMethod.tsx',
  '/Users/davidcertan/Downloads/project/src/components/help/articles/AvalancheMethod.tsx',
  '/Users/davidcertan/Downloads/project/src/components/dashboard/FinancialTools.tsx',
  '/Users/davidcertan/Downloads/project/src/components/auth/SignInClient.tsx',
  '/Users/davidcertan/Downloads/project/src/components/auth/ProtectedRoute.tsx',
  '/Users/davidcertan/Downloads/project/src/components/admin/AdminAuthCheck.tsx',
  '/Users/davidcertan/Downloads/project/src/components/sections/BankConnections.tsx'
];

// Update each file
for (const filePath of filesToUpdate) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace import statements
    const updatedContent = content.replace(
      /(import\s+.*\s+from\s+["'])@\/empty-module(["'])/g,
      '$1@/empty-module-browser$2'
    );
    
    // Write the updated content back to file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
  }
}

console.log('All imports updated successfully!');
