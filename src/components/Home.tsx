import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

const Home: React.FC = () => {
  const { token } = useContext(AuthContext);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-linear-to-br from-blue-50 to-indigo-100 text-center">
    

      {/* Floating gradient blobs (decorative) */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />

      <div className="z-10 mt-32 px-6">
        <h1 className="text-6xl md:text-7xl font-extrabold text-gray-800 mb-4 tracking-tight">
          Surreal
        </h1>

        <p className="text-lg md:text-xl text-gray-700 mb-10">
          Helping you build{" "}
          <span className="font-semibold text-blue-600">real</span> connections
          at Surrey
        </p>

        {!token && (
          <Link to="/signup">
            <button className="px-8 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 hover:scale-105 transform transition duration-300 ease-out">
              Get Started
            </button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
