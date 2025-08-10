import React from "react";
import Link from "next/link";

const TermsOfUsePage = () => {
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
                    <h1>TERMS AND CONDITIONS</h1>
                    <p className="policy-subtitle">
                        Last updated: August 10, 2025
                    </p>
                    <p>
                        This document is a computer-generated electronic record
                        published in terms of Rule 3 of the Information
                        Technology (Intermediary Guidelines and Digital Media
                        Ethics Code) Rules, 2021, and does not require any
                        physical or digital signatures.
                    </p>
                    <p>
                        These terms, including our{" "}
                        <Link href="/policies/privacy-policy">
                            Privacy Policy
                        </Link>{" "}
                        ("Terms"), apply to your use of the website, courses,
                        and services (collectively, the "Services") owned and
                        operated by Crack the Code ("we," "us," or "our"). "You"
                        or "Your" refers to any individual or corporate body
                        using our Services.
                    </p>
                    <p>
                        By using the Services, you signify your acceptance of
                        these Terms. If you do not agree to these Terms, please
                        do not use our Services. Your continued use of the
                        Services following the posting of changes to these terms
                        will be deemed your acceptance of those changes.
                    </p>
                    <h2>1. TERMS OF SERVICE</h2>
                    <p>
                        To access our courses, you must register for an account.
                        You agree to provide information that is true, accurate,
                        and complete. You are responsible for maintaining the
                        confidentiality of your account login information and
                        are fully responsible for all activities that occur
                        under your account.
                    </p>
                    <p>
                        Course fees are displayed on our website and are
                        processed through our third-party payment gateway,
                        Razorpay. Upon successful payment, you will be granted
                        access to the corresponding course materials for a set
                        amount of time.
                    </p>
                    <p>
                        You shall comply with all applicable laws, including the
                        Information Technology Act, 2000, and its subsequent
                        amendments.
                    </p>
                    <h2>2. LIMITATION OF LIABILITY</h2>
                    <p>
                        Crack the Code (including its officers, directors, and
                        employees) will not be responsible or liable for any
                        direct, special, indirect, incidental, or consequential
                        damages of any kind that arise out of or are in any way
                        connected with the use of, or inability to use, our
                        Services.
                    </p>
                    <p>
                        Notwithstanding anything under these Terms, our
                        aggregate liability relating to the Services will not
                        exceed the total amount paid by you for the specific
                        course giving rise to the liability.
                    </p>
                    <h2>3. DISCLAIMER OF WARRANTY</h2>
                    <p>
                        You acknowledge and agree that the Services are provided
                        on an "as is" and "as available" basis. We do not
                        warrant that the Services will be uninterrupted,
                        error-free, or fit for your specific purposes. While we
                        strive for excellence, we make no guarantees regarding
                        the outcomes of completing our courses.
                    </p>
                    <h2>4. GOVERNING LAW AND DISPUTE RESOLUTION</h2>
                    <p>
                        These Terms and your use of the Services are governed by
                        and construed in accordance with the laws of India. Any
                        disputes will be subject to the exclusive jurisdiction
                        of the courts located in Hyderabad, Telangana.
                    </p>
                    <h2>5. GENERAL</h2>
                    <p>
                        Any failure or delay by us to enforce or exercise any
                        provision of these Terms shall not constitute a waiver
                        of that provision or right. If any provision of these
                        Terms is found to be unenforceable or invalid, that
                        provision will be limited or eliminated to the minimum
                        extent necessary so that the Terms will otherwise remain
                        in full force and effect and enforceable.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfUsePage;
