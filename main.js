window.requestAnimFrame = function () {
    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60); // Fallback to 60 FPS
        }
    );
}();

function init(elemid) {
    let canvas = document.getElementById(elemid),
        c = canvas.getContext("2d"),
        w = (canvas.width = window.innerWidth),
        h = (canvas.height = window.innerHeight);
    
    c.fillStyle = "rgba(30,30,30,1.0)";
    c.fillRect(0, 0, w, h);

    return { c: c, canvas: canvas };
}

window.onload = function () {
    let { c, canvas } = init("canvas"),
        w = (canvas.width = window.innerWidth),
        h = (canvas.height = window.innerHeight),
        mouse = { x: false, y: false },
        last_mouse = {},
        maxl = 400, // Maximum length of a tentacle
        minl = 150,  // Minimum length of a tentacle
        n = 30,     // Number of segments in each tentacle
        numt = 150,  // Number of tentacles
        tent = [],  // Array to store tentacles
        clicked = false,
        target = { x: w / 2, y: h / 2 },
        last_target = { x: w / 2, y: h / 2 },
        t = 0;

    class Segment {
        constructor(parent, l, a, first) {
            this.first = first;
            this.l = l; // Length of the segment
            this.ang = a; // Angle of the segment
            if (first) {
                this.pos = { x: parent.x, y: parent.y };
            } else {
                this.pos = { x: parent.nextPos.x, y: parent.nextPos.y };
            }
            this.nextPos = {
                x: this.pos.x + this.l * Math.cos(this.ang),
                y: this.pos.y + this.l * Math.sin(this.ang)
            };
        }

        update(target) {
            this.ang = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);
            this.pos.x = target.x + this.l * Math.cos(this.ang - Math.PI);
            this.pos.y = target.y + this.l * Math.sin(this.ang - Math.PI);
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }

        fallback(target) {
            this.pos.x = target.x;
            this.pos.y = target.y;
            this.nextPos.x = this.pos.x + this.l * Math.cos(this.ang);
            this.nextPos.y = this.pos.y + this.l * Math.sin(this.ang);
        }

        show() {
            c.lineTo(this.nextPos.x, this.nextPos.y);
        }
    }

    class Tentacle {
        constructor(x, y, l, n, a) {
            this.x = x;
            this.y = y;
            this.l = l;
            this.n = n;
            this.rand = Math.random();
            this.segments = [new Segment(this, this.l / this.n, a, true)];
            for (let i = 1; i < this.n; i++) {
                this.segments.push(new Segment(this.segments[i - 1], this.l / this.n, 0, false));
            }
        }

        move(last_target, target) {
            this.angle = Math.atan2(target.y - this.y, target.x - this.x);
            this.dt = dist(last_target.x, last_target.y, target.x, target.y) + 5;
            this.t = {
                x: target.x - 0.8 * this.dt * Math.cos(this.angle),
                y: target.y - 0.8 * this.dt * Math.sin(this.angle)
            };

            this.segments[this.n - 1].update(this.t);
            for (let i = this.n - 2; i >= 0; i--) {
                this.segments[i].update(this.segments[i + 1].pos);
            }

            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                this.segments[0].fallback({ x: this.x, y: this.y });
                for (let i = 1; i < this.n; i++) {
                    this.segments[i].fallback(this.segments[i - 1].nextPos);
                }
            }
        }

        show(target) {
            if (dist(this.x, this.y, target.x, target.y) <= this.l) {
                c.globalCompositeOperation = "lighter";
                c.beginPath();
                c.lineTo(this.x, this.y);
                for (let i = 0; i < this.n; i++) {
                    this.segments[i].show();
                }
                c.strokeStyle = `hsl(${this.rand * 60 + 180},100%,${this.rand * 60 + 25}%)`;
                c.lineWidth = this.rand * 2;
                c.lineCap = "round";
                c.lineJoin = "round";
                c.stroke();
                c.globalCompositeOperation = "source-over";
            }
        }

        show2(target) {
            c.beginPath();
            c.arc(this.x, this.y, this.rand * 2, 0, 2 * Math.PI);
            c.fillStyle = dist(this.x, this.y, target.x, target.y) <= this.l ? "white" : "darkcyan";
            c.fill();
        }
    }

    for (let i = 0; i < numt; i++) {
        tent.push(new Tentacle(
            Math.random() * w,
            Math.random() * h,
            Math.random() * (maxl - minl) + minl,
            n,
            Math.random() * 2 * Math.PI
        ));
    }

    function dist(p1x, p1y, p2x, p2y) {
        return Math.sqrt(Math.pow(p2x - p1x, 2) + Math.pow(p2y - p1y, 2));
    }

    function draw() {
        target.x += (mouse.x - target.x) / 10 || 0;
        target.y += (mouse.y - target.y) / 10 || 0;

        t += 0.01;

        c.clearRect(0, 0, w, h);
        c.beginPath();
        c.arc(target.x, target.y, 5, 0, 2 * Math.PI);
        c.fillStyle = "hsl(210,100%,80%)";
        c.fill();

        for (let i = 0; i < numt; i++) {
            tent[i].move(last_target, target);
            tent[i].show2(target);
        }

        for (let i = 0; i < numt; i++) {
            tent[i].show(target);
        }

        last_target.x = target.x;
        last_target.y = target.y;
    }

    canvas.addEventListener("mousemove", function (e) {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("resize", function () {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });

    function loop() {
        draw();
        window.requestAnimFrame(loop);
    }

    loop();
};
