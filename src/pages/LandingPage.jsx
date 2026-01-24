import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Check, 
  ArrowRight, 
  Factory, 
  FileText, 
  Users, 
  CheckCircle2, 
  Shield, 
  Zap,
  Building2,
  ChevronRight,
  Star,
  Phone,
  Mail
} from "lucide-react";
import { getAllPlans } from "../config/plans";

export default function LandingPage() {
  const navigate = useNavigate();
  const plans = getAllPlans();

  const features = [
    {
      icon: Factory,
      title: "Multi-Plant Management",
      description: "Manage multiple manufacturing plants from a single dashboard with centralized control."
    },
    {
      icon: FileText,
      title: "Dynamic Form Builder",
      description: "Create custom forms with drag-and-drop ease. No coding required."
    },
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Assign roles to company admins, plant admins, and employees with granular permissions."
    },
    {
      icon: CheckCircle2,
      title: "Multi-Level Approvals",
      description: "Set up complex approval workflows with multiple levels and automatic notifications."
    },
    {
      icon: Shield,
      title: "Secure & Compliant",
      description: "Enterprise-grade security with audit trails and compliance tracking."
    },
    {
      icon: Zap,
      title: "Real-time Tracking",
      description: "Track form submissions and approvals in real-time with instant notifications."
    }
  ];

  const getPlanIcon = (planName) => {
    switch(planName.toUpperCase()) {
      case "SILVER": return "🥈";
      case "GOLD": return "🥇";
      case "PREMIUM": return "💎";
      default: return "📦";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">FormFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
              <button 
                onClick={() => navigate("/login")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-semibold transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-32 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4" />
            Trusted by 500+ manufacturing companies
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Streamline Your<br />
            <span className="text-indigo-600">Form Approval Workflow</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Multi-plant dynamic form approval system designed for manufacturing companies. 
            Create, submit, and approve forms across all your plants with ease.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl shadow-indigo-200 transition-all hover:scale-105"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <a 
              href="#pricing"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg border border-gray-200 transition-colors"
            >
              View Pricing
            </a>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { value: "500+", label: "Companies" },
              { value: "10K+", label: "Forms Created" },
              { value: "50K+", label: "Approvals" },
              { value: "99.9%", label: "Uptime" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Approvals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for manufacturing companies with complex approval workflows.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

<section id="pricing" className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Choose the perfect plan for your organization. Contact us to get started.
              </p>

              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
                <Phone className="w-4 h-4" />
                Contact our team for personalized setup
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <div 
                  key={plan.key}
                  className={`relative bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-xl ${
                    plan.popular ? "border-indigo-600 scale-105" : "border-gray-100"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className="text-4xl mb-4">{getPlanIcon(plan.key)}</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    <div className="mb-6">
                      <span className="text-sm text-gray-500">Starting at</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          ${plan.price}
                        </span>
                        <span className="text-gray-500">/month</span>
                      </div>
                    </div>

                    <a 
                      href="#contact"
                      className={`w-full py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                        plan.popular
                          ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                      }`}
                    >
                      <Phone className="w-4 h-4" />
                      Contact Sales
                    </a>
                  </div>

                  <div className="border-t border-gray-100 p-8">
                    <p className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                      What's included
                    </p>
                    <ul className="space-y-3">
                      {plan.displayFeatures.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="py-24 bg-indigo-600">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-indigo-100 mb-10">
              Contact our team to set up your account. We'll help you choose the right plan and get started quickly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+1234567890"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg shadow-xl transition-all hover:scale-105"
              >
                <Phone className="w-5 h-5" />
                Call Us
              </a>
              <a 
                href="mailto:sales@formflow.com"
                className="inline-flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-xl font-semibold text-lg border border-indigo-400 transition-all hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Email Sales
              </a>
            </div>
            <p className="text-indigo-200 mt-6 text-sm">
              Or if you already have an account
            </p>
            <button 
              onClick={() => navigate("/login")}
              className="mt-4 inline-flex items-center gap-2 text-white hover:underline font-medium"
            >
              Sign In to Dashboard
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">FormFlow</span>
            </div>
            <div className="flex gap-8">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
            <div className="text-sm">
              © 2024 FormFlow. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
