import React from 'react';
import { ArrowLeft, ShoppingBag, Users, Shield, TrendingUp } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mb-6"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Home</span>
      </button>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About FYC Marketplace</h1>
        
        <div className="prose max-w-none">
          <p className="text-lg text-gray-700 mb-6">
            Welcome to FYC Marketplace, the official First Year Council marketplace designed specifically 
            for all students across South Africa. Our platform connects students who need to buy 
            and sell textbooks, stationery, electronics, and other student essentials in a safe, convenient, 
            and affordable way.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-600" />
            Our Mission
          </h2>
          <p className="text-gray-700 mb-6">
            At FYC Marketplace, we understand the financial challenges that first-year students face. 
            Textbooks can be expensive, and finding affordable second-hand materials can be difficult. 
            That's why we created this platform – to help students save money while ensuring they have 
            access to the resources they need to succeed in their studies. Our mission is to build a 
            thriving student community where buying and selling is easy, secure, and beneficial for everyone.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-orange-600" />
            What We Offer
          </h2>
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">•</span>
                <span><strong>Textbooks & Study Materials:</strong> Find affordable textbooks for all your courses, from previous students who've completed the modules.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">•</span>
                <span><strong>Electronics & Tech:</strong> Buy and sell laptops, calculators, tablets, and other technology essentials at student-friendly prices.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">•</span>
                <span><strong>Stationery & Supplies:</strong> Get notebooks, pens, folders, and all the supplies you need for a successful academic year.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">•</span>
                <span><strong>Services:</strong> Connect with fellow students offering tutoring, typing services, printing, and other helpful services.</span>
              </li>
              <li className="flex items-start">
                <span className="text-orange-600 font-bold mr-2">•</span>
                <span><strong>Campus-Specific Listings:</strong> Filter items by your campus location for easy meet-ups and quick transactions.</span>
              </li>
            </ul>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="h-6 w-6 text-green-600" />
            Why Choose FYC Marketplace?
          </h2>
          <p className="text-gray-700 mb-4">
            Unlike general marketplace platforms, FYC Marketplace is built exclusively for students, 
            by students. We prioritize safety, affordability, and community. Here's what makes us different:
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Student-Focused</h3>
              <p className="text-sm text-blue-800">
                Every feature is designed with first-year students in mind, from campus filters to 
                affordable subscription pricing for sellers.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-bold text-green-900 mb-2">Safe & Verified</h3>
              <p className="text-sm text-green-800">
                Verified seller badges help you identify trustworthy sellers, and direct WhatsApp 
                communication keeps transactions transparent.
              </p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h3 className="font-bold text-orange-900 mb-2">Campus Convenience</h3>
              <p className="text-sm text-orange-800">
                Find items available on your campus for easy pick-up and avoid expensive shipping costs.
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-bold text-purple-900 mb-2">Affordable for Everyone</h3>
              <p className="text-sm text-purple-800">
                Buyers browse for free, and sellers pay just R25/month to list unlimited items – 
                far cheaper than other platforms.
              </p>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Join Our Growing Community
          </h2>
          <p className="text-gray-700 mb-6">
            FYC Marketplace is more than just a buying and selling platform – it's a community of 
            first-year students helping each other succeed. Whether you're looking to save money on 
            textbooks, make some extra cash by selling items you no longer need, or find essential 
            study materials, FYC Marketplace is here to support your academic journey.
          </p>

          <div className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Start Saving Today!</h3>
            <p className="text-gray-700 mb-4">
              Create your free account now and discover thousands of student listings across South 
              African campuses. Whether you're at Pretoria Central, Soshanguve, Ga-Rankuwa, or any 
              other campus, you'll find what you need right here.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={onBack}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 font-semibold"
              >
                Browse Marketplace
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700">
            Have questions or need support? We're here to help! Reach out to us on WhatsApp at{' '}
            <a href="https://wa.me/27711126204" className="text-blue-600 hover:underline font-semibold">
              +27 71 112 6204
            </a>{' '}
            or email us. Our team is dedicated to making your FYC Marketplace experience smooth 
            and successful.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;