import React, { useState } from 'react';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ContactSubmissionCategory } from '../types';

export const ContactPage: React.FC = () => {
  const { settings, addContactSubmission } = useApp();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: 'General Inquiry' as ContactSubmissionCategory,
    subject: '',
    message: '',
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const categories: ContactSubmissionCategory[] = [
    'General Inquiry',
    'Membership Request',
    'Matrimonial Support',
    'Emergency Blood Requirement',
    'Scholarship & Student Aid',
    'Donation & Sponsorship',
    'Grievance & Suggestion',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMsg('Please fill in your name, contact phone number, and message.');
      return;
    }

    setErrorMsg('');
    try {
      const id = await addContactSubmission(formData);
      setSubmittedCode(id);
      setIsSubmitted(true);
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Unable to submit your request. Please try again.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-12">
      {/* 1. Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-bold uppercase tracking-wider">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch with ASRGH</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Contact Us & Community Helpdesk
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
          Reach out to our central office for membership inquiries, scholarship applications, blood donor coordination, or hall booking appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* 2. Contact Information Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl space-y-6 border border-slate-800">
            <h3 className="text-xl font-bold text-white border-b border-slate-800 pb-4">
              Registered Office Information
            </h3>

            {/* Address */}
            {settings.show_address && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl text-amber-400 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400">Headquarters Address</h4>
                  <p className="text-sm font-medium text-slate-200 mt-0.5 leading-relaxed">
                    {settings.address_line_1}
                    <br />
                    {settings.address_line_2}
                    <br />
                    {settings.city}, {settings.state} – {settings.postal_code}
                  </p>
                </div>
              </div>
            )}

            {/* Phone */}
            {settings.show_phone && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl text-amber-400 shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400">Phone Support</h4>
                  <a
                    href={`tel:${settings.primary_phone}`}
                    className="text-sm font-semibold text-amber-300 hover:underline block mt-0.5"
                  >
                    {settings.primary_phone}
                  </a>
                  {settings.secondary_phone && (
                    <a
                      href={`tel:${settings.secondary_phone}`}
                      className="text-xs text-slate-300 hover:underline block mt-0.5"
                    >
                      {settings.secondary_phone} (Alternate)
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Email */}
            {settings.show_email && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl text-amber-400 shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400">Official Email</h4>
                  <a
                    href={`mailto:${settings.primary_email}`}
                    className="text-sm font-semibold text-amber-300 hover:underline block mt-0.5"
                  >
                    {settings.primary_email}
                  </a>
                </div>
              </div>
            )}

            {/* Office Hours */}
            {settings.show_office_hours && (
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl text-amber-400 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-400">Visiting Hours</h4>
                  <p className="text-sm font-medium text-slate-200 mt-0.5">{settings.office_hours}</p>
                </div>
              </div>
            )}

            {/* WhatsApp Quick Action Button */}
            {settings.show_whatsapp && settings.whatsapp_number && (
              <div className="pt-4 border-t border-slate-800">
                <a
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\+/g, '')}?text=Namaste!%20I%20am%20reaching%20out%20via%20the%20contact%20page.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-colors shadow-md"
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>Instant Message on WhatsApp</span>
                </a>
              </div>
            )}
          </div>
        </div>

        {/* 3. Inquiry Submission Form (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Thank You! Message Received.</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                Your inquiry has been logged in our central administrative system. An executive team member will get back to you shortly.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl max-w-xs mx-auto border border-slate-200 text-xs">
                <span className="text-slate-500 block">Inquiry Reference Code:</span>
                <span className="text-base font-black text-blue-900 font-mono">{submittedCode}</span>
              </div>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: '',
                    phone: '',
                    email: '',
                    category: 'General Inquiry',
                    subject: '',
                    message: '',
                  });
                }}
                className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Send an Inquiry or Feedback</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fill out this form and our administrative staff will respond via phone or email.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Chandra Agrawal"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contact Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. contact@example.com"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Inquiry Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ContactSubmissionCategory })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-900 font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject / Topic *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Inquiring regarding annual education scholarship criteria"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Detailed Message / Request *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your query or requirement in detail..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-900 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl text-sm transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
