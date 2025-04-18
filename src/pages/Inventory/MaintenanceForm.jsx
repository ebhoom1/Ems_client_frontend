// src/pages/MaintenanceForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// your mechanical questions from the screenshots:
const questionSets = {
  mechanical: {
    pre: [
      { id: "pre1", checkpoint: "Ensure the system is locked out.", requirement: "-" },
      { id: "pre2", checkpoint: "Ensure the Valves are closed", requirement: "-" },
      { id: "pre3", checkpoint: "Ensure having the necessary PPE", requirement: "-" },
      { id: "pre4", checkpoint: "Ensure availability of required tools", requirement: "-" },
    ],
    main: [
      {
        id: "main1",
        checkpoint: "Check the foot valve and NRV pipe",
        requirement: "Foot valve and NRV should be in proper condition",
      },
      {
        id: "main2",
        checkpoint: "Check for the air lock of the pump",
        requirement: "Should not be having airlock",
      },
      {
        id: "main3",
        checkpoint: "Check chemical level in the tank",
        requirement: "Chemical quantity should be as required",
      },
      {
        id: "main4",
        checkpoint: "Check for filter blockage",
        requirement: "Filters should not be having any blockage",
      },
      {
        id: "main5",
        checkpoint: "Check if Pump is running smoothly",
        requirement: "Pump should be running smoothly",
      },
    ],
    post: [
      { id: "post1", checkpoint: "Ensure all tools are secured back", requirement: "-" },
      {
        id: "post2",
        checkpoint: "Ensure the panel is free from dust & closed properly",
        requirement: "-",
      },
      { id: "post3", checkpoint: "Ensure the lock out is removed", requirement: "-" },
      { id: "post4", checkpoint: "Ensure the Valves are open", requirement: "-" },
    ],
  },
  electrical: {
    pre: [],
    main: [],
    post: [],
  },
};

export default function MaintenanceForm() {
  const { type, equipmentId } = useParams();
  const navigate = useNavigate();

  // Technician info
  const [tech, setTech] = useState(null);
  // Start in editing mode so we never try to read tech.name when tech is null
  const [editingTech, setEditingTech] = useState(true);
  const [techForm, setTechForm] = useState({ name: "", designation: "", email: "" });

  // Answers state
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Load saved tech info
    const saved = localStorage.getItem("techInfo");
    if (saved) {
      const parsed = JSON.parse(saved);
      setTech(parsed);
      setTechForm(parsed);
      setEditingTech(false);
    }

    // Initialize answers for all questions in this type
    const allQs = [
      ...questionSets[type].pre,
      ...questionSets[type].main,
      ...questionSets[type].post,
    ];
    const init = {};
    allQs.forEach((q) => {
      init[q.id] = { response: "", comments: "", beforeImage: null, afterImage: null };
    });
    setAnswers(init);
  }, [type]);

  const handleTechChange = (e) => {
    const { name, value } = e.target;
    setTechForm((f) => ({ ...f, [name]: value }));
  };

  const saveTech = () => {
    if (!techForm.name || !techForm.designation || !techForm.email) {
      toast.error("Please fill all technician fields");
      return;
    }
    localStorage.setItem("techInfo", JSON.stringify(techForm));
    setTech(techForm);
    setEditingTech(false);
  };

  const onAnswer = (id, field, val) => {
    setAnswers((a) => ({ ...a, [id]: { ...a[id], [field]: val } }));
  };

  const onFile = (id, field, file) => {
    setAnswers((a) => ({ ...a, [id]: { ...a[id], [field]: file } }));
  };

  const submit = (e) => {
    e.preventDefault();
    const report = {
      equipmentId,
      type,
      technician: tech,
      sections: {
        pre: questionSets[type].pre.map((q) => ({ ...q, ...answers[q.id] })),
        main: questionSets[type].main.map((q) => ({ ...q, ...answers[q.id] })),
        post: questionSets[type].post.map((q) => ({ ...q, ...answers[q.id] })),
      },
      timestamp: new Date().toISOString(),
    };
    console.log("REPORT →", report);
    toast.success("Report submitted!");
    navigate("/");
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-capitalize">
        {type} Maintenance – Equipment {equipmentId}
      </h3>

      {/* Technician Info */}
      <div className="card mb-4">
        <div className="card-body">
          {editingTech ? (
            <>
              <h5>Technician Info</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <label>Name</label>
                  <input
                    className="form-control"
                    name="name"
                    value={techForm.name}
                    onChange={handleTechChange}
                  />
                </div>
                <div className="col-md-4">
                  <label>Designation</label>
                  <input
                    className="form-control"
                    name="designation"
                    value={techForm.designation}
                    onChange={handleTechChange}
                  />
                </div>
                <div className="col-md-4">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={techForm.email}
                    onChange={handleTechChange}
                  />
                </div>
              </div>
              <button className="btn btn-success mt-3" onClick={saveTech}>
                Save Technician Info
              </button>
            </>
          ) : (
            <>
              <h5 className="text-light">Technician Info</h5>
              <p className="text-light">
                <strong>Name:</strong> {tech.name}
              </p>
              <p className="text-light">
                <strong>Designation:</strong> {tech.designation}
              </p>
              <p className="text-light">
                <strong>Email:</strong> {tech.email}
              </p>
              <button
                className="btn btn-link btn-light"
                onClick={() => setEditingTech(true)}
              >
                Change
              </button>
            </>
          )}
        </div>
      </div>

      {/* Questions */}
      {!editingTech && (
        <form onSubmit={submit}>
          {["pre", "main", "post"].map((sec) => (
            <div key={sec} className="mb-5">
              <h5 className="text-capitalize">
                {sec === "pre"
                  ? "Pre Maintenance Check"
                  : sec === "main"
                  ? "Maintenance Check"
                  : "Post Maintenance Check"}
              </h5>
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Checkpoint</th>
                    <th>Standard Requirement</th>
                    <th>Response</th>
                    <th>Comments</th>
                    <th>Before Img</th>
                    <th>After Img</th>
                  </tr>
                </thead>
                <tbody>
                  {questionSets[type][sec].map((q, i) => (
                    <tr key={q.id}>
                      <td>{i + 1}</td>
                      <td>{q.checkpoint}</td>
                      <td>{q.requirement}</td>
                      <td>
                        <select
                          required
                          className="form-select"
                          value={answers[q.id].response}
                          onChange={(e) =>
                            onAnswer(q.id, "response", e.target.value)
                          }
                        >
                          <option value="">Select</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </td>
                      <td>
                        <input
                          className="form-control"
                          value={answers[q.id].comments}
                          onChange={(e) =>
                            onAnswer(q.id, "comments", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) =>
                            onFile(q.id, "beforeImage", e.target.files[0])
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="file"
                          className="form-control"
                          onChange={(e) =>
                            onFile(q.id, "afterImage", e.target.files[0])
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <button type="submit" className="btn btn-primary">
            Submit Report
          </button>
        </form>
      )}
    </div>
  );
}
