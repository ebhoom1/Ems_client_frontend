import React, {
  useCallback,
  useRef,
  useState,
  useMemo,
  useEffect,
} from "react";
import ReactFlow, {
  Controls,
  Background,
  addEdge,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";
import "./CanvasComponent.css";
import { useSelector } from "react-redux";
import io from "socket.io-client";

import PumpBlowerNode from "./PumpBlowerNode";
import ImageNode from "./ImageNode";
import PdfNode from "./PdfNode";
import { API_URL } from "../utils/apiConfig";
import screenfull from "screenfull";
import { BiFullscreen } from "react-icons/bi";
import { getSocket } from "./socketService";
import TankNode from "./TankNode";
import wipro from "../../src/assests/images/wipro.jpeg";

function CanvasComponent({
  selectedStationName,
  onStationNameChange,
  isEditMode,
  onToggleEditMode,
  onStationDeleted,
  draggedFileRef, // New prop
  clearDraggedFile, // New prop
  ownerUserNameOverride, // new optional prop
  expoProductId,
}) {
  console.log("ownerUserNameOverride:", ownerUserNameOverride);
  console.log(" expoProductId:", expoProductId);
  const reactFlowWrapper = useRef(null);
  const canvasContainerRef = useRef(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState(new Map());
  const [realtimePumpData, setRealtimePumpData] = useState({});
  const [pendingPumps, setPendingPumps] = useState({});

  // const [messageBox, setMessageBox] = useState({
  //   isVisible: false,
  //   message: "",
  //   onConfirm: null,
  // });

  // const showMessageBox = useCallback((message, onConfirm = null) => {
  //   setMessageBox({ isVisible: true, message, onConfirm });
  // }, []);

  // const hideMessageBox = useCallback(() => {
  //   setMessageBox({ isVisible: false, message: "", onConfirm: null });
  // }, []);

  const showMessageBox = useCallback((message, onConfirm = null) => {
    window.alert(typeof message === "string" ? message : String(message ?? ""));
    if (typeof onConfirm === "function") onConfirm();
  }, []);

  const { userData } = useSelector((state) => state.user);
  const productId = String(userData?.validUserOne?.productID || "");
  console.log("productId:", productId);

  // const getOwnerUserName = useCallback(() => {
  //   const ui = userData?.validUserOne;
  //   const base = ui?.userName || null;
  //   const type = String(ui?.userType || "").toLowerCase();

  //   if (type === "admin" || type === "operator") {
  //     try {
  //       const fromSession = sessionStorage.getItem("selectedUserId");
  //       if (fromSession && fromSession.trim()) return fromSession.trim();
  //     } catch {
  //       // ignore
  //     }
  //   }

  //   return base;
  // }, [userData]);
  const getOwnerUserName = useCallback(() => {
    if (ownerUserNameOverride) return ownerUserNameOverride;
    const ui = userData?.validUserOne;
    const base = ui?.userName || null;
    const type = String(ui?.userType || "").toLowerCase();

    if (type === "admin" || type === "operator") {
      try {
        const fromSession = sessionStorage.getItem("selectedUserId");
        if (fromSession && fromSession.trim()) return fromSession.trim();
      } catch {
        // ignore
      }
    }
    return base;
  }, [userData, ownerUserNameOverride]);

  // const getEffectiveProductId = useCallback(() => {
  //   const ui = userData?.validUserOne;
  //   const type = String(ui?.userType || "").toLowerCase();

  //   if (type === "admin" || type === "operator") {
  //     try {
  //       const fromSession = sessionStorage.getItem("selectedProductId");
  //       return (fromSession && fromSession.trim()) || "";
  //     } catch {
  //       return "";
  //     }
  //   }

  //   return String(ui?.productID || "");
  // }, [userData]);

  //for expo
  const getEffectiveProductId = useCallback(() => {
    // ✅ If EXPO_USER is forced, always use hard-coded 41
    if (ownerUserNameOverride === "EXPO_USER") {
      return String(expoProductId || 41);
    }

    const ui = userData?.validUserOne;
    const type = String(ui?.userType || "").toLowerCase();

    if (type === "admin" || type === "operator") {
      try {
        const fromSession = sessionStorage.getItem("selectedProductId");
        if (fromSession && fromSession.trim()) return fromSession.trim();
      } catch {
        // ignore
      }
    }

    return String(ui?.productID || "");
  }, [ownerUserNameOverride, expoProductId, userData]);

  const effectiveUserName = getOwnerUserName();
  const effectiveProductId = getEffectiveProductId();
  console.log("effectiveProductId:", effectiveProductId);
  const socket = useRef(null);
  const backendUrl = API_URL || "http://localhost:5555";

  useEffect(() => {
    socket.current = getSocket(backendUrl);

    // const handleTankData = (payload) => {
    //   console.log("Processing tank payload:", payload);

    //   // payload shape: { product_id, tankData: [{stackName,tankName,level,percentage}], ... }
    //   if (!payload || !Array.isArray(payload.tankData)) return;
    //   const nowIso = new Date().toISOString();
    //   setNodes((nds) =>
    //     nds.map((node) => {
    //       if (node.type !== "tankNode") return node;
    //       const tn = (node.data?.tankName || node.data?.name || node.id || "")
    //         .toString()
    //         .toLowerCase();
    //       const sn = (node.data?.stackName || "").toString().toLowerCase();
    //       // find best match by tankName (and optional stackName)
    //       const match = payload.tankData.find((t) => {
    //         const tTank = (t.tankName || t.TankName || "")
    //           .toString()
    //           .toLowerCase();
    //         const tStack = (t.stackName || "").toString().toLowerCase();
    //         const tankMatches = tTank && tTank === tn;
    //         const stackOk = !sn || sn === tStack; // if node has stackName, require match
    //         return tankMatches && stackOk;
    //       });
    //       if (!match) return node;
    //       const pct = Number(match.percentage);
    //       const inRange = Number.isFinite(pct) && pct >= 0 && pct <= 100;
    //       return {
    //         ...node,
    //         data: {
    //           ...node.data,
    //           percentage: inRange ? pct : node.data?.percentage, // only update when valid
    //           lastUpdated: nowIso,
    //         },
    //       };
    //     })
    //   );
    // };
    const handleTankData = (payload) => {
      console.log("Processing tank payload:", payload);

      // payload shape: { product_id, tankData: [{stackName,tankName,level,percentage}], ... }
      if (!payload || !Array.isArray(payload.tankData)) return;

      const nowIso = new Date().toISOString();
      const incomingProductId = String(payload.product_id || "");

      setNodes((nds) =>
        nds.map((node) => {
          if (node.type !== "tankNode") return node;

          // 🔹 Only update nodes for the matching product_id
          if (String(node.data?.productId) !== incomingProductId) {
            return node;
          }

          const tn = (node.data?.tankName || node.data?.name || node.id || "")
            .toString()
            .toLowerCase();
          const sn = (node.data?.stackName || "").toString().toLowerCase();

          // find best match by tankName (and optional stackName)
          const match = payload.tankData.find((t) => {
            const tTank = (t.tankName || t.TankName || "")
              .toString()
              .toLowerCase();
            const tStack = (t.stackName || "").toString().toLowerCase();
            const tankMatches = tTank && tTank === tn;
            const stackOk = !sn || sn === tStack;
            return tankMatches && stackOk;
          });

          if (!match) return node;

          const pct = Number(match.percentage);
          const inRange = Number.isFinite(pct) && pct >= 0 && pct <= 100;

          if (inRange && node.data?.percentage !== pct) {
            node.data = {
              ...node.data,
              percentage: pct,
              lastUpdated: nowIso,
            };
          }
          return node;
        })
      );
    };

    const handlePumpFeedback = (payload) => {
      console.log("Processing pump feedback:", payload);
      if (
        !payload ||
        typeof payload.pumpData !== "object" ||
        payload.pumpData === null
      ) {
        console.error("Invalid pumpFeedback payload received:", payload);
        return;
      }
      const { pumpId, status } = payload.pumpData;
      const incomingProductId = String(
        payload.productId || payload.product_id || ""
      );
      const compositeKey = `${incomingProductId}:${pumpId}`;

      setPendingPumps((prev) => ({ ...prev, [compositeKey]: false }));

      setNodes((nds) =>
        nds.map((node) => {
          // if (
          //   node.id === pumpId &&
          //   String(node.data?.productId) === incomingProductId
          // ) {
          //   return {
          //     ...node,
          //     data: {
          //       ...node.data,
          //       realtimeValues: { ...payload.pumpData },
          //       isOn: status === "ON" || status === 1,
          //       isPending: false,
          //     },
          //   };
          // }
          if (
            node.id === pumpId &&
            String(node.data?.productId) === incomingProductId
          ) {
            const newData = {
              ...node.data,
              realtimeValues: { ...payload.pumpData },
              isOn:
                typeof status !== "undefined"
                  ? status === "ON" || status === 1
                  : node.data.isOn,
              isPending: false,
            };

            if (JSON.stringify(node.data) !== JSON.stringify(newData)) {
              return { ...node, data: newData };
            }
          }

          return node;
        })
      );

      setRealtimePumpData((prev) => ({
        ...prev,
        [compositeKey]: { ...payload.pumpData },
      }));
    };

    // const handlePumpAck = (payload) => {
    //   console.log("Processing pump acknowledgment:", payload);

    //   const pumpMap = {};
    //   const incomingProductId = String(
    //     payload.productId || payload.product_id || ""
    //   );

    //   payload.pumps.forEach((p) => {
    //     const key = `${incomingProductId}:${p.pumpId}`;
    //     pumpMap[key] = p;
    //   });

    //   setPendingPumps((prev) => {
    //     const copy = { ...prev };
    //     payload.pumps.forEach((p) => {
    //       const key = `${incomingProductId}:${p.pumpId}`;
    //       copy[key] = false;
    //     });
    //     return copy;
    //   });

    //   setNodes((nds) =>
    //     nds.map((node) => {
    //       const key = `${String(node.data?.productId)}:${node.id}`;
    //       const updatedPump = pumpMap[key];
    //       // if (updatedPump) {
    //       //   return {
    //       //     ...node,
    //       //     data: {
    //       //       ...node.data,
    //       //       realtimeValues: updatedPump,
    //       //       isOn: updatedPump.status === 1 || updatedPump.status === "ON",
    //       //       isPending: false,
    //       //     },
    //       //   };
    //       // }
    //       if (updatedPump) {
    //         const newData = {
    //           ...node.data,
    //           realtimeValues: updatedPump,
    //           isOn: updatedPump.status === 1 || updatedPump.status === "ON",
    //           isPending: false,
    //         };
    //         if (JSON.stringify(node.data) !== JSON.stringify(newData)) {
    //           return { ...node, data: newData };
    //         }
    //       }

    //       return node;
    //     })
    //   );

    //   setRealtimePumpData((prev) => ({ ...prev, ...pumpMap }));
    // };

    const handlePumpAck = (payload) => {
      console.log("Processing pump acknowledgment:", payload);

      const pumpMap = {};
      const incomingProductId = String(
        payload.productId || payload.product_id || ""
      );

      // ✅ 1. Update tank nodes with tank percentages
      // ✅ 1. Update tank nodes with tank percentages (only if changed)
      if (payload.tanks && typeof payload.tanks === "object") {
        const {
          equalization_percentage,
          aeration_percentage,
          sludge_percentage,
          decant_percentage,
          treated_water_percentage,
        } = payload.tanks;

        setNodes((nds) =>
          nds.map((node) => {
            if (node.type !== "tankNode") return node;
            if (String(node.data?.productId) !== incomingProductId) return node;

            const tankName = (
              node.data?.tankName ||
              node.data?.name ||
              ""
            ).toLowerCase();

            // pick the incoming value for this tank
            let incoming = undefined;
            if (tankName.includes("equal")) incoming = equalization_percentage;
            else if (tankName.includes("aerat")) incoming = aeration_percentage;
            else if (tankName.includes("sludge")) incoming = sludge_percentage;
            else if (tankName.includes("decant")) incoming = decant_percentage;
            else if (tankName.includes("treated"))
              incoming = treated_water_percentage;

            // only accept real numbers in [0, 100]
            if (
              typeof incoming !== "number" ||
              Number.isNaN(incoming) ||
              incoming < 0 ||
              incoming > 100
            ) {
              return node; // ignore bad/missing data; keep prior value
            }

            // optional: normalize to 2 decimals to avoid micro-jitter
            const nextPct = Math.round(incoming * 100) / 100;
            const prevPct =
              typeof node.data?.percentage === "number"
                ? Math.round(node.data.percentage * 100) / 100
                : undefined;

            // update only if the value actually changed
            if (prevPct === nextPct) return node;

            return {
              ...node,
              data: {
                ...node.data,
                percentage: nextPct,
                lastUpdated: new Date().toISOString(),
              },
            };
          })
        );
      }

      // ✅ 2. Normal pump acknowledgment handling
      if (Array.isArray(payload.pumps)) {
        payload.pumps.forEach((p) => {
          const key = `${incomingProductId}:${p.pumpId}`;
          pumpMap[key] = p;
        });
      }

      // ✅ 3. Clear pending status for acknowledged pumps
      setPendingPumps((prev) => {
        const copy = { ...prev };
        if (Array.isArray(payload.pumps)) {
          payload.pumps.forEach((p) => {
            const key = `${incomingProductId}:${p.pumpId}`;
            copy[key] = false;
          });
        }
        return copy;
      });

      // ✅ 4. Update pump nodes with their latest status
      setNodes((nds) =>
        nds.map((node) => {
          const key = `${String(node.data?.productId)}:${node.id}`;
          const updatedPump = pumpMap[key];
          if (updatedPump) {
            const newData = {
              ...node.data,
              realtimeValues: updatedPump,
              // isOn: updatedPump.status === 1 || updatedPump.status === "ON",
              isOn:
                typeof updatedPump.status !== "undefined"
                  ? updatedPump.status === 1 || updatedPump.status === "ON"
                  : node.data.isOn,
              isPending: false,
            };
            if (JSON.stringify(node.data) !== JSON.stringify(newData)) {
              return { ...node, data: newData };
            }
          }
          return node;
        })
      );

      // ✅ 5. Store latest pump data for reference
      setRealtimePumpData((prev) => ({ ...prev, ...pumpMap }));
    };

    socket.current.on("connect", () => {
      console.log("Socket.IO connected:", socket.current.id);
      if (effectiveProductId)
        socket.current.emit("joinRoom", effectiveProductId);
    });

    socket.current.on("data", handleTankData);
    socket.current.on("pumpFeedback", handlePumpFeedback);
    socket.current.on("pumpAck", handlePumpAck);

    socket.current.on("reconnect", () => {
      console.log("Reconnected to server");
      if (effectiveProductId)
        socket.current.emit("joinRoom", effectiveProductId);
    });

    return () => {
      socket.current.off("data", handleTankData);
      socket.current.off("pumpFeedback", handlePumpFeedback);
      socket.current.off("pumpAck", handlePumpAck);
    };
  }, [
    backendUrl,
    effectiveProductId,
    setNodes,
    setPendingPumps,
    setRealtimePumpData,
  ]);

  useEffect(() => {
    if (effectiveProductId) {
      console.log(
        `[FRONTEND] Attempting to join room with productId: ${effectiveProductId}`
      );
      socket.current.emit("joinRoom", effectiveProductId);
    }
  }, [effectiveProductId]);

  const sendPumpControlMessage = useCallback(
    (prodId, pumps) => {
      if (!prodId) {
        if (ownerUserNameOverride) {
          // silently ignore toggles when we’re showing a fixed station without product selection
          return;
        }
        showMessageBox(
          "No product selected. Please select a user (product) first."
        );
        return;
      }
      if (socket.current && socket.current.connected) {
        // Build pending and optimistic update based on the current nodes snapshot
        const newPendingState = {};
        const optimisticUpdate = {};

        pumps.forEach((p) => {
          // newPendingState[p.pumpId] = true;
          const key = `${prodId}:${p.pumpId}`;
          newPendingState[key] = true;
          const nodeToToggle = nodesRef.current.find((n) => n.id === p.pumpId);
          if (nodeToToggle) {
            // optimisticUpdate[p.pumpId] = !nodeToToggle.data.isOn;
            optimisticUpdate[`${prodId}:${p.pumpId}`] = !nodeToToggle.data.isOn;
          }
        });

        setPendingPumps((prev) => ({ ...prev, ...newPendingState }));

        // Optimistically update nodes' isOn in state
        setNodes((nds) =>
          nds.map((node) =>
            // optimisticUpdate.hasOwnProperty(node.id)
            optimisticUpdate.hasOwnProperty(
              `${String(node.data?.productId)}:${node.id}`
            )
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    isOn: optimisticUpdate[node.id],
                    isPending: true,
                  },
                }
              : node
          )
        );

        socket.current.emit("controlPump", { product_id: prodId, pumps });
      } else {
        console.error("Socket.IO client not connected. Cannot send command.");
        showMessageBox(
          "Connection error: Cannot send command. Please refresh."
        );
      }
    },
    [showMessageBox] // showMessageBox is stable (from step 1)
  );

  const nodeTypes = useMemo(
    () => ({
      pumpBlowerNode: (props) => (
        <PumpBlowerNode
          {...props}
          setNodes={setNodes}
          sendPumpControlMessage={sendPumpControlMessage}
          portalContainer={canvasContainerRef.current || document.body}
        />
      ),
      imageNode: ImageNode,
      pdfNode: PdfNode,
      tankNode: TankNode,
    }),
    [setNodes, sendPumpControlMessage]
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const loadStation = useCallback(
    async (name) => {
      if (!name) return;
      try {
        const ownerUserName = getOwnerUserName();
        console.log("ownerUserName:", ownerUserName);
        if (!ownerUserName) {
          showMessageBox("No user selected. Please choose a user first.");
          return;
        }

        // const response = await fetch(
        //   `${API_URL}/api/find-live-station/${userData.validUserOne.userName}/${name}`
        // );
        const response = await fetch(
          `${API_URL}/api/find-live-station/${ownerUserName}/${encodeURIComponent(
            name
          )}`
        );
        const result = await response.json();
        console.log("selected station:", result);

        if (response.ok) {
          // let effectiveProductId = ownerUserNameOverride
          //   ? expoProductId || ""
          //   : getEffectiveProductId();

          // ✅ Determine correct product ID for each case
          let effectiveProductId;

          if (ownerUserNameOverride === "EXPO_USER") {
            // CONTI → uses EXPO_USER’s fixed ID (41)
            effectiveProductId = expoProductId || "41";
          } else if (ownerUserNameOverride === "WTCANX") {
            // WTCANX → read from sessionStorage (already set by Header)
            effectiveProductId =
              sessionStorage.getItem("selectedProductId") || "";
          } else {
            // default → current user’s productID
            effectiveProductId = getEffectiveProductId();
          }

          console.log("EXPO_USER Product ID being used:", effectiveProductId);

          if (!effectiveProductId) {
            showMessageBox(
              "No product selected. Please select a user (product) first."
            );
            return;
          }

          const pumpStatesResponse = await fetch(
            `${API_URL}/api/pump-states/${effectiveProductId}`
          );
          const pumpStatesData = await pumpStatesResponse.json();
          console.log("pumpStatesData:", pumpStatesData); // <-- This is the new console log you requested

          const pumpStatusMap = new Map();
          const pendingStatusMap = new Map();

          pumpStatesData.forEach((state) => {
            pumpStatusMap.set(state.pumpId, state.status);
            pendingStatusMap.set(state.pumpId, state.pending);
          });

          const newPendingPumps = {};
          pumpStatesData.forEach((state) => {
            newPendingPumps[state.pumpId] = state.pending;
          });
          setPendingPumps(newPendingPumps);

          const updatedNodes = result.data.nodes.map((node) => {
            if (node.type === "pumpBlowerNode") {
              const isPending = pendingStatusMap.get(node.id) || false;
              const isOn = pumpStatusMap.get(node.id) || false;

              return {
                ...node,
                data: {
                  ...node.data,
                  isOn: isOn,
                  isPending: isPending,
                  productId: effectiveProductId,
                  isEditMode: isEditMode,
                  realtimeValues: realtimePumpData[node.id] || {},
                },
              };
            }
            return node;
          });

          setNodes(updatedNodes);
          setEdges(result.data.edges);
          onStationNameChange(result.data.stationName);
          if (reactFlowInstance) {
            reactFlowInstance.setViewport(result.data.viewport, {
              duration: 800,
            });
          }
        } else {
          showMessageBox(`Error loading station: ${result.message}`);
        }
      } catch (error) {
        console.error("Error loading station:", error);
        showMessageBox("Network error. Could not load station.");
      }
    },
    [
      getOwnerUserName,
      userData,
      setNodes,
      setEdges,
      onStationNameChange,
      reactFlowInstance,
      effectiveProductId,
    ]
  );
  useEffect(() => {
    if (selectedStationName) {
      loadStation(selectedStationName);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedStationName, loadStation]);

  // Function to save a new station
  const handleSaveNew = async () => {
    if (nodes.length === 0) {
      showMessageBox("Canvas is empty. Add some devices before saving.");
      return;
    }
    const nameInput = prompt("Enter a name for the new station:");
    if (!nameInput || !nameInput.trim()) {
      showMessageBox("Station name is required. Aborting.");
      return;
    }

    const ownerUserName = getOwnerUserName();
    if (!ownerUserName) {
      showMessageBox("No user selected. Please choose a user first.");
      return;
    }

    const stationData = {
      userName: ownerUserName,
      stationName: nameInput,
      nodes: nodes,
      edges: edges,
      viewport: reactFlowInstance.getViewport(),
    };

    try {
      const response = await fetch(`${API_URL}/api/build-live-station`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stationData),
      });
      const result = await response.json();
      if (response.ok) {
        showMessageBox(`Station "${nameInput}" saved successfully!`);
        onStationNameChange(nameInput);
        onToggleEditMode(false);
      } else {
        showMessageBox(`Error saving station: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving station:", error);
      showMessageBox("Network error. Could not save station.");
    }
  };

  // Function to update an existing station
  const handleUpdate = async () => {
    if (!selectedStationName) {
      showMessageBox("No station selected to update.");
      return;
    }

    const ownerUserName = getOwnerUserName();
    if (!ownerUserName) {
      showMessageBox("No user selected. Please choose a user first.");
      return;
    }

    const stationData = {
      userName: ownerUserName,
      nodes: nodes,
      edges: edges,
      viewport: reactFlowInstance.getViewport(),
    };

    try {
      const response = await fetch(
        `${API_URL}/api/edit-live-station/${ownerUserName}/${encodeURIComponent(
          selectedStationName
        )}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stationData),
        }
      );
      const result = await response.json();
      if (response.ok) {
        showMessageBox(
          `Station "${selectedStationName}" updated successfully!`
        );
        onToggleEditMode(false);
      } else {
        showMessageBox(`Error updating station: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating station:", error);
      showMessageBox("Network error. Could not update station.");
    }
  };

  const onDelete = async () => {
    if (!selectedStationName) {
      showMessageBox("No station selected to delete.");
      return;
    }
    const isConfirmed = window.confirm(
      `Are you sure you want to delete station "${selectedStationName}"?`
    );
    if (!isConfirmed) return;

    const ownerUserName = getOwnerUserName();
    if (!ownerUserName) {
      showMessageBox("No user selected. Please choose a user first.");
      return;
    }
    try {
      const response = await fetch(
        `${API_URL}/api/delete-live-station/${ownerUserName}/${encodeURIComponent(
          selectedStationName
        )}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        showMessageBox(
          `Station "${selectedStationName}" deleted successfully.`
        );
        setNodes([]);
        setEdges([]);
        onStationDeleted();
      } else {
        const result = await response.json();
        showMessageBox(`Error deleting station: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting station:", error);
      showMessageBox("Network error. Could not delete station.");
    }
  };

  const onDragOver = useCallback(
    (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = isEditMode ? "move" : "none";
    },
    [isEditMode]
  );

  const onDrop = useCallback(
    async (event) => {
      if (!isEditMode) return;
      event.preventDefault();

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds || !reactFlowInstance) return;

      const dataString = event.dataTransfer.getData("application/reactflow");
      if (!dataString) return;
      const shapeData = JSON.parse(dataString);

      const isSpecialNode = !!(shapeData.isPump || shapeData.isAirblower);
      const isPngNode = !!shapeData.isPNG;
      const isPdfNode = !!shapeData.isPDF;

      const promptLabel =
        isPngNode || isPdfNode ? "file" : shapeData.label || "node";

      const manualId = prompt(`Enter a unique ID for the new ${promptLabel}:`);
      if (!manualId) {
        showMessageBox("ID is required. Aborting.");
        clearDraggedFile();
        return;
      }
      if (nodes.some((n) => n.id === manualId)) {
        showMessageBox(
          `ID "${manualId}" already exists. Please choose a unique ID.`
        );
        clearDraggedFile();
        return;
      }

      let deviceName = shapeData.label || manualId;
      let tankName = undefined;
      let stackName = undefined;
      if (isSpecialNode) {
        const nameInput = prompt(`Enter a name for device ${manualId}:`);
        if (!nameInput) {
          showMessageBox("Name is required. Aborting.");
          clearDraggedFile();
          return;
        }
        deviceName = nameInput;
      } else if (shapeData.isTank) {
        tankName =
          prompt(`TankName to bind (exact as device, e.g. "Equalization"):`) ||
          deviceName;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      let nodeType = "default";
      if (isSpecialNode) nodeType = "pumpBlowerNode";
      else if (shapeData.isTank) nodeType = "tankNode";
      else if (isPngNode) nodeType = "imageNode";
      else if (isPdfNode) nodeType = "pdfNode";

      // ---- upload handling (PNG/PDF) ----
      let uploadedUrl = shapeData.filePath || null;
      let uploadedKey = null;

      try {
        if (isPngNode || isPdfNode) {
          // ✅ Use global ref or draggedFileRef
          const fileToUpload = window.__draggedFile__ || draggedFileRef.current;

          if (!fileToUpload) {
            showMessageBox("File object is missing. Cannot upload.");
            return;
          }

          const formData = new FormData();
          formData.append("file", fileToUpload, fileToUpload.name);
          const resp = await fetch(`${API_URL}/api/upload-file`, {
            method: "POST",
            body: formData,
          });
          const json = await resp.json();

          if (!resp.ok) {
            showMessageBox(
              `Error uploading file: ${json.message || "Unknown error"}`
            );
            return;
          }

          uploadedUrl = json.filePath || null;
          uploadedKey = json.fileName || null;

          showMessageBox("File uploaded successfully.");
        }
        console.log("Uploaded PDF URL:", uploadedUrl);
      } catch (err) {
        console.error("File upload failed:", err);
        showMessageBox("Network error. Could not upload file.");
        return;
      } finally {
        clearDraggedFile();
        window.__draggedFile__ = null; // cleanup
      }

      const newNode = {
        id: manualId,
        type: nodeType,
        position,
        data: {
          id: manualId,
          name: deviceName,
          productId: effectiveProductId,
          tankName,
          stackName,
          filePath: uploadedUrl,
          fileKey: uploadedKey,
          isOn: false,
          isPending: false,
          realtimeValues: {},
          label:
            !isSpecialNode && !isPngNode && !isPdfNode ? (
              <div style={{ textAlign: "center" }}>
                <img src={shapeData.svgPath} alt={shapeData.label} />
                <div>{manualId}</div>
              </div>
            ) : null,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [
      isEditMode,
      reactFlowInstance,
      reactFlowWrapper,
      nodes,
      effectiveProductId,
      showMessageBox,
      draggedFileRef,
      clearDraggedFile,
    ]
  );

  // This useEffect ensures the correct `loadStation` function is used
  useEffect(() => {
    if (selectedStationName) {
      loadStation(selectedStationName);
    } else {
      setNodes([]);
      setEdges([]);
    }
  }, [selectedStationName, loadStation]);

  const toggleFullScreen = () => {
    if (screenfull.isEnabled && canvasContainerRef.current) {
      screenfull.toggle(canvasContainerRef.current).then(() => {
        if (screenfull.isFullscreen) {
          canvasContainerRef.current.classList.add("fullscreen-mode");
        } else {
          canvasContainerRef.current.classList.remove("fullscreen-mode");
        }
      });
    }
  };

  return (
    <div className="canvas-wrapper" ref={canvasContainerRef}>
      <div className="canvas-header">
        {/* {selectedStationName && (
          <h3 className="station-title">{selectedStationName}</h3>
        )}  */}
        {!ownerUserNameOverride && !!selectedStationName && (
          <h3 className="station-title">{selectedStationName}</h3>
        )}

        <div className="canvas-buttons">
          <button
            onClick={toggleFullScreen}
            className="fullscreen-button"
            title="Toggle Fullscreen"
          >
            <BiFullscreen size={20} />
          </button>

          {isEditMode ? (
            selectedStationName ? (
              <>
                <button
                  onClick={handleUpdate}
                  className="header-button update-button"
                >
                  Update
                </button>
                <button
                  onClick={onDelete}
                  className="header-button delete-button"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={handleSaveNew}
                className="header-button save-new-button"
              >
                Save New
              </button>
            )
          ) : null}
        </div>
      </div>
      <div
        className="react-flow-wrapper"
        ref={reactFlowWrapper}
        style={{ height: "100%" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isEditMode ? onNodesChange : null}
          onEdgesChange={isEditMode ? onEdgesChange : null}
          onConnect={isEditMode ? onConnect : null}
          onInit={setReactFlowInstance}
          onDrop={isEditMode ? onDrop : null}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* {messageBox.isVisible && (
        <div className="custom-message-box-overlay">
          <div className="custom-message-box">
            <p>{messageBox.message}</p>
            <button onClick={messageBox.onConfirm || hideMessageBox}>OK</button>
          </div>
        </div>
      )} */}
    </div>
  );
}

export default CanvasComponent;
