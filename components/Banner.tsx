"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"

export function BannerPopup({ image }: { image: string }) {
  const [isOpen, setIsOpen] = useState(true)
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        onClick={() => router.push("/olympia-x")}
        className="relative rounded-2xl overflow-hidden shadow-xl w-full max-w-5xl cursor-pointer flex items-center justify-center bg-black"
        style={{ maxHeight: "90vh" }}
      >
        {/* Close button */}
        <button
          onClick={(e) => {
            e.stopPropagation() // prevent redirect when closing
            setIsOpen(false)
          }}
          className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white rounded-full p-2"
        >
          <X className="h-5 w-5 text-black" />
        </button>

        {/* Full image without cropping */}
        <img
          src={image}
          alt="Popup Banner"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  )
}
