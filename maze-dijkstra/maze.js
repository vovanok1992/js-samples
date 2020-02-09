function generateRandomInt(to = 10, from = 0) {
    return Math.floor(Math.random() * (to - from ) + from) // 0 .. 9
}

function generateRandomPoint(sizeX, sizeY) {
    return {
        x: generateRandomInt(sizeX),
        y: generateRandomInt(sizeY),
    }
}

function randomNeighbour(point, sizeX, sizeY, maze) {
    if (!point) {
        return undefined;
    }

    return [ 
        { x: point.x, y: point.y + 1 },
        { x: point.x, y: point.y - 1 },
        { x: point.x - 1, y: point.y },
        { x: point.x + 1, y: point.y },
    ]
    .filter(point => point.x >= 0 && point.y >= 0 && point.x < sizeX && point.y < sizeY && !maze[point.y][point.x].visited)
    .sort(() => Math.random() - 0.5)
    .pop();
}

function joinPoints(a, b) {
    if (a.x === b.x && a.y < b.y) {
        a.top = true;
        b.bottom = true;
    } else if (a.x === b.x && a.y > b.y) {
        a.bottom = true;
        b.top = true;
    } else if (a.y === b.y && a.x < b.x) {
        a.right = true;
        b.left = true;
    } else if (a.y === b.y && a.x > b.x) {
        a.left = true;
        b.right = true;
    }
}

function hasUnvisitedNeighbour(sizeX, sizeY, cell, maze) {
    return !!randomNeighbour(cell, sizeX, sizeY, maze)
}

function findNewStartingPoint(sizeX, sizeY, maze, stack) {
   while(stack.length > 0) {
      const cand = stack.pop(); 
      if (hasUnvisitedNeighbour(sizeX, sizeY, cand, maze)) return { ...maze[cand.y][cand.x], ...cand };
   }   
}

function genMaze(sizeX, sizeY) {
    
    if (sizeX <= 0 || sizeY <= 0) {
        throw new Error('Wrong size');
    }

    let start = {},
        finish = {},
        maze = Array.from({ length: sizeY }, () => Array.from({ length: sizeX }, () => ({})));

    while(start.x === finish.x && start.y === finish.y) {
        start = generateRandomPoint(sizeX, sizeY);
        finish = generateRandomPoint(sizeX, sizeY);
    }

 
    let currPoint;
    maze[start.y][start.x].visited = true;
    const stack = [ { ...start } ];

    while(stack.length > 0) {
        if (!currPoint) {
            currPoint = findNewStartingPoint(sizeX, sizeY, maze, stack);
            if (!currPoint) {
                break;
            }
        }
        cand = randomNeighbour(currPoint, sizeX, sizeY, maze)
        
        if (cand) {
            joinPoints(currPoint, cand);
            maze[currPoint.y][currPoint.x] = { ...currPoint, visited: true };
            maze[cand.y][cand.x] = { ...cand, visited: true };
            stack.push({ ...cand });
           
        } 
        currPoint = cand;  
    }    

    makeHoles(maze);
    
    const player = { x: start.x, y: start.y };

    return {
        player,
        start,
        finish,
        maze,
        sizeX,
        sizeY,
        visitedByPlayer: Array.from({ length: sizeY }, () => Array.from({ length: sizeX }, () => ({})))
    }
}

function keyboardController(cb) {
    document.addEventListener('keydown', e => {
        switch(e.key) {
            case 'ArrowUp': cb('bottom'); break;
            case 'ArrowDown': cb('top'); break;
            case 'ArrowLeft': cb('left'); break;
            case 'ArrowRight': cb('right'); break;
        }
    });


    let y;
    let x;

    document.addEventListener("touchstart", function(e) {
        y = e.touches[0].clientY;
        x = e.touches[0].clientX;

      }, false);
      
      document.addEventListener("touchend", function(e) {
        const y2 = e.changedTouches[0].clientY;
        const x2 = e.changedTouches[0].clientX;

        const deltaX = x - x2;
        const deltaY = y - y2;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX < 0) {
                cb('right');
            } else {
                cb('left');
            }
        } else {
            if (deltaY < 0) {
                cb('top');
            } else {
                cb('bottom');
            }
        }

      }, false);
}

