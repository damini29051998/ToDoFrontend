import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [orders, setOrders] = useState([]);
  const [editingPriorityId, setEditingPriorityId] = useState(null);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [newPriority, setNewPriority] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const API_BASE = "https://todobackend-vfbf.onrender.com";

  const fetchOrders = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Error fetching orders:", err);
    }
  };

  useEffect(() => {
    if (token) fetchOrders(token);
  }, [token]);

  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    setOrders([]);
  };

  const addOrder = async (
    productName,
    quantity,
    priority = "low",
    message = ""
  ) => {
    try {
      const response = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productName, quantity, priority, message }),
      });
      const newOrder = await response.json();
      setOrders([...orders, newOrder]);
    } catch (err) {
      console.error("Error adding order:", err);
    }
  };

  const deleteOrder = async (id) => {
    try {
      await fetch(`${API_BASE}/orders/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(orders.filter((order) => order._id !== id));
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  const updatePriority = async (id) => {
    try {
      await fetch(`${API_BASE}/orders/${id}/priority`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, priority: newPriority } : order
        )
      );
      setEditingPriorityId(null);
      setNewPriority("");
    } catch (err) {
      console.error("Error updating priority:", err);
    }
  };

  const updateMessage = async (id) => {
    try {
      await fetch(`${API_BASE}/orders/${id}/message`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newMessage }),
      });
      setOrders((prev) =>
        prev.map((order) =>
          order._id === id ? { ...order, message: newMessage } : order
        )
      );
      setEditingMessageId(null);
      setNewMessage("");
    } catch (err) {
      console.error("Error updating message:", err);
    }
  };

  const MainApp = () => (
    <div className="min-h-screen bg-orange-50 flex flex-col">
      <nav className="bg-orange-500 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <span className="font-bold text-xl">Order Portal</span>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-full shadow transition-colors duration-200"
        >
          Logout
        </button>
      </nav>

      <main className="flex-1 p-8">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-orange-600 drop-shadow">
          Submit New Order
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const productName = e.target.productName.value.trim();
            const quantity = parseInt(e.target.quantity.value);
            const priority = e.target.priority.value;
            const message = e.target.message.value.trim();

            if (productName && quantity > 0) {
              addOrder(productName, quantity, priority, message);
              e.target.reset();
            }
          }}
          className="mb-6 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4"
        >
          <div className="flex flex-col">
            <label className="font-medium mb-1">Product Name</label>
            <input
              name="productName"
              type="text"
              className="p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Quantity</label>
            <input
              name="quantity"
              type="number"
              min="1"
              className="p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              required
            />
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Priority</label>
            <select
              name="priority"
              className="p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
              defaultValue="low"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="flex flex-col">
            <label className="font-medium mb-1">Message (optional)</label>
            <textarea
              name="message"
              rows="3"
              className="p-3 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg transition"
          >
            Submit Order
          </button>
        </form>

        {/* Orders List */}
        <div className="max-w-4xl mx-auto mt-10">
          <h2 className="text-2xl font-bold mb-4 text-orange-700">
            Order List
          </h2>
          {orders.length === 0 ? (
            <p className="text-gray-600">No orders yet.</p>
          ) : (
            <ul className="space-y-4">
              {orders.map((order) => (
                <li
                  key={order._id}
                  className="p-4 bg-white rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-orange-100"
                >
                  <div className="flex-1">
                    <p className="text-lg font-semibold text-orange-800">
                      {order.productName} ({order.quantity})
                    </p>
                    <div className="text-sm text-gray-700 space-y-1">
                      {editingPriorityId === order._id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newPriority}
                            onChange={(e) => setNewPriority(e.target.value)}
                            className="p-2 border border-gray-300 rounded"
                          >
                            <option value="">Select</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                          </select>
                          <button
                            onClick={() => updatePriority(order._id)}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingPriorityId(null)}
                            className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          Priority: {order.priority}{" "}
                          <button
                            onClick={() => {
                              setEditingPriorityId(order._id);
                              setNewPriority(order.priority);
                            }}
                            className="text-blue-500 ml-2 underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}

                      {editingMessageId === order._id ? (
                        <div className="flex flex-col gap-2 mt-2">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            rows={2}
                            className="p-2 border border-gray-300 rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => updateMessage(order._id)}
                              className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMessageId(null)}
                              className="px-2 py-1 bg-gray-400 text-white rounded hover:bg-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          Message: {order.message || "—"}{" "}
                          <button
                            onClick={() => {
                              setEditingMessageId(order._id);
                              setNewMessage(order.message || "");
                            }}
                            className="text-blue-500 ml-2 underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="px-4 py-2 bg-red-500 hover:bg-red-700 text-white font-semibold rounded-lg"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="bg-orange-500 text-white p-4 mt-auto text-center shadow-inner">
        © 2025 Order Portal
      </footer>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setToken={setToken} />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={token ? <MainApp /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Router>
  );
}

export default App;
