import React from "react";

export default function UsersTable({ users, onEdit, onDelete, onToggleState }) {
  return (
    <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gradient-to-r from-blue-600 to-teal-500 text-white">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium uppercase">CIN</th>
            <th className="px-6 py-3 text-left text-sm font-medium uppercase">Nom</th>
            <th className="px-6 py-3 text-left text-sm font-medium uppercase">Prénom</th>
            <th className="px-6 py-3 text-left text-sm font-medium uppercase">Email</th>
            <th className="px-6 py-3 text-left text-sm font-medium uppercase">État</th>
            <th className="px-6 py-3 text-center text-sm font-medium uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.CIN} className="hover:bg-gray-50 transition duration-200">
              <td className="px-6 py-4 font-medium">{user.CIN}</td>
              <td className="px-6 py-4">{user.nom}</td>
              <td className="px-6 py-4">{user.prenom}</td>
              <td className="px-6 py-4">{user.email}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${
                    user.etat === "actif" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {user.etat}
                </span>
              </td>
              <td className="px-6 py-4 flex justify-center gap-2">
                <button
                  onClick={() => onEdit(user)}
                  className="bg-blue-500 text-white px-4 py-1 rounded-lg shadow hover:bg-blue-600 hover:scale-105 transform transition duration-300"
                >
                  Modifier
                </button>
                <button
                  onClick={() => onDelete(user.CIN)}
                  className="bg-red-500 text-white px-4 py-1 rounded-lg shadow hover:bg-red-600 hover:scale-105 transform transition duration-300"
                >
                  Supprimer
                </button>
                <button
                  onClick={() => onToggleState(user.CIN)}
                  className="bg-yellow-500 text-white px-4 py-1 rounded-lg shadow hover:bg-yellow-600 hover:scale-105 transform transition duration-300"
                >
                  Toggle État
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
