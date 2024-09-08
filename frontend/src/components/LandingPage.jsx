import React from 'react';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
const LandingPage = () => {
  return (
    <>
      <Navbar />
      <div className="container mx-auto p-6">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between my-12">
          <motion.div
            className="text-left max-w-md"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-extrabold text-gray-800 mb-4">
              Organize Your Notes Effortlessly
            </h1>
            <p className="text-lg text-gray-500 mb-6">
              Take control of your tasks and thoughts with our intuitive note-taking app. Capture your ideas and access them from anywhere.
            </p>
            <div className="space-x-4">
              <motion.button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to={"/login"}>Get Started</Link>
              </motion.button>

            </div>
          </motion.div>
          <motion.div
            className="mt-12 md:mt-0 md:ml-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="https://www.slashgear.com/img/gallery/how-to-use-hide-my-email-in-ios-15-devices/how-to-setup-up-hide-my-email-on-an-iphone-1655196156.jpg"
              alt="Hero"
              className="max-w-lg rounded-xl shadow-lg"
            />
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          className="my-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">
            Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              title="Create and Manage Notes"
              description="Easily create, edit, and organize your notes."
            />
            <FeatureCard
              title="Search and Filter"
              description="Quickly find notes with search and tagging."
            />
            <FeatureCard
              title="Pin Important Notes"
              description="Keep important notes at the top for easy access."
            />
          </div>
        </motion.div>
      </div>
    </>
  );
};

const FeatureCard = ({ title, description }) => {
  return (
    <motion.div
      className="bg-white shadow-md rounded-lg p-6 hover:shadow-xl transition-shadow duration-300"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

export default LandingPage;
