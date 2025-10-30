import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative bg-white rounded-lg p-6 pb-8 border-2 border-b-4 border-r-4 border-black hover:border-b-2 hover:border-r-2 transition-all duration-100 shadow-sm hover:shadow active:border-b-2 active:border-r-2"
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#f0ffdb] rounded-xl flex items-center justify-center">
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}