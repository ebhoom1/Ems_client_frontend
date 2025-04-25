import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
} from "react-flow-renderer";
import SVGNode from "./SVGnode";
import TextNode from "./TextNode";
import { useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../../utils/apiConfig";
//new
import PipingEdge from "./PipingEdge"; // import your new edge type

const nodeTypes = {
  svgNode: SVGNode,
  textNode: ({ data }) => (
    <div
      style={{
        padding: "10px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "move",
        textAlign: "center",
      }}
    >
      {data.label}
    </div>
  ),
};

function Canvas({ selectedStation, isEditMode, setIsEditMode }) { 
  const { userId } = useSelector((state) => state.selectedUser);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [isDragging, setIsDragging] = useState(false); 
  const [currentUserName, setCurrentUserName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [noLiveStation, setNoLiveStation] = useState(false);
  // const [isEditMode, setIsEditMode] = useState(false); // New state for enabling edit mode
  const [stationName, setStationName] = useState("");


  const { userData } = useSelector((state) => state.user);
  const userType = userData?.validUserOne?.userType || "";
  const loggedUserName = userData?.validUserOne?.userName || "";
  const storedUserId = sessionStorage.getItem("selectedUserId");

  const onDragStart = () => setIsDragging(true);
  const onDragStop = () => setIsDragging(false);

  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges]
  // );

  //new
  const onConnect = useCallback(
    (params) => {
      console.log("Connected:", params);
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "piping",
            data: {
              sourceHandle: params.sourceHandle,
              targetHandle: params.targetHandle,
            },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const onDragOver = (event) => {
    event.preventDefault();
  };

  const onDrop = (event) => {
    if (!isEditMode) return; // Disable dropping when not in edit mode

    event.preventDefault();
    const reactFlowBounds = event.target.getBoundingClientRect();
    const shapeData = event.dataTransfer.getData("application/reactflow");

    if (!shapeData) {
      console.error("No data found in drag event");
      return;
    }

    let parsedShapeData;
    try {
      parsedShapeData = JSON.parse(shapeData);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      return;
    }

    const position = {
      x: event.clientX - reactFlowBounds.left,
      y: event.clientY - reactFlowBounds.top,
    };

    // const newNode = {
    //   id: `${parsedShapeData.id}_${nodes.length}`,
    //   type: parsedShapeData.type,
    //   position,
    //   data: { label: parsedShapeData.label, svgPath: parsedShapeData.svgPath },
    // };

    //new
    const newNode = {
      id: `${parsedShapeData.id}_${nodes.length}`,
      type: parsedShapeData.type,
      position,
      data: {
        label: parsedShapeData.label,
        svgPath: parsedShapeData.svgPath,
        isEditing: true, // ✅ Make sure new node has handles in edit mode
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const handleSave = async () => {
    if (!stationName) {
      alert("Please enter a station name.");
      return;
    }
    try {
      const apiUrl = isEditing
        ? `${API_URL}/api/edit-live-station/${
            currentUserName || loggedUserName
          }/${stationName}`
        : `${API_URL}/api/build-live-station`;
      const method = isEditing ? "patch" : "post";
      const payload = isEditing
        ? {
            userName: currentUserName || loggedUserName,
            stationName,
            newStationName: stationName,
            nodes: nodes.map((node) => ({
              ...node,
              rotation: node.data.rotation,
              label: node.data.label, //new ✅ Save label
              width: node.width,
              height: node.height,
            })),
            edges,
          }
        : {
            userName: loggedUserName,
            stationName,
            nodes: nodes.map((node) => ({
              ...node,
              rotation: node.data.rotation,
              label: node.data.label, //new ✅ Save label
              width: node.width,
              height: node.height,
            })),
            edges,
          };
      const response = await axios({
        method,
        url: apiUrl,
        data: payload,
      });
      console.log("Saved successfully:", response.data);
      alert("Map saved successfully!");
      setNoLiveStation(false);
      setIsEditMode(false); // Disable edit mode after saving
    } catch (error) {
      console.error("Error saving map:", error);
      alert("Failed to save map. Please try again.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(
        `${API_URL}/api/delete-live-station/${
          currentUserName || loggedUserName
        }/${stationName}`
      );
      alert("Live station deleted successfully!");
      setNodes([]);
      setEdges([]);
      setIsEditing(false);
      setNoLiveStation(true);
    } catch (error) {
      console.error("Error deleting live station:", error);
      alert("Failed to delete live station. Please try again.");
    }
  };

  const fetchLiveStation = async (user, station) => {
    setNodes([]);
    setEdges([]);

    try {
      const response = await axios.get(
        `${API_URL}/api/find-live-station/${user}/${station}`
      );
      const { data } = response.data;
      if (data) {
        // setNodes(data.nodes || []);
        setNodes(
          (data.nodes || []).map((node) => ({
            ...node,
            data: {
              ...node.data,
              isEditing: false, // 🚫 Always set false when loading a saved station
            },
          }))
        );

        setEdges(data.edges || []);
        setCurrentUserName(user);
        setIsEditing(true);
        setNoLiveStation(false);
      } else {
        setIsEditing(false);
        setNoLiveStation(true);
      }
    } catch (error) {
      console.error("Error fetching live station:", error);
      setIsEditing(false);
      setNoLiveStation(true);
    }
  };

  // When the selectedStation prop changes, load that station
  useEffect(() => {
    if (selectedStation && selectedStation.stationName) {
      fetchLiveStation(selectedStation.userName, selectedStation.stationName);
      setStationName(selectedStation.stationName);
    } else {
      // Clear canvas for new station creation
      setNodes([]);
      setEdges([]);
      setStationName("");
      setIsEditing(false);
    }
  }, [selectedStation]);

  // Optionally, if no station is selected, clear the canvas (new station mode)
  useEffect(() => {
    if (!selectedStation) {
      setNodes([]);
      setEdges([]);
      setStationName("");
      setIsEditing(false);
    }
  }, [selectedStation]);

  //new
  const edgeTypes = {
    piping: PipingEdge,
  };




  return (
    <div className="react-flow-container">
      <div className="react-flow-scrollable">
        {noLiveStation && (
          <div className="text-center text-danger mt-3">
            <h5>
              {userType === "admin"
                ? "No live station available for this user."
                : "No live station available. Please create a new one."}
            </h5>
          </div>
        )}
        {/* Station Name Input */}
        <div className="d-flex align-items-center justify-content-between mb-2">
          <div>
            <label htmlFor="stationName" className="form-label">
              Station Name:
            </label>
            <input
              id="stationName"
              type="text"
              className="form-control"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              // Allow editing station name regardless of new or existing station
            />
          </div>
          <div className="d-flex "style={{ marginRight: "40px" }}>
            {/* <button
              className="btn btn-warning me-3"
              onClick={() => setIsEditMode((prev) => !prev)}
            >
              {isEditMode ? ' Edit' : ' Edit'}
            </button> */}
            <button
              className="btn btn-warning me-2"
              onClick={() => {
                setIsEditMode((prev) => {
                  const newMode = !prev; // 🔁 Toggle mode
                  setNodes((nds) =>
                    nds.map((node) => ({
                      ...node,
                      data: {
                        ...node.data,
                        isEditing: newMode, // ✅ Add `isEditing` to each node
                      },
                    }))
                  );
                  return newMode;
                });
              }}
            >
              {isEditMode ? " View" : " Edit"}
            </button>

            <button
              className="btn btn-success me-3"
              onClick={handleSave}
              disabled={!isEditMode}
            >
              {isEditing ? "Update" : "Save"}
            </button>
            {isEditing && userType === "admin" && (
              <button className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            )}
          </div>
        </div>
        <div
          className="reactflow-wrapper"
          style={{ width: "100%", height: "600px" }}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={isEditMode ? onNodesChange : undefined}
            onEdgesChange={isEditMode ? onEdgesChange : undefined}
            onConnect={isEditMode ? onConnect : undefined}
            onDragOver={onDragOver}
            onDrop={onDrop}
            nodeTypes={nodeTypes}
            style={{
              pointerEvents: isDragging || !isEditMode ? "none" : "auto",
            }}
            //new
            edgeTypes={edgeTypes}
            connectable={isEditMode} // ✅ NEW LINE!
            snapToGrid={true}
            snapGrid={[15, 15]} // adjust for your layout spacing//new
            isValidConnection={({ sourceNode, targetNode }) => {
              //new
              // Allow all types of connections as long as it's not the same node
              return sourceNode.id !== targetNode.id;
            }}
           
          >
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

export default Canvas;
