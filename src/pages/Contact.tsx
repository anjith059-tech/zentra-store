import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, CheckCircle2, MessageSquare, Loader2 } from 'lucide-react';
import { BackButton } from '../components/BackButton';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbycdfssgJItaZiE-zuPfTI0MP6vXxoKT6i7czMoAJVwTkSSt9PbJmCqgGftolcb6VBBHQ/exec';

export const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({
          type: 'contact',
          name: form.name,
          email: form.email,
          message: form.message,
          date: new Date().toISOString(),
        }),
      });

      setSubmitted(true);
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      console.error('Contact form submission error:', err);
      setErrorMessage('Failed to send message. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="contact-page" className="px-4 py-4 space-y-5 pb-20 max-w-2xl md:max-w-xl mx-auto md:py-10 md:pb-24 md:space-y-6">
      <BackButton onClick={() => navigate(-1)} />

      <div>
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Contact Zentra</h1>
        <p className="text-xs md:text-sm text-slate-500 mt-0.5">
          Have questions about our smart home appliances? We're here to help 24/7.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm md:shadow-md space-y-4 md:space-y-5"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
          <span>Send Us a Message</span>
        </h2>

        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="bg-white border border-slate-100 shadow-xl rounded-3xl p-8 flex flex-col items-center text-center mx-auto max-w-sm my-2"
            >
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-5">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2 tracking-tight">Message Sent!</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                Thank you for reaching out. Your message has been received and logged. A Zentra concierge will respond to your inquiry shortly.
              </p>
              <motion.button
                onClick={() => setSubmitted(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className="w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-3.5 rounded-2xl transition-all duration-300 active:scale-95 text-xs"
              >
                Send another message
              </motion.button>
            </motion.div>
          ) : (
            <form key="form" onSubmit={handleSubmit} className="space-y-4 md:space-y-5 text-xs md:text-sm">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs">
                  {errorMessage}
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Your Name *</label>
                <input
                  type="text"
                  required
                  disabled={isSubmitting}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 p-3.5 rounded-2xl font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Email Address *</label>
                <input
                  type="email"
                  required
                  disabled={isSubmitting}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="sarah@example.com"
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 p-3.5 rounded-2xl font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Message *</label>
                <textarea
                  required
                  rows={4}
                  disabled={isSubmitting}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="How can we assist you with Zentra smart appliances?"
                  className="w-full bg-slate-50/80 border border-slate-200 text-slate-900 p-3.5 rounded-2xl font-medium placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 disabled:opacity-60"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={isSubmitting ? {} : { scale: 1.02 }}
                whileTap={isSubmitting ? {} : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-2xl shadow-lg transition-colors mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Message</span>
                  </>
                )}
              </motion.button>
            </form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};