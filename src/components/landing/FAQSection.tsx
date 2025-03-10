import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: () => void;
}

const FAQItemComponent = ({ item, isOpen, onToggle }: FAQItemProps) => {
  return (
    <div className="border-b last:border-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full py-4 text-left font-medium hover:underline focus:outline-none"
      >
        {item.question}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-4 w-4 flex-shrink-0 transition-transform duration-200" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-sm text-muted-foreground">
          <p>{item.answer}</p>
        </div>
      )}
    </div>
  );
};

const faqs: FAQItem[] = [
  {
    question: "How does Smart Debt Flow work?",
    answer: "Smart Debt Flow helps you manage your debt by organizing all your accounts in one place, creating optimized payment plans, and tracking your progress. You can connect your accounts or enter information manually, and our algorithms will calculate the best strategies to pay off your debt faster and save on interest."
  },
  {
    question: "Is my financial information secure?",
    answer: "Yes, security is our top priority. We use bank-level 256-bit encryption and secure connections. We never store your banking passwords - we use token-based access through trusted financial partners. Your data is encrypted both in transit and at rest."
  },
  {
    question: "Can I use Smart Debt Flow for free?",
    answer: "Yes! We offer a free plan that includes basic debt tracking and simple payment planning. Our premium plans add advanced features like automated payment strategies, detailed reports, and personalized financial coaching."
  },
  {
    question: "Which debt payoff methods does Smart Debt Flow support?",
    answer: "We support the most effective debt reduction strategies including the Debt Snowball (prioritizing smallest debts first), Debt Avalanche (prioritizing highest interest first), and custom hybrid approaches. Our smart algorithm can also suggest the optimal strategy based on your specific situation."
  },
  {
    question: "Can I connect my bank accounts?",
    answer: "Yes, you can securely connect your financial accounts for automatic updates. We support connections with over 10,000 financial institutions. If you prefer, you can also manually track your accounts by entering the information yourself."
  },
  {
    question: "How much can Smart Debt Flow help me save?",
    answer: "Most users save significantly on interest payments and time to debt freedom. On average, our users save 35% on interest payments and pay off debt 40% faster than they would with minimum payments. Your personal savings will depend on your specific debt situation."
  }
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  
  const toggleFAQ = (index: number) => {
    if (openIndex === index) {
      setOpenIndex(null);
    } else {
      setOpenIndex(index);
    }
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Got questions about Smart Debt Flow? Find answers to the most common questions below.
        </p>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <div className="border rounded-md">
          {faqs.map((faq, index) => (
            <FAQItemComponent
              key={index}
              item={faq}
              isOpen={openIndex === index}
              onToggle={() => toggleFAQ(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSection; 