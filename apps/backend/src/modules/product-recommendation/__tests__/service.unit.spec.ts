import ProductRecommendationModuleService from "../service"
import { MedusaError } from "@medusajs/framework/utils"

describe("ProductRecommendationModuleService Unit Tests", () => {
  let service: ProductRecommendationModuleService

  beforeEach(() => {
    service = new ProductRecommendationModuleService({} as any)
  })

  describe("validateNoSelfRecommendation", () => {
    it("should throw MedusaError when product_id equals recommended_product_id", async () => {
      await expect(
        service.validateNoSelfRecommendation("prod_123", "prod_123")
      ).rejects.toThrow(MedusaError)

      await expect(
        service.validateNoSelfRecommendation("prod_123", "prod_123")
      ).rejects.toThrow("A product cannot be recommended to itself.")
    })

    it("should pass when product_id differs from recommended_product_id", async () => {
      await expect(
        service.validateNoSelfRecommendation("prod_123", "prod_456")
      ).resolves.toBeUndefined()
    })
  })

  describe("reorderRecommendations", () => {
    it("should return empty array if orderedIds is empty", async () => {
      const result = await service.reorderRecommendations(
        "prod_1",
        "related",
        []
      )
      expect(result).toEqual([])
    })

    it("should update positions based on the order of provided IDs", async () => {
      const mockRecs = [
        { id: "rec_1", product_id: "prod_1", type: "related", position: 0 },
        { id: "rec_2", product_id: "prod_1", type: "related", position: 1 },
        { id: "rec_3", product_id: "prod_1", type: "related", position: 2 },
      ]

      ;(service as any).listProductRecommendations = jest
        .fn()
        .mockResolvedValueOnce(mockRecs)
        .mockResolvedValueOnce([
          { id: "rec_3", position: 0 },
          { id: "rec_1", position: 1 },
          { id: "rec_2", position: 2 },
        ])

      const updateSpy = jest.fn().mockResolvedValue([])
      ;(service as any).updateProductRecommendations = updateSpy

      const newOrder = ["rec_3", "rec_1", "rec_2"]
      const result = await service.reorderRecommendations(
        "prod_1",
        "related",
        newOrder
      )

      expect(updateSpy).toHaveBeenCalledWith([
        { id: "rec_3", position: 0 },
        { id: "rec_1", position: 1 },
        { id: "rec_2", position: 2 },
      ])
      expect(result.length).toBe(3)
    })
  })

  describe("listActiveRecommendations (Date Scheduling & Active Filtering)", () => {
    it("should filter out expired and future-scheduled recommendations", async () => {
      const now = new Date()
      const pastDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const futureDate = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      const distantFuture = new Date(now.getTime() + 48 * 60 * 60 * 1000)

      const mockRecs = [
        // 1. Valid always active
        {
          id: "rec_valid_1",
          product_id: "prod_1",
          recommended_product_id: "prod_2",
          is_active: true,
          start_at: null,
          end_at: null,
        },
        // 2. Valid scheduled active (past start, future end)
        {
          id: "rec_valid_2",
          product_id: "prod_1",
          recommended_product_id: "prod_3",
          is_active: true,
          start_at: pastDate,
          end_at: futureDate,
        },
        // 3. Expired (past start, past end)
        {
          id: "rec_expired",
          product_id: "prod_1",
          recommended_product_id: "prod_4",
          is_active: true,
          start_at: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          end_at: pastDate,
        },
        // 4. Future scheduled (future start, distant future end)
        {
          id: "rec_future",
          product_id: "prod_1",
          recommended_product_id: "prod_5",
          is_active: true,
          start_at: futureDate,
          end_at: distantFuture,
        },
      ]

      ;(service as any).listProductRecommendations = jest
        .fn()
        .mockResolvedValue(mockRecs)

      const active = await service.listActiveRecommendations("prod_1", "related")

      expect(active.length).toBe(2)
      expect(active.map((r) => r.id)).toEqual(["rec_valid_1", "rec_valid_2"])
    })
  })

  describe("batchAssignRecommendations", () => {
    it("should reject self-recommendation inside batch", async () => {
      await expect(
        service.batchAssignRecommendations("prod_100", [
          { recommended_product_id: "prod_100", type: "upsell" },
        ])
      ).rejects.toThrow("A product cannot be recommended to itself.")
    })

    it("should create new recommendations when not existing", async () => {
      ;(service as any).listProductRecommendations = jest.fn().mockResolvedValue([])
      const createSpy = jest
        .fn()
        .mockImplementation((payload) => Promise.resolve({ id: "rec_new", ...payload }))
      ;(service as any).createProductRecommendations = createSpy

      const results = await service.batchAssignRecommendations("prod_1", [
        { recommended_product_id: "prod_2", type: "cross_sell", priority: 10 },
      ])

      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: "prod_1",
          recommended_product_id: "prod_2",
          type: "cross_sell",
          priority: 10,
        })
      )
      expect(results.length).toBe(1)
    })
  })
})
