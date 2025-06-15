import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Proposals() {
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/proposals", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setProposals(data);
      } catch (err) {
        console.error("Error fetching proposals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [token]);

  const handleDecision = async (id, decision) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/proposals/${id}/${decision}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Something went wrong");
      }

      alert(`Proposal ${decision}ed!`);

      const updatedProposals = await fetch("http://localhost:5000/api/proposals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => res.json());
      setProposals(updatedProposals);
    } catch (err) {
      console.error(`Error ${decision}ing proposal:`, err);
      alert(err.message);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "#f8fafc",
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
          🏠 Home
        </button>
      </div>

      <h2
        style={{
          color: "#facc15",
          marginBottom: "2rem",
          fontSize: "2rem",
          textAlign: "center",
        }}
      >
        📩 Incoming Proposals
      </h2>

      {loading ? (
        <p style={{ color: "#94a3b8", textAlign: "center" }}>Loading proposals...</p>
      ) : proposals.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center" }}>No proposals yet.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            maxWidth: "700px",
            margin: "0 auto",
          }}
        >
          {proposals.map((proposal) => (
            <div
              key={proposal._id}
              style={{
                backgroundColor: "#1e293b",
                padding: "1.5rem",
                borderRadius: "1rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.01)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <h4 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                <span style={{ color: "#facc15" }}>From:</span>{" "}
                {proposal.sender?.username || "Unknown"}
              </h4>
              <p>
                <strong>📝 Task:</strong> {proposal.taskDescription}
              </p>
              <p>
                <strong>⏳ Minits Offered:</strong> {proposal.coins}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                <span
                  style={{
                    color:
                      proposal.status === "accepted"
                        ? "#22c55e"
                        : proposal.status === "rejected"
                        ? "#ef4444"
                        : "#facc15",
                    fontWeight: "bold",
                  }}
                >
                  {proposal.status}
                </span>
              </p>

              {proposal.status === "pending" && (
                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                  <button
                    onClick={() => handleDecision(proposal._id, "accept")}
                    style={{
                      padding: "0.6rem 1.2rem",
                      backgroundColor: "#22c55e",
                      border: "none",
                      color: "#fff",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    ✅ Accept
                  </button>
                  <button
                    onClick={() => handleDecision(proposal._id, "reject")}
                    style={{
                      padding: "0.6rem 1.2rem",
                      backgroundColor: "#ef4444",
                      border: "none",
                      color: "#fff",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
