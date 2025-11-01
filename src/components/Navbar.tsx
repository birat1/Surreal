import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import surreyLogo2 from "../assets/surrey_logo.jpg";

const Navbar: React.FC = () => {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white/70 backdrop-blur-md shadow-md z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link
          className="text-2xl font-extrabold text-blue-600 hover:text-blue-700 transition"
          to="/"
        >
          <img
            src={surreyLogo2}
            alt="University of Surrey logo"
            className="h-10 w-auto hover:opacity-90 transition"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link className="hover:text-gray-950" to="/login">
            Sign In
          </Link>

          <Link to="/signup">
            <Button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-sm hover:shadow-lg cursor-pointer">
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
