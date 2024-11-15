export default function Landing() {
  return (
    <div className="min-h-screen bg-white text-black font-mono">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-4 bg-black text-white">
        <div className="text-lg tracking-wide">INTERNET NATIVE COMPANY</div>
        <button className="bg-[#3D4E81] w-[240px] px-4 py-4 rounded text-white text-sm tracking-wide text-left">
          <div className="py-4">c</div>
          LOGIN
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto mt-8 px-8">
        {/* Stats Section */}
        <div className="flex justify-end px-8 py-4 space-x-12 text-sm">
          <div>
            <div className="text-gray-500 mb-1">COMPANIES</div>
            <div className="text-gray-500 mb-1">TRANSACTIONS</div>
            <div className="text-gray-500 mb-1">MARKET CAP</div>
            <div className="text-gray-500 mb-1">STATUS</div>
          </div>
          <div>
            <div className="mb-1">324</div>
            <div className="mb-1">32M</div>
            <div className="mb-1">$123.78B</div>
            <div className="mb-1">ACTIVE</div>
          </div>
        </div>

        <h1 className="text-4xl font-normal mb-12 mt-32 ">
          Set up an Internet-Native Company
        </h1>

        {/* Registration Form */}
        <div className="flex gap-4 mb-32">
          <input
            type="text"
            placeholder="Type the company name you want"
            className="flex-1 bg-gray-100 rounded px-4 py-4 text-gray-800 placeholder-gray-400"
          />
          <button className="bg-[#3D4E81] px-8 py-2 rounded text-white">
            REGISTER
          </button>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Tabs */}
          <div className="flex gap-12 mb-8">
            {["WHAT IS IT", "WHO IS FOR", "TECH", "LEGAL", "WHITEPAPER"].map(
              (tab) => (
                <button
                  key={tab}
                  className="text-sm tracking-wide hover:text-blue-600 transition-colors"
                >
                  {tab}
                </button>
              )
            )}
          </div>

          {/* Content */}
          <div className="space-y-6 text-gray-600">
            <p>
              Businesses are inherently global and shouldn&apos;t be restricted
              by national borders. Traditional, jurisdiction-bound models can
              hinder their ability to operate seamlessly worldwide. A
              jurisdiction-less, internet-native company structure offers a
              platform that aligns with the borderless nature of modern digital
              enterprises.
            </p>
            <p>
              INC embodies this concept by registering companies on the Solana
              blockchain, effectively existing within the Internet itself. It
              provides essential business services permissionlessly: a
              registered company name, a wallet serving as a bank account, a
              payment system, and a governance system. This allows businesses to
              operate globally without relying on traditional legal and
              financial frameworks.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
