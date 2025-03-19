import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Share2, ThumbsUp, Eye, Star, HelpCircle, File, ListChecks, PiggyBank, TrendingUp, Zap, DollarSign, Calculator, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from '@/empty-module-browser';
import { useEffect, useState } from 'react';

export default function AvalancheMethodArticle() {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(392);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Check if article was previously bookmarked in localStorage
    const bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    setIsBookmarked(bookmarkedArticles.includes('avalanche-method'));
    
    // Check if user already voted
    const votedArticles = JSON.parse(localStorage.getItem('votedArticles') || '[]');
    setHasVoted(votedArticles.includes('avalanche-method'));
  }, []);

  const handleBookmark = () => {
    const bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    
    if (isBookmarked) {
      const updated = bookmarkedArticles.filter((id: string) => id !== 'avalanche-method');
      localStorage.setItem('bookmarkedArticles', JSON.stringify(updated));
    } else {
      bookmarkedArticles.push('avalanche-method');
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarkedArticles));
    }
    
    setIsBookmarked(!isBookmarked);
  };

  const handleHelpfulClick = () => {
    if (!hasVoted) {
      setHelpfulCount(helpfulCount + 1);
      setHasVoted(true);
      
      const votedArticles = JSON.parse(localStorage.getItem('votedArticles') || '[]');
      votedArticles.push('avalanche-method');
      localStorage.setItem('votedArticles', JSON.stringify(votedArticles));
    }
  };

  const relatedArticles = [
    {
      id: "snowball-method",
      title: "Debt Snowball method",
      description: "How the snowball method works and when to use it",
      category: "debt-strategies",
      icon: TrendingUp
    },
    {
      id: "ai-optimization",
      title: "AI-optimized payment plans",
      description: "How our AI customizes strategies for your specific situation",
      category: "debt-strategies",
      icon: Zap
    },
    {
      id: "debt-consolidation",
      title: "Debt consolidation analysis",
      description: "When and how to consider debt consolidation options",
      category: "debt-strategies",
      icon: PiggyBank
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 max-w-5xl relative">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            className="text-gray-300 hover:text-white"
            onClick={() => navigate('/help')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Help Center
          </Button>
        </div>
        
        {/* Article header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
            <Link to="/help" className="hover:text-[#88B04B]">Help Center</Link>
            <span>/</span>
            <Link to="/help?category=debt-strategies" className="hover:text-[#88B04B]">Debt Strategies</Link>
            <span>/</span>
            <span className="text-gray-300">Debt Avalanche Method</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              The Debt Avalanche Method: Minimize Interest and Eliminate Debt Faster
            </span>
          </h1>
          
          <div className="flex items-center text-sm text-gray-400 gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              3,987 views
            </span>
            <span className="flex items-center gap-1">
              <ThumbsUp className="h-4 w-4" />
              {helpfulCount} found this helpful
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-[#88B04B] fill-current" />
              <Star className="h-4 w-4 text-[#88B04B] fill-current" />
              <Star className="h-4 w-4 text-[#88B04B] fill-current" />
              <Star className="h-4 w-4 text-[#88B04B] fill-current" />
              <Star className="h-4 w-4 text-[#88B04B] fill-current" />
              (4.8)
            </span>
            <span className="flex items-center gap-1">
              Updated June 2, 2023
            </span>
          </div>
        </motion.div>
        
        {/* Article content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 prose prose-invert max-w-none prose-headings:text-white prose-headings:font-bold prose-p:text-gray-300 prose-a:text-[#88B04B] prose-a:no-underline hover:prose-a:text-[#7a9d43] prose-img:rounded-xl"
          >
            <div className="flex justify-between items-center mb-8 sticky top-4 z-10 bg-[#1A1A1A] p-4 rounded-xl border border-white/10">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={`${isBookmarked ? 'bg-[#88B04B]/20 border-[#88B04B]/30 text-[#88B04B]' : 'border-white/10 text-gray-300'}`}
                  onClick={handleBookmark}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${isBookmarked ? 'fill-current' : ''}`} />
                  {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/10 text-gray-300"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
              <Button 
                variant={hasVoted ? "default" : "outline"} 
                size="sm" 
                className={hasVoted ? "bg-[#88B04B] hover:bg-[#7a9d43]" : "border-white/10 text-gray-300"}
                onClick={handleHelpfulClick}
                disabled={hasVoted}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {hasVoted ? 'Marked as Helpful' : 'Mark as Helpful'}
              </Button>
            </div>
            
            {/* Table of Contents */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8">
              <h3 className="text-xl font-bold mb-4">Contents</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#what-is-avalanche" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    What is the Debt Avalanche Method?
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    How the Avalanche Method Works
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Benefits of the Avalanche Approach
                  </a>
                </li>
                <li>
                  <a href="#step-by-step" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Step-by-Step Implementation
                  </a>
                </li>
                <li>
                  <a href="#vs-snowball" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Avalanche vs. Snowball Method
                  </a>
                </li>
                <li>
                  <a href="#in-app" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Using Avalanche in Smart Debt Flow
                  </a>
                </li>
              </ul>
            </div>
            
            <section id="what-is-avalanche">
              <h2>What is the Debt Avalanche Method?</h2>
              <p>
                The Debt Avalanche Method is a debt reduction strategy that focuses on paying off debts in order of highest interest rate to lowest, regardless of balance. This mathematically optimized approach is designed to minimize the total interest you pay over time, helping you become debt-free more efficiently from a financial perspective.
              </p>
              <p>
                While the Debt Snowball Method prioritizes psychological wins through eliminating smaller debts first, the Avalanche Method takes a purely mathematical approach that focuses on saving you the most money in interest charges. This strategy is particularly effective for individuals who are motivated by financial optimization rather than quick wins.
              </p>
              <div className="bg-[#88B04B]/10 border border-[#88B04B]/20 rounded-xl p-6 my-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-[#88B04B] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">Key Insight</h4>
                    <p className="text-gray-300 mb-0">
                      The Debt Avalanche Method can save you hundreds or even thousands of dollars in interest payments compared to other strategies, although it may require more discipline since you won't experience as many quick wins early in the process.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="how-it-works">
              <h2>How the Avalanche Method Works</h2>
              <p>
                The Debt Avalanche Method follows these fundamental principles:
              </p>
              <ol>
                <li>
                  <strong>List all your debts</strong> in order from highest interest rate to lowest, regardless of the balance.
                </li>
                <li>
                  <strong>Make minimum payments</strong> on all your debts to avoid late fees and penalties.
                </li>
                <li>
                  <strong>Put any extra money</strong> toward the debt with the highest interest rate.
                </li>
                <li>
                  <strong>Once the highest-interest debt is paid off</strong>, take the amount you were paying on that debt (minimum payment plus extra) and add it to the minimum payment on the debt with the next highest interest rate.
                </li>
                <li>
                  <strong>Continue this process</strong>, paying off debts from highest to lowest interest rate, until all debts are paid in full.
                </li>
              </ol>
              <p>
                By directing extra payments to the highest-interest debt first, you reduce the total amount of interest that accrues across all your debts. This strategy is mathematically optimal for reducing the total amount you'll pay over the life of your debts.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
                <h4 className="font-bold text-white text-lg mb-4">Example of the Avalanche Method in Action</h4>
                <p className="mb-4">Let's consider the following debts:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white/5 border border-white/10 rounded-lg mb-4">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left border-b border-white/10">Debt</th>
                        <th className="px-4 py-2 text-left border-b border-white/10">Balance</th>
                        <th className="px-4 py-2 text-left border-b border-white/10">Interest Rate</th>
                        <th className="px-4 py-2 text-left border-b border-white/10">Minimum Payment</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border-b border-white/10">Credit Card A</td>
                        <td className="px-4 py-2 border-b border-white/10">$5,000</td>
                        <td className="px-4 py-2 border-b border-white/10">22%</td>
                        <td className="px-4 py-2 border-b border-white/10">$125</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b border-white/10">Credit Card B</td>
                        <td className="px-4 py-2 border-b border-white/10">$2,500</td>
                        <td className="px-4 py-2 border-b border-white/10">18%</td>
                        <td className="px-4 py-2 border-b border-white/10">$65</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b border-white/10">Personal Loan</td>
                        <td className="px-4 py-2 border-b border-white/10">$10,000</td>
                        <td className="px-4 py-2 border-b border-white/10">12%</td>
                        <td className="px-4 py-2 border-b border-white/10">$250</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Car Loan</td>
                        <td className="px-4 py-2">$15,000</td>
                        <td className="px-4 py-2">6%</td>
                        <td className="px-4 py-2">$300</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>If you have $900 total to put toward debt each month, here's how you'd apply the Avalanche Method:</p>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Pay minimum payments on all debts ($125 + $65 + $250 + $300 = $740)</li>
                  <li>Put the extra $160 toward Credit Card A (22% interest)</li>
                  <li>Once Credit Card A is paid off, add its payment ($125 + $160 = $285) to Credit Card B's minimum ($65), for a total of $350</li>
                  <li>After Credit Card B is paid, add its payment ($350) to the Personal Loan's minimum ($250), for a total of $600</li>
                  <li>Finally, after the Personal Loan is paid, add its payment ($600) to the Car Loan's minimum ($300), for a total of $900</li>
                </ol>
              </div>
            </section>
            
            <section id="benefits">
              <h2>Benefits of the Avalanche Approach</h2>
              <p>
                The Debt Avalanche Method offers several significant advantages:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Maximum Interest Savings</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    Mathematically optimal approach that minimizes the total interest paid over the life of your debts.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <Calculator className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Faster Total Payoff</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    By reducing interest costs, more of your payments go toward principal, leading to a faster total debt elimination.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <ListChecks className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Logical Approach</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    Appeals to those who prefer a rational, numbers-based approach to financial management.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <File className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Prioritizes High-Cost Debt</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    Targets the most financially damaging debts first, reducing their impact on your financial health.
                  </p>
                </div>
              </div>

              <p>
                Financial experts and economists generally agree that the Avalanche Method is the most financially efficient debt repayment strategy. According to financial calculations, a consumer with $20,000 in debt across multiple accounts could save an average of $1,500 in interest charges using the Avalanche Method compared to other strategies.
              </p>
            </section>
            
            <section id="step-by-step">
              <h2>Step-by-Step Implementation</h2>
              <p>
                To implement the Debt Avalanche Method effectively, follow these steps:
              </p>
              
              <div className="space-y-6 my-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Compile a Complete Debt Inventory</h4>
                    <p className="text-gray-300">
                      List all your debts, including credit cards, personal loans, auto loans, student loans, and any other money you owe. For each debt, note the current balance, interest rate, and minimum monthly payment.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Sort by Interest Rate</h4>
                    <p className="text-gray-300">
                      Arrange your debts from highest interest rate to lowest. This order determines your payment priority.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Determine Your Total Monthly Payment</h4>
                    <p className="text-gray-300">
                      Calculate how much money you can commit to debt repayment each month. This should be at least the sum of all minimum payments plus any additional amount you can afford.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Pay the Minimums on Everything</h4>
                    <p className="text-gray-300">
                      Make at least the minimum payment on all of your debts to avoid late fees, credit damage, and potential penalty interest rates.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">5</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Direct Extra Payments to the Highest-Interest Debt</h4>
                    <p className="text-gray-300">
                      Any money left over after making minimum payments should go toward the debt with the highest interest rate. Make extra payments consistently each month.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">6</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Roll Over Payments as Debts Are Eliminated</h4>
                    <p className="text-gray-300">
                      When you pay off the highest-interest debt, take the entire amount you were paying on it (minimum plus extra) and add it to the payment for the debt with the next highest interest rate.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">7</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Track Your Progress</h4>
                    <p className="text-gray-300">
                      Monitor your debt payoff progress and the interest you're saving. This can help maintain motivation even if you're not eliminating entire debts as quickly as with the Snowball Method.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#88B04B]/10 border border-[#88B04B]/20 rounded-xl p-6 my-6">
                <div className="flex items-start gap-3">
                  <PiggyBank className="w-6 h-6 text-[#88B04B] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">Pro Tip: Consider Interest Rate Differences</h4>
                    <p className="text-gray-300 mb-0">
                      If two debts have very similar interest rates (within 1-2%), but one has a much smaller balance, it might make sense to pay off the smaller balance first for a quick win while still adhering to the general Avalanche approach. In Smart Debt Flow, our AI will automatically identify these opportunities and suggest optimal adjustments to your strategy.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="vs-snowball">
              <h2>Avalanche vs. Snowball Method</h2>
              <p>
                The Debt Avalanche Method is often compared to the Debt Snowball Method. Here's how they stack up against each other:
              </p>
              
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white/5 border border-white/10 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left border-b border-white/10">Feature</th>
                      <th className="px-4 py-3 text-left border-b border-white/10">Debt Avalanche</th>
                      <th className="px-4 py-3 text-left border-b border-white/10">Debt Snowball</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Prioritization</td>
                      <td className="px-4 py-3 border-b border-white/10">Highest interest rate to lowest</td>
                      <td className="px-4 py-3 border-b border-white/10">Smallest balance to largest</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Mathematical Advantage</td>
                      <td className="px-4 py-3 border-b border-white/10">Saves more money in interest</td>
                      <td className="px-4 py-3 border-b border-white/10">Usually costs more in interest</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Psychological Advantage</td>
                      <td className="px-4 py-3 border-b border-white/10">Mathematical optimization</td>
                      <td className="px-4 py-3 border-b border-white/10">Quick wins build motivation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Best For</td>
                      <td className="px-4 py-3 border-b border-white/10">People focused on minimizing costs</td>
                      <td className="px-4 py-3 border-b border-white/10">People motivated by visible progress</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">Time to First Debt Payoff</td>
                      <td className="px-4 py-3">Usually slower</td>
                      <td className="px-4 py-3">Usually faster</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p>
                Studies have shown that while the Avalanche Method is mathematically superior, the Snowball Method often leads to higher completion rates due to its psychological benefits. A 2016 study in the Journal of Consumer Research found that people using the Snowball Method were more likely to stick with their debt repayment plan.
              </p>
              <p>
                That said, for those who can maintain motivation without quick wins, the Avalanche Method will almost always save more money and result in faster overall debt elimination. The best approach depends on your personal psychology and financial situation.
              </p>
            </section>
            
            <section id="in-app">
              <h2>Using the Avalanche Method in Smart Debt Flow</h2>
              <p>
                Smart Debt Flow makes implementing the Debt Avalanche Method simple and effective:
              </p>
              
              <div className="space-y-5 my-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">Automatic Interest Rate Sorting</h4>
                  <p className="text-gray-300 mb-0">
                    When you select the Avalanche Method in your strategy settings, Smart Debt Flow automatically arranges your debts from highest to lowest interest rate and calculates optimal payment allocations.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">Interest Savings Calculator</h4>
                  <p className="text-gray-300 mb-0">
                    Our app shows you exactly how much interest you'll save compared to making only minimum payments or using other strategies, helping to maintain motivation.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">Progress Visualization</h4>
                  <p className="text-gray-300 mb-0">
                    Interactive charts show your declining balances and interest savings over time, providing visual reinforcement of your progress even before debts are fully paid off.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">Smart Refinance Suggestions</h4>
                  <p className="text-gray-300 mb-0">
                    The AI analyzes your current interest rates and credit profile to suggest potential refinancing opportunities that could enhance your Avalanche strategy even further.
                  </p>
                </div>
              </div>
              
              <p>
                To set up the Debt Avalanche Method in Smart Debt Flow:
              </p>
              <ol>
                <li>Go to the "Debt Strategy" section of your dashboard</li>
                <li>Select "Debt Avalanche" from the strategy options</li>
                <li>Review your debts to ensure accurate interest rates and balances</li>
                <li>Set your monthly debt payment budget</li>
                <li>The app will automatically calculate and display your personalized Avalanche plan, including projected interest savings</li>
              </ol>
              
              <div className="bg-white/10 border-l-4 border-[#88B04B] p-6 my-6">
                <p className="italic text-gray-300 mb-0">
                  "I'm a numbers person, so the Avalanche Method made perfect sense to me. Using Smart Debt Flow, I've saved over $3,200 in interest on my credit cards in just the first year. The app shows me exactly how much I'm saving each month, which keeps me motivated to stick with the plan." <br />
                  <span className="text-white mt-2 block">— Jennifer T., Smart Debt Flow user</span>
                </p>
              </div>
            </section>
            
            <div className="flex justify-between items-center border-t border-white/10 pt-8 mt-12">
              <Button 
                variant="outline" 
                className="border-white/10 text-gray-300"
                onClick={() => navigate('/help')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
              <Button 
                variant={hasVoted ? "default" : "outline"} 
                className={hasVoted ? "bg-[#88B04B] hover:bg-[#7a9d43]" : "border-white/10 text-gray-300"}
                onClick={handleHelpfulClick}
                disabled={hasVoted}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                {hasVoted ? 'Marked as Helpful' : 'Was this article helpful?'}
              </Button>
            </div>
          </motion.article>
          
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-1"
          >
            {/* Related Articles */}
            <div className="bg-white/5 rounded-xl border border-white/10 p-6 mb-8 sticky top-20">
              <h3 className="text-xl font-bold mb-6 pb-4 border-b border-white/10">
                Related Articles
              </h3>
              <div className="space-y-5">
                {relatedArticles.map((article, index) => (
                  <div 
                    key={article.id}
                    className="flex items-start gap-3 group cursor-pointer"
                    onClick={() => navigate(`/help/articles/${article.id}`)}
                  >
                    <div className="w-8 h-8 rounded bg-[#88B04B]/20 flex-shrink-0 flex items-center justify-center mt-0.5">
                      <article.icon className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium group-hover:text-[#88B04B] transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs text-gray-400 mt-1">{article.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 pt-6 border-t border-white/10">
                <h4 className="font-bold mb-4">Need More Help?</h4>
                <Button
                  className="w-full bg-white/10 hover:bg-white/20 text-white justify-start mb-3"
                >
                  <MessageCircle className="w-4 h-4 mr-3" />
                  Chat with Support
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white/20 hover:border-white/30 text-white justify-start"
                >
                  <Mail className="w-4 h-4 mr-3" />
                  Email Support
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 