"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Zap } from "lucide-react";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {}
  );
  const [viewMode] = useState<"orbital">("orbital");
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [centerOffset] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: any;

    if (autoRotate && viewMode === "orbital") {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => {
          const newAngle = (prev + 0.3) % 360;
          return Number(newAngle.toFixed(3));
        });
      }, 50);
    }

    return () => {
      if (rotationTimer) {
        clearInterval(rotationTimer);
      }
    };
  }, [autoRotate, viewMode]);

  const centerViewOnNode = (nodeId: number) => {
    if (viewMode !== "orbital" || !nodeRefs.current[nodeId]) return;

    const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
    const totalNodes = timelineData.length;
    const targetAngle = (nodeIndex / totalNodes) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 170;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian) + centerOffset.x;
    const y = radius * Math.sin(radian) + centerOffset.y;

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(
      0.4,
      Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2))
    );

    return { x, y, angle, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    const relatedItems = getRelatedItems(activeNodeId);
    return relatedItems.includes(itemId);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleContainerClick}
      style={{
        width: "100%",
        height: "580px",
        minHeight: "580px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#000000",
        overflow: "hidden",
        position: "relative",
        borderRadius: "24px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)"
      }}
    >
      <div style={{ position: "relative", width: "100%", maxWidth: "896px", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          ref={orbitRef}
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: "1000px",
            transform: `translate(${centerOffset.x}px, ${centerOffset.y}px)`,
          }}
        >
          {/* Pulsing center hub */}
          <div style={{ position: "absolute", width: "64px", height: "64px", borderRadius: "50%", background: "linear-gradient(135deg, #a855f7, #3b82f6, #14b8a6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            <div style={{ position: "absolute", inset: "-8px", borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.2)", opacity: 0.7, pointerEvents: "none" }} className="animate-pulse"></div>
            <div style={{ position: "absolute", inset: "-16px", borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.1)", opacity: 0.5, pointerEvents: "none", animationDelay: "0.5s" }} className="animate-pulse"></div>
            <div style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(12px)" }}></div>
          </div>

          {/* Orbit Line Ring */}
          <div style={{ position: "absolute", width: "340px", height: "340px", borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.15)", pointerEvents: "none" }}></div>

          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;

            const nodeStyle = {
              position: "absolute" as const,
              transform: `translate(${position.x}px, ${position.y}px)`,
              zIndex: isExpanded ? 200 : position.zIndex,
              opacity: isExpanded ? 1 : position.opacity,
              transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.7s ease",
            };

            return (
              <div
                key={item.id}
                ref={(el) => { nodeRefs.current[item.id] = el; }}
                style={nodeStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Glow ring */}
                <div
                  className={isPulsing ? "animate-pulse" : ""}
                  style={{
                    position: "absolute",
                    borderRadius: "50%",
                    background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    pointerEvents: "none"
                  }}
                ></div>

                {/* Node circle */}
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid",
                    borderColor: isExpanded || isRelated ? "#ffffff" : "rgba(255, 255, 255, 0.4)",
                    backgroundColor: isExpanded ? "#ffffff" : isRelated ? "rgba(255, 255, 255, 0.5)" : "#000000",
                    color: isExpanded || isRelated ? "#000000" : "#ffffff",
                    transition: "all 0.3s ease",
                    transform: isExpanded ? "scale(1.4)" : "scale(1)",
                    boxShadow: isExpanded ? "0 10px 15px -3px rgba(255, 255, 255, 0.3)" : "none"
                  }}
                  className={isRelated ? "animate-pulse" : ""}
                >
                  <Icon size={16} />
                </div>

                {/* Title label */}
                <div
                  style={{
                    position: "absolute",
                    top: "48px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    whiteSpace: "nowrap",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    color: isExpanded ? "#ffffff" : "rgba(255, 255, 255, 0.7)",
                    transition: "all 0.3s ease"
                  }}
                >
                  {item.title}
                </div>

                {isExpanded && (
                  <div 
                    style={{
                      position: "absolute",
                      top: "80px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "256px",
                      backgroundColor: "rgba(0, 0, 0, 0.92)",
                      backdropFilter: "blur(16px)",
                      WebkitBackdropFilter: "blur(16px)",
                      border: "1px solid rgba(255, 255, 255, 0.25)",
                      borderRadius: "12px",
                      padding: "16px",
                      boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 0 15px rgba(255, 255, 255, 0.05)",
                      zIndex: 300,
                      color: "#ffffff",
                      fontFamily: "var(--font-family)"
                    }}
                  >
                    <div style={{ position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)", width: "1px", height: "12px", backgroundColor: "rgba(255, 255, 255, 0.5)" }}></div>
                    
                    {/* Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span 
                        style={{ 
                          padding: "2px 8px", 
                          borderRadius: "9999px", 
                          fontSize: "9px", 
                          fontWeight: 700, 
                          border: "1px solid", 
                          color: item.status === "completed" ? "#ffffff" : item.status === "in-progress" ? "#000000" : "#ffffff", 
                          backgroundColor: item.status === "completed" ? "#000000" : item.status === "in-progress" ? "#ffffff" : "rgba(0,0,0,0.4)", 
                          borderColor: item.status === "completed" ? "#ffffff" : item.status === "in-progress" ? "#000000" : "rgba(255,255,255,0.5)" 
                        }}
                      >
                        {item.status === "completed" ? "COMPLETE" : item.status === "in-progress" ? "IN PROGRESS" : "PENDING"}
                      </span>
                      <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                        {item.date}
                      </span>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", margin: "6px 0", lineHeight: 1.3 }}>
                      {item.title}
                    </div>

                    {/* Content */}
                    <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.8)", margin: "0 0 12px 0", lineHeight: 1.4, textAlign: "left" }}>
                      {item.content}
                    </p>

                    {/* Progress Bar */}
                    <div style={{ paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", marginBottom: "4px", color: "rgba(255, 255, 255, 0.7)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <Zap size={10} style={{ color: "#eab308" }} />
                          System Health
                        </span>
                        <span style={{ fontFamily: "monospace" }}>{item.energy}%</span>
                      </div>
                      <div style={{ width: "100%", height: "4px", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: "9999px", overflow: "hidden" }}>
                        <div
                          style={{ height: "100%", background: "linear-gradient(to right, #3b82f6, #a855f7)", width: `${item.energy}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Linked nodes */}
                    {item.relatedIds.length > 0 && (
                      <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "rgba(255, 255, 255, 0.6)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: "6px" }}>
                          <span>Linked Workflow Steps</span>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {item.relatedIds.map((relatedId) => {
                            const relatedItem = timelineData.find((i) => i.id === relatedId);
                            return (
                              <button
                                key={relatedId}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  height: "20px",
                                  padding: "0 6px",
                                  fontSize: "10px",
                                  backgroundColor: "transparent",
                                  border: "1px solid rgba(255, 255, 255, 0.2)",
                                  color: "rgba(255, 255, 255, 0.8)",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  transition: "all 0.2s"
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleItem(relatedId);
                                }}
                              >
                                {relatedItem?.title.split(". ")[1] || relatedItem?.title}
                                <ArrowRight size={8} style={{ marginLeft: "2px", opacity: 0.6 }} />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
