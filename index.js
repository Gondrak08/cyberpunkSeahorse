window.addEventListener('load',function(){
    // CANVAS SETUP
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 500;

    class InputHandler{ 
        constructor(game){
            this.game = game;
            window.addEventListener('keydown', (e) =>{
                if((e.key==='ArrowUp' || 
                    e.key === 'ArrowDown' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') && 
                    this.game.presskeys.indexOf(e.key) === -1){
                    this.game.presskeys.push(e.key);
                } else if(e.key === ' '){
                    this.game.player.shootTop();
                } else if(e.key === 'F2'){
                    this.game.debug = !this.game.debug;
                }
        
            });
            window.addEventListener('keyup', (e) => {
                if(this.game.presskeys.indexOf(e.key) > -1){
                    this.game.presskeys.splice(this.game.presskeys.indexOf(e.key), 1);
                }
           
            })
        }
    };

    class Projectile{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.width = 10;
            this.height = 3;
            this.speed = 3;
            this.toDelete = false;
            this.image = document.getElementById('projectile');
        }
        update(){
            this.x += this.speed;
            if(this.x > this.game.width * 0.9 ) this.toDelete = true;
        }
        draw(context){
            context.fillStyle = 'yellow'
            // context.fillRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image,this.x, this.y, )
        }
    };
    
    class Particle{
        constructor(game, x, y){
            this.game = game;
            this.x = x;
            this.y = y;
            this.image = document.getElementById('gears');
            this.frameX = Math.floor(Math.random() * 3);
            this.frameY = Math.floor(Math.random() * 3);
            this.spriteSize = 50;
            this.sizeModifier = (Math.random()* 0.5 + 0.5).toFixed(1);
            this.size = this.spriteSize * this.sizeModifier;
            this.speedX = Math.random() * 6 - 3;
            this.speedY = Math.random() * -15;
            this.gravity = 0.5;
            this.angle = 0;
            this.velocityOfAngle = Math.random() * 0.2 - 0.1;
            this.toDelete = false;
            // this.toBounce = false;
            this.bounce = 0;
            this.bottomBounceBoundary = Math.random() * 80 + 60;
        }
        update(){
            this.angle += this.velocityOfAngle;
            this.speedY += this.gravity;
            this.x -= this.speedX + this.game.speed;
            this.y += this.speedY;
            if(this.y > this.game.height + this.size || this.x < 0 - this.size) this.toDelete = true;
            if(this.y > this.game.height - this.bottomBounceBoundary && this.bounce < 2){
                this.bounce++;
                this.speedY *= -0.9;
            }
        }
        draw(context){
            context.save();
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.size * -0.5, this.size * -0.5, this.size, this.size);
            context.restore();
        }
    };

    class Explosion{
        constructor(game, x, y){
            this.game = game;
            this.frameX = 0;
            this.spriteWidth = 200;
            this.spriteHeight = 200;
            this.width = this.spriteWidth;
            this.height = this.spriteHeight;
            this.x = x - this.width * 0.5;
            this.y = y - this.height * 0.5;
            this.maxFrame = 8;
            this.fps = 30;
            this.timer = 0;
            this.interval = 1000/this.fps;
            this.toDelete = false;
        }
        update(deltatime){
            this.x -= this.game.speed;
            if(this.timer > this.interval){
                this.frameX++;
                this.timer = 0;
            } else this.timer += deltatime;
            if(this.frameX > this.maxFrame) this.toDelete = true;
        }
        draw(context){
            context.drawImage(this.image, this.frameX * this.spriteWidth,0, this.spriteWidth,this.spriteHeight, this.x, this.y, this.width, this.height);
        }
    }

    class SmokeExplosion extends Explosion{
        constructor(game, x, y){
            super(game,x,y);
            this.image = document.getElementById('smokeExplosion');
            // this.width = this.spriteWidth;
            // this.height = this.spriteHeight;
            // this.x = x - this.width * 0.5;
            // this.y = y - this.height * 0.5;
        }   
    };
    class FireExplosion extends Explosion{
        constructor(game,x,y){
            super(game,x,y);
            this.image = document.getElementById('fireExplosion');
        }   
    };
    // this.frameX = 0; cicle to the sprite sheets horizontaly;
    // this.frameY = 0; will determine the row of the sprite sheets vertically;
    // this.maxFrame = 37; the number of frames in the sprite sheet; 

    class Player{
        constructor(game){
            this.game = game;
            this.width = 120;
            this.height = 190;
            this.x = 20;
            this.y = 100;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedY = 0;
            this.speedX = 0;
            this.maxSpeed = 3;
            this.projectiles = [];
            this.image = document.getElementById("player");
            this.powerUp = false;
            this.powerUpTimer=0;
            this.powerUpLimit = 10000;
        }
        update(deltaTime){
            // PLAYER MOVMENT
            if(this.game.presskeys.includes('ArrowUp')) this.speedY = -this.maxSpeed;
            else if(this.game.presskeys.includes('ArrowDown')) this.speedY = this.maxSpeed;
            else this.speedY = 0;
            this.y += this.speedY;

            if(this.game.presskeys.includes('ArrowLeft')) this.speedX = -this.maxSpeed;
            else if(this.game.presskeys.includes('ArrowRight')) this.speedX = this.maxSpeed;
            else this.speedX = 0;
            this.x += this.speedX

            // PLAYER VERTICAL LIMITATION
            if(this.y > canvas.height - this.height ) this.y = canvas.height - this.height;
            if(this.y < -this.height * 0 ) this.y = -this.height * 0;
            // PLAYER HORIZONTAL LIMITATION
            if(this.x > canvas.width - this.width) this.x = canvas.width - this.width;
            if(this.x < -this.width * 0) this.x = -this.width * 0;
            // HANDLE PRJECTILES
            this.projectiles.forEach(projectile=>{
                projectile.update();
            });
            this.projectiles = this.projectiles.filter(projectile=> !projectile.toDelete);
            //SPRITE ANIMATION
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
            // POWER UP METHOD
            if(this.powerUp){
                if(this.powerUpTimer > this.powerUpLimit){
                    this.powerUpTimer = 0;
                    this.powerUp = false;
                    this.frameY = 0;
                }else{
                    this.powerUpTimer += deltaTime;
                    this.frameY = 1;
                    this.game.ammo += 0.2;
                }
            };
        }
        draw(context){
            // context.fillStyle = 'black';
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            // draw character and projectiles;
            this.projectiles.forEach(projectile=>{
                projectile.draw(context);
            });
            context.drawImage(this.image,this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            
        }
        shootTop(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x +80, this.y +30));
                this.game.ammo--;
            }
            if(this.powerUp) this.shootBottom();
        }
        shootBottom(){
            if(this.game.ammo > 0){
                this.projectiles.push(new Projectile(this.game, this.x +80, this.y +175));
                this.game.ammo--;
            }
        }
        enterPowerUp(){
            this.powerUpTimer = 0;
            this.powerUp = true;
            if(this.game.ammo < this.game.maxAmmo)this.game.ammo = this.game.maxAmmo;
        }
    };

    class Enemy{
        constructor(game){
            this.game = game;
            this.x = this.game.width;
            this.y = this.game.height;
            this.frameX = 0;
            this.frameY = 0;
            this.maxFrame = 37;
            this.speedX = Math.random() * -1.5 - 0.5;
            this.speedY = Math.random() * -1.5 - 0.5;
            this.toDelete = false;
            // this.lives = 5;
            // this.score = this.lives;
            this.toDelete = false;
        }
        update(){
            this.x += this.speedX - this.game.speed;
            // this.y -= this.speedY;
            // if(this.y + this.height < 0)
            //         this.y -= this.speedY
            // else(
            //     this.y += this.speedY
            // )
            if(this.x + this.width < 0 ) this.toDelete = true;
            if(this.frameX < this.maxFrame) this.frameX++;
            else this.frameX = 0;
        }
        draw(context){
            if(this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
            // context.fillStyle = 'black'
            if(this.game.debug){
                context.font = '25px Helvetica';
                context.fillText(this.lives, this.x, this.y);
            }
        }
    };

    class Angler1 extends Enemy{
        constructor(game){
            super(game);
            this.width = 228;
            this.height = 169;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.image = document.getElementById('angler1');
            this.frameY = Math.floor(Math.random() * 3);
            this.lives = 4;
            this.score = this.lives; 
            // this.frameY = Math.floor(Math.random() * 3); this will call one of the 3 sprites rows randomically
        }
    };

    class Angler2 extends Enemy{
        constructor(game){
            super(game);
            this.width = 213;
            this.height = 165;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.frameY = Math.floor(Math.random() * 2);
            this.image = document.getElementById('angler2');
            this.lives = 6;
            this.score = this.lives;
        }
    };

    class luckyFish extends Enemy{
        constructor(game){
            super(game);
            this.width = 99;
            this.height = 95;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.frameY = Math.floor(Math.random() * 2);
            this.image = document.getElementById('lucky');
            this.lives = 4;
            this.score = 15;
            this.type = 'lucky';
        }
    };

    class HiveWhale extends Enemy{
        constructor(game){
            super(game);
            this.width = 400;
            this.height = 270;
            this.y = Math.random() * (this.game.height * 0.95 - this.height);
            this.frameY = Math.floor(Math.random() * 2);
            this.image = document.getElementById('hivewhale');
            this.lives = 20;
            this.score = this.lives;
            this.type = 'hive';
            this.speedX = Math.random() * -1.2 - 0.2;
        }
    };

    class Drone extends Enemy{
        constructor(game, x, y){
            super(game);
            this.width = 115;
            this.height = 95;
            this.x=x
            this.y=y;
            this.image = document.getElementById('drone');
            this.frameY = Math.floor(Math.random() * 2);
            this.lives = 3;
            this.score = this.lives;
            this.type = 'drone';
            this.speedX = Math.random() * -4.2 - 0.5;
        }
    };

    class Layer{
        constructor(game, image, speedModifier){
            this.game = game;
            this.image = image;
            this.speedModifier = speedModifier;
            this.width = 1768;
            this.height = 500;
            this.x=0;
            this.y=0;
        }
        update(){
            if(this.x <= -this.width) this.x = 0;
            this.x -= this.game.speed * this.speedModifier;
        }
        draw(context){
            context.drawImage(this.image, this.x, this.y);
            context.drawImage(this.image, this.x + this.width, this.y);
        }
    };

    class Background{
        constructor(game){
            this.game = game;
            this.image1 = document.getElementById('layer1');
            this.image2 = document.getElementById('layer2');
            this.image3 = document.getElementById('layer3');
            this.image4 = document.getElementById('layer4');
            this.layer1 = new Layer(this.game, this.image1, 1);
            this.layer2 = new Layer(this.game, this.image2, 2);
            this.layer3 = new Layer(this.game, this.image3, 3);
            this.layer4 = new Layer(this.game, this.image4, 4);

            this.layers = [this.layer1, this.layer2, this.layer3];
        }
        update(){
            this.layers.forEach(layer=> layer.update());
            
        }
        draw(context){
            this.layers.forEach(layer => layer.draw(context))
        }
    };

    class UI{
        constructor(game){
            this.game = game;
            this.fontSize = 25;
            this.fontFamily = 'Bangers';
            this.color = 'white';
        }
        draw(context){
            context.save()
            context.fillStyle = this.color;
            context.shadowOffsetX = 2;
            context.shadowColor = 'black';
            // Score player display
            context.font = this.fontSize + 'px ' + this.fontFamily;
            context.fillText('Score: ' + this.game.score, 20,40);
            // Timmer display
            const formatTime = (this.game.gameTime * 0.001).toFixed(1);
            context.fillText('Timer: ' + formatTime, 20, 100);
            // Game Over display
            if(this.game.gameOver){
                let message1; 
                let message2;
                if(this.game.score > this.game.winningScore){
                    message1 = 'You Win!';
                    message2 = 'Well done explorer!'
                } else{
                    message1 = 'You lose!';
                    message2 = 'Try better next time!';
                }
                context.font = '80px ' + this.fontFamily;
                context.fillText(message1, this.game.width * 0.25, this.game.height * 0.5 - 40);
                context.font = '45px ' + this.fontFamily;
                context.fillText(message2, this.game.width * 0.25, this.game.height * 0.5 + 20);
            }
            // Ammo display
            if(this.game.player.powerUp) context.fillStyle="#ffffbd";
            for(let i = 0; i < this.game.ammo; i++){
                context.fillRect(20 + 5 * i, 50, 3, 20);
            };
            // 
            context.restore();
        }
    };

    class Game{
        constructor(width, height){
            this.width = width; 
            this.height = height;
            this.background = new Background(this);
            this.player = new Player(this);
            this.input = new InputHandler(this);
            this.ui = new UI(this);
            this.presskeys = [];
            // props
            this.particles = [];
            this.explosions = [];
            // Enemies values;
            this.enemies = [];
            this.enemyTimer = 0;
            this.enemyInterval = 2000;
            // player ammo;
            this.ammo = 10;
            this.maxAmmo = 20;
            this.ammoTimer = 0;
            this.ammoInterval = 350;
            // game score and time limit;
            this.score = 0;
            this.winningScore = 100;
            this.gameTime = 0;
            this.timeLimit = 30000;
            this.gameOver = false;
            // gameSpeed
            this.speed = 1;
            this.debug = false;
        }
        update(deltaTime){
            // GAME OVER BY TIME
            if(!this.gameOver) this.gameTime += deltaTime;
            if(this.gameTime > this.timeLimit) this.gameOver = true;
            // BACKGROUND
            this.background.update();
            this.background.layer4.update();
            this.player.update(deltaTime);
            if(this.ammoTimer > this.ammoInterval){
                if(this.ammo < this.maxAmmo) this.ammo++;
                else
                this.ammoTimer = 0;
            } else{
                this.ammoTimer += deltaTime;
            };
            // ENEMIES
            this.enemies.forEach(enemy => {
                enemy.update();
                // collision with player;
                if(this.checkCollision(this.player, enemy)){
                    enemy.toDelete = true;
                    this.addExplosion(enemy)
                    for(let i = 0; i < enemy.score ; i++) this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                    if(enemy.type=='lucky') this.player.enterPowerUp();
                    else if(!this.gameOver) this.score--;
                }
                this.player.projectiles.forEach(projectile=>{
                    if(this.checkCollision(projectile, enemy)){
                        enemy.lives--;
                        projectile.toDelete = true;
                        this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
                        if(enemy.lives <= 0){
                            enemy.toDelete = true;
                            this.addExplosion(enemy);
                            // to fall many particles use:
                            for (let i = 0; i < enemy.score; i++){
                                this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.54));
                            };
                            if(enemy.type === 'hive'){
                               for(let i = 0; i < 5; i++){
                                    this.enemies.push(new Drone(this, enemy.x + Math.random() * enemy.width, enemy.y + Math.random() * enemy.height * 0.5 ));
                               }
                            }
                            if(!this.gameOver) this.score += enemy.score
                            // if(this.score > this.winningScore) this.gameOver = true;
                        }
                    }
                })
            });
            this.enemies = this.enemies.filter(enemy=> !enemy.toDelete);
            if(this.enemyTimer > this.enemyInterval && !this.gameOver) {
                this.addEnemy();
                this.enemyTimer=0;
            } else {
                this.enemyTimer += deltaTime;
            };
            // PARTICLES
            this.particles.forEach(particle=> particle.update());
            this.particles = this.particles.filter(particle=> !particle.toDelete);
            // EXPLOSIONS
            this.explosions.forEach(explosion=> explosion.update(deltaTime));
            this.explosions = this.explosions.filter(explosion=> !explosion.toDelete);
        }
        draw(context){
            this.background.draw(context);
            this.player.draw(context);
            this.ui.draw(context);
            this.enemies.forEach(enemy => {enemy.draw(context)});
            this.particles.forEach(particle=> particle.draw(context));
            this.explosions.forEach(explosion=> explosion.draw(context));
            this.background.layer4.draw(context);
        }
        addEnemy(){
            const randomize = Math.random();
            if(randomize < 0.3) this.enemies.push(new Angler1(this));
            else if(randomize < 0.6) this.enemies.push(new Angler2(this));
            else if(randomize < 0.7) this.enemies.push(new HiveWhale(this));
            else this.enemies.push(new luckyFish(this));
            // this.enemies.push(new Angler1(this));
        }
        addExplosion(enemy){
            const randomize = Math.random();
            if(randomize < 0.5) this.explosions.push(new SmokeExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            else{
                this.explosions.push(new FireExplosion(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5));
            }
        }
        checkCollision(rect1,rect2){
            return(
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x && 
                rect1.y < rect2.y + rect2.height && 
                rect1.height + rect1.y > rect2.y
            )
        }
    };

    const game = new Game(canvas.width, canvas.height);
    let lastTime = 0;

    // ANIMATION LOOP
    function animate(timeStamp){
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        game.draw(ctx);
        game.update(deltaTime);
        requestAnimationFrame(animate);
    };
    animate(0);
})