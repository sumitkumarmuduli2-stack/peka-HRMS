import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiLayers,
  FiFolder,
  FiBarChart2,
  FiBell,
  FiShield,
  FiCheckSquare,
  FiBriefcase,
  FiPhone,
  FiMail,
  FiMapPin,
  FiArrowRight,
  FiStar,
  FiUserCheck
} from 'react-icons/fi';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const testimonials = [
    {
      name: 'Elena Rostova',
      role: 'Chief HR Officer, TechNovation',
      quote: 'PEKA HRMS completely reformed our recruitment and onboarding flows. The UI is incredibly clean, and the automations save our team 20+ hours every single week!',
      rating: 5,
    },
    {
      name: 'David Vance',
      role: 'Operations Director, AlphaGroup',
      quote: 'The attendance tracker and leave approval features are smooth and error-free. The real-time charts provide quick breakdowns we use in every management sync.',
      rating: 5,
    },
    {
      name: 'Marcus Brody',
      role: 'CEO, Horizon Logistics',
      quote: 'As an organization with 500+ employees, security and role-based permissions were our key concerns. PEKA HRMS checks all boxes with enterprise reliability.',
      rating: 5,
    }
  ];

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      showToast('Please fill out all contact fields.', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/contact', contactForm);
      showToast('Message sent successfully! We will get back to you shortly.', 'success');
      setContactForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    showToast('Thank you for subscribing to our newsletter!', 'success');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', scrollBehavior: 'smooth' }}>
      
      {/* Navigation Bar */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 5%',
      }}>
        <div 
          onClick={() => navigate('/')} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <div style={{
            background: 'var(--gradient-primary)',
            color: 'white',
            fontWeight: 'bold',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '1.2rem',
            fontFamily: 'var(--font-family-display)'
          }}>PEKA</div>
          <span style={{ fontWeight: '800', fontSize: '1.3rem', color: 'var(--primary-color)', fontFamily: 'var(--font-family-display)' }}>HRMS</span>
        </div>

        <div style={{ display: 'flex', gap: '28px', fontSize: '0.95rem', fontWeight: 500 }}>
          <a href="#features" style={{ color: 'var(--text-secondary)' }}>Features</a>
          <a href="#statistics" style={{ color: 'var(--text-secondary)' }}>Statistics</a>
          <a href="#about" style={{ color: 'var(--text-secondary)' }}>About Us</a>
          <a href="#contact" style={{ color: 'var(--text-secondary)' }}>Contact</a>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/login')} className="btn btn-secondary" style={{ padding: '8px 18px', borderRadius: '12px' }}>Login</button>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '8px 18px', borderRadius: '12px' }}>Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        background: 'radial-gradient(circle at 80% 20%, rgba(58, 34, 128, 0.08) 0%, rgba(255, 255, 255, 0) 60%)',
        padding: '80px 5% 120px 5%',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '40px',
        alignItems: 'center',
      }}>
        <div>
          <span style={{
            background: 'rgba(50, 27, 114, 0.08)',
            color: 'var(--primary-color)',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block',
            marginBottom: '18px'
          }}>Next-Gen Workforce Hub</span>
          <h1 style={{
            fontSize: '3.2rem',
            lineHeight: 1.15,
            marginBottom: '20px',
            fontFamily: 'var(--font-family-display)',
            fontWeight: '800',
            color: 'var(--primary-color)'
          }}>
            Simplify HR Operations, <br/>
            <span style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>Empower Your Workforce</span>
          </h1>
          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
            maxWidth: '500px',
            lineHeight: 1.6
          }}>
            A complete enterprise-grade HRMS to manage employee onboarding, attendance, custom leave workflows, recruitment stages, and telemetry analytics from one centralized dashboard.
          </p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ padding: '14px 28px', borderRadius: '14px', fontSize: '1rem' }}>
              Start Free Trial <FiArrowRight />
            </button>
            <a href="#features" className="btn btn-secondary" style={{ padding: '14px 28px', borderRadius: '14px', fontSize: '1rem' }}>
              Explore Features
            </a>
          </div>
        </div>

        {/* Dashboard Mockup Illustration */}
        <div style={{ position: 'relative' }}>
          <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: '24px',
            padding: '20px',
            boxShadow: 'var(--shadow-xl)',
            position: 'relative',
            zIndex: 2,
            border: '4px solid #ffffff'
          }}>
            {/* Simulated UI dashboard mockup */}
            <div style={{ background: '#f8fafc', borderRadius: '14px', padding: '18px', minHeight: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '10px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--danger-color)' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--warning-color)' }}></div>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--success-color)' }}></div>
                </div>
                <div style={{ width: '120px', height: '12px', borderRadius: '6px', backgroundColor: '#e5e7eb' }}></div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ height: '36px', borderRadius: '8px', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', paddingLeft: '8px' }}>
                    <FiUsers style={{ marginRight: '6px', color: 'var(--primary-color)' }} />
                    <div style={{ width: '40px', height: '8px', borderRadius: '4px', backgroundColor: '#cbd5e1' }}></div>
                  </div>
                  <div style={{ height: '36px', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', paddingLeft: '8px', border: '1px solid #e2e8f0' }}>
                    <FiClock style={{ marginRight: '6px', color: '#64748b' }} />
                    <div style={{ width: '50px', height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}></div>
                  </div>
                  <div style={{ height: '36px', borderRadius: '8px', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', paddingLeft: '8px', border: '1px solid #e2e8f0' }}>
                    <FiCalendar style={{ marginRight: '6px', color: '#64748b' }} />
                    <div style={{ width: '45px', height: '8px', borderRadius: '4px', backgroundColor: '#e2e8f0' }}></div>
                  </div>
                </div>

                <div style={{ background: 'white', borderRadius: '10px', padding: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Active Employees</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success-color)' }}>+12.4%</span>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', height: '100px', paddingBottom: '10px' }}>
                    <div style={{ flex: 1, height: '40px', backgroundColor: '#cbd5e1', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, height: '60px', backgroundColor: '#94a3b8', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, height: '50px', backgroundColor: '#64748b', borderRadius: '4px' }}></div>
                    <div style={{ flex: 1, height: '90px', backgroundColor: 'var(--primary-color)', borderRadius: '4px' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Floating Analytics Card */}
          <div style={{
            position: 'absolute',
            bottom: '-20px',
            left: '-30px',
            zIndex: 3,
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '14px 20px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-color)' }}>
              <FiUserCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Attendance Accuracy</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>99.94%</div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section id="statistics" style={{
        backgroundColor: 'var(--primary-color)',
        color: '#ffffff',
        padding: '60px 5%',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '30px',
        textAlign: 'center'
      }}>
        <div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-family-display)', color: '#ffffff', marginBottom: '6px' }}>50+</h3>
          <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Companies Trusting PEKA</p>
        </div>
        <div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-family-display)', color: '#ffffff', marginBottom: '6px' }}>2,000+</h3>
          <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Employees Managed</p>
        </div>
        <div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-family-display)', color: '#ffffff', marginBottom: '6px' }}>99.9%</h3>
          <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Attendance Accuracy</p>
        </div>
        <div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-family-display)', color: '#ffffff', marginBottom: '6px' }}>98%</h3>
          <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Customer Satisfaction</p>
        </div>
        <div>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '800', fontFamily: 'var(--font-family-display)', color: '#ffffff', marginBottom: '6px' }}>99.99%</h3>
          <p style={{ fontSize: '0.9rem', color: '#d1d5db' }}>Server Uptime</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '100px 5%', backgroundColor: 'var(--background-color)' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Feature Rich Suite</span>
          <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-family-display)', marginTop: '8px', color: 'var(--primary-color)' }}>Premium HR Tools Built for Scalability</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
          {/* Card 1 */}
          <div className="card">
            <FiUsers size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Employee Management</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Maintain a complete directory of employee contracts, job titles, education history, and skills profile details.</p>
          </div>
          {/* Card 2 */}
          <div className="card">
            <FiClock size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Attendance Tracking</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enable digital check-in and check-out logs, automated late identification, and monthly timesheet reports.</p>
          </div>
          {/* Card 3 */}
          <div className="card">
            <FiCalendar size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Leave Management</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Customize leave balances, enable automatic deduction calculation, and approve/reject flows with comments.</p>
          </div>
          {/* Card 4 */}
          <div className="card">
            <FiBriefcase size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Recruitment</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Post job vacancy details, parse resumes, schedule interviews, and track applicants status from a pipeline boards.</p>
          </div>
          {/* Card 5 */}
          <div className="card">
            <FiTrendingUp size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Performance Tracking</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Set goals, track KPIs, evaluate team feedback, and generate transparent review documents.</p>
          </div>
          {/* Card 6 */}
          <div className="card">
            <FiLayers size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Departments</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Create organization units, assign managers, and analyze headcount telemetry details.</p>
          </div>
          {/* Card 7 */}
          <div className="card">
            <FiFolder size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Document Management</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Securely store contracts, IDs, resume files, and upload official HR offer letters directly in the cloud.</p>
          </div>
          {/* Card 8 */}
          <div className="card">
            <FiBarChart2 size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Analytics Dashboard</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Visual telemetry charts for leave distribution, department metrics, and general platform utilization.</p>
          </div>
          {/* Card 9 */}
          <div className="card">
            <FiBell size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Notifications</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Receive instant in-app alerts and notifications when updates occur on leaves, tasks, and schedules.</p>
          </div>
          {/* Card 10 */}
          <div className="card">
            <FiShield size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Role-Based Access</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Strict cryptographic boundary for Employees, HR, and Super Admins preventing horizontal privilege escalations.</p>
          </div>
          {/* Card 11 */}
          <div className="card">
            <FiCheckSquare size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Task Management</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Assign tasks with priority and due date, check progress in-realtime, and track history logs.</p>
          </div>
          {/* Card 12 */}
          <div className="card">
            <FiCalendar size={24} style={{ color: 'var(--primary-color)', marginBottom: '14px' }} />
            <h4 style={{ marginBottom: '10px' }}>Holiday Calendar</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Keep teams aligned with global holiday schedules and active organizational schedules.</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section style={{ padding: '100px 5%', backgroundColor: '#ffffff' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <span style={{ color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Lifecycle Flow</span>
          <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-family-display)', marginTop: '8px', color: 'var(--primary-color)' }}>How PEKA HRMS Works</h2>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px',
          maxWidth: '1000px',
          margin: '0 auto'
        }}>
          {[
            { step: '1', title: 'Register', desc: 'Secure company setup' },
            { step: '2', title: 'HR Setup', desc: 'Define departments' },
            { step: '3', title: 'Onboarding', desc: 'Create employee accounts' },
            { step: '4', title: 'Tracking', desc: 'Clock in/out logs' },
            { step: '5', title: 'Manage', desc: 'Process leaves & duties' },
            { step: '6', title: 'Analytics', desc: 'Export reports & insights' }
          ].map((flow, i) => (
            <div key={i} style={{ flex: '1', minWidth: '130px', textAlign: 'center', position: 'relative' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'var(--gradient-primary)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                fontWeight: 'bold',
                fontSize: '1.2rem',
                boxShadow: 'var(--shadow-md)'
              }}>{flow.step}</div>
              <h4 style={{ fontSize: '0.95rem', marginBottom: '6px' }}>{flow.title}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{flow.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" style={{ padding: '100px 5%', backgroundColor: 'var(--background-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px', alignItems: 'center' }}>
          <div>
            <span style={{ color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Our Organization</span>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-family-display)', marginTop: '8px', color: 'var(--primary-color)', marginBottom: '20px' }}>
              Pioneering Smart Workforce Management Solutions
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
              At PEKA, our mission is to build robust, beautiful, and secure software applications that enable modern HR departments to scale seamlessly. We design digital ecosystems that bridge communications between administrators and teammates.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h5 style={{ color: 'var(--secondary-color)', marginBottom: '6px' }}>Our Mission</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Simplify workforce administrative chores to let managers focus on strategic employee values.</p>
              </div>
              <div>
                <h5 style={{ color: 'var(--secondary-color)', marginBottom: '6px' }}>Our Vision</h5>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Become the global choice MERN application for digital corporate workspaces.</p>
              </div>
            </div>
          </div>

          <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: '20px',
            padding: '40px',
            color: '#ffffff',
            boxShadow: 'var(--shadow-xl)'
          }}>
            <h3 style={{ color: '#ffffff', marginBottom: '20px', fontFamily: 'var(--font-family-display)' }}>Why Choose PEKA?</h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Role-Based Portals:</strong> Segmented login spaces with independent controls.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Audit Trail Security:</strong> Activity log registers for administrative audits.
                </div>
              </li>
              <li style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓</span>
                <div>
                  <strong>Analytics-Driven UX:</strong> Real-time charts parsing leave configurations and candidate stages.
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section style={{ padding: '100px 5%', backgroundColor: '#ffffff', textAlign: 'center' }}>
        <span style={{ color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Client Success</span>
        <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-family-display)', marginTop: '8px', color: 'var(--primary-color)', marginBottom: '40px' }}>What Leaders Say About Us</h2>

        <div style={{ maxWidth: '700px', margin: '0 auto', minHeight: '180px' }}>
          <p style={{ fontSize: '1.25rem', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            "{testimonials[activeTestimonial].quote}"
          </p>
          <h4 style={{ marginBottom: '4px' }}>{testimonials[activeTestimonial].name}</h4>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{testimonials[activeTestimonial].role}</span>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', margin: '14px 0' }}>
            {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
              <FiStar key={i} fill="#f59e0b" color="#f59e0b" />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTestimonial(idx)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: activeTestimonial === idx ? 'var(--primary-color)' : '#e2e8f0',
                  border: 'none',
                  cursor: 'pointer'
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: '100px 5%', backgroundColor: 'var(--background-color)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '50px' }}>
          <div>
            <span style={{ color: 'var(--accent-color)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Contact Us</span>
            <h2 style={{ fontSize: '2.4rem', fontFamily: 'var(--font-family-display)', marginTop: '8px', color: 'var(--primary-color)', marginBottom: '24px' }}>Get In Touch With PEKA</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Have queries about corporate subscriptions, pricing, or custom feature installations? Drop us a line.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)', color: 'var(--primary-color)' }}>
                  <FiMapPin size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Corporate Headquarters</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>RCM, Bhubaneswar, Odisha, India</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)', color: 'var(--primary-color)' }}>
                  <FiPhone size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hotline Sales Support</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>+91 123-456-7890</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: 'var(--shadow-sm)', color: 'var(--primary-color)' }}>
                  <FiMail size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Official Communications</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>info@peka-hrms.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="card">
            <h3 style={{ marginBottom: '20px', fontFamily: 'var(--font-family-display)' }}>Send A Message</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. John Doe"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="e.g. john@example.com"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Subject</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="How can we assist you?"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Message ContentLabel</label>
                <textarea
                  className="input-field"
                  style={{ minHeight: '120px', resize: 'vertical' }}
                  placeholder="Write your details here..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                />
              </div>
              <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
                {loading ? 'Sending Message...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        backgroundColor: '#111827',
        color: '#9ca3af',
        padding: '60px 5% 30px 5%',
        borderTop: '1px solid #374151'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <span style={{ fontWeight: '800', fontSize: '1.25rem', color: '#ffffff', fontFamily: 'var(--font-family-display)' }}>PEKA HRMS</span>
            </div>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>Enterprise-grade Human Resource Management System to govern operations and improve team coordination.</p>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '14px', fontFamily: 'var(--font-family-display)' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li><a href="#features">Features</a></li>
              <li><a href="#statistics">Statistics</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#contact">Inquiries</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '14px', fontFamily: 'var(--font-family-display)' }}>Support & Legal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
              <li><a href="#contact">Contact Support</a></li>
              <li><a href="#about">Privacy Policy</a></li>
              <li><a href="#about">Terms & Conditions</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '14px', fontFamily: 'var(--font-family-display)' }}>Newsletter</h4>
            <p style={{ fontSize: '0.85rem', marginBottom: '14px' }}>Subscribe to get latest updates about HR trends.</p>
            <form onSubmit={handleNewsletterSubmit} style={{ display: 'flex', gap: '6px' }}>
              <input type="email" placeholder="Your email" required style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #374151',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                outline: 'none',
                fontSize: '0.85rem'
              }} />
              <button type="submit" className="btn btn-primary" style={{ padding: '8px 14px', fontSize: '0.85rem', borderRadius: '8px' }}>Join</button>
            </form>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #374151',
          paddingTop: '20px',
          textAlign: 'center',
          fontSize: '0.8rem',
          color: '#6b7280'
        }}>
          © {new Date().getFullYear()} PEKA HRMS. All rights reserved. Made by Google DeepMind Antigravity.
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
