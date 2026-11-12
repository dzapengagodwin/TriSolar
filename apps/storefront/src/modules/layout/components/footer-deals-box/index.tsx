"use client"

import React, { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function FooterDealsBox() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  )
  const [message, setMessage] = useState("")

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) {
      setStatus("error")
      setMessage("Please enter a valid email address.")
      return
    }

    setStatus("loading")
    setMessage("")

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setStatus("error")
        setMessage(data.error || "Failed to subscribe. Please try again.")
        return
      }

      setStatus("success")
      setMessage(data.message || "Thank you for subscribing to TRITECH updates!")
      setEmail("")
    } catch {
      setStatus("error")
      setMessage("Network error. Please try again later.")
    }
  }

  return (
    <div className="w-full space-y-4 text-xs font-normal">
      {/* 1. Sign in or Create Account Link */}
      <div>
        <LocalizedClientLink
          href="/account"
          className="inline-flex items-center gap-1.5 text-white hover:text-primary font-semibold text-xs sm:text-sm transition-colors group"
        >
          <span>Sign in or Create Account</span>
          <svg
            className="w-3.5 h-3.5 text-primary group-hover:translate-x-0.5 transition-transform"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </LocalizedClientLink>
      </div>

      {/* Divider */}
      <div className="border-t border-[#333333]" />

      {/* 2. Newsletter Signup */}
      <div className="space-y-2.5">
        <h4 className="text-white font-bold text-sm sm:text-base tracking-tight leading-snug">
          Get the latest deals and more.
        </h4>

        <form onSubmit={handleSubscribe} className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (status !== "idle") setStatus("idle")
              }}
              placeholder="Enter email address"
              className="w-full bg-white text-gray-900 border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg px-3.5 py-2.5 text-xs placeholder:text-gray-500 outline-none transition-all shadow-2xs"
              required
              disabled={status === "loading"}
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-primary hover:bg-primary-hover text-white font-bold px-4 sm:px-5 py-2.5 rounded-lg text-xs shrink-0 transition-colors shadow-xs active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {status === "loading" ? "..." : "Sign Up"}
            </button>
          </div>

          {/* Status Feedback */}
          {status === "success" && (
            <p className="text-emerald-400 text-[11px] font-medium animate-fadeIn">
              {message}
            </p>
          )}
          {status === "error" && (
            <p className="text-rose-400 text-[11px] font-medium animate-fadeIn">
              {message}
            </p>
          )}
        </form>
      </div>

  
      {/* Divider */}
      <div className="border-t border-[#333333]" />

      {/* 4. Social Icons Row (YouTube, Instagram, TikTok, Facebook, Pinterest, X) */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-gray-400 max-w-xs">
          {/* YouTube */}
          <a
            href="https://youtube.com"
            target="_blank"
            rel="noreferrer"
            aria-label="YouTube"
            className="hover:text-primary hover:scale-110 transition-all p-1"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/laptopzonezw"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="hover:text-primary hover:scale-110 transition-all p-1"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </a>

          {/* TikTok */}
          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className="hover:text-primary hover:scale-110 transition-all p-1"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.97v7.22c.04 1.95-.57 3.94-1.83 5.43-1.47 1.78-3.79 2.75-6.09 2.53-2.52-.22-4.78-1.78-5.83-4.08-1.07-2.31-.76-5.18.79-7.22 1.48-1.95 3.93-2.98 6.37-2.65v4.19c-1.28-.27-2.67.14-3.48 1.15-.81.99-.9 2.45-.23 3.53.66 1.09 2.01 1.65 3.24 1.37 1.14-.24 2-.19 2.38-2.34V.02z" />
            </svg>
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/laptopzonezw"
            target="_blank"
            rel="noreferrer"
            aria-label="Facebook"
            className="hover:text-primary hover:scale-110 transition-all p-1"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>

          {/* Pinterest */}
          <a
            href="https://pinterest.com"
            target="_blank"
            rel="noreferrer"
            aria-label="Pinterest"
            className="hover:text-primary hover:scale-110 transition-all p-1"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.291 1.199-.332 1.357-.053.211-.174.256-.402.155-1.499-.696-2.435-2.883-2.435-4.643 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
            </svg>
          </a>

          {/* X (formerly Twitter) */}
          <a
            href="https://x.com"
            target="_blank"
            rel="noreferrer"
            aria-label="X (formerly Twitter)"
            className="hover:text-primary hover:scale-110 transition-all p-1"
          >
            <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#333333]" />
    </div>
  )
}

