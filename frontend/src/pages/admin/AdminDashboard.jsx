const AdminDashboard = () => (
  <div>
    <h1 className="text-3xl font-bold">Admin Dashboard</h1>

    <p className="text-slate-600 mt-2">
      Bus operations and management overview.
    </p>

    <div className="grid md:grid-cols-3 gap-5 mt-8">
      {["Total Buses", "Total Trips", "Total Bookings"].map((item) => (
        <div key={item} className="bg-white p-6 rounded-xl shadow-sm">
          <p className="text-slate-500">{item}</p>
          <h2 className="text-3xl font-bold mt-3">--</h2>
        </div>
      ))}
    </div>
  </div>
);

export default AdminDashboard;