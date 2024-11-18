let r = 8
let Rfactor = 2
let m = 10 * r
let massFactor = 1
let n = 160
let speed = 4
let withParticle = true
let maxGridN = 500
let arena = {
  "x": 0,
  "y": 0,
  "width": 400,
  "height": 400
}
let objects = []
let trace = []
let mode = "play"
let PauseButton, CalcButton, TempButton, VisButton, ClearButton, slider
let canv = {
  "x": arena.x + arena.width + 15,
  "y": 0,
  "width": 400,
  "height": 400,
  "col": [0,0,255]
}
let paint = []
let visMode = 0
let graph = {
  "x": canv.x + canv.width + 15,
  "y": 0,
  "width": 400,
  "height": 400,
  "bValues": [],
  "dValues": []
}

function setup() {
  createCanvas(graph.x + graph.width, arena.height+30)
  background(255)
  canvBackground()
  for (i = 0; i < n; i++) {
    let object = new Molecule(findPos(r, objects))
    objects.push(object)
  }
  if (withParticle) {
    let object = new Molecule(findPos(Rfactor*r, objects))
    object.setupParticle(Rfactor*r, massFactor*m)
    objects.push(object)
  }
  PauseButton = createButton("Play/Pause");
  PauseButton.position(0, height + 25);
  PauseButton.mousePressed(changeMode);
  calcButton = createButton("Calculator On/Off");
  calcButton.position(300, height + 25);
  calcButton.mousePressed(changeCalc);
  TempButton = createButton("Change Temp.");
  TempButton.position(90, height + 25);
  TempButton.mousePressed(changeTemp);
  clearButton = createButton("Clear Drawing");
  clearButton.position(425, height + 25);
  clearButton.mousePressed(clearDraw);
  VisButton = createButton("Change Visz");
  VisButton.position(200, height + 25);
  VisButton.mousePressed(changeVisz);
  slider = createSlider(0, 500, 500 * (speed / 10 ));
  slider.position(5, height);
  slider.style('width', (arena.width-10).toString() + 'px');
}

function changeMode() {
  if (mode == "play") {
    mode = "pause"
  } else if (mode == "pause") {
    mode = "play"
  }
}

function changeCalc() {
  if (mode !== "calc") {
    mode = "calc"
  } else {
    mode = "pause"
    canvBackground()
    visualize(paint, canv.col)
    graph.bValues = []
    graph.dValues = []
    fill(255)
    noStroke()
    rect(graph.x, graph.y, graph.width, graph.height)
  }
  done = []
}

function changeTemp() {
  speed = round(10 * (slider.value() / slider.attribute("max")), 1)
  for (i = 0; i < objects.length; i++) {
    objects[i].v.setMag(speed)
  }
}

function clearDraw() {
  canvBackground()
  paint = []
  graph.dValues = []
}

function changeVisz() {
  if (visMode < 3) {
    visMode++
  } else {
    visMode = 0
  }
  /*
  Mode 0: with molecules, with trace
  Mode 1: without molecules, with trace
  Mode 2: just trace
  Mode 3: with molecules, without trace
  */
}

function canvBackground() {
  strokeWeight(1)
  stroke(0)
  fill(255)
  rect(canv.x, canv.y, canv.width, canv.height)
  noStroke()
  rect(canv.x+canv.width, canv.y, canv.width+10, canv.height)
}

function findPos(rad, otherObjects) {
  let NotFoundPos = true
    while (NotFoundPos) {
      var posX = random(r, arena.width - r)
      var posY = random(r, arena.height - r)
      NotFoundPos = false
      for (j = 0; j < objects.length; j++) {
        if (distSq(posX, posY, objects[j].p.x, objects[j].p.y) <= (rad+objects[j].r)**2) {
          NotFoundPos = true
        }
      }
    }
  return createVector(posX, posY)
}

function drawArena(updateTrace) {
  for (i = 0; i < objects.length - 1; i++) {
      if (mode == "play") {
        objects[i].update()
      }
      if (visMode !== 1 && visMode !== 2) {
        objects[i].display()
      }
    }
    if (mode == "play") {
        objects[i].update()
      }
    if (visMode !== 2) {
      objects[i].display()
    }
    if (updateTrace) {
      trace.push(objects[i].p.copy())
    }
    if (visMode !== 3) {
      visualize(trace)
    }
}

