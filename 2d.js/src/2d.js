'use strict';

function distance(x1, y1, x2, y2) {
	return x2 !== undefined ? Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) : Math.sqrt(Math.pow(x1, 2) + Math.pow(y1, 2));
}

class Shape {
	constructor() {
		this._axes = [];
	}

	moveUp(y) {
		this.move(y, 3 / 2 * Math.PI);
	}

	moveDown(y) {
		this.move(y, Math.PI / 2);
	}

	moveLeft(x) {
		this.move(x, -Math.PI);
	}

	moveRight(x) {
		this.move(x, 0);
	}

	collide(shape) {
		var axis = null;
		var mag = 999999;

		for (var i = 0; i < this._axes.length; i++) {
			var projection1 = this.project(this._axes[i]);
			var projection2 = shape.project(this._axes[i]);
			
			var overlap = projection1.overlap(projection2);
			
			if (overlap < 0) {
				return false;
			} else if (overlap < mag) {
				axis = this._axes[i];
				mag = overlap;
			}
		}

		for (var i = 0; i < shape.axes.length; i++) {
			var projection1 = this.project(shape.axes[i]);
			var projection2 = shape.project(shape.axes[i]);

			var overlap = projection1.overlap(projection2);

			if (overlap < 0) {
				return false;
			} else if (overlap < mag) {
				axis = shape.axes[i];
				mag = overlap;
			}
		}

		return new Vector(-mag * axis.vector.i, -mag * axis.vector.j);
	}
}

class Polygon extends Shape {
	constructor (vertices) {
		super();

		this._vertices = vertices;

		this._sides = function () {
			var sides = [];

			for (var i = 0; i < this._vertices.length; i++) {
				var vertex1 = this._vertices[i];
				var vertex2 = this._vertices[i + 1 < this._vertices.length ? i + 1 : 0];

				sides[i] = new Side(vertex1, vertex2);
			}

			return sides;
		}.bind(this)();

		this._axes = function () {
			var axes = [];

			this._sides.forEach(function (side) {
				axes.push(new Axis(side));
			});

			return axes;
		}.bind(this)();
	}

	move(d, dir) {
		this._vertices.forEach(function (vertex) {
			vertex.move(d, dir);
		});
	}

	rotate(x, y, dir) {
		this._vertices.forEach(function (vertex) {
			vertex.rotate(x, y, dir);
		});
	}

	project(axis) {
		var min = this._vertices[0].x * axis.vector.i + this._vertices[0].y * axis.vector.j;
		var max = min;

		for (var i = 1; i < this._vertices.length; i++) {
			var dist = this._vertices[i].x * axis.vector.i + this._vertices[i].y * axis.vector.j;

			min = dist < min ? dist : min;
			max = dist > max ? dist : max;
		}

		return new Projection(min, max);
	}

	draw(ctx) {
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(this._vertices[0].x, this._vertices[0].y);

		for (var i = 1; i < this._vertices.length; i++) {
			ctx.lineTo(this._vertices[i].x, this._vertices[i].y);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();
		ctx.restore();
	}

	get width() {
		var min = this._vertices[0].x;
		var max = min;

		for (var i = 0; i < this._vertices.length; i++) {
			min = this._vertices[i].x < min ? this._vertices[i].x : min;
			max = this._vertices[i].x > max ? this._vertices[i].x : max;
		}

		return max - min;
	}

	get height() {
		var min = this._vertices[0].y;
		var max = min;

		for (var i = 0; i < this._vertices.length; i++) {
			min = this._vertices[i].y < min ? this._vertices[i].y : min;
			max = this._vertices[i].y > max ? this._vertices[i].y : max;
		}

		return max - min;
	}

	get x() {
		var x = this._vertices[0].x;

		for (var i = 0; i < this._vertices.length; i++) {
			x = this._vertices[i].x < x ? this._vertices[i].x : x;
		}

		return x;
	}

	set x(x) {

		this._vertices.forEach(function (vertex) {
			vertex.x = x;
		});
	}

	get y() {
		var y = this._vertices[0].y;

		for (var i = 0; i < this._vertices.length; i++) {
			y = this._vertices[i].y < y ? this._vertices[i].y : y;
		}

		return y;
	}

	set y(y) {
		const dy = y - this._vertices[0].y;

		this._vertices.forEach(function (vertex) {
			vertex.y += dy;
		});
	}

	get axes() {
		return this._axes;
	}

	get vertices() {
		return this._vertices;
	}
}

class Circle extends Shape {
	constructor (x, y, r) {
		super();

		this._x = x;
		this._y = y;
		this._r = r;
	}

