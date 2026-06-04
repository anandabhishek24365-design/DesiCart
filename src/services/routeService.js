export const fetchRoute = async (startCoords, endCoords) => {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const coordinates = data.routes[0].geometry.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0]
        }));
        const distance = data.routes[0].distance; // in meters
        const duration = data.routes[0].duration; // in seconds
        return { coordinates, distance, duration };
      }
    }
  } catch (error) {
    console.error("OSRM Route Fetching failed:", error);
  }
  
  // Fallback: Generate linear points if API fails or rate-limited
  const steps = 30;
  const coordinates = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    coordinates.push({
      lat: startCoords.lat + (endCoords.lat - startCoords.lat) * t,
      lng: startCoords.lng + (endCoords.lng - startCoords.lng) * t
    });
  }
  return { coordinates, distance: 1500, duration: 300 }; // fallback default values
};
