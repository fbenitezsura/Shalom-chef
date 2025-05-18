import React from "react";
import Link from "next/link";

export interface Category {
  id: string;
  name: string;
  handle: string;
  metadata?: {
    image?: string; // URL to category image
  } | null;
}

interface CategoryCarouselProps {
  categories: Category[];
  className?: string;
}

const img = [
  { labels: 'burgers', img: '/categories/burgers.jpg' },
  { labels: 'extras',   img: '/categories/extras.jpg' },
  { labels: 'Bowls',     img: '/categories/bowl.png' },
  { labels: 'wok',      img: '/categories/wok.png' },
  { labels: 'promotions', img: '/categories/promociones.png' },
  { labels: 'sandwich', img: '/categories/sandwich.png' },
];

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  className = "",
}) => {
  // Construimos un objeto para lookup rápido por handle/label
  const imagesMap = React.useMemo(() => {
    return img.reduce<Record<string, string>>((acc, entry) => {
      acc[entry.labels] = entry.img;
      return acc;
    }, {});
  }, []);

  console.log("categories",categories)

  return (
    <div
      className={`w-full overflow-x-auto whitespace-nowrap scrollbar-hide mt-5 px-3 py-2 ${className}`}
    >
      <ul className="flex gap-6 px-2">
        {categories.map((cat) => {
          console.log("cat", cat.handle)
          // Seleccionamos la imagen: primero del array img, luego metadata, luego path por defecto
          const imageSrc =
            imagesMap[cat.handle];
          console.log("imagen a usar", imageSrc);
          return (
            <li key={cat.id} className="flex-shrink-0">
              <Link
                href={`/categories/${cat.handle}`}
                className="group inline-flex flex-col items-center text-center"
              >
                {/* Image */}
                <div className="h-[150px] w-[150px] overflow-hidden rounded-full border border-gray-200 shadow-sm transition-transform">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageSrc}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Name */}
                <span className="mt-[-20px] rounded-full py-3 px-5 bg-[#8B0000] text-sm font-bold text-white group-hover:text-primary-600">
                  {cat.name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryCarousel;
