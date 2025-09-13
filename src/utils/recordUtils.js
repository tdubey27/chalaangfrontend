export const startMicrophoneRecording = async ({
  setRecorder,
  setStartTime,
  setUploadTimer,
  audioBuffer,
  sendAudioToBackend,
}) => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
    setRecorder(mediaRecorder);

    const initialStartTime = Date.now();
    setStartTime(initialStartTime);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioBuffer.push(event.data); // Push collected audio data chunks into buffer
        console.log("Audio chunk collected:", event.data);
      }
    };

    mediaRecorder.start(500); // Start recording with data collection every 500ms

    const interval = setInterval(() => {
      if (audioBuffer.length > 0) {
        const chunk = audioBuffer.shift(); // Remove the first chunk from buffer
        const timestamp = Date.now() - initialStartTime; // Elapsed time since recording started
        sendAudioToBackend(chunk, timestamp); // Send audio chunk to backend
      } else {
        console.log("Audio buffer empty...");
      }
    }, 4000); // Upload every 1 second

    setUploadTimer(interval);
  } catch (err) {
    console.error("Error starting microphone:", err);
  }
};

export const stopMicrophoneRecording = async ({
  recorder,
  audioBuffer,
  setUploadTimer,
  sendAudioToBackend,
  startTime,
}) => {
  // Check if the recorder is already stopped or not initialized
  if (!recorder || recorder.state === "inactive") {
    console.log("Recorder is already stopped or not initialized.");
    return;
  }

  console.log("Stopping recorder...");
  recorder.stop(); // Stop the MediaRecorder

  recorder.onstop = async () => {
    console.log("Recorder stopped. Flushing remaining audio chunks...");

    // Flush remaining audio chunks in the buffer
    for (const chunk of audioBuffer) {
      const timestamp = Date.now() - startTime;
      await sendAudioToBackend(chunk, timestamp); // Send final chunks to the backend
    }

    audioBuffer.length = 0; // Clear the buffer
    console.log("All remaining chunks uploaded.");
  };

  // Clear periodic uploads
  if (setUploadTimer) {
    clearInterval(setUploadTimer);
    console.log("Timer for periodic uploads cleared.");
  }

  console.log("Recording session fully stopped.");
};;


export const sendAudioToBackend = async (chunk, timestamp, meetingId, user) => {
  try {
    // Convert audio chunk to WAV format
    const audioBlob = new Blob([chunk], { type: "audio/wav" });

    const formData = new FormData();
    // Attach audio Blob with explicit ".wav" filename
    formData.append("audioBlob", audioBlob, `audio_${timestamp}.wav`); // Include filename with extension `.wav`
    formData.append("timestamp", timestamp.toString()); // Attach timestamp
    formData.append("meetingId", meetingId); // Attach meeting ID
    formData.append("user", user); // Attach user role (e.g., "Doctor", "Patient")

    const response = await fetch("http://localhost:8001/api/v1/transcribe", {
      method: "POST",
      body: formData, // Send FormData payload
    });

    if (!response.ok) {
      throw new Error(`Audio upload failed with status: ${response.statusText}`);
    }

    console.log("Audio chunk uploaded successfully.");
  } catch (error) {
    console.error("Error uploading audio chunk:", error);
  }
};