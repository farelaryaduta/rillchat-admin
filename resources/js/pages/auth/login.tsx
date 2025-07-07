import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <>
      <div className="grid min-h-svh lg:grid-cols-2">
        {/* Left side - Login Form */}
        <div className="flex flex-col p-6 md:p-10">
          <div className="flex flex-col items-center gap-50">
            {/* Logo and Title */}
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <span className="text-xl">Rillchat Admin Panel</span>
            </a>

            {/* Login Form */}
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </div>
        </div>

        {/* Right side - Background Image */}
        <div className="bg-muted relative hidden lg:block">
          <img
            src="/rillchat_bg.svg"
            alt="RillChat"
            className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
          />
        </div>
      </div>
    </>
  )
}
