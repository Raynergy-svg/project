import { motion } from 'framer-motion';
import { FileText, Shield, AlertCircle, HelpCircle, Scale, Lock, Banknote, Landmark } from 'lucide-react';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-20 relative">
      <div className="container mx-auto px-4 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-4xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-[#88B04B] to-[#6A9A2D] bg-clip-text text-transparent">
              Terms of Service
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Please read these terms carefully before using our services
          </p>
          <p className="mt-4 text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Important Notices */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: "Security",
              description: "We implement strict security measures to protect your data and financial information."
            },
            {
              icon: Scale,
              title: "Compliance",
              description: "Our services comply with applicable financial regulations and debt management laws."
            },
            {
              icon: Lock,
              title: "Privacy",
              description: "Your personal and financial information is protected with advanced encryption and security protocols."
            },
            {
              icon: HelpCircle,
              title: "Support",
              description: "We provide dedicated customer support to help resolve any issues with our services."
            }
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 p-6 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-[#88B04B]/20 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-[#88B04B]" />
                </div>
                <h3 className="text-xl font-bold">{item.title}</h3>
              </div>
              <p className="text-gray-300">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Introduction Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white/5 p-8 rounded-xl border border-white/10">
            <p className="text-gray-300 mb-4">
              Welcome to Smart Debt Flow ("we," "our," or "us"). By accessing or using our website, mobile applications, and services (collectively, the "Services"), you agree to be bound by these Terms of Service ("Terms"). These Terms constitute a legally binding agreement between you and Smart Debt Flow regarding your use of the Services.
            </p>
            <p className="text-gray-300">
              Our Services are designed to help users manage their debt payments and financial planning. We are not a lender, debt collector, credit counselor, or financial advisor. We provide tools and resources to help you manage your financial obligations, but the ultimate responsibility for your financial decisions remains with you.
            </p>
          </div>
        </motion.section>

        {/* Terms Sections */}
        <div className="space-y-12 max-w-4xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">1. Eligibility and Account Terms</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                By creating an account with us, you represent and warrant that:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• You are at least 18 years of age and have the legal capacity to enter into these Terms</li>
                <li>• You are a resident of a jurisdiction where our Services are available</li>
                <li>• You will provide accurate, complete, and up-to-date information during the registration process and keep your information updated</li>
                <li>• You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>• You are responsible for all activities that occur under your account</li>
                <li>• You will notify us immediately of any unauthorized use of your account</li>
                <li>• You may not share your account credentials with any third party</li>
                <li>• You may not create multiple accounts or create an account for someone else without authorization</li>
              </ul>
              <p className="text-gray-300 mt-4">
                We reserve the right to suspend or terminate your account if any information provided during registration or thereafter proves to be inaccurate, incomplete, or fraudulent. We also reserve the right to refuse service to anyone for any reason at any time.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">2. Services and Usage</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                Our Services include, but are not limited to:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Tools for tracking and managing debt payments</li>
                <li>• Financial planning resources and calculators</li>
                <li>• Personalized debt repayment strategies</li>
                <li>• Secure integration with financial institutions (with your explicit permission)</li>
              </ul>
              <p className="text-gray-300 mt-4 mb-4">
                You agree to use our Services only for lawful purposes and in accordance with these Terms. You agree not to use our Services:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• In any way that violates any applicable federal, state, local, or international law or regulation</li>
                <li>• To engage in any conduct that restricts or inhibits anyone's use or enjoyment of the Services</li>
                <li>• To impersonate or attempt to impersonate Smart Debt Flow, a Smart Debt Flow employee, or another user</li>
                <li>• To engage in any other conduct that could damage, disable, overburden, or impair the Services</li>
                <li>• To attempt to gain unauthorized access to secured portions of the Services</li>
                <li>• To use any robot, spider, or other automatic device to access the Services</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">3. Financial Information and Disclaimer</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                Our Services may display information about your financial accounts and transactions. This information is obtained from:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Information you provide directly to us</li>
                <li>• Third-party financial institutions and service providers (with your authorization)</li>
              </ul>
              <p className="text-gray-300 mt-4 mb-4">
                Important disclaimers regarding financial information:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• We do not guarantee the accuracy, completeness, or timeliness of any financial information presented through our Services</li>
                <li>• We are not responsible for any errors or omissions in the information provided by third-party financial institutions</li>
                <li>• Our Services are for informational purposes only and are not intended to provide financial, legal, or tax advice</li>
                <li>• You should consult with qualified professionals regarding your specific financial situation</li>
                <li>• Any financial projections or calculations are estimates only and should not be relied upon as definitive financial advice</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">4. Payment Terms and Subscription</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We offer both free and premium subscription plans for our Services:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Free trial periods may be available for new users</li>
                <li>• Premium subscriptions are billed according to the plan you select (monthly, quarterly, or annually)</li>
                <li>• All fees are exclusive of applicable taxes, which will be added to your bill where required by law</li>
                <li>• Subscription fees are billed in advance on a recurring basis</li>
                <li>• Payment must be made using an approved payment method</li>
                <li>• Subscription automatically renews unless cancelled at least 24 hours before the end of the current period</li>
                <li>• Price changes will be notified to you at least 30 days in advance</li>
              </ul>
              <p className="text-gray-300 mt-4 mb-4">
                Refund Policy:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Refunds are provided in accordance with applicable laws</li>
                <li>• You may be eligible for a refund within 14 days of initial purchase if the Services are defective</li>
                <li>• No refunds will be provided for partial subscription periods</li>
                <li>• Cancellation of your subscription does not entitle you to a refund for the current billing period</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">5. Privacy and Data Security</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                Your privacy is important to us. Our Privacy Policy describes how we collect, use, and share your personal information. By using our Services, you agree to our Privacy Policy, which is incorporated into these Terms by reference.
              </p>
              <p className="text-gray-300 mb-4">
                Security measures we implement include:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Strong password policies enforced for all accounts</li>
                <li>• Field-level encryption for sensitive user data</li>
                <li>• Advanced security headers to protect against XSS attacks</li>
                <li>• CSRF protection for secure state-changing operations</li>
                <li>• Session management with automatic timeouts</li>
                <li>• Security audit logging of authentication events</li>
              </ul>
              <p className="text-gray-300 mt-4">
                While we implement these security measures, no method of electronic transmission or storage is 100% secure. We cannot guarantee absolute security of your information.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">6. Intellectual Property Rights</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                Unless otherwise indicated, the Services and all content, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof) are owned by Smart Debt Flow, its licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
              </p>
              <p className="text-gray-300 mb-4">
                These Terms permit you to use the Services for your personal, non-commercial use only. You must not:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Modify copies of any materials from the Services</li>
                <li>• Use any illustrations, photographs, video or audio sequences, or any graphics separately from the accompanying text</li>
                <li>• Delete or alter any copyright, trademark, or other proprietary rights notices</li>
                <li>• Access or use for any commercial purposes any part of the Services</li>
              </ul>
              <p className="text-gray-300 mt-4">
                If you provide any feedback, suggestions, or recommendations regarding the Services, we may use such feedback without restriction and without compensation to you.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">7. Third-Party Services and Links</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                Our Services may integrate with or contain links to third-party services, websites, or applications. These third-party services are subject to their own terms of service and privacy policies. We are not responsible for the content or practices of any third-party services and do not endorse or guarantee their offerings.
              </p>
              <p className="text-gray-300 mb-4">
                When connecting your financial accounts through our Services:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• You authorize us to access your financial information from third-party financial institutions</li>
                <li>• You represent that you have the right to grant such access</li>
                <li>• You understand that third-party terms of service and privacy policies will apply</li>
                <li>• You acknowledge that we are not responsible for any acts or omissions of third-party financial institutions</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Your use of third-party services is at your own risk. We recommend reviewing the terms and privacy policies of any third-party service before using it.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL SMART DEBT FLOW, ITS AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE SERVICES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO, PERSONAL INJURY, PAIN AND SUFFERING, EMOTIONAL DISTRESS, LOSS OF REVENUE, LOSS OF PROFITS, LOSS OF BUSINESS OR ANTICIPATED SAVINGS, LOSS OF USE, LOSS OF GOODWILL, LOSS OF DATA, AND WHETHER CAUSED BY TORT (INCLUDING NEGLIGENCE), BREACH OF CONTRACT, OR OTHERWISE, EVEN IF FORESEEABLE.
              </p>
              <p className="text-gray-300 mt-4">
                THE FOREGOING DOES NOT AFFECT ANY LIABILITY WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">9. Disclaimer of Warranties</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                YOUR USE OF THE SERVICES IS AT YOUR SOLE RISK. THE SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. NEITHER SMART DEBT FLOW NOR ANY PERSON ASSOCIATED WITH SMART DEBT FLOW MAKES ANY WARRANTY OR REPRESENTATION WITH RESPECT TO THE COMPLETENESS, SECURITY, RELIABILITY, QUALITY, ACCURACY, OR AVAILABILITY OF THE SERVICES.
              </p>
              <p className="text-gray-300 mb-4">
                WITHOUT LIMITING THE FOREGOING, NEITHER SMART DEBT FLOW NOR ANYONE ASSOCIATED WITH SMART DEBT FLOW REPRESENTS OR WARRANTS THAT:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• THE SERVICES WILL MEET YOUR REQUIREMENTS</li>
                <li>• THE SERVICES WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE</li>
                <li>• THE RESULTS THAT MAY BE OBTAINED FROM THE USE OF THE SERVICES WILL BE ACCURATE OR RELIABLE</li>
                <li>• THE QUALITY OF ANY PRODUCTS, SERVICES, INFORMATION, OR OTHER MATERIAL PURCHASED OR OBTAINED BY YOU THROUGH THE SERVICES WILL MEET YOUR EXPECTATIONS</li>
                <li>• ANY ERRORS IN THE SERVICES WILL BE CORRECTED</li>
              </ul>
              <p className="text-gray-300 mt-4">
                THE FOREGOING DOES NOT AFFECT ANY WARRANTIES WHICH CANNOT BE EXCLUDED OR LIMITED UNDER APPLICABLE LAW.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">10. Indemnification</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300">
                You agree to defend, indemnify, and hold harmless Smart Debt Flow, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of the Services, including, but not limited to, your User Contributions, any use of the Services' content, services, and products other than as expressly authorized in these Terms, or your use of any information obtained from the Services.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">11. Termination</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                You may terminate your account and subscription at any time by following the instructions on our website or by contacting our customer support. Upon termination:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Your right to use the Services will immediately cease</li>
                <li>• You will not be entitled to a refund of any fees paid for the current subscription period</li>
                <li>• We may retain your data as required by law or as outlined in our Privacy Policy</li>
                <li>• You may request the deletion of your personal data subject to our legal obligations</li>
              </ul>
              <p className="text-gray-300 mt-4 mb-4">
                We may terminate or suspend your account and access to the Services immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach these Terms. Upon termination for any reason:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• All provisions of these Terms which by their nature should survive termination shall survive</li>
                <li>• All licenses and rights to use the Services shall immediately terminate</li>
                <li>• You must cease all use of the Services</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">12. Governing Law and Dispute Resolution</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                These Terms and your use of the Services shall be governed by and construed in accordance with the laws of the State of [Your State], without giving effect to any choice or conflict of law provision or rule.
              </p>
              <p className="text-gray-300 mb-4">
                Any legal suit, action, or proceeding arising out of, or related to, these Terms or the Services shall be instituted exclusively in the federal courts of the United States or the courts of the State of [Your State], although we retain the right to bring any suit, action, or proceeding against you for breach of these Terms in your country of residence or any other relevant country.
              </p>
              <p className="text-gray-300 mb-4">
                In the event of any dispute, claim, question, or disagreement arising from or relating to these Terms or the Services, the parties shall use their best efforts to settle the dispute, claim, question, or disagreement. To this effect, they shall consult and negotiate with each other in good faith and, recognizing their mutual interests, attempt to reach a just and equitable solution satisfactory to both parties.
              </p>
              <p className="text-gray-300 mb-4">
                If the parties do not reach such solution within a period of 60 days, then, upon notice by either party to the other, all disputes, claims, questions, or differences shall be finally settled by arbitration administered by the American Arbitration Association in accordance with its Commercial Arbitration Rules.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">13. Changes to Terms</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them, and apply to all access to and use of the Services thereafter. Your continued use of the Services following the posting of revised Terms means that you accept and agree to the changes.
              </p>
              <p className="text-gray-300">
                We will provide notification of material changes to these Terms through:
              </p>
              <ul className="space-y-3 text-gray-300 mt-4">
                <li>• Email notification to the email address associated with your account</li>
                <li>• A prominent notice on our website</li>
                <li>• An in-app notification when you next use the Services</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">14. Compliance with Laws</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                Smart Debt Flow is committed to complying with all applicable laws and regulations, including but not limited to:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Financial services laws and regulations</li>
                <li>• Consumer protection laws</li>
                <li>• Data privacy and security laws</li>
                <li>• Debt management and settlement regulations</li>
              </ul>
              <p className="text-gray-300 mt-4">
                You agree to use our Services in compliance with all applicable laws and regulations. If you are accessing our Services from outside the United States, you are responsible for compliance with local laws.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">15. Miscellaneous</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <ul className="space-y-4 text-gray-300">
                <li>
                  <strong>Entire Agreement:</strong> These Terms, our Privacy Policy, and any other agreements expressly incorporated by reference herein constitute the sole and entire agreement between you and Smart Debt Flow regarding the Services and supersede all prior and contemporaneous understandings, agreements, representations, and warranties, both written and oral.
                </li>
                <li>
                  <strong>Waiver:</strong> No waiver by Smart Debt Flow of any term or condition set out in these Terms shall be deemed a further or continuing waiver of such term or condition or a waiver of any other term or condition, and any failure of Smart Debt Flow to assert a right or provision under these Terms shall not constitute a waiver of such right or provision.
                </li>
                <li>
                  <strong>Severability:</strong> If any provision of these Terms is held by a court or other tribunal of competent jurisdiction to be invalid, illegal, or unenforceable for any reason, such provision shall be eliminated or limited to the minimum extent such that the remaining provisions of the Terms will continue in full force and effect.
                </li>
                <li>
                  <strong>Assignment:</strong> You may not assign or transfer these Terms, by operation of law or otherwise, without Smart Debt Flow's prior written consent. Any attempt by you to assign or transfer these Terms without such consent will be null and void. Smart Debt Flow may freely assign or transfer these Terms without restriction.
                </li>
                <li>
                  <strong>Force Majeure:</strong> Smart Debt Flow shall not be liable for any failure or delay in performance resulting from causes beyond its reasonable control, including but not limited to acts of God, natural disasters, pandemic, war, terrorism, riots, civil unrest, government action, labor disputes, or power failures.
                </li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">Contact Information</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300">
                If you have any questions, concerns, or complaints regarding these Terms or our Services, please contact our support team at:
              </p>
              <ul className="space-y-3 text-gray-300 mt-4">
                <li>• Email: support@smartdebtflow.com</li>
                <li>• Phone: (555) 123-4567</li>
                <li>• Address: 123 Financial Plaza, Suite 400, San Francisco, CA 94111</li>
              </ul>
              <p className="text-gray-300 mt-4">
                We will make every effort to respond to your inquiry promptly and address your concerns.
              </p>
            </div>
          </motion.section>
        </div>

        {/* Acceptance Statement */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-16 mb-8 max-w-4xl mx-auto"
        >
          <div className="bg-[#88B04B]/20 p-6 rounded-xl border border-[#88B04B]/30">
            <p className="text-gray-200">
              By using Smart Debt Flow's services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these Terms, you must not access or use our Services.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 