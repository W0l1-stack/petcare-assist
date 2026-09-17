export function haversineKm(a, b) {
  const R = 6371;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export function createGpsTracker(onUpdate, onError) {
  if (!navigator.geolocation) throw new Error('GPS is not available in this browser.');
  let last = null;
  let distance = 0;
  const watchId = navigator.geolocation.watchPosition(
    position => {
      const point = { lat: position.coords.latitude, lon: position.coords.longitude, accuracy: position.coords.accuracy, timestamp: position.timestamp };
      if (last && point.accuracy <= 80) {
        const delta = haversineKm(last, point);
        if (delta < 0.15) distance += delta;
      }
      if (!last || point.accuracy <= 80) last = point;
      onUpdate({ point, distance });
    },
    error => onError?.(error),
    { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
  );
  return () => navigator.geolocation.clearWatch(watchId);
}
