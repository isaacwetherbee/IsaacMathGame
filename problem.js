class problem {
  // ======================
  // Static config / toggles
  // ======================
  static allowAdd = true;
  static allowSub = true;
  static allowMul = true;
  static allowDiv = true;
  static allowAlgebra = true;

  static BLINK_DURATION = 30;
  static BLINK_RATE = 5; 

  static setAllowAddition(v) { Problem.allowAdd = v; }
  static setAllowSubtraction(v) { Problem.allowSub = v; }
  static setAllowMultiplication(v) { Problem.allowMul = v; }
  static setAllowDivision(v) { Problem.allowDiv = v; }
  static setAllowAlgebra(v) { Problem.allowAlgebra = v; }

  static enableAll() {
    Problem.allowAdd = Problem.allowSub =
    Problem.allowMul = Problem.allowDiv =
    Problem.allowAlgebra = true;
  }

  static disableAll() {
    Problem.allowAdd = Problem.allowSub =
    Problem.allowMul = Problem.allowDiv =
    Problem.allowAlgebra = false;
  }

  // ======================
  // Constructor
  // ======================
  constructor(startX, startDigitIndex) {
    this.speed = 2;

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
  }

  // ======================
  // Select operation
  // ======================
  selectAndGenerate() {
    const ops = [];
    if (Problem.allowAdd) ops.push(1);
    if (Problem.allowSub) ops.push(2);
    if (Problem.allowMul) ops.push(3);
    if (Problem.allowDiv) ops.push(4);
    if (Problem.allowAlgebra) ops.push(5);

    if (ops.length === 0) ops.push(1);

    this.operation = ops[Math.floor(Math.random() * ops.length)];

    if (this.operation === 5) {
      this.generateAlgebra();
    } else {
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
        this.a = randInt(1, 12);
        this.b = randInt(1, 12);
        this.solution = this.a + this.b;
        break;
      case 2:
        this.a = randInt(1, 12);
        this.b = randInt(1, this.a);
        this.solution = this.a - this.b;
        break;
      case 3:
        this.a = randInt(1, 12);
        this.b = randInt(1, 12);
        this.solution = this.a * this.b;
        break;
      case 4:
        this.b = randInt(1, 12);
        this.solution = randInt(1, 12);
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

    const op = randInt(1, 4);
    const xVal = randInt(1, 12);
    const otherNum = randInt(1, 12);
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
      if (Math.floor(this.blinkFrames / Problem.BLINK_RATE) % 2 === 0) {
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
      w: this.width,
      h: this.height
    };
  }

  isOffScreen(screenHeight) {
    return this.y > screenHeight + 30;
  }

  setX(x) { this.x = x; }
}

