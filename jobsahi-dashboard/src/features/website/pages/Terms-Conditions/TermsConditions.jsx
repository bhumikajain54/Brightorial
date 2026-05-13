import React from "react";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

const TermsConditions = () => {
  return (
    <div className="bg-[#00395B]  ">
      <Navbar />
      
      <div className="bg-white m-4 rounded-[50px] min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#0B537D] mb-4">
              Terms & Conditions
            </h1>
            <p className="text-gray-600 text-lg">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using JobSahi ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. These Terms and Conditions govern your use of our job portal services for ITI and Polytechnic candidates.
              </p>
              <p className="text-gray-700 leading-relaxed">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">2. Description of Service</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                JobSahi is a job portal platform that connects ITI and Polytechnic candidates with recruiters and skill partners. Our services include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Job search and application platform</li>
                <li>Resume building and management tools</li>
                <li>Course and training program listings</li>
                <li>Career guidance and resources</li>
                <li>Communication tools between candidates and recruiters</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">3. User Accounts and Registration</h2>
              <h3 className="text-xl font-medium text-[#0B537D] mb-3">3.1 Account Creation</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>You must provide accurate and complete information during registration</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must be at least 16 years old to create an account</li>
                <li>One account per person is allowed</li>
              </ul>

              <h3 className="text-xl font-medium text-[#0B537D] mb-3">3.2 Account Responsibilities</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Keep your login credentials secure</li>
                <li>Update your information when it changes</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>You are responsible for all activities under your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">4. User Conduct</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Provide false or misleading information</li>
                <li>Use the platform for illegal or unauthorized purposes</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Upload malicious software or harmful content</li>
                <li>Violate any applicable laws or regulations</li>
                <li>Attempt to gain unauthorized access to the platform</li>
                <li>Use automated systems to access the platform</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">5. Content and Intellectual Property</h2>
              <h3 className="text-xl font-medium text-[#0B537D] mb-3">5.1 User Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of content you upload to the platform. However, by uploading content, you grant JobSahi a non-exclusive, royalty-free license to use, display, and distribute your content for platform purposes.
              </p>

              <h3 className="text-xl font-medium text-[#0B537D] mb-3">5.2 Platform Content</h3>
              <p className="text-gray-700 leading-relaxed">
                All content on the platform, including text, graphics, logos, and software, is the property of JobSahi and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">6. Job Applications and Recruiter Relations</h2>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>JobSahi facilitates connections but does not guarantee employment</li>
                <li>Recruiters are responsible for their own hiring decisions</li>
                <li>We do not endorse or guarantee the accuracy of job postings</li>
                <li>Users are responsible for verifying recruiter credentials</li>
                <li>JobSahi is not liable for employment disputes</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">7. Privacy and Data Protection</h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Please review our Privacy Policy to understand how we collect, use, and protect your personal information. By using our platform, you consent to the collection and use of information as described in our Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">8. Disclaimers and Limitations</h2>
              <h3 className="text-xl font-medium text-[#0B537D] mb-3">8.1 Service Availability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                JobSahi is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service.
              </p>

              <h3 className="text-xl font-medium text-[#0B537D] mb-3">8.2 Limitation of Liability</h3>
              <p className="text-gray-700 leading-relaxed">
                JobSahi shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">9. Termination</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may terminate or suspend your account at any time for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 mb-4">
                <li>Violation of these Terms and Conditions</li>
                <li>Fraudulent or illegal activity</li>
                <li>Misuse of the platform</li>
                <li>Technical or security reasons</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You may terminate your account at any time by contacting our support team.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">10. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the jurisdiction of the courts in India.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms and Conditions at any time. Changes will be posted on this page with an updated revision date. Your continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">12. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@jobsahi.com<br />
                  <strong>Address:</strong> JobSahi Legal Department<br />
                  <strong>Phone:</strong> +91-XXXX-XXXXXX
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-[#0B537D] mb-4">13. Severability</h2>
              <p className="text-gray-700 leading-relaxed">
                If any provision of these Terms and Conditions is found to be invalid or unenforceable, the remaining provisions shall remain in full force and effect.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default TermsConditions;
