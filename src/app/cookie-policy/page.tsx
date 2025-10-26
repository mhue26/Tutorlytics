import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy - Tutorlytics',
  description: 'Learn about how Tutorlytics uses cookies to enhance your experience.',
};

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-GB', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies?</h2>
              <p className="text-gray-700 mb-4">
                Cookies are small text files that are stored on your device when you visit our website. 
                They help us provide you with a better experience by remembering your preferences and 
                enabling certain functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How Tutorlytics Uses Cookies</h2>
              <p className="text-gray-700 mb-4">
                Tutorlytics uses cookies to provide essential functionality and improve your experience 
                as a tutor managing your students and lessons.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
              
              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Essential Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies are necessary for the website to function properly. They enable basic 
                    features like page navigation, access to secure areas, and user authentication.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Session cookies:</strong> Keep you logged in while using Tutorlytics</li>
                    <li><strong>Authentication cookies:</strong> Secure your account and protect your data</li>
                    <li><strong>Security cookies:</strong> Help prevent unauthorized access to your account</li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies enhance your experience by remembering your preferences and settings.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>User preferences:</strong> Remember your dashboard settings and layout preferences</li>
                    <li><strong>Language settings:</strong> Remember your preferred language and region</li>
                    <li><strong>Theme preferences:</strong> Remember your display preferences</li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="text-gray-700 mb-2">
                    These cookies help us understand how you use Tutorlytics so we can improve the platform.
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Usage analytics:</strong> Help us understand which features are most useful</li>
                    <li><strong>Performance monitoring:</strong> Help us identify and fix technical issues</li>
                    <li><strong>Feature optimization:</strong> Help us improve the user experience</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
              <p className="text-gray-700 mb-4">
                Tutorlytics may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li><strong>Google Analytics:</strong> Helps us understand website usage and performance</li>
                <li><strong>Authentication providers:</strong> Google OAuth for secure login</li>
                <li><strong>Cloud services:</strong> For data storage and backup purposes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Your Cookie Preferences</h2>
              <p className="text-gray-700 mb-4">
                You can control cookies through your browser settings. However, please note that 
                disabling certain cookies may affect the functionality of Tutorlytics.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Browser Settings</h3>
                <p className="text-blue-800 mb-2">
                  Most browsers allow you to:
                </p>
                <ul className="list-disc list-inside text-blue-800 space-y-1">
                  <li>View and delete cookies</li>
                  <li>Block cookies from specific websites</li>
                  <li>Block third-party cookies</li>
                  <li>Set up notifications when cookies are set</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Note</h3>
                <p className="text-yellow-800">
                  Disabling essential cookies will prevent you from logging in and using Tutorlytics. 
                  We recommend keeping essential cookies enabled for the best experience.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Protection</h2>
              <p className="text-gray-700 mb-4">
                We take your privacy seriously. All cookies used by Tutorlytics are designed to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Enhance your experience as a tutor</li>
                <li>Keep your account secure</li>
                <li>Remember your preferences</li>
                <li>Help us improve our services</li>
              </ul>
              <p className="text-gray-700 mt-4">
                We do not use cookies to track you across other websites or for advertising purposes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
              <p className="text-gray-700">
                We may update this Cookie Policy from time to time. Any changes will be posted on this 
                page with an updated revision date. We encourage you to review this policy periodically 
                to stay informed about how we use cookies.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> <a href="mailto:support@tutortools.com" className="text-blue-600 hover:text-blue-800">support@tutortools.com</a>
                </p>
                <p className="text-gray-700 mt-2">
                  <strong>Contact Form:</strong> <a href="/contact" className="text-blue-600 hover:text-blue-800">Visit our contact page</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
