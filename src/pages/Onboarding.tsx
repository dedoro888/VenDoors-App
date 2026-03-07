import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, TrendingUp, Bell } from "lucide-react";
import vendoorLogo from "@/assets/vendoor-logo.png";

const slides = [
  {
    icon: ChefHat,
    title: "Manage Your Menu",
    description: "Add items, set prices, and control availability — all from one place.",
  },
  {
    icon: Bell,
    title: "Real-Time Orders",
    description: "Get instant notifications and manage orders as they come in.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Earnings",
    description: "See your revenue, payouts, and performance insights at a glance.",
  },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const handleGetStarted = () => {
    localStorage.setItem("vendoor_onboarded", "true");
    navigate("/dashboard");
  };

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else handleGetStarted();
  };

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-between px-6 py-12">
      {/* Logo */}
      <div className="flex flex-col items-center pt-8">
        <img src={vendoorLogo} alt="VenDoor Logo" className="h-20 w-20 rounded-2xl" />
        <h1 className="mt-3 text-2xl font-bold text-secondary-foreground">
          Ven<span className="text-primary">Door</span>
        </h1>
        <p className="text-xs text-secondary-foreground/60 mt-1">Vendor Dashboard</p>
      </div>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-xs">
        {(() => {
          const Icon = slides[current].icon;
          return (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 mb-6">
                <Icon size={36} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-secondary-foreground">{slides[current].title}</h2>
              <p className="mt-3 text-sm text-secondary-foreground/70 leading-relaxed">{slides[current].description}</p>
            </>
          );
        })()}

        {/* Dots */}
        <div className="flex gap-2 mt-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all ${i === current ? "w-6 bg-primary" : "w-2 bg-secondary-foreground/20"}`}
            />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={handleNext}
          className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 active:scale-[0.98] transition-all"
        >
          {current < slides.length - 1 ? "Next" : "Get Started"}
        </button>
        {current < slides.length - 1 && (
          <button
            onClick={handleGetStarted}
            className="w-full rounded-xl py-3 text-sm font-semibold text-secondary-foreground/60 active:scale-[0.98] transition-all"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
