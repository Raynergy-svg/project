import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Facebook, Twitter, Instagram, Linkedin, Shield, Lock } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/#features-heading' },
      { label: 'Methods', href: '/#visualization-heading' },
      { label: 'Pricing', href: '/#pricing-heading' },
      { label: 'Debt Planner', href: '/debt-planner' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Blog', href: '/blog' },
      { label: 'Press', href: '/press' },
    ],
    resources: [
      { label: 'Help Center', href: '/help' },
      { label: 'Documentation', href: '/docs' },
      { label: 'Status', href: '/status' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Security', href: '/security' },
      { label: 'Compliance', href: '/compliance' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
  ];

  return (
    <footer className="bg-[#1A1A1A] border-t border-white/10">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Logo size="sm" />
            <p className="mt-4 text-gray-400 text-sm">
              Smart Debt Flow helps you take control of your financial future with AI-powered debt management strategies and tools.
            </p>
            
            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-gray-400 hover:text-[#88B04B] transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Sections */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:col-span-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-white font-semibold mb-3 capitalize">
                  {title}
                </h3>
                <ul className="space-y-2">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-[#88B04B] transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-[#88B04B]" />
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  256-bit SSL Encryption
                </span>
                <span>SOC 2 Certified</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-400">
              © {currentYear} Smart Debt Flow. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
