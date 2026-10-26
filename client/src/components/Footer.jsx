import React from "react";

import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Twitter,
    Youtube,
} from "lucide-react";

import {
    Link,
} from "react-router-dom";

const Footer = () => {
    const currentYear =
        new Date().getFullYear();

    return (
        <footer className="mt-32 w-full border-t border-white/10 bg-[#08090d] px-6 pt-16 text-gray-300 md:px-16 lg:px-36">

            {/* Main Footer */}

            <div className="flex flex-col gap-12 border-b border-white/10 pb-12 md:flex-row md:justify-between">

                {/* Brand */}

                <div className="md:max-w-[420px]">

                    <Link
                        to="/"
                        className="inline-block"
                    >
                        <span className="text-3xl font-extrabold tracking-tight text-white">
                            GenZ
                            <span className="text-fuchsia-500">
                                Show
                            </span>
                        </span>
                    </Link>

                    <p className="mt-6 text-sm leading-7 text-gray-400">
                        GenZShow is a modern movie discovery
                        and booking platform built for the
                        next generation of movie lovers.
                    </p>

                    <p className="mt-3 text-sm leading-7 text-gray-400">
                        Discover movies based on your vibe,
                        explore personalized recommendations,
                        find theatres and book your next
                        movie experience.
                    </p>

                    {/* Social Media */}

                    <div className="mt-7 flex items-center gap-3">

                        <SocialButton
                            href="#"
                            label="Instagram"
                        >
                            <Instagram className="h-4 w-4" />
                        </SocialButton>

                        <SocialButton
                            href="#"
                            label="YouTube"
                        >
                            <Youtube className="h-4 w-4" />
                        </SocialButton>

                        <SocialButton
                            href="#"
                            label="Twitter"
                        >
                            <Twitter className="h-4 w-4" />
                        </SocialButton>

                        <SocialButton
                            href="#"
                            label="Facebook"
                        >
                            <Facebook className="h-4 w-4" />
                        </SocialButton>

                    </div>

                </div>

                {/* Navigation */}

                <div className="flex flex-col gap-10 sm:flex-row sm:gap-20 md:gap-28">

                    {/* Explore */}

                    <div>

                        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
                            Explore
                        </h2>

                        <ul className="space-y-3 text-sm">

                            <li>
                                <FooterLink to="/">
                                    Home
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/movies">
                                    Movies
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/theatres">
                                    Theatres
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/releases">
                                    Releases
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/genz-ai">
                                    GenZ AI
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/genz-dna">
                                    GenZ DNA
                                </FooterLink>
                            </li>

                        </ul>

                    </div>

                    {/* Account */}

                    <div>

                        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
                            My GenZShow
                        </h2>

                        <ul className="space-y-3 text-sm">

                            <li>
                                <FooterLink to="/my-bookings">
                                    My Bookings
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/favorite">
                                    My Favorites
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/genz-dna">
                                    My Movie DNA
                                </FooterLink>
                            </li>

                            <li>
                                <FooterLink to="/genz-ai">
                                    AI Recommendations
                                </FooterLink>
                            </li>

                        </ul>

                    </div>

                    {/* Company */}

                    <div>

                        <h2 className="mb-5 text-sm font-semibold uppercase tracking-wider text-white">
                            GenZShow
                        </h2>

                        <ul className="space-y-3 text-sm">

                            <li>
                                <a
                                    href="#"
                                    className="transition hover:text-white"
                                >
                                    About GenZShow
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="transition hover:text-white"
                                >
                                    Contact Us
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="transition hover:text-white"
                                >
                                    Privacy Policy
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="transition hover:text-white"
                                >
                                    Terms & Conditions
                                </a>
                            </li>

                        </ul>

                    </div>

                </div>

            </div>

            {/* Contact Section */}

            <div className="grid gap-5 border-b border-white/10 py-8 sm:grid-cols-2 lg:grid-cols-3">

                {/* Email */}

                <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
                        <Mail className="h-4 w-4 text-fuchsia-500" />
                    </div>

                    <div>

                        <p className="text-xs uppercase tracking-wider text-gray-500">
                            Email
                        </p>

                        <a
                            href="mailto:support@genzshow.com"
                            className="mt-1 block text-sm text-gray-300 transition hover:text-white"
                        >
                            support@genzshow.com
                        </a>

                    </div>

                </div>

                {/* Phone */}

                <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
                        <Phone className="h-4 w-4 text-fuchsia-500" />
                    </div>

                    <div>

                        <p className="text-xs uppercase tracking-wider text-gray-500">
                            Customer Support
                        </p>

                        <a
                            href="tel:+911100000000"
                            className="mt-1 block text-sm text-gray-300 transition hover:text-white"
                        >
                            +91 11 0000 0000
                        </a>

                    </div>

                </div>

                {/* Location */}

                <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-500/10">
                        <MapPin className="h-4 w-4 text-fuchsia-500" />
                    </div>

                    <div>

                        <p className="text-xs uppercase tracking-wider text-gray-500">
                            Based in
                        </p>

                        <p className="mt-1 text-sm text-gray-300">
                            New Delhi, India
                        </p>

                    </div>

                </div>

            </div>

            {/* Bottom */}

            <div className="flex flex-col items-center justify-between gap-4 py-5 text-center text-xs text-gray-500 md:flex-row md:text-left">

                <p>
                    © {currentYear} GenZShow.
                    All rights reserved.
                </p>

                <p>
                    Made for the next generation of
                    movie lovers 🎬
                </p>

            </div>

        </footer>
    );
};

/* -------------------------------------------------------
   FOOTER LINK
------------------------------------------------------- */

const FooterLink = ({
    to,
    children,
}) => {
    return (
        <Link
            to={to}
            className="text-gray-400 transition hover:text-white"
        >
            {children}
        </Link>
    );
};

/* -------------------------------------------------------
   SOCIAL BUTTON
------------------------------------------------------- */

const SocialButton = ({
    href,
    label,
    children,
}) => {
    return (
        <a
            href={href}
            aria-label={label}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-gray-400 transition hover:border-fuchsia-500/30 hover:bg-fuchsia-500/10 hover:text-fuchsia-400"
        >
            {children}
        </a>
    );
};

export default Footer;