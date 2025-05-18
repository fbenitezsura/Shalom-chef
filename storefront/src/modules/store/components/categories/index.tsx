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

/**
 * Horizontal scrollable list of product categories.
 * Each item shows an image (square, 96×96) and the category name below.
 * Clicking an item navigates to `/category/[handle]`.
 */
const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, className = "" }) => {
  return (
    <div
      className={`w-full overflow-x-auto whitespace-nowrap scrollbar-hide mt-5 px-3 py-2 ${className}`}
    >
      <ul className="flex gap-6 px-2">
        {categories.map((cat) => (
          <li key={cat.id} className="flex-shrink-0">
            <Link
              href={`/category/${cat.handle}`}
              className="group inline-flex flex-col items-center text-center"
            >
              {/* Image */}
              <div className="h-28 w-28 overflow-hidden rounded-full border border-gray-200 shadow-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.metadata?.image || `/images/categories/${cat.handle}.jpg`}
                  alt={cat.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              {/* Name */}
              <span className="mt-2 text-sm font-bold text-gray-800 group-hover:text-primary-600">
                {cat.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryCarousel;