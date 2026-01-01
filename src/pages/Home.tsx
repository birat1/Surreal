import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import FeaturesSection from '@/components/FeaturesSection';
import { ChevronsDown } from 'lucide-react';

const Home: React.FC = () => {
    const { isAuthenticated } = useAuth();

    return (
        <div className="relative min-h-screen bg-linear-to-br from-slate-100 via-slate-50 to-blue-100 text-center text-gray-900">
            <div className="flex min-h-screen flex-col px-6">
                <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.9, ease: 'easeOut' }}
                        className="mb-6 max-w-3xl text-5xl font-extrabold tracking-tight md:text-6xl lg:text-7xl"
                    >
                        Helping you build{' '}
                        <span className="text-blue-500">real</span> connections
                        at Surrey
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.9,
                            delay: 0.4,
                            ease: 'easeOut',
                        }}
                        className="max-w-2xl text-lg text-gray-500 md:text-xl"
                    >
                        Whether you are new to uni or just want to meet people
                        with similar interests, Surreal helps you form genuine
                        connections.
                    </motion.p>

                    <motion.p
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.7,
                            delay: 0.8,
                            ease: 'easeOut',
                        }}
                        className="mt-4 text-sm uppercase tracking-wide text-blue-400"
                    >
                        Designed by students, for students
                    </motion.p>
                </div>

                {!isAuthenticated && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            duration: 0.8,
                            delay: 1.1,
                            ease: 'easeOut',
                        }}
                        whileHover={{ scale: 1.08 }}
                        className="mb-10 flex justify-center"
                    >
                        <Link to="/signup">
                            <button className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-blue-500">
                                Get Started
                            </button>
                        </Link>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.6, duration: 0.6 }}
                    className="mt-6 flex justify-center"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{
                            duration: 1.6,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="text-gray-400"
                    >
                        <ChevronsDown size={40} />
                    </motion.div>
                </motion.div>
            </div>

            <section className="overflow-x-hidden">
                <FeaturesSection />
            </section>

            {/* About Section */}
            <motion.section
                id="about"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="py-20 bg-gray-800"
            >
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4 text-white">
                        Why We Created Surreal
                    </h2>
                    <p className="text-gray-300">
                        Starting university can be exciting — but it can also be
                        daunting, especially when you don't know anyone yet. We
                        realised that while there are countless social media
                        platforms, none are built specifically to help students
                        make genuine friendships at university. Surreal was
                        created to change that. By connecting you with people
                        who share your interests, courses, and hobbies, Surreal
                        makes it easier to meet the right people and build real
                        connections from day one.
                    </p>
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
