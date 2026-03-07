import * as React from 'react';

import { useQrReader } from './hooks';
import { styles } from './styles';
import { QrReaderProps } from './types';

const QrReader: React.FC<QrReaderProps> = ({
    // videoContainerStyle,
    // containerStyle,
    videoStyle,
    constraints,
    // ViewFinder,
    scanDelay,
    // className,
    onResult,
    onError,
    videoId,
    deviceIndex,
}) => {
    useQrReader({
        constraints,
        scanDelay,
        onResult,
        videoId,
        onError,
        deviceIndex,
    });

    return (
        <>
            {/* <div className={className} style={containerStyle}>
      <div
        style={{
          ...styles.container,
          ...videoContainerStyle,
        }}
      >
        {!!ViewFinder && <ViewFinder />} */}
            <video
                muted
                id={videoId}
                style={{
                    ...styles.video,
                    ...videoStyle,
                    // transform: constraints?.facingMode === 'environment' && 'scaleX(-1)',
                }}
            />
            {/* </div>
    </div> */}
        </>
    );
};

QrReader.displayName = 'QrReader';
QrReader.defaultProps = {
    constraints: {
        facingMode: 'user',
    },
    videoId: 'video',
    scanDelay: 500,
};

export { QrReader };
export default QrReader;
