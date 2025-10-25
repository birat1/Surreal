import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="bg-blue-100 min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">Welcome to Group17 Project</h1>
      <p className="text-lg mb-6">Best group fr</p>

      <div>
        <Link to="/register">
          <button className="px-6 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 transition">
            Get Started
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