function draw() {
  noStroke()
  fill(255)
  rect(0, 0, canv.x, height)//background(255)
  rect(arena.width, arena.height, 15 + canv.width, 30)
  if (mode == "calc") {
    noFill()
  } else {
    fill(240)
  }
  stroke(0)
  strokeWeight(1)
  rect(1, 1, arena.width, arena.height)
  noStroke()
  if (mode == "play") {
    collisions()  
    drawArena(true)
    textSize(20)
    fill(0)
    noStroke()
    text("Temperature: " + speed.toString() + "   Change to: " + round(10 * (slider.value() / slider.attribute("max")), 1).toString(), 10, height-10)
  } else if (mode == "pause") {
    drawArena(false)
    textSize(20)
    fill(0)
    noStroke()
    text("Temperature: " + speed.toString() + "   Change to: " + round(10 * (slider.value() / slider.attribute("max")), 1).toString(), 10, height-10)
  } else if (mode == "calc") {
    visualize(trace)
    if (0 <= mouseX && mouseX <= arena.width && 0 <= mouseY && mouseY <= arena.height) {
      var gridN = gridN = round(100 * (constrain(mouseX, arena.width/100, arena.width) / arena.width))
      slider.value(gridN)
    } else {
      var gridN = round((slider.value()/slider.attribute("max"))*maxGridN)
    }
    gridN = constrain(gridN, 1, maxGridN)
    let boxesB = makeGrid(gridN, trace, arena)
    let newN = true
    for (i = 0; i < graph.bValues.length; i++) {
        if (graph.bValues[i].gridN == gridN) {
          newN = false
        }
      }
      if (newN) {
        graph.bValues.push({"gridN": gridN, "boxes": boxesB})
        graph.bValues.sort(function(a, b){return a.gridN - b.gridN})
      }
    let dimB = log(boxesB) / log(gridN)
    textSize(20)
    fill(0)
    noStroke()
    text(boxesB.toString() + " boxes, approx. dim.: " + round(dimB, 5).toString(), 10, height-10)
    if (paint.length>1) {
      canvBackground()
      visualize(paint, canv.col)
      let boxesD = makeGrid(gridN, paint, canv)
      let newN = true
      for (i = 0; i < graph.dValues.length; i++) {
        if (graph.dValues[i].gridN == gridN) {
          newN = false
        }
      }
      if (newN) {
        graph.dValues.push({"gridN": gridN, "boxes": boxesD})
        graph.dValues.sort(function(a, b){return a.gridN - b.gridN})
      }
      let dimD = log(boxesD) / log(gridN)
      textSize(20)
      fill(0)
      noStroke()
      text(boxesD.toString() + " boxes, approx. dim.: " + round(dimD, 5).toString(), canv.x+10, height-10)
    }
  }
  if (mouseIsPressed && mouseX >= canv.x && mouseX <= canv.x+canv.width && mouseY >= canv.y && mouseY <= canv.y+canv.height) {
    paint.push(createVector(mouseX, mouseY))
    graph.dValues = []
    i = paint.length - 1
    if (i>0) {
      strokeWeight(3)
      stroke(canv.col)
      line(paint[i-1].x, paint[i-1].y, paint[i].x, paint[i].y)
    }
  }
  if (graph.bValues.length >= 2) {
    fill(255)
    noStroke()
    rect(graph.x, graph.y, graph.width, graph.height + 30)
    noFill()
    strokeWeight(2)
    let maxY = graph.bValues[graph.bValues.length-1].boxes
    if (graph.dValues.length >= 2) {
      let maxY2 = graph.dValues[graph.dValues.length-1].boxes
      if (maxY2 > maxY) {
        maxY = maxY2
      }
      stroke(canv.col)
      plotLogGraph(graph.dValues, maxY)
    }
    stroke(50, 255, 50)
    plotLogGraph(graph.bValues, maxY)
    stroke(0)
    strokeWeight(1)
    line(graph.x, graph.y+graph.height, graph.x+graph.width, graph.y+graph.height)
    line(graph.x, graph.y+graph.height, graph.x, graph.y)
    textSize(15)
    fill(0)
    noStroke()
    text("ln(" + maxY + ")=" + round(log(maxY), 5).toString(), graph.x + 10, graph.y+20)
    text("ln(" + maxGridN + ")=" + round(log(maxGridN), 5).toString(), graph.x + graph.width - 115, graph.y + graph.height - 5)
    if (mouseX >= graph.x && mouseX <= graph.x+graph.width && mouseY >= graph.y && mouseY <= graph.y+graph.height) {
      let startI = map(mouseX-graph.width/4, graph.x, graph.x+graph.width, log(graph.bValues[0].gridN), log(maxGridN))
      let endI = map(mouseX+graph.width/4, graph.x, graph.x+graph.width, log(graph.bValues[0].gridN), log(maxGridN))
      startI = constrain(startI, log(graph.bValues[0].gridN), log(maxGridN))
      endI = constrain(endI, log(graph.bValues[0].gridN), log(maxGridN))
      let valuesD_x = []
      let valuesD_y = []
      let valuesB_x = []
      let valuesB_y = []
      let maxLogN = log(maxGridN)
      let maxLogY = log(maxY)
      for (i = 0; i < graph.bValues.length; i++) {
        if (startI <= log(graph.bValues[i].gridN) && log(graph.bValues[i].gridN) <= endI) {
          gx = map(log(graph.bValues[i].gridN), 0, maxLogN, graph.x, graph.x + graph.width)
          gy = map(log(graph.bValues[i].boxes), 0, maxLogY, graph.y + graph.height, graph.y)
          valuesB_x.push(gx)
          valuesB_y.push(gy)
        }
        if (i < graph.dValues.length && startI <= log(graph.dValues[i].gridN) && log(graph.dValues[i].gridN) <= endI) {
          gx = map(log(graph.dValues[i].gridN), 0, maxLogN, graph.x, graph.x + graph.width)
          gy = map(log(graph.dValues[i].boxes), 0, maxLogY, graph.y + graph.height, graph.y)
          valuesD_x.push(gx)
          valuesD_y.push(gy)
        }
      }
      if (valuesB_x.length >= 2) {
        let linReg = findLineByLeastSquares(valuesB_x, valuesB_y)
        stroke(0)
        strokeWeight(1)
        line(linReg.x1, linReg.y1, linReg.x2, linReg.y2)
        textSize(20)
        fill(50, 255, 50)
        noStroke()
        text("Dimension:" + round(-linReg.slope, 5).toString(), graph.x+10, height-10)
      }
      if (valuesD_x.length >= 2) {
        let linReg = findLineByLeastSquares(valuesD_x, valuesD_y)
        stroke(0)
        strokeWeight(1)
        line(linReg.x1, linReg.y1, linReg.x2, linReg.y2)
        textSize(20)
        fill(50, 50, 255)
        noStroke()
        text("Dimension:" + round(-linReg.slope, 5).toString(), graph.x+200, height-10)
      }
    }
  }
}

