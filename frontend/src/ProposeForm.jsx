import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ProposeForm() {
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const [taskDescription, setTaskDescription] = useState("");
  const [coins, setCoins] = useState("");
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!taskDescription || !coins) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/proposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId,
          taskDescription,
          coins,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send proposal");
      }

      alert("Proposal sent successfully!");
      navigate("/home");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        color: "#f8fafc",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Home button */}
      <div
        style={{
          marginBottom: "1.5rem",
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <button
          onClick={() => navigate("/home")}
          style={{
            background: "#1e293b",
            border: "none",
            color: "#facc15",
            padding: "0.7rem 1.2rem",
            fontSize: "1rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
           Home
        </button>
      </div>

      <div
        style={{
          maxWidth: "600px",
          margin: "2rem auto",
          backgroundColor: "#1e293b",
          padding: "2rem",
          borderRadius: "1rem",
          boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            fontSize: "1.8rem",
            color: "#facc15",
          }}
        >
           Send a Proposal
        </h2>

        {error && (
          <p
            style={{
              color: "#ef4444",
              backgroundColor: "#1e1b4b",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ marginBottom: "1rem", fontWeight: "bold" }}>
            Task Description:
            <textarea
              rows="4"
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              required
              placeholder="Describe the task..."
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "none",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
              }}
            />
          </label>

          <label style={{ marginBottom: "1.5rem", fontWeight: "bold" }}>
            Minits Offered:
            <input
              type="number"
              value={coins}
              onChange={(e) => setCoins(e.target.value)}
              required
              placeholder="Enter number of minits"
              style={{
                marginTop: "0.5rem",
                width: "100%",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "none",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
              }}
            />
          </label>

          <button
            type="submit"
            style={{
              backgroundColor: "#facc15",
              color: "#1e293b",
              fontWeight: "bold",
              padding: "0.75rem 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
              transition: "background 0.3s",
            }}
          >
             Submit Proposal
          </button>
        </form>
      </div>
    </div>
  );
}
