import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-600 mb-6">
          Evaluate AI-Generated Scientific Hypotheses
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join our community of domain experts to evaluate and improve AI-generated scientific hypotheses. Help shape the future of AI in scientific research.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/evaluate">Start Evaluating</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/leaderboard">View Leaderboard</Link>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Expert Verification</h3>
          <p className="text-gray-600">
            Verify your expertise through Google Scholar integration and contribute to high-quality scientific evaluation.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Structured Evaluation</h3>
          <p className="text-gray-600">
            Evaluate hypotheses based on key criteria: plausibility, novelty, and testability.
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Model Performance</h3>
          <p className="text-gray-600">
            Track and compare AI model performance across different scientific domains.
          </p>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-gray-600 mb-12">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">1</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Sign Up</h3>
            <p className="text-gray-600">Create an account and verify your expertise</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">2</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Select Domain</h3>
            <p className="text-gray-600">Choose your field of expertise</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">3</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Evaluate</h3>
            <p className="text-gray-600">Review and rate AI-generated hypotheses</p>
          </div>
          <div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-blue-600 font-bold">4</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Contribute</h3>
            <p className="text-gray-600">Help improve AI models and scientific research</p>
          </div>
        </div>
      </section>
    </div>
  );
}
