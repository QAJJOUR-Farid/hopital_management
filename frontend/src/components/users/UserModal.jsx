import React, { useState, useEffect } from "react";

export default function UserModal({ isOpen, onClose, onSubmit, userData }) {
  const initialUser = { CIN: "", nom: "", prenom: "", email: "", password: "" };
  const [user, setUser] = useState(initialUser);

  // Mettre à jour l'état uniquement quand le modal s'ouvre ET que userData change
  useEffect(() => {
    if (!isOpen) return;
    // Utiliser un micro-task pour éviter le rendu en cascade
    const timer = setTimeout(() => {
      setUser(userData ?? initialUser);
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, userData]);

  const handleChange = (e) =>
    setUser((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(user);
    if (!userData) setUser(initialUser); // reset si ajout
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {userData ? "Modifier Utilisateur" : "Ajouter Utilisateur"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-xl"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["CIN", "nom", "prenom", "email", "password"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm font-medium text-gray-700">
                {field.toUpperCase()}
              </label>
              <input
                type={field === "password" ? "password" : "text"}
                name={field}
                value={user[field]}
                onChange={handleChange}
                className="mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                required
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-2 rounded-lg shadow-lg hover:scale-105 transform transition duration-300"
          >
            {userData ? "Modifier" : "Ajouter"}
          </button>
        </form>
      </div>
    </div>
  );
}
