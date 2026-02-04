import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Mail, Clock, MapPin } from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create WhatsApp message
    const waMessage = `*Contact Form Submission*%0A%0A*Name:* ${formData.name}%0A*Email:* ${formData.email}%0A*Subject:* ${formData.subject}%0A*Message:*%0A${formData.message}`;
    const waLink = `https://wa.me/27711126204?text=${waMessage}`;
    
    // Open WhatsApp
    window.open(waLink, '_blank');
    
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

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
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Contact Us</h1>
        
        <p className="text-lg text-gray-700 mb-8">
          Have questions, feedback, or need support? We're here to help! Reach out to the FYC Marketplace 
          team using any of the methods below.
        </p>

        {/* Contact Methods Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* WhatsApp Support */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-green-600 rounded-full p-3">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">WhatsApp Support</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Get instant help via WhatsApp! Our support team responds within minutes during business hours.
            </p>
            <a
              href="https://wa.me/27711126204?text=Hi%2C%20I%20need%20support%20with%20FYC%20Marketplace"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Phone:</strong> +27 71 112 6204
            </p>
          </div>

          {/* Email Support */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 rounded-full p-3">
                <Mail className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Email Support</h3>
            </div>
            <p className="text-gray-700 mb-4">
              Prefer email? Send us a detailed message and we'll respond within 24 hours.
            </p>
            <a
              href="mailto:support@firstyearcouncil.co.za"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold"
            >
              <Mail className="h-4 w-4" />
              Email Us
            </a>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Email:</strong> support@firstyearcouncil.co.za
            </p>
          </div>

          {/* Office Hours */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-orange-600 rounded-full p-3">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Support Hours</h3>
            </div>
            <div className="space-y-2 text-gray-700">
              <p><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
              <p><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
              <p><strong>Sunday & Public Holidays:</strong> Closed</p>
              <p className="text-sm text-gray-600 mt-3">
                All times are in South African Standard Time (SAST)
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 rounded-full p-3">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Location</h3>
            </div>
            <p className="text-gray-700">
              We serve students across all TUT campuses in South Africa, including Pretoria Central, 
              Soshanguve, Ga-Rankuwa, and more.
            </p>
            <p className="text-sm text-gray-600 mt-3">
              <strong>Headquarters:</strong> Pretoria, Gauteng, South Africa
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
          <p className="text-gray-600 mb-6">
            Fill out the form below and we'll send your message via WhatsApp to our support team.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a subject</option>
                <option value="Account Issues">Account Issues</option>
                <option value="Payment & Subscriptions">Payment & Subscriptions</option>
                <option value="Technical Problems">Technical Problems</option>
                <option value="Report a User/Listing">Report a User/Listing</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe your issue or question in detail..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              Send via WhatsApp
            </button>
            
            <p className="text-sm text-gray-600 text-center">
              This will open WhatsApp with your message pre-filled. Click send to submit.
            </p>
          </form>
        </div>

        {/* Common Issues */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Support Topics</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Account & Login</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Password reset</li>
                <li>• Account verification</li>
                <li>• Profile updates</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Payments</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Subscription activation</li>
                <li>• Payment issues</li>
                <li>• Refund requests</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Listings</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Unable to add products</li>
                <li>• Edit or delete listings</li>
                <li>• Image upload problems</li>
              </ul>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Safety & Reports</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Report suspicious users</li>
                <li>• Scam prevention</li>
                <li>• Dispute resolution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-orange-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Check Our FAQ First</h3>
          <p className="text-gray-700 mb-4">
            Many common questions are answered in our comprehensive FAQ section. You might find 
            your answer there instantly!
          </p>
          <button
            onClick={onBack}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold"
          >
            View FAQs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;