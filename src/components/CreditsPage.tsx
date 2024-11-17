import { useApp } from '../contexts/AppContext';

export function CreditsPage() {
  const { credits } = useApp();
  
  // Mock credit packages
  const creditPackages = [
    { id: 1, credits: 10, price: 25, popular: false },
    { id: 2, credits: 25, price: 50, popular: true },
    { id: 3, credits: 50, price: 90, popular: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Credits</h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow">
          <span className="text-gray-600">Available Credits:</span>
          <span className="ml-2 font-bold text-blue-600">{credits}</span>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creditPackages.map((pkg) => (
          <div
            key={pkg.id}
            className={`bg-white rounded-lg shadow-lg overflow-hidden ${
              pkg.popular ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            {pkg.popular && (
              <div className="bg-blue-500 text-white text-center py-1 text-sm">
                Most Popular
              </div>
            )}
            <div className="p-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold">{pkg.credits} Credits</h3>
                <p className="text-gray-600 mt-1">${pkg.price}</p>
                <p className="text-sm text-gray-500 mt-2">
                  ${(pkg.price / pkg.credits).toFixed(2)} per credit
                </p>
              </div>
              <button
                className="w-full mt-6 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={() => console.log(`Purchasing ${pkg.credits} credits`)}
              >
                Purchase
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 