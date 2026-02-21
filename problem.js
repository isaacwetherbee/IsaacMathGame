 class problem {
  
  // ======================
  // Static config / toggles
  // ======================
  static allowAdd = true;
  static allowSub = true;
  static allowMul = true;
  static allowDiv = true;
  static allowAlgebra = true;
  static allowAlgebraTwoStep = true;

  static BLINK_DURATION = 30;
  static BLINK_RATE = 5; 

  static setAllowAddition(v) { problem.allowAdd = v; }
  static setAllowSubtraction(v) { problem.allowSub = v; }
  static setAllowMultiplication(v) { problem.allowMul = v; }
  static setAllowDivision(v) { problem.allowDiv = v; }
  static setAllowAlgebra(v) { problem.allowAlgebra = v; }
  static setAllowAlgebraTwoStep(v) { problem.allowAlgebraTwoStep = v; }

  static enableAll() {
    problem.allowAdd = problem.allowSub =
    problem.allowMul = problem.allowDiv =
    problem.allowAlgebra = true;
    problem.allowAlgebraTwoStep = true;
  }

  static disableAll() {
    problem.allowAdd = problem.allowSub =
    problem.allowMul = problem.allowDiv =
    problem.allowAlgebra = false;
  }

  // ======================
  // Constructor
  // ======================
  constructor(startX, startDigitIndex) {
    

    this.isCorrect = false;
    this.blinkFrames = 0;

    this.selectAndGenerate();

    this.solutionStr = String(this.solution);
    this.currentAnswer = Array.from(this.solutionStr, () => "_");

    for (let i = 0; i < startDigitIndex && i < this.solutionStr.length; i++) {
      this.currentAnswer[i] = this.solutionStr[i];
    }

    this.x = startX;
    this.y = -30;

    this.width = 0;
    this.height = 0;
    if (this.isAlgebraTwoStep) {
      this.speed = 0.5;
    } else {
      this.speed = 2;
    }

  }

  // ======================
  // Select operation
  // ======================
  selectAndGenerate() {
    const ops = [];
    if (problem.allowAdd) ops.push(1);
    if (problem.allowSub) ops.push(2);
    if (problem.allowMul) ops.push(3);
    if (problem.allowDiv) ops.push(4);
    if (problem.allowAlgebra) ops.push(5);
    if (problem.allowAlgebraTwoStep) ops.push(6);

    if (ops.length === 0) ops.push(1);

    this.operation = ops[Math.floor(Math.random() * ops.length)];

    if (this.operation === 5) {
      this.generateAlgebra();
    } else if(this.operation === 6) {
      this.generateAlgebraTwoStep();
    }else{
      this.generateArithmetic();
    }
  }

  // ======================
  // Arithmetic
  // ======================
  generateArithmetic() {
    this.isAlgebra = false;

    switch (this.operation) {
      case 1:
        this.a = problem.randInt(1, 12);
        this.b = problem.randInt(1, 12);
        this.solution = this.a + this.b;
        break;
      case 2:
        this.a = problem.randInt(1, 12);
        this.b = problem.randInt(1, this.a);
        this.solution = this.a - this.b;
        break;
      case 3:
        this.a = problem.randInt(1, 12);
        this.b = problem.randInt(1, 12);
        this.solution = this.a * this.b;
        break;
      case 4:
        this.b = problem.randInt(1, 12);
        this.solution = problem.randInt(1, 12);
        this.a = this.b * this.solution;
        break;
    }

    this.problemText = `${this.a} ${this.getOpSymbol()} ${this.b}`;
  }

  // ======================
  // Algebra
  // ======================
  generateAlgebra() {
    this.isAlgebra = true;

    const op = problem.randInt(1, 4);
    const xVal = problem.randInt(1, 12);
    const otherNum = problem.randInt(1, 12);
    let result = 0;

    switch (op) {
      case 1:
        this.solution = xVal;
        this.problemText = `x + ${otherNum} = ${xVal + otherNum}, x`;
        break;
      case 2:
        this.solution = xVal;
        result = otherNum + xVal;
        this.problemText = `${result} - x = ${otherNum}, x`;
        break;
      case 3:
        this.solution = xVal;
        this.problemText = `x × ${otherNum} = ${xVal * otherNum}, x`;
        break;
      case 4:
        result = xVal * otherNum;
        this.solution = xVal;
        this.problemText = `${result} / x = ${otherNum}, x`;
        break;
    }

    this.solutionStr = String(this.solution);
    this.currentAnswer = Array.from(this.solutionStr, () => "_");
  }
  generateAlgebraTwoStep() {
    this.isAlgebraTwoStep = true;

    const op = problem.randInt(1, 4);
    const xVal = problem.randInt(1, 12);
    const otherNum1 = problem.randInt(1, 12);
    const otherNum2 = problem.randInt(1, 12);
    let result1 = 0;
    let result2 = 0;
    let LHS = "";
    let RHS = "";
    this.solution = xVal;

    switch (op) {
  case 1:
    result1 = xVal + otherNum1;
    LHS = `(x + ${otherNum1})`;
    break;

  case 2:
    result1 = otherNum1;
    LHS = `(${otherNum1+xVal} - x)`;
    break;

  case 3:
    result1 = xVal * otherNum1;
    LHS = `(x × ${otherNum1})`;
    break;

  case 4:
    result1 = otherNum1;
    LHS = `(${otherNum1*xVal} / x)`;
    break;
}


    const op2 = problem.randInt(1, 4);


    switch (op2) {
    case 1:
    result2 = result1 + otherNum2;
    this.problemText = `${LHS} + ${otherNum2} = ${result2}, x`;
    break;

    case 2:
    result2 = result1 - otherNum2;
    this.problemText = `${LHS} - ${otherNum2} = ${result2}, x`;
    break;

    case 3:
    result2 = result1 * otherNum2;
    this.problemText = `${LHS} × ${otherNum2} = ${result2}, x`;
    break;

    case 4:
    result2 = result1 / otherNum2;
    this.problemText = `${LHS} / ${otherNum2} = ${result1} / ${otherNum2}, x`;
    break;
  }


  } 
  // ======================
  // Update
  // ======================
  update(dt) {
    this.y += this.speed * dt * 60;

    if (this.isCorrect) {
      this.blinkFrames++;
    }
  }

  // ======================
  // Input logic
  // ======================
  acceptDigitAnywhere(digit) {
    const incoming = String(digit);

    for (let i = 0; i < this.solutionStr.length; i++) {
      if (this.currentAnswer[i] === "_" && this.solutionStr[i] === incoming) {
        this.currentAnswer[i] = incoming;
        return true;
      }
    }
    return false;
  }

  isSolved() {
    return !this.currentAnswer.includes("_");
  }

  getDisplayAnswer() {
    return this.currentAnswer.join(" ");
  }

  // ======================
  // Drawing
  // ======================
  draw(ctx) {
    if (this.isCorrect) {
      if (Math.floor(this.blinkFrames / problem.BLINK_RATE) % 2 === 0) {
        return;
      }
    }

    ctx.font = "bold 18px Arial";
    ctx.fillStyle = "white";

    const answerText = this.getDisplayAnswer();

    const problemWidth = ctx.measureText(this.problemText).width;
    const equalsWidth = ctx.measureText(" = ").width;
    const answerWidth = ctx.measureText(answerText).width;

    this.width = problemWidth + equalsWidth + answerWidth;
    this.height = 18;

    ctx.fillText(this.problemText, this.x, this.y);
    ctx.fillText(" = ", this.x + problemWidth, this.y);
    ctx.fillText(answerText, this.x + problemWidth + equalsWidth, this.y);
  }

  // ======================
  // Utilities
  // ======================
  getOpSymbol() {
    switch (this.operation) {
      case 1: return "+";
      case 2: return "-";
      case 3: return "×";
      case 4: return "/";
      default: return "?";
    }
  }

  getBounds() {
  return {
    x: this.x,
    y: this.y - 18,
    width: this.width,
    height: this.height
  };
}


  isOffScreen(screenHeight) {
    return this.y > screenHeight + 30;
  }

  setX(x) { this.x = x; }
  
  static randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

}

