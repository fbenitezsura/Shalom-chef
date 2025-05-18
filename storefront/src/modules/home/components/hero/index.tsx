import { Github } from "@medusajs/icons"
import { Button, Heading } from "@medusajs/ui"

const Hero = () => {
  return (
    <div className="h-[75vh] w-full relative bg-ui-bg-subtle">
      <div className="absolute inset-0 z-10 flex flex-col justify-center items-center text-center">
        <img className="hidden md:block w-full h-full" src="/banner/banner.png" />
        <img className="block md:hidden w-full h-full" src="/banner/banner_mobile.png" />
      </div>
    </div>
  )
}

export default Hero
