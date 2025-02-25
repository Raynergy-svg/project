import { motion } from 'framer-motion';
import { Shield, Users, Target, BarChart, Brain, Globe, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 relative">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Our Story
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Revolutionizing debt management through innovation and empathy
          </p>
        </motion.div>

        {/* Founder Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold mb-4">David Certan</h2>
                <p className="text-[#88B04B] text-lg mb-4">CEO & Founder</p>
                <p className="text-gray-300 leading-relaxed mb-6">
                  With over a decade of experience in fintech and a passion for helping people achieve financial freedom, 
                  David founded Smart Debt Flow with a clear vision: to make professional-grade debt management tools 
                  accessible to everyone through the power of AI.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  "I believe that financial freedom shouldn't be a privilege. By combining cutting-edge AI technology 
                  with proven financial strategies, we're making it possible for anyone to take control of their debt 
                  and build a stronger financial future."
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-2xl font-bold text-[#88B04B]">10+</h3>
                  <p className="text-gray-300">Years in Fintech</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <h3 className="text-2xl font-bold text-[#88B04B]">50K+</h3>
                  <p className="text-gray-300">Lives Impacted</p>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#88B04B]/10 to-transparent p-8 rounded-2xl border border-[#88B04B]/20">
              <div className="aspect-[4/5] relative rounded-xl overflow-hidden bg-white/5">
                <img
                  src="/david-profile.jpg"
                  alt="David Certan"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                    const fallback = document.createElement('div');
                    fallback.className = 'text-center p-8';
                    fallback.innerHTML = `
                      <div class="w-24 h-24 rounded-full bg-[#88B04B]/20 mx-auto mb-4 flex items-center justify-center">
                        <span class="text-[#88B04B] text-2xl font-bold">DC</span>
                      </div>
                      <div class="text-[#88B04B] font-bold">David Certan</div>
                      <div class="text-gray-400 text-sm">CEO & Founder</div>
                    `;
                    target.parentElement?.appendChild(fallback);
                  }}
                />
              </div>
            </div>
          </div>
        </motion.section>

        {/* Our Journey */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <BarChart className="w-10 h-10 text-[#88B04B] mb-4" />
              <h3 className="text-xl font-bold mb-3">2021</h3>
              <p className="text-gray-300">Founded with a mission to democratize debt management through technology</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Brain className="w-10 h-10 text-[#88B04B] mb-4" />
              <h3 className="text-xl font-bold mb-3">2022</h3>
              <p className="text-gray-300">Launched AI-powered debt optimization engine and helped first 10,000 users</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Globe className="w-10 h-10 text-[#88B04B] mb-4" />
              <h3 className="text-xl font-bold mb-3">2023</h3>
              <p className="text-gray-300">Expanded globally and reached 50,000+ active users worldwide</p>
            </div>
          </div>
        </motion.section>

        {/* Our Impact */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
              <h3 className="text-3xl font-bold text-[#88B04B] mb-2">$100M+</h3>
              <p className="text-gray-300">Debt Managed</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
              <h3 className="text-3xl font-bold text-[#88B04B] mb-2">35%</h3>
              <p className="text-gray-300">Average Savings</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
              <h3 className="text-3xl font-bold text-[#88B04B] mb-2">50K+</h3>
              <p className="text-gray-300">Active Users</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10 text-center">
              <h3 className="text-3xl font-bold text-[#88B04B] mb-2">4.9/5</h3>
              <p className="text-gray-300">User Rating</p>
            </div>
          </div>
        </motion.section>

        {/* Our Values */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Heart className="w-10 h-10 text-[#88B04B] mb-4" />
              <h3 className="text-xl font-bold mb-3">Empathy First</h3>
              <p className="text-gray-300">We understand debt's emotional impact and provide compassionate solutions</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Shield className="w-10 h-10 text-[#88B04B] mb-4" />
              <h3 className="text-xl font-bold mb-3">Trust & Security</h3>
              <p className="text-gray-300">Your financial security is our top priority</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Target className="w-10 h-10 text-[#88B04B] mb-4" />
              <h3 className="text-xl font-bold mb-3">Innovation</h3>
              <p className="text-gray-300">Continuously improving our AI to deliver better results</p>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <Users className="w-10 h-10 text-[#88B04B] mb-4" />
              <h3 className="text-xl font-bold mb-3">Community</h3>
              <p className="text-gray-300">Building a supportive community for financial success</p>
            </div>
          </div>
        </motion.section>

        {/* Join Our Mission */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-gradient-to-r from-[#88B04B]/20 to-[#6A9A2D]/20 rounded-xl border border-[#88B04B]/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Join Our Mission</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              We're always looking for passionate individuals who share our vision of making financial freedom accessible to everyone. 
              Whether you're interested in AI, finance, or helping others, we'd love to hear from you.
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
} 