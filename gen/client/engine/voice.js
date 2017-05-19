"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const synth = window.speechSynthesis;
const synthVoice = new Promise(resolve => {
    synth.onvoiceschanged = () => synth.getVoices().forEach(voice => {
        if (voice.name === 'Google UK English Male') {
            resolve(voice);
        }
    });
});
exports.SayIt = async (text) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = await synthVoice;
    utter.pitch = 1;
    utter.rate = 0.8;
    synth.speak(utter);
};
