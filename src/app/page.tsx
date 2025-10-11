import { ArrowRight, Clock, ShoppingBag, Star, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TestimonialsSection, LightRays } from "@/ui/components/home-page-client";
import { HomePageData } from "@/ui/components/home-page-data";
import { Button } from "@/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/primitives/card";

import { testimonials } from "./mocks";

const featuresWhyChooseUs = [
  {
    description:
      "Shop with complete confidence knowing that if any goods have problems, we'll make it right.",
    icon: <ShoppingBag className="h-6 w-6 text-primary" />,
    title: "Shop With Confidence",
  },
  {
    description:
      "Your payment information is always safe and secure with us. We use industry-leading encryption.",
    icon: <Truck className="h-6 w-6 text-primary" />,
    title: "Secure Checkout",
  },
  {
    description:
      "Experience our friendly services backed by a comprehensive 30-day satisfaction guarantee.",
    icon: <Star className="h-6 w-6 text-primary" />,
    title: "Friendly Services",
  },
  {
    description:
      "We stand behind the quality of every pharmaceutical product we sell. 30-day money-back guarantee.",
    icon: <Clock className="h-6 w-6 text-primary" />,
    title: "Quality Guarantee",
  },
];

async function getHomePageData() {
  try {
    const [categoriesResponse, featuredProductsResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/categories`, {
        cache: 'no-store'
      }),
      fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/products/featured`, {
        cache: 'no-store'
      })
    ]);

    const [categoriesData, featuredProductsData] = await Promise.all([
      categoriesResponse.json(),
      featuredProductsResponse.json()
    ]);

    return {
      categories: categoriesData.categories || [],
      featuredProducts: featuredProductsData.products || []
    };
  } catch (error) {
    console.error('Error fetching home page data:', error);
    return {
      categories: [],
      featuredProducts: []
    };
  }
}

