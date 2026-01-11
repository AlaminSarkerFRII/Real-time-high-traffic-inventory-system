import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CreateDrop from "./CreateDrop";
import api, { BACKEND_URL } from "./config/api";
import {
  ShieldLoading,
  TriangleFlagTwoStripes,
  Packages,
  ShoppingBagCheck,
  RefreshCircle,
  XmarkCircleSolid,
  CreditCardSolid,
  TimerSolid,
  ZSquare,
  FingerprintXmarkCircle,
  CheckCircleSolid,
  Plus,
} from "iconoir-react";

// Initialize Socket.io connection using backend URL from environment
const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"],
});

const App = () => {
  const [drops, setDrops] = useState([]);
  const [userId, setUserId] = useState(null)
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});

  const [countdown, setCountdown] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [reservationExpired, setReservationExpired] = useState(false);
  const [reservationExpiryTimer, setReservationExpiryTimer] = useState(null);
  const [showCreateDropModal, setShowCreateDropModal] = useState(false);

  useEffect(() => {
    initializeUser();
    fetchDrops();
    socket.on("connect", () => {
      console.log("Connected to server");
      setSocketConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setSocketConnected(false);
    });

    socket.on("stockUpdate", (data) => {
      console.log("Stock update:", data);
      fetchDrops();
    });

    socket.on("newPurchase", (data) => {
      console.log("New purchase:", data);
      fetchDrops(); // Refresh to update activity feed
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("stockUpdate");
      socket.off("newPurchase");
    };
  }, []);

  // Countdown timer for reservation
  useEffect(() => {
    if (reservation && !reservationExpired) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expiresAt = new Date(reservation.expires_at).getTime();
        const timeLeft = expiresAt - now;

        if (timeLeft <= 0) {
          setReservationExpired(true);
          setCountdown("EXPIRED");
          fetchDrops();
        } else {
          const minutes = Math.floor(timeLeft / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setCountdown(`${minutes}:${seconds.toString().padStart(2, "0")}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [reservation, reservationExpired]);

  // Auto-hide expired reservation after 1 minute
  useEffect(() => {
    if (reservationExpired && reservation) {
      const timer = setTimeout(() => {
        setReservation(null);
        setReservationExpired(false);
        setCountdown(null);
      }, 60000);

      setReservationExpiryTimer(timer);

      return () => {
        clearTimeout(timer);
        setReservationExpiryTimer(null);
      };
    }
  }, [reservationExpired, reservation]);

  const initializeUser = async () => {
    try {
      // Try to create the demo user (it will fail if it already exists, but that's fine)
      const res = await api.post("/api/users", { username: "demo_user" });
      setUserId(res.data.user.id);
      console.log("Demo user created with ID:", res.data.user.id);
    } catch (error) {
      // If user already exists, try to find it by username
      try {
        // Note: This assumes we have a way to get user by username, but for now we'll just use a fallback
        // For this demo, we'll assume the user ID is 1 (which should work after the server creates it)
        setUserId(1);
        console.log("Using existing demo user with ID: 1");
      } catch (findError) {
        console.error("Could not initialize user:", findError);
      }
    }
  };

  const fetchDrops = async () => {
    try {
      const res = await api.get("/api/drops");
      setDrops(res.data);
    } catch (error) {
      console.error("Error fetching drops:", error);
    }
  };

  // Check if reservation expired on mount (in case of page refresh)
  useEffect(() => {
    if (reservation) {
      const now = new Date().getTime();
      const expiresAt = new Date(reservation.expires_at).getTime();
      if (now >= expiresAt) {
        setReservation(null);
        toast.error("Reservation expired!");
      }
    }
  }, []);

  const setLoading = (key, loading) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  };

  const handleReserve = async (dropId) => {
    setLoading(`reserve-${dropId}`, true);
    try {
      const res = await api.post(`/api/reserve/${dropId}`, { userId });
      setReservation(res.data.reservation);
      setReservationExpired(false); // Reset expired state for new reservation
      setCountdown(null); // Reset countdown
      toast.success("Reservation successful!");
      fetchDrops();
    } catch (error) {
      toast.error("Reservation failed: " + error.response?.data?.error);
    } finally {
      setLoading(`reserve-${dropId}`, false);
    }
  };

  const handlePurchase = async () => {
    if (!reservation || reservationExpired) return;
    setLoading("purchase", true);
    try {
      const res = await api.post(`/api/purchase/${reservation.id}`, {
        userId,
      });
      toast.success("Purchase successful!");
      setReservation(null);
      setReservationExpired(false);
      setCountdown(null);
      fetchDrops();
    } catch (error) {
      toast.error("Purchase failed: " + error.response?.data?.error);
    } finally {
      setLoading("purchase", false);
    }
  };

  const handleDropCreated = (newDrop) => {
    fetchDrops(); // Refresh the drops list
    // Toast is already shown in the CreateDrop component
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ------------ Header ------------- */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Real-time Inventory System
            </h1>
            <div className="flex items-center gap-4">
              <select
                value={userId || ""}
                onChange={(e) => setUserId(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Select User"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.username} (ID: {user.id})
                  </option>
                ))}
              </select>
              <button
                onClick={() => setShowCreateDropModal(true)}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                title="Create New Drop"
              >
                <Plus className="w-5 h-5" />
              </button>
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                  socketConnected
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {socketConnected ? (
                  <>
                    <CheckCircleSolid className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <FingerprintXmarkCircle className="w-4 h-4" />
                    Disconnected
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ------------ Reservation Section - Prominently displayed at top when active ------ */}
        {reservation && (
          <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <ZSquare className="w-6 h-6" />
                  Active Reservation
                </h2>
                <p className="text-gray-700 mb-1">
                  <span className="font-semibold">Item:</span> {reservation.drop?.name}
                </p>
                <p className="text-lg font-bold text-red-600 flex items-center gap-2">
                  <TimerSolid className="w-5 h-5" />
                  Time remaining: {countdown}
                </p>
              </div>
              <div className="flex flex-col items-end space-y-3">
                <button
                  onClick={handlePurchase}
                  disabled={loadingStates.purchase || reservationExpired}
                  className={`px-8 py-3 rounded-lg font-bold text-white text-lg transition-all duration-200 transform flex items-center gap-2 ${
                    loadingStates.purchase || reservationExpired
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700 hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loadingStates.purchase ? (
                    <>
                      <RefreshCircle className="w-5 h-5" />
                      Purchasing...
                    </>
                  ) : reservationExpired ? (
                    <>
                      <XmarkCircleSolid className="w-5 h-5" />
                      Expired
                    </>
                  ) : (
                    <>
                      <CreditCardSolid className="w-5 h-5" />
                      Purchase Now
                    </>
                  )}
                </button>
                {reservationExpired && (
                  <p className="text-sm text-red-600 font-medium">
                    Reservation has expired
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ----------- Items Grid ----------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {drops.map((drop) => (
            <div key={drop.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-100 flex flex-col h-full">
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{drop.name}</h3>
                <p className="text-gray-600 mb-3">Price: <span className="font-semibold text-lg">${drop.price}</span></p>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Available Stock:</span>
                    <span className={`text-lg font-bold ${
                      drop.availableStock > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {drop.availableStock}/{drop.totalStock}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(drop.availableStock / drop.totalStock) * 100}%` }}
                    ></div>
                  </div>
                </div>

                {/* ------------ Activity Feed ----------- */}
                {drop.recentPurchases && drop.recentPurchases.length > 0 && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <ShoppingBagCheck className="w-4 h-4" />
                      Recent Purchases:
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 max-h-20 overflow-y-auto">
                      {drop.recentPurchases.slice(0, 3).map((purchase, index) => (
                        <li key={index} className="flex justify-between text-xs">
                          <span className="font-medium">{purchase.username}</span>
                          <span className="text-gray-500">
                            {new Date(purchase.timestamp).toLocaleTimeString()}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Reserve Button - Always at bottom */}
              <div className="mt-auto">
                {drop.availableStock > 0 && (
                  <button
                    onClick={() => handleReserve(drop.id)}
                    disabled={loadingStates[`reserve-${drop.id}`] || !userId}
                    className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-200 transform flex items-center justify-center gap-2 ${
                      loadingStates[`reserve-${drop.id}`] || !userId
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-md hover:shadow-lg"
                    }`}
                  >
                    {loadingStates[`reserve-${drop.id}`] ? (
                      <>
                        <ShieldLoading className="w-5 h-5" />
                        Reserving...
                      </>
                    ) : !userId ? (
                      <>
                        <RefreshCircle className="w-5 h-5" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <TriangleFlagTwoStripes className="w-5 h-5" />
                        Reserve
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ----------- Empty State --------- */}
        {drops.length === 0 && (
          <div className="text-center py-12">
            <Packages className="w-24 h-24 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No items available</h3>
            <p className="text-gray-500">Check back later for new inventory drops!</p>
          </div>
        )}
      </div>

      {/* ------------ Create Drop Modal ---------- */}
      <CreateDrop
        isOpen={showCreateDropModal}
        onClose={() => setShowCreateDropModal(false)}
        onDropCreated={handleDropCreated}
      />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default App;
