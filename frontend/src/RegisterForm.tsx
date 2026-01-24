
import React, { useState } from "react";
import { registerUser } from "./api";

type User = {
  id: number;
  _id?: string;
  name: string;
  email: string;
  type: string;
  subscribed: boolean;
  campus: string;
};

interface RegisterFormProps {
  onRegisterSuccess: (user: User) => void;
  onShowLogin: () => void;
  onClose: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  onRegisterSuccess,
  onShowLogin,
  onClose,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [campus, setCampus] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [accountType, setAccountType] = useState<"buyer" | "seller">("buyer");

  const campuses = [
    { id: "pretoria-main", name: "Pretoria Central" },
    { id: "soshanguve-S", name: "Soshanguve South" },
    { id: "soshanguve-N", name: "Soshanguve North" },
    { id: "ga-rankuwa", name: "Ga-Rankuwa" },
    { id: "pretoria-west", name: "Pretoria Arcadia" },
    { id: "arts", name: "Arts" },
    { id: "emalahleni", name: "eMalahleni" },
    { id: "mbombela", name: "Mbombela" },
    { id: "polokwane", name: "Polokwane" },
  ];

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !campus) {
      alert("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await registerUser({
        name,
        email,
        password,
        campus,
        whatsapp,
        type: accountType,
      });

      onRegisterSuccess(response.user);

      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setCampus("");
      setWhatsapp("");

      setTimeout(() => {
        alert(`Welcome to FYC Marketplace, ${response.user.name}!`);
      }, 100);
    } catch (error) {
      let errorMessage = "Registration failed. Please try again.";
      if (error && typeof error === "object" && "message" in error) {
        errorMessage = (error as { message: string }).message;
      }
      alert(errorMessage);
    }
  };

  const handleSwitchToLogin = () => {
    onClose();
    onShowLogin();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          Register for FYC Marketplace
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleRegister();
          }}
          className="space-y-4"
        >
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password (min 8 characters)"
            className="w-full p-3 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className={`w-full p-3 border rounded ${
              confirmPassword
                ? password !== confirmPassword
                  ? "border-red-500"
                  : "border-green-500"
                : ""
            }`}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium mb-2">
              Account Type
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={accountType === "buyer"}
                  onChange={() => setAccountType("buyer")}
                />
                Buyer
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={accountType === "seller"}
                  onChange={() => setAccountType("seller")}
                />
                Seller
              </label>
            </div>
          </div>

          <select
            className="w-full p-3 border rounded"
            value={campus}
            onChange={(e) => setCampus(e.target.value)}
          >
            <option value="">Select Your Location</option>
            {campuses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="tel"
            placeholder="WhatsApp (+27...)"
            className="w-full p-3 border rounded"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white p-3 rounded hover:bg-orange-700"
            >
              Register
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 p-3 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={handleSwitchToLogin}
              className="text-blue-600 hover:underline"
            >
              Login here
            </button>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
