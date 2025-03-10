'use client';

import { useState, useEffect } from 'react';
import { useBankConnection } from '@/hooks/useBankConnection';
import { useDebts } from '@/hooks/useDebts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Lightbulb, RefreshCw, Link, AlertCircle, ChevronRight, Check } from 'lucide-react';
import { analyzeConnectedAccounts, syncDebtsWithBankData } from '@/lib/ai/debtAnalyzer';
import { formatCurrency } from '@/lib/utils';

export default function DebtAIModule() {
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
      setDetectedDebts(analysisResult.predictions);
      setAiRecommendations(analysisResult.recommendations);
      setLastAnalysis(new Date());
      
      // If we found new debts, switch to that tab
      if (analysisResult.predictions.length > 0) {
        setActiveTab('debts');
      }
    } catch (error) {
      console.error('Error analyzing debts:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Function to sync detected debts with user's debt data
  const handleSyncDebts = async (createNew: boolean) => {
    if (!user?.id || isAnalyzing) return;
    
    setIsAnalyzing(true);
    
    try {
      // Sync debts with bank data
      const result = await syncDebtsWithBankData(user.id, detectedDebts, debts, createNew);
      
      // Update sync results
      setSyncResults(result);
      
      // Refresh debts
      refreshDebts();
      
      // Switch to recommendations tab
      setActiveTab('recommendations');
    } catch (error) {
      console.error('Error syncing debts:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Debt Analysis
        </CardTitle>
        <CardDescription>
          Smart insights about your debt portfolio
          {lastAnalysis && (
            <div className="text-xs mt-1 text-muted-foreground">
              Last updated: {lastAnalysis.toLocaleString()}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="recommendations">
              <Lightbulb className="h-4 w-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="debts">
              <Link className="h-4 w-4 mr-2" />
              Detected Debts 
              {detectedDebts.length > 0 && (
                <Badge variant="secondary" className="ml-2">{detectedDebts.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-4">
          <TabsContent value="recommendations" className="space-y-4">
            {aiRecommendations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isAnalyzing 
                    ? 'Analyzing your financial data...'
                    : 'Click "Refresh Analysis" to generate AI recommendations'}
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {aiRecommendations.map((recommendation, index) => (
                  <li key={index} className="flex gap-2 items-start">
                    <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <p>{recommendation}</p>
                  </li>
                ))}
              </ul>
            )}
            
            {syncResults && (
              <Alert className="mt-4">
                <Check className="h-4 w-4" />
                <AlertTitle>Debts Updated</AlertTitle>
                <AlertDescription>
                  {syncResults.created > 0 && (
                    <div>{syncResults.created} new debts added</div>
                  )}
                  {syncResults.updated > 0 && (
                    <div>{syncResults.updated} existing debts updated</div>
                  )}
                  {syncResults.unchanged > 0 && (
                    <div>{syncResults.unchanged} debts unchanged</div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="debts">
            {detectedDebts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {isAnalyzing 
                    ? 'Searching for debt accounts...'
                    : 'No debts detected from your connected accounts'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {detectedDebts.map((debt, index) => (
                  <div key={index} className="border rounded-lg p-3 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{debt.name}</div>
                        <div className="text-sm text-muted-foreground">{debt.type}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{formatCurrency(debt.amount)}</div>
                        <div className="text-sm text-muted-foreground">
                          {debt.interest_rate}% APR
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center text-sm">
                      <div className="text-muted-foreground">
                        Minimum: {formatCurrency(debt.minimum_payment)}/mo
                      </div>
                      <Badge variant={debt.confidence > 0.7 ? "default" : "outline"}>
                        {debt.confidence > 0.7 ? 'High confidence' : 'Medium confidence'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {detectedDebts.length > 0 && (
              <Alert variant="outline" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>AI Detection</AlertTitle>
                <AlertDescription>
                  These debts were detected based on your transaction patterns and account information.
                  Review for accuracy before adding to your debt tracker.
                </AlertDescription>
              </Alert>
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