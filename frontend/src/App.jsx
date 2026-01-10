import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const App = () => {
  const [drops, setDrops] = useState([]);
  const [userId, setUserId] = useState(1); // Mock user ID (integer)
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loadingStates, setLoadingStates] = useState({});
  const [toast, setToast] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [reservationExpired, setReservationExpired] = useState(false);

  useEffect(() => {
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
          // Don't show error toast here - let purchase handle it
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

  const fetchDrops = async () => {
    try {
      const res = await axios.get("/api/drops");
      setDrops(res.data);
    } catch (error) {
      console.error("Error fetching drops:", error);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Check if reservation expired on mount (in case of page refresh)
  useEffect(() => {
    if (reservation) {
      const now = new Date().getTime();
      const expiresAt = new Date(reservation.expires_at).getTime();
      if (now >= expiresAt) {
        setReservation(null);
        showToast("Reservation expired!", "error");
      }
    }
  }, []);

  const setLoading = (key, loading) => {
    setLoadingStates((prev) => ({ ...prev, [key]: loading }));
  };

  const handleReserve = async (dropId) => {
    setLoading(`reserve-${dropId}`, true);
    try {
      const res = await axios.post(`/api/reserve/${dropId}`, { userId });
      setReservation(res.data.reservation);
      setReservationExpired(false); // Reset expired state for new reservation
      setCountdown(null); // Reset countdown
      showToast("Reservation successful!", "success");
      fetchDrops();
    } catch (error) {
      showToast("Reservation failed: " + error.response?.data?.error, "error");
    } finally {
      setLoading(`reserve-${dropId}`, false);
    }
  };

  const handlePurchase = async () => {
    if (!reservation || reservationExpired) return;
    setLoading("purchase", true);
    try {
      const res = await axios.post(`/api/purchase/${reservation.id}`, {
        userId,
      });
      showToast("Purchase successful!", "success");
      setReservation(null);
      setReservationExpired(false);
      setCountdown(null);
      fetchDrops();
    } catch (error) {
      showToast("Purchase failed: " + error.response?.data?.error, "error");
    } finally {
      setLoading("purchase", false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto mb-4 flex justify-between items-center">
        <div
          className={`px-2 py-1 rounded text-sm font-medium ${
            socketConnected
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {socketConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </div>
      </div>
      <h1 className="text-3xl font-bold text-center mb-8">
        Real-time Inventory System
      </h1>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {drops.map((drop) => (
            <div key={drop.id} className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-xl font-semibold mb-2">{drop.name}</h2>
              <p className="text-gray-600 mb-2">Price: ${drop.price}</p>
              <p className="text-lg font-bold text-green-600 mb-2">
                Available Stock: {drop.availableStock}/{drop.totalStock}
              </p>

              {/* Activity Feed */}
              {drop.recentPurchases && drop.recentPurchases.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Recent Purchases:
                  </h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {drop.recentPurchases.slice(0, 3).map((purchase, index) => (
                      <li key={index} className="flex justify-between">
                        <span>{purchase.username}</span>
                        <span>
                          {new Date(purchase.timestamp).toLocaleTimeString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {drop.availableStock > 0 && (
                <button
                  onClick={() => handleReserve(drop.id)}
                  disabled={loadingStates[`reserve-${drop.id}`]}
                  className={`w-full py-2 px-4 rounded font-bold text-white ${
                    loadingStates[`reserve-${drop.id}`]
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-700"
                  }`}
                >
                  {loadingStates[`reserve-${drop.id}`]
                    ? "Reserving..."
                    : "Reserve"}
                </button>
              )}
            </div>
          ))}
        </div>

        {reservation && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Your Reservation</h2>
            <p>Drop: {reservation.drop?.name}</p>
            <p className="text-red-600 font-bold">
              Time remaining: {countdown}
            </p>
            <button
              onClick={handlePurchase}
              disabled={loadingStates.purchase || reservationExpired}
              className={`mt-4 py-2 px-4 rounded font-bold text-white ${
                loadingStates.purchase || reservationExpired
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-700"
              }`}
            >
              {loadingStates.purchase
                ? "Purchasing..."
                : reservationExpired
                ? "Reservation Expired"
                : "Purchase Now"}
            </button>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 px-4 py-2 rounded shadow-lg text-white z-50 ${
              toast.type === "error" ? "bg-red-500" : "bg-green-500"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
