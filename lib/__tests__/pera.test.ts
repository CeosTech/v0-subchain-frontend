import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const createMockInstance = (overrides?: Partial<Record<string, unknown>>) => {
  return {
    session: { accounts: [] as string[] },
    connect: vi.fn().mockResolvedValue(["ADDR_TEST"]),
    disconnect: vi.fn().mockResolvedValue(undefined),
    reconnectSession: vi.fn().mockResolvedValue(["ADDR_TEST"]),
    connector: { on: vi.fn() },
    ...overrides,
  }
}

describe("lib/pera", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.resetModules()
  })

  it("reuses existing session accounts without opening a new modal", async () => {
    const mockInstance = createMockInstance({
      session: { accounts: ["ALGOS-123"] },
    })

    vi.doMock("@perawallet/connect", () => ({
      PeraWalletConnect: vi.fn(() => mockInstance),
    }))

    const { connectWallet } = await import("../pera")

    const address = await connectWallet()

    expect(address).toBe("ALGOS-123")
    expect(mockInstance.connect).not.toHaveBeenCalled()
  })

  it("disconnects and retries when session already exists elsewhere", async () => {
    const mockInstance = createMockInstance()
    const error = { data: { type: "SESSION_ALREADY_CONNECTED" } }
    ;(mockInstance.connect as ReturnType<typeof vi.fn>)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(["ALGOS-999"])

    vi.doMock("@perawallet/connect", () => ({
      PeraWalletConnect: vi.fn(() => mockInstance),
    }))

    const { connectWallet } = await import("../pera")

    const address = await connectWallet()

    expect(mockInstance.connect).toHaveBeenCalledTimes(2)
    expect(mockInstance.disconnect).toHaveBeenCalledTimes(1)
    expect(address).toBe("ALGOS-999")
  })

  it("disconnects the shared instance and clears storage", async () => {
    const mockInstance = createMockInstance({
      session: { accounts: ["ALGOS-123"] },
    })

    vi.doMock("@perawallet/connect", () => ({
      PeraWalletConnect: vi.fn(() => mockInstance),
    }))

    const { connectWallet, disconnectWallet } = await import("../pera")

    await connectWallet()
    expect(localStorage.getItem("pera_wallet_accounts")).not.toBeNull()

    await disconnectWallet()

    expect(mockInstance.disconnect).toHaveBeenCalled()
    expect(localStorage.getItem("pera_wallet_accounts")).toBeNull()
  })
})
