import cors from "cors"
import { defineMiddlewares, MedusaRequest, MedusaResponse, MedusaNextFunction } from "@medusajs/framework/http"
import { ConfigModule } from "@medusajs/framework/types"
import { parseCorsOrigins } from "@medusajs/framework/utils"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/mercadopago/payment*",
      middlewares: [
        (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
          const configModule: ConfigModule = req.scope.resolve("configModule")
          return cors({
            origin: parseCorsOrigins(configModule.projectConfig.http.storeCors),
            credentials: false,
          })(req, res, next)
        },
      ],
    },
  ],
})