import EmailOtpForm from "@/components/account/otp"
import { Suspense } from "react"

export default function SignUpPage() {
  return (
   <Suspense>
     <main>
      <EmailOtpForm/>
    </main>
   </Suspense>
  )
}

