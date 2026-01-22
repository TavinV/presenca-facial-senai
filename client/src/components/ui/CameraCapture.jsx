import { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [cameraError, setCameraError] = useState(null);
  const [totemApiKey, setTotemApiKey] = useState("");

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error(err);
        setCameraError(
          "Não foi possível acessar a câmera. Verifique permissões ou dispositivo.",
        );
      }
    }

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function takePhoto() {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], "face.png", { type: "image/png" });

      onCapture({
        file,
        totemApiKey,
      });
    });
  }

  return (
    <div style={{ textAlign: "center" }}>
      {cameraError ? (
        <p style={{ color: "red" }}>{cameraError}</p>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: "100%", maxWidth: 400, borderRadius: 8 }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          {/* Input discreto */}
          <input
            type="password"
            placeholder="Chave do Totem"
            value={totemApiKey}
            onChange={(e) => setTotemApiKey(e.target.value)}
            style={{
              position: "absolute",
              bottom: 10,
              right: 10,
              width: 180,
              opacity: 0.5,
            }}
          />

          <button
            onClick={takePhoto}
            disabled={!totemApiKey}
            style={{ marginTop: 16 }}
          >
            Reconhecer Presença
          </button>
        </>
      )}
    </div>
  );
}
