import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const handleNavigate = (view: string) => {
    // Scroll to top first
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Then navigate
    onNavigate(view);
  };

  return (
    <footer style={{
      backgroundColor: '#111827', // Dark gray/black background
      color: 'white',
      marginTop: '4rem',
      paddingTop: '3rem',
      paddingBottom: '3rem',
      borderTop: '1px solid #374151'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 1rem'
      }}>
        {/* Main Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* About Section */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'white'
            }}>
              About FYC
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => handleNavigate('about')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  About Us
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => handleNavigate('how-it-works')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  How It Works
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => handleNavigate('faq')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'white'
            }}>
              Support
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => handleNavigate('contact')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  Contact Us
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <a 
                  href="https://wa.me/27711126204?text=Hi%2C%20I%20need%20support%20with%20FYC%20Marketplace"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: '#9CA3AF',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  <MessageCircle style={{ height: '1rem', width: '1rem' }} />
                  WhatsApp Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'white'
            }}>
              Legal
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => handleNavigate('terms')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  Terms of Service
                </button>
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <button 
                  onClick={() => handleNavigate('privacy')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#9CA3AF',
                    cursor: 'pointer',
                    padding: 0,
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Campus Locations */}
          <div>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 'bold',
              marginBottom: '1rem',
              color: 'white'
            }}>
              Locations
            </h3>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0, 
              margin: 0,
              fontSize: '0.875rem',
              color: '#9CA3AF'
            }}>
              <li style={{ marginBottom: '0.25rem' }}>Pretoria Central</li>
              <li style={{ marginBottom: '0.25rem' }}>Soshanguve South</li>
              <li style={{ marginBottom: '0.25rem' }}>Soshanguve North</li>
              <li style={{ marginBottom: '0.25rem' }}>Ga-Rankuwa</li>
              <li style={{ marginBottom: '0.25rem' }}>Pretoria Arcadia</li>
              <li style={{ marginBottom: '0.25rem' }}>eMalahleni</li>
              <li style={{ marginBottom: '0.25rem' }}>Mbombela</li>
              <li style={{ marginBottom: '0.25rem' }}>Polokwane</li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '2rem',
          marginTop: '2rem',
          textAlign: 'center'
        }}>
          <p style={{
            color: '#9CA3AF',
            fontSize: '0.875rem',
            marginBottom: '0.5rem'
          }}>
            © {new Date().getFullYear()} FYC Marketplace. All rights reserved.
          </p>
          <p style={{
            color: '#9CA3AF',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Designed by Big Daddy T
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;