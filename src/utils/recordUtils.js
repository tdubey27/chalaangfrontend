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
    }, 1000); // Upload every 1 second

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
  // Return if recorder is already inactive
  if (!recorder || recorder.state === "inactive") {
    console.log("Recorder already stopped.");
    return;
  }

  // Stop the MediaRecorder
  recorder.stop();

  recorder.onstop = async () => {
    console.log("Recorder stopped. Flushing remaining audio chunks...");

    // Process remaining chunks in the buffer
    for (const chunk of audioBuffer) {
      const timestamp = Date.now() - startTime; // Calculate elapsed time
      await sendAudioToBackend(chunk, timestamp); // Send remaining chunks
    }

    // Clear the buffer after uploading all chunks
    audioBuffer.length = 0;
    console.log("Final audio chunks uploaded, and buffer cleared.");
  };

  // Stop periodic upload interval
  if (setUploadTimer) {
    clearInterval(setUploadTimer); // Clear the interval
    console.log("Periodic uploads stopped.");
  }

  console.log("Recording session fully stopped.");
};


export const sendAudioToBackend = async (chunk, timestamp, meetingId, role) => {
  try {
    const audioBlob = new Blob([chunk], { type: "audio/wav" }); // Convert chunk to WAV format

    const formData = new FormData();
    formData.append("audioBlob", audioBlob); // Attach audio blob
    formData.append("timestamp", timestamp.toString()); // Attach timestamp
    formData.append("meetingId", meetingId); // Attach meeting ID
    formData.append("role", role); // Attach user role (e.g., "Doctor", "Patient")

    const response = await fetch("http://localhost:8080/upload-audio-chunk", {
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