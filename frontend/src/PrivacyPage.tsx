import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, UserX } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
          <Shield className="h-10 w-10 text-blue-600" />
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-600 mb-8">Last Updated: February 4, 2026</p>
        
        <div className="prose max-w-none space-y-6 text-gray-700">
          <p className="text-lg">
            At FYC Marketplace, we value your privacy and are committed to protecting your personal information. 
            This Privacy Policy explains how we collect, use, store, and safeguard your data when you use our platform.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-600" />
              Quick Summary
            </h3>
            <ul className="space-y-2 text-sm">
              <li>✓ We collect only essential information to operate the marketplace</li>
              <li>✓ We never sell your personal data to third parties</li>
              <li>✓ You control your profile visibility and can delete your account anytime</li>
              <li>✓ We use industry-standard security to protect your information</li>
              <li>✓ Transactions happen directly between users – we don't store payment details</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Database className="h-6 w-6 text-green-600" />
              1. Information We Collect
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Account Information</h3>
            <p>When you register on FYC Marketplace, we collect:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li><strong>Personal Details:</strong> Name, email address, campus location</li>
              <li><strong>Contact Information:</strong> WhatsApp number (for buyer-seller communication)</li>
              <li><strong>Account Type:</strong> Whether you're a buyer, seller, or admin</li>
              <li><strong>Password:</strong> Encrypted and stored securely</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Seller-Specific Information</h3>
            <p>If you subscribe as a seller, we additionally collect:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li><strong>Subscription Status:</strong> Active, expired, or inactive</li>
              <li><strong>Payment References:</strong> Your payment reference (email + FYC) for verification</li>
              <li><strong>Verification Documents:</strong> Student ID photo (if you request verification)</li>
              <li><strong>Subscription History:</strong> Start dates, end dates, renewal status</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Listing Information</h3>
            <p>When you create product or service listings, we collect:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li><strong>Product Details:</strong> Title, description, price, category</li>
              <li><strong>Images:</strong> Photos you upload of your items</li>
              <li><strong>Location:</strong> Campus location for the listing</li>
              <li><strong>Analytics:</strong> Number of views, WhatsApp clicks (anonymous)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">Usage Data</h3>
            <p>We automatically collect certain technical information:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li><strong>Device Information:</strong> Browser type, operating system, device type (mobile/desktop)</li>
              <li><strong>Log Data:</strong> IP address, access times, pages viewed</li>
              <li><strong>Cookies:</strong> Authentication tokens to keep you logged in</li>
              <li><strong>Interaction Data:</strong> Search queries, clicked listings, time spent on pages</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use your personal data for the following purposes:</p>
            
            <div className="space-y-3 mt-3">
              <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                <p className="font-semibold text-green-900">Platform Operations</p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>Create and manage your account</li>
                  <li>Process seller subscriptions and verify payments</li>
                  <li>Display your listings to potential buyers</li>
                  <li>Enable communication between buyers and sellers via WhatsApp</li>
                </ul>
              </div>

              <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                <p className="font-semibold text-blue-900">Safety & Security</p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>Verify seller identities through student ID photos</li>
                  <li>Detect and prevent fraud, spam, and abuse</li>
                  <li>Enforce our Terms of Service</li>
                  <li>Investigate reported violations or suspicious activity</li>
                </ul>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-600 p-4 rounded">
                <p className="font-semibold text-orange-900">Communication</p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>Send account notifications (subscription renewals, verification updates)</li>
                  <li>Provide customer support responses</li>
                  <li>Notify you of important platform updates or policy changes</li>
                </ul>
              </div>

              <div className="bg-purple-50 border-l-4 border-purple-600 p-4 rounded">
                <p className="font-semibold text-purple-900">Analytics & Improvement</p>
                <ul className="list-disc ml-6 mt-2 text-sm">
                  <li>Analyze platform usage to improve features and user experience</li>
                  <li>Track listing performance (views, clicks) to help sellers optimize</li>
                  <li>Identify popular categories and trends to enhance search results</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="h-6 w-6 text-blue-600" />
              3. Information Sharing and Disclosure
            </h2>
            
            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">What We Share Publicly</h3>
            <p>When you create a listing, the following information is visible to all users:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li>Your name (as seller)</li>
              <li>Campus location</li>
              <li>Product/service details and images</li>
              <li>Verification status (if you're a verified seller)</li>
              <li>WhatsApp number (so buyers can contact you)</li>
            </ul>
            <p className="mt-2 text-sm italic">
              Important: Do not include sensitive personal information in your listing descriptions.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">What We Never Share</h3>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li><strong>We never sell your data:</strong> Your information is never sold to advertisers or third parties</li>
              <li><strong>Private contact details:</strong> Your email address is never shared publicly</li>
              <li><strong>Payment information:</strong> We don't store credit card numbers or banking details</li>
              <li><strong>Passwords:</strong> Stored encrypted and never shared with anyone, including our staff</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-4">When We May Share Information</h3>
            <p>We may share your information only in these limited circumstances:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li><strong>Legal Requirements:</strong> If required by law, court order, or government request</li>
              <li><strong>Safety & Security:</strong> To prevent fraud, abuse, or protect users' safety</li>
              <li><strong>Service Providers:</strong> With trusted partners who help operate the platform (e.g., hosting providers) under strict confidentiality agreements</li>
              <li><strong>Business Transfers:</strong> If FYC Marketplace is acquired or merged, with proper user notification</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your information:</p>
            <ul className="list-disc ml-6 space-y-2 mt-2">
              <li><strong>Encryption:</strong> All passwords are hashed using bcrypt encryption</li>
              <li><strong>HTTPS:</strong> Secure connections for all data transmission</li>
              <li><strong>Access Controls:</strong> Limited employee access to user data (admin accounts only)</li>
              <li><strong>Regular Updates:</strong> Security patches and software updates applied promptly</li>
              <li><strong>Authentication:</strong> JWT tokens with expiration for secure sessions</li>
            </ul>
            <p className="mt-3 text-sm bg-yellow-50 border border-yellow-200 rounded p-3">
              <strong>Note:</strong> While we take security seriously, no online platform can guarantee 100% security. 
              You are responsible for keeping your password confidential and logging out of shared devices.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Data Retention</h2>
            <p>We retain your personal data as follows:</p>
            <ul className="list-disc ml-6 space-y-1 mt-2">
              <li><strong>Active Accounts:</strong> Data retained while your account remains active</li>
              <li><strong>Deleted Accounts:</strong> Personal data deleted within 30 days of account deletion (except as legally required)</li>
              <li><strong>Listings:</strong> Deleted immediately when you remove them or upon account deletion</li>
              <li><strong>Transaction Logs:</strong> Anonymized analytics data may be retained for up to 2 years for platform improvement</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3 flex items-center gap-2">
              <UserX className="h-6 w-6 text-orange-600" />
              6. Your Privacy Rights
            </h2>
            <p>You have the following rights regarding your personal data:</p>
            
            <div className="space-y-3 mt-3">
              <div className="bg-white border border-gray-300 p-4 rounded">
                <p className="font-semibold text-gray-900">Access</p>
                <p className="text-sm mt-1">You can view and edit your profile information anytime through your account settings.</p>
              </div>

              <div className="bg-white border border-gray-300 p-4 rounded">
                <p className="font-semibold text-gray-900">Correction</p>
                <p className="text-sm mt-1">Update incorrect or outdated information in your profile at any time.</p>
              </div>

              <div className="bg-white border border-gray-300 p-4 rounded">
                <p className="font-semibold text-gray-900">Deletion</p>
                <p className="text-sm mt-1">Request account deletion by contacting support. We'll delete your data within 30 days.</p>
              </div>

              <div className="bg-white border border-gray-300 p-4 rounded">
                <p className="font-semibold text-gray-900">Data Portability</p>
                <p className="text-sm mt-1">Request a copy of your personal data in a machine-readable format.</p>
              </div>

              <div className="bg-white border border-gray-300 p-4 rounded">
                <p className="font-semibold text-gray-900">Opt-Out</p>
                <p className="text-sm mt-1">Unsubscribe from marketing emails (though essential account notifications will still be sent).</p>
              </div>
            </div>

            <p className="mt-4">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@firstyearcouncil.co.za" className="text-blue-600 hover:underline">
                support@firstyearcouncil.co.za
              </a>{' '}
              or WhatsApp{' '}
              <a href="https://wa.me/27711126204" className="text-blue-600 hover:underline">
                +27 71 112 6204
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to keep you logged in, remember your preferences, 
              and analyze platform usage. You can control cookies through your browser settings, but 
              disabling them may affect platform functionality (e.g., staying logged in).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Third-Party Links</h2>
            <p>
              FYC Marketplace may contain links to third-party websites (e.g., WhatsApp, payment providers). 
              We are not responsible for the privacy practices of these external sites. Please review their 
              privacy policies before providing any personal information.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">9. Children's Privacy</h2>
            <p>
              FYC Marketplace is intended for users aged 18 and older. We do not knowingly collect personal 
              information from children under 18. If we discover that a child has provided personal data, 
              we will delete it promptly. If you believe a child has registered on our platform, please 
              contact us immediately.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">10. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect changes in our practices or 
              legal requirements. We will notify users of significant changes via email or platform notification. 
              Continued use of FYC Marketplace after changes are posted constitutes acceptance of the updated policy.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">11. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or how we handle your data, please contact us:
            </p>
            <ul className="list-none ml-0 space-y-1 mt-2">
              <li><strong>WhatsApp:</strong> +27 71 112 6204</li>
              <li><strong>Email:</strong> support@firstyearcouncil.co.za</li>
              <li><strong>Website:</strong> www.firstyearcouncil.co.za</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Privacy Matters</h3>
            <p className="text-gray-700">
              We are committed to protecting your privacy and handling your data responsibly. If you have 
              any concerns or questions about how we use your information, please don't hesitate to reach out. 
              Your trust is important to us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;