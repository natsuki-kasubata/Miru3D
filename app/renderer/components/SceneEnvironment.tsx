import React from 'react';
import { Grid, Environment } from '@react-three/drei';

interface SceneEnvironmentProps {
  showGrid: boolean;
}

export const SceneEnvironment: React.FC<SceneEnvironmentProps> = ({ showGrid }) => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />
      <Environment preset="city" background={false} />
      {showGrid && (
        <Grid
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#333333"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#555555"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />
      )}
    </>
  );
};
