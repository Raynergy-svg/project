import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Lock, FileCheck, CheckCircle, Clock, Globe, Server, 
  ClipboardList, HelpCircle, Users, ArrowRight, CheckCheck,
  Fingerprint, Eye, Laptop, Download, LockKeyhole, Key, Database,
  Layers, ShieldCheck, AlertCircle, Phone, Mail
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import Head from 'next/head';
import { Button } from '@/components/ui/button';
import BackgroundElements from '@/components/BackgroundElements';
import ScrollToTop from '@/components/ScrollToTop';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export default function Security() {
  const { prefersReducedMotion } = useReducedMotion();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  // Function to toggle FAQ items
  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };
  
  // Simple security features that users care about
  const securityFeatures = [
    {
      title: "Bank-Level Protection",
      description: "Your money is protected with the same security that banks use to keep your finances safe.",
      icon: Lock
    },
    {
      title: "Your Data Stays Private",
      description: "We never sell your personal information to advertisers or third parties.",
      icon: Eye
    },
    {
      title: "Safe Login System",
      description: "Two-step verification and login alerts help prevent unauthorized access to your account.",
      icon: Fingerprint
    },
    {
      title: "Mobile Device Security",
      description: "Use Face ID, Touch ID, or PIN codes to keep your account secure on your phone.",
      icon: Laptop
    }
  ];

  // Simplified privacy promises
  const privacyPromises = [
    {
      title: "We Only Ask For What We Need",
      description: "We only collect information that's necessary to provide our services - nothing more."
    },
    {
      title: "You Control Your Data",
      description: "You can view, download, or delete your data anytime through your account settings."
    },
    {
      title: "Clear Privacy Updates",
      description: "If our privacy practices change, we'll notify you in plain language - no legal jargon."
    },
    {
      title: "No Data Selling",
      description: "Unlike many companies, we don't make money by selling your personal information."
    }
  ];

  // User-friendly FAQs
  const faqs = [
    {
      question: "How do you keep my money information safe?",
      answer: "We use strong encryption (like a super-secure padlock) to scramble your financial data, so only you can access it. We also use multiple security checks before anyone can log in to your account, and we constantly monitor for any suspicious activity."
    },
    {
      question: "Can I delete my data from your system?",
      answer: "Yes! You can request to delete your data at any time through your account settings or by contacting our support team. We'll remove your information from our systems within 30 days."
    },
    {
      question: "Do you share my information with other companies?",
      answer: "We only share your information when it's necessary to provide our services (like when processing a payment) or when required by law. We never sell your personal data to advertisers or other companies."
    },
    {
      question: "What happens if there's a security problem?",
      answer: "If we ever detect a security issue that might affect you, we'll notify you right away by email and in the app. We'll explain what happened in simple terms and tell you exactly what steps you should take to protect yourself."
    },
    {
      question: "How do I report a security concern?",
      answer: "If you notice anything suspicious with your account, please contact us immediately through the app, by email at security@smartdebtflow.com, or by phone at 1-800-555-1212. Our security team is available 24/7 to help."
    }
  ];

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
      },
    }),
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      borderColor: "rgba(29, 185, 84, 0.5)",
      transition: { duration: 0.3 }
    }
  };

  return (
    <Layout>
      <Head>
        <title>Security | Smart Debt Flow</title>
        <meta 
          name="description" 
          content="Learn how Smart Debt Flow keeps your information safe and secure using simple, effective protection measures."
        />
      </Head>
      
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Add background elements with enhanced styling */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute top-1/3 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
        <BackgroundElements />
        
        <main className="relative pt-32 pb-20">
        <div className="container mx-auto px-4 relative">
            {/* Header with animated security icon */}
          <motion.div
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-4xl mx-auto mb-20"
            >
              <motion.div 
                className="inline-block rounded-full bg-primary/10 p-5 mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Shield className="w-16 h-16 text-primary" />
          </motion.div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-primary inline-block"
                >
                  How We Protect You
                </motion.span>
              </h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="text-xl text-muted-foreground max-w-3xl mx-auto"
              >
                Your security is our top priority. Here's how we keep your money and information safe in plain English.
              </motion.p>
            </motion.div>

            {/* Security Features - Using simple language */}
            <motion.section
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-32"
            >
              <h2 className="text-3xl font-bold mb-4 text-center">Security You Can Understand</h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                No technical jargon - just straightforward protection for your money and information
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                {securityFeatures.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={feature.title}
                      custom={index}
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      whileHover="hover"
                      viewport={{ once: true }}
                      className="bg-card/5 rounded-xl border border-border/30 p-8 shadow-lg transition-all duration-300 transform"
                    >
                      <div className="bg-primary/10 rounded-full p-4 w-fit mb-6">
                        <IconComponent className="w-10 h-10 text-primary" />
                  </div>
                      <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground text-lg">{feature.description}</p>
                    </motion.div>
                  );
                })}
            </div>
          </motion.section>

            {/* How We Protect Your Money - Completely simplified approach */}
            <motion.section
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-32"
            >
              <h2 className="text-3xl font-bold mb-4 text-center">How We Protect Your Money</h2>
              <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
                We use multiple layers of protection to keep your money safe
              </p>
              
              <div className="max-w-4xl mx-auto relative">
                {/* Simple shield illustration */}
                <div className="flex justify-center mb-10">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-primary/10 p-6 rounded-full"
                  >
                    <Shield className="w-20 h-20 text-primary" />
                  </motion.div>
                </div>
                
                {/* Security layers as steps */}
                <div className="grid grid-cols-1 gap-8">
                  {[
                    {
                      title: "Layer 1: Bank-Grade Encryption",
                      description: "All your financial data is scrambled using the same encryption that banks use, making it unreadable to anyone without the right keys.",
                      icon: LockKeyhole,
                      details: "This is like having a super-secure vault that only you can open."
                    },
                    {
                      title: "Layer 2: Multi-Factor Authentication",
                      description: "We verify it's really you with multiple security checkpoints before granting access to your account.",
                      icon: Fingerprint,
                      details: "It's like needing both a key and a fingerprint to enter your home."
                    },
                    {
                      title: "Layer 3: 24/7 Fraud Monitoring",
                      description: "Our security systems continuously monitor for unusual activities and suspicious behavior in your account.",
                      icon: Eye,
                      details: "Like having a security guard who's always watching your home."
                    }
                  ].map((layer, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: i * 0.2 }}
                      viewport={{ once: true }}
                      className="bg-card/5 rounded-xl border border-border/30 p-8 shadow-lg relative overflow-hidden"
                    >
                      {/* Layer number decoration */}
                      <div className="absolute -right-6 -top-6 bg-primary/5 w-24 h-24 rounded-full flex items-end justify-start p-3">
                        <span className="text-primary/40 text-xl font-bold">{i + 1}</span>
                      </div>
                      
                      <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="bg-primary/10 p-4 rounded-xl">
                          <layer.icon className="w-10 h-10 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold mb-3">{layer.title}</h3>
                          <p className="text-muted-foreground mb-4">{layer.description}</p>
                          <div className="bg-muted/30 p-3 rounded-lg text-sm text-muted-foreground italic">
                            "{layer.details}"
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Final security statement */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  viewport={{ once: true }}
                  className="mt-12 p-6 bg-primary/5 border border-primary/20 rounded-xl text-center shadow-lg"
                >
                  <Database className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Your Money: Protected at Every Level</h3>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    With these layers working together, your money is protected from potential threats at every step. We're always updating and improving our security to stay ahead of emerging risks.
                  </p>
                </motion.div>
              </div>
            </motion.section>

            {/* Privacy Promises - Simple pledges */}
          <motion.section
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-32"
            >
              <h2 className="text-3xl font-bold mb-4 text-center">Our Privacy Promises</h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                Simple commitments about how we handle your personal information
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {privacyPromises.map((promise, index) => (
                  <motion.div
                    key={promise.title}
                    custom={index}
                    variants={cardVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="bg-card/5 rounded-xl border border-border/30 p-6 shadow-lg flex items-start gap-4"
                  >
                    <div className="bg-primary/10 rounded-full p-2 mt-1">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{promise.title}</h3>
                      <p className="text-muted-foreground">{promise.description}</p>
                </div>
                  </motion.div>
              ))}
            </div>
              
              {/* Simple data control illustration */}
              <motion.div 
                className="max-w-2xl mx-auto mt-16 p-8 bg-card/5 rounded-xl border border-border/30 shadow-lg"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-6 text-center">You're In Control Of Your Data</h3>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { icon: Eye, label: "View", description: "See what data we have" },
                    { icon: Download, label: "Download", description: "Get a copy anytime" },
                    { icon: FileCheck, label: "Delete", description: "Remove your data" }
                  ].map((action, i) => (
                    <motion.div 
                      key={i} 
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.2 }}
                      viewport={{ once: true }}
                    >
                      <div className="bg-primary/10 p-3 rounded-full mb-3">
                        <action.icon className="w-7 h-7 text-primary" />
                      </div>
                      <h4 className="font-bold mb-1">{action.label}</h4>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <Button onClick={() => window.location.href = '/account/privacy'}>
                    Manage Your Privacy Settings
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
            </div>
              </motion.div>
          </motion.section>

            {/* Real-world security examples */}
          <motion.section
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-32"
            >
              <h2 className="text-3xl font-bold mb-4 text-center">Security In Real-World Terms</h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                What our security measures actually mean for you
              </p>
              
              <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Bank-Level Encryption",
                    realWorld: "It's like putting your money in an unbreakable safe where only you have the combination.",
                    icon: Lock
                  },
                  {
                    title: "Two-Factor Authentication",
                    realWorld: "It's like needing both a key and a fingerprint to enter your home - one isn't enough.",
                    icon: Fingerprint
                  },
                  {
                    title: "Account Monitoring",
                    realWorld: "It's like having a security guard who notices if someone unusual tries to access your home.",
                    icon: Eye
                  },
                  {
                    title: "Regular Security Updates",
                    realWorld: "It's like upgrading your home's locks and alarm system to stay ahead of new burglary techniques.",
                    icon: Clock
                  }
                ].map((example, i) => (
                  <motion.div
                    key={i}
            initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="bg-card/5 rounded-xl border border-border/30 p-8 shadow-lg"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <example.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold">{example.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-lg">{example.realWorld}</p>
                  </motion.div>
              ))}
            </div>
          </motion.section>

            {/* Improved FAQs with collapsible answers */}
          <motion.section
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="mb-32"
            >
              <h2 className="text-3xl font-bold mb-4 text-center">Common Questions</h2>
              <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
                Straightforward answers about how we protect you
              </p>
              
              <div className="space-y-4 max-w-3xl mx-auto">
                {faqs.slice(0, showAll ? faqs.length : 3).map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={cn(
                      "bg-card/5 rounded-xl border border-border/30 shadow-md transition-all duration-300",
                      activeFaq === index ? "border-primary/20" : "hover:border-border/60"
                    )}
                  >
                    <div 
                      className="p-6 cursor-pointer flex items-start gap-3"
                      onClick={() => toggleFaq(index)}
                    >
                      <HelpCircle className={cn(
                        "w-6 h-6 flex-shrink-0 mt-1 transition-colors",
                        activeFaq === index ? "text-primary" : "text-muted-foreground"
                      )} />
                      <div className="flex-1">
                        <h3 className={cn(
                          "font-bold text-xl transition-colors",
                          activeFaq === index ? "text-primary" : ""
                        )}>
                          {faq.question}
                        </h3>
                        
                        <AnimatePresence>
                          {activeFaq === index && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden"
                            >
                              <p className="text-muted-foreground mt-4 text-lg">{faq.answer}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {!showAll && faqs.length > 3 && (
                  <div className="text-center mt-6">
                    <Button 
                      variant="outline"
                      onClick={() => setShowAll(true)}
                      className="px-6"
                    >
                      Show All Questions
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}
            </div>
          </motion.section>

            {/* Contact section with animated decorations */}
          <motion.section
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto relative"
            >
              {/* Decorative elements */}
              <motion.div 
                className="absolute -top-10 -left-10 w-20 h-20 bg-primary/20 rounded-full blur-[20px]"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div 
                className="absolute -bottom-10 -right-10 w-20 h-20 bg-primary/10 rounded-full blur-[30px]"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: 1
                }}
              />
              
              <div className="bg-gradient-to-br from-card/20 to-card/5 rounded-xl border border-border/30 p-10 text-center shadow-xl relative z-10 backdrop-blur-sm">
                <Users className="w-16 h-16 text-primary mx-auto mb-6" />
                <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
                  Our friendly support team is here to help with any security concerns. We speak plain English - no technical jargon!
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl mx-auto">
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }}
                    className="bg-card/10 p-5 rounded-xl border border-border/30 flex flex-col items-center"
                  >
                    <Phone className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-bold text-lg mb-1">Call Us</h3>
                    <p className="text-muted-foreground mb-4">Talk to a real person</p>
                    <Button 
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => window.location.href = 'tel:+18005551212'}
                    >
                      1-800-555-1212
                    </Button>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.03 }} 
                    whileTap={{ scale: 0.97 }}
                    className="bg-card/10 p-5 rounded-xl border border-border/30 flex flex-col items-center"
                  >
                    <Mail className="h-8 w-8 text-primary mb-3" />
                    <h3 className="font-bold text-lg mb-1">Email Us</h3>
                    <p className="text-muted-foreground mb-4">Get help with security</p>
                    <Button 
                      size="lg"
                      className="w-full"
                      onClick={() => window.location.href = 'mailto:help@smartdebtflow.com'}
                    >
                      Contact Support
                    </Button>
                  </motion.div>
                </div>
            </div>
          </motion.section>
        </div>
        </main>
        
        {/* Add ScrollToTop button */}
        <ScrollToTop position="bottom-right" />
      </div>
    </Layout>
  );
} 