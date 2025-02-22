export default function Footer() {
  return (
    <footer className="bg-[#1E1E1E] border-t border-white/10 mt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-[#88B04B] font-semibold mb-4">DebtTracker</h3>
            <p className="text-gray-400 text-sm">
              Smart debt management solutions for a better financial future.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <a href="#features" className="hover:text-[#88B04B]">
                  Features
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#88B04B]">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-[#88B04B]">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Contact</h4>
            <p className="text-gray-400 text-sm">
              support@debttracker.com
              <br />
              1-800-DEBT-FREE
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
