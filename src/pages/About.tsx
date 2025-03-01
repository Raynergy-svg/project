import { motion } from 'framer-motion';
import { 
  Shield, Users, Target, BarChart, Brain, Globe, Heart, 
  Star, ArrowRight, Zap, Sparkles, CheckCircle, ChevronRight 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      {/* Background decorative elements */}
      <div className="absolute top-40 left-0 w-64 h-64 bg-[#88B04B]/10 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-40 right-0 w-80 h-80 bg-[#88B04B]/5 rounded-full blur-3xl -z-10"></div>
      
      <div className="container mx-auto px-4 relative">
        {/* Header with mission statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-20"
        >
          <div className="inline-block bg-[#88B04B]/10 px-4 py-2 rounded-full mb-6">
            <span className="text-[#88B04B] font-medium">About Smart Debt Flow</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Our Mission
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Empowering financial freedom through AI-powered debt management solutions
          </p>
          <div className="relative p-8 bg-white/5 rounded-xl border border-white/10 mb-8">
            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-[#88B04B] text-white px-4 py-2 rounded-lg font-medium">
              Why We Exist
            </div>
            <p className="text-lg leading-relaxed">
              At Smart Debt Flow, we believe that <span className="text-[#88B04B] font-semibold">everyone deserves the tools and knowledge</span> to 
              break free from the cycle of debt. Our AI-powered platform transforms complex financial challenges into 
              clear, actionable pathways to freedom. By combining cutting-edge technology with financial expertise, 
              we're changing how people manage and eliminate debt forever.
            </p>
          </div>
        </motion.div>

        {/* What We Do Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold mb-4 text-center">What We Do</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Our comprehensive approach combines AI technology with proven financial strategies
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all group hover:bg-white/[0.07] hover:translate-y-[-4px]">
              <div className="w-14 h-14 rounded-full bg-[#88B04B]/20 flex items-center justify-center mb-6 group-hover:bg-[#88B04B]/30 transition-all">
                <Brain className="w-7 h-7 text-[#88B04B]" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-300 mb-4">
                Our advanced AI analyzes your financial situation to create personalized debt elimination strategies tailored to your unique circumstances.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Multi-factor debt analysis</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Budget optimization</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Payment prioritization</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all group hover:bg-white/[0.07] hover:translate-y-[-4px]">
              <div className="w-14 h-14 rounded-full bg-[#88B04B]/20 flex items-center justify-center mb-6 group-hover:bg-[#88B04B]/30 transition-all">
                <Zap className="w-7 h-7 text-[#88B04B]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Optimized Strategies</h3>
              <p className="text-gray-300 mb-4">
                We implement proven debt reduction methods like Snowball and Avalanche, enhanced with AI optimization to maximize your progress and motivation.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Custom hybrid approaches</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Interest rate negotiation</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Adaptive payoff timeline</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all group hover:bg-white/[0.07] hover:translate-y-[-4px]">
              <div className="w-14 h-14 rounded-full bg-[#88B04B]/20 flex items-center justify-center mb-6 group-hover:bg-[#88B04B]/30 transition-all">
                <Sparkles className="w-7 h-7 text-[#88B04B]" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Guidance</h3>
              <p className="text-gray-300 mb-4">
                Receive personalized recommendations, payment reminders, and insights that adapt to your financial behavior and progress.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Behavioral insights</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Spending pattern detection</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-400">
                  <CheckCircle className="w-4 h-4 text-[#88B04B] mt-0.5 flex-shrink-0" />
                  <span>Milestone celebrations</span>
                </li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Real Impact Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold mb-4 text-center">Real Impact</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            The difference we're making in real people's financial lives
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center hover:border-[#88B04B]/30 transition-all">
              <h3 className="text-4xl font-bold text-[#88B04B] mb-2">$2M+</h3>
              <p className="text-gray-300">Debt Eliminated</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center hover:border-[#88B04B]/30 transition-all">
              <h3 className="text-4xl font-bold text-[#88B04B] mb-2">50K+</h3>
              <p className="text-gray-300">Active Users</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center hover:border-[#88B04B]/30 transition-all">
              <h3 className="text-4xl font-bold text-[#88B04B] mb-2">35%</h3>
              <p className="text-gray-300">Average Interest Saved</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 text-center hover:border-[#88B04B]/30 transition-all">
              <h3 className="text-4xl font-bold text-[#88B04B] mb-2">4.9/5</h3>
              <p className="text-gray-300">User Rating</p>
            </div>
          </div>
        </motion.section>

        {/* Core Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold mb-4 text-center">Our Core Values</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            The principles that guide everything we do
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:translate-y-[-4px]">
              <Heart className="w-12 h-12 text-[#88B04B] mb-6" />
              <h3 className="text-xl font-bold mb-3">Empathy</h3>
              <p className="text-gray-300">We understand the emotional weight of debt and design compassionate solutions that account for the human experience.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:translate-y-[-4px]">
              <Shield className="w-12 h-12 text-[#88B04B] mb-6" />
              <h3 className="text-xl font-bold mb-3">Security</h3>
              <p className="text-gray-300">We protect your financial data with bank-level encryption and privacy-first practices, earning trust through transparency.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:translate-y-[-4px]">
              <Target className="w-12 h-12 text-[#88B04B] mb-6" />
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-300">We continuously improve our AI to provide more effective financial solutions, staying at the forefront of financial technology.</p>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:translate-y-[-4px]">
              <Users className="w-12 h-12 text-[#88B04B] mb-6" />
              <h3 className="text-xl font-bold mb-3">Community</h3>
              <p className="text-gray-300">We foster a supportive environment for shared financial growth and celebrate every step toward debt freedom.</p>
            </div>
          </div>
        </motion.section>

        {/* Our Team Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-24"
        >
          <h2 className="text-3xl font-bold mb-4 text-center">Leadership</h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Meet the team behind Smart Debt Flow
          </p>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:translate-y-[-4px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#88B04B]/0 to-[#88B04B]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-28 h-28 rounded-full bg-[#88B04B]/20 mx-auto mb-6 flex items-center justify-center relative z-10">
                <span className="text-[#88B04B] text-2xl font-bold">DC</span>
              </div>
              <h3 className="text-xl font-bold mb-1 text-center">David Certan</h3>
              <p className="text-[#88B04B] text-center mb-4">Founder & CEO</p>
              <p className="text-gray-300 text-center">
                Financial technology expert with a passion for making professional debt management accessible to everyone.
              </p>
              <div className="pt-4 mt-4 border-t border-white/10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" className="text-[#88B04B] hover:text-[#88B04B] hover:bg-[#88B04B]/10">
                  Connect <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:translate-y-[-4px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#88B04B]/0 to-[#88B04B]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-28 h-28 rounded-full bg-[#88B04B]/20 mx-auto mb-6 flex items-center justify-center relative z-10">
                <span className="text-[#88B04B] text-2xl font-bold">SC</span>
              </div>
              <h3 className="text-xl font-bold mb-1 text-center">Sarah Chen</h3>
              <p className="text-[#88B04B] text-center mb-4">Chief AI Officer</p>
              <p className="text-gray-300 text-center">
                AI researcher with expertise in financial modeling and machine learning applications for personal finance.
              </p>
              <div className="pt-4 mt-4 border-t border-white/10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" className="text-[#88B04B] hover:text-[#88B04B] hover:bg-[#88B04B]/10">
                  Connect <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
            <div className="bg-white/5 p-8 rounded-xl border border-white/10 hover:border-[#88B04B]/30 transition-all hover:translate-y-[-4px] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-b from-[#88B04B]/0 to-[#88B04B]/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="w-28 h-28 rounded-full bg-[#88B04B]/20 mx-auto mb-6 flex items-center justify-center relative z-10">
                <span className="text-[#88B04B] text-2xl font-bold">MR</span>
              </div>
              <h3 className="text-xl font-bold mb-1 text-center">Michael Ross</h3>
              <p className="text-[#88B04B] text-center mb-4">Chief Financial Strategist</p>
              <p className="text-gray-300 text-center">
                Financial advisor with over 15 years of experience helping individuals and families eliminate debt.
              </p>
              <div className="pt-4 mt-4 border-t border-white/10 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" className="text-[#88B04B] hover:text-[#88B04B] hover:bg-[#88B04B]/10">
                  Connect <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Call to Action */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-10 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#88B04B]/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#88B04B]/10 rounded-full blur-3xl -z-10"></div>
            
            <h2 className="text-3xl font-bold mb-4">Ready to Break Free from Debt?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto mb-8">
              Join thousands of others who have transformed their financial future with Smart Debt Flow.
              Our AI-powered platform makes it simple to create a clear path to financial freedom.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <Button className="bg-[#88B04B] hover:bg-[#7a9d43] text-white px-8 py-3 rounded-lg font-medium flex items-center gap-2 h-auto">
                  Start Your Journey
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/blog">
                <Button variant="outline" className="border-white/20 hover:border-[#88B04B]/50 text-white hover:bg-[#88B04B]/10 px-8 py-3 rounded-lg font-medium h-auto">
                  Read Success Stories
                </Button>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 