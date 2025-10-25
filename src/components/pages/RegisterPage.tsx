import { Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Register / Login</h1>
      <div className="flex gap-4">
        <Link to="/signup">
        <button className="px-4 py-2 bg-blue-600 text-white rounded">
          Sign Up
        </button>
        </Link>
        <button className="px-4 py-2 bg-gray-600 text-white rounded">
          Login
        </button>
      </div>
      <Link to="/" className="mt-4 text-blue-500 underline">
        Back to Home
      </Link>
    </div>
  );
};

export default RegisterPage;
