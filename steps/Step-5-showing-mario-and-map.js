import {startGame, vdp, color} from "../lib/vdp-lib";
import {clamp, getMapBlock, setMapBlock, TextLayer} from './utils';

function *main() {
	vdp.configBackdropColor('#59f');

	while (true) {
		vdp.drawBackgroundTilemap('level1');
		vdp.drawObject(vdp.sprite('mario').tile(6), 0, 0);
		yield;
	}
}

startGame('#glCanvas', vdp => main(vdp));
