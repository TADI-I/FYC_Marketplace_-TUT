import React from 'react';
import { ArrowLeft, UserPlus, Search, ShoppingCart, MessageCircle, Package, Star,Shield } from 'lucide-react';

interface HowItWorksPageProps {
  onBack: () => void;
}

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">How FYC Marketplace Works</h1>
        
        <p className="text-lg text-gray-700 mb-8">
          FYC Marketplace makes buying and selling student essentials simple, safe, and affordable. 
          Whether you're a buyer looking for textbooks or a seller wanting to make extra money, 
          follow these easy steps to get started.
        </p>

        {/* For Buyers Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <ShoppingCart className="h-8 w-8 text-blue-600" />
            For Buyers
          </h2>

          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Create a Free Account
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Sign up with your email address and select your campus location. Registration is 
                    completely free for buyers, and you'll have immediate access to thousands of student 
                    listings across South Africa.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Use your university email for credibility when contacting sellers.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Search className="h-5 w-5 text-green-600" />
                    Search for Items
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Use our search bar to find specific textbooks, electronics, or services. Filter results 
                    by category (books, electronics, services, etc.) and campus location to find items 
                    available near you. This makes it easy to arrange quick pick-ups without expensive 
                    shipping costs.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Filter by your campus to find sellers nearby for easy meet-ups.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-orange-600" />
                    Contact the Seller
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Found something you like? Click the "WhatsApp Me" button on any listing to contact 
                    the seller directly. You can ask questions about the item's condition, negotiate the 
                    price, and arrange a safe meeting location – all through WhatsApp.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Safety Tip:</strong> Always meet in public campus locations like libraries 
                    or cafeterias. Look for verified seller badges for added trust.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Complete Your Purchase
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Arrange payment and item collection with the seller. Most transactions happen in 
                    person on campus, making it safe and convenient. Always inspect items before paying, 
                    and confirm everything matches the listing description.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Bring exact change or use digital payment methods like PayShap 
                    or EFT for convenience.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* For Sellers Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Package className="h-8 w-8 text-orange-600" />
            For Sellers
          </h2>

          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-blue-600" />
                    Register as a Seller
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Create your account and choose "Seller" as your account type. Upgrade to a seller 
                    subscription for just R25 per month to unlock unlimited listings. This affordable 
                    monthly fee gives you access to thousands of potential buyers across multiple campuses.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> Provide your WhatsApp number during registration so buyers 
                    can contact you easily.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Package className="h-5 w-5 text-green-600" />
                    Create Your Listing
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Click "Add Listing" to create a new product or service listing. Add a clear title, 
                    detailed description, fair price, and high-quality photos. Be specific about the 
                    item's condition, location, and any delivery options you offer. The more details you 
                    provide, the more trust you build with potential buyers.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tip:</strong> Take well-lit photos from multiple angles and mention any defects 
                    honestly to avoid disputes later.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-orange-600" />
                    Respond to Buyers
                  </h3>
                  <p className="text-gray-700 mb-3">
                    When buyers contact you via WhatsApp, respond promptly and professionally. Answer 
                    their questions honestly, negotiate prices fairly, and arrange safe meeting locations 
                    on campus. Quick responses and good communication help you sell faster.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Safety Tip:</strong> Always meet in public campus areas and bring a friend 
                    if possible, especially for high-value items.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-600 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Star className="h-5 w-5 text-purple-600" />
                    Get Verified (Optional)
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Boost buyer confidence by becoming a verified seller! Upload a photo of yourself 
                    holding your student ID, and our admin team will review it within 24-48 hours. 
                    Verified sellers get a special badge on their listings, appear first in search 
                    results, and earn more trust from buyers.
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Benefit:</strong> Verified sellers typically sell items 50% faster than 
                    unverified sellers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Simple, Affordable Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-green-600 mb-2">For Buyers</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">FREE</p>
              <p className="text-gray-600">
                Browse and buy unlimited items with no fees, no hidden charges, and no subscriptions.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-orange-600 mb-2">For Sellers</h3>
              <p className="text-4xl font-bold text-gray-900 mb-2">R25<span className="text-lg">/month</span></p>
              <p className="text-gray-600">
                List unlimited products and services, manage your inventory, and connect with thousands 
                of buyers across all campuses.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-yellow-600" />
            Safety Tips
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-2">•</span>
              <span>Always meet in public places on campus (libraries, cafeterias, student centers)</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-2">•</span>
              <span>Inspect items thoroughly before paying</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-2">•</span>
              <span>Bring a friend along for high-value transactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-2">•</span>
              <span>Use digital payment methods (PayShap, EFT) for traceable transactions</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-2">•</span>
              <span>Trust your instincts – if something feels off, walk away</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 font-bold mr-2">•</span>
              <span>Look for verified seller badges for added confidence</span>
            </li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-orange-600 text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-6">
            Join thousands of first-year students already buying and selling on FYC Marketplace!
          </p>
          <button 
            onClick={onBack}
            className="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 font-bold text-lg"
          >
            Start Shopping Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage;