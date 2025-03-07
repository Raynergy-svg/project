import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileCheck, Database, Server, Users, Zap, Clock, Trash2, CheckSquare, XCircle } from 'lucide-react';

export default function Privacy() {
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
              Privacy Policy
            </span>
          </h1>
          <p className="text-xl text-gray-300">
            Your privacy and data security are our top priorities
          </p>
          <p className="mt-4 text-gray-400">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-12"
        >
          <div className="bg-white/5 p-8 rounded-xl border border-white/10">
            <p className="text-gray-300">
              Smart Debt Flow ("we," "our," or "us") is committed to protecting your privacy and securing your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our debt management and financial planning services, website, and mobile application (collectively, the "Service").
            </p>
            <p className="text-gray-300 mt-4">
              Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </div>
        </motion.section>

        {/* Key Points */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {[
            {
              icon: Shield,
              title: "Data Protection",
              description: "We employ industry-leading security measures to protect your personal and financial information."
            },
            {
              icon: Lock,
              title: "Secure Storage",
              description: "All sensitive data is encrypted using AES-256 encryption and stored in secure, certified facilities."
            },
            {
              icon: Eye,
              title: "Data Privacy",
              description: "We never sell your personal information to third parties or use it for marketing purposes without your consent."
            },
            {
              icon: FileCheck,
              title: "Compliance",
              description: "We comply with all relevant data protection regulations including GDPR, CCPA, and financial regulations."
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

        {/* Detailed Sections */}
        <div className="space-y-12 max-w-4xl mx-auto">
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We collect several types of information from and about users of our Service:
              </p>
              <h3 className="text-xl font-bold mb-2">Personal Information</h3>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>• <strong>Account Information:</strong> When you register for our Service, we collect your name, email address, phone number, and login credentials.</li>
                <li>• <strong>Financial Information:</strong> To provide debt management services, we collect information about your debts, income, expenses, assets, liabilities, credit scores, and payment history.</li>
                <li>• <strong>Bank Account Information:</strong> If you choose to connect your bank accounts, we collect account numbers, balances, transaction history, and other account details (with your explicit permission).</li>
                <li>• <strong>Identity Verification:</strong> We may collect government identification documents, social security number (or equivalent), date of birth, and address information to verify your identity and comply with legal requirements.</li>
                <li>• <strong>Payment Information:</strong> If you make payments through our Service, we collect payment card details, bank account information, and payment transaction records.</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-2">Usage and Technical Information</h3>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>• <strong>Usage Data:</strong> Information about how you interact with our Service, including features you use, time spent, pages visited, and actions taken.</li>
                <li>• <strong>Device Information:</strong> We collect information about your device, including IP address, browser type, operating system, device identifiers, and mobile network information.</li>
                <li>• <strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, and similar technologies to enhance your experience, gather usage information, and enable certain Service functionality.</li>
                <li>• <strong>Location Data:</strong> With your consent, we may collect precise geolocation data from your device. You can disable location services in your device settings.</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-2">Information from Third Parties</h3>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Financial Institutions:</strong> With your authorization, we may obtain information from your financial institutions to provide our Service.</li>
                <li>• <strong>Credit Bureaus:</strong> We may collect credit report information from credit bureaus with your consent.</li>
                <li>• <strong>Identity Verification Services:</strong> We may use third-party services to verify your identity and obtain background information.</li>
                <li>• <strong>Public Records:</strong> We may collect publicly available information about you from government and other public sources.</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Providing Services:</strong> To create and manage your account, provide personalized debt management strategies, analyze your financial situation, and facilitate financial transactions.</li>
                <li>• <strong>Improving Our Services:</strong> To develop new features, analyze usage patterns, troubleshoot issues, and enhance user experience.</li>
                <li>• <strong>Communication:</strong> To respond to your inquiries, send service-related notifications, provide customer support, and send important account and security alerts.</li>
                <li>• <strong>Security and Fraud Prevention:</strong> To detect, prevent, and address fraudulent transactions, unauthorized access, and other illegal activities.</li>
                <li>• <strong>Legal Compliance:</strong> To comply with applicable laws, regulations, legal processes, and governmental requests.</li>
                <li>• <strong>Research and Analytics:</strong> To analyze usage trends, conduct research, and create aggregated, de-identified or anonymized data for analytical purposes.</li>
                <li>• <strong>Marketing:</strong> With your explicit consent, we may use your information to send promotional communications about our products, services, and features. You can opt out of these communications at any time.</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">3. How We Share Your Information</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We may share your information with the following categories of third parties:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Service Providers:</strong> We share information with third-party vendors, consultants, and other service providers who need access to such information to carry out work on our behalf (e.g., payment processors, cloud storage providers, and analytics providers).</li>
                <li>• <strong>Financial Institutions:</strong> With your authorization, we may share information with banks, creditors, and other financial institutions to provide our debt management services.</li>
                <li>• <strong>Legal and Regulatory Authorities:</strong> We may disclose information when required by law, regulation, legal process, or governmental request.</li>
                <li>• <strong>Business Transfers:</strong> In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business, your information may be transferred as a business asset.</li>
                <li>• <strong>With Your Consent:</strong> We may share information with third parties when you have given us your consent to do so.</li>
              </ul>
              <p className="text-gray-300 mt-4">
                We do not sell your personal information to third parties. However, we may share anonymized or aggregated information that does not identify you directly with third parties for research, marketing, analytics, and other purposes.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We have implemented appropriate technical and organizational measures to protect your personal information, including:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Encryption:</strong> We use industry-standard encryption technologies to protect your data both in transit and at rest.</li>
                <li>• <strong>Access Controls:</strong> We maintain strict access controls and authentication procedures to limit access to your information.</li>
                <li>• <strong>Secure Infrastructure:</strong> Our systems are hosted in secure, certified data centers with physical security measures.</li>
                <li>• <strong>Regular Security Assessments:</strong> We conduct regular security assessments, penetration testing, and vulnerability scanning.</li>
                <li>• <strong>Employee Training:</strong> Our employees receive regular security awareness training and are required to follow strict privacy protocols.</li>
                <li>• <strong>Incident Response:</strong> We have established incident response procedures to address potential security breaches promptly.</li>
              </ul>
              <p className="text-gray-300 mt-4">
                While we implement safeguards designed to protect your information, no security system is impenetrable. Due to the inherent nature of the Internet, we cannot guarantee that information, during transmission through the Internet or while stored on our systems or otherwise in our care, is absolutely safe from intrusion by others.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">5. Your Privacy Rights</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Right to Access:</strong> You have the right to request details about the personal information we collect about you and how it is used.</li>
                <li>• <strong>Right to Correction:</strong> You have the right to request correction of your personal information if it is inaccurate or incomplete.</li>
                <li>• <strong>Right to Deletion:</strong> You have the right to request deletion of your personal information, subject to certain exceptions.</li>
                <li>• <strong>Right to Data Portability:</strong> You have the right to receive a copy of your personal information in a structured, machine-readable format.</li>
                <li>• <strong>Right to Opt-Out:</strong> You have the right to opt-out of certain uses and disclosures of your personal information.</li>
                <li>• <strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your privacy rights.</li>
              </ul>
              <p className="text-gray-300 mt-4">
                To exercise your rights, please contact us using the information provided in the "Contact Us" section below. We may need to verify your identity before fulfilling your request. We will respond to your request within the timeframe required by applicable law.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">6. Data Retention</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law. The criteria used to determine our retention periods include:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• The length of time we have an ongoing relationship with you and provide services to you</li>
                <li>• Our legal obligations under applicable laws</li>
                <li>• Whether retention is advisable in light of our legal position (such as for statutes of limitations, litigation, or regulatory investigations)</li>
              </ul>
              <p className="text-gray-300 mt-4">
                When we no longer need to use your personal information, we will securely delete or anonymize it in accordance with our data retention policies and applicable law.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">7. Children's Privacy</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300">
                Our Service is not directed to children under the age of 18. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us. If we become aware that we have collected personal information from children without verification of parental consent, we will take steps to remove that information from our servers.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">8. International Data Transfers</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300">
                Our services are operated in the United States. If you are located in the European Economic Area (EEA), United Kingdom, or other regions with laws governing data collection and use that may differ from U.S. law, please note that we may transfer information, including personal information, to a country and jurisdiction that does not have the same data protection laws as your jurisdiction. When we transfer your personal information to other countries, we will protect that information as described in this Privacy Policy and take steps to ensure that your privacy rights continue to be protected as required by applicable law, such as by implementing Standard Contractual Clauses or relying on other appropriate legal mechanisms.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">9. Cookies and Tracking Technologies</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
              </p>
              <p className="text-gray-300 mb-4">
                We use the following types of cookies:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Essential Cookies:</strong> These cookies are necessary for the Service to function properly and cannot be switched off in our systems.</li>
                <li>• <strong>Performance Cookies:</strong> These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our Service.</li>
                <li>• <strong>Functional Cookies:</strong> These cookies enable the Service to provide enhanced functionality and personalization.</li>
                <li>• <strong>Analytics Cookies:</strong> These cookies help us understand how visitors interact with our Service by collecting and reporting information anonymously.</li>
              </ul>
              <p className="text-gray-300 mt-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">10. Changes to This Privacy Policy</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy. We will also notify you of material changes through email or a prominent notice on our Service before the changes become effective. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">11. Your Choices</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                You have several choices regarding the use of your personal information:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Account Information:</strong> You can review and update your account information by logging into your account.</li>
                <li>• <strong>Marketing Communications:</strong> You can opt out of receiving promotional emails from us by following the unsubscribe instructions in those emails. Even if you opt out, we may still send you non-promotional communications, such as those about your account or our ongoing business relations.</li>
                <li>• <strong>Cookies:</strong> You can set your browser to refuse all or some browser cookies, or to alert you when cookies are being sent.</li>
                <li>• <strong>Mobile Push Notifications:</strong> You can opt out of receiving push notifications through your device settings.</li>
                <li>• <strong>Do Not Track:</strong> Some browsers have a "Do Not Track" feature that lets you tell websites that you do not want to have your online activities tracked. Our system currently does not respond to DNT signals.</li>
              </ul>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">12. California Privacy Rights</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                If you are a California resident, you have specific rights regarding your personal information under the California Consumer Privacy Act (CCPA) and California Privacy Rights Act (CPRA), including:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Right to Know:</strong> You have the right to request information about the categories and specific pieces of personal information we have collected about you, the sources from which we collected the information, our purposes for collecting the information, and the categories of third parties with whom we have shared the information.</li>
                <li>• <strong>Right to Delete:</strong> You have the right to request that we delete the personal information we have collected from you, subject to certain exceptions.</li>
                <li>• <strong>Right to Correct:</strong> You have the right to request correction of inaccurate personal information that we maintain about you.</li>
                <li>• <strong>Right to Opt-Out:</strong> You have the right to opt-out of the sale or sharing of your personal information, if applicable.</li>
                <li>• <strong>Right to Limit Use and Disclosure of Sensitive Personal Information:</strong> You have the right to limit our use and disclosure of your sensitive personal information to certain purposes.</li>
                <li>• <strong>Right to Non-Discrimination:</strong> You have the right not to be discriminated against for exercising your CCPA rights.</li>
              </ul>
              <p className="text-gray-300 mt-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">13. Explicit Consent Requirements</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We obtain explicit consent from our users before collecting, processing, or sharing their personal information. Our consent practices are designed to be transparent, informed, and to provide you with control over your data.
              </p>
              
              <h3 className="text-xl font-bold mb-2">Granular Consent Options</h3>
              <p className="text-gray-300 mb-4">
                We provide granular consent options that allow you to make specific choices about how your data is used and shared:
              </p>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>• <strong>Account Creation Consent:</strong> When you create an account, we ask for your consent to collect and process your personal information as described in this Privacy Policy.</li>
                <li>• <strong>Marketing Communications:</strong> You can choose whether to receive marketing communications from us, with the ability to select which types of communications you wish to receive.</li>
                <li>• <strong>Financial Data Access:</strong> You provide separate consent for connecting financial accounts and accessing your financial information.</li>
                <li>• <strong>Data Sharing:</strong> You can control whether your data is shared with third parties for specific purposes.</li>
                <li>• <strong>Cookies and Tracking:</strong> You can manage your preferences for cookies and similar tracking technologies through our cookie management tool.</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-2">Clear Records of Consent</h3>
              <p className="text-gray-300 mb-4">
                We maintain clear records of all consents provided by our users:
              </p>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>• We record the date, time, and method of consent.</li>
                <li>• We store the version of the privacy policy and terms of service that were in effect when consent was given.</li>
                <li>• We document the specific consent options selected by each user.</li>
                <li>• These records are securely stored and can be provided to you upon request.</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-2">Consent Withdrawal Mechanisms</h3>
              <p className="text-gray-300 mb-4">
                You can withdraw your consent at any time through multiple easy-to-use methods:
              </p>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>• <strong>Account Settings:</strong> You can access the "Privacy & Consent" section in your account settings to manage or withdraw your consent for various data processing activities.</li>
                <li>• <strong>Email Preferences:</strong> Every marketing email we send includes an "unsubscribe" link to immediately opt out of future communications.</li>
                <li>• <strong>Direct Contact:</strong> You can contact our customer support or data protection team to request withdrawal of specific consents.</li>
                <li>• <strong>Account Deletion:</strong> You can delete your account entirely, which will withdraw all consents except those necessary for legal compliance.</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-2">Age Verification for Consent</h3>
              <p className="text-gray-300 mb-6">
                We take the protection of minors' data seriously:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• Our Service is not intended for individuals under 18 years of age.</li>
                <li>• During the account creation process, we verify that users are at least 18 years old.</li>
                <li>• If we learn that we have collected personal information from a child under 18 without parental consent, we will take steps to delete that information promptly.</li>
                <li>• We implement age verification mechanisms appropriate to the risk level of our service, including date of birth verification during registration.</li>
              </ul>

              <p className="text-gray-300 mt-4">
                For users in the European Economic Area (EEA), we ensure our consent practices comply with the General Data Protection Regulation (GDPR) requirements for valid consent, including that it is freely given, specific, informed, and unambiguous.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">14. Data Retention and Deletion Practices</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                We maintain specific data retention policies to ensure we keep your information only as long as necessary for legitimate business purposes or as required by law.
              </p>
              
              <h3 className="text-xl font-bold mb-2">Specific Retention Periods</h3>
              <p className="text-gray-300 mb-4">
                Different types of data are retained for different periods:
              </p>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>• <strong>Account Information:</strong> We retain basic account information for as long as you maintain an active account with us, plus 2 years after account closure for legal and business purposes.</li>
                <li>• <strong>Financial Transaction Data:</strong> We retain records of financial transactions for 7 years to comply with tax and financial regulations.</li>
                <li>• <strong>Payment Information:</strong> Your payment information (such as credit card details) is only stored for as long as necessary to complete the transaction, after which full details are deleted with only tokenized references maintained.</li>
                <li>• <strong>Customer Service Communications:</strong> We retain customer service inquiries and communications for 2 years after resolution.</li>
                <li>• <strong>Usage Data:</strong> We retain usage data and analytics information for 13 months to help improve our services.</li>
                <li>• <strong>Security Logs:</strong> Security and authentication logs are retained for 1 year for security monitoring and fraud prevention.</li>
                <li>• <strong>Marketing Preferences:</strong> We retain your marketing preferences until you change them or close your account.</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-2">Secure Data Deletion Process</h3>
              <p className="text-gray-300 mb-4">
                When data reaches the end of its retention period, we follow these secure deletion processes:
              </p>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>• <strong>Digital Erasure:</strong> Electronic data is deleted using industry-standard secure deletion methods that prevent recovery.</li>
                <li>• <strong>Database Purging:</strong> Data is permanently purged from our primary databases and backup systems according to our backup rotation schedule.</li>
                <li>• <strong>Anonymization:</strong> In some cases, we may anonymize data rather than delete it completely. This means removing all identifiers that could link the data to you, making it impossible to identify you from the remaining information.</li>
                <li>• <strong>Third-Party Deletion:</strong> We require our third-party service providers to delete your data in accordance with our retention policies.</li>
                <li>• <strong>Verification:</strong> We conduct regular audits to verify that data deletion processes are functioning correctly.</li>
              </ul>
              
              <h3 className="text-xl font-bold mb-2">Data Handling During Account Closure</h3>
              <p className="text-gray-300 mb-4">
                When you close your account with us, we handle your data as follows:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Immediate Actions:</strong> Upon account closure, we immediately deactivate your login credentials and remove your personal information from active use.</li>
                <li>• <strong>Grace Period:</strong> We maintain a 30-day recovery period during which your account can be reactivated upon request.</li>
                <li>• <strong>Data Removal:</strong> After the grace period, we begin the process of removing your personal data from our systems according to our retention schedule.</li>
                <li>• <strong>Retained Information:</strong> We retain certain information as required by law or for legitimate business purposes, such as financial transaction records for tax purposes or information related to disputes or legal claims.</li>
                <li>• <strong>Backup Systems:</strong> Your data may remain in our backup systems until those backups are rotated or overwritten, which typically occurs within 90 days.</li>
                <li>• <strong>Data Export Option:</strong> Before account closure, you have the option to export your data in a machine-readable format.</li>
              </ul>

              <p className="text-gray-300 mt-4">
                You can request additional information about our retention periods or request deletion of specific information by contacting our data protection team at privacy@smartdebtflow.com.
              </p>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-4">15. Contact Us</h2>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <p className="text-gray-300 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <ul className="space-y-3 text-gray-300">
                <li>• <strong>Email:</strong> privacy@smartdebtflow.com</li>
                <li>• <strong>Phone:</strong> (555) 123-4567</li>
                <li>• <strong>Address:</strong> 123 Financial Plaza, Suite 400, San Francisco, CA 94111</li>
              </ul>
              <p className="text-gray-300 mt-4">
                We will respond to your inquiry within a reasonable timeframe and in accordance with applicable law.
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
              By using Smart Debt Flow's services, you acknowledge that you have read, understood, and agree to this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 