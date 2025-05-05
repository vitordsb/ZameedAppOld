const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How DesignConnect Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Step 1 */}
          <div className="text-center">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-3xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Browse Portfolios</h3>
            <p className="text-gray-600">Explore our curated collection of interior designers and architects. Filter by style, price range, and location to find your perfect match.</p>
          </div>
          
          {/* Step 2 */}
          <div className="text-center">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-3xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Connect Directly</h3>
            <p className="text-gray-600">Contact designers directly through our platform. Discuss your vision, requirements, and expectations without intermediaries.</p>
          </div>
          
          {/* Step 3 */}
          <div className="text-center">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <span className="text-primary text-3xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-4">Collaborate & Create</h3>
            <p className="text-gray-600">Work together to bring your design dreams to life. Manage projects, share ideas, and track progress all in one place.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
