import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function SubjectSections() {
  const subjects = [
    {
      id: "physics",
      title: "Physics-X",
      logo: "/placeholder.svg?height=200&width=200",
      description:
        "Step Into The World Of Motion, Energy, And Matter! The Physics Olympiad Under OLYMPIA-X Is Your Gateway To Test Logic, Concept Clarity, And Application Skills — All In A National-Level Competitive Setting. Open To Students From Classes 8 To 12, This MCQ-Based Exam Challenges You With Thought-Provoking Problems In Mechanics, Electricity, Optics, Modern Physics, And More. Whether You're Aiming To Pursue Engineering, Science, Or Simply Want To Challenge Yourself, This Exam Is Your Chance To Shine Nationwide, Win Exciting Prizes, And Strengthen Your Academic Profile.",
      buttonText: "Phy.Syllabus",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "chemistry",
      title: "Chem-X",
      logo: "/placeholder.svg?height=200&width=200",
      description:
        "Unleash The Scientist Within! The Chemistry Olympiad Of OLYMPIA-X Is A National-Level Competition Crafted For Curious And Ambitious Students Of Classes 8 To 12 Who Wish To Explore The Magic Of Molecules, Reactions, And Atomic Theories Beyond Textbooks. This Exam Is Not Just About Formulas — It Tests Conceptual Understanding, Application Skills, And Logical Thinking Across Core Topics Such As Physical, Organic, And Inorganic Chemistry, Tailored To Challenge Students At An Olympiad Level. Whether You're Preparing For NEET, JEE, Or Other Competitive Exams, This Is Your Opportunity To Prove Your Brilliance, Gain Recognition, Win Prizes Worth Lakhs, And Get A Detailed Analysis Of Your Academic Standing.",
      buttonText: "Chem Syllabus",
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "math",
      title: "Math - X",
      logo: "/placeholder.svg?height=200&width=200",
      description:
        "Dive Into The Fascinating World Of Numbers, Patterns, And Problem-Solving! The Mathematics Olympiad Under OLYMPIA-X Is Designed To Challenge And Inspire The Brightest Young Minds From Classes 8 To 12. This MCQ-Based Exam Tests Your Logical Reasoning, Analytical Skills, And Deep Understanding Of Core Mathematical Concepts Like Algebra, Geometry, Trigonometry, Calculus, And More — All Aligned With Your Curriculum But Presented In An Olympiad-Level Format. Whether You're Preparing For Competitive Exams Or Simply Love Solving Challenging Problems, This Is Your Chance To Shine At The National Level, Win Cash Prizes & Scholarships, And Earn Recognition For Your Talent.",
      buttonText: "Math Syllabus",
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "biology",
      title: "Biology",
      logo: "/placeholder.svg?height=200&width=200",
      description:
        "Step Into The World Of Life Sciences With The Biology Olympiad Of OLYMPIA-X, India's Biggest Talent Hunt Exam For Classes 8 To 12. Designed For Young Minds Passionate About Life, Living Systems, And Evolution, This Olympiad Challenges Students To Explore Biology Beyond Textbooks, From Cell Structure And Genetics To Human Physiology And Ecosystems, This Exam Covers A Broad Spectrum Of Biological Concepts, Helping Students Sharpen Their Reasoning, Observation, And Application Skills— Ideal For Those Preparing For NEET, Olympiads, And Other Competitive Exams. It's More Than Just A Test—It's An Opportunity To Win Exciting Prizes, Gain National Recognition, And Receive Personalized Performance Reports That Identify Your Strengths And Areas Of Improvement.",
      buttonText: "Bio. Syllabus",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your <span className="text-blue-600">Subject</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our comprehensive Olympiad programs designed for academic excellence
          </p>
        </div>

        <div className="space-y-20">
          {subjects.map((subject, index) => (
            <div
              key={subject.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? "lg:grid-flow-col-dense" : ""}`}
            >
              {/* Subject Logo */}
              <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""}`}>
                <Card className="bg-gray-50 border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-8 text-center">
                    <div className="w-64 h-64 mx-auto mb-6 bg-white rounded-full shadow-lg flex items-center justify-center">
                      <div
                        className={`w-48 h-48 rounded-full bg-gradient-to-br ${subject.color} flex items-center justify-center`}
                      >
                        <div className="text-white text-6xl font-bold">{subject.title.charAt(0)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Subject Content */}
              <div className={`${index % 2 === 1 ? "lg:col-start-1" : ""}`}>
                <div className="mb-4">
                  <span className="text-blue-600 font-semibold text-lg">Schoozy</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">{subject.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-8 text-lg">{subject.description}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-full"
                  >
                    Register Now
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-gray-800 text-gray-800 hover:bg-gray-800 hover:text-white px-8 py-4 text-lg font-semibold rounded-full bg-transparent"
                  >
                    {subject.buttonText}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