function makeGrid(gridn, path, plane) {
  let dy = plane.height / gridn
  let dx = plane.width / gridn
  let touchedBoxes = []  
  for (k = 0; k < path.length - 1; k++) {
    if (distSq(path[k].x, path[k].y, path[k+1].x, path[k+1].y) > dx**2) {
      let p0 = path[k].copy()
      let dp = path[k+1].copy().sub(path[k])
      let detailN = 3 * round(dp.mag()/dx)
      dp.mult(1/detailN)
      for (l = 0; l < detailN; l++) {
        let p = checkPoint(p0, dx, dy, gridn, touchedBoxes, plane)
        if (p !== false) {
          touchedBoxes.push(p)
        }
        p0.add(dp)
      }
    } else {
      let p = checkPoint(path[k], dx, dy, gridn, touchedBoxes, plane)
      if (p !== false) {
        touchedBoxes.push(p)
      }
    }
  }
  noStroke()
  if (dx > 2) {
    fill(255, 50, 50, 100)
  } else {
    fill(255, 0, 0)
  }
  for (m = 0; m < touchedBoxes.length; m++) {
    rect(plane.x + touchedBoxes[m].i*dx, plane.y + touchedBoxes[m].j*dy, dx, dy)
  }
  let boxes = touchedBoxes.length
  if (dx > 5) {
    strokeWeight(1)
    stroke(0)
    beginShape(LINES)
    for (i = 1; i < gridn; i++) {
      vertex(plane.x, plane.y + i*dy)
      vertex(plane.x + plane.width, plane.y + i*dy)
      vertex(plane.x + i*dx, plane.y)
      vertex(plane.x + i*dx, plane.y + plane.height)      
    }
    endShape()
  }
  return boxes
}

function checkPoint(pointToC, dx, dy, gridn, touchedBoxes, plane) {
  let coord = {"i": floor((pointToC.x-plane.x)/dx), "j": floor((pointToC.y-plane.y)/dy)}
  if (coord.i >= gridn) {
    coord.i = gridn-1
  }
  if (coord.j >= gridn) {
    coord.j = gridn-1
  }
  for (m = touchedBoxes.length-1; m>=0; m--) {
    if (touchedBoxes[m].i == coord.i && touchedBoxes[m].j == coord.j) {
       return false
    }
  }
  return coord
}

function visualize(array, col=[0,255,0]) {
  noFill()
  strokeWeight(3)
  stroke(col)
  beginShape()
  for (i = 0; i < array.length; i++) {
    vertex(array[i].x, array[i].y)
  }
  endShape()
}