export default async function HomePage() {
  const { categories, featuredProducts } = await getHomePageData();

  return (
    <>
      <main
        className={`
          flex min-h-screen flex-col gap-y-16 bg-gradient-to-b from-muted/50
          via-muted/25 to-background
        `}
      >
        {/* Sample banner */}
        {/* <UkraineBanner /> */}
        

        {/* Hero Section */}
        <section
          className={`
            relative overflow-hidden py-24
            md:py-32
          `}
        >
          <div
            className={`
              bg-grid-black/[0.02] absolute inset-0
              bg-[length:20px_20px]
            `}
          />
          <LightRays 
            raysOrigin="top-center"
            raysColor="#fffffff"
            raysSpeed={1.5}
            lightSpread={0.8} 
            rayLength={1.4}
            followMouse={true}
            mouseInfluence={0.1}
            noiseAmount={0.1}
            distortion={0.05}
            className="pointer-events-none absolute inset-0 z-[5]"
          />
          <div
            className={`
              relative z-10 container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div
              className={`
                grid items-center gap-10
                lg:grid-cols-2 lg:gap-12
              `}
            >
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">

                  <h1
                    className={`
                      font-display text-4xl leading-tight font-bold
                      tracking-tight text-foreground
                      sm:text-5xl
                      md:text-6xl
                      lg:leading-[1.1]
                    `}
                  >
                    Your One-Stop Pharmacy for{" "}
                    <span
                      className={`
                        bg-gradient-to-r from-primary to-primary/70 bg-clip-text
                        text-transparent
                      `}
                    >
                      Trusted Health & Wellness
                    </span>
                  </h1>
                  <p
                    className={`
                      max-w-[700px] text-lg text-muted-foreground
                      md:text-xl
                    `}
                  >
                    Discover genuine medicines, supplements, and health essentials at fair
                    prices, with fast delivery and caring customer support.
                  </p>
                </div>
                <div
                  className={`
                    flex flex-col gap-3
                    sm:flex-row
                  `}
                >
                  <Link href="/products">
                    <Button
                      className={`
                        h-12 gap-1.5 px-8 transition-colors duration-200
                      `}
                      size="lg"
                    >
                      Shop Now <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/showcase">
                    <Button
                      className="h-12 px-8 transition-colors duration-200"
                      size="lg"
                      variant="outline"
                    >
                      View Showcase
                    </Button>
                  </Link>
                </div>
                <div
                  className={`
                    flex flex-wrap gap-5 text-sm text-muted-foreground
                  `}
                >
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="h-5 w-5 text-primary/70" />
                    <span>Shop With Confidence</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Star className="h-5 w-5 text-primary/70" />
                    <span>30 Day Satisfaction Guarantee</span>
                  </div>
                </div>
              </div>
              <div
                className={`
                  relative mx-auto hidden aspect-square w-full max-w-md
                  overflow-hidden rounded-xl border shadow-lg
                  lg:block
                `}
              >
                <div
                  className={`
                    absolute inset-0 z-10 bg-gradient-to-tr from-primary/20
                    via-transparent to-transparent
                  `}
                />
                <Image
                  alt="Professional pharmacy and healthcare services"
                  className="object-cover"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400&auto=format&fit=crop&q=80&ixlib=rb-4.0.3"
                />
              </div>
            </div>
          </div>
          <div
            className={`
              absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent
              via-primary/20 to-transparent
            `}
          />
        </section>

        {/* Dynamic Categories and Featured Products */}
        <HomePageData categories={categories} featuredProducts={featuredProducts} />

        {/* Features Section */}
        <section
          className={`
            py-12
            md:py-16
          `}
          id="features"
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div className="mb-8 flex flex-col items-center text-center">
              <h2
                className={`
                  font-display text-3xl leading-tight font-bold tracking-tight
                  md:text-4xl
                `}
              >
                Why Choose Us
              </h2>
              <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
              <p
                className={`
                  mt-4 max-w-2xl text-center text-muted-foreground
                  md:text-lg
                `}
              >
                We offer the best shopping experience with premium features
              </p>
            </div>
            <div
              className={`
                grid gap-8
                md:grid-cols-2
                lg:grid-cols-4
              `}
            >
              {featuresWhyChooseUs.map((feature) => (
                <Card
                  className={`
                    rounded-2xl border-none bg-background shadow transition-all
                    duration-300
                    hover:shadow-lg
                  `}
                  key={feature.title}
                >
                  <CardHeader className="pb-2">
                    <div
                      className={`
                        mb-3 flex h-12 w-12 items-center justify-center
                        rounded-full bg-primary/10
                      `}
                    >
                      {feature.icon}
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section
          className={`
            bg-muted/50 py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <TestimonialsSection
              className="py-0"
              description="Don't just take our word for it - hear from our satisfied customers"
              testimonials={testimonials}
              title="What Our Customers Say"
            />
          </div>
        </section>

        {/* CTA Section */}
        <section
          className={`
            py-12
            md:py-16
          `}
        >
          <div
            className={`
              container mx-auto max-w-7xl px-4
              sm:px-6
              lg:px-8
            `}
          >
            <div
              className={`
                relative overflow-hidden rounded-xl bg-primary/10 p-8 shadow-lg
                md:p-12
              `}
            >
              <div
                className={`
                  bg-grid-white/[0.05] absolute inset-0
                  bg-[length:16px_16px]
                `}
              />
              <div className="relative z-10 mx-auto max-w-2xl text-center">
                <h2
                  className={`
                    font-display text-3xl leading-tight font-bold tracking-tight
                    md:text-4xl
                  `}
                >
                  Ready to Take Control of Your Health?
                </h2>
                <p
                  className={`
                    mt-4 text-lg text-muted-foreground
                    md:text-xl
                  `}
                >
                  Join thousands of satisfied customers and experience the best
                  pharmacy products on the market. Sign up today for exclusive deals
                  and health tips.
                </p>
                <div
                  className={`
                    mt-6 flex flex-col items-center justify-center gap-3
                    sm:flex-row
                  `}
                >
                  <Link href="/auth/sign-up">
                    <Button
                      className="h-12 px-8 transition-colors duration-200"
                      size="lg"
                    >
                      Sign Up Now
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button
                      className="h-12 px-8 transition-colors duration-200"
                      size="lg"
                      variant="outline"
                    >
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
