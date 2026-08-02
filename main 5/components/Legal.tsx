
import React from 'react';
import { X, Shield, FileText } from 'lucide-react';
import { Language } from '../types';

interface LegalPageProps {
  title: string;
  content: React.ReactNode;
  onClose: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] bg-white overflow-y-auto animate-fade-in">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-8 sticky top-0 bg-white/90 backdrop-blur-sm py-4 border-b">
          <h1 className="text-2xl font-heading font-bold text-gray-900">{title}</h1>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>
        <div className="prose prose-lg max-w-none text-gray-700">
          {content}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC<{ language: Language }> = ({ language }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 text-kalvi-blue mb-6">
        <Shield size={32} />
        <span className="text-sm font-bold uppercase tracking-wider">Legal Document</span>
      </div>
      
      <p>Last Updated: December 2025</p>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h3>
        <p>We collect information to provide better services to our student and school users. This includes:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
            <li><strong>Account Information:</strong> Name, email, grade level, and school affiliation.</li>
            <li><strong>Progress Data:</strong> Modules completed, assessment scores, and time spent learning.</li>
            <li><strong>Device Information:</strong> Browser type and IP address for security and optimization.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Information</h3>
        <p>Your data is used solely to:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Personalize your learning path.</li>
            <li>Provide progress reports to your school (if applicable).</li>
            <li>Improve our AI models and platform performance.</li>
        </ul>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">3. Data Security</h3>
        <p>We implement industry-standard security measures to protect your personal information. Student data is never sold to third parties.</p>
      </section>
    </div>
  );
};

export const TermsOfService: React.FC<{ language: Language }> = ({ language }) => {
  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3 text-kalvi-indigo mb-6">
        <FileText size={32} />
        <span className="text-sm font-bold uppercase tracking-wider">Terms of Use</span>
      </div>

      <p>Last Updated: December 2025</p>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">1. Acceptance of Terms</h3>
        <p>By accessing Kalvi.AI, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">2. Educational Use</h3>
        <p>Our platform is intended for educational purposes. You agree to use the provided AI tools and content responsibly and ethically.</p>
      </section>

      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-3">3. User Conduct</h3>
        <p>You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>Share your account credentials.</li>
            <li>Attempt to bypass security measures.</li>
            <li>Upload malicious content or misuse the AI chat features.</li>
        </ul>
      </section>
    </div>
  );
};
