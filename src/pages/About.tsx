import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Brain, Users, Shield, Mail, Lock } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            About PipTracker
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Empowering Traders with AI-Driven Insights
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            We're on a mission to help traders achieve consistent profitability through intelligent analysis, personalized coaching, and comprehensive performance tracking.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">Start Your Journey</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Trading should be about skill and strategy, not guesswork. We believe every trader deserves access to professional-grade tools and AI-powered insights to make better decisions and achieve their financial goals.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Target className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Consistent Profits</CardTitle>
              <CardDescription>
                Help traders develop sustainable strategies that lead to long-term success, not short-term wins.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Brain className="w-10 h-10 text-primary mb-2" />
              <CardTitle>AI-Powered Learning</CardTitle>
              <CardDescription>
                Leverage artificial intelligence to analyze trading patterns and provide personalized coaching.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Community of Traders</CardTitle>
              <CardDescription>
                Build a supportive community where traders can learn from each other and share insights.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How AI Coach Works */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How Our AI Coach Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our AI analyzes your trading data to provide personalized insights and recommendations tailored to your unique style and goals.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Data Analysis</CardTitle>
                <CardDescription>
                  The AI examines your trade history, win/loss ratios, risk management, and emotional patterns to identify strengths and areas for improvement.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Personalized Insights</CardTitle>
                <CardDescription>
                  Based on your data, the AI generates specific recommendations for entry/exit strategies, position sizing, and risk management.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Continuous Learning</CardTitle>
                <CardDescription>
                  As you log more trades, the AI refines its understanding of your style and provides increasingly accurate coaching.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>
                  Monitor how your trading improves over time with detailed analytics and progress reports.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">What Makes Us Different</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Unlike basic spreadsheets or generic trading apps, PipTracker combines comprehensive tools with AI intelligence for a complete trading solution.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Coaching</CardTitle>
              <CardDescription>
                Most trading journals are passive record-keepers. Our AI actively analyzes your data and provides actionable recommendations.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Comprehensive Tools</CardTitle>
              <CardDescription>
                From risk calculators to performance analytics, we provide everything serious traders need in one integrated platform.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Privacy-First Design</CardTitle>
              <CardDescription>
                Your trading data stays private and secure. We never share or sell your information to third parties.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Trader-Focused Features</CardTitle>
              <CardDescription>
                Built by traders for traders, with features that address real challenges like emotional discipline and risk management.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Our Team</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            PipTracker was founded by experienced traders and developers who understand the challenges of consistent profitability in financial markets.
          </p>
        </div>
        <div className="max-w-2xl mx-auto text-center">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                We're a team of passionate traders and technologists committed to democratizing access to professional-grade trading tools. 
                Our combined experience spans decades of market analysis, risk management, and software development.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Privacy & Security */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Privacy & Security</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your trading data is our top priority. We implement industry-standard security measures to keep your information safe.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <Lock className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Data Encryption</CardTitle>
              <CardDescription>
                All data is encrypted in transit and at rest using industry-standard protocols. Your trading history and personal information are fully protected.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Secure Infrastructure</CardTitle>
              <CardDescription>
                We use Supabase's enterprise-grade infrastructure with automatic backups, monitoring, and compliance with data protection regulations.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have questions about PipTracker? We'd love to hear from you and help you on your trading journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" size="lg">
              <a href="mailto:support@piptracker.com">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-semibold">PipTracker</h3>
              <p className="text-sm text-muted-foreground">AI-Powered Trading Journal</p>
            </div>
            <div className="flex gap-6">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <a href="mailto:support@piptracker.com" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}