function collisions() {
  for (i = 0; i < objects.length; i++) {
    var obj1 = objects[i]
    if (obj1.p.x <= obj1.r) {
      obj1.p.x = obj1.r
      obj1.v.x *= -1
    } else if (obj1.p.x >= arena.width - obj1.r) {
      obj1.p.x = arena.width - obj1.r
      obj1.v.x *= -1       
    }
    if (obj1.p.y <= obj1.r) {
      obj1.p.y = obj1.r
      obj1.v.y *= -1
    } else if (obj1.p.y >= arena.height - obj1.r) {
      obj1.p.y = arena.height - obj1.r
      obj1.v.y *= -1
    }
    for (j = i+1; j < objects.length; j++) {
      var obj2 = objects[j]
      if (distSq(obj1.p.x, obj1.p.y, obj2.p.x, obj2.p.y) <= (obj1.r + obj2.r)**2) {
        let dp = p5.Vector.sub(obj1.p, obj2.p)
        if (obj1.collided == 0 && obj2.collided == 0) {
          let dv = p5.Vector.sub(obj1.v, obj2.v)
          let scalar = (2 / (obj1.m + obj2.m)) * p5.Vector.dot(dv, dp)/(dp.x**2+dp.y**2)
          let v1 = p5.Vector.sub(obj1.v,p5.Vector.mult(dp, obj2.m * scalar))
          let v2 = p5.Vector.sub(obj2.v,p5.Vector.mult(dp, -obj1.m * scalar))
          obj1.v =v1
          obj1.collided = obj1.collidedPlus
          obj2.v = v2
          obj2.collided = obj2.collidedPlus  
        }
        ddp = dp.copy().setMag(obj1.r + obj2.r).sub(dp)
        obj1.p.add(p5.Vector.mult(ddp, obj2.m/(obj1.m + obj2.m)))
        obj2.p.sub(p5.Vector.mult(ddp, obj1.m/(obj1.m + obj2.m)))
      }
    }
  }
}

function plotLogGraph(values, maxY) {
  let maxLogN = log(maxGridN)
  let maxLogY = log(maxY)
  beginShape()
  for (i = 0; i < values.length; i++) {
    gx = map(log(values[i].gridN), 0, maxLogN, graph.x, graph.x + graph.width)
    gy = map(log(values[i].boxes), 0, maxLogY, graph.y + graph.height, graph.y)
    vertex(gx, gy)
  }
  endShape()
}

function distSq(x1, y1, x2, y2) {
  let dx = x2 - x1
  let dy = y2 - y1
  return dx*dx + dy*dy
}

function Molecule(pVector) {
  this.p = pVector//random(0, width), random(0, arena.height)
  this.v = createVector(random(-1,1), random(-1,1))
  this.v.setMag(speed)
  this.r = r
  this.m = m
  this.collided = 0
  this.collidedPlus = 1
  this.col = [0,0,0]
       
  this.update = function() {
    if (this.collided > 0) {
      this.collided--
    }
    this.p = this.p.add(this.v)
  }
  
  this.setupParticle = function(rad, mass) {
    this.r = rad
    this.m = mass
    this.collidedPlus = 8
    this.col = [0,255,0]
  }
  
  this.display = function() {
    fill(this.col)
    ellipse(this.p.x, this.p.y, 2*this.r, 2*this.r)
  }
}

function findLineByLeastSquares(values_x, values_y) {
  var sum_x = 0;
  var sum_y = 0;
  var sum_xy = 0;
  var sum_xx = 0;
  var count = 0;
  var x = 0;
  var y = 0;
  var values_length = values_x.length;

  if (values_length != values_y.length) {
    throw new Error('The parameters values_x and values_y need to have same size!');
  }
  
  if (values_length === 0) {
    return [ [], [] ];
  }

  //Calculate the sum for each of the parts necessary.

  for (var v = 0; v < values_length; v++) {
    x = values_x[v];
    y = values_y[v];
    sum_x += x;
    sum_y += y;
    sum_xx += x*x;
    sum_xy += x*y;
    count++;
  }

  //Calculate m and b for the formular:
  //  y = x * m + b

  var m = (count*sum_xy - sum_x*sum_y) / (count*sum_xx - sum_x*sum_x);
  var b = (sum_y/count) - (m*sum_x)/count;

  //We return the following:
  //  [slope, offset, point1x, point1y, point2x, point2y]
    
  x1 = values_x[0];
  y1 = x1 * m + b;
  x2 = values_x[values_length-1];
  y2 = x2 * m + b;
  return {"slope": m, "offset": b, "x1": x1, "y1": y1, "x2": x2, "y2": y2};
}
