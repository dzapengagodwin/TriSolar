"use client"

import React, { useState } from "react"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (errorMessage) setErrorMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName.trim()) {
      setErrorMessage("Please enter your first name.")
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.")
      return
    }
    if (!formData.message.trim()) {
      setErrorMessage("Please enter your comment or message.")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      // Simulate form submission delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      setIsSubmitted(true)
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
      })
    } catch {
      setErrorMessage("Failed to send message. Please try again or email us directly.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {isSubmitted && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-xs sm:text-sm flex items-start justify-between gap-3 animate-fadeIn">
          <div>
            <span className="font-bold block mb-0.5">Thank you for reaching out!</span>
            <span>Your message has been sent successfully. Our support team will get back to you shortly.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-xs sm:text-sm">
          {errorMessage}
        </div>
      )}

      {/* Name Field */}
      <div>
        <label className="block text-xs font-bold text-gray-800 mb-2">
          Name <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            required
          />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* Email Field */}
      <div>
        <label className="block text-xs font-bold text-gray-800 mb-2">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email address"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          required
        />
      </div>

      {/* Comment or Message Field */}
      <div>
        <label className="block text-xs font-bold text-gray-800 mb-2">
          Comment or Message <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={6}
          name="message"
          value={formData.message}
          onChange={handleChange}
          className="w-full rounded-xl border border-gray-300 bg-white p-4 text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-y min-h-[160px]"
          required
        />
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs sm:text-sm px-8 py-3.5 transition-all shadow-xs active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  )
}
