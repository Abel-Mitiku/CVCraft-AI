"use client";

export function KeyFeatures() {
  const features = [
    {
      badge: "AI-Powered",
      title: "Smart Content Generation",
      description: "AI helps write compelling bullet points and descriptions",
    },
    {
      badge: "ATS-Friendly",
      title: "Applicant Tracking System",
      description: "Optimized to pass through ATS filters",
    },
    {
      badge: "Industry-Specific",
      title: "Keyword Optimization",
      description: "Tailored suggestions for your industry",
    },
    {
      badge: "Multiple Formats",
      title: "Export Options",
      description: "PDF, HTML, and DOCX formats",
    },
    {
      badge: "Real-time Preview",
      title: "Live Editing",
      description: "See changes as you make them",
    },
    {
      badge: "Privacy First",
      title: "Local Storage",
      description: "Your data stays on your device",
    },
  ];

  return (
    <section className="bg-gray-50 py-12 px-4 md:px-6 lg:px-8" id="features">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900">Key Features</h2>
          <p className="text-gray-500 mt-2">
            Everything you need to create the perfect resume
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="space-y-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
                {feature.badge}
              </span>
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
