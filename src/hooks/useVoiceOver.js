import { useState, useRef, useCallback, useEffect } from "react";
import { IS_WEB } from "../theme";

let Audio;
try {
  Audio = require("expo-av").Audio;
} catch (e) {
  Audio = null;
}

export function useVoiceOver() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [hasVoiceOver, setHasVoiceOver] = useState(false);
  const [voiceOverUri, setVoiceOverUri] = useState(null);
  const [supported, setSupported] = useState(true);

  const recordingRef = useRef(null);
  const soundRef = useRef(null);
  const webRecorderRef = useRef(null);
  const webChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      soundRef.current?.unloadAsync?.();
    };
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (IS_WEB) {
        if (!navigator.mediaDevices?.getUserMedia) {
          setSupported(false);
          return false;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        webChunksRef.current = [];
        recorder.ondataavailable = (e) => webChunksRef.current.push(e.data);
        recorder.start();
        webRecorderRef.current = recorder;
        setIsRecording(true);
        return true;
      }

      if (!Audio) {
        setSupported(false);
        return false;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") return false;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      return true;
    } catch {
      setSupported(false);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (IS_WEB && webRecorderRef.current) {
        return new Promise((resolve) => {
          webRecorderRef.current.onstop = () => {
            const blob = new Blob(webChunksRef.current, { type: "audio/webm" });
            const uri = URL.createObjectURL(blob);
            setVoiceOverUri(uri);
            setHasVoiceOver(true);
            setIsRecording(false);
            webRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
            webRecorderRef.current = null;
            resolve(uri);
          };
          webRecorderRef.current.stop();
        });
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        recordingRef.current = null;
        setVoiceOverUri(uri);
        setHasVoiceOver(true);
        setIsRecording(false);
        await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
        return uri;
      }
    } catch {
      setIsRecording(false);
    }
    return null;
  }, []);

  const playVoiceOver = useCallback(async (uri) => {
    const playUri = uri || voiceOverUri;
    if (!playUri) return;

    try {
      if (IS_WEB) {
        const audio = new window.Audio(playUri);
        audio.onended = () => setIsPlayingVoice(false);
        audio.play();
        setIsPlayingVoice(true);
        return;
      }

      if (!Audio) return;

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync({ uri: playUri });
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          setIsPlayingVoice(false);
        }
      });
      setIsPlayingVoice(true);
      await sound.playAsync();
    } catch {
      setIsPlayingVoice(false);
    }
  }, [voiceOverUri]);

  const stopVoiceOver = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
    } catch {}
    setIsPlayingVoice(false);
  }, []);

  const deleteVoiceOver = useCallback(() => {
    soundRef.current?.unloadAsync?.();
    soundRef.current = null;
    setVoiceOverUri(null);
    setHasVoiceOver(false);
  }, []);

  const loadVoiceOver = useCallback((uri) => {
    setVoiceOverUri(uri);
    setHasVoiceOver(!!uri);
  }, []);

  return {
    isRecording,
    isPlayingVoice,
    hasVoiceOver,
    voiceOverUri,
    supported,
    startRecording,
    stopRecording,
    playVoiceOver,
    stopVoiceOver,
    deleteVoiceOver,
    loadVoiceOver,
  };
}
