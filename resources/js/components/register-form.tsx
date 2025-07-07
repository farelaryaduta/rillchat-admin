import { useForm } from "@inertiajs/react"
import { LoaderCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import InputError from "./input-error"
import TextLink from "./text-link"

type RegisterFormData = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export function RegisterForm() {
  const { data, setData, post, processing, errors, reset } = useForm<RegisterFormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post("/register", {
      onSuccess: () => {
        reset("password", "password_confirmation")
      },
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Make your account!</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your details below to create an account
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          value={data.name}
          onChange={(e) => setData("name", e.target.value)}
          required
          autoComplete="name"
          disabled={processing}
        />
        <InputError message={errors.name} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={data.email}
          onChange={(e) => setData("email", e.target.value)}
          required
          autoComplete="email"
          disabled={processing}
        />
        <InputError message={errors.email} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={data.password}
          onChange={(e) => setData("password", e.target.value)}
          required
          autoComplete="new-password"
          disabled={processing}
        />
        <InputError message={errors.password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password_confirmation">Confirm Password</Label>
        <Input
          id="password_confirmation"
          type="password"
          value={data.password_confirmation}
          onChange={(e) => setData("password_confirmation", e.target.value)}
          required
          autoComplete="new-password"
          disabled={processing}
        />
        <InputError message={errors.password_confirmation} />
      </div>

      <Button type="submit" className="w-full" disabled={processing}>
        {processing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
        Register
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <TextLink href={route('login')}>Sign in</TextLink>
      </p>
    </form>
  )
} 