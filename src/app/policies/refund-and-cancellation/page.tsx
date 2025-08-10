import React from "react";

const RefundPolicyPage = () => {
    return (
        <div className="bg-white">
            <div className="max-w-4xl mx-auto p-4 md:p-8 text-gray-800">
                <style>{`
                    .policy-container h1 { font-size: 26px; font-weight: bold; color: #000000; margin-bottom: 0.5rem; }
                    .policy-container h2 { font-size: 19px; font-weight: bold; color: #000000; margin-top: 2rem; margin-bottom: 1rem; }
                    .policy-container p, .policy-container li { color: #595959; font-size: 14px; line-height: 1.5; margin-bottom: 1rem;}
                    .policy-container ul { list-style-type: disc; padding-left: 20px; margin-top: 1rem; margin-bottom: 1rem; }
                    .policy-container strong { font-weight: bold; color: #000000; }
                    .policy-container a { color: #3030F1; text-decoration: underline; }
                    .policy-subtitle { font-size: 15px; color: #7F7F7F; font-weight: bold; margin-bottom: 2rem; }
                `}</style>

                <div className="policy-container">
                    <h1>Refund &amp; Cancellation Policy</h1>
                    <p className="policy-subtitle">
                        Last updated: August 10, 2025
                    </p>
                    <p>
                        We are committed to providing a high-quality learning
                        experience. We understand that our courses may not be
                        the right fit for everyone, and we offer a
                        straightforward refund policy.
                    </p>
                    <h2>Refunds</h2>
                    <p>
                        Our policy lasts 7 days. If 7 days have gone by since
                        your purchase, unfortunately, we can&apos;t offer you a
                        refund. To be eligible for a refund, you must submit
                        your request within 7 calendar days of your enrollment
                        date.
                    </p>
                    <p>
                        To complete your refund request, we require a receipt or
                        proof of purchase.
                    </p>
                    <h2>How Refunds Are Processed</h2>
                    <p>
                        Once your refund request is received, we will send you
                        an email to notify you. We will also notify you of the
                        approval or rejection of your refund. If you are
                        approved, your refund will be processed, and a credit
                        will automatically be applied to your original method of
                        payment within 7-10 business days.
                    </p>
                    <h2>Late or Missing Refunds</h2>
                    <p>
                        If you haven&apos;t received a refund yet, first check
                        your bank account again. Then contact your credit card
                        company or bank, as it may take some time before your
                        refund is officially posted. There is often some
                        processing time before a refund is posted.
                    </p>
                    <p>
                        If you&apos;ve done all of this and you still have not
                        received your refund yet, please contact us at{" "}
                        <strong>crackthecode.tech@gmail.com</strong>.
                    </p>
                    <h2>Non-Refundable Items</h2>
                    <p>
                        As our products are digital, they are all considered
                        &quot;downloadable software products&quot; and are
                        generally non-refundable after the 7-day period has
                        passed. We do not offer partial refunds for any courses.
                    </p>
                    <h2>Cancellation</h2>
                    <p>
                        Enrolling in a course grants you immediate access to its
                        digital content. When you request a refund, you are also
                        requesting to cancel your enrollment. Once a refund is
                        processed, your access to the course and its materials
                        will be revoked.
                    </p>
                    <h2>Contact Us</h2>
                    <p>
                        If you have any questions about our Refund &amp;
                        Cancellation Policy, please contact us via email at{" "}
                        <strong>crackthecode.tech@gmail.com</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
