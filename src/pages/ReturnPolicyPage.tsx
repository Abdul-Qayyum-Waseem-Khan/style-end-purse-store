import { ShieldCheck, RotateCcw, Sparkles, PackageCheck } from 'lucide-react';
import { Link } from 'react-router';
import { SEO } from '../app/components/SEO';

export function ReturnPolicyPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16">
      <SEO 
        title="Return & Exchange Policy | Style End Purse" 
        description="Read our Return and Exchange Policy for handbags, shoes, pouches, and 3-piece sets at Style End Purse." 
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 animate-slide-up">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#A67C38] mb-3">
            Client Care &amp; Assurance
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-6 font-serif-luxury">Return &amp; Exchange Policy</h1>

          <div className="prose max-w-none">
            <p className="text-lg text-gray-600 mb-8">
              At Style End Purse, every handbag, pair of heels, pouch, and 3-piece set is inspected before dispatch. If your piece isn&apos;t the right fit or arrives with an issue, we make returns and exchanges simple.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#C5A880]/30">
                <RotateCcw className="w-7 h-7 text-[#A67C38] mb-3" />
                <h3 className="text-lg font-bold text-[#111111] mb-2">3-Day Return &amp; Exchange</h3>
                <p className="text-sm text-gray-600">
                  Request a return or shoe-size exchange within <strong>3 days</strong> of receiving your parcel.
                </p>
              </div>
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#C5A880]/30">
                <ShieldCheck className="w-7 h-7 text-[#A67C38] mb-3" />
                <h3 className="text-lg font-bold text-[#111111] mb-2">Condition Eligibility</h3>
                <p className="text-sm text-gray-600">
                  Items must be unused, unworn (clean shoe soles), with all original tags, dust bags, straps, and shoe boxes intact.
                </p>
              </div>
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#C5A880]/30">
                <PackageCheck className="w-7 h-7 text-[#A67C38] mb-3" />
                <h3 className="text-lg font-bold text-[#111111] mb-2">Doorstep Inspection</h3>
                <p className="text-sm text-gray-600">
                  Inspect your Cash on Delivery parcel upon arrival. Damaged, defective, or incorrect items are replaced free of charge.
                </p>
              </div>
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#C5A880]/30">
                <Sparkles className="w-7 h-7 text-[#A67C38] mb-3" />
                <h3 className="text-lg font-bold text-[#111111] mb-2">Non-Returnable Items</h3>
                <p className="text-sm text-gray-600">
                  Used handbags, scuffed footwear, missing dust bags/boxes, or final-sale clearance items are not eligible for return.
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#111111] mb-4 mt-8">How to Request a Return or Exchange</h2>
            <ol className="list-decimal pl-6 space-y-3 text-gray-600 mb-8">
              <li>Sign in to your account and open <strong>My Orders</strong>.</li>
              <li>Select the delivered order and click <strong>Request Return</strong>.</li>
              <li>Upload clear photos of the handbag, footwear, or packaging showing the issue or size concern.</li>
              <li>Download and print the <strong>A4 Return Slip</strong> (Keep the Customer Copy, hand the Courier Copy to the rider, and place the Dispatch Copy inside the box).</li>
              <li>Send the parcel back in its original dust bag/box within 3 days of approval.</li>
            </ol>

            <div className="bg-[#111111] text-white p-6 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-[#C5A880] mb-1">Track Your Return Status</h3>
                <p className="text-xs text-gray-300">Check live return approval and refund updates inside your account dashboard.</p>
              </div>
              <Link to="/account/orders" className="inline-block bg-white text-[#111111] text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full hover:bg-gray-100 transition-colors shrink-0 text-center">
                Go to My Orders &rarr;
              </Link>
            </div>

            <h2 className="text-xl font-bold text-[#111111] mb-3">Refunds &amp; Store Credit</h2>
            <p className="text-gray-600 mb-6">
              Once your returned piece passes quality inspection, refunds are processed within <strong>5–7 business days</strong> via bank transfer, original payment method, or instant store credit for your next Style End Purse order.
            </p>

            <h2 className="text-xl font-bold text-[#111111] mb-3">Need Assistance?</h2>
            <p className="text-gray-600">
              Contact our concierge at{' '}
              <a href="mailto:styleendpurse@gmail.com" className="text-[#A67C38] font-semibold hover:underline">styleendpurse@gmail.com</a>, call{' '}
              <a href="tel:+923069291569" className="text-[#A67C38] font-semibold hover:underline">+923069291569</a>, or visit our{' '}
              <Link to="/contact" className="text-[#A67C38] font-semibold hover:underline">Contact Page</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
