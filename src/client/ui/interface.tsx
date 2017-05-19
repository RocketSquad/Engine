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

  renderFallback() {
    ReactDOM.render(
      <div>
      </div>,
      document.getElementById('hud')
    );
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

ReactDOM.render(<Hud {...{health: 7, ammo: 4, clipSize: 8}} />, document.getElementById("hud"));
