import * as React from 'react';
import * as ReactDOM from 'react-dom';

const health = 100
const ammo = 50;
const clipSize = 100;
const logObj = ["abc", "def"];

ReactDOM.render(
  <div>
    <div id="health">
      <b>HP:</b> {health}
    </div>
    <div id="ammo">
      <b>Ammo:</b> {ammo}/{clipSize}
    </div>
    <div id="log">{
      logObj.forEach((element) => {
        console.log(element);
        <div>{element}</div>
      })}
    </div>
  </div>,
  document.getElementById('hud')
);
