import { useRef, useEffect, useCallback } from 'react';

// ═══════════════════════════════════════════════════
//  MATH HELPERS
// ═══════════════════════════════════════════════════

function latLngToXYZ(lat, lng, radius) {
    const phi = ((90 - lat) * Math.PI) / 180;
    const theta = ((lng + 180) * Math.PI) / 180;
    return [
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta),
    ];
}

function rotateY(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x * cos + z * sin, y, -x * sin + z * cos];
}

function rotateX(x, y, z, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [x, y * cos - z * sin, y * sin + z * cos];
}

function project(x, y, z, cx, cy, fov) {
    const scale = fov / (fov + z);
    return [x * scale + cx, y * scale + cy, z];
}

// ═══════════════════════════════════════════════════
//  DEFAULT DATA — Industrial Safety Hotspots
// ═══════════════════════════════════════════════════

const DEFAULT_MARKERS = [
    { lat: 13.08, lng: 80.27, label: 'Chennai' },
    { lat: 19.08, lng: 72.88, label: 'Mumbai' },
    { lat: 25.27, lng: 55.30, label: 'Dubai' },
    { lat: 51.51, lng: -0.13, label: 'London' },
    { lat: 37.78, lng: -122.42, label: 'San Francisco' },
    { lat: 35.68, lng: 139.69, label: 'Tokyo' },
    { lat: 1.35, lng: 103.82, label: 'Singapore' },
    { lat: -33.87, lng: 151.21, label: 'Sydney' },
    { lat: 55.76, lng: 37.62, label: 'Moscow' },
    { lat: -23.55, lng: -46.63, label: 'São Paulo' },
];

const DEFAULT_CONNECTIONS = [
    { from: [13.08, 80.27], to: [25.27, 55.30] },
    { from: [13.08, 80.27], to: [1.35, 103.82] },
    { from: [19.08, 72.88], to: [51.51, -0.13] },
    { from: [51.51, -0.13], to: [37.78, -122.42] },
    { from: [37.78, -122.42], to: [35.68, 139.69] },
    { from: [35.68, 139.69], to: [-33.87, 151.21] },
    { from: [1.35, 103.82], to: [-33.87, 151.21] },
    { from: [25.27, 55.30], to: [55.76, 37.62] },
    { from: [51.51, -0.13], to: [-23.55, -46.63] },
    { from: [19.08, 72.88], to: [25.27, 55.30] },
];

// ═══════════════════════════════════════════════════
//  INTERACTIVE GLOBE COMPONENT (Canvas-Based)
// ═══════════════════════════════════════════════════

