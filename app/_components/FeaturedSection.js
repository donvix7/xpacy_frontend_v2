import SectionLayout from "@/app/_components/SectionLayout";
import Featured from "@/app/_components/Featured";
import { Suspense } from "react";
import { getFeaturedProperties } from "@/app/_lib/data-services";
export default async function FeaturedSection() {
  const featuredProperties = await getFeaturedProperties()
  return (
    <SectionLayout
      featured={true}
      heading={"Featured Properties"}
      subheading={"Discover Exceptional Spaces Curated Just for You"}
    >
      <Suspense fallback={<div className="spinner"></div>}>
        <Featured properties={featuredProperties} />
      </Suspense>
    </SectionLayout>
  )
}