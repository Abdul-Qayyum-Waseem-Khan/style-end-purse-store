import { SEO } from '../app/components/SEO';

export function PrivacyPolicyPage() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-16">
      <SEO 
        title="Privacy Policy | Style End Purse" 
        description="Read the Privacy Policy of Style End Purse — luxury handbags, footwear, and fashion accessories in Pakistan." 
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 animate-slide-up">
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#A67C38] mb-3">
            Legal &amp; Client Trust
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-[#111111] mb-4 font-serif-luxury">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: November 2026</p>

          <div className="prose max-w-none text-gray-600 space-y-6">
            <p>
              Style End Purse, operated by <strong>Mustaqeem Farms &amp; Tech Pvt Ltd</strong> (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;), respects your privacy and is committed to safeguarding your personal information when you browse or shop our collection of handbags, footwear, pouches, 3-piece sets, and fashion accessories.
            </p>

            <div>
              <h2 className="text-xl font-bold text-[#111111] mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                To deliver your fashion orders smoothly and personalize your shopping experience, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity &amp; Contact Data:</strong> Your full name, email address, phone number, and shipping/billing address across Pakistan.</li>
                <li><strong>Order &amp; Style Preferences:</strong> Selected handbag styles, shoe sizes, color variants, wishlist items, and order history.</li>
                <li><strong>Payment &amp; Transaction Data:</strong> Cash on Delivery (COD) confirmation details or payment verification references processed securely through our payment partners.</li>
                <li><strong>Device &amp; Browsing Data:</strong> IP address, browser type, and session cookies used to keep your shopping bag intact and improve site performance.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111111] mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To process, pack, and dispatch your handbags, shoes, and accessories to your doorstep.</li>
                <li>To send order confirmations, courier tracking updates, and return/exchange notifications via email, SMS, or WhatsApp.</li>
                <li>To assist you with sizing, styling, and customer concierge inquiries.</li>
                <li>To prevent fraudulent orders and maintain the security of our storefront.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111111] mb-3">3. Sharing &amp; Data Security</h2>
              <p>
                We never sell or rent your personal data. Information is shared strictly with trusted logistics/courier partners (to complete your delivery) and secure payment gateways. We use encrypted connections and restricted administrative access to protect your account and order records.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#111111] mb-3">4. Your Rights &amp; Contact</h2>
              <p>
                You may request access to, correction of, or deletion of your personal account data at any time. For privacy-related questions, reach out to our team at{' '}
                <a href="mailto:styleendpurse@gmail.com" className="text-[#A67C38] font-semibold hover:underline">styleendpurse@gmail.com</a>{' '}
                or call <a href="tel:+923069291569" className="text-[#A67C38] font-semibold hover:underline">+923069291569</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
