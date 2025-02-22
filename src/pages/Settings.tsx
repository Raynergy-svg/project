import { motion } from 'framer-motion';

export default function Settings() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold mb-8"
      >
        Settings
      </motion.h1>
      {/* Settings content will go here */}
    </div>
  );
}