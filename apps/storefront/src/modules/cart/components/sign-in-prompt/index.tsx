import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-5 flex items-center justify-between gap-4">
      <div>
        <h3 className="text-sm font-bold text-black">
          Already have an account?
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Sign in for a faster checkout and order tracking.
        </p>
      </div>
      <div>
        <LocalizedClientLink href="/account">
          <button
            className="bg-black hover:bg-gray-800 text-white px-5 py-2 rounded-full font-bold text-xs transition-colors shadow-sm whitespace-nowrap"
            data-testid="sign-in-button"
          >
            Sign in
          </button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt
