import {startGame, vdp, color} from "../lib/vdp-lib";
import {clamp, getMapBlock, setMapBlock, TextLayer} from './utils';

function collidesAtPosition(left, top) {
	const collidables = [38, 11, 12, 18, 19, 24, 25, 16, 13];
	return collidables.includes(getMapBlock('level1', Math.floor(left / 16), Math.floor(top / 16)));
}

function *main() {
	const textLayer = new TextLayer();
	const input = vdp.input;
	const mario = {
		left: 0,
		top: 0,
		width: 16,
		height: 16,
		get right() { return this.left + this.width; },
		get bottom() { return this.top + this.height; },
		horizontalVelocity: 0,
		verticalVelocity: 0,
		facingLeft: false,
		animation: 0,
		get grounded() {
			return collidesAtPosition(mario.left, mario.bottom + 2) || collidesAtPosition(mario.right, mario.bottom + 2);
		},
		get sprite() {
			const sprite = vdp.sprite('mario');
			if (!this.grounded) {
				return sprite.tile(4); // jumping pose
			}
			if (this.horizontalVelocity === 0) {
				return sprite.tile(6); // standing pose
			}
			return sprite.tile(Math.floor(this.animation * 0.1) % 3); // 0-2: walking
		}
	};
	const camera = {
		left: 0,
		top: 0,
		centerAroundMario() {
			this.left = Math.max(this.left, mario.left - 100);
		},
	};

	vdp.configBackdropColor('#59f');

	while (true) {
		camera.centerAroundMario();
		vdp.drawBackgroundTilemap('level1', { scrollX: camera.left, scrollY: camera.top });
		vdp.drawObject(mario.sprite, mario.left - camera.left, mario.top - camera.top, {
			flipH: mario.facingLeft
		});

		mario.animation += 1;
		mario.verticalVelocity += 0.1;

		mario.top += mario.verticalVelocity;
		while (collidesAtPosition(mario.left, mario.bottom) || collidesAtPosition(mario.right, mario.bottom)) {
			mario.verticalVelocity = 0;
			mario.top -= 1;
		}
		while (collidesAtPosition(mario.left, mario.top) || collidesAtPosition(mario.right, mario.top)) {
			mario.verticalVelocity = 0;
			mario.top += 1;
		}

		mario.left += mario.horizontalVelocity;
		while (collidesAtPosition(mario.left, mario.top) || collidesAtPosition(mario.left, mario.bottom)) {
			mario.horizontalVelocity = 0;
			mario.left += 1;
		}
		while (collidesAtPosition(mario.right, mario.top) || collidesAtPosition(mario.right, mario.bottom)) {
			mario.horizontalVelocity = 0;
			mario.left -= 1;
		}

		if (input.hasToggledDown(input.Key.Up) && mario.grounded) {
			mario.verticalVelocity = -3.8;
		}

		if (input.isDown(input.Key.Left)) {
			mario.horizontalVelocity = -1;
			mario.facingLeft = true;
		} else if (input.isDown(input.Key.Right)) {
			mario.horizontalVelocity = +1;
			mario.facingLeft = false;
		} else {
			mario.horizontalVelocity = 0;
		}

		// Mario cannot go left to the camera
		mario.left = Math.max(mario.left, camera.left);

		textLayer.drawText(0, 29, `x: ${mario.left.toFixed(2)}, y: ${mario.top.toFixed(2)}, vy: ${mario.verticalVelocity.toFixed(2)} `);
		textLayer.draw();
		yield;
	}
}

startGame('#glCanvas', vdp => main(vdp));
