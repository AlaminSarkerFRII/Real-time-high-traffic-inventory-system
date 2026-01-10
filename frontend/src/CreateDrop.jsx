import { useState, useEffect } from "react";
import axios from "axios";
import {
  X,
  Packages,
  PackageLock,
  Hashtag,
  CalendarCheck,
  RefreshCircleSolid,
  SineWave,
  ShieldAlert,
  CheckCircleSolid,
  Dollar,
} from "iconoir-react";

const CreateDrop = ({ isOpen, onClose, onDropCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    totalStock: "",
    dropStartTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [existingDrops, setExistingDrops] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchExistingDrops();
    }
  }, [isOpen]);

  const fetchExistingDrops = async () => {
    try {
      const res = await axios.get("/api/drops");
      setExistingDrops(res.data);
    } catch (error) {
      console.error("Error fetching drops:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      showToast("Drop name is required", "error");
      return;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      showToast("Valid price is required", "error");
      return;
    }
    if (!formData.totalStock || isNaN(formData.totalStock) || parseInt(formData.totalStock) <= 0) {
      showToast("Valid total stock is required", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        totalStock: parseInt(formData.totalStock),
        dropStartTime: formData.dropStartTime ? new Date(formData.dropStartTime).toISOString() : undefined,
      };

      const res = await axios.post("/api/drops", payload);

      showToast("Drop created successfully!", "success");

      // Reset form
      setFormData({
        name: "",
        price: "",
        totalStock: "",
        dropStartTime: "",
      });

      // Refresh existing drops
      fetchExistingDrops();

      // Notify parent component
      if (onDropCreated) {
        onDropCreated(res.data.drop);
      }

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);

    } catch (error) {
      showToast("Failed to create drop: " + (error.response?.data?.error || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Packages className="w-8 h-8 text-blue-600" />
            Create New Drop
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Form Section */}
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  Drop Name *
                </label>
                <div className="relative">
                  <PackageLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Enter drop name"
                    required
                  />
                </div>
              </div>

              {/* Price Field */}
              <div>
                <label htmlFor="price" className="block text-sm font-semibold text-gray-700 mb-2">
                  Price ($) *
                </label>
                <div className="relative">
                  <Dollar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              {/* Stock Field */}
              <div>
                <label htmlFor="totalStock" className="block text-sm font-semibold text-gray-700 mb-2">
                  Total Stock *
                </label>
                <div className="relative">
                  <Hashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    id="totalStock"
                    name="totalStock"
                    value={formData.totalStock}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="100"
                    min="1"
                    required
                  />
                </div>
              </div>

              {/* Start Time Field */}
              <div>
                <label htmlFor="dropStartTime" className="block text-sm font-semibold text-gray-700 mb-2">
                  Drop Start Time (Optional)
                </label>
                <div className="relative">
                  <CalendarCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    id="dropStartTime"
                    name="dropStartTime"
                    value={formData.dropStartTime}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to start immediately
                </p>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white text-lg transition-all duration-200 transform flex items-center justify-center gap-3 ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {loading ? (
                    <>
                      <RefreshCircleSolid className="w-5 h-5 animate-spin" />
                      Creating Drop...
                    </>
                  ) : (
                    <>
                      <SineWave className="w-5 h-5" />
                      Create Drop
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Existing Drops Sidebar */}
          <div className="w-96 border-l border-gray-200 bg-gray-50 p-6 overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <PackageLock className="w-5 h-5" />
              Existing Drops ({existingDrops.length})
            </h3>

            {existingDrops.length === 0 ? (
              <div className="text-center py-8">
                <Packages className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-500 text-sm">No drops created yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {existingDrops.map((drop) => (
                  <div key={drop.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-1">{drop.name}</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Price: <span className="font-medium">${drop.price}</span></p>
                      <p>Stock: <span className="font-medium">{drop.availableStock}/{drop.totalStock}</span></p>
                      <p className="text-xs text-gray-500">
                        Started: {formatDate(drop.drop_start_time)}
                      </p>
                    </div>
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Availability:</span>
                        <span className={`text-xs font-bold ${
                          drop.availableStock > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {drop.availableStock > 0 ? 'Available' : 'Sold Out'}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            drop.availableStock > 0 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(drop.availableStock / drop.totalStock) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-6 py-3 rounded-lg shadow-xl text-white z-50 text-sm font-medium flex items-center gap-2 ${
            toast.type === "error" ? "bg-red-500" : "bg-green-500"
          }`}
        >
          {toast.type === "error" ? (
            <ShieldAlert className="w-4 h-4" />
          ) : (
            <CheckCircleSolid className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default CreateDrop;
