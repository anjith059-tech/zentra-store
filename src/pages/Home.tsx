import React, {
  useState,
  useEffect,
} from 'react';

import {
  motion,
  AnimatePresence,
} from 'motion/react';

import { useNavigate } from 'react-router-dom';

import {
  Package,
  Lock,
  Star,
} from 'lucide-react';

import { WHY_CHOOSE_ZENTRA } from '../data/mockData';

import { useData } from '../context/DataContext';

import { ProductCard } from '../components/ProductCard';

import { CategoryCard } from '../components/CategoryCard';

import { SectionTitle } from '../components/SectionTitle';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const {
    products,
    categories,
  } = useData();

  const explicitlyFeatured = products.filter(
    (product) => product.isFeatured === true
  );
  const featuredProducts = (
    explicitlyFeatured.length > 0 ? explicitlyFeatured : products
  ).slice(0, 8);

  const [quoteSlide, setQuoteSlide] =
    useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteSlide((prev) =>
        prev === 0 ? 1 : 0
      );
    }, 4500);

    return () =>
      clearInterval(timer);
  }, []);

  const whyIcons: Record<
    string,
    React.ElementType
  > = {
    Truck: Package,
    ShieldCheck: Lock,
    Award: Star,
  };

  return (
    <div className="space-y-7 md:space-y-14 pb-10 md:pb-16">

      {/* =========================
          HERO SECTION
      ========================== */}

      <section
        id="hero-section"
        className="relative flex justify-center overflow-hidden w-full"
      >
        <video
          src="/95wbzq.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-[500px] md:h-[480px] lg:h-[520px] object-cover scale-[1.38]"
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 space-y-5 px-4 md:px-8 text-center bg-black/10">

          <motion.h1
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium tracking-wide text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-tight max-w-3xl"
          >
            Transform Your Home
          </motion.h1>

          <motion.button
            onClick={() =>
              navigate('/shop')
            }
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.95,
            }}
            className="px-6 md:px-8 py-2.5 md:py-3 bg-white/90 backdrop-blur-sm text-slate-900 font-semibold tracking-wide rounded-full text-sm md:text-base shadow-lg hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300"
          >
            Shop Now
          </motion.button>

        </div>
      </section>


      {/* =========================
          CATEGORIES
      ========================== */}

      <section
        id="categories-section"
        className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <SectionTitle
          title="Explore Categories"
          seeAllLink="/shop"
          seeAllText="View All"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

          {categories
            .slice(0, 2)
            .map((category, idx) => (
              <CategoryCard
                key={`${category.id}-${idx}`}
                category={category}
              />
            ))}

        </div>
      </section>


      {/* =========================
          FEATURED PRODUCTS
      ========================== */}

      <section
        id="featured-products-section"
        className="px-4 md:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <SectionTitle
          title="Featured Appliances"
          subtitle="Handpicked smart solutions for your home"
          seeAllLink="/shop"
          seeAllText="Shop All"
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">

          {featuredProducts.map(
            (product, idx) => (
              <ProductCard
                key={`${product.id}-${idx}`}
                product={product}
              />
            )
          )}

        </div>
      </section>


      {/* =========================
          WHY CHOOSE + QUOTE
      ========================== */}

      <div className="w-full space-y-7 md:space-y-0 md:grid md:grid-cols-2 md:gap-8 md:items-stretch max-w-7xl mx-auto md:px-6 lg:px-8">


        {/* =========================
            WHY CHOOSE ZENTRA
        ========================== */}

        <section
          id="why-choose-section"
          className="relative overflow-hidden z-0 px-6 md:px-10 lg:px-12 py-12 md:py-12 rounded-3xl md:rounded-2xl w-full h-full md:h-[520px] lg:h-[580px] flex flex-col justify-center"
        >

          {/* DO NOT REMOVE THIS VIDEO */}
          <video
            src="/gemini.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover scale-[1.38] -z-20"
          />

          <div className="relative z-10 max-w-5xl mx-auto drop-shadow-[0_4px_10px_rgba(0,0,0,0.85)]">

            <div className="text-center">

              <span className="text-xs font-bold tracking-[0.2em] text-white/90 uppercase mb-3 block">
                THE ZENTRA DIFFERENCE
              </span>

              <h2 className="text-3xl md:text-3xl lg:text-4xl font-serif text-white mb-8 md:mb-8">
                Why Choose Zentra
              </h2>

            </div>


            <div className="space-y-8 md:space-y-6">

              {WHY_CHOOSE_ZENTRA.map(
                (item, idx) => {
                  const IconComp =
                    whyIcons[item.icon] ||
                    Lock;

                  return (
                    <motion.div
                      key={idx}
                      initial={{
                        opacity: 0,
                        y: 20,
                      }}
                      whileInView={{
                        opacity: 1,
                        y: 0,
                      }}
                      viewport={{
                        once: true,
                        margin: '-50px',
                      }}
                      transition={{
                        duration: 0.6,
                        ease: 'easeOut',
                        delay:
                          idx * 0.15,
                      }}
                      className="flex items-start gap-5 md:gap-4"
                    >

                      <div className="w-14 h-14 md:w-12 md:h-12 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center shrink-0">

                        <IconComp
                          className="w-7 h-7 md:w-6 md:h-6 text-white"
                          strokeWidth={1.25}
                        />

                      </div>


                      <div className="pt-1 md:pt-0">

                        <h3 className="text-xl md:text-lg font-medium text-white mb-1">
                          {item.title}
                        </h3>

                        <p className="text-base md:text-sm text-white/90 leading-relaxed">
                          {item.description}
                        </p>

                      </div>

                    </motion.div>
                  );
                }
              )}

            </div>

          </div>
        </section>


        {/* =========================
            QUOTE IMAGE SLIDER
        ========================== */}

        <section
          id="quote-image-section"
          className="w-full overflow-hidden p-0 m-0 h-full md:h-[520px] lg:h-[580px] flex items-center justify-center"
        >

          <div className="relative w-full h-full overflow-hidden rounded-none md:rounded-3xl border-none p-0 m-0 shadow-none md:shadow-md transition-all duration-300">

            <AnimatePresence mode="wait">

              <motion.div
                key={quoteSlide}
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.6,
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
                className="w-full h-full"
              >

                {quoteSlide === 0 ? (
                  <img
                    src="/ChatGPT Image Aug 8, 2026, 10_07_52 AM.png"
                    alt="Your home should tell the story of who you are, and be a collection of what you love. - Nate Berkus"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover block scale-[1.05] md:scale-100 transition-transform duration-500 hover:scale-[1.07] md:hover:scale-[1.02] rounded-none md:rounded-3xl"
                  />
                ) : (
                  <img
                    src="/image.png"
                    alt="Zentra appliances"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover block scale-[1.05] md:scale-100 transition-transform duration-500 hover:scale-[1.07] md:hover:scale-[1.02] rounded-none md:rounded-3xl"
                  />
                )}

              </motion.div>

            </AnimatePresence>


            {/* Bottom gradient */}

            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-10" />


            {/* Slide indicators */}

            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5">

              {[0, 1].map(
                (idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      setQuoteSlide(idx)
                    }
                    className={`h-2 rounded-full transition-all duration-300 ${
                      quoteSlide === idx
                        ? 'w-6 bg-white shadow-sm'
                        : 'w-2 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Go to slide ${
                      idx + 1
                    }`}
                  />
                )
              )}

            </div>

          </div>
        </section>

      </div>
    </div>
  );
};