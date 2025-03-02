import { useState, useEffect } from 'react';
import { useBankConnection } from '@/hooks/useBankConnection';
import { useDebts } from '@/hooks/useDebts';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Lightbulb, RefreshCw, Link, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { analyzeConnectedAccounts, syncDebtsWithBankData } from '@/lib/ai/debtAnalyzer';
import { formatCurrency } from '@/lib/utils';

export function DebtAIModule() {
  const { user } = useAuth();
  const { accounts } = useBankConnection();
  const { debts, refreshDebts, addDebt } = useDebts();
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [detectedDebts, setDetectedDebts] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<{
    created: number;
    updated: number;
    unchanged: number;
    errors: number;
  } | null>(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  
  // Run initial analysis when component mounts and dependencies change
  useEffect(() => {
    if (accounts.length > 0 && debts && !isAnalyzing && !lastAnalysis) {
      handleRunAnalysis();
    }
  }, [accounts, debts]);
  
  // Function to trigger AI analysis of connected accounts
  const handleRunAnalysis = async () => {
    if (!user?.id || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setAiRecommendations([]);
    setDetectedDebts([]);
    setSyncResults(null);
    
    try {
      // Run the AI analysis
      const analysisResult = await analyzeConnectedAccounts(user.id, accounts, debts);
      
      // Update state with results
      setAiRecommendations(analysisResult.recommendations);
      setDetectedDebts(analysisResult.predictions);
      setLastAnalysis(new Date());
      
    } catch (error) {
      console.error('Error running AI debt analysis:', error);
      setAiRecommendations([
        'An error occurred while analyzing your accounts. Please try again later.'
      ]);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to synchronize detected debts with the database
  const handleSyncDebts = async (autoCreate = false) => {
    if (!user?.id || isAnalyzing || detectedDebts.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      // Sync the AI predictions with our database
      const syncResult = await syncDebtsWithBankData(
        user.id,
        detectedDebts,
        debts,
        autoCreate
      );
      
      // Update sync results
      setSyncResults({
        created: syncResult.created.length,
        updated: syncResult.updated.length,
        unchanged: syncResult.unchanged.length,
        errors: syncResult.errors.length
      });
      
      // Refresh debts to show updated data
      await refreshDebts();
      
      // Update recommendations
      if (syncResult.created.length > 0 || syncResult.updated.length > 0) {
        setAiRecommendations([
          `Successfully updated your debt information from bank data.`,
          ...aiRecommendations
        ]);
      }
      
    } catch (error) {
      console.error('Error syncing debts with bank data:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // If no bank accounts are connected, show connection prompt
  if (accounts.length === 0) {
    return (
      <Card className="border-2 border-primary/20 bg-black shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5" />
            AI Debt Insights
          </CardTitle>
          <CardDescription className="text-gray-300">
            Connect to Plaid to get AI-powered debt analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 bg-gray-900 rounded-md">
            <Link className="w-12 h-12 text-primary mb-4" />
            <p className="text-center text-white mb-4 px-4">
              Connect your bank accounts with Plaid and our AI will automatically detect and analyze your debts.
            </p>
            <Button
              onClick={() => window.location.hash = 'bank-connections'}
              className="mt-2"
            >
              Connect with Plaid <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Debt Insights
          </div>
          {lastAnalysis && (
            <Badge variant="outline" className="text-xs">
              Last updated: {lastAnalysis.toLocaleTimeString()}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered analysis and recommendations based on your linked bank accounts
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="recommendations" className="flex-1">
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="detected" className="flex-1">
              Detected Debts
            </TabsTrigger>
            {syncResults && (
              <TabsTrigger value="sync" className="flex-1">
                Sync Results
              </TabsTrigger>
            )}
          </TabsList>
        </div>
        
        <CardContent className="pt-6">
          <TabsContent value="recommendations" className="m-0">
            {aiRecommendations.length > 0 ? (
              <ul className="space-y-3">
                {aiRecommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {isAnalyzing ? (
                  <p>Analyzing your accounts...</p>
                ) : (
                  <p>Run analysis to get AI-powered recommendations</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="detected" className="m-0">
            {detectedDebts.length > 0 ? (
              <div className="space-y-4">
                {detectedDebts.map((debt, index) => (
                  <div 
                    key={index}
                    className="p-3 border rounded-md flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">{debt.name}</h4>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <Badge variant="outline">{debt.type.replace('_', ' ')}</Badge>
                        <span>•</span>
                        <span>{formatCurrency(debt.amount)}</span>
                        <span>•</span>
                        <span>{debt.interest_rate}% APR</span>
                      </div>
                    </div>
                    <Badge 
                      variant={debt.confidence >= 0.8 ? "default" : "secondary"}
                      className="ml-2"
                    >
                      {Math.round(debt.confidence * 100)}% confident
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                {isAnalyzing ? (
                  <p>Analyzing your accounts...</p>
                ) : (
                  <p>No debts detected from your connected accounts yet</p>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sync" className="m-0">
            {syncResults && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border rounded-md p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {syncResults.created}
                    </div>
                    <div className="text-sm text-gray-500">Debts Created</div>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {syncResults.updated}
                    </div>
                    <div className="text-sm text-gray-500">Debts Updated</div>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {syncResults.unchanged}
                    </div>
                    <div className="text-sm text-gray-500">Unchanged</div>
                  </div>
                  <div className="border rounded-md p-4 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {syncResults.errors}
                    </div>
                    <div className="text-sm text-gray-500">Errors</div>
                  </div>
                </div>
                
                {syncResults.errors > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Sync Errors</AlertTitle>
                    <AlertDescription>
                      Some errors occurred while syncing your debts. Please try again or check your connection.
                    </AlertDescription>
                  </Alert>
                )}
                
                {(syncResults.created > 0 || syncResults.updated > 0) && (
                  <Alert className="bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-800">Sync Complete</AlertTitle>
                    <AlertDescription className="text-green-700">
                      {syncResults.created > 0 && `Created ${syncResults.created} new debt${syncResults.created !== 1 ? 's' : ''}. `}
                      {syncResults.updated > 0 && `Updated ${syncResults.updated} existing debt${syncResults.updated !== 1 ? 's' : ''}.`}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="flex justify-between flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRunAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Analysis
            </>
          )}
        </Button>
        
        <div className="space-x-2">
          {detectedDebts.length > 0 && (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleSyncDebts(false)}
                disabled={isAnalyzing}
              >
                Update Existing
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={() => handleSyncDebts(true)}
                disabled={isAnalyzing}
              >
                Add & Update All
              </Button>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  );
} 