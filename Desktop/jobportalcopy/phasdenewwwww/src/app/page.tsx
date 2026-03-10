"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [role, setRole] = useState<"candidate" | "recruiter">("candidate");

  const stats =
    role === "candidate"
      ? [
        { label: "Satisfied users globally", value: "75K+" },
        { label: "Beneficial User Cashback", value: "92%" },
      ]
      : [
        { label: "Trusted recruiters", value: "18K+" },
        { label: "Avg. qualified matches", value: "94%" },
      ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <div className="flex items-center gap-2">
            <Image
              src="/SAASA%20Logo.png"
              alt="SAASA B2E logo"
              width={110}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-600">
            <a className="hover:text-slate-900" href="#jobseeker">
              For Jobseeker
            </a>
            <a className="hover:text-slate-900" href="#recruiter">
              For Recruiter
            </a>
            <a className="hover:text-slate-900" href="#pricing">
              Pricing
            </a>
            <a
              className="rounded-full bg-sky-500 px-4 py-2 text-white shadow-sm transition hover:bg-sky-600"
              href="#cta"
            >
              Get Started
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section
          className="relative overflow-hidden bg-white"
          style={{
            background:
              "radial-gradient(ellipse 800px 600px at bottom left, #bae6fd 0%, #dbeafe 30%, transparent 70%), radial-gradient(ellipse 800px 600px at top right, #fed7aa 0%, #fde2e4 30%, transparent 70%), white",
          }}
        >
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 md:grid-cols-2 md:gap-12">
            {/* Left Side - Text Content */}
            <div className="flex flex-col justify-center gap-6 text-left">
              <div className="flex flex-col gap-2 text-4xl font-bold leading-tight text-slate-900 md:text-5xl">
                <span>Are you here find a job or hire talent ?</span>
              </div>
              <p className="text-base text-slate-600">
                SAASA B2E connects jobseekers with their dream roles and empowers
                employers to find the perfect talent effortlessly, leveraging
                advanced AI-driven tools.
              </p>
              <div className="space-y-3 text-sm font-semibold text-slate-700">
                <p>I am a...</p>
                <div className="flex gap-3">
                  <button
                    className={`flex-1 rounded-md border px-4 py-3 text-sm font-semibold shadow-sm transition ${role === "candidate"
                      ? "border-sky-500 bg-sky-500 text-white hover:bg-sky-600"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    aria-pressed={role === "candidate"}
                    onClick={() => setRole("candidate")}
                  >
                    Candidate
                  </button>
                  <button
                    className={`flex-1 rounded-md border px-4 py-3 text-sm font-semibold shadow-sm transition ${role === "recruiter"
                      ? "border-sky-500 bg-sky-500 text-white hover:bg-sky-600"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    aria-pressed={role === "recruiter"}
                    onClick={() => setRole("recruiter")}
                  >
                    Recruiter
                  </button>
                </div>
                <Link
                  href="/whatsapp"
                  className="inline-flex w-full items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:brightness-110"
                  style={{ color: "#ffffff" }}
                >
                  {role === "candidate" ? "Continue as Candidate" : "Continue as Recruiter"}
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-slate-50 px-6 py-5 text-center shadow-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {item.label}
                    </p>
                    <p className="mt-2 text-4xl font-bold text-purple-900">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative flex items-center justify-center">
              <Image
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80"
                alt="Person in vehicle"
                width={600}
                height={600}
                className="h-full w-full rounded-2xl object-cover shadow-xl"
                priority
              />
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              backgroundImage: "url('/section_o_bl_bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center 85%",
              backgroundRepeat: "no-repeat",
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-5 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">
                Why people love SAASA B2E
              </h2>
              <p className="text-sm text-slate-600">
                Built for both jobseekers and hiring teams, our platform
                revolutionizes the recruitment process with intelligent tools and a
                seamless experience.
              </p>
            </div>
            <div className="grid w-full gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Faster, Smarter Matches",
                  description:
                    "Our AI algorithms connect jobseekers with ideal roles and employers with top talent in record time.",
                },
                {
                  title: "CV & JD Superpowers",
                  description:
                    "Intelligent analysis and generation tools transform resumes and job descriptions for optimal impact.",
                },
                {
                  title: "Transparent Workflows",
                  description:
                    "Real-time tracking and clear communication channels ensure everyone stays informed and aligned.",
                },
                {
                  title: "Skill Growth & Insights",
                  description:
                    "Personalized recommendations and analytics help jobseekers upskill and employers identify skill gaps.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
                >
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sky-500">
                    ⦿
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-14">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 md:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-slate-900">
                Unleash the Power of AI in Hiring
              </h2>
              <p className="text-base text-slate-600">
                Our cutting-edge AI transforms every stage of your recruitment
                journey, from intelligent matching to automated feedback, ensuring
                optimal results and efficiency.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-700">
              {[
                "AI CV Analyzer: Optimize resumes for success",
                "AI Job Matching: Precision talent-to-role connections",
                "AI JD Generator: Craft compelling job descriptions",
                "AI Feedback Loop: Continuous improvement for applications",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3"
                >
                  <span className="mt-1 h-5 w-5 rounded-full bg-sky-500 text-center text-xs font-bold text-white">
                    ✓
                  </span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-5">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-slate-900">AI CV Maker</h2>
              <p className="mt-2 text-lg text-slate-600">
                Create professional resumes with AI-powered tools
              </p>
            </div>
            <div className="flex gap-8">
              {/* Left Side - Cards (60% width) */}
              <div className="relative flex h-[450px] w-[60%] items-center justify-center md:h-[550px]">
                {/* Left Card - Smaller, Partially Visible */}
                <div className="absolute left-0 z-10 w-56 rounded-2xl shadow-xl">
                  <div className="relative overflow-hidden rounded-2xl bg-white">
                    <Image
                      src="/cv_2.jpg"
                      alt="CV Example 1"
                      width={224}
                      height={300}
                      className="h-[300px] w-full object-cover"
                    />
                  </div>
                </div>

                {/* Central Card - Larger, Most Prominent */}
                <div className="relative z-20 mx-auto w-full max-w-md rounded-3xl shadow-2xl">
                  <div className="relative overflow-hidden rounded-3xl bg-white">
                    <Image
                      src="/cv_main.jpg"
                      alt="AI CV Maker - Main"
                      width={448}
                      height={500}
                      className="h-[400px] w-full object-cover md:h-[500px]"
                      style={{ objectPosition: "center 20%" }}
                    />
                    {/* Promotional Badge */}
                    <div className="absolute bottom-6 right-6 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-red-500 shadow-xl">
                      <p className="text-xs font-bold leading-tight text-white">
                        New
                      </p>
                      <p className="text-xs font-bold leading-tight text-white">
                        Feature
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Card - Smaller, Partially Visible */}
                <div className="absolute right-0 z-10 w-56 rounded-2xl shadow-xl">
                  <div className="relative overflow-hidden rounded-2xl bg-white">
                    <Image
                      src="/cv_1.jpg"
                      alt="CV Example 2"
                      width={224}
                      height={300}
                      className="h-[300px] w-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Right Side - Features List (40% width) */}
              <div className="flex w-[40%] flex-col justify-center gap-3">
                {[
                  {
                    title: "AI CV Analyzer",
                    description:
                      "Instantly scan your CV for keywords, formatting, and relevance against industry standards.",
                  },
                  {
                    title: "AI Job Match Score",
                    description:
                      "Understand how well your skills align with specific job postings before you apply, saving time.",
                  },
                  {
                    title: "AI Missing Keyword Suggestions",
                    description:
                      "Identify crucial keywords missing from your CV that could improve your chances with ATS.",
                  },
                  {
                    title: "AI Rejection Feedback & Course Recommendations",
                    description:
                      "Receive constructive feedback on past rejections and get personalized course suggestions to fill skill gaps.",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-3"
                  >
                    <span className="mt-1 h-5 w-5 shrink-0 rounded-full bg-sky-500 text-center text-xs font-bold text-white">
                      ✓
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-700">
                        {feature.title}: {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white py-20">
          <div
            className="pointer-events-none absolute inset-0 opacity-100"
            style={{
              backgroundImage: "url('/section_o_bl_bg.png')",
              backgroundSize: "cover",
              backgroundPosition: "center 85%",
              backgroundRepeat: "no-repeat",
            }}
            aria-hidden="true"
          />
          <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-5 text-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-slate-900">
                How SAASA B2E Works
              </h2>
            </div>
            <div className="flex justify-center gap-3">
              <button className="rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-sm">
                For Jobseekers
              </button>
              <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-600 shadow-sm">
                For Employers
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  step: "1",
                  title: "Create Your Profile",
                  description:
                    "Build a comprehensive profile highlighting your skills and experience.",
                },
                {
                  step: "2",
                  title: "Upload Your CV",
                  description:
                    "Let our AI analyze and optimize your resume for best results.",
                },
                {
                  step: "3",
                  title: "Explore Matched Jobs",
                  description:
                    "Receive personalized job recommendations tailored to your profile.",
                },
                {
                  step: "4",
                  title: "Apply & Track",
                  description:
                    "Effortlessly apply to jobs and monitor your application status.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm"
                >
                  <div className="mb-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 bg-white py-10">
          <div className="mx-auto grid max-w-6xl gap-6 px-5 md:grid-cols-5">
            <div className="space-y-3">
              <p className="text-xs text-slate-500">© 2024 SAASA B2E. All rights reserved.</p>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">Product</p>
              <a className="text-slate-600 hover:text-slate-900" href="#features">
                Features
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#pricing">
                Pricing
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#how">
                How it Works
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#integrations">
                Integrations
              </a>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">Resources</p>
              <a className="text-slate-600 hover:text-slate-900" href="#blog">
                Blog
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#cases">
                Case Studies
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#support">
                Support
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#faqs">
                FAQs
              </a>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">Company</p>
              <a className="text-slate-600 hover:text-slate-900" href="#about">
                About Us
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#careers">
                Careers
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#contact">
                Contact
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#press">
                Press
              </a>
            </div>
            <div className="space-y-2 text-sm">
              <p className="font-semibold text-slate-900">Legal & Social</p>
              <a className="text-slate-600 hover:text-slate-900" href="#privacy">
                Privacy Policy
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#terms">
                Terms of Service
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#cookies">
                Cookie Policy
              </a>
              <a className="text-slate-600 hover:text-slate-900" href="#linkedin">
                LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2 px-5 text-xs text-slate-500">
            <span>🌐</span>
            <span>English</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
