import { motion } from 'framer-motion';
import { ArrowLeft, Bookmark, Share2, ThumbsUp, Eye, Star, HelpCircle, File, ListChecks, PiggyBank, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from '@/empty-module-browser';
import { useEffect, useState } from 'react';

export default function SnowballMethodArticle() {
  const navigate = useNavigate();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(427);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
    
    // Check if article was previously bookmarked in localStorage
    const bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    setIsBookmarked(bookmarkedArticles.includes('snowball-method'));
    
    // Check if user already voted
    const votedArticles = JSON.parse(localStorage.getItem('votedArticles') || '[]');
    setHasVoted(votedArticles.includes('snowball-method'));
  }, []);

  const handleBookmark = () => {
    const bookmarkedArticles = JSON.parse(localStorage.getItem('bookmarkedArticles') || '[]');
    
    if (isBookmarked) {
      const updated = bookmarkedArticles.filter((id: string) => id !== 'snowball-method');
      localStorage.setItem('bookmarkedArticles', JSON.stringify(updated));
    } else {
      bookmarkedArticles.push('snowball-method');
      localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarkedArticles));
    }
    
    setIsBookmarked(!isBookmarked);
  };

  const handleHelpfulClick = () => {
    if (!hasVoted) {
      setHelpfulCount(helpfulCount + 1);
      setHasVoted(true);
      
      const votedArticles = JSON.parse(localStorage.getItem('votedArticles') || '[]');
      votedArticles.push('snowball-method');
      localStorage.setItem('votedArticles', JSON.stringify(votedArticles));
    }
  };

  const relatedArticles = [
    {
      id: "avalanche-method",
      title: "Debt Avalanche method",
      description: "Using the avalanche method to minimize interest payments",
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
            <span className="text-gray-300">Debt Snowball Method</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              The Debt Snowball Method: A Psychological Approach to Debt Elimination
            </span>
          </h1>
          
          <div className="flex items-center text-sm text-gray-400 gap-6 flex-wrap">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              4,210 views
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
              (4.9)
            </span>
            <span className="flex items-center gap-1">
              Updated May 15, 2023
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
                  <a href="#what-is-snowball" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    What is the Debt Snowball Method?
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    How the Snowball Method Works
                  </a>
                </li>
                <li>
                  <a href="#benefits" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Benefits of the Snowball Approach
                  </a>
                </li>
                <li>
                  <a href="#step-by-step" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Step-by-Step Implementation
                  </a>
                </li>
                <li>
                  <a href="#vs-avalanche" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Snowball vs. Avalanche Method
                  </a>
                </li>
                <li>
                  <a href="#in-app" className="flex items-center text-gray-300 hover:text-[#88B04B]">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#88B04B] mr-2"></div>
                    Using Snowball in Smart Debt Flow
                  </a>
                </li>
              </ul>
            </div>
            
            <section id="what-is-snowball">
              <h2>What is the Debt Snowball Method?</h2>
              <p>
                The Debt Snowball Method is a debt reduction strategy popularized by finance expert Dave Ramsey. Unlike approaches that prioritize high-interest debts, the Snowball Method focuses on paying off your smallest debts first, regardless of interest rates. This strategy is designed to provide quick psychological wins that keep you motivated throughout your debt payoff journey.
              </p>
              <p>
                The method gets its name from the snowball effect that occurs as you pay off each debt in succession - just like a snowball rolling downhill, gathering size and momentum as it goes. With each debt you eliminate, you gain confidence and motivation to tackle the next one.
              </p>
              <div className="bg-[#88B04B]/10 border border-[#88B04B]/20 rounded-xl p-6 my-6">
                <div className="flex items-start gap-3">
                  <HelpCircle className="w-6 h-6 text-[#88B04B] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">Key Insight</h4>
                    <p className="text-gray-300 mb-0">
                      The Debt Snowball Method is primarily a psychological approach. It acknowledges that debt repayment is as much about behavior change and motivation as it is about mathematics. By focusing on quick wins rather than optimal interest savings, it helps many people stay committed to their debt elimination plan.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="how-it-works">
              <h2>How the Snowball Method Works</h2>
              <p>
                The Debt Snowball Method works in a straightforward and systematic way:
              </p>
              <ol>
                <li>
                  <strong>List all your debts</strong> from smallest to largest balance, regardless of interest rates.
                </li>
                <li>
                  <strong>Make minimum payments</strong> on all your debts to avoid late fees and penalties.
                </li>
                <li>
                  <strong>Put any extra money</strong> you can toward the smallest debt on your list.
                </li>
                <li>
                  <strong>Once the smallest debt is paid off</strong>, take the amount you were paying on that debt (the minimum payment plus any extra) and add it to the minimum payment on your next smallest debt.
                </li>
                <li>
                  <strong>Continue this process</strong>, paying off debts from smallest to largest, until all debts are paid in full.
                </li>
              </ol>
              <p>
                As you pay off each debt, the amount you put toward the next debt grows larger, like a snowball rolling downhill. By the time you reach your largest debts, you'll be making substantial payments that quickly reduce even big balances.
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 my-6">
                <h4 className="font-bold text-white text-lg mb-4">Example of the Snowball Method in Action</h4>
                <p className="mb-4">Imagine you have the following debts:</p>
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
                        <td className="px-4 py-2 border-b border-white/10">Store Credit Card</td>
                        <td className="px-4 py-2 border-b border-white/10">$500</td>
                        <td className="px-4 py-2 border-b border-white/10">22%</td>
                        <td className="px-4 py-2 border-b border-white/10">$25</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b border-white/10">Medical Bill</td>
                        <td className="px-4 py-2 border-b border-white/10">$1,200</td>
                        <td className="px-4 py-2 border-b border-white/10">0%</td>
                        <td className="px-4 py-2 border-b border-white/10">$50</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b border-white/10">Bank Credit Card</td>
                        <td className="px-4 py-2 border-b border-white/10">$3,500</td>
                        <td className="px-4 py-2 border-b border-white/10">18%</td>
                        <td className="px-4 py-2 border-b border-white/10">$70</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2">Car Loan</td>
                        <td className="px-4 py-2">$6,500</td>
                        <td className="px-4 py-2">4.5%</td>
                        <td className="px-4 py-2">$180</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p>Let's say you have $350 per month to put toward debt repayment. Here's how you'd apply the Snowball Method:</p>
                <ol className="list-decimal ml-5 space-y-2">
                  <li>Pay minimum payments on all debts ($25 + $50 + $70 + $180 = $325)</li>
                  <li>Put the extra $25 toward the smallest debt (Store Credit Card)</li>
                  <li>Once the Store Credit Card is paid off, add its payment ($25 + $25 = $50) to the Medical Bill's minimum ($50), for a total of $100</li>
                  <li>After the Medical Bill is paid, add its payment ($100) to the Bank Credit Card's minimum ($70), for a total of $170</li>
                  <li>Finally, after the Bank Credit Card is paid, add its payment ($170) to the Car Loan's minimum ($180), for a total of $350</li>
                </ol>
              </div>
            </section>
            
            <section id="benefits">
              <h2>Benefits of the Snowball Approach</h2>
              <p>
                The Debt Snowball Method offers several psychological and practical benefits that make it effective for many people:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <ThumbsUp className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Quick Wins</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    By targeting smaller debts first, you experience the satisfaction of completely eliminating debts earlier in the process.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Builds Momentum</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    Each debt you pay off fuels your motivation to tackle the next one, creating positive momentum.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <ListChecks className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Simplifies Finances</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    Each eliminated debt means one less payment to track each month, gradually simplifying your financial life.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-[#88B04B]/20 flex items-center justify-center">
                      <File className="w-4 h-4 text-[#88B04B]" />
                    </div>
                    <h4 className="font-bold text-white m-0">Easier to Follow</h4>
                  </div>
                  <p className="text-gray-300 m-0">
                    The straightforward approach makes it easy to understand and implement without complex calculations.
                  </p>
                </div>
              </div>

              <p>
                Research in behavioral economics supports the psychological benefits of the Snowball Method. A 2016 study in the Journal of Consumer Research found that people who paid off smaller debts first were more likely to eliminate their total debt than those who focused on higher-interest debts first.
              </p>
            </section>
            
            <section id="step-by-step">
              <h2>Step-by-Step Implementation</h2>
              <p>
                To implement the Debt Snowball Method effectively, follow these steps:
              </p>
              
              <div className="space-y-6 my-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">1</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">List All Your Debts</h4>
                    <p className="text-gray-300">
                      Gather information about all your debts, including credit cards, loans, medical bills, and any other money you owe. For each debt, note the total balance, minimum payment, and interest rate.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">2</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Arrange Your Debts</h4>
                    <p className="text-gray-300">
                      Order your debts from the smallest balance to the largest. Don't worry about interest rates at this stage – the Snowball Method is about quick wins, not mathematical optimization.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">3</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Budget for Debt Repayment</h4>
                    <p className="text-gray-300">
                      Determine the total amount you can commit to debt repayment each month. This should include all minimum payments plus any additional money you can put toward debt elimination.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">4</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Make Minimum Payments</h4>
                    <p className="text-gray-300">
                      Pay at least the minimum payment on all debts every month. This keeps you current and avoids late fees, collections, and credit damage.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">5</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Focus on the Smallest Debt</h4>
                    <p className="text-gray-300">
                      Put any extra money in your debt repayment budget toward the smallest debt. Pay as much as you can on this debt while maintaining minimum payments on everything else.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">6</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Roll Over Payments</h4>
                    <p className="text-gray-300">
                      Once your smallest debt is paid off, take the amount you were paying on it (minimum payment plus extra) and add it to what you're paying on the next smallest debt. This is the "snowball" effect that gives the method its name.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#88B04B] rounded-full flex items-center justify-center font-bold">7</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">Repeat Until Debt-Free</h4>
                    <p className="text-gray-300">
                      Continue this process, working your way through your debts from smallest to largest. With each debt you pay off, your snowball grows larger, allowing you to make increasingly bigger payments on subsequent debts.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-[#88B04B]/10 border border-[#88B04B]/20 rounded-xl p-6 my-6">
                <div className="flex items-start gap-3">
                  <PiggyBank className="w-6 h-6 text-[#88B04B] flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-white text-lg mb-2">Pro Tip: Create Visual Progress Trackers</h4>
                    <p className="text-gray-300 mb-0">
                      Many successful debt snowballers create visual trackers like debt thermometers or charts to monitor their progress. Seeing your debt decrease can provide additional motivation to keep going. In Smart Debt Flow, we automatically create visual progress trackers for you to celebrate each milestone on your debt-free journey.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            
            <section id="vs-avalanche">
              <h2>Snowball vs. Avalanche Method</h2>
              <p>
                The Debt Snowball Method is often compared to the Debt Avalanche Method, which prioritizes paying off debts with the highest interest rates first. Here's how the two approaches compare:
              </p>
              
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white/5 border border-white/10 rounded-lg">
                  <thead>
                    <tr>
                      <th className="px-4 py-3 text-left border-b border-white/10">Feature</th>
                      <th className="px-4 py-3 text-left border-b border-white/10">Debt Snowball</th>
                      <th className="px-4 py-3 text-left border-b border-white/10">Debt Avalanche</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Prioritization</td>
                      <td className="px-4 py-3 border-b border-white/10">Smallest balance to largest</td>
                      <td className="px-4 py-3 border-b border-white/10">Highest interest rate to lowest</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Mathematical Advantage</td>
                      <td className="px-4 py-3 border-b border-white/10">Usually costs more in interest</td>
                      <td className="px-4 py-3 border-b border-white/10">Saves more money in interest</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Psychological Advantage</td>
                      <td className="px-4 py-3 border-b border-white/10">Quick wins build motivation</td>
                      <td className="px-4 py-3 border-b border-white/10">Mathematical optimization</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 border-b border-white/10 font-semibold">Best For</td>
                      <td className="px-4 py-3 border-b border-white/10">People motivated by visible progress</td>
                      <td className="px-4 py-3 border-b border-white/10">People focused on minimizing costs</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold">Time to First Debt Payoff</td>
                      <td className="px-4 py-3">Usually faster</td>
                      <td className="px-4 py-3">Usually slower</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p>
                While the Avalanche Method is mathematically optimal in terms of interest savings, studies suggest that many people are more likely to succeed with the Snowball Method because of its psychological benefits. The small wins early in the process provide the motivation many need to stick with a debt repayment plan long-term.
              </p>
              <p>
                The best method for you depends on your personal preferences, financial situation, and what motivates you. Some people may even benefit from a hybrid approach that considers both balance size and interest rates.
              </p>
            </section>
            
            <section id="in-app">
              <h2>Using the Snowball Method in Smart Debt Flow</h2>
              <p>
                Smart Debt Flow makes implementing the Debt Snowball Method easy and effective:
              </p>
              
              <div className="space-y-5 my-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">Automatic Debt Ordering</h4>
                  <p className="text-gray-300 mb-0">
                    When you select the Snowball Method in your strategy settings, Smart Debt Flow automatically arranges your debts from smallest to largest balance and calculates optimal payment amounts.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">Payment Rollover Calculations</h4>
                  <p className="text-gray-300 mb-0">
                    The app automatically handles the "rollover" calculations, showing how each payment contributes to growing your snowball and accelerating your debt payoff.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">Visual Progress Tracking</h4>
                  <p className="text-gray-300 mb-0">
                    Track your progress with visual debt reduction graphs and celebratory milestones that reinforce the psychological benefits of the Snowball Method.
                  </p>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <h4 className="font-bold text-white mb-3">AI-Enhanced Optimization</h4>
                  <p className="text-gray-300 mb-0">
                    Our AI analyzes your financial situation and may suggest small adjustments to the traditional Snowball Method that maintain the psychological benefits while minimizing unnecessary interest costs.
                  </p>
                </div>
              </div>
              
              <p>
                To set up the Debt Snowball Method in Smart Debt Flow:
              </p>
              <ol>
                <li>Go to the "Debt Strategy" section of your dashboard</li>
                <li>Select "Debt Snowball" from the strategy options</li>
                <li>Review your debts to ensure they're all listed correctly</li>
                <li>Set your monthly debt payment budget</li>
                <li>The app will automatically calculate and display your personalized debt snowball plan</li>
              </ol>
              
              <div className="bg-white/10 border-l-4 border-[#88B04B] p-6 my-6">
                <p className="italic text-gray-300 mb-0">
                  "I tried for years to pay off my debts using other methods, but kept getting discouraged. With the Snowball Method in Smart Debt Flow, I paid off three small debts in the first four months. Those early wins gave me the confidence that I could actually become debt-free!" <br />
                  <span className="text-white mt-2 block">— Michael R., Smart Debt Flow user</span>
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