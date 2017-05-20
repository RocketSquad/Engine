import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface IHudWindow extends Window {
  hud: Hud;
}
export interface HudProps {
  health: number;
  ammo: number;
  clipSize: number;
 }
class Hud extends React.Component<HudProps, HudProps> {
  constructor(hudOpts: HudProps) {
    super();
    
    let hwnd = window as IHudWindow;
    hwnd.hud = this;

    this.state = hudOpts;
    this.updateStats = this.updateStats.bind(this);
  }
  updateStats(newHealth: number) {
    let newAmmo = 2;
    let newClipSize = 10;
    this.setState({
      health: newHealth,
      ammo: newAmmo,
      clipSize: newClipSize
    });
  }
  render() {
    return (
      <div>
        <div id="health">
         <b>HP:</b> {Math.floor(this.state.health)} 
        </div>
        <div id="ammo">
          <b>Ammo:</b> {this.state.ammo}/{this.state.clipSize}
        </div>
      </div>
    );
  }
}

/*       
         <div id="log">{
          hwnd.hud.logObj.forEach((element) => {
            <div>{element}</div>
          })}
        </div>
hwnd.hud.logObj = ["abc", "def"];
*/

ReactDOM.render(<Hud {...{health: 7, ammo: 4, clipSize: 8}} />, document.getElementById("hud"));