import { describe, expect, it } from "vitest"
import { normalizeRegistrationBody, RegistrationValidationError } from "../register"

describe("normalizeRegistrationBody", () => {
  it("keeps wallet_address payloads untouched", () => {
    const result = normalizeRegistrationBody({
      email: "user@example.com",
      password: "secret",
      wallet_address: "ADDR123",
      username: "custom",
    })

    expect(result).toEqual({
      email: "user@example.com",
      password: "secret",
      wallet_address: "ADDR123",
      username: "custom",
    })
  })

  it("accepts camelCase walletAddress and derives username", () => {
    const result = normalizeRegistrationBody({
      email: "alice@example.com",
      password: "secret",
      walletAddress: "  WALLET-001 ",
    })

    expect(result.wallet_address).toBe("WALLET-001")
    expect(result.username).toBe("alice")
  })

  it("throws when required fields are missing", () => {
    expect(() =>
      normalizeRegistrationBody({
        email: "no-wallet@example.com",
      }),
    ).toThrow(RegistrationValidationError)
  })

  it("throws when body is not an object", () => {
    expect(() => normalizeRegistrationBody(null)).toThrow(RegistrationValidationError)
    expect(() => normalizeRegistrationBody("invalid")).toThrow(RegistrationValidationError)
  })
})
