import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import { BrowserMultiFormatReader } from '@zxing/library';

/**
 * Opens the camera to scan a QR Code of an `ObjectId` from an item document on mobile
 */
const QRScanner = () => {
  const videoRef = useRef(null);
  const history = useHistory();
  const codeReader = new BrowserMultiFormatReader();

  const getMainCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } }
      });
      const [track] = stream.getVideoTracks();
      const mainCameraId = track.getCapabilities().deviceId;
      track.stop();

      if (mainCameraId) return mainCameraId;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');

      const rearCamera = videoDevices.find((device) =>
        device.label.toLocaleLowerCase().includes('back') || device.label.toLocaleLowerCase().includes('rear')
      );

      if (rearCamera) return rearCamera.deviceId;

      return videoDevices[0]?.deviceId || null;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  useEffect(() => {
    let track = null;

    (async () => {
      try {
        const cameraId = await getMainCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: cameraId } }
        });

        [track] = stream.getVideoTracks();
        const capabilities = track.getCapabilities();
        if (capabilities.zoom) {
          const zoomLevel = (capabilities.zoom.min + capabilities.zoom.max) / 2;

          await track.applyConstraints({
            advanced: [{ zoom: zoomLevel }]
          });
        } else {
          console.warn('Zoom not supported on this device');
        }

        codeReader.decodeFromVideoDevice(cameraId, videoRef.current, (result) => {
          if (result) {
            history.push(`/itemOverview?id=${result.getText()}`);
          }
        });
      } catch (error) {
        console.error(error);
      }
    })();

    return () => {
      codeReader.reset();
      track?.stop();
    };
  }, [codeReader, history]);

  return (
    <div>
      <h1>Scan QR Code</h1>
      <video ref={videoRef} style={{ width: '100%' }} />
    </div>
  );
};

export default QRScanner;
