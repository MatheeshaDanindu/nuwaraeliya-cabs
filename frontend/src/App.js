import React, { useEffect, useState } from 'react';

function App() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/vehicles')
      .then(res => res.json())
      .then(data => setVehicles(data));
  }, []);

  return (
    <div>
      <h1>Available Vehicles</h1>
      <ul>
        {vehicles.map(vehicle => (
          <li key={vehicle.id}>{vehicle.model} - {vehicle.number_plate}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
