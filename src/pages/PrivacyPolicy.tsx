import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, FileText } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div id="privacy-policy-page" className="px-4 py-4 space-y-4 pb-20">
      <BackButton onClick={() => navigate(-1)} />

      <div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
        <p className="text-xs text-slate-500 mt-0.5">Last updated: January 2026</p>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-2xs space-y-4 text-xs text-slate-600 leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-blue-600" />
            1. Information We Collect
          </h2>
          <p>
            Zentra collects information necessary to process your orders, fulfill delivery, and provide personalized smart home app sync services. This includes name, email, phone number, and shipping address.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            2. Payment Security
          </h2>
          <p>
            All payment transactions are encrypted using 256-bit SSL encryption provided by certified gateways including Razorpay and Stripe. Zentra never stores raw payment card credentials.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-amber-600" />
            3. Data Protection Guarantee
          </h2>
          <p>
            We respect your privacy. Zentra will never sell, lease, or distribute your personal customer information to third-party advertisers.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-600" />
            4. Warranty & Smart Home App Sync
          </h2>
          <p>
            All Zentra appliances come with a 2-Year Official Manufacturer Replacement Warranty. Connected appliances communicate via encrypted local Wi-Fi protocols.
          </p>
        </section>
      </div>
    </div>
  );
};
