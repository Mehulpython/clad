import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Clad",
  description:
    "Learn how Clad collects, uses, and protects your data. Privacy policy for the AI-powered smart wardrobe application.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">
          Last updated: May 1, 2026 · Effective date: May 1, 2026
        </p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              Clad (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates an AI-powered smart wardrobe
              application (&quot;the Service&quot;). We respect your privacy and are committed to
              protecting your personal data. This privacy policy explains how we collect, use,
              disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. Data We Collect
            </h2>

            <h3 className="font-semibold text-gray-200 mt-4 mb-2">
              2.1 Information You Provide
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Account information:</strong> Name, email address, and profile details
                (gender, body type, skin tone, location) provided during sign-up and profile setup.
              </li>
              <li>
                <strong>Wardrobe photographs:</strong> Images of your clothing items that you
                upload to the Service.
              </li>
              <li>
                <strong>Clothing metadata:</strong> Brand, size, purchase price, purchase date,
                and other optional details you add to wardrobe items.
              </li>
              <li>
                <strong>Style preferences:</strong> Favorite colors, preferred style, risk
                tolerance, brand affinity, and dress code notes.
              </li>
            </ul>

            <h3 className="font-semibold text-gray-200 mt-4 mb-2">
              2.2 Automatically Collected Information
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Usage data:</strong> Pages visited, features used, outfit generations,
                wear counts, and interaction patterns within the Service.
              </li>
              <li>
                <strong>Device data:</strong> Browser type, operating system, screen resolution,
                and device identifiers.
              </li>
              <li>
                <strong>Location data:</strong> General location (zip code level) provided for
                weather-aware features. Precise GPS data is never collected.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. How We Use Your Data
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide, maintain, and improve the AI-powered wardrobe service</li>
              <li>To analyze your clothing images using AI (GPT-4o Vision) for categorization and styling</li>
              <li>To generate personalized outfit recommendations based on your wardrobe</li>
              <li>To provide weather-aware outfit suggestions</li>
              <li>To perform gap analysis and pre-purchase scanning</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To detect and prevent technical issues or abuse</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. AI Processing & Image Data
            </h2>
            <p>
              Your wardrobe photographs are processed by OpenAI&apos;s GPT-4o Vision model for
              clothing analysis. Here&apos;s what you need to know:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Images are sent to OpenAI&apos;s API for analysis and are not used to train their
                models (per OpenAI&apos;s enterprise API data policy).
              </li>
              <li>
                Analysis results (not raw images) are stored in your private database.
              </li>
              <li>
                You can delete any wardrobe image at any time; deletion removes the image from
                our storage permanently.
              </li>
              <li>
                AI-generated tags and analyses are associated with your account and can be
                corrected by you at any time.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p>We integrate with the following third-party services:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Clerk:</strong> Handles user authentication and account management.
                Their{" "}
                <span className="text-purple-400">privacy policy</span> applies to auth-related
                data processing.
              </li>
              <li>
                <strong>Supabase:</strong> Provides our database infrastructure. Data is encrypted
                at rest and in transit. Row-Level Security ensures users can only access their own
                data.
              </li>
              <li>
                <strong>OpenAI:</strong> Processes clothing images for AI analysis via API calls.
                Images are not retained by OpenAI beyond the API request lifecycle.
              </li>
              <li>
                <strong>Open-Meteo:</strong> Provides weather data for outfit suggestions. No
                personal data is shared with this service beyond your general location (zip code).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Data Security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All data is encrypted in transit (TLS 1.3) and at rest (AES-256)</li>
              <li>Database access requires authentication via Row-Level Security policies</li>
              <li>We conduct regular security reviews of our infrastructure</li>
              <li>Wardrobe images are stored in private, authenticated storage</li>
              <li>We never sell or share your personal data with third parties for marketing purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Your Rights</h2>
            <p>Depending on your jurisdiction, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Access and download a copy of your personal data</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent for data processing where applicable</li>
              <li>Object to processing of your personal data</li>
              <li>Request restriction of processing in certain circumstances</li>
            </ul>
            <p className="mt-3">
              To exercise these rights, contact us at{" "}
              <span className="text-purple-400">hello@clad.app</span>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Data Retention
            </h2>
            <p>
              We retain your data for as long as your account is active. If you delete your
              account, we will remove your personal data within 30 days, except where we are
              legally required to retain certain records longer. Wardrobe images and all
              derived data are permanently deleted upon account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Children&apos;s Privacy
            </h2>
            <p>
              Our Service is not intended for children under 13 years of age. We do not
              knowingly collect personal information from children under 13. If we become aware
              that we have collected such data, we will take steps to delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this privacy policy from time to time. We will notify users of
              material changes by posting the new policy on this page and updating the
              &quot;Last updated&quot; date. Continued use of the Service after changes constitutes
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
            <p>
              For questions about this privacy policy or our data practices, contact us at:
            </p>
            <div className="glass-card p-4 mt-3 text-gray-400">
              <p>
                <strong>Email:</strong>{" "}
                <span className="text-purple-400">hello@clad.app</span>
              </p>
              <p>
                <strong>This policy applies to:</strong> clad.app and all subdomains
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
