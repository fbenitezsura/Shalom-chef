import { Text } from "@medusajs/ui"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { getProductsById } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const [pricedProduct] = await getProductsById({
    ids: [product.id!],
    regionId: region.id,
  })
  if (!pricedProduct) return null

  const { cheapestPrice } = getProductPrice({ product: pricedProduct })

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group block"
    >
      <div
        data-testid="product-wrapper"
        className="
          flex flex-col md:flex-row gap-6
          border-[3px] border-gray-200 rounded-xl
          bg-white overflow-hidden
          hover:shadow-lg hover:-translate-y-1 transition
        "
      >
        {/* Left: contenido */}
        <div className="flex-1 flex flex-col px-6">
          <Text
            className="text-2xl mt-4 font-semibold text-gray-900 mb-2"
            data-testid="product-title"
          >
            {product.title}
          </Text>

          <p className="text-gray-600 text-sm line-clamp-5">
            {product.description}
          </p>

          {cheapestPrice && (
            <div className="mt-4">
              <PreviewPrice
                price={cheapestPrice}
                className="text-2xl font-bold text-primary-600"
              />
            </div>
          )}
        </div>

        {/* Right: imagen */}
        <div className="w-full md:w-1/3 lg:w-2/5 bg-gray-50 flex items-center justify-center">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="square"
            isFeatured={isFeatured}
            className="rounded-lg"
          />
        </div>
      </div>
    </LocalizedClientLink>
  )
}