	move(d, dir) {
		this._x += d * Math.cos(dir);
		this._y += d * Math.sin(dir);
	}

	project(axis) {
		const min = this._x * axis.vector.i + this._y * axis.vector.j - this._r;
		const max = min + 2 * this._r;

		return new Projection(min, max);
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this._x, this._y, this._r, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}

	get x() {
		return this._x;
	}

	set x(x) {
		this._x = x;
	}

	get y() {
		return this._y;
	}

	set y(y) {
		this._y = y;
	}

	get r() {
		return this._r;
	}
}

class Vertex {
	constructor (x, y) {
		this._x = x;
		this._y = y;
	}

	move(d, dir) {
		this._x += d * Math.cos(dir);
		this._y += d * Math.sin(dir);
	}

	rotate(x, y, dir) {
		const d = distance(this._x, this._y, x, y);
		const ang = Math.atan2(this._y - y, this._x - x);

		this._x = x + d * Math.cos(ang + dir);
		this._y = y + d * Math.sin(ang + dir);
	}

	get x() {
		return this._x;
	}

	set x(x) {
		this._x = x;
	}

	get y() {
		return this._y;
	}

	set y(y) {
		this._y = y;
	}
}

class Side {
	constructor (vertex1, vertex2) {
		this._vertex1 = vertex1;
		this._vertex2 = vertex2;
	}

	get length() {
		return distance(this._vertex2.x - this._vertex1.x, this._vertex2.y - this._vertex1.y);
	}

	get vertex1() {
		return this._vertex1;
	}

	get vertex2() {
		return this._vertex2;
	}
}

class Axis {
	constructor (side) {
		this._side = side;
	}

	get vector() {
		return new Vector(this._side.vertex2.x - this._side.vertex1.x, this._side.vertex2.y - this._side.vertex1.y).invert().oppose().normalize();
	}
}

class Vector {
	constructor (i, j) {
		this._i = i;
		this._j = j;
	}

	invert() {
		var i = this._i;

		this._i = this._j;
		this._j = i;

		return this;
	}

	oppose() {
		this._j = -this._j;

		return this;
	}

	normalize() {
		this._i /= this.mag;
		this._j /= this.mag;

		return this;
	}

	get mag() {
		return distance(this._i, this._j);
	}

	get i() {
		return this._i;
	}

	get j() {
		return this._j;
	}
}

class Projection {
	constructor (min, max) {
		this._min = min;
		this._max = max;
	}

	isOverlapping(projection) {
		return this._min >= projection.min && this._min <= projection.max ||
			   this._max >= projection.min && this._max <= projection.max;
	}

	overlap(projection) {
		if (this.isOverlapping(projection)) {
			const overlap1 = this._max - projection.min;
			const overlap2 = projection.max - this._min;

			return overlap1 >= 0 ? overlap1 : overlap2 >= 0 ? overlap2 : -1;
		} else {
			return -1;
		}
	}

	get min() {
		return this._min;
	}

	get max() {
		return this._max;
	}
}

class Quadrilateral extends Polygon {
	constructor (x, y, width, height) {
		super(
			[
				new Vertex(x, y),
				new Vertex(x + width, y),
				new Vertex(x + width, y + height),
				new Vertex(x, y + height)
			]
		);
	}
}

class Square extends Quadrilateral {
	constructor (x, y, s) {
		super(x, y, s, s);
	}
}

class CircleP extends Polygon {
	constructor (x, y, r) {
		super(
			function () {
				var vertices = [];

				for (var i = 0; i < 2 * Math.PI; i += 0.1) {
					vertices.push(new Vertex(x + r * Math.cos(i), y - r * Math.sin(i)));
				}

				return vertices;
			}()
		);
	}
}