function drawLine(context, fromX, fromY, toX, toY) {
    context.strokeStyle = "#C5C6C7";
    if (context) {
        context.lineWidth = 4
        // Reset the current path
        context.beginPath(); 
        // Staring point (10,45)
        context.moveTo(fromX,fromY);
        // End point (180,47)
        context.lineTo(toX,toY);
        // Make the line visible
        context.stroke();
   }
}

function getPoint(point, dir) {
    if (dir === 'left') return { ...point, x: point.x - 1 };
    if (dir === 'right') return { ...point, x: point.x + 1 };
    if (dir === 'bottom') return { ...point, y: point.y - 1 };
    if (dir === 'top') return { ...point, y: point.y + 1 };
}

function makeHoles(maze) {
    const holesNumber = Math.ceil(maze.length + maze[0].length / 20) ;
    for(let i = 0; i < holesNumber; i++) {
        const point = generateRandomPoint(maze[0].length, maze.length);

        const dir = ['bottom', 'top', 'left', 'right']
            .filter(d => !maze[point.y][point.x][d])
            .sort(() => Math.random() - 0.5)
            .pop();

        if(dir) {
            const p2 = getPoint(point, dir);

            if (maze[p2.y] && maze[p2.y][p2.x]) {
                joinPoints(point, p2);
                maze[point.y][point.x] = { ...maze[point.y][point.x], ...point };
                maze[p2.y][p2.x] = { ...maze[p2.y][p2.x], ...p2 }; 
            }
            
        }
    }
}

function render(element, canvas, model) {
    const context = canvas.getContext('2d');

    const width = element.offsetWidth - 2;
    const height = element.offsetHeight - 2;
    canvas.width = width;
    canvas.height = height;

    const { maze, start, finish, sizeX, sizeY, player, visitedByPlayer } = model;
    const deltaPxX = width / sizeX;
    const deltaPxY = height / sizeY;

    maze.forEach((row, y) => {
        row.forEach((cell, x) => {

            if (!cell.bottom) {
                drawLine(context, x * deltaPxX, y * deltaPxY, x * deltaPxX + deltaPxX, y * deltaPxY)
            }
            if (!cell.top) {
                drawLine(context, x * deltaPxX, y * deltaPxY + deltaPxY, x * deltaPxX + deltaPxX, y * deltaPxY + deltaPxY)
            }
            if (!cell.left) {
                drawLine(context, x * deltaPxX, y * deltaPxY, x * deltaPxX, y * deltaPxY + deltaPxY)
            }

            if (!cell.right) {
                drawLine(context, x * deltaPxX + deltaPxX, y * deltaPxY, x * deltaPxX + deltaPxX, y * deltaPxY + deltaPxY)
            }

            if(visitedByPlayer[y][x] === true) {
                context.fillStyle = "white";
                var circle = new Path2D();
                circle.arc(x * deltaPxX + deltaPxX / 2, y * deltaPxY + deltaPxY / 2, Math.min(deltaPxX, deltaPxY) / 15, 0, 2 * Math.PI);
                context.fill(circle);
            }

        })
    })

    if(model.sp) {
        model.sp.forEach(vertex => {
            const [x, y] = vertex.split(',');
            context.lineWidth = 1
            context.strokeStyle = "red"
            context.beginPath();
            context.arc(x * deltaPxX + deltaPxX / 2, y * deltaPxY + deltaPxY / 2, Math.min(deltaPxX, deltaPxY) / 10, 0, 2 * Math.PI);
            context.stroke();
        })
    }

    context.fillStyle = "#1F2833";
    context.fillRect(start.x * deltaPxX + 2, start.y * deltaPxY + 2, deltaPxX - 4, deltaPxY - 4)
    context.fillStyle = "#45A29E";
    context.fillRect(finish.x * deltaPxX + 2, finish.y * deltaPxY + 2, deltaPxX - 4, deltaPxY - 4);

    context.fillStyle = "#66FCF1";
    var circle = new Path2D();
    circle.arc(player.x * deltaPxX + deltaPxX / 2, player.y * deltaPxY + deltaPxY / 2, Math.min(deltaPxX, deltaPxY) / 3, 0, 2 * Math.PI);
    context.fill(circle);
}

function GameController(model) {
    this.model = model;
    this.onFinish = () => {};
    this.onChange = () => {};

    function tryMovePlayer(move) {
        const { player, maze } = this.model;
        if (maze[player.y][player.x][move] === true) {
            if (move === 'top') {
                player.y += 1;
            } else if (move === 'bottom') {
                player.y -= 1;
            } else if (move === 'left') {
                player.x -= 1;
            } else if (move === 'right') {
                player.x += 1;
            }

            this.model.visitedByPlayer[player.y][player.x] = true;
        }
    }

    keyboardController(move => {
        tryMovePlayer(move);
        this.onChange(model);
        if(this.model.finish.x === this.model.player.x && this.model.finish.y === this.model.player.y) {
            this.onFinish();
        }
    });

    return {
        setOnFinish : cb => this.onFinish = cb,
        setOnModelChange : cb => this.onChange = cb,
        reset: model => {
            this.model = model;
        }
    }
}

function getShortestPath(model) {
    const graph = new WeightedGraph();
    model.maze.forEach((row, y) => {
        row.forEach((cell, x) => {
            const key =`${x},${y}`;
            if (!graph.adjacencyList[key]) {
                 graph.addVertex(key);
            }

            if (cell.right) {
                const cand = `${x+1},${y}`;
                if (!graph.adjacencyList[cand]) {
                    graph.addVertex(cand);
                }
                graph.addEdge(key, cand, 1);
            }
            
            if (cell.left) {
                const cand = `${x-1},${y}`;
                if (!graph.adjacencyList[cand]) {
                    graph.addVertex(cand);
                }
                graph.addEdge(key, cand, 1);
            }

            if (cell.top) {
                const cand = `${x},${y+1}`;
                if (!graph.adjacencyList[cand]) {
                    graph.addVertex(cand);
                }
                graph.addEdge(key, cand, 1);
            }

            if (cell.bottom) {
                const cand = `${x},${y-1}`;
                if (!graph.adjacencyList[cand]) {
                    graph.addVertex(cand);
                }
                graph.addEdge(key, cand, 1);
            }
        })
    })

    const { start, finish } = this.model;
    return graph.dijkstra(`${start.x},${start.y}`, `${finish.x},${finish.y}`)
}


function start(element, restartDialog, restartBtn, sizeX = 5, sizeY = 5) {
    const canvas = document.createElement('canvas');
    this.model = genMaze(sizeX,sizeY);
    canvas.className = 'game'
    element.appendChild(canvas);

    let rerender = () => render(element, canvas, this.model)
    const gameController = new GameController(model);


    gameController.setOnFinish(() => {
        const sp = getShortestPath(this.model);
        this.model.sp = sp;
        rerender();        
        restartDialog.classList.remove('hide');
    });

    restartBtn.addEventListener('click', () => {
        restartDialog.classList.add('hide');
        sizeX = Math.floor(sizeX * 1.3);
        sizeY = Math.floor(sizeY * 1.3);
        this.model = genMaze(sizeX, sizeY);
        this.model.player.x = this.model.start.x;
        this.model.player.y = this.model.start.y;
        gameController.reset(model);
        rerender = () => render(element, canvas, this.model)
        rerender();
    })

    gameController.setOnModelChange(() => { 
        rerender() ;
    });

    rerender();   
    window.addEventListener("resize", rerender);
}

