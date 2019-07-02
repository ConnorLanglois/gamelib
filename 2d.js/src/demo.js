var width = 500;
var height = 500;

var canvas = createCanvas(width, height);
var ctx = canvas.getContext('2d');

var circle = new CircleP(10, 10, 50);
var square2 = new Square(100, 100, 50);

function onTick() {
	onUpdate();
	onRender();
}

function onKeypress(e) {
	switch (e.keyCode) {
		case 119:
			circle.moveUp(1);

			break;

		case 115:
			circle.moveDown(1);

			break;

		case 97:
			circle.moveLeft(1);

			break;

		case 100:
			circle.moveRight(1);

			break;
	}
}

function onUpdate() {
	var mtv = circle.collide(square2);

	console.log(mtv.i, mtv.j);
}

function onRender() {
	ctx.clearRect(0, 0, width, height);

	ctx.save();

	circle.draw(ctx);
	square2.draw(ctx);

	ctx.fillStyle = '#FFFFFF';

	// new Square(circle.x + circle.width / 2 - 5, circle.y + circle.height / 2 - 5, 10, 10).draw(ctx);

	ctx.restore();
}

canvas.addEventListener('keypress', onKeypress);

setInterval(onTick, 1000 / 60);
