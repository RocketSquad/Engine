import * as React from 'react';
import * as ReactDOM from 'react-dom';

// http://media.tojicode.com/webgl-samples/hud-test.html

class Hud {
  health: number;
  ammo: number;
  clipSize: number;
  logObj: string[];

  render() {
    ReactDOM.render(
      <div>
        <div id="health">
          <b>HP:</b> {hwnd.hud.health}
        </div>
        <div id="ammo">
          <b>Ammo:</b> {hwnd.hud.ammo}/{hwnd.hud.clipSize}
        </div>
      </div>,
      document.getElementById('hud')
    );
  }
}

/*       
         <div id="log">{
          hwnd.hud.logObj.forEach((element) => {
            <div>{element}</div>
          })}
        </div>
*/

export interface IHudWindow extends Window {
  hud: Hud;
}

let hwnd = window as IHudWindow;
hwnd.hud = new Hud();
hwnd.hud.health = 7;
hwnd.hud.ammo = 50;
hwnd.hud.clipSize = 100;
hwnd.hud.logObj = ["abc", "def"];
