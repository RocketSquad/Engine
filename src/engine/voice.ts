const synth = window.speechSynthesis;
const synthVoice: Promise<SpeechSynthesisVoice> = new Promise(resolve => {
    synth.onvoiceschanged = () => synth.getVoices().forEach(voice => {
        if(voice.name === 'Google UK English Male') {
            resolve(voice);
        }
    });
});

export const SayIt = async (text: string) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.voice = await synthVoice;
    utter.pitch = 1;
    utter.rate = 0.8;

    synth.speak(utter);
};
