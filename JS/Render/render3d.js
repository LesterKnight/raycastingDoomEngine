import { 
    CTX_3D
} from '../config.js';

export function renderRay3D(a,b, color = "rgb(255, 123, 0)"){
        CTX_3D.strokeStyle = color
        CTX_3D.beginPath();
        CTX_3D.moveTo(a.x, a.y);
        CTX_3D.lineTo(b.x, b.y);
        CTX_3D.stroke();
        CTX_3D.closePath()
    }

export function renderPlayer3D(player){
    //


/*/
    let  radius = 15
    CTX_3D.lineWidth = 3

    CTX_3D.strokeStyle = "red";
    CTX_3D.beginPath();
    CTX_3D.arc(0, 0, radius, 0, 2 * Math.PI, false);
    CTX_3D.stroke();//fill
    CTX_3D.closePath()

    //let stroke = rayCasting(player.posicao.x,player.posicao.y,player.angle, radius*2)
*/

}

export default {renderPlayer3D,renderRay3D}