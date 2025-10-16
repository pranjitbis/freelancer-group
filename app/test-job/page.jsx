"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TestJobPage() {
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [jobId, setJobId] = useState("1"); // Default to test with job ID 1
  const router = useRouter();

  useEffect(() => {
    fetchJobData();
  }, []);

  const fetchJobData = async (testJobId = null) => {
    try {
      setLoading(true);
      setError("");

      const idToTest = testJobId || jobId;
      console.log("🔄 Testing job ID:", idToTest);

      const response = await fetch(`/api/jobs/${idToTest}`);
      console.log("📡 API Response status:", response.status);

      const data = await response.json();
      console.log("📦 API Response data:", data);

      if (response.ok && data.success) {
        setJobData(data.job);
      } else {
        setError(data.error || "Failed to fetch job");
      }
    } catch (err) {
      console.error("❌ Test error:", err);
      setError("Network error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const testWithId = (id) => {
    setJobId(id);
    fetchJobData(id);
  };

  const testSampleJobs = () => {
    const sampleIds = [1, 2, 3, 4, 5];
    sampleIds.forEach((id, index) => {
      setTimeout(() => {
        console.log(`Testing job ID: ${id}`);
        fetchJobData(id.toString());
      }, index * 1000);
    });
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🧪 Job Data Test Page</h1>

      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
        }}
      >
        <h3>Test Controls</h3>
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            type="text"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            placeholder="Enter Job ID"
            style={{
              padding: "8px",
              borderRadius: "4px",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => fetchJobData()}
            style={{
              padding: "8px 16px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Test This ID
          </button>
          <button
            onClick={testSampleJobs}
            style={{
              padding: "8px 16px",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Test Sample IDs (1-5)
          </button>
          <button
            onClick={() => router.push("/freelancer-hub")}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back to Jobs
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #0070f3",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto",
            }}
          ></div>
          <p>Loading job data...</p>
        </div>
      )}

      {error && (
        <div
          style={{
            padding: "15px",
            backgroundColor: "#fee2e2",
            border: "1px solid #fecaca",
            borderRadius: "8px",
            color: "#dc2626",
            marginBottom: "20px",
          }}
        >
          <h3>❌ Error</h3>
          <p>{error}</p>
        </div>
      )}

      {jobData && (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "8px",
          }}
        >
          <h3>✅ Job Data Loaded Successfully!</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginTop: "15px",
            }}
          >
            {/* Basic Job Info */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "6px",
              }}
            >
              <h4>📋 Basic Information</h4>
              <pre
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(
                  {
                    id: jobData.id,
                    title: jobData.title,
                    category: jobData.category,
                    budget: jobData.budget,
                    status: jobData.status,
                    experienceLevel: jobData.experienceLevel,
                    createdAt: jobData.createdAt,
                    deadline: jobData.deadline,
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            {/* Skills & Description */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "6px",
              }}
            >
              <h4>🛠️ Skills & Description</h4>
              <div style={{ marginBottom: "10px" }}>
                <strong>Skills:</strong>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "5px",
                    marginTop: "5px",
                  }}
                >
                  {jobData.skills?.map((skill, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: "#e0f2fe",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <strong>Description Preview:</strong>
                <p
                  style={{
                    fontSize: "12px",
                    marginTop: "5px",
                    maxHeight: "100px",
                    overflow: "hidden",
                  }}
                >
                  {jobData.description?.substring(0, 200)}...
                </p>
              </div>
            </div>

            {/* Client Information */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "6px",
              }}
            >
              <h4>👤 Client Information</h4>
              {jobData.user ? (
                <pre
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "10px",
                    borderRadius: "4px",
                    overflow: "auto",
                    fontSize: "12px",
                  }}
                >
                  {JSON.stringify(
                    {
                      name: jobData.user.name,
                      email: jobData.user.email,
                      avgRating: jobData.user.avgRating,
                      reviewCount: jobData.user.reviewCount,
                      memberSince: jobData.user.createdAt,
                    },
                    null,
                    2
                  )}
                </pre>
              ) : (
                <p style={{ color: "#6b7280" }}>No client data available</p>
              )}
            </div>

            {/* Statistics */}
            <div
              style={{
                padding: "15px",
                backgroundColor: "white",
                borderRadius: "6px",
              }}
            >
              <h4>📊 Statistics</h4>
              <pre
                style={{
                  backgroundColor: "#f8fafc",
                  padding: "10px",
                  borderRadius: "4px",
                  overflow: "auto",
                  fontSize: "12px",
                }}
              >
                {JSON.stringify(
                  {
                    proposalCount: jobData.proposalCount,
                    _count: jobData._count,
                    totalProposals: jobData._count?.proposals || 0,
                    totalMessages: jobData._count?.messages || 0,
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </div>

          {/* Raw Data */}
          <div style={{ marginTop: "20px" }}>
            <details>
              <summary style={{ cursor: "pointer", fontWeight: "bold" }}>
                🔍 View Raw JSON Data
              </summary>
              <pre
                style={{
                  backgroundColor: "#1f2937",
                  color: "#f3f4f6",
                  padding: "15px",
                  borderRadius: "6px",
                  overflow: "auto",
                  fontSize: "10px",
                  marginTop: "10px",
                  maxHeight: "400px",
                }}
              >
                {JSON.stringify(jobData, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      )}

      {/* Database Status */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f8fafc",
          borderRadius: "8px",
        }}
      >
        <h3>🗄️ Database Status</h3>
        <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/jobs?limit=5");
                const data = await response.json();
                console.log("Recent jobs:", data);
                alert(`Found ${data.jobs?.length || 0} recent jobs`);
              } catch (err) {
                alert("Error fetching recent jobs");
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Check Recent Jobs
          </button>

          <button
            onClick={async () => {
              try {
                const response = await fetch("/api/auth/verify");
                const data = await response.json();
                console.log("Auth status:", data);
                alert(
                  data.user
                    ? `Logged in as: ${data.user.name}`
                    : "Not logged in"
                );
              } catch (err) {
                alert("Auth check failed");
              }
            }}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f59e0b",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Check Auth Status
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