const InteractiveGlobe = ({
    className = '',
    size = 600,
    dotColor = 'rgba(16, 185, 129, ALPHA)',
    arcColor = 'rgba(56, 189, 248, 0.45)',
    markerColor = 'rgba(16, 185, 129, 1)',
    autoRotateSpeed = 0.002,
    connections = DEFAULT_CONNECTIONS,
    markers = DEFAULT_MARKERS,
}) => {
    const canvasRef = useRef(null);
    const rotYRef = useRef(0.4);
    const rotXRef = useRef(0.3);
    const dragRef = useRef({
        active: false, startX: 0, startY: 0, startRotY: 0, startRotX: 0,
    });
    const animRef = useRef(0);
    const timeRef = useRef(0);
    const dotsRef = useRef([]);

    // Generate Fibonacci sphere dots
    useEffect(() => {
        const dots = [];
        const numDots = 1200;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        for (let i = 0; i < numDots; i++) {
            const theta = (2 * Math.PI * i) / goldenRatio;
            const phi = Math.acos(1 - (2 * (i + 0.5)) / numDots);
            const x = Math.cos(theta) * Math.sin(phi);
            const y = Math.cos(phi);
            const z = Math.sin(theta) * Math.sin(phi);
            dots.push([x, y, z]);
        }
        dotsRef.current = dots;
    }, []);

    // Main draw loop
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const w = (canvas.parentElement?.clientWidth || size) - 40;
        const h = w; // Keep it square based on width
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.scale(dpr, dpr);

        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.42;
        const fov = 800;

        // Auto rotate
        if (!dragRef.current.active) {
            rotYRef.current += autoRotateSpeed;
        }

        timeRef.current += 0.015;
        const time = timeRef.current;

        ctx.clearRect(0, 0, w, h);

        // Outer glow
        const glowGrad = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
        glowGrad.addColorStop(0, 'rgba(16, 185, 129, 0.08)');
        glowGrad.addColorStop(1, 'rgba(16, 185, 129, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(0, 0, w, h);

        // Globe outline
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        const ry = rotYRef.current;
        const rx = rotXRef.current;

        // Draw dots
        const dots = dotsRef.current;
        for (let i = 0; i < dots.length; i++) {
            let [x, y, z] = dots[i];
            x *= radius;
            y *= radius;
            z *= radius;

            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);

            if (z > 0) continue; // back-face cull

            const [sx, sy] = project(x, y, z, cx, cy, fov);
            const depthAlpha = Math.max(0.1, 1 - (z + radius) / (2 * radius));
            const dotSize = 1 + depthAlpha * 0.8;

            ctx.beginPath();
            ctx.arc(sx, sy, dotSize, 0, Math.PI * 2);
            ctx.fillStyle = dotColor.replace('ALPHA', depthAlpha.toFixed(2));
            ctx.fill();
        }

        // Draw connections as arcs
        for (const conn of connections) {
            const [lat1, lng1] = conn.from;
            const [lat2, lng2] = conn.to;

            let [x1, y1, z1] = latLngToXYZ(lat1, lng1, radius);
            let [x2, y2, z2] = latLngToXYZ(lat2, lng2, radius);

            [x1, y1, z1] = rotateX(x1, y1, z1, rx);
            [x1, y1, z1] = rotateY(x1, y1, z1, ry);
            [x2, y2, z2] = rotateX(x2, y2, z2, rx);
            [x2, y2, z2] = rotateY(x2, y2, z2, ry);

            if (z1 > radius * 0.3 && z2 > radius * 0.3) continue;

            const [sx1, sy1] = project(x1, y1, z1, cx, cy, fov);
            const [sx2, sy2] = project(x2, y2, z2, cx, cy, fov);

            // Elevated midpoint for arc
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            const midZ = (z1 + z2) / 2;
            const midLen = Math.sqrt(midX * midX + midY * midY + midZ * midZ);
            const arcHeight = radius * 1.25;
            const elevX = (midX / midLen) * arcHeight;
            const elevY = (midY / midLen) * arcHeight;
            const elevZ = (midZ / midLen) * arcHeight;
            const [scx, scy] = project(elevX, elevY, elevZ, cx, cy, fov);

            ctx.beginPath();
            ctx.moveTo(sx1, sy1);
            ctx.quadraticCurveTo(scx, scy, sx2, sy2);
            ctx.strokeStyle = arcColor;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Traveling dot along arc
            const t = (Math.sin(time * 1.2 + lat1 * 0.1) + 1) / 2;
            const tx = (1 - t) * (1 - t) * sx1 + 2 * (1 - t) * t * scx + t * t * sx2;
            const ty = (1 - t) * (1 - t) * sy1 + 2 * (1 - t) * t * scy + t * t * sy2;

            ctx.beginPath();
            ctx.arc(tx, ty, 2, 0, Math.PI * 2);
            ctx.fillStyle = markerColor;
            ctx.fill();
        }

        // Draw markers
        for (const marker of markers) {
            let [x, y, z] = latLngToXYZ(marker.lat, marker.lng, radius);
            [x, y, z] = rotateX(x, y, z, rx);
            [x, y, z] = rotateY(x, y, z, ry);

            if (z > radius * 0.1) continue;

            const [sx, sy] = project(x, y, z, cx, cy, fov);

            // Pulse ring
            const pulse = Math.sin(time * 2 + marker.lat) * 0.5 + 0.5;
            ctx.beginPath();
            ctx.arc(sx, sy, 4 + pulse * 4, 0, Math.PI * 2);
            ctx.strokeStyle = markerColor.replace('1)', `${(0.2 + pulse * 0.15).toFixed(2)})`);
            ctx.lineWidth = 1;
            ctx.stroke();

            // Core dot
            ctx.beginPath();
            ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = markerColor;
            ctx.fill();

            // Label
            if (marker.label) {
                ctx.font = '10px Inter, system-ui, sans-serif';
                ctx.fillStyle = markerColor.replace('1)', '0.6)');
                ctx.fillText(marker.label, sx + 8, sy + 3);
            }
        }

        animRef.current = requestAnimationFrame(draw);
    }, [dotColor, arcColor, markerColor, autoRotateSpeed, connections, markers]);

    useEffect(() => {
        animRef.current = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(animRef.current);
    }, [draw]);

    // Mouse drag handlers
    const onPointerDown = useCallback((e) => {
        dragRef.current = {
            active: true,
            startX: e.clientX,
            startY: e.clientY,
            startRotY: rotYRef.current,
            startRotX: rotXRef.current,
        };
        e.target.setPointerCapture(e.pointerId);
    }, []);

    const onPointerMove = useCallback((e) => {
        if (!dragRef.current.active) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        rotYRef.current = dragRef.current.startRotY + dx * 0.005;
        rotXRef.current = Math.max(-1, Math.min(1, dragRef.current.startRotX + dy * 0.005));
    }, []);

    const onPointerUp = useCallback(() => {
        dragRef.current.active = false;
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`cursor-grab active:cursor-grabbing ${className}`}
            style={{ width: size, height: size }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
        />
    );
};

export default InteractiveGlobe;
