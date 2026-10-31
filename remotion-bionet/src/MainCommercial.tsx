import React from "react";
import { Sequence } from "remotion";
import { Scene1Hero } from "./scenes/Scene1Hero";
import { Scene2Binary } from "./scenes/Scene2Binary";
import { Scene3AISuite } from "./scenes/Scene3AISuite";
import { Scene4Products } from "./scenes/Scene4Products";
import { Scene5CTA } from "./scenes/Scene5CTA";

export const MainCommercial: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "#021c15",
        overflow: "hidden",
      }}
    >
      {/* Scene 1: Intro Hook & Branding PT Bionet */}
      <Sequence from={0} durationInFrames={150}>
        <Scene1Hero />
      </Sequence>

      {/* Scene 2: Binary Network & Flip.id Instant Payout */}
      <Sequence from={150} durationInFrames={180}>
        <Scene2Binary />
      </Sequence>

      {/* Scene 3: 7 Fitur Cerdas AI Hub & Marketing Kit */}
      <Sequence from={330} durationInFrames={180}>
        <Scene3AISuite />
      </Sequence>

      {/* Scene 4: BPOM Herbal Flagship Products */}
      <Sequence from={510} durationInFrames={180}>
        <Scene4Products />
      </Sequence>

      {/* Scene 5: Free Replica Website & CTA */}
      <Sequence from={690} durationInFrames={150}>
        <Scene5CTA />
      </Sequence>
    </div>
  );
};

