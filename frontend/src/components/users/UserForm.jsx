import React, { useState, useEffect } from "react";
import { createUser, updateUser } from "../../Services/api";

export default function UserForm({ user, onSuccess }) {
  const [form, setForm] = useState({
    CIN: "",
    nom: "",
    prenom: "",
    date_naissance: "",
    email: "",
    password: "",
    gender: "M",
    adresse: "",
    num_tel: "",
    poids: "",
    height: "",
    id_rec: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        CIN: user.CIN || "",
        nom: user.nom || "",
        prenom: user.prenom || "",
        date_naissance: user.date_naissance || "",
        email: user.email || "",
        password: "", // on ne pré-remplit jamais le mot de passe
        gender: user.gender || "M",
        adresse: user.adresse || "",
        num_tel: user.num_tel || "",
        poids: user.poids || "",
        height: user.height || "",
        id_rec: user.id_rec || "",
      });
    }
  }, [user]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user) await updateUser(user.id, form);
      else await createUser(form);
      onSuccess();
    } catch (err) {
      console.error("Erreur API :", err.response || err);
      if (err.response?.data?.errors) {
        const errors = Object.values(err.response.data.errors).flat();
        alert(errors.join("\n"));
      } else {
        alert("Erreur : " + (err.response?.data?.message || err.message));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input name="CIN" value={form.CIN} onChange={handleChange} placeholder="CIN" required />
      <input name="nom" value={form.nom} onChange={handleChange} placeholder="Nom" required />
      <input name="prenom" value={form.prenom} onChange={handleChange} placeholder="Prénom" required />
      <input name="date_naissance" type="date" value={form.date_naissance} onChange={handleChange} required />
      <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      {!user && <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mot de passe" required />}
      <select name="gender" value={form.gender} onChange={handleChange} required>
        <option value="M">Homme</option>
        <option value="F">Femme</option>
      </select>
      <input name="adresse" value={form.adresse} onChange={handleChange} placeholder="Adresse" />
      <input name="num_tel" value={form.num_tel} onChange={handleChange} placeholder="Téléphone" />
      <input name="poids" type="number" value={form.poids} onChange={handleChange} placeholder="Poids (kg)" />
      <input name="height" type="number" value={form.height} onChange={handleChange} placeholder="Taille (cm)" />
      <input name="id_rec" type="number" value={form.id_rec} onChange={handleChange} placeholder="ID Receptionniste" />
      <button type="submit" disabled={saving}>
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  );
}
