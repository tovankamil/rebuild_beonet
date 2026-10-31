import React from "react";
import { Composition } from "remotion";
import { MainCommercial } from "./MainCommercial";
import { VerticalCommercial } from "./VerticalCommercial";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 1. Main Landscape 16:9 Commercial Video (1920 x 1080) */}
      <Composition
        id="BionetCommercialVideo"
        component={MainCommercial}
        durationInFrames={840}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />

      {/* 2. Vertical 9:16 Commercial Video for TikTok, Reels & WhatsApp Stories (1080 x 1920) */}
      <Composition
        id="BionetShortsVertical"
        component={VerticalCommercial}
        durationInFrames={510}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
