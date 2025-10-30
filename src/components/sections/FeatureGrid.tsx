import { ReactNode } from 'react'
import { FeatureCard } from './FeatureCard'

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeaturesGridProps {
  features: Feature[];
}

export function FeaturesGrid({ features }: FeaturesGridProps) {
  return (
    <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
      {features.map((feature, index) => (
        <FeatureCard
          key={index}
          icon={feature.icon}
          title={feature.title}
          description={feature.description}
        />
      ))}
    </div>
  )
}