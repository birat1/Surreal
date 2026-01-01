import { motion } from 'framer-motion';

import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection = () => {
  const features = [
    {
      title: 'Finding People Who Get You',
      desc: 'Discover other students with similar interests, hobbies, and culture as you — without awkward introductions.',
      img: '/placeholder.png',
    },
    {
      title: 'Making Real Connections',
      desc: 'Surreal is built specifically to help students form genuine friendships, not chase likes or followers.',
      img: '/placeholder.png',
    },
    {
      title: 'Settling Into Uni Faster',
      desc: "Whether it's your first week or your first year, Surreal helps you feel at home sooner.",
      img: '/placeholder.png',
    },
  ];

  return (
    <section
      id="features"
      className="w-full bg-linear-to-br from-slate-100 via-slate-50 to-blue-100 py-24"
    >
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-20 text-center text-4xl font-bold text-gray-600">
          Surreal Helps You With
        </h2>

        <div className="flex flex-col gap-28">
          {features.map((feature, index) => {
            const alignRight = index % 2 === 1;

            return (
              <div
                key={index}
                className={`flex ${
                  alignRight ? 'justify-end' : 'justify-start'
                }`}
              >
                <motion.div
                  initial={{
                    opacity: 0,
                    x: alignRight ? 150 : -150,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  exit={{
                    opacity: 0,
                    x: alignRight ? 150 : -150,
                  }}
                  transition={{
                    duration: 0.7,
                    ease: 'easeOut',
                  }}
                  viewport={{
                    once: false,
                    amount: 0.3,
                  }}
                  className={`
                                        w-full lg:w-[1100px]
                                        ${
                                          alignRight
                                            ? 'lg:translate-x-20'
                                            : 'lg:-translate-x-20'
                                        }
                                    `}
                >
                  <Card className="overflow-hidden rounded-3xl bg-blue-600 text-white shadow-2xl">
                    <CardContent
                      className={`flex flex-col items-center gap-14 p-12 lg:flex-row lg:p-16 ${
                        alignRight ? 'lg:flex-row-reverse' : ''
                      }`}
                    >
                      {/* IMAGE PLACEHOLDER */}
                      <div className="flex flex-1 justify-center">
                        <div className="flex h-[300px] w-[420px] items-center justify-center rounded-xl bg-white/10 text-gray-400">
                          Screenshot
                        </div>
                      </div>

                      {/* TEXT */}
                      <div className="flex flex-1 flex-col gap-6">
                        <h3 className="text-3xl font-semibold">
                          {feature.title}
                        </h3>
                        <p className="text-xl leading-relaxed opacity-90">
                          {feature.desc}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
