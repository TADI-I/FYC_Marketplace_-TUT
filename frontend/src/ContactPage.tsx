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
    <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '2rem 1rem' }}>
      <button 
        onClick={onBack}
        style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '0.5rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
      >
        <ArrowLeft style={{ height: '1.25rem', width: '1.25rem' }} />
        <span>Back to Home</span>
      </button>

      <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', padding: '2rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem' }}>Contact Us</h1>
        
        <p style={{ fontSize: '1.125rem', color: '#374151', marginBottom: '2rem' }}>
          Have questions, feedback, or need support? We're here to help! Reach out to the FYC Marketplace 
          team using any of the methods below.
        </p>

        {/* Contact Methods Grid - FIXED WITH INLINE STYLES */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '3rem' 
        }}>
          {/* WhatsApp Support */}
          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '0.75rem', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#16a34a', borderRadius: '50%', padding: '0.75rem' }}>
                <MessageCircle style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>WhatsApp Support</h3>
            </div>
            <p style={{ color: '#374151', marginBottom: '1rem' }}>
              Get instant help via WhatsApp! Our support team responds within minutes during business hours.
            </p>
            <a
              href="https://wa.me/27711126204?text=Hi%2C%20I%20need%20support%20with%20FYC%20Marketplace"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#15803d'}
              onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#16a34a'}
            >
              <MessageCircle style={{ height: '1rem', width: '1rem' }} />
              Chat on WhatsApp
            </a>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.75rem' }}>
              <strong>Phone:</strong> +27 71 112 6204
            </p>
          </div>

          {/* Email Support */}
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe', 
            borderRadius: '0.75rem', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#2563eb', borderRadius: '50%', padding: '0.75rem' }}>
                <Mail style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Email Support</h3>
            </div>
            <p style={{ color: '#374151', marginBottom: '1rem' }}>
              Prefer email? Send us a detailed message and we'll respond within 24 hours.
            </p>
            <a
              href="mailto:support@firstyearcouncil.co.za"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#2563eb'}
            >
              <Mail style={{ height: '1rem', width: '1rem' }} />
              Email Us
            </a>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.75rem' }}>
              <strong>Email:</strong> support@firstyearcouncil.co.za
            </p>
          </div>

          {/* Office Hours */}
          <div style={{ 
            backgroundColor: '#fff7ed', 
            border: '1px solid #fed7aa', 
            borderRadius: '0.75rem', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#ea580c', borderRadius: '50%', padding: '0.75rem' }}>
                <Clock style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Support Hours</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#374151' }}>
              <p style={{ margin: 0 }}><strong>Monday - Friday:</strong> 8:00 AM - 6:00 PM</p>
              <p style={{ margin: 0 }}><strong>Saturday:</strong> 9:00 AM - 2:00 PM</p>
              <p style={{ margin: 0 }}><strong>Sunday & Public Holidays:</strong> Closed</p>
              <p style={{ fontSize: '0.875rem', color: '#4b5563', marginTop: '0.75rem', marginBottom: 0 }}>
                All times are in South African Standard Time (SAST)
              </p>
            </div>
          </div>

          {/* Location */}
          <div style={{ 
            backgroundColor: '#faf5ff', 
            border: '1px solid #e9d5ff', 
            borderRadius: '0.75rem', 
            padding: '1.5rem' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#9333ea', borderRadius: '50%', padding: '0.75rem' }}>
                <MapPin style={{ height: '1.5rem', width: '1.5rem', color: 'white' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>Location</h3>
            </div>
            <p style={{ color: '#374151', marginBottom: '0.75rem' }}>
              We serve students across all TUT campuses in South Africa, including Pretoria Central, 
              Soshanguve, Ga-Rankuwa, and more.
            </p>
            <p style={{ fontSize: '0.875rem', color: '#4b5563', margin: 0 }}>
              <strong>Headquarters:</strong> Pretoria, Gauteng, South Africa
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div style={{ backgroundColor: '#f9fafb', borderRadius: '0.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Send Us a Message</h2>
          <p style={{ color: '#4b5563', marginBottom: '1.5rem' }}>
            Fill out the form below and we'll send your message via WhatsApp to our support team.
          </p>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Your Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem'
                  }}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Subject *
              </label>
              <select
                required
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem'
                }}
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
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Your Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                rows={6}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
                placeholder="Describe your issue or question in detail..."
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
              onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb'}
            >
              <MessageCircle style={{ height: '1.25rem', width: '1.25rem' }} />
              Send via WhatsApp
            </button>
            
            <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', margin: 0 }}>
              This will open WhatsApp with your message pre-filled. Click send to submit.
            </p>
          </form>
        </div>

        {/* Common Issues - FIXED BULLETS */}
        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Common Support Topics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Account & Login</h3>
              <ul style={{ fontSize: '0.875rem', color: '#374151', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Password reset</li>
                <li>Account verification</li>
                <li>Profile updates</li>
              </ul>
            </div>
            
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Payments</h3>
              <ul style={{ fontSize: '0.875rem', color: '#374151', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Subscription activation</li>
                <li>Payment issues</li>
                <li>Refund requests</li>
              </ul>
            </div>
            
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Listings</h3>
              <ul style={{ fontSize: '0.875rem', color: '#374151', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Unable to add products</li>
                <li>Edit or delete listings</li>
                <li>Image upload problems</li>
              </ul>
            </div>
            
            <div style={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Safety & Reports</h3>
              <ul style={{ fontSize: '0.875rem', color: '#374151', paddingLeft: '1.25rem', margin: 0 }}>
                <li>Report suspicious users</li>
                <li>Scam prevention</li>
                <li>Dispute resolution</li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Link */}
        <div style={{
          marginTop: '2rem',
          background: 'linear-gradient(to right, #eff6ff, #fff7ed)',
          border: '1px solid #bfdbfe',
          borderRadius: '0.5rem',
          padding: '1.5rem',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>Check Our FAQ First</h3>
          <p style={{ color: '#374151', marginBottom: '1rem' }}>
            Many common questions are answered in our comprehensive FAQ section. You might find 
            your answer there instantly!
          </p>
          <button
            onClick={onBack}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#2563eb'}
          >
            View FAQs
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;