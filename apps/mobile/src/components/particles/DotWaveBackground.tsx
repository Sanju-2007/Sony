import React, { useEffect, useRef } from "react";
import { StyleSheet, View, Platform, useWindowDimensions } from "react-native";
import { useThemeStore } from "../../store/themeStore";

interface DotWaveBackgroundProps {
  speed?: number;
  density?: "normal" | "dense";
}

export const DotWaveBackground: React.FC<DotWaveBackgroundProps> = ({
  speed = 1.0,
  density = "normal",
}) => {
  const { width, height } = useWindowDimensions();
  const { isDark } = useThemeStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== "web") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    const resize = () => {
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resize();

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);

    // 3D Perspective Plane Parameters
    const cols = density === "dense" ? 55 : 44;
    const rows = density === "dense" ? 40 : 32;

    const render = () => {
      time += 0.018 * speed;
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Camera / horizon setup
      const fov = 380;
      const cameraY = -120;
      const cameraZ = -180;
      const horizonY = h * 0.42;

      // Mouse tilt
      const mouseNormX = (mouseX / w - 0.5) * 2;
      const mouseNormY = (mouseY / h - 0.5) * 2;

      for (let r = 0; r < rows; r++) {
        // z from near to far
        const zFraction = r / (rows - 1);
        const worldZ = 80 + zFraction * 700;

        for (let c = 0; c < cols; c++) {
          const xFraction = (c / (cols - 1) - 0.5) * 2;
          const worldX = xFraction * (w * 0.78) + mouseNormX * 30;

          // Double wave formula with traveling frequency
          const distFromMouse = Math.hypot(
            (c / cols) * w - mouseX,
            (r / rows) * h - mouseY
          );
          const ripple = Math.sin(distFromMouse * 0.04 - time * 3) * Math.max(0, 1 - distFromMouse / 380) * 16;

          const wave1 = Math.sin(c * 0.28 + time * 2.2) * 22;
          const wave2 = Math.cos(r * 0.32 + time * 1.8) * 18;
          const wave3 = Math.sin((c * 0.2 + r * 0.2) + time) * 12;

          const worldY = wave1 + wave2 + wave3 + ripple + (mouseNormY * 20);

          // 3D Perspective projection
          const relZ = worldZ - cameraZ;
          if (relZ <= 0) continue;

          const scale = fov / relZ;
          const screenX = w / 2 + (worldX) * scale;
          const screenY = horizonY + (worldY - cameraY) * scale;

          if (screenX < -20 || screenX > w + 20 || screenY < -20 || screenY > h + 20) {
            continue;
          }

          // Depth attenuation for dot radius and opacity
          const depthFade = Math.max(0.1, Math.min(1, 1 - (worldZ - 80) / 700));
          const radius = Math.max(0.6, (1.1 + depthFade * 1.9) * scale * 0.9);
          const alpha = Math.max(0.04, Math.min(0.65, 0.08 + depthFade * 0.55));

          ctx.beginPath();
          ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
          ctx.fillStyle = isDark
            ? `rgba(240, 245, 255, ${alpha * 0.85})`
            : `rgba(15, 15, 20, ${alpha})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [width, height, speed, density, isDark]);

  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: isDark ? "#090A0F" : "#FFFFFF" },
        ]}
        pointerEvents="none"
      >
        {/* @ts-ignore */}
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#090A0F" : "#FFFFFF" },
      ]}
      pointerEvents="none"
    />
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
});
