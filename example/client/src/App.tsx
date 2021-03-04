import React from 'react';

function App() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <p>Client Origin: {window.location.origin}</p>
    </div>
  );
}

export default App;
