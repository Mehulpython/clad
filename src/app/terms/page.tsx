import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — Clad",
  description:
    "Terms and conditions for using Clad, the AI-powered smart wardrobe application.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: May 1, 2026 · Effective date: May 1, 2026
        </p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Clad (&quot;the Service&quot;), you agree to be bound by these
              Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, you may
              not access or use the Service. These Terms apply to all visitors, users, and
              others who access or use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Description of Service
            </h2>
            <p>
              Clad provides an AI-powered smart wardrobe application that allows users to:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Upload photographs of clothing items for AI-powered analysis</li>
              <li>Receive automated categorization (type, color, pattern, material, formality)</li>
              <li>Generate AI-curated outfit combinations based on wardrobe inventory</li>
              <li>Access weather-aware outfit suggestions</li>
              <li>Use weekly outfit planning features</li>
              <li>Perform wardrobe gap analysis</li>
              <li>Scan potential clothing purchases for wardrobe compatibility</li>
            </ul>
            <p className="mt-2">
              We reserve the right to modify, suspend, or discontinue any part of the Service
              at any time with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You must create an account to access certain features of the Service. Account
                creation requires a valid email address.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your account.
              </li>
              <li>
                You must notify us immediately of any unauthorized use of your account.
              </li>
              <li>
                We provide free, paid (Pro at $6.99/mo), and premium (Studio at $14.99/mo)
                subscription tiers with different feature limits as described in our pricing
                page and documentation.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. Acceptable Use
            </h2>
            <p>You agree NOT to use the Service to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Upload images that are illegal, harmful, threatening, or obscene</li>
              <li>Upload images that infringe on others&apos; intellectual property rights</li>
              <li>Upload images of individuals without their consent</li>
              <li>Attempt to reverse-engineer, decompile, or extract the Service&apos;s underlying AI models or algorithms</li>
              <li>Use the Service for any purpose that violates applicable laws or regulations</li>
              <li>Attempt to gain unauthorized access to other users&apos; data or accounts</li>
              <li>Interfere with or disrupt the integrity or performance of the Service</li>
              <li>Use automated scripts or bots to access the Service excessively</li>
              <li>Resell, redistribute, or commercially exploit the Service without prior written consent</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Intellectual Property
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                The Service and its original content, features, and functionality are owned by
                Clad and are protected by international copyright, trademark, and other
                intellectual property laws.
              </li>
              <li>
                You retain ownership of the wardrobe photographs you upload (&quot;Your Content&quot;).
              </li>
              <li>
                By uploading Your Content, you grant us a limited license to process, store,
                and analyze it solely for the purpose of providing the Service to you.
              </li>
              <li>
                We do not claim ownership of Your Content and will never use it for purposes
                outside of providing the Service without your explicit consent.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. AI Analysis Disclaimers
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                AI-generated clothing analysis, outfit recommendations, gap analysis results,
                and pre-purchase scan verdicts are provided for informational and assistive
                purposes only.
              </li>
              <li>
                AI analysis may not always be accurate. Colors, materials, patterns, and other
                attributes may be misidentified in certain conditions (poor lighting, unusual
                angles, rare garments).
              </li>
              <li>
                Outfit suggestions reflect algorithmic and AI-based assessments and may not
                align with personal taste, cultural norms, or specific dress codes.
              </li>
              <li>
                You should use your own judgment when following AI-generated style advice.
                Clad is not liable for fashion choices made based on AI recommendations.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Payment & Subscriptions
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Paid subscriptions (Pro: $6.99/mo, Studio: $14.99/mo) are billed monthly
                through our payment processor (Stripe).
              </li>
              <li>
                Subscriptions auto-renew unless canceled at least 24 hours before the renewal
                date.
              </li>
              <li>
                You can cancel your subscription at any time from your account settings.
                Cancellation takes effect at the end of the current billing period.
              </li>
              <li>
                Refunds are evaluated on a case-by-case basis. Contact{" "}
                <span className="text-purple-400">hello@clad.app</span> for refund requests.
              </li>
              <li>
                We reserve the right to modify pricing with 30 days&apos; advance notice to
                existing subscribers.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, Clad shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages, including but
              not limited to loss of profits, data, or goodwill, arising from your use of the
              Service, even if we have been advised of the possibility of such damages.
            </p>
            <p className="mt-2">
              Our total liability for any claims arising out of or relating to the Service
              shall not exceed the amount you paid to us in the twelve (12) months preceding
              the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Indemnification
            </h2>
            <p>
              You agree to indemnify and hold harmless Clad and its officers, directors,
              employees, and agents from any claims, liabilities, damages, losses, or expenses
              (including reasonable attorneys&apos; fees) arising from your use of the Service,
              your violation of these Terms, or your infringement of any third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Termination</h2>
            <p>
              We may terminate or suspend your account immediately, without prior notice or
              liability, for any reason, including if you breach these Terms. Upon termination,
              your right to use the Service will cease. All provisions of these Terms which by
              their nature should survive termination shall survive.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              11. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with applicable
              federal laws and the laws of the state in which Clad operates, without regard to
              its conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">12. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Material changes will be
              communicated via email to registered users and/or through a prominent notice
              within the Service. Continued use of the Service after modifications constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">13. Contact</h2>
            <p>
              For questions about these Terms, contact us at:
            </p>
            <div className="glass-card p-4 mt-3 text-gray-400">
              <p>
                <strong>Email:</strong>{" "}
                <span className="text-purple-400">hello@clad.app</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
