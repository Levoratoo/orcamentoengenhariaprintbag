"use client"

import { installShowcaseMockFetch } from "@/lib/showcase-api"

export function ShowcaseApiBridge() {
  installShowcaseMockFetch()
  return null
}
