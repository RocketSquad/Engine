import {Howl} from 'howler';

export default class SoundFX {
    sfx: Howl;
    playing: boolean;

    constructor(path: string) {
        this.sfx = new Howl({
            src: [path],
            onend: () => {
                this.playing = false;
            },
        });
        this.playing = false;
    }

    play() {
        if(!this.playing) {
            this.playing = true;
            this.sfx.play();
        }
    }

    stop() {
        if(this.playing) {
            this.sfx.stop();
        }
    }
}
