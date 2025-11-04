import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does mentor.ai work?",
    answer: "mentor.ai uses advanced AI to analyze your learning style, goals, and preferences to create personalized study plans. It provides tailored resources, tracks your progress, and adapts to your needs as you learn."
  },
  {
    question: "What types of subjects can I study?",
    answer: "mentor.ai supports a wide range of subjects including sciences, mathematics, languages, humanities, and professional skills. Our AI can help create study plans for any subject you're interested in learning."
  },
  {
    question: "Can I track my progress?",
    answer: "Yes! mentor.ai provides detailed progress tracking, including study time analytics, completion rates, and performance insights. You can monitor your learning journey and adjust your study plans accordingly."
  },
  {
    question: "Who is mentor.ai for?",
    answer: "mentor.ai is designed for students, professionals, and lifelong learners of all levels. Whether you're preparing for exams, learning new skills, or pursuing personal development, mentor.ai can help optimize your learning journey."
  },
  {
    question: "Does mentor.ai provide learning resources?",
    answer: "Yes, mentor.ai curates high-quality learning resources tailored to your study plan, including articles, videos, practice exercises, and interactive materials from trusted sources."
  }
]

export function FaqSection() {
  return (
    <section className="py-12 sm:py-20 max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
        <p className="text-muted-foreground">Find answers to common questions about mentor.ai</p>
      </div>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-lg font-medium">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
