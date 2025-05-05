const Testimonials = () => {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Homeowner",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      quote: "DesignConnect made finding the perfect designer for our home renovation so simple. We were able to compare portfolios and choose someone whose style matched exactly what we wanted."
    },
    {
      name: "Michael Chen",
      role: "Interior Designer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      quote: "As a designer, this platform has been a game-changer for my business. I've connected with clients I never would have found otherwise, and the project management tools make collaboration seamless."
    },
    {
      name: "Rebecca Martinez",
      role: "Small Business Owner",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80",
      quote: "The transparent pricing on DesignConnect helped me find a designer within my budget for my new office space. The results exceeded my expectations, and the process was stress-free."
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Our Users Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg">
              <div className="flex items-center mb-4">
                <img src={testimonial.image} alt={`${testimonial.name} profile`} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">{testimonial.quote}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
