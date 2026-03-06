import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Brain, Calculator, BarChart3, BookOpen, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4">
            AI-Powered Trading Journal
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Master Your Trading with AI-Powered Insights
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Track your trades, analyze performance, and get personalized coaching from AI to improve your trading strategy and maximize profits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/auth">Start Trading Smarter</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive tools designed specifically for serious traders who want to improve their performance.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Smart Trade Logging</CardTitle>
              <CardDescription>
                Log every trade with detailed entry/exit points, notes, and emotions. Never lose track of your trading history.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Brain className="w-10 h-10 text-primary mb-2" />
              <CardTitle>AI Coach</CardTitle>
              <CardDescription>
                Get personalized insights and recommendations based on your trading patterns and performance data.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Calculator className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Risk Calculator</CardTitle>
              <CardDescription>
                Calculate position sizes, risk-reward ratios, and stop-loss levels before entering any trade.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Visualize your trading performance with detailed charts, win rates, and profit/loss analysis.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <TrendingUp className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Journal Insights</CardTitle>
              <CardDescription>
                Review your trading journal with advanced filtering and search to identify patterns and improve.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-primary mb-2" />
              <CardTitle>Secure & Private</CardTitle>
              <CardDescription>
                Your trading data is encrypted and stored securely. Focus on trading, not data security.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">See It In Action</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Experience the power of AI-driven trading analysis. Our platform helps you make better decisions and improve your results.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Card className="p-8">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Interactive demo coming soon!</p>
              <p className="text-sm mt-2">Sign up now to start your trading journey</p>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Trading?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of traders who are already using AI to improve their performance and achieve consistent profits.
          </p>
          <Button asChild size="lg" className="text-lg px-8">
            <Link to="/auth">Get Started Free</Link>
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Start tracking your trades today
          </p>
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
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
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