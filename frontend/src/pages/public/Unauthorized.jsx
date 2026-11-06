import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-5">

      <h1 className="text-6xl font-bold text-red-600">
        403
      </h1>

      <h2 className="text-2xl font-bold mt-4">
        Access Denied
      </h2>

      <p className="text-slate-600 mt-3 text-center">
        You do not have permission to access this page.
      </p>

      <Link
        to="/"
        className="mt-6 bg-blue-700 text-white px-6 py-3 rounded-lg"
      >
        Return Home
      </Link>

    </div>
  );
};

export default Unauthorized;