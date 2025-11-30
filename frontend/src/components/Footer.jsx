 import React from "react";
import { Link } from "react-router-dom";
import logoImg from "../assets/logo.svg";

const Footer = ({
  projectName = "E-Inject",
 
  facebookUrl,
  instagramUrl,
  linkedinUrl,
  twitterUrl,   // X/Twitter
  githubUrl,
}) => {
  
  const socials = [
    {
      name: "Facebook",
      url: facebookUrl,
      path:
        "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z",
    },
    {
      name: "Instagram",
      url: instagramUrl,
      path:
        "M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5",
    },
    {
      name: "LinkedIn",
      url: linkedinUrl,
      path:
        "M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6M6 9H2v12h4zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
    },
    {
      name: "Twitter",
      url: twitterUrl,
      path:
        "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2",
    },
    {
      name: "GitHub",
      url: githubUrl,
      path:
        "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.4 5.4 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65S8.93 17.38 9 18v4",
    },
  ];

  return (
    <footer className="w-full bg-[#EAF5EE] border-t border-green-200 py-1.5 md:py-2">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center space-y-2">
        {/* top divider */}
        <div className="h-px w-16 bg-green-300/60" />

        {/* Logo */}
        <div className="mt-1">
          <Link
            to="/"
            className="flex items-center justify-center hover:opacity-90 transition-opacity"
            aria-label={`${projectName} Home`}
          >
            <img
              src={logoImg}
              alt={`${projectName} logo`}
              className="h-10 w-10 md:h-20 md:w-20 object-contain"
              loading="lazy"
            />
          </Link>
        </div>

        {/* bottom divider */}
        <div className="h-px w-16 bg-green-300/60" />

        {/* Copyright */}
        <p className="text-[11px] md:text-sm text-gray-600">
          © {new Date().getFullYear()} {projectName}. All rights reserved.
        </p>

        {/* Socials (render only if url provided) */}
        <div className="flex items-center gap-2">
          {socials
            .filter(s => !!s.url)
            .map((s, i) => (
              <a
                key={i}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex p-1 rounded-full bg-green-50 hover:bg-green-100 transition-all"
                aria-label={s.name}
                title={s.name}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d={s.path}
                    stroke="#16A34A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
