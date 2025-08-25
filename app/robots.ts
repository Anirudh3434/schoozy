import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/login-account",
          "/create-account",
          "/forgot-password",
          "/otp-verify",
          "/ims",
        ],
      },
    ],
    sitemap: "https://schoozy.in/sitemap.xml",
  }
}